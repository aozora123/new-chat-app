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
  getBotRoles,
  getConversationByIdValidation,
  addTagToConversationValidation,
  removeTagFromConversationValidation,
  createConversationValidation,
  updateConversationValidation,
  deleteConversationValidation,
  addMemberToGroupValidation,
  addBotToGroupValidation
} from '../controllers/conversationController';

const router = Router();

router.get('/', authenticateToken, getConversations);
router.get('/:id', getConversationByIdValidation, authenticateToken, getConversationById);
router.post('/', createConversationValidation, authenticateToken, createConversation);
router.put('/:id', updateConversationValidation, authenticateToken, updateConversation);
router.delete('/:id', deleteConversationValidation, authenticateToken, deleteConversation);
router.post('/:id/members', addMemberToGroupValidation, authenticateToken, addMemberToGroup);
router.post('/:id/bots', addBotToGroupValidation, authenticateToken, addBotToGroup);
router.post('/:id/tags', addTagToConversationValidation, authenticateToken, addTagToConversation);
router.delete('/:id/tags', removeTagFromConversationValidation, authenticateToken, removeTagFromConversation);
router.get('/bots/roles', authenticateToken, getBotRoles);

export default router;