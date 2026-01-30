import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface GroupMember {
  id: number;
  conversationId: number;
  userId?: number;
  memberType: 'human' | 'bot';
  botType?: string;
  createdAt: string;
  User?: User;
}

interface Message {
  id: number;
  content: string;
  senderType: 'user' | 'ai' | 'bot';
  senderId?: number;
  conversationId: number;
  createdAt: string;
}

interface Tag {
  id: number;
  name: string;
  userId: number;
  color: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  userId: number;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  Messages?: Message[];
  Tags?: Tag[];
  GroupMembers?: GroupMember[];
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as Conversation[],
    currentConversation: null as Conversation | null,
    messages: [] as Message[],
    tags: [] as Tag[],
    pollingInterval: null as number | null,
  }),

  actions: {
    async loadConversations() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get('/api/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Loaded conversations:', response.data);
        this.conversations = response.data;
        return response.data;
      } catch (error: any) {
        console.error('Failed to load conversations:', error);
        throw error;
      }
    },

    async loadConversation(id: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get(`/api/conversations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.currentConversation = response.data;
        
        // Also load messages for this conversation
        await this.loadMessages(id);
        
        // Start polling for group conversations
        if (response.data.isGroup) {
          this.startPolling(id);
        }
        
        return response.data;
      } catch (error: any) {
        console.error('Failed to load conversation:', error);
        throw error;
      }
    },

    async loadMessages(conversationId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get(`/api/messages/${conversationId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.messages = response.data;
        return response.data;
      } catch (error: any) {
        console.error('Failed to load messages:', error);
        throw error;
      }
    },

    async sendMessage(content: string, conversationId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          '/api/messages',
          {
            content,
            conversationId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the current conversation's message list
        if (this.currentConversation && this.currentConversation.id === conversationId) {
          this.messages.push(response.data.userMessage);
          
          // Poll for new messages after a delay to get AI/bot responses
          setTimeout(async () => {
            await this.loadMessages(conversationId);
          }, 1500);
        }

        return response.data;
      } catch (error: any) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },

    async createConversation(title: string, isGroup: boolean) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          '/api/conversations',
          {
            title,
            isGroup,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.conversations.push(response.data);
        return response.data;
      } catch (error: any) {
        console.error('Failed to create conversation:', error);
        throw error;
      }
    },

    async updateConversationTitle(id: number, title: string) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.put(
          `/api/conversations/${id}`,
          { title },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update in local list
        const index = this.conversations.findIndex(conv => conv.id === id);
        if (index !== -1) {
          this.conversations[index] = response.data;
        }

        // Update current conversation if it matches
        if (this.currentConversation && this.currentConversation.id === id) {
          this.currentConversation = response.data;
        }

        return response.data;
      } catch (error: any) {
        console.error('Failed to update conversation title:', error);
        throw error;
      }
    },

    async deleteConversation(id: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        await axios.delete(`/api/conversations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from local list
        this.conversations = this.conversations.filter(conv => conv.id !== id);

        // Clear current conversation if deleted
        if (this.currentConversation && this.currentConversation.id === id) {
          this.currentConversation = null;
          this.messages = [];
        }
      } catch (error: any) {
        console.error('Failed to delete conversation:', error);
        throw error;
      }
    },

    async loadTags() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get('/api/tags', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.tags = response.data;
        return response.data;
      } catch (error: any) {
        console.error('Failed to load tags:', error);
        throw error;
      }
    },

    async createTag(name: string, color: string) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          '/api/tags',
          {
            name,
            color,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.tags.push(response.data);
        return response.data;
      } catch (error: any) {
        console.error('Failed to create tag:', error);
        throw error;
      }
    },

    async addTagToConversation(conversationId: number, tagId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          `/api/conversations/${conversationId}/tags`,
          {
            tagId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error('Failed to add tag to conversation:', error);
        throw error;
      }
    },

    async removeTagFromConversation(conversationId: number, tagId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.delete(
          `/api/conversations/${conversationId}/tags`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: { tagId }
          }
        );

        return response.data;
      } catch (error: any) {
        console.error('Failed to remove tag from conversation:', error);
        throw error;
      }
    },

    async getConversationsByTag(tagId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.get(`/api/tags/${tagId}/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return response.data;
      } catch (error: any) {
        console.error('Failed to get conversations by tag:', error);
        throw error;
      }
    },

    async addHumanToGroup(conversationId: number, userId: number) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          `/api/conversations/${conversationId}/members`,
          {
            memberId: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error('Failed to add member to group:', error);
        throw error;
      }
    },

    async addBotToGroup(conversationId: number, botType: string) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        const response = await axios.post(
          `/api/conversations/${conversationId}/bots`,
          {
            botType: botType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error('Failed to add bot to group:', error);
        throw error;
      }
    },

    async getUsers() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token available');
        }

        // Try multiple potential user endpoints
        const endpoints = [
          '/api/users',
          '/api/auth/users',
          '/api/user/list',
          '/api/users/list'
        ];

        for (const endpoint of endpoints) {
          try {
            const response = await axios.get(endpoint, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.data) {
              console.log(`Successfully fetched users from ${endpoint}`);
              return response.data;
            }
          } catch (endpointError) {
            console.debug(`Endpoint ${endpoint} not available:`, endpointError.message);
            // Continue to next endpoint
          }
        }

        // If all endpoints fail, return an empty array instead of throwing
        console.warn('No user endpoints available, returning empty array');
        return [];
      } catch (error: any) {
        console.error('Failed to fetch users from all endpoints:', error);
        return []; // Return empty array instead of throwing to allow graceful degradation
      }
    },

    setCurrentConversation(conversation: Conversation | null) {
      this.currentConversation = conversation;
    },

    startPolling(conversationId: number) {
      this.stopPolling();
      this.pollingInterval = window.setInterval(async () => {
        try {
          await this.loadMessages(conversationId);
        } catch (error) {
          console.error('Error polling messages:', error);
        }
      }, 1000);
    },

    stopPolling() {
      if (this.pollingInterval !== null) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
  },
});