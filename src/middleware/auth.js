const jwt = require('jsonwebtoken');

const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { getSecret } = require('../utils/getSecrets');

exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!req.cookies.token) {
    console.log('Missing auth cookie!');
    return next(new ErrorResponse('Missing auth token', 400));
  }

  if (!token) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  try {
    const JWT_SECRET = await getSecret('JWT_SECRET');
    // decode token
    const decoded = await jwt.verify(token, JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    console.log(error.message);
    return next(new ErrorResponse('Authentication error', 500));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse('Access forbidden', 403));
    }
    next();
  };
};
