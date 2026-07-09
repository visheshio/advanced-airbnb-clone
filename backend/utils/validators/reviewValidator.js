const { body } = require('express-validator');

const createReviewValidator = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID'),

  body('overallRating')
    .notEmpty().withMessage('Overall rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),

  body('ratings.cleanliness')
    .notEmpty().withMessage('Cleanliness rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Cleanliness rating must be between 1 and 5'),

  body('ratings.accuracy')
    .notEmpty().withMessage('Accuracy rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Accuracy rating must be between 1 and 5'),

  body('ratings.communication')
    .notEmpty().withMessage('Communication rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),

  body('ratings.location')
    .notEmpty().withMessage('Location rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Location rating must be between 1 and 5'),

  body('ratings.checkIn')
    .notEmpty().withMessage('Check-in rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Check-in rating must be between 1 and 5'),

  body('ratings.value')
    .notEmpty().withMessage('Value rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Value rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 20, max: 1000 }).withMessage('Review must be between 20 and 1000 characters'),
];

const respondToReviewValidator = [
  body('comment')
    .trim()
    .notEmpty().withMessage('Response comment is required')
    .isLength({ min: 10, max: 500 }).withMessage('Response must be between 10 and 500 characters'),
];

module.exports = { createReviewValidator, respondToReviewValidator };
