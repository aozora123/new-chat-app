import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define interfaces for our models
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export const User = sequelize.define<UserInstance, UserAttributes>('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Conversation model
interface ConversationAttributes {
  id: number;
  title: string;
  userId: number;
  isGroup: boolean;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id'> {}

export interface ConversationInstance extends Model<ConversationAttributes, ConversationCreationAttributes>, ConversationAttributes {}

export const Conversation = sequelize.define<ConversationInstance, ConversationAttributes>('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  isGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Message model
interface MessageAttributes {
  id: number;
  content: string;
  senderType: 'user' | 'ai' | 'bot';
  senderId?: number;
  conversationId: number;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

export interface MessageInstance extends Model<MessageAttributes, MessageCreationAttributes>, MessageAttributes {}

export const Message = sequelize.define<MessageInstance, MessageAttributes>('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderType: {
    type: DataTypes.ENUM('user', 'ai', 'bot'),
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
});

// Tag model
interface TagAttributes {
  id: number;
  name: string;
  userId: number;
  color: string;
}

interface TagCreationAttributes extends Optional<TagAttributes, 'id'> {}

export interface TagInstance extends Model<TagAttributes, TagCreationAttributes>, TagAttributes {}

export const Tag = sequelize.define<TagInstance, TagAttributes>('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#007bff',
  },
});

// GroupMember model for managing group membership
interface GroupMemberAttributes {
  id: number;
  conversationId: number;
  userId?: number;
  memberType: 'human' | 'bot';
  botType?: string;
}

interface GroupMemberCreationAttributes extends Optional<GroupMemberAttributes, 'id'> {}

export interface GroupMemberInstance extends Model<GroupMemberAttributes, GroupMemberCreationAttributes>, GroupMemberAttributes {}

export const GroupMember = sequelize.define<GroupMemberInstance, GroupMemberAttributes>('GroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Conversation,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  memberType: {
    type: DataTypes.ENUM('human', 'bot'),
    allowNull: false,
  },
  botType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// ConversationTag junction table for many-to-many relationship
export const ConversationTag = sequelize.define('ConversationTag', {
  conversationId: {
    type: DataTypes.INTEGER,
    references: {
      model: Conversation,
      key: 'id',
    },
    onDelete: 'CASCADE',
    primaryKey: true,
  },
  tagId: {
    type: DataTypes.INTEGER,
    references: {
      model: Tag,
      key: 'id',
    },
    onDelete: 'CASCADE',
    primaryKey: true,
  },
});

// Define associations
User.hasMany(Conversation, { foreignKey: 'userId' });
Conversation.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Tag, { foreignKey: 'userId' });
Tag.belongsTo(User, { foreignKey: 'userId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Conversation.hasMany(GroupMember, { foreignKey: 'conversationId' });
GroupMember.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(GroupMember, { foreignKey: 'userId' });
GroupMember.belongsTo(User, { foreignKey: 'userId' });

Conversation.belongsToMany(Tag, { through: ConversationTag, foreignKey: 'conversationId' });
Tag.belongsToMany(Conversation, { through: ConversationTag, foreignKey: 'tagId' });

// Associate messages with users for human messages
Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });