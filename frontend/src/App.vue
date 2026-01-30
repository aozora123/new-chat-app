<template>
  <div id="app">
    <nav class="navbar" v-if="isLoggedIn">
      <div class="nav-brand">ChatApp Pro</div>
      <div class="nav-menu">
        <button @click="logout" class="btn btn-logout">Logout</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isLoggedIn = computed(() => authStore.isAuthenticated);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(45deg, #4a6cf7, #6a11cb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  transition: all 0.3s ease;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(74, 108, 247, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #3a5ce5 0%, #5a0bb3 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 108, 247, 0.4);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5c656d;
  transform: translateY(-1px);
}

.btn-logout {
  background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3);
  padding: 0.6rem 1.5rem;
  font-weight: 600;
}

.btn-logout:hover {
  background: linear-gradient(135deg, #e03a5f 0%, #e04427 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 65, 108, 0.4);
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e1e5f2;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
}

.form-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2), inset 0 2px 4px rgba(0,0,0,0.03);
}

.form-input-icon {
  position: absolute;
  left: 1rem;
  top: 2.5rem;
  color: #aaa;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.chat-container {
  display: flex;
  height: calc(100vh - 160px);
  gap: 1.5rem;
  border-radius: 20px;
  overflow: hidden;
  background: white;
  box-shadow: 0 15px 50px rgba(0,0,0,0.1);
}

.sidebar {
  width: 320px;
  background: linear-gradient(to bottom, #ffffff 0%, #f8faff 100%);
  border-right: 1px solid #eef1f9;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fbfd;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm68 31c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm-63 63c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm93-63c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zM32 64c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm36 36c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm-56-18c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm75 7c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm14-22c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zM32 18c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5zm36 36c4.972 0 9-4.028 9-9s-4.028-9-9-9-9 4.028-9 9 4.028 9 9 9zm0-14c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z' fill='%23f0f2f5' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
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

.message-input-container {
  padding: 1.2rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  gap: 0.8rem;
  background: white;
}

.message-input {
  flex: 1;
  padding: 1rem 1.4rem;
  border: 2px solid #e1e5f2;
  border-radius: 30px;
  resize: none;
  height: 60px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
}

.message-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2), inset 0 2px 4px rgba(0,0,0,0.03);
}

.send-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 15px rgba(74, 108, 247, 0.3);
  transition: all 0.3s ease;
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 108, 247, 0.4);
}

.conversation-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  border: 1px solid #eef1f9;
  background: white;
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>