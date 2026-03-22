import React, { useState } from 'react';
import api from '../../../api/axios';
import { useAuthStore } from '../store/authStore';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login); // Traemos la acción de Zustand

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Enviamos los datos al backend
      const response = await api.post('/auth/login', { email, password });
      
      // 2. Guardamos en el estado global (Zustand)
      // response.data debería traer { user: { email, role }, token: "..." }
      login(response.data.user, response.data.token);
      
      alert('¡Bienvenido!');
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input 
            type="password" 
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};