const mongoose = require('mongoose');
const User = require('../../../src/models/User.js');

describe('User model', () => {
  test('should create a user and save successfully', async () => {
    const userData = {
      username: 'JohnDoe',
      name: 'John Doe',
      email: 'john.doe@foo.mail',
      password: '123456',
    };

    const newUser = new User({ ...userData });
    const savedUser = await newUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe('JohnDoe');
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john.doe@foo.mail');
  });
});
