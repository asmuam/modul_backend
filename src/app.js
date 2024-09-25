import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors'

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
// Configure CORS
app.use(cors({
    origin: 'http://localhost:3000', // Update to your frontend URL
    credentials: true, // Allows cookies to be sent and received
  }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
