const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const secret_name = 'nodesocial_secrets';

const client = new SecretsManagerClient({
  region: 'eu-north-1',
});

let cachedSecrets = null;

/**
 * Retrieves a specific secret value from AWS Secrets Manager.
 *
 * @async
 * @function getSecret
 * @param {string} value - The key of the secret to retrieve from the secrets JSON.
 * @returns {Promise<string>} The value of the specified secret key.
 * @throws {Error} If the secret string is empty or the specified key is not present in the secrets.
 */
exports.getSecret = async (key) => {
  // If cached, return from memory
  if (cachedSecrets && cachedSecrets[key]) {
    return cachedSecrets[key];
  }

  // If cache not available, fetch from AWS
  if (!cachedSecrets) {
    const command = new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: 'AWSCURRENT',
    });

    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error('Secret string is EMPTY!!');
    }

    cachedSecrets = JSON.parse(response.SecretString);
  }

  if (!Object.prototype.hasOwnProperty.call(cachedSecrets, key)) {
    throw new Error(`Key "${key}" not present in secrets`);
  }

  return cachedSecrets[key];
};
