const { S3Client } = require('@aws-sdk/client-s3');
const { getSecret } = require('../utils/getSecrets.js');

exports.initS3Client = async () => {
  const region = await getSecret('S3_BUCKET_REGION');
  const accessKeyId = await getSecret('S3_ACCESS_KEY');
  const secretAccessKey = await getSecret('S3_SECRET_ACCESS_KEY');

  if (!region) throw new Error('📦 Missing credential: S3_BUCKET_REGION');
  if (!accessKeyId) throw new Error('📦 Missing credential: S3_ACCESS_KEY');
  if (!secretAccessKey)
    throw new Error('📦 Missing credential: S3_SECRET_ACCESS_KEY');

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};
