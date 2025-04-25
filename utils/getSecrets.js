const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const secret_name = 'nodesocial_secrets';

const client = new SecretsManagerClient({
  region: 'eu-north-1',
});

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
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: 'AWSCURRENT',
    })
  );

  try {
    const secrets = response.SecretString;

    if (!secrets) throw new Error('Secret string is EMPTY!!');

    const secretsJson = await JSON.parse(secrets);

    if (!Object.prototype.hasOwnProperty.call(secretsJson, key))
      throw new Error(`${key} not present in secrets`);

    return secretsJson[key];
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
