import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMessages, createMessage, deleteMessage, getMessagesValidation, createMessageValidation, deleteMessageValidation } from '../controllers/messageController';

const router = Router();

router.get('/:conversationId/messages', getMessagesValidation, authenticateToken, getMessages);
router.post('/', createMessageValidation, authenticateToken, createMessage);
router.delete('/:messageId', deleteMessageValidation, authenticateToken, deleteMessage);

export default router;