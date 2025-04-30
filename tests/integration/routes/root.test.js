const request = require('supertest');
const app = require('../../../src/app.js');
const { connectDB } = require('../../../src/config/db.js');
const { default: mongoose } = require('mongoose');

// beforeAll(async () => {
//   await connectDB();
// });

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Test the root path', () => {
  test('It should respond with a 200 status code', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
  });
});
