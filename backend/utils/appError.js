/**
 * Custom operational error class.
 * Operational errors are expected errors (e.g., invalid input, not found).
 * They are safe to expose to the client.
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || this._getErrorCode(statusCode);
    this.isOperational = true; // Mark as operational error
    Error.captureStackTrace(this, this.constructor);
  }

  _getErrorCode(statusCode) {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codes[statusCode] || 'ERROR';
  }
}

module.exports = AppError;
