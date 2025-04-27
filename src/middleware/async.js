/**
 * A middleware wrapper to handle asynchronous route handlers and middleware.
 * It ensures that any errors thrown in the asynchronous function are passed
 * to the next middleware (typically an error handler).
 *
 * @param {Function} fn - The asynchronous function to be wrapped. It should
 *                        have the signature (req, res, next).
 * @returns {Function} A middleware function that executes the provided
 *                     asynchronous function and catches any errors.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
