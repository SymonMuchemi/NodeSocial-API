const request = require('supertest');
const app = require('../../../src/index.js');

describe('GET /', () => {
  it('should respond with a welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from Nodesocial API' });
  });
});
