// src/api/axios.js
import axios from 'axios';
import { useAuthStore } from '../context/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia esto por tu URL de backend
});

// Interceptor para incluir el Token en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;