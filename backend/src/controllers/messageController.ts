import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Message, Conversation, User, GroupMember, GroupMemberInstance } from '../models';
import { generateAIResponse } from '../services/aiService';
import logger from '../config/logger';

// 验证规则
export const getMessagesValidation = [
  param('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer')
];

export const createMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer')
];

export const deleteMessageValidation = [
  param('messageId')
    .isInt({ min: 1 })
    .withMessage('Message ID must be a positive integer')
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

// 多机器人响应策略常量
const RESPONSE_STRATEGIES = {
  ALL: 'all' as const,
  RANDOM: 'random' as const,
  SMART: 'smart' as const
};

// 默认响应策略
const DEFAULT_RESPONSE_STRATEGY = RESPONSE_STRATEGIES.SMART;

// 检查是否为机器人循环对话的函数
const isBotLoop = async (conversationId: number): Promise<boolean> => {
  // 获取最近的几条消息
  const recentMessages = await Message.findAll({
    where: { conversationId },
    order: [['createdAt', 'DESC']],
    limit: 3
  });
  
  // 检查是否有连续的机器人消息
  if (recentMessages.length >= 2) {
    return recentMessages.every(msg => msg.senderType === 'bot');
  }
  
  return false;
};

// 根据消息内容选择最合适的机器人
const selectBestBotForMessage = (content: string, botMembers: any[]): any | null => {
  // 简单的关键词匹配
  const contentLower = content.toLowerCase();
  
  // 为每种机器人类型定义关键词
  const botKeywords: Record<string, string[]> = {
    customer_service: ['help', 'support', 'assist', 'problem', 'issue', 'question'],
    technical: ['technical', 'code', 'bug', 'error', 'fix', 'program', 'tech'],
    humorous: ['funny', 'joke', 'laugh', 'humor', 'hilarious', 'fun'],
    creative: ['creative', 'idea', 'innovate', 'design', 'invent', 'imagine'],
    advisor: ['advice', 'suggest', 'recommend', 'opinion', 'guidance', 'help']
  };
  
  // 计算每个机器人的匹配分数
  let bestBot: any | null = null;
  let highestScore = 0;
  
  for (const bot of botMembers) {
    if (bot.botType) {
      const keywords = botKeywords[bot.botType] || [];
      const score = keywords.reduce((acc, keyword) => {
        return acc + (contentLower.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > highestScore) {
        highestScore = score;
        bestBot = bot;
      }
    }
  }
  
  return bestBot;
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Fetching messages', {
      conversationId,
      userId
    });

    // Verify user has access to the conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      logger.warn('Conversation not found', {
        conversationId,
        userId
      });
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId && !conversation.isGroup) {
      logger.warn('Access forbidden', {
        conversationId,
        userId,
        conversationOwnerId: conversation.userId
      });
      return res.status(403).json({ error: 'Access forbidden' });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'Sender', attributes: ['id', 'username'] }],
    });

    logger.debug('Messages fetched successfully', {
      conversationId,
      messageCount: messages.length
    });

    res.json(messages);
  } catch (error: any) {
    logger.error('Error fetching messages:', { error, conversationId: req.params.conversationId });
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { content, conversationId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user has access to the conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.userId !== userId && !conversation.isGroup) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    // 检查是否为机器人消息
    // 如果是机器人消息，不触发新的机器人回复
    // 这是防止机器人循环对话的第一层防护
    const lastMessage = await Message.findOne({
      where: { conversationId },
      order: [['createdAt', 'DESC']]
    });
    
    if (lastMessage && lastMessage.senderType === 'bot') {
      // 直接创建消息，不触发新的机器人回复
      const userMessage = await Message.create({
        content,
        senderType: 'user',
        senderId: userId,
        conversationId,
      });
      
      return res.json({
        message: 'Message sent successfully',
        userMessage,
        aiProcessingStatus: 'Bot message detected, skipping AI response to prevent loop',
      });
    }

    // Create user message
    const userMessage = await Message.create({
      content,
      senderType: 'user',
      senderId: userId,
      conversationId,
    });

    // If it's a group conversation and has bots, trigger AI responses
    logger.info('Checking for bot responses', {
      conversationId,
      isGroup: conversation.isGroup,
      conversationTitle: conversation.title
    });

    if (conversation.isGroup) {
      // Get group members to identify bots and humans
      const groupMembers = await GroupMember.findAll({
        where: { conversationId },
        include: [{ model: User, as: 'User', required: false }]
      });

      logger.info('Group members fetched', {
        conversationId,
        totalMembers: groupMembers.length,
        members: groupMembers.map(m => ({ id: m.id, memberType: m.memberType, botType: m.botType }))
      });

      // Find bot members in the group
      const botMembers = groupMembers.filter(member => member.memberType === 'bot');

      // Find human members in the group (excluding the sender)
      const humanMembers = groupMembers.filter(
        member => member.memberType === 'human' && member.userId !== userId
      );

      logger.info('Bot and human members identified', {
        botCount: botMembers.length,
        humanCount: humanMembers.length
      });

      // 检查是否为机器人循环对话
      const botLoop = await isBotLoop(conversationId);
      
      if (!botLoop && botMembers.length > 0) {
        // 应用响应策略
        const strategy = DEFAULT_RESPONSE_STRATEGY as unknown as string;
        
        logger.info('Generating bot responses', {
          conversationId,
          strategy,
          botCount: botMembers.length,
          messageContent: content.substring(0, 50) + (content.length > 50 ? '...' : '')
        });
        
        // 使用字符串比较来避免TypeScript类型错误
        if (strategy === 'all') {
          // 所有机器人都回复
          for (const bot of botMembers) {
            setTimeout(async () => {
              try {
                console.log('Generating AI response for bot:', { botType: bot.botType, conversationId, message: content });
                const aiResponse = await generateAIResponse(content, bot.botType || 'friendly');
                console.log('AI response generated:', { response: aiResponse.substring(0, 50) + '...' });
                
                console.log('Creating bot message:', { senderType: 'bot', conversationId });
                const botMessage = await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: null, // 机器人消息不需要 senderId
                  conversationId,
                });
                console.log('Bot message created successfully:', { messageId: botMessage.id });
                
                logger.debug('Bot response generated', {
                  botType: bot.botType,
                  conversationId
                });
              } catch (error: any) {
                console.error('Detailed error in bot response:', error);
                logger.error('Error generating bot response:', { error: error.message || error, botType: bot.botType });
              }
            }, Math.random() * 400 + 100); // Random delay between 0.1-0.5 seconds (optimized for faster response)
          }
        } else if (strategy === 'random') {
          // 随机选择一个机器人回复
          const randomBot = botMembers[Math.floor(Math.random() * botMembers.length)];
          setTimeout(async () => {
            try {
              const aiResponse = await generateAIResponse(content, randomBot.botType || 'friendly');
              await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: null, // 机器人消息不需要 senderId
                  conversationId,
                });
              logger.debug('Random bot response generated', {
                botType: randomBot.botType,
                conversationId
              });
            } catch (error) {
              logger.error('Error generating bot response:', { error, botType: randomBot.botType });
            }
          }, Math.random() * 400 + 100); // Random delay between 0.1-0.5 seconds (optimized for faster response)
        } else if (strategy === 'smart') {
          // 智能选择最合适的机器人回复
          const bestBot = selectBestBotForMessage(content, botMembers);
          
          if (bestBot) {
            // 让最适合的机器人回复
            setTimeout(async () => {
              try {
                const aiResponse = await generateAIResponse(content, bestBot.botType || 'friendly');
                await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: null, // 机器人消息不需要 senderId
                  conversationId,
                });
                logger.debug('Smart bot response generated', {
                  botType: bestBot.botType,
                  conversationId
                });
              } catch (error) {
                logger.error('Error generating bot response:', { error, botType: bestBot.botType });
              }
            }, Math.random() * 400 + 100); // Random delay between 0.1-0.5 seconds (optimized for faster response)
          } else {
            // 如果没有找到合适的机器人，随机选择一个
            const randomBot = botMembers[Math.floor(Math.random() * botMembers.length)];
            setTimeout(async () => {
              try {
                console.log('Generating AI response for bot:', { botType: randomBot.botType, conversationId, message: content });
                const aiResponse = await generateAIResponse(content, randomBot.botType || 'friendly');
                console.log('AI response generated:', { response: aiResponse.substring(0, 50) + '...' });
                
                console.log('Creating bot message:', { senderType: 'bot', senderId: randomBot.id, conversationId });
                await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: null, // 机器人消息不需要 senderId
                  conversationId,
                });
                logger.debug('Fallback bot response generated', {
                  botType: randomBot.botType,
                  conversationId
                });
              } catch (error: any) {
                console.error('Detailed error in fallback bot response:', error);
                logger.error('Error generating random bot response:', { error: error.message || error, botType: randomBot.botType });
              }
            }, Math.random() * 400 + 100); // Random delay between 0.1-0.5 seconds (optimized for faster response)
          }
        }
      }

      // For each human member, generate a simulated response
      const humanResponses = [
        "That's interesting! Tell me more.",
        "I agree with you.",
        "Great point!",
        "I see what you mean.",
        "That makes sense.",
        "Thanks for sharing!",
        "I was thinking the same thing.",
        "Absolutely!",
        "Good question!",
        "Let me think about that..."
      ];

      for (const human of humanMembers) {
        setTimeout(async () => {
          try {
            const randomResponse = humanResponses[Math.floor(Math.random() * humanResponses.length)];
            await Message.create({
              content: randomResponse,
              senderType: 'user',
              senderId: human.userId,
              conversationId,
            });
            logger.debug('Human response generated', {
              userId: human.userId,
              conversationId
            });
          } catch (error) {
            logger.error('Error generating human response:', { error, userId: human.userId });
          }
        }, Math.random() * 1000 + 500); // Random delay between 0.5-1.5 seconds (optimized for faster response)
      }
    } else {
      // For non-group conversations, generate one AI response
      setTimeout(async () => {
        try {
          const aiResponse = await generateAIResponse(content, 'friendly');
          await Message.create({
            content: aiResponse,
            senderType: 'ai',
            conversationId,
          });
          logger.debug('AI response generated for non-group conversation', {
            conversationId
          });
        } catch (error) {
          logger.error('Error generating AI response:', { error, conversationId });
        }
      }, 300); // Optimized delay for faster AI response
    }

    res.json({
      message: 'Message sent successfully',
      userMessage,
      aiProcessingStatus: 'AI response being generated',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    // 检查验证错误
    if (handleValidationErrors(req, res)) return;
    
    const { messageId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    logger.info('Deleting message', {
      messageId,
      userId
    });

    const message = await Message.findByPk(messageId);

    if (!message) {
      logger.warn('Message not found', {
        messageId,
        userId
      });
      return res.status(404).json({ error: 'Message not found' });
    }

    // Users can only delete their own messages
    if (message.senderId !== userId) {
      logger.warn('Access forbidden', {
        messageId,
        userId,
        messageSenderId: message.senderId
      });
      return res.status(403).json({ error: 'Access forbidden' });
    }

    await message.destroy();

    logger.info('Message deleted successfully', {
      messageId,
      userId
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting message:', { error, messageId: req.params.messageId });
    res.status(500).json({ error: error.message });
  }
};