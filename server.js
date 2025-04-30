const app = require('./src/app.js');

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`App running in mode at http://127.0.0.1:${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
