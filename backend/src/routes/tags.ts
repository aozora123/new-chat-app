import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag, 
  getConversationsByTag,
  createTagValidation,
  updateTagValidation,
  deleteTagValidation,
  getConversationsByTagValidation
} from '../controllers/tagController';

const router = Router();

router.get('/', authenticateToken, getTags);
router.post('/', createTagValidation, authenticateToken, createTag);
router.put('/:id', updateTagValidation, authenticateToken, updateTag);
router.delete('/:id', deleteTagValidation, authenticateToken, deleteTag);
router.get('/:tagId/conversations', getConversationsByTagValidation, authenticateToken, getConversationsByTag);

export default router;