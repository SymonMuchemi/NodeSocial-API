const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    ...req.body,
  });

  // TODO: implement email feature with AWS Lamda

  const message = `Hello ${user.name},

  Thank you for registering at DevCamper. Your account has been successfully created.

  Best regards,
  The DevCamper Team`;

  console.log('Registering user....');

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
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

// @desc    reset user pasword
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorResponse('Invalid token', 400));

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
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
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expire: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
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
