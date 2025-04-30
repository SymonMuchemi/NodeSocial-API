// a mock cache to simulate the caching behavior
let cachedSecrets = {
  REDIS_USERNAME: 'testuser',
  REDIS_PASSWORD: 'testpass',
  REDIS_HOST: 'localhost',
  PORT: '6379',
  DB_CONNECTION: 'mongodb://localhost:27017/test',
  JWT_SECRET: 'test-jwt-secret',
  EMAIL_USER: 'test@example.com',
  EMAIL_PASSWORD: 'test-email-password',
};

/**
 * Mock implementation of getSecret that mimics the real function's behavior
 * but returns predetermined test values instead of calling AWS.
 */
exports.getSecret = jest.fn().mockImplementation(async (key) => {
  // Return from mock cache if it exists
  if (
    cachedSecrets &&
    Object.prototype.hasOwnProperty.call(cachedSecrets, key)
  ) {
    return cachedSecrets[key];
  }

  // If key doesn't exist in our mock cache, throw a similar error to the real function
  throw new Error(`Key "${key}" not present in secrets`);
});

/**
 * Helper function for tests to clear the mock cache
 */
exports.clearCache = jest.fn().mockImplementation(() => {
  cachedSecrets = null;
});

/**
 * Helper function for tests to populate or update the mock cache
 */
exports.setMockSecrets = jest.fn().mockImplementation((mockData) => {
  cachedSecrets = mockData;
});

/**
 * Helper function for tests to add a single secret to the mock cache
 */
exports.addMockSecret = jest.fn().mockImplementation((key, value) => {
  if (!cachedSecrets) {
    cachedSecrets = {};
  }
  cachedSecrets[key] = value;
});
