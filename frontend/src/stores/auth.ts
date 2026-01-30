import { defineStore } from 'pinia';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    // Check if token exists and isn't obviously invalid
    token: (() => {
      const token = localStorage.getItem('token');
      // Return token only if it's not null/undefined/empty
      return token && token !== 'null' && token !== 'undefined' && token.trim() !== '' ? token : '';
    })(),
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  
  actions: {
    async register(username: string, email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/api/auth/register', {
          username,
          email,
          password,
        });
        
        // Store the returned token and user data without additional validation
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.error || error.message || 'Registration failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Sending login request...');
        const response = await axios.post('/api/auth/login', {
          username,
          password,
        });
        
        console.log('Login response:', response.data);
        
        // Store the returned token and user data without additional validation
        this.token = response.data.token;
        console.log('Stored token:', this.token);
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        
        return response.data;
      } catch (error: any) {
        console.error('Login error details:', error);
        this.error = error.response?.data?.error || error.message || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Fetches the currently authenticated user's data based on the JWT token
    async fetchCurrentUser() {
      console.log('Fetching current user with token:', this.token ? 'Exists' : 'Missing');
      if (!this.token) {
        throw new Error('No token available');
      }
      
      try {
        console.log('Making request to /api/auth/me with token:', this.token.substring(0, 20) + '...');
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        
        console.log('Response from /api/auth/me:', response.data);
        this.user = response.data;
        this.error = null; // Clear any previous errors
        return response.data;
      } catch (error: any) {
        console.error('fetchCurrentUser error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message,
          fullError: error
        });

        // Check if it's a 401 Unauthorized error (invalid/expired token)
        if (error.response && error.response.status === 401) {
          // Clear the invalid token
          this.token = '';
          this.user = null;
          localStorage.removeItem('token');
          this.error = 'Authentication token expired or invalid';
          
          // Throw a custom error that can be handled by components
          const authError = new Error('401 Unauthorized - Token may have expired');
          authError.name = 'AuthError';
          throw authError;
        }
        
        // For other network or server errors
        this.error = error.response?.data?.error || error.message || 'Failed to fetch user data';
        throw error;
      }
    },
    
    // Fetches a specific user's data by their ID
    async fetchUserById(userId: number) {
      if (!this.token) {
        throw new Error('No token available');
      }
      
      try {
        const response = await axios.get(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        
        return response.data;
      } catch (error: any) {
        console.error('fetchUserById error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          message: error.message
        });

        // Check if it's a 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          // Clear the invalid token
          this.token = '';
          this.user = null;
          localStorage.removeItem('token');
          this.error = 'Authentication token expired or invalid';
          
          // Throw a custom error that can be handled by components
          const authError = new Error('401 Unauthorized - Token may have expired');
          authError.name = 'AuthError';
          throw authError;
        }
        
        // For other network or server errors
        this.error = error.response?.data?.error || error.message || 'Failed to fetch user data';
        throw error;
      }
    },
    
    logout() {
      this.user = null;
      this.token = '';
      this.error = null;
      localStorage.removeItem('token');
    },
  },
});