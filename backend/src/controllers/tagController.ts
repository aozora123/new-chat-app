import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Tag, Conversation, ConversationTag, Message } from '../models';
import logger from '../config/logger';

// 验证规则
export const createTagValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

export const updateTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tag name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

export const deleteTagValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer')
];

export const getConversationsByTagValidation = [
  param('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer')
];

// 验证结果处理
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', { errors: errors.array(), path: req.path });
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
    return true;
  }
  return false;
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tags = await Tag.findAll({
      where: { userId },
      order: [['name', 'ASC']],
    });

    res.json(tags);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { name, color } = req.body;
    const userId = req.userId;
    
    logger.info('Create tag request received', { name, color });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await Tag.create({
      name,
      color: color || '#007bff',
      userId,
    });

    res.status(201).json(tag);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.userId;
    
    logger.info('Update tag request received', { tagId: id, name, color });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    await tag.update({ name, color });

    res.json(tag);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const userId = req.userId;
    
    logger.info('Delete tag request received', { tagId: id });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await Tag.findByPk(id);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // Remove all associations with conversations
    await ConversationTag.destroy({
      where: { tagId: id }
    });

    await tag.destroy();

    res.json({ message: 'Tag deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationsByTag = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { tagId } = req.params;
    const userId = req.userId;
    
    logger.info('Get conversations by tag request received', { tagId });

    console.log('getConversationsByTag called with tagId:', tagId, 'userId:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the tag with associated conversations
    const tag = await Tag.findByPk(tagId, {
      include: [{
        model: Conversation,
        include: [
          { model: Tag, as: 'Tags' },
          { model: Message, as: 'Messages', limit: 1, order: [['createdAt', 'DESC']] }
        ]
      }]
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    console.log('Tag found:', tag);
    console.log('Conversations found:', (tag as any).Conversations?.length);

    res.json((tag as any).Conversations || []);
  } catch (error: any) {
    console.error('Error in getConversationsByTag:', error);
    res.status(500).json({ error: error.message });
  }
};