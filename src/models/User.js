const { Schema, model } = require('mongoose');

const UserSchema = Schema(
  {
    username: {
      type: String,
      unique: true,
      required: [true, 'Please add a username'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please add an email'],
      math: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bio: String,
    profileImage: String,
    coverImage: String,
    website: String,
  },
  {
    timestamps: true,
  }
);

// encrypt password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);

  // set password to hashed value
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// sign JWT token and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// match user entered password to the hashed passwrod in the database
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate and hash token
UserSchema.methods.getPasswordResetToken = function () {
  // generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hash token and set to resetpasswordtoken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set expiry to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = model('User', UserSchema);
