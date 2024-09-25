import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import config from "./config.js";

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
// Configure CORS
app.use(cors({
  origin: config.domain, // Update to your frontend URL
  credentials: true, // Allows cookies to be sent and received
}));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
