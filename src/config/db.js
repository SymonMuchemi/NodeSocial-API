const mongoose = require('mongoose');
const { getSecret } = require('../utils/getSecrets.js');

exports.connectDB = async () => {
  if (process.env.NODE_ENV === 'test') return;

  try {
    const mongoURL = await getSecret('MONGO_URL');
    const conn = await mongoose.connect(mongoURL);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
