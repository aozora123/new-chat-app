import { Request, Response } from 'express';
import { Message, Conversation, User, GroupMember, GroupMemberInstance } from '../models';
import { generateAIResponse } from '../services/aiService';

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
    const { conversationId } = req.params;
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

    const messages = await Message.findAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'Sender', attributes: ['id', 'username'] }],
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
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
    if (conversation.isGroup) {
      // Get group members to identify bots and humans
      const groupMembers = await GroupMember.findAll({
        where: { conversationId },
        include: [{ model: User, as: 'User' }]
      });

      // Find bot members in the group
      const botMembers = groupMembers.filter(member => member.memberType === 'bot');

      // Find human members in the group (excluding the sender)
      const humanMembers = groupMembers.filter(
        member => member.memberType === 'human' && member.userId !== userId
      );

      // 检查是否为机器人循环对话
      const botLoop = await isBotLoop(conversationId);
      
      if (!botLoop && botMembers.length > 0) {
      // 应用响应策略
        const strategy = DEFAULT_RESPONSE_STRATEGY as unknown as string;
        
        // 使用字符串比较来避免TypeScript类型错误
        if (strategy === 'all') {
          // 所有机器人都回复
          for (const bot of botMembers) {
            setTimeout(async () => {
              try {
                const aiResponse = await generateAIResponse(content, bot.botType || 'friendly');
                await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: bot.id,
                  conversationId,
                });
              } catch (error) {
                console.error('Error generating bot response:', error);
              }
            }, Math.random() * 1500 + 500); // Random delay between 0.5-2.0 seconds
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
                senderId: randomBot.id,
                conversationId,
              });
            } catch (error) {
              console.error('Error generating bot response:', error);
            }
          }, Math.random() * 1500 + 500);
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
                  senderId: bestBot.id,
                  conversationId,
                });
              } catch (error) {
                console.error('Error generating bot response:', error);
              }
            }, Math.random() * 1500 + 500);
          } else {
            // 如果没有找到合适的机器人，随机选择一个
            const randomBot = botMembers[Math.floor(Math.random() * botMembers.length)];
            setTimeout(async () => {
              try {
                const aiResponse = await generateAIResponse(content, randomBot.botType || 'friendly');
                await Message.create({
                  content: aiResponse,
                  senderType: 'bot',
                  senderId: randomBot.id,
                  conversationId,
                });
              } catch (error) {
                console.error('Error generating bot response:', error);
              }
            }, Math.random() * 1500 + 500);
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
          } catch (error) {
            console.error('Error generating human response:', error);
          }
        }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
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
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      }, 800);
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
    const { messageId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Users can only delete their own messages
    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Access forbidden' });
    }

    await message.destroy();

    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};