import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import config from './config.js';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

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

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.domain, // Update to your frontend URL
    credentials: true, // Allows cookies to be sent and received
  })
);
app.use(limiter);

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.get('/api/test', (req, res) => {
  res.send('This is a test endpoint!');
});

// ----- COMPRESSION TEST -----
console.log('Number of users:', largeData.users.length);

// API without compression
app.get('/api/no-compression', (req, res) => {
  res.json(largeData);
});

// API with compression (only on this route)
app.get('/api/compression', compression({ threshold: 0 }), (req, res) => {
  res.json(largeData);
});
// ----- COMPRESSION TEST -----

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
