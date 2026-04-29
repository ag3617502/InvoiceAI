import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ user: res.data.data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  signup: async (email, password, businessName) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/signup', { email, password, businessName });
      set({ loading: false });
      return { success: true, message: res.data.message };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
}));

export default useAuthStore;
