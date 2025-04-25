const mongoose = require('mongoose');
const { getSecret } = require('../utils/getSecrets.js');

exports.connectDB = async () => {
  try {
    const mongoURL = await getSecret('MONGO_URL');
    const conn = await mongoose.connect(mongoURL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
