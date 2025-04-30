// ✅ Apply mocks BEFORE importing the module under test
jest.mock('redis', () => require('../../mocks/redis'));
jest.mock('../../../src/utils/getSecrets.js', () =>
  require('../../mocks/getSecrets.mock')
);

const { RedisClient } = require('../../../src/utils/redisClient'); // Only import the class

describe('RedisClient', () => {
  let redisClient;

  beforeEach(async () => {
    jest.clearAllMocks();
    redisClient = new RedisClient();
    await redisClient.initialized; // Wait for async init
  });

  test('should initialize Redis client with secrets', () => {
    const { createClient } = require('redis');
    expect(createClient).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass',
      socket: {
        host: 'localhost',
        port: "13711",
      },
    });
  });

  test('should return true for isAlive', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  test('should get a key', async () => {
    const { createClient } = require('redis');
    const mockGet = createClient().get;
    mockGet.mockResolvedValue('value123');

    const val = await redisClient.get('myKey');
    expect(mockGet).toHaveBeenCalledWith('myKey');
    expect(val).toBe('value123');
  });

  test('should set a key with expiration', async () => {
    const { createClient } = require('redis');
    const mockSet = createClient().set;
    mockSet.mockResolvedValue('OK');

    const res = await redisClient.set('myKey', 'myVal', 100);
    expect(mockSet).toHaveBeenCalledWith('myKey', 'myVal', { EX: 100 });
    expect(res).toBe('OK');
  });

  test('throws if get is called before init', async () => {
    const client = new RedisClient();
    client.client = null;
    await expect(client.get('x')).rejects.toThrow(
      'Redis client not initialized'
    );
  });
});
