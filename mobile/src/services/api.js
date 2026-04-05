import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Global error handler
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      // Navigation to login is handled by AuthContext
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
};

// ─── TASKS ────────────────────────────────────────────────────
export const tasksAPI = {
  createTask: data => api.post('/tasks/', data),
  getRelativeTasks: (userId, date) =>
    api.get(`/tasks/relative/${userId}`, { params: date ? { date } : {} }),
  getCaregiverTasks: (userId, date) =>
    api.get(`/tasks/caregiver/${userId}`, { params: date ? { date } : {} }),
  updateStatus: data => api.patch('/tasks/status', data),
  updateTask: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  updateTemplate: (templateId, data) => api.patch(`/tasks/template/${templateId}`, data),
  rateTask: data => api.patch('/tasks/rate', data),
  deleteTask: taskId => api.delete(`/tasks/${taskId}`),
  deleteTemplate: templateId => api.delete(`/tasks/template/${templateId}`),
  getRelativeStats: userId => api.get(`/tasks/stats/relative/${userId}`),
  getCaregiverStats: userId => api.get(`/tasks/stats/caregiver/${userId}`),
};

// ─── USERS ────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => api.get('/users/'),
  getById: id => api.get(`/users/${id}`),
  getByRole: role => api.get(`/users/role/${role}`),
};

// ─── MESSAGES ─────────────────────────────────────────────────
export const messagesAPI = {
  send: data => api.post('/messages/', data),
  getConversation: (userA, userB) =>
    api.get(`/messages/conversation/${userA}/${userB}`),
  getUserConversations: userId => api.get(`/messages/user/${userId}/conversations`),
  markRead: messageId => api.patch(`/messages/read/${messageId}`),
  editMessage: data => api.patch('/messages/edit', data),
  deleteMessage: id => api.delete(`/messages/${id}`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────
export const notificationsAPI = {
  getAll: userId => api.get(`/notifications/${userId}`),
  markRead: notifId => api.patch(`/notifications/read/${notifId}`),
  markAllRead: userId => api.patch(`/notifications/read-all/${userId}`),
};

export default api;
