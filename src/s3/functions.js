const { initS3Client } = require('./client.js');
const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSecret } = require('../utils/getSecrets.js');

exports.uploadImageToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const client = await initS3Client();
    const bucketName = await getSecret('S3_BUCKET_NAME');

    let directoryName;

    if (mimeType.startsWith('image/')) {
      directoryName = 'files/images/img_';
    } else if (mimeType.startsWith('video/')) {
      directoryName = 'files/videos/vid_';
    } else {
      throw new Error('File must be an image or a video!');
    }

    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: `${directoryName + fileName}`,
    };

    const uploadResponse = await client.send(
      new PutObjectCommand(uploadParams)
    );

    // TODO: remove this lines after tests
    console.log('S3 Object upload response:');
    console.log(uploadResponse);
  } catch (error) {
    console.error(`S3 UPLOAD ERROR: ${error.message}`);
  }
};

exports.deleteFileFromS3 = async (key) => {
  try {
    const client = await initS3Client();
    const bucketName = await getSecret('AWS_BUCKET_NAME');

    let filePath;

    if (key.startsWith('vid_')) {
      filePath = 'files/videos/';
    } else if (key.startsWith('img_')) {
      filePath = 'files/images/';
    } else {
      throw new Error('Error finding file directory path!!');
    }

    const params = {
      Bucket: bucketName,
      Key: `${filePath + key}`,
    };
    await client.send(new DeleteObjectCommand(params));
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};
