<template>
  <div class="auth-container">
    <div class="card auth-card">
      <h2>Create Account</h2>
      <p class="subtitle">Join our community and start chatting today</p>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="reg-username" class="form-label">Username</label>
          <input 
            id="reg-username" 
            v-model="username" 
            type="text" 
            class="form-input"
            :class="{ 'has-error': registerError }"
            placeholder="Choose a unique username"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="reg-email" class="form-label">Email</label>
          <input 
            id="reg-email" 
            v-model="email" 
            type="email" 
            class="form-input"
            :class="{ 'has-error': registerError }"
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="reg-password" class="form-label">Password</label>
          <input 
            id="reg-password" 
            v-model="password" 
            type="password" 
            class="form-input"
            :class="{ 'has-error': registerError }"
            placeholder="Create a strong password"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="reg-confirm-password" class="form-label">Confirm Password</label>
          <input 
            id="reg-confirm-password" 
            v-model="confirmPassword" 
            type="password" 
            class="form-input"
            :class="{ 'has-error': registerError }"
            placeholder="Confirm your password"
            required
            minlength="6"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading" class="loading-spinner">⏳</span>
          <span v-else>Sign Up</span>
        </button>
        
        <p class="auth-footer">
          Already have an account? 
          <router-link to="/login" class="link">Log In</router-link>
        </p>
        
        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const registerError = ref('');

const handleRegister = async () => {
  registerError.value = '';
  
  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    registerError.value = 'Passwords do not match';
    return;
  }
  
  try {
    await authStore.register(username.value, email.value, password.value);
    // Add small delay to ensure store synchronization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Instead of directly pushing to dashboard, let the route guard handle user data loading
    router.push('/dashboard');
  } catch (error: any) {
    console.error('Registration failed:', error);
    // More detailed error message handling
    registerError.value = error.response?.data?.error || error.message || 'Registration failed. Username or email may already exist.';
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  border-radius: 20px;
  background: white;
  position: relative;
  overflow: hidden;
}

.auth-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4a6cf7, #6a11cb);
}

.auth-card h2 {
  color: #2d3748;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #4a6cf7, #6a11cb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #718096;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.auth-form {
  margin-top: 1.5rem;
  text-align: left;
}

.form-group {
  margin-bottom: 1.8rem;
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.05rem;
  background-color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
}

.form-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 4px rgba(74, 108, 247, 0.2), inset 0 2px 4px rgba(0,0,0,0.03);
}

.form-input.has-error {
  border-color: #fc8181;
}

.loading-spinner {
  margin-right: 0.5rem;
}

.btn {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #4a6cf7 0%, #6a11cb 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(74, 108, 247, 0.4);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #3a5ce5 0%, #5a0bb3 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(74, 108, 247, 0.5);
}

.btn-primary:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.auth-footer {
  margin-top: 1.8rem;
  text-align: center;
  color: #718096;
  font-size: 1rem;
}

.link {
  color: #4a6cf7;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  padding-bottom: 2px;
  transition: all 0.3s;
}

.link:hover {
  color: #3a5ce5;
  text-decoration: underline;
}

.link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4a6cf7, transparent);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.link:hover::after {
  transform: scaleX(1);
}

.error-message {
  margin-top: 1.2rem;
  padding: 1rem;
  background-color: #fff5f5;
  color: #e53e3e;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
  text-align: center;
  font-weight: 500;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@media (max-width: 500px) {
  .auth-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .auth-card h2 {
    font-size: 1.8rem;
  }
}
</style>