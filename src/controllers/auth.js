const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const crypto = require('crypto');
const { getSecret } = require('../utils/getSecrets');

// @desc    register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, name, password } = req.body;
  const user = await User.create({
    username,
    email,
    name,
    password,
  });

  // TODO: implement email feature with AWS Lamda

  await sendTokenResponse(user, 201, res);
});

// @desc    login a new user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide a valid email and password', 400)
    );
  }

  // check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  await sendTokenResponse(user, 200, res);
});

// @desc    get currect logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    get currect logged in user
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Invalid password', 400));
  }
  user.password = req.body.newPassword;

  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const detailsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, detailsToUpdate, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Forgot password
// @route   GET /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`No user found with email: ${req.body.email}`, 404)
    );
  }

  const resetToken = user.getPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `${resetUrl}`;

  try {
    // TODO: use AWS Lamda to send password reset email

    res.status(200).json({ success: true, data: 'Email queued' });
  } catch (error) {
    console.error(error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Error writing to mail stream`, 500));
  }
});

// generate token and set cookie
const sendTokenResponse = async (user, statusCode, res) => {
  const token = await user.getSignedJwtToken();
  const JWT_COOKIE_EXPIRE = await getSecret('JWT_COOKIE_EXPIRE');

  if (!JWT_COOKIE_EXPIRE) throw new Error('JWT cookie expiration undefined!');

  const options = {
    expire: new Date(Date.now + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
