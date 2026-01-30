import { Request, Response } from 'express';
import { Tag, Conversation, ConversationTag, Message } from '../models';

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
    const { name, color } = req.body;
    const userId = req.userId;

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
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.userId;

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
    const { id } = req.params;
    const userId = req.userId;

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
    const { tagId } = req.params;
    const userId = req.userId;

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