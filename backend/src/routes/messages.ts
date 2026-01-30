import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMessages, createMessage, deleteMessage } from '../controllers/messageController';

const router = Router();

router.get('/:conversationId/messages', authenticateToken, getMessages);
router.post('/', authenticateToken, createMessage);
router.delete('/:messageId', authenticateToken, deleteMessage);

export default router;