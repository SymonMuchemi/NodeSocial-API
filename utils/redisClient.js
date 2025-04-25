const { createClient } = require('redis');
const { getSecret } = require('./getSecrets.js');

let redisClient;

async function initRedisClient() {
  const username = await getSecret('REDIS_USERNAME');
  const password = await getSecret('REDIS_PASSWORD');
  const host = await getSecret('REDIS_HOST');
  const port = parseInt(await getSecret('REDIS_PORT'), 10);

  const client = createClient({
    username,
    password,
    socket: {
      host,
      port,
    },
  });

  client
    .connect()
    .then(() => console.log('Redis connection succeeded!'.green.inverse))
    .catch((err) => console.log(`Redis connection error: ${err}`.red.bold));

  return client;
}

(async () => {
  redisClient = await initRedisClient();
})();

module.exports = {
  isAlive: () => redisClient.isReady,
  get: (key) => redisClient.get(key),
  set: (key, val, exp = 3600) => redisClient.set(key, val, { EX: exp }),
};
