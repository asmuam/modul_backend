import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware(['ADMIN']), getUsers);
router.get('/:id', authMiddleware(['ADMIN', 'USER']), getUser);
router.put('/:id', authMiddleware(['ADMIN']), updateUser);
router.patch('/:id', authMiddleware(['ADMIN']), updateUser); // If partial update is needed
router.delete('/:id', authMiddleware(['ADMIN']), deleteUser);

export default router;
