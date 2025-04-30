const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./config/db.js');
const errorHandler = require('./middleware/error.js');

// Import routes
const userRouter = require('./routes/user.routes.js');
const authRouter = require('./routes/auth.routes.js');

const app = express();
const PORT = 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config();
connectDB();

if (NODE_ENV === 'development') {
  const morgan = require('morgan');

  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(errorHandler);

// healthcheck
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from Nodesocial API' });
});

const server = app.listen(PORT, () => {
  console.log(`App running in mode at http://127.0.0.1:${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});

module.exports = app;
