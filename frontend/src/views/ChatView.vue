<template>
  <div class="chat-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Conversations</h3>
        <button @click="showNewConversationForm = true" class="btn btn-primary">
          + New
        </button>
      </div>
      
      <ul class="conversation-list">
        <li 
          v-for="conversation in chatStore.conversations" 
          :key="conversation.id"
          :class="['conversation-item', { active: chatStore.currentConversation?.id === conversation.id }]"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-title">
            <span v-if="editingId !== conversation.id">{{ conversation.title }}</span>
            <input
              v-else
              v-model="editTitle"
              @keyup.enter="saveTitle(conversation)"
              @blur="saveTitle(conversation)"
              class="edit-title-input"
              @click.stop
            />
            <span v-if="conversation.isGroup" class="group-indicator">👥</span>
          </div>
          <div class="conversation-actions">
            <button @click.stop="startEdit(conversation)" class="action-btn edit-btn">✏️</button>
            <button @click.stop="deleteConversation(conversation.id)" class="action-btn delete-btn">🗑️</button>
          </div>
          <div v-if="conversation.Messages && conversation.Messages.length > 0" class="conversation-preview">
            {{ conversation.Messages.slice(-1)[0]?.content?.substring(0, 50) }}...
          </div>
          <div v-if="conversation.Tags && conversation.Tags.length > 0" class="tags-container">
          <span 
            v-for="tag in conversation.Tags" 
            :key="tag.id"
            class="tag"
            :style="{ backgroundColor: tag.color }"
            @click.stop="filterByTag(tag.id)"
            :title="`Filter by ${tag.name}`"
          >
            {{ tag.name.substring(0, 8) }}
          </span>
        </div>
        </li>
      </ul>
      
      <div class="tags-section">
        <h4>Tags</h4>
        <div class="tags-list">
          <div 
            v-for="tag in chatStore.tags" 
            :key="tag.id" 
            class="tag-item"
            :style="{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}` }"
          >
            <span>{{ tag.name }}</span>
            <div class="tag-actions">
              <button 
                v-if="chatStore.currentConversation" 
                @click="addTagToCurrentConversation(tag.id)" 
                class="action-btn tag-add-btn"
                :disabled="isTagAlreadyAdded(tag.id)"
                :title="isTagAlreadyAdded(tag.id) ? 'Tag already added' : 'Add to current conversation'"
              >+
              </button>
              <button 
                v-if="chatStore.currentConversation && chatStore.currentConversation.Tags && chatStore.currentConversation.Tags.some(t => t.id === tag.id)" 
                @click="removeTagFromCurrentConversation(tag.id)" 
                class="action-btn tag-remove-btn"
                title="Remove from current conversation"
              >-
              </button>
            </div>
          </div>
        </div>
        <div v-if="chatStore.tags.length === 0" class="no-tags">
          No tags yet. Create one to get started!
        </div>
        <button v-if="chatStore.currentConversation" @click="showTagForm = !showTagForm" class="btn btn-secondary">
          {{ showTagForm ? 'Cancel' : '+ New Tag' }}
        </button>
        
        <!-- Tag creation form -->
        <div v-if="showTagForm && chatStore.currentConversation" class="tag-form">
          <input 
            v-model="newTagName" 
            placeholder="Tag name" 
            class="form-input"
            @keyup.enter="createTag"
          />
          <input 
            v-model="newTagColor" 
            type="color" 
            class="color-picker"
          />
          <button @click="createTag" class="btn btn-primary">Create</button>
        </div>
        
        <!-- Quick tag selector for current conversation -->
        <div v-if="chatStore.currentConversation" class="quick-tag-selector">
          <template v-if="!chatStore.currentConversation.isGroup">
            <label>Add existing tag:</label>
            <select v-model="selectedQuickTag" class="form-input">
              <option value="">Choose a tag...</option>
              <option 
                v-for="tag in getAvailableTagsForConversation()" 
                :key="'qv-' + tag.id" 
                :value="tag.id"
              >
                {{ tag.name }}
              </option>
            </select>
            <button 
              @click="addSelectedTagToCurrentConversation" 
              class="btn btn-secondary"
              :disabled="!selectedQuickTag"
            >
              Add
            </button>
          </template>
          <div v-else class="group-tag-notice">
            <p>Tags are only available for individual conversations, not group chats.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Chat Area -->
    
    <div class="chat-area">
      <div class="chat-header">
        <div class="header-left">
          <button @click="goToDashboard" class="btn btn-secondary btn-back">
            ← Back to Dashboard
          </button>
          <h2>{{ chatStore.currentConversation?.title || 'Select a conversation' }}</h2>
        </div>
      
        <div v-if="chatStore.currentConversation" class="group-info">
          <span v-if="chatStore.currentConversation.isGroup">Group Chat</span>
          <span v-else>Individual Chat</span>
          <span v-if="chatStore.currentConversation.GroupMembers">
            ({{ chatStore.currentConversation.GroupMembers?.length }} participants)
          </span>
          <button @click="showAddMemberForm = !showAddMemberForm" class="btn btn-secondary btn-sm">Add Human</button>
          <button v-if="chatStore.currentConversation.isGroup" @click="showAddBotForm = !showAddBotForm" class="btn btn-secondary btn-sm">Add Bot</button>
          
          <!-- Members List -->
          <div v-if="chatStore.currentConversation && chatStore.currentConversation.GroupMembers && showMembersList" class="members-list">
            <h4>Members:</h4>
            <div 
              v-for="member in chatStore.currentConversation.GroupMembers" 
              :key="member.id"
              class="member-item"
            >
              <span v-if="member.memberType === 'human'">
                <span v-if="member.User">{{ member.User.username }}</span>
                <span v-else>User {{ member.userId }}</span>
              </span>
              <span v-else-if="member.memberType === 'bot'">
                {{ member.botType || 'Bot' }} (Bot)
              </span>
            </div>
          </div>
          <button 
            @click="showMembersList = !showMembersList" 
            class="btn btn-secondary btn-sm toggle-members-btn"
          >
            {{ showMembersList ? 'Hide Members' : 'Show Members' }}
          </button>
          
          <div v-if="showAddMemberForm" class="add-member-form">
            <select v-model="selectedUserId" class="form-input">
              <option value="">Select a user to add</option>
              <option 
                v-for="user in availableUsers" 
                :key="user.id" 
                :value="user.id"
              >
                {{ user.username }} (ID: {{ user.id }})
              </option>
              <option v-if="availableUsers.length === 0" value="" disabled>
                No available users to add
              </option>
            </select>
            <button 
              @click="addMemberToGroup" 
              class="btn btn-primary"
              :disabled="!selectedUserId"
            >
              Add
            </button>
            <button @click="showAddMemberForm = false" class="btn btn-secondary">Cancel</button>
          </div>
          <div v-if="showAddBotForm" class="add-bot-form">
            <select v-model="botTypeToAdd" class="form-input">
              <option value="">Select bot type</option>
              <option value="customer_service">Customer Service</option>
              <option value="technical">Technical Support</option>
              <option value="humor">Humor</option>
            </select>
            <button @click="addBotToGroup" class="btn btn-primary">Add Bot</button>
            <button @click="showAddBotForm = false" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
      
      <div v-if="!chatStore.currentConversation" class="no-conversation">
        <p>Select a conversation to start chatting</p>
      </div>
      
      <div 
        v-if="chatStore.currentConversation" 
        class="messages-container"
      >
        <div 
          v-for="message in chatStore.messages" 
          :key="message.id"
          :class="['message', message.senderType]"
        >
          <div class="message-content">
            <strong v-if="message.senderType !== 'user'">
              {{ getSenderName(message) }}:
            </strong>
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.createdAt) }}
          </div>
        </div>
      </div>
      
      <div 
        v-if="chatStore.currentConversation" 
        class="message-input-container"
      >
        <textarea
          v-model="newMessage"
          @keydown.enter="sendMessage"
          placeholder="Type your message..."
          class="message-input"
        ></textarea>
        <button @click="sendMessage" class="send-button">
          ➤
        </button>
      </div>
    </div>
    
    <!-- New Conversation Modal -->
    <div v-if="showNewConversationForm" class="modal-overlay" @click="showNewConversationForm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Conversation</h3>
          <button class="close-btn" @click="showNewConversationForm = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="conversation-title">Title:</label>
            <input 
              id="conversation-title" 
              v-model="newConversationTitle" 
              placeholder="Enter conversation title..." 
              class="form-input"
              @keyup.enter="createNewConversation"
              ref="titleInputRef"
            />
          </div>
          <div class="form-group">
            <label>Conversation Type:</label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="newConversationType" 
                  value="individual"
                  checked
                />
                Individual
              </label>
              <label class="radio-option">
                <input 
                  type="radio" 
                  v-model="newConversationType" 
                  value="group"
                />
                Group
              </label>
            </div>
          </div>
          
          <!-- Bot selection for group conversations -->
          <div v-if="newConversationType === 'group'" class="form-group">
            <label>Add Bots:</label>
            <div class="bot-selection">
              <div 
                v-for="botRole in botRoles" 
                :key="botRole.type"
                class="bot-option"
              >
                <label>
                  <input 
                    type="checkbox" 
                    v-model="selectedBotRoles"
                    :value="botRole.type"
                  />
                  {{ botRole.name }}
                  <small>{{ botRole.personality }}</small>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showNewConversationForm = false" class="btn btn-secondary">Cancel</button>
            <button @click="createNewConversation" class="btn btn-primary">Create</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();

const newMessage = ref('');
const showTagForm = ref(false);
const newTagName = ref('');
const newTagColor = ref('#4a6cf7');
const editingId = ref<number | null>(null);
const editTitle = ref('');
const showAddMemberForm = ref(false);
const memberToAddId = ref<number | null>(null);
const memberToAddIdText = ref<string>('');
const selectedUserId = ref<number | null>(null);
const availableUsers = ref<any[]>([]);
const showAddBotForm = ref(false);
const botTypeToAdd = ref('');
const showMembersList = ref(false);
const selectedQuickTag = ref('');
const showNewConversationForm = ref(false);
const newConversationTitle = ref('');
const newConversationType = ref('individual'); // Default to individual
const titleInputRef = ref<HTMLInputElement | null>(null);
const botRoles = ref<any[]>([]);
const selectedBotRoles = ref<string[]>([]);

onMounted(async () => {
  // First, make sure user is authenticated
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  try {
    // Try to fetch user data only if needed
    if (!authStore.user) {
      await authStore.fetchCurrentUser();
    }
    
    await Promise.all([
      chatStore.loadConversations(),
      chatStore.loadTags()
    ]);
    
    await loadBotRoles();
    
    // Load specific conversation if ID is provided in route
    if (route.params.id) {
      await chatStore.loadConversation(Number(route.params.id));
    }
  } catch (error: any) {
    console.error('Error in ChatView:', error);
    // Check if there's an authentication issue
    if (error.name === 'AuthError' || 
        (error.response && error.response.status === 401)) {
      authStore.logout();
      router.push('/login');
    }
  }
});

onUnmounted(() => {
  // Stop polling when leaving the chat view
  if (chatStore.stopPolling) {
    chatStore.stopPolling();
  }
});

// Focus the title input when the modal is shown
watch(showNewConversationForm, async (newValue) => {
  if (newValue) {
    // Wait for the DOM to update before focusing
    await nextTick();
    if (titleInputRef.value) {
      titleInputRef.value.focus();
    }
  } else {
    // Reset form when closing
    newConversationTitle.value = '';
    newConversationType.value = 'individual';
  }
});

// Focus the title input when the modal is shown
watch(showNewConversationForm, async (newValue) => {
  if (newValue) {
    // Wait for the DOM to update before focusing
    await nextTick();
    if (titleInputRef.value) {
      titleInputRef.value.focus();
    }
  } else {
    // Reset form when closing
    newConversationTitle.value = '';
    newConversationType.value = 'individual';
  }
});

// Watch for route changes to load new conversation
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await chatStore.loadConversation(Number(newId));
  }
});

const selectConversation = async (conversation: any) => {
  await chatStore.loadConversation(conversation.id);
};

const startEdit = (conversation: any) => {
  editingId.value = conversation.id;
  editTitle.value = conversation.title;
};

const saveTitle = async (conversation: any) => {
  if (editTitle.value && editTitle.value !== conversation.title) {
    try {
      console.log('Updating conversation title:', editTitle.value);
      await chatStore.updateConversationTitle(conversation.id, editTitle.value);
      console.log('Title updated successfully');
      await chatStore.loadConversations(); // Refresh the list
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      editTitle.value = conversation.title; // Revert on error
      alert('Failed to update title: ' + (error as Error).message);
    }
  }
  editingId.value = null;
  editTitle.value = '';
};

const deleteConversation = async (id: number) => {
  if (confirm('Are you sure you want to delete this conversation?')) {
    try {
      console.log('Attempting to delete conversation with ID:', id);
      await chatStore.deleteConversation(id);
      console.log('Conversation deleted successfully');
      await chatStore.loadConversations(); // Refresh the list
      
      // If the deleted conversation was the current one, clear it
      if (chatStore.currentConversation?.id === id) {
        chatStore.setCurrentConversation(null as any);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation: ' + (error as Error).message);
    }
  }
};

// Filter conversations by tag - navigate to dashboard view to show filtered conversations
const filterByTag = async (tagId: number) => {
  try {
    // Navigate to dashboard with tag filter
    // We'll pass the tagId as a query parameter
    router.push({ path: '/', query: { tag: tagId.toString() } });
  } catch (error) {
    console.error('Failed to filter conversations by tag:', error);
  }
};

// Add tag to current conversation
const addTagToCurrentConversation = async (tagId: number) => {
  if (!chatStore.currentConversation) {
    alert('Please select a conversation first');
    return;
  }
  
  try {
    await chatStore.addTagToConversation(chatStore.currentConversation.id, tagId);
    alert('Tag added successfully!');
  } catch (error) {
    console.error('Failed to add tag to conversation:', error);
    alert('Failed to add tag: ' + (error as Error).message);
  }
};

// Remove tag from current conversation
const removeTagFromCurrentConversation = async (tagId: number) => {
  if (!chatStore.currentConversation) {
    alert('Please select a conversation first');
    return;
  }
  
  try {
    await chatStore.removeTagFromConversation(chatStore.currentConversation.id, tagId);
    alert('Tag removed successfully!');
  } catch (error) {
    console.error('Failed to remove tag from conversation:', error);
    alert('Failed to remove tag: ' + (error as Error).message);
  }
};

// Load available bot roles
const loadBotRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/conversations/bots/roles', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      botRoles.value = data;
    } else {
      console.error('Failed to load bot roles');
    }
  } catch (error) {
    console.error('Error loading bot roles:', error);
  }
};

const createNewConversation = async () => {
  if (!newConversationTitle.value.trim()) {
    alert('Please enter a conversation title');
    return;
  }
  
  // Validate at least one bot is selected for group conversations
  const isGroup = newConversationType.value === 'group';
  if (isGroup && selectedBotRoles.value.length === 0) {
    alert('Please select at least one bot for group conversation');
    return;
  }
  
  try {
    console.log('Creating conversation with isGroup:', isGroup, 'newConversationType:', newConversationType.value);
    const newConv = await chatStore.createConversation(newConversationTitle.value, isGroup);
    console.log('Created conversation:', newConv);
    
    // Add selected bots to group conversation
    if (isGroup && selectedBotRoles.value.length > 0) {
      for (const botType of selectedBotRoles.value) {
        await chatStore.addBotToGroup(newConv.id, botType);
      }
    }
    
    await chatStore.loadConversations(); // Refresh list
    // Close the modal
    showNewConversationForm.value = false;
    // Reset selected bot roles
    selectedBotRoles.value = [];
    // Navigate to the new conversation
    router.push(`/chat/${newConv.id}`);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    alert('Failed to create conversation: ' + (error as Error).message);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatStore.currentConversation) return;
  
  try {
    await chatStore.sendMessage(newMessage.value, chatStore.currentConversation.id);
    newMessage.value = '';
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

const createTag = async () => {
  if (!newTagName.value.trim()) return;
  
  try {
    await chatStore.createTag(newTagName.value, newTagColor.value);
    newTagName.value = '';
    newTagColor.value = '#4a6cf7';
    showTagForm.value = false;
  } catch (error) {
    console.error('Failed to create tag:', error);
  }
};

const getSenderName = (message: any) => {
  if (message.senderType === 'user') {
    // Find the authenticated user's ID from auth store to compare
    const authStore = useAuthStore();
    
    if (message.senderId) {
      // Compare with current user ID from auth store
      if (authStore.user && authStore.user.id === message.senderId) {
        return 'You'; // Current logged-in user
      }
      
      if (chatStore.currentConversation && chatStore.currentConversation.GroupMembers) {
        // Look for the user in group members
        const groupUser = chatStore.currentConversation.GroupMembers.find(
          (gm: any) => gm.userId === message.senderId && gm.memberType === 'human'
        );
        
        if (groupUser && groupUser.User) {
          return groupUser.User.username;
        }
        return `User ${message.senderId}`;
      }
      return `User ${message.senderId}`;
    }
    
    // If no senderId but still a user message, it's likely the current user
    return 'You';
  }
  
  if (message.senderType === 'ai') return 'Assistant';
  
  if (message.senderType === 'bot') {
    // For bot messages, find the specific bot using the senderId which now corresponds to GroupMember id
    if (chatStore.currentConversation && chatStore.currentConversation.GroupMembers && message.senderId) {
      const botMember = chatStore.currentConversation.GroupMembers.find(
        (gm: any) => gm.id === message.senderId && gm.memberType === 'bot'
      );
      
      if (botMember && botMember.botType) {
        return `${botMember.botType.charAt(0).toUpperCase() + botMember.botType.slice(1)} (Bot)`;
      }
    }
    
    // Fallback: if we can't find the specific bot, return a generic label
    return 'Bot (AI)';
  }
  
  return 'System';
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const addMemberToGroup = async () => {
  if (!chatStore.currentConversation || !selectedUserId.value) {
    return;
  }

  try {
    await chatStore.addHumanToGroup(chatStore.currentConversation.id, selectedUserId.value);
    showAddMemberForm.value = false;
    selectedUserId.value = null;
    alert(`Successfully added user to the conversation!`);
    
    // Reload the conversation to update the member list immediately
    await chatStore.loadConversation(chatStore.currentConversation.id);
    
    // Update the conversation in the conversations list
    const updatedConversation = chatStore.currentConversation;
    const index = chatStore.conversations.findIndex(c => c.id === updatedConversation.id);
    if (index !== -1) {
      chatStore.conversations[index] = updatedConversation;
    }
  } catch (error) {
    console.error('Failed to add member to group:', error);
    alert('Failed to add member to group: ' + (error as Error).message);
  }
};

const addBotToGroup = async () => {
  if (!chatStore.currentConversation || !botTypeToAdd.value) {
    return;
  }

  try {
    const response = await fetch(`/api/conversations/${chatStore.currentConversation.id}/bots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ botType: botTypeToAdd.value })
    });

    if (!response.ok) {
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to add bot to group';
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
        }
      } else {
        // If it's not JSON, it might be an HTML error page
        const errorText = await response.text();
        console.error('Non-JSON error response:', errorText);
        errorMessage = 'Server error occurred';
      }
      
      throw new Error(errorMessage);
    }

    // Check if the response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let result = {};
    
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      // If the response is not JSON, just get the text
      const responseText = await response.text();
      console.warn('Non-JSON response received:', responseText);
    }
    
    showAddBotForm.value = false;
    const addedBotType = botTypeToAdd.value;
    botTypeToAdd.value = '';
    alert(`Successfully added ${addedBotType} bot to the group!`);
    
    // Reload the conversation to update the member list immediately
    await chatStore.loadConversation(chatStore.currentConversation.id);
    
    // Update the conversation in the conversations list
    const updatedConversation = chatStore.currentConversation;
    const index = chatStore.conversations.findIndex(c => c.id === updatedConversation.id);
    if (index !== -1) {
      chatStore.conversations[index] = updatedConversation;
    }
  } catch (error) {
    console.error('Failed to add bot to group:', error);
    alert('Failed to add bot to group: ' + (error as Error).message);
  }
};

const loadAvailableUsers = async () => {
  try {
    const authStore = useAuthStore();
    const currentUser = authStore.user;

    // First, try to get users from chatStore method (which tries multiple endpoints)
    const apiUsers = await chatStore.getUsers();
    console.log('Users from API endpoints:', apiUsers);
    
    if (apiUsers && apiUsers.length > 0) {
      // Filter out the current user and users already in the group
      if (chatStore.currentConversation?.GroupMembers) {
        const groupMembers = chatStore.currentConversation.GroupMembers;
        const memberUserIds = groupMembers
          .filter((member: any) => member.memberType === 'human')
          .map((member: any) => member.userId);

        availableUsers.value = apiUsers.filter((user: any) =>
          user.id !== currentUser?.id && !memberUserIds.includes(user.id)
        );
      } else {
        availableUsers.value = apiUsers.filter((user: any) =>
          user.id !== currentUser?.id
        );
      }
      
      console.log('Set available users from API:', availableUsers.value);
      return; // Successfully loaded users
    }

    // If API endpoints return no users, ensure conversations are loaded with detailed info
    try {
      // Reload current conversation to ensure it has complete data including GroupMembers
      if (chatStore.currentConversation?.id) {
        await chatStore.loadConversation(chatStore.currentConversation.id);
      }
      // Reload all conversations to ensure they have complete data
      await chatStore.loadConversations();
    } catch (reloadError) {
      console.debug('Could not reload conversations for user data extraction:', reloadError.message);
    }

    // Collect all possible users from current conversation and all conversations
    const allUsersMap = new Map<number, {id: number, username: string}>();

    // First, collect from current conversation's group members
    if (chatStore.currentConversation?.GroupMembers) {
      for (const member of chatStore.currentConversation.GroupMembers) {
        if (member.memberType === 'human' && member.User) {
          const userId = member.userId || member.User.id;
          const userName = member.User.username || member.User.name || `User ${userId}`;
          
          if (!allUsersMap.has(userId)) {
            allUsersMap.set(userId, {
              id: userId,
              username: userName
            });
          }
        }
      }
    }

    // Then, collect from all conversations' group members and messages
    if (chatStore.conversations && chatStore.conversations.length > 0) {
      for (const conversation of chatStore.conversations) {
        // Check GroupMembers for human users in group conversations
        if (conversation.GroupMembers) {
          for (const member of conversation.GroupMembers) {
            if (member.memberType === 'human' && member.User) {
              const userId = member.userId || member.User.id;
              const userName = member.User.username || member.User.name || `User ${userId}`;
              
              if (!allUsersMap.has(userId)) {
                allUsersMap.set(userId, {
                  id: userId,
                  username: userName
                });
              }
            }
          }
        }
        
        // Check Messages for sender information
        if (conversation.Messages) {
          for (const message of conversation.Messages) {
            if (message.senderType === 'user' && message.senderId) {
              let username = `User ${message.senderId}`;
              
              if (message.senderName) {
                username = message.senderName;
              } else if (currentUser && message.senderId === currentUser.id) {
                username = currentUser.username || `User ${message.senderId}`;
              }
              
              if (!allUsersMap.has(message.senderId)) {
                allUsersMap.set(message.senderId, {
                  id: message.senderId,
                  username: username
                });
              }
            }
          }
        }
      }
    }

    // Convert map to array and filter
    const allDiscoveredUsers = Array.from(allUsersMap.values());

    // Define alreadyInGroup function
    const alreadyInGroup = (userId: number) => {
      if (!chatStore.currentConversation?.GroupMembers) return false;
      return chatStore.currentConversation.GroupMembers
        .filter((member: any) => member.memberType === 'human')
        .some((member: any) => member.userId === userId);
    };

    // Filter for users that are not the current user and not already in the group
    const filteredUsers = allDiscoveredUsers.filter(user => {
      const isCurrentUser = user.id === currentUser?.id;
      const isInGroup = alreadyInGroup(user.id);
      return !isCurrentUser && !isInGroup;
    });

    // Set the available users from our internal collection
    availableUsers.value = filteredUsers;
    console.log('Set available users from conversation data:', filteredUsers);

    // If still no users found, provide some demo/test users as a last resort
    if (availableUsers.value.length === 0) {
      // Generate some demo users based on common patterns
      const demoUsers = [
        { id: 999, username: 'Demo User 1' },
        { id: 998, username: 'Test User 2' },
        { id: 997, username: 'Sample User 3' }
      ];
      
      // Filter out current user and users already in group (if any)
      const filteredDemoUsers = demoUsers.filter(user => {
        const isCurrentUser = user.id === currentUser?.id;
        const isInGroup = chatStore.currentConversation?.GroupMembers && chatStore.currentConversation.GroupMembers
          .filter((member: any) => member.memberType === 'human')
          .some((member: any) => member.userId === user.id);
        return !isCurrentUser && !isInGroup;
      });
      
      availableUsers.value = filteredDemoUsers;
      console.log('Set demo users as fallback:', filteredDemoUsers);
    }
  } catch (error) {
    console.error('Error preparing user list:', error);
    // In case of error, set to an empty array so the UI still works
    availableUsers.value = [];
  }
};

// Check if a tag is already added to the current conversation
const isTagAlreadyAdded = (tagId: number) => {
  console.log('isTagAlreadyAdded called with tagId:', tagId);
  console.log('currentConversation:', chatStore.currentConversation);
  console.log('currentConversation.Tags:', chatStore.currentConversation?.Tags);
  if (!chatStore.currentConversation || !chatStore.currentConversation.Tags) return false;
  const result = chatStore.currentConversation.Tags.some((t: any) => t.id === tagId);
  console.log('isTagAlreadyAdded result:', result);
  return result;
};

// Helper function to get available tags that aren't already added to the current conversation
const getAvailableTagsForConversation = () => {
  if (!chatStore.currentConversation || !chatStore.currentConversation.Tags) return chatStore.tags;
  const addedTagIds = chatStore.currentConversation.Tags.map((t: any) => t.id);
  return chatStore.tags.filter((tag: any) => !addedTagIds.includes(tag.id));
};

// Add selected tag to current conversation via quick selector
const addSelectedTagToCurrentConversation = async () => {
  if (!selectedQuickTag.value) return;
  
  try {
    await addTagToCurrentConversation(parseInt(selectedQuickTag.value));
    selectedQuickTag.value = ''; // Reset selection
  } catch (error) {
    console.error('Failed to add selected tag to conversation:', error);
  }
};

// Navigate back to dashboard
const goToDashboard = () => {
  router.push('/');
};

// Watch for changes to showAddMemberForm to load users when the form is shown
watch(showAddMemberForm, async (newValue) => {
  if (newValue) {
    // Make sure we have the latest conversation data before loading users
    if (chatStore.currentConversation?.id) {
      await chatStore.loadConversation(chatStore.currentConversation.id);
    }
    await loadAvailableUsers();
  }
});

// Stop polling when leaving the chat view
onUnmounted(() => {
  chatStore.stopPolling();
});
</script>

<style scoped>
.chat-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #ffffff, #f8fafd);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.group-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: #666;
}

.members-list {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.member-item {
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #333;
  border-bottom: 1px dashed #e2e8f0;
}

.member-item:last-child {
  border-bottom: none;
}

.add-member-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px dashed #cbd5e0;
}

.add-bot-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px dashed #cbd5e0;
}

.form-input {
  padding: 0.6rem 0.9rem;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  background-color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.toggle-members-btn {
  margin-left: 0.5rem;
}

.no-conversation {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #718096;
  font-size: 1.2rem;
}

.messages-container {
  flex: 1;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.message {
  max-width: 80%;
  padding: 1rem 1.3rem;
  border-radius: 18px;
  line-height: 1.5;
  position: relative;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.message.ai, .message.bot {
  align-self: flex-start;
  background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
  color: #333;
  border-bottom-left-radius: 5px;
  border: 1px solid #e1e5f2;
}

.message-content {
  word-break: break-word;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.3rem;
  text-align: right;
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #edf2f7;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.conversation-item {
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
  border: 1px solid #eef1f9;
  background: white;
  transition: all 0.2s ease;
}

.conversation-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.conversation-actions {
  display: flex;
  gap: 0.3rem;
  justify-content: flex-end;
}

.action-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.edit-btn {
  color: #007bff;
}

.delete-btn {
  color: #dc3545;
}

.edit-title-input {
  width: 100%;
  padding: 0.2rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
}

.conversation-item:hover {
  background: linear-gradient(to right, #f0f4ff, #f5f7ff);
  border-color: #d0d8f0;
  transform: translateX(3px);
}

.conversation-item.active {
  background: linear-gradient(to right, #e6eeff, #e0e8ff);
  border-color: #a8bffa;
  color: #4a6cf7;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(74, 108, 247, 0.15);
}

.conversation-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-indicator {
  font-size: 0.8rem;
}

.conversation-preview {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.3rem;
}

.tags-section {
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px solid #edf2f7;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.tag-item {
  padding: 0.3rem 0.6rem;
  border-radius: 16px;
  font-size: 0.8rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid #cbd5e0;
  transition: all 0.2s;
}

.tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.tag-actions {
  display: flex;
  gap: 0.2rem;
}

.action-btn.tag-add-btn, .action-btn.tag-remove-btn {
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.action-btn.tag-add-btn {
  background-color: #28a745;
  color: white;
}

.action-btn.tag-add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-btn.tag-remove-btn {
  background-color: #dc3545;
  color: white;
}

.tag-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.6rem;
  padding: 0.8rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px dashed #cbd5e0;
}

.color-picker {
  width: 50px;
  height: 35px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.quick-tag-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #edf2f7;
}

.quick-tag-selector label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.group-tag-notice {
  padding: 0.8rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  text-align: center;
}

.group-tag-notice p {
  margin: 0;
  font-size: 0.85rem;
  color: #856404;
  line-height: 1.4;
}

.chat-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
}

.btn-back:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.7), rgba(106, 17, 203, 0.7));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  animation: modalAppear 0.3s ease-out;
  border: 1px solid rgba(74, 108, 247, 0.2);
  overflow: hidden;
}

@keyframes modalAppear {
  from { opacity: 0; transform: scale(0.9) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.8rem 1.8rem 0 1.8rem;
  background: linear-gradient(to right, #ffffff, #f8fafd);
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.4rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #a0aec0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  font-weight: normal;
}

.close-btn:hover {
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 1.8rem 1.8rem 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background-color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
  transform: translateY(-2px);
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.bot-selection {
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.bot-option {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.bot-option:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.bot-option label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
}

.bot-option input[type="checkbox"] {
  margin-top: 0.25rem;
}

.bot-option small {
  display: block;
  margin-top: 0.25rem;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.3;
}

.radio-option:hover {
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 1.8rem;
  background: linear-gradient(to right, #f8fafd, #ffffff);
  border-top: 1px solid #edf2f7;
  margin-top: 0.5rem;
}

/* Button styles matching the app theme */
.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  color: white;
  box-shadow: 0 6px 15px rgba(74, 108, 247, 0.4);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #3a5ce5 0%, #5a0db9 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(74, 108, 247, 0.5);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
}
</style>


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(74, 108, 247, 0.7), rgba(106, 17, 203, 0.7));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  animation: modalAppear 0.3s ease-out;
  border: 1px solid rgba(74, 108, 247, 0.2);
  overflow: hidden;
}

@keyframes modalAppear {
  from { opacity: 0; transform: scale(0.9) translateY(-20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.8rem 1.8rem 0 1.8rem;
  background: linear-gradient(to right, #ffffff, #f8fafd);
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.4rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #a0aec0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  font-weight: normal;
}

.close-btn:hover {
  background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
  color: white;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 1.8rem 1.8rem 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background-color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
  transform: translateY(-2px);
}

.radio-group {
  display: flex;
  gap: 1.8rem;
  margin-top: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.radio-option:hover {
  background: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.radio-option input[type="radio"] {
  width: 18px;
  height: 18px;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 1.8rem;
  background: linear-gradient(to right, #f8fafd, #ffffff);
  border-top: 1px solid #edf2f7;
  margin-top: 0.5rem;
}