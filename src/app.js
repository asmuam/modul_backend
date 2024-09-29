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
import helmet from 'helmet';

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
app.use(
  helmet({
    // Mengatur CSP untuk mencegah XSS
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://trusted-scripts.com'], // Ubah sesuai sumber tepercaya
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [], // Secara otomatis upgrade permintaan HTTP ke HTTPS
      },
    },
    crossOriginEmbedderPolicy: true, // Mencegah embedding konten lintas asal
    crossOriginOpenerPolicy: 'same-origin', // Mencegah membuka jendela lintas asal
    crossOriginResourcePolicy: { policy: 'same-origin' }, // Mencegah permintaan sumber lintas asal
    noSniff: true, // Mencegah browser dari menebak jenis konten
    ieNoOpen: true, // Mencegah Internet Explorer dari membuka file unduhan
    hidePoweredBy: true, // Menghapus header X-Powered-By
    hsts: {
      maxAge: 63072000, // 2 tahun
      includeSubDomains: true, // Menerapkan HSTS untuk subdomain
      preload: true, // Mengizinkan preload HSTS
    },
    xssFilter: true, // Mengaktifkan XSS Filter di browser
  })
);
app.use(limiter);
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  res.on('finish', () => {
    // Cek jika respons sudah ditangani oleh middleware penanganan kesalahan
    if (res.status < 400) {
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

export default app;
