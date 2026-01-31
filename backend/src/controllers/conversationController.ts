import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Conversation, Message, Tag, GroupMember, User, ConversationTag } from '../models';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import logger from '../config/logger';

// 验证规则
export const getConversationByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer')
];

export const addTagToConversationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer')
];

export const removeTagFromConversationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('tagId')
    .isInt({ min: 1 })
    .withMessage('Tag ID must be a positive integer')
];

export const createConversationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Conversation title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation title must be between 1 and 100 characters'),
  body('isGroup')
    .optional()
    .isBoolean()
    .withMessage('isGroup must be a boolean value')
];

export const updateConversationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Conversation title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Conversation title must be between 1 and 100 characters')
];

export const deleteConversationValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer')
];

export const addMemberToGroupValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('memberId')
    .isInt({ min: 1 })
    .withMessage('Member ID must be a positive integer')
];

export const addBotToGroupValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('botType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Bot type must not exceed 50 characters')
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

// 预设机器人角色配置
export const BOT_ROLES = [
  {
    type: 'customer_service',
    name: '客服机器人',
    personality: '专业、耐心、乐于助人，擅长解决问题和提供详细信息',
    responseTendency: '详细解释、提供解决方案、保持专业态度'
  },
  {
    type: 'technical',
    name: '技术机器人',
    personality: '逻辑严谨、知识渊博，擅长技术问题和代码分析',
    responseTendency: '提供技术细节、分析问题根因、给出具体实现方案'
  },
  {
    type: 'humorous',
    name: '幽默机器人',
    personality: '活泼开朗、幽默感强，擅长调节气氛和讲笑话',
    responseTendency: '使用幽默语言、讲笑话、轻松愉快的回答方式'
  },
  {
    type: 'creative',
    name: '创意机器人',
    personality: '富有想象力、创意十足，擅长头脑风暴和创新思考',
    responseTendency: '提供创意想法、鼓励创新、跳出常规思维'
  },
  {
    type: 'advisor',
    name: '顾问机器人',
    personality: '成熟稳重、经验丰富，擅长提供建议和指导',
    responseTendency: '给出专业建议、分享经验、提供战略性思考'
  }
];

// 获取所有预设机器人角色
export const getBotRoles = async (req: Request, res: Response) => {
  try {
    res.json(BOT_ROLES);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { userId },
          {
            id: {
              [Op.in]: sequelize.literal(`(SELECT conversationId FROM GroupMembers WHERE userId = ${userId} AND memberType = 'human')`)
            }
          }
        ]
      },
      include: [
        { model: Message, as: 'Messages', limit: 1, order: [['createdAt', 'DESC']] },
        { model: Tag, as: 'Tags' },
        {
          model: GroupMember,
          as: 'GroupMembers',
          include: [{ model: User, as: 'User' }]
        }
      ],
      order: [['updatedAt', 'DESC']],
    });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addTagToConversation = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { tagId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tag.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    const existingAssociation = await ConversationTag.findOne({
      where: { conversationId: parseInt(id), tagId }
    });

    if (existingAssociation) {
      return res.status(400).json({ error: 'Tag already added to conversation' });
    }

    await ConversationTag.create({
      conversationId: parseInt(id),
      tagId
    });

    const updatedConversation = await Conversation.findByPk(id, {
      include: [{ model: Tag, as: 'Tags' }]
    });

    res.json(updatedConversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeTagFromConversation = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { tagId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    await ConversationTag.destroy({
      where: { conversationId: parseInt(id), tagId }
    });

    const updatedConversation = await Conversation.findByPk(id, {
      include: [{ model: Tag, as: 'Tags' }]
    });

    res.json(updatedConversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversationById = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id, {
      include: [
        { model: Message, as: 'Messages', order: [['createdAt', 'ASC']] },
        { model: Tag, as: 'Tags' },
        {
          model: GroupMember,
          as: 'GroupMembers',
          include: [{ model: User, as: 'User' }]
        }
      ],
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Only allow users to access their own conversations
    if (conversation.userId !== userId && !conversation.isGroup) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createConversation = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { title, isGroup } = req.body;
    const userId = req.userId;
    
    logger.info('Create conversation request received', { title: title.substring(0, 30) + (title.length > 30 ? '...' : ''), isGroup });

    console.log('Creating conversation:', { title, isGroup, userId });
    console.log('isGroup type:', typeof isGroup, 'isGroup value:', isGroup);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.create({
      title,
      userId,
      isGroup: Boolean(isGroup),
    });

    console.log('Created conversation:', conversation.toJSON());
    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.userId;
    
    logger.info('Update conversation request received', { conversationId: id, title: title.substring(0, 30) + (title.length > 30 ? '...' : '') });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    await conversation.update({ title });

    res.json(conversation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const userId = req.userId;
    
    logger.info('Delete conversation request received', { conversationId: id });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // Delete associated records first
    const conversationId = parseInt(id);
    
    // Delete all messages in this conversation
    await Message.destroy({
      where: { conversationId }
    });

    // Delete all group members
    await GroupMember.destroy({
      where: { conversationId }
    });

    // Delete all conversation-tag associations
    await ConversationTag.destroy({
      where: { conversationId }
    });

    // Finally, delete the conversation
    await conversation.destroy();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const addMemberToGroup = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;
    
    logger.info('Add member to group request received', { conversationId: id, memberId });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // If it's not a group, convert it to a group
    if (!conversation.isGroup) {
      await conversation.update({ isGroup: true });
    }

    const existingMember = await GroupMember.findOne({
      where: {
        conversationId: parseInt(id),
        userId: memberId,
        memberType: 'human'
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    const groupMember = await GroupMember.create({
      conversationId: parseInt(id),
      userId: memberId,
      memberType: 'human'
    });

    const memberWithUser = await GroupMember.findByPk(groupMember.id, {
      include: [{ model: User, as: 'User' }]
    });

    res.status(201).json(memberWithUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addBotToGroup = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { id } = req.params;
    const { botType } = req.body;
    const userId = req.userId;
    
    logger.info('Add bot to group request received', { conversationId: id, botType });

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversation = await Conversation.findByPk(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // If it's not a group, convert it to a group
    if (!conversation.isGroup) {
      await conversation.update({ isGroup: true });
    }

    const groupMember = await GroupMember.create({
      conversationId: parseInt(id),
      memberType: 'bot',
      botType: botType || 'friendly'
    });

    res.status(201).json(groupMember);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};