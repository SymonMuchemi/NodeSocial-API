/**
 * Custom error response class that extends the built-in Error object.
 * Used to standardize error messages and HTTP status codes.
 *
 * @class ErrorResponse
 * @extends {Error}
 * @param {string} message - The error message to be displayed.
 * @param {number} statusCode - The HTTP status code associated with the error.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
