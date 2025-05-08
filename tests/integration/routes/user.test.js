const request = require('supertest');
const app = require('../../../src/app.js');
const User = require('../../../src/models/User.js');

const USER_ROUTE = '/api/v1/users';
const adminData = {
  name: 'admin',
  username: 'admin',
  email: 'admin@foo.mail',
  password: 'admin123',
  role: 'admin',
};
const testUserData = {
  name: 'John Doe',
  username: 'johnytest',
  email: 'test@johny.mail',
  password: 'passcode123',
  role: 'user',
};

let admin;
let testUser;
let adminToken;

beforeAll(async () => {
  admin = await User.create(adminData);

  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: adminData.email,
    password: adminData.password,
  });

  adminToken = loginRes.body.token;
});

beforeEach(async () => {
  testUser = await User.create(testUserData);
});

describe('Auth controller - getUser', () => {
  test('Should return user by ID', async () => {
    const res = await request(app)
      .get(`${USER_ROUTE}/${testUser._id}`)
      .set('Cookie', [`token=${adminToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.username).toMatch(testUserData.username);
    expect(res.body.data.email).toMatch(testUserData.email);
    expect(res.body.data.name).toMatch(testUserData.name);
    expect(res.body.data.password).not.toBeDefined();
  });

  test('should return 404 on invalid user', async () => {
    const res = await request(app)
      .get(`${USER_ROUTE}/6811f27043aef46a659dffd5`)
      .set('Cookie', [`token=${adminToken}`]);

    console.log(`Logged in user role: ${admin.role}`);
    console.log(`Failed fetch response: ${JSON.stringify(res.body)}`);

    expect(res.statusCode).toBe(404);
  });
});
