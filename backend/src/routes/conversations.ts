import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getConversations, 
  getConversationById, 
  createConversation, 
  updateConversation, 
  deleteConversation,
  addMemberToGroup,
  addBotToGroup,
  addTagToConversation,
  removeTagFromConversation,
  getBotRoles
} from '../controllers/conversationController';

const router = Router();

router.get('/', authenticateToken, getConversations);
router.get('/:id', authenticateToken, getConversationById);
router.post('/', authenticateToken, createConversation);
router.put('/:id', authenticateToken, updateConversation);
router.delete('/:id', authenticateToken, deleteConversation);
router.post('/:id/members', authenticateToken, addMemberToGroup);
router.post('/:id/bots', authenticateToken, addBotToGroup);
router.post('/:id/tags', authenticateToken, addTagToConversation);
router.delete('/:id/tags', authenticateToken, removeTagFromConversation);
router.get('/bots/roles', authenticateToken, getBotRoles);

export default router;