const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// ─── POST /api/listings ──────────────────────────────────────────────────────
exports.createListing = async (req, res, next) => {
  try {
    const {
      title, description, propertyType, category,
      location, maxGuests, totalRooms, bedrooms, beds, bathrooms,
      pricePerNight, cleaningFee, serviceFee,
      amenities, houseRules, availableFrom, availableTo,
      minNights, maxNights, instantBook,
    } = req.body;

    // Parse location (may come as JSON string)
    let parsedLocation = location;
    if (typeof location === 'string') parsedLocation = JSON.parse(location);

    // Validate coordinates
    if (!parsedLocation?.coordinates?.coordinates?.length === 2) {
      return next(new AppError('Valid GPS coordinates [longitude, latitude] are required.', 400));
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file, index) =>
        uploadToCloudinary(file.buffer, {
          folder: 'home-rental/listings',
          transformation: [{ width: 1200, height: 800, crop: 'fill' }],
        }).then((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
          caption: '',
          isPrimary: index === 0,
        }))
      );
      images = await Promise.all(uploadPromises);
    }

    const listing = await Listing.create({
      owner: req.user._id,
      title, description, propertyType, category,
      location: parsedLocation,
      maxGuests: parseInt(maxGuests),
      totalRooms: parseInt(totalRooms) || 1,
      bedrooms: parseInt(bedrooms),
      beds: parseInt(beds),
      bathrooms: parseFloat(bathrooms),
      pricePerNight: parseFloat(pricePerNight),
      cleaningFee: parseFloat(cleaningFee) || 0,
      serviceFee: parseFloat(serviceFee) || 0,
      amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities || [],
      houseRules: typeof houseRules === 'string' ? JSON.parse(houseRules) : houseRules || {},
      availableFrom, availableTo,
      minNights: parseInt(minNights) || 1,
      maxNights: parseInt(maxNights) || 365,
      instantBook: instantBook === 'true' || instantBook === true,
      images,
      status: 'draft',
    });

    await listing.populate('owner', 'name avatar isHost isSuperhost');

    res.status(201).json({
      success: true,
      message: 'Listing created successfully. Set it to active when you are ready.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/listings ───────────────────────────────────────────────────────
exports.getListings = async (req, res, next) => {
  try {
    const {
      category, propertyType, minPrice, maxPrice,
      guests, bedrooms, bathrooms, amenities,
      city, country, startDate, endDate,
      lat, lng, radius, search, sort,
      page = 1, limit = 12,
    } = req.query;

    // Build base filter
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (propertyType) filter.propertyType = propertyType;
    if (guests) filter.maxGuests = { $gte: parseInt(guests) };
    if (bedrooms) filter.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) filter.bathrooms = { $gte: parseFloat(bathrooms) };

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = parseInt(maxPrice);
    }

    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }

    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (country) filter['location.country'] = { $regex: country, $options: 'i' };

    // Geo search
    if (lat && lng && radius) {
      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            parseFloat(radius) / 6378.1,
          ],
        },
      };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Exclude booked listings for date range considering totalRooms capacity
    if (startDate && endDate) {
      const overlappingBookings = await Booking.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'pending'] },
            checkIn: { $lt: new Date(endDate) },
            checkOut: { $gt: new Date(startDate) }
          }
        },
        { $group: { _id: '$listing', count: { $sum: 1 } } }
      ]);

      const fullyBookedIds = [];
      const listingPromises = overlappingBookings.map(async (b) => {
        const lst = await Listing.findById(b._id).select('totalRooms');
        if (lst && b.count >= lst.totalRooms) {
          fullyBookedIds.push(b._id);
        }
      });
      await Promise.all(listingPromises);

      filter._id = { $nin: fullyBookedIds };
    }

    // Sort
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { pricePerNight: 1 };
    else if (sort === 'price_desc') sortObj = { pricePerNight: -1 };
    else if (sort === 'rating') sortObj = { avgRating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    // Pagination
    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('owner', 'name avatar isSuperhost')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Listings fetched successfully.',
      data: { listings },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/listings/featured ─────────────────────────────────────────────
exports.getFeaturedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'active', isFeatured: true })
      .populate('owner', 'name avatar isSuperhost')
      .sort({ avgRating: -1 })
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: { listings },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/listings/category/:category ──────────────────────────────────
exports.getListingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find({ status: 'active', category })
        .populate('owner', 'name avatar isSuperhost')
        .sort({ avgRating: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments({ status: 'active', category }),
    ]);

    res.status(200).json({
      success: true,
      data: { listings },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/listings/host/my-listings ────────────────────────────────────
exports.getMyListings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { listings },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/listings/:id ───────────────────────────────────────────────────
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('owner', 'name avatar bio isHost isSuperhost hostSince responseRate responseTime languages createdAt');

    if (!listing) {
      return next(new AppError('Listing not found.', 404));
    }

    // Increment view count
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Get upcoming booked dates (next 12 months)
    const bookedDates = await Booking.find({
      listing: listing._id,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: new Date() },
    }).select('checkIn checkOut -_id').lean();

    // Get latest 10 reviews
    const reviews = await Review.find({ listing: listing._id, isPublic: true })
      .populate('reviewer', 'name avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: { listing, bookedDates, reviews },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/listings/:id ───────────────────────────────────────────────────
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to update this listing.', 403));
    }

    const allowedUpdates = [
      'title', 'description', 'propertyType', 'category', 'location', 'totalRooms',
      'maxGuests', 'bedrooms', 'beds', 'bathrooms', 'pricePerNight',
      'cleaningFee', 'serviceFee', 'amenities', 'houseRules',
      'availableFrom', 'availableTo', 'minNights', 'maxNights',
      'instantBook', 'status', 'weeklyDiscount', 'monthlyDiscount',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save({ runValidators: true });
    await listing.populate('owner', 'name avatar isSuperhost');

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/listings/:id ────────────────────────────────────────────────
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Forbidden: Only the owner can delete this property.', 403));
    }

    // Check for upcoming bookings
    const upcomingBookings = await Booking.countDocuments({
      listing: listing._id,
      status: 'confirmed',
      checkIn: { $gte: new Date() },
    });

    if (upcomingBookings > 0) {
      return next(
        new AppError(
          `Cannot delete this listing. It has ${upcomingBookings} upcoming confirmed booking(s).`,
          400
        )
      );
    }

    // Delete all images from Cloudinary
    if (listing.images?.length > 0) {
      await Promise.allSettled(
        listing.images.map((img) => img.publicId && deleteFromCloudinary(img.publicId))
      );
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/listings/:id/images ──────────────────────────────────────────
exports.addListingImages = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized.', 403));
    }

    if (!req.files || req.files.length === 0) {
      return next(new AppError('Please upload at least one image.', 400));
    }

    if (listing.images.length + req.files.length > 10) {
      return next(new AppError(`You can have a maximum of 10 images. Currently have ${listing.images.length}.`, 400));
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: 'home-rental/listings',
        transformation: [{ width: 1200, height: 800, crop: 'fill' }],
      }).then((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        caption: '',
        isPrimary: false,
      }))
    );

    const newImages = await Promise.all(uploadPromises);
    listing.images.push(...newImages);
    await listing.save();

    res.status(200).json({
      success: true,
      message: `${newImages.length} image(s) added successfully.`,
      data: { images: listing.images },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/listings/:id/images/:imageId ────────────────────────────────
exports.deleteListingImage = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new AppError('Listing not found.', 404));
    if (listing.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized.', 403));
    }

    const image = listing.images.id(req.params.imageId);
    if (!image) return next(new AppError('Image not found.', 404));

    if (listing.images.length === 1) {
      return next(new AppError('Cannot delete the only image. Please add another image first.', 400));
    }

    // Delete from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    image.deleteOne();

    // Ensure at least one image is primary
    if (!listing.images.some((img) => img.isPrimary) && listing.images.length > 0) {
      listing.images[0].isPrimary = true;
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
      data: { images: listing.images },
    });
  } catch (error) {
    next(error);
  }
};
