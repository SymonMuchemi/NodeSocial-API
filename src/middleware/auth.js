const jwt = require('jsonwebtoken');

const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  try {
    // decode token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse('Unauthorized access', 403));
    }
    next();
  };
};
