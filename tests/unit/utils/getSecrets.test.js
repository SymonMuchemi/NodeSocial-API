const { getSecret, resetCache } = require('../../../src/utils/getSecrets.js');

jest.mock('@aws-sdk/client-secrets-manager', () => {
  const mockSecretData = {
    SecretString: JSON.stringify({
      REDIS_USERNAME: 'test-user',
      REDIS_PASSWORD: 'test-pass',
      REDIS_HOST: 'localhost',
      PORT: '6379',
      DB_CONNECTION: 'mongodb://localhost:27017/test',
    }),
  };

  return {
    SecretsManagerClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue(mockSecretData),
    })),
    GetSecretValueCommand: jest.fn().mockImplementation(() => ({})),
  };
});

describe('getSecrets utility', () => {
  beforeEach(() => {
    jest.resetModules();
    resetCache();

    jest.isolateModules(() => {
      const secretsModule = require('../../../src/utils/getSecrets.js');
    });
  });

  test('should return cached value on subsequent calls', async () => {
    await getSecret('REDIS_USERNAME');

    const {
      GetSecretValueCommand,
    } = require('@aws-sdk/client-secrets-manager');
    GetSecretValueCommand.mockClear();

    const result = await getSecret('REDIS_USERNAME');
    expect(result).toBe('test-user');

    expect(GetSecretValueCommand).toHaveBeenCalledTimes(0);
  });

  test('should throw error for non-existent key', async () => {
    await expect(getSecret('NON_EXISTENT_KEY')).rejects.toThrow(
      'Key "NON_EXISTENT_KEY" not present in secrets'
    );
  });

  test('should throw error if secret string is empty', async () => {
    const { SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

    SecretsManagerClient.mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({
        SecretString: '',
      }),
    }));

    jest.resetModules();
    const {
      getSecret: getSecretFresh,
    } = require('../../../src/utils/getSecrets.js');

    await expect(getSecretFresh('')).rejects.toThrow(
      'Secret string must not be empty!'
    );
  });
});
