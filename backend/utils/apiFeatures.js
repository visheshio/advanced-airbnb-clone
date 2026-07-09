/**
 * APIFeatures — chainable query builder for Mongoose
 *
 * Usage:
 *   const features = new APIFeatures(Listing.find(), req.query)
 *     .filter()
 *     .search()
 *     .sort()
 *     .paginate();
 *   const listings = await features.query;
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  /**
   * Filter by simple equality fields
   * Removes special query params (page, limit, sort, fields, search)
   * Supports gte, gt, lte, lt operators: ?price[gte]=100&price[lte]=500
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'search', 'lat', 'lng', 'radius'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Convert operator syntax: {price: {gte: 100}} → {price: {$gte: 100}}
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Full-text search on indexed fields
   * ?search=beach villa goa
   */
  search(fields = null) {
    if (this.queryString.search) {
      if (fields) {
        // Regex search on specific fields
        const regex = { $regex: this.queryString.search, $options: 'i' };
        const orConditions = fields.map((field) => ({ [field]: regex }));
        this.query = this.query.find({ $or: orConditions });
      } else {
        // MongoDB text index search
        this.query = this.query.find({
          $text: { $search: this.queryString.search },
        });
      }
    }
    return this;
  }

  /**
   * Sort results
   * ?sort=price → ascending
   * ?sort=-price → descending
   * ?sort=-avgRating,price → multiple fields
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default: newest first
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Select specific fields
   * ?fields=title,price,location
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Paginate results
   * ?page=2&limit=10
   */
  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 12, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }

  /**
   * Add geospatial filter — find listings within a radius
   * ?lat=28.6139&lng=77.2090&radius=50 (km)
   */
  geoNear() {
    const { lat, lng, radius } = this.queryString;

    if (lat && lng && radius) {
      const radiusInRadians = parseFloat(radius) / 6378.1; // km → radians

      this.query = this.query.find({
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInRadians],
          },
        },
      });
    }
    return this;
  }

  /**
   * Build pagination metadata
   */
  async getPaginationData(Model, filterQuery = {}) {
    const total = await Model.countDocuments(filterQuery);
    const page = this._page || 1;
    const limit = this._limit || 12;

    return {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }
}

module.exports = APIFeatures;
