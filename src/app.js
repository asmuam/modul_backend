import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import config from './config.js';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import logger from './utils/logger.js';
import sendResponse from './utils/responseUtil.js'; // Import utilitas respons

const largeData = {
  users: Array.from({ length: 1000000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    details: {
      age: Math.floor(Math.random() * 50) + 20,
      address: `Address ${i + 1}`,
    },
  })),
};
// Configure the rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});
const app = express();

// ----- MIDDLEWARE -----
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.domain, // Update to your frontend URL
    credentials: true, // Allows cookies to be sent and received
  })
);
app.use(limiter);
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  res.on('finish', () => {
    // Cek jika respons sudah ditangani oleh middleware penanganan kesalahan
    if (res.statusCode < 400) {
      logger.info(`Response: ${res.statusCode} for ${req.method} ${req.url}`);
    }
  });
  next();
});
app.use((err, req, res, next) => {
  const errorMessage = err.message || 'Internal Server Error'; // Default message if none provided
  logger.error(`Error: ${errorMessage} for ${req.method} ${req.url}`);
  sendResponse(res, err.status || 500, errorMessage); // Use the default message in response
});

// ----- MIDDLEWARE -----

// ----- MAIN ROUTES -----
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
// ----- MAIN ROUTES -----

// ----- TEST ROUTES -----
app.get('/api/test', (req, res) => {
  res.send('This is a test endpoint!');
});
app.get('/api/no-compression', (req, res) => {
  res.json(largeData);
});
app.get('/api/compression', compression({ threshold: 0 }), (req, res) => {
  res.json(largeData);
});
// ----- TEST ROUTES -----

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
