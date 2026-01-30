import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag, 
  getConversationsByTag 
} from '../controllers/tagController';

const router = Router();

router.get('/', authenticateToken, getTags);
router.post('/', authenticateToken, createTag);
router.put('/:id', authenticateToken, updateTag);
router.delete('/:id', authenticateToken, deleteTag);
router.get('/:tagId/conversations', authenticateToken, getConversationsByTag);

export default router;