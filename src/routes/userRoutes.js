import express from 'express';
import {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.get('/', authMiddleware(['ADMIN']), getUsers);
router.post(
  '/',
  [
    authMiddleware(['ADMIN']),
    body('username')
      .notEmpty()
      .trim()
      .escape()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters long')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(), // Normalisasi email
    body('password')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .trim(), // Menghilangkan spasi
    body('name').notEmpty().trim().escape(), // Opsional, hapus spasi dan escape karakter spesial
    body('role')
      .optional()
      .isIn(['ADMIN', 'USER'])
      .withMessage('Role must be ADMIN or USER')
      .trim()
      .escape(), // Validasi pilihan role
  ],
  createUser
);
router.get(
  '/:userId',
  [
    authMiddleware(['ADMIN', 'USER']),
    param('userId').isInt().withMessage('User ID must be an integer').toInt(), // Konversi ke integer
  ],
  getUser
);
router.put(
  '/:userId',
  [
    authMiddleware(['ADMIN']),
    param('userId').isInt().withMessage('User ID must be an integer').toInt(), // Konversi ke integer
    body('username')
      .notEmpty()
      .trim()
      .escape()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters long')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(), // Normalisasi email
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .trim(), // Menghilangkan spasi
    body('name').notEmpty().trim().escape(), // Opsional, hapus spasi dan escape karakter spesial
    body('role')
      .isIn(['ADMIN', 'USER'])
      .withMessage('Role must be ADMIN or USER')
      .trim()
      .escape(), // Validasi pilihan role
  ],
  updateUser
);
router.patch(
  '/:userId',
  [
    authMiddleware(['ADMIN']),
    param('userId')
      .optional()
      .isInt()
      .withMessage('User ID must be an integer')
      .toInt(), // Konversi ke integer
    body('username')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters long')
      .matches(/^[a-zA-Z0-9_]*$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email must be valid')
      .normalizeEmail(), // Normalisasi email
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .trim(), // Menghilangkan spasi
    body('name').optional().trim().escape(), // Opsional, hapus spasi dan escape karakter spesial
    body('role')
      .optional()
      .isIn(['ADMIN', 'USER'])
      .withMessage('Role must be ADMIN or USER')
      .trim()
      .escape(), // Validasi pilihan role
  ],
  updateUser
);
router.delete(
  '/:userId',
  [
    authMiddleware(['ADMIN']),
    param('userId').isInt().withMessage('User ID must be an integer').toInt(), // Konversi ke integer
  ],
  deleteUser
);

export default router;
