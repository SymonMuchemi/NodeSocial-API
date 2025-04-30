const mongoose = require('mongoose');
const User = require('../../../src/models/User.js');

const userData = {
  username: 'JohnDoe',
  name: 'John Doe',
  email: 'john.doe@foo.mail',
  password: '123456',
};

jest.mock('../../../src/utils/getSecrets.js', () => ({
  getSecret: jest.fn((key) => {
    const mockSecrets = {
      JWT_SECRET: 'test-jwt-secret',
      JWT_EXPIRATION: '1h',
    };
    return Promise.resolve(mockSecrets[key]);
  }),
}));

describe('User model', () => {
  test('should create a user and save successfully', async () => {
    const newUser = new User({ ...userData });
    const savedUser = await newUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe('JohnDoe');
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john.doe@foo.mail');
    expect(savedUser.password).not.toBe('123456'); // password should be encrypted
  });

  test('should not save without required fields', async () => {
    const newUser = new User({});

    let err;

    try {
      await newUser.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.username).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  test("should create user with default role set to 'user'", async () => {
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.role).toBe('user');
  });

  test('should not create user with role other than user or admin', async () => {
    const user = new User({ ...userData, role: 'tester' });

    let err;

    try {
      await user.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.role).toBeDefined();
  });
});

describe('User methods', () => {
  test('should generate valid signed JWT token', async () => {
    const user = new User(userData);
    const savedUser = await user.save();

    const signedToken = await savedUser.getSignedJwtToken();

    expect(signedToken).toBeDefined();
    expect(typeof signedToken).toBe('string');
    expect(signedToken.length).toBeGreaterThan(16);
  });

  test('should match correct passwords', async () => {
    const user = new User(userData);
    const savedUser = await user.save();

    const isMatch = await savedUser.matchPassword('123456');

    expect(isMatch).toBeDefined();
    expect(typeof isMatch).toBe('boolean');
    expect(isMatch).toBeTruthy();
  });

  test('should not match an incorrect password', async () => {
    const user = new User(userData);
    const savedUser = await user.save();

    const isMatch = await savedUser.matchPassword('this is incorrect!');

    expect(isMatch).toBeDefined();
    expect(isMatch).toBeFalsy();
  });

  test('should return valid reset password token', async () => {
    const user = new User(userData);
    const savedUser = await user.save();

    const resetToken = savedUser.getPasswordResetToken();

    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');
    expect(resetToken.length).toBeGreaterThan(16);
  });
});
