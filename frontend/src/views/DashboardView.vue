<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1>Welcome to ChatApp Pro, {{ authStore.user?.username }}!</h1>
      <p class="subtitle">Your conversations and connections in one place</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue">
          <span>💬</span>
        </div>
        <div class="stat-info">
          <h3>{{ chatStore.conversations.length }}</h3>
          <p>Conversations</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-green">
          <span>👤</span>
        </div>
        <div class="stat-info">
          <h3>{{ totalMessagesCount }}</h3>
          <p>Messages</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-purple">
          <span>🏷️</span>
        </div>
        <div class="stat-info">
          <h3>{{ chatStore.tags.length }}</h3>
          <p>Tags</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon bg-orange">
          <span>👥</span>
        </div>
        <div class="stat-info">
          <h3>{{ groupConversationsCount }}</h3>
          <p>Groups</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="recent-conversations">
        <div class="section-header">
          <h2>{{ selectedTagId ? 'Filtered Conversations' : 'Recent Conversations' }}</h2>
          <div class="header-actions">
            <button v-if="selectedTagId" @click="clearTagFilter" class="btn btn-secondary">
              Clear Filter
            </button>
            <button @click="createNewConversation" class="btn btn-primary">
              + New Conversation
            </button>
          </div>
        </div>
        
        <!-- Tag Filter -->
        <div v-if="chatStore.tags.length > 0" class="tag-filter">
          <label>Filter by tag:</label>
          <div class="tag-buttons">
            <button 
              type="button"
              v-for="tag in chatStore.tags" 
              :key="tag.id"
              @click="filterByTag(tag.id)"
              class="tag-filter-btn"
              :class="{ active: selectedTagId === tag.id }"
              :style="{ 
                backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}20`,
                borderColor: tag.color,
                color: selectedTagId === tag.id ? '#fff' : tag.color
              }"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
        
        <div class="conversations-list">
          <div 
            v-for="conversation in displayConversations" 
            :key="conversation.id"
            class="conversation-card"
            @click="openConversation(conversation.id)"
          >
            <div class="conversation-info">
              <div class="conversation-header">
                <h3>{{ conversation.title }}</h3>
                <span v-if="conversation.isGroup" class="group-badge">👥 Group</span>
              </div>
              
              <p v-if="conversation.Messages && conversation.Messages.length > 0" class="last-message">
                {{ conversation.Messages[conversation.Messages.length - 1].content.substring(0, 80) }}...
              </p>
              <p v-else class="no-messages">No messages yet</p>
              
              <div class="conversation-meta">
                <span class="message-count">{{ conversation.Messages?.length || 0 }} messages</span>
                <span class="timestamp">{{ formatDate(conversation.updatedAt) }}</span>
              </div>
            </div>
            
            <div v-if="conversation.Tags && conversation.Tags.length > 0" class="conversation-tags">
              <span 
                v-for="tag in conversation.Tags" 
                :key="tag.id"
                class="tag"
                :style="{ backgroundColor: `${tag.color}30`, borderColor: tag.color }"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          
          <div v-if="chatStore.conversations.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start a new conversation to begin chatting</p>
            <button @click="createNewConversation" class="btn btn-primary">
              Create Your First Conversation
            </button>
          </div>
        </div>
      </div>
      
      <div class="activity-feed">
        <div class="section-header">
          <h2>Recent Activity</h2>
        </div>
        
        <div class="activity-list">
          <div 
            v-for="(activity, index) in recentActivities" 
            :key="index"
            class="activity-item"
          >
            <div class="activity-icon">
              <span v-if="activity.type === 'message'">💬</span>
              <span v-else-if="activity.type === 'conversation'">🆕</span>
              <span v-else-if="activity.type === 'tag'">🏷️</span>
              <span v-else>🔔</span>
            </div>
            <div class="activity-content">
              <p>{{ activity.text }}</p>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
          
          <div v-if="recentActivities.length === 0" class="empty-state">
            <div class="empty-icon">🔔</div>
            <h3>No recent activity</h3>
            <p>Your latest actions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chat';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();

const selectedTagId = ref<number | null>(null);
const filteredConversations = ref<any[]>([]);

// Watch for route changes to handle tag filtering
watch(() => route.query.tag, async (newTagId) => {
  console.log('Route query tag changed:', newTagId);
  if (newTagId) {
    const tagId = parseInt(newTagId as string);
    console.log('Setting selectedTagId to:', tagId);
    selectedTagId.value = tagId;
    try {
      console.log('Fetching conversations for tag:', tagId);
      filteredConversations.value = await chatStore.getConversationsByTag(tagId);
      console.log('Filtered conversations:', filteredConversations.value);
    } catch (error) {
      console.error('Failed to load filtered conversations:', error);
    }
  } else {
    console.log('Clearing tag filter');
    selectedTagId.value = null;
    filteredConversations.value = [];
  }
}, { immediate: true });

onMounted(async () => {
  console.log('DashboardView mounted. isAuthenticated:', authStore.isAuthenticated, 'token exists:', !!authStore.token);

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    if (authStore.token) {
      // Token exists but isAuthenticated is false, this might indicate an issue
      console.log('Token exists but isAuthenticated is false, trying to fetch user data...');
      try {
        await authStore.fetchCurrentUser();
        console.log('User data fetched successfully after token check');
      } catch (fetchError: any) {
        console.error('Failed to fetch user data after token check:', fetchError);
        router.push('/login');
        return;
      }
    } else {
      // No token and not authenticated, redirect to login
      console.log('No token and not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
  }

  try {
    // Ensure user data is loaded, but only if it hasn't been loaded yet
    if (authStore.token && !authStore.user) {
      console.log('Fetching current user data...');
      try {
        await authStore.fetchCurrentUser();
      } catch (fetchError: any) {
        console.error('Failed to fetch current user data:', fetchError);
        
        // Check if it's an authentication error that requires logout
        if (fetchError.name === 'AuthError' || 
            (fetchError.message && fetchError.message.includes('401 Unauthorized')) ||
            (fetchError.response && fetchError.response.status === 401)) {
          console.log('Auth error detected, logging out and redirecting to login');
          authStore.logout();
          router.push('/login');
          return; // Stop execution
        }
        
        // If it's another kind of error, just log and continue loading other data
        console.error('Non-auth error fetching user data, proceeding anyway:', fetchError);
      }
    }
    
    console.log('Loading conversations and tags...');
    // Load conversations and tags
    await Promise.all([
      chatStore.loadConversations(),
      chatStore.loadTags()
    ]);
    
    console.log('Dashboard initialized successfully');
  } catch (error: any) {
    console.error('Error initializing dashboard:', error);
    // Redirect to login if there's an auth-related issue
    if ((error.name === 'AuthError') || 
        (error.message && error.message.includes('Unauthorized')) ||
        (error.response && error.response.status === 401)) {
      authStore.logout();
      router.push('/login');
    }
  }
});

const totalMessagesCount = computed(() => {
  return chatStore.conversations.reduce((total, conversation) => {
    return total + (conversation.Messages?.length || 0);
  }, 0);
});

const groupConversationsCount = computed(() => {
  return chatStore.conversations.filter(conv => conv.isGroup).length;
});

const recentConversations = computed(() => {
  return [...chatStore.conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
});

const recentActivities = computed(() => {
  const activities: any[] = [];
  
  // Add conversation creation activities
  chatStore.conversations.forEach(conv => {
    activities.push({
      type: 'conversation',
      text: `Created conversation: "${conv.title}"`,
      time: conv.createdAt
    });
  });
  
  // Add activity for messages in conversations
  chatStore.conversations.forEach(conv => {
    if (conv.Messages && conv.Messages.length > 0) {
      const lastMessage = conv.Messages[conv.Messages.length - 1];
      activities.push({
        type: 'message',
        text: `Sent message in: "${conv.title}"`,
        time: lastMessage.createdAt
      });
    }
  });
  
  // Sort by most recent
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openConversation = (id: number) => {
  router.push(`/chat/${id}`);
};

const createNewConversation = () => {
  router.push('/chat');
};

const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Display conversations based on whether a tag is selected
const displayConversations = computed(() => {
  console.log('displayConversations called, selectedTagId:', selectedTagId.value, 'filteredConversations.length:', filteredConversations.value.length);
  if (selectedTagId.value) {
    return filteredConversations.value;
  }
  return recentConversations.value;
});

// Filter conversations by tag
const filterByTag = (tagId: number) => {
  router.push({ path: '/dashboard', query: { tag: tagId.toString() } });
};

// Clear tag filter
const clearTagFilter = () => {
  router.push({ path: '/dashboard' });
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.welcome-section h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #4a6cf7, #6a11cb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.2rem;
  font-size: 1.8rem;
}

.stat-icon.bg-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
.stat-icon.bg-green { background: linear-gradient(135deg, #d3f9d8, #a7f3d0); }
.stat-icon.bg-purple { background: linear-gradient(135deg, #e9d5ff, #d8b4fe); }
.stat-icon.bg-orange { background: linear-gradient(135deg, #ffedd5, #fed7aa); }

.stat-info h3 {
  font-size: 2rem;
  color: #4a5568;
  margin: 0 0 0.2rem 0;
}

.stat-info p {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.tag-filter {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.tag-filter label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.tag-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-filter-btn {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.tag-filter-btn.active {
  color: white !important;
  font-weight: 600;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversation-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #edf2f7;
}

.conversation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  border-color: #cbd5e0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.conversation-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.group-badge {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.last-message {
  color: #718096;
  margin: 0.5rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.no-messages {
  color: #a0aec0;
  font-style: italic;
  margin: 0.5rem 0;
}

.conversation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
  padding-top: 0.5rem;
  border-top: 1px solid #edf2f7;
}

.message-count {
  color: #718096;
  font-size: 0.9rem;
}

.timestamp {
  color: #a0aec0;
  font-size: 0.85rem;
}

.conversation-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 0.3rem 0;
  color: #2d3748;
  font-size: 0.95rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #a0aec0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  border: 1px dashed #e2e8f0;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 600px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .dashboard-content {
    gap: 1.5rem;
  }
}
</style>