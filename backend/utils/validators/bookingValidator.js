const { body, query } = require('express-validator');

const createBookingValidator = [
  body('listingId')
    .notEmpty().withMessage('Listing ID is required')
    .isMongoId().withMessage('Invalid listing ID'),

  body('checkIn')
    .notEmpty().withMessage('Check-in date is required')
    .isISO8601().withMessage('Check-in must be a valid date (ISO 8601)')
    .custom((value) => {
      const checkIn = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkIn < today) {
        throw new Error('Check-in date cannot be in the past');
      }
      return true;
    }),

  body('checkOut')
    .notEmpty().withMessage('Check-out date is required')
    .isISO8601().withMessage('Check-out must be a valid date (ISO 8601)')
    .custom((value, { req }) => {
      const checkOut = new Date(value);
      const checkIn = new Date(req.body.checkIn);
      if (checkOut <= checkIn) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),

  body('adults')
    .notEmpty().withMessage('Number of adults is required')
    .isInt({ min: 1 }).withMessage('At least 1 adult is required'),

  body('children')
    .optional()
    .isInt({ min: 0 }).withMessage('Children count cannot be negative'),

  body('infants')
    .optional()
    .isInt({ min: 0 }).withMessage('Infants count cannot be negative'),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters'),
];

const checkAvailabilityValidator = [
  query('listingId')
    .notEmpty().withMessage('Listing ID is required')
    .isMongoId().withMessage('Invalid listing ID'),

  query('checkIn')
    .notEmpty().withMessage('Check-in date is required')
    .isISO8601().withMessage('Check-in must be a valid date'),

  query('checkOut')
    .notEmpty().withMessage('Check-out date is required')
    .isISO8601().withMessage('Check-out must be a valid date'),
];

module.exports = { createBookingValidator, checkAvailabilityValidator };
