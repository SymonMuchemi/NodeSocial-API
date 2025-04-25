const { createClient } = require('redis');
const { getSecret } = require('./getSecrets.js');

class RedisClient {
  constructor() {
    this.client = null;
    this.initialized = this.initialize();
  }

  async initialize() {
    try {
      const [username, password, host, port] = await Promise.all([
        getSecret('REDIS_USERNAME'),
        getSecret('REDIS_PASSWORD'),
        getSecret('REDIS_HOST'),
        getSecret('REDIS_PORT'),
      ]);

      this.client = createClient({
        username,
        password,
        socket: {
          host,
          port,
        },
      });

      // connect to redis
      await this.client.connect();
      console.log('Redis connection succeeded!');
    } catch (err) {
      console.log(`Redis connection error: ${err.message}`);
    }
  }

  isAlive() {
    return this.client && this.client.isReady;
  }

  async get(key) {
    if (!this.client) throw new Error('Redis client not initialized');

    return this.client.get(key);
  }

  async set(key, val, exp = 3600) {
    if (!this.client) throw new Error('Redis client not initialized');

    return this.client.set(key, val, { EX: exp });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
