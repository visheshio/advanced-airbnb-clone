const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains.
 * If there are errors, responds with 400 and the first error message.
 * If clean, calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      error: 'VALIDATION_ERROR',
      statusCode: 400,
      details: errors.array(),
    });
  }
  next();
};

module.exports = validate;
