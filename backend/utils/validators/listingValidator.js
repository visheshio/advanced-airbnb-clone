const { body } = require('express-validator');

const PROPERTY_TYPES = ['house', 'apartment', 'villa', 'cabin', 'treehouse', 'boat', 'studio', 'cottage'];
const CATEGORIES = ['beach', 'mountain', 'city', 'countryside', 'cabin', 'tropical', 'lake', 'desert', 'arctic', 'camping', 'island', 'luxury'];
const AMENITIES = [
  'wifi', 'pool', 'kitchen', 'ac', 'parking', 'tv', 'washer', 'dryer',
  'heating', 'gym', 'hotTub', 'bbq', 'fireplace', 'balcony', 'garden',
  'breakfast', 'workspace', 'elevator', 'petsAllowed', 'smokingAllowed',
  'beachfront', 'waterfront', 'skiInOut', 'oceanView', 'mountainView',
  'cityView', 'lakeView', 'securityCamera', 'smokeAlarm', 'firstAidKit',
];

const createListingValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),

  body('propertyType')
    .notEmpty().withMessage('Property type is required')
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}`),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),

  body('location.coordinates.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) throw new Error('Coordinates must be [longitude, latitude]');
      if (value[0] < -180 || value[0] > 180) throw new Error('Longitude must be between -180 and 180');
      if (value[1] < -90 || value[1] > 90) throw new Error('Latitude must be between -90 and 90');
      return true;
    }),

  body('pricePerNight')
    .notEmpty().withMessage('Price per night is required')
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => {
      if (parseFloat(value) < 100) throw new Error('Minimum price is ₹100 per night');
      return true;
    }),

  body('maxGuests')
    .notEmpty().withMessage('Max guests is required')
    .isInt({ min: 1, max: 50 }).withMessage('Max guests must be between 1 and 50'),

  body('bedrooms')
    .notEmpty().withMessage('Number of bedrooms is required')
    .isInt({ min: 0 }).withMessage('Bedrooms must be 0 or more'),

  body('beds')
    .notEmpty().withMessage('Number of beds is required')
    .isInt({ min: 1 }).withMessage('Must have at least 1 bed'),

  body('bathrooms')
    .notEmpty().withMessage('Number of bathrooms is required')
    .isFloat({ min: 0.5 }).withMessage('Must have at least 0.5 bathrooms'),

  body('amenities')
    .optional()
    .isArray().withMessage('Amenities must be an array')
    .custom((values) => {
      if (values && values.some((a) => !AMENITIES.includes(a))) {
        throw new Error(`Invalid amenity. Allowed: ${AMENITIES.join(', ')}`);
      }
      return true;
    }),

  body('cleaningFee')
    .optional()
    .isNumeric().withMessage('Cleaning fee must be a number')
    .isFloat({ min: 0 }).withMessage('Cleaning fee cannot be negative'),

  body('minNights')
    .optional()
    .isInt({ min: 1 }).withMessage('Minimum nights must be at least 1'),

  body('maxNights')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Maximum nights must be between 1 and 365'),
];

const updateListingValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),

  body('propertyType')
    .optional()
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}`),

  body('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('pricePerNight')
    .optional()
    .isNumeric().withMessage('Price must be a number')
    .custom((value) => {
      if (parseFloat(value) < 100) throw new Error('Minimum price is ₹100 per night');
      return true;
    }),

  body('maxGuests')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Max guests must be between 1 and 50'),
];

module.exports = { createListingValidator, updateListingValidator };
