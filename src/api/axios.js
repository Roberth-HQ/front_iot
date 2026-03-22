// src/api/axios.js
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:4000/', 
  headers:{
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir el Token en cada petición automáticamente
api.interceptors.request.use((config) => {
  //onst token = useAuthStore.getState().token;
  const token =localStorage.getItem('auth-storage');
  if (token) {
    //config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;