const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// ─── Memory storage (buffer passed to Cloudinary) ─────────────────────────
const storage = multer.memoryStorage();

// ─── File filter: images only ─────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP, GIF) are allowed.', 400), false);
  }
};

// ─── Single image upload (avatar) ─────────────────────────────────────────
const uploadSingle = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

// ─── Multiple image upload (listing images, up to 10) ────────────────────
const uploadMultiple = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10,                   // Max 10 images
  },
}).array('images', 10);

// ─── Middleware wrappers that convert multer cb errors to AppError ─────────
const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Avatar image must be less than 5MB.', 400));
    }
    return next(new AppError(err.message, 400));
  });
};

const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Each image must be less than 10MB.', 400));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('You can upload a maximum of 10 images per listing.', 400));
    }
    return next(new AppError(err.message, 400));
  });
};

module.exports = { handleSingleUpload, handleMultipleUpload };
