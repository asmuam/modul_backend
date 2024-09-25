import express from 'express';
import {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware(['ADMIN']), getUsers);
router.post('/', authMiddleware(['ADMIN']), createUser);
router.get('/:userId', authMiddleware(['ADMIN', 'USER']), getUser);
router.put('/:userId', authMiddleware(['ADMIN']), updateUser);
router.patch('/:userId', authMiddleware(['ADMIN']), updateUser); // partial update 
router.delete('/:userId', authMiddleware(['ADMIN']), deleteUser);

export default router;