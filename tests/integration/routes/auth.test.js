const request = require('supertest');
const app = require('../../../src/app.js');

const AUTH_ROUTE = '/api/v1/auth';
const REG_ROUTE = AUTH_ROUTE + '/register';
const LOGIN_ROUTE = AUTH_ROUTE + '/login';
const GET_ME_ROUTE = AUTH_ROUTE + '/me';
const LOGOUT_ROUTE = AUTH_ROUTE + '/logout';

const userData = {
  username: 'JohnDoe',
  name: 'John Doe',
  email: 'john.doe@foo.mail',
  password: '123456',
};

describe('Auth controller - register user', () => {
  test('should register a new user', async () => {
    const res = await request(app).post(REG_ROUTE).send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();

    const cookies = res.headers['set-cookie'];

    expect(cookies).toBeDefined();
    expect(cookies.some((cookie) => cookie.startsWith('token='))).toBeTruthy();
  });

  test('should not create a new user without proper values', async () => {
    const res = await request(app).post(REG_ROUTE).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error).toBeDefined();
    expect(res.body.error).toMatch(/Please add/);
  });
});

describe('Auth controller - user authentication', () => {
  test('should log user in successfully', async () => {
    // register user
    await request(app).post(REG_ROUTE).send(userData);

    const res = await request(app).post(LOGIN_ROUTE).send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.token).toBeDefined();

    const cookies = res.headers['set-cookie'];

    expect(cookies).toBeDefined();
    expect(cookies.some((cookie) => cookie.startsWith('token='))).toBeTruthy();
  });

  test('should not log in user with wrong password', async () => {
    const res = await request(app).post(LOGIN_ROUTE).send({
      email: userData.email,
      password: 'something totally wrong',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.token).not.toBeDefined();
  });

  test('should not log in user with wrong email', async () => {
    const res = await request(app).post(LOGIN_ROUTE).send({
      email: 'foo@gmail.com',
      password: userData.password,
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBeFalsy();
    expect(res.body.token).toBeUndefined();
    expect(res.body.error).toMatch(/Invalid credentials/);
  });

  test('should return the same error message when password or email is incorrect', async () => {
    const wrongPasswordRes = await request(app).post(LOGIN_ROUTE).send({
      email: userData.email,
      password: 'a wrong passcode',
    });

    const wrongEmailRes = await request(app).post(LOGIN_ROUTE).send({
      email: 'wrong@mail.foo',
      password: userData.password,
    });

    expect(wrongEmailRes.statusCode).toEqual(wrongPasswordRes.statusCode);
    expect(wrongEmailRes.body.success).toEqual(wrongPasswordRes.body.success);
    expect(wrongEmailRes.body.error).toEqual(wrongPasswordRes.body.error);
  });
});

describe('Auth controller - get logged in user', () => {
  test('should return logged in user details correctly', async () => {
    // register user to set req.user
    const registerRes = await request(app).post(REG_ROUTE).send(userData);

    // extract token from the response
    const token = registerRes.body.token;

    const res = await request(app)
      .get(GET_ME_ROUTE)
      .set('Cookie', [`token=${token}`]); // set the token in the cookie

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBeTruthy();

    const resData = res.body.data;

    expect(resData).toBeDefined();
    expect(resData.username).toEqual(userData.username);
    expect(resData.email).toEqual(userData.email);
  });

  test('should return error if user is not logged in', async () => {
    const res = await request(app).get(GET_ME_ROUTE);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.error).toMatch('Missing auth token');
  });
});

describe('Auth controller - logging out', () => {
  test('should clear token on logout', async () => {
    await request(app).post(REG_ROUTE).send(userData);

    const res = await request(app).post(LOGIN_ROUTE).send({
      email: userData.email,
      password: userData.password,
    });

    // confirm auth cookie is valid
    const cookiesBefore = res.headers['set-cookie'];

    expect(cookiesBefore).toBeDefined();
    expect(
      cookiesBefore.some((cookie) => cookie.startsWith('token='))
    ).toBeTruthy();

    const token = res.body.token;

    // logout user
    const logoutRes = await request(app)
      .get(GET_ME_ROUTE)
      .set('Cookie', [`token=${token}`]);

    // confirm token cookie is deleted
    const cookieAfter = logoutRes.headers['set-cookie'];

    expect(cookieAfter).not.toBeDefined();
  });
});
