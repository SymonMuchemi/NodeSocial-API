const express = require('express');
const color = require('colors');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db.js');

const app = express();
const PORT = 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();
connectDB();

if (NODE_ENV === 'development') {
  const morgan = require('morgan');

  app.use(morgan('dev'));
}

// healthcheck
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from Nodesocial API' });
});

const server = app.listen(PORT, () => {
  console.log(`App running in mode at http://127.0.0.1:${PORT}`.yellow.bold);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});

module.exports = app;
