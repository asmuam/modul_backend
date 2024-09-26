import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
} from '../controllers/authController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .trim()
      .escape()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters long')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .trim(),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(),
    body('name').optional().trim().escape(),
    body('role').optional().trim().escape(),
  ],
  register
);

router.post(
  '/login',
  [
    body('login')
      .notEmpty()
      .withMessage('Username or email is required')
      .trim()
      .escape()
      .custom((value) => {
        // Check if value is a valid email
        if (
          !/\S+@\S+\.\S+/.test(value) &&
          !/^[a-zA-Z0-9_]{3,20}$/.test(value)
        ) {
          throw new Error(
            'Login must be a valid email or a username (3-20 characters, letters, numbers, and underscores only)'
          );
        }
        return true; // Validation passed
      }),
    body('password').notEmpty().withMessage('Password is required').trim(),
  ],
  login
);
router.post('/logout', logout);
router.post('/refresh', refresh);

export default router;
