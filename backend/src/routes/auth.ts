import { Router } from 'express';
import { register, login, getMe, getAllUsers, registerValidation, loginValidation } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, getAllUsers);

export default router;