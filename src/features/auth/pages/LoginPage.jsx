// src/features/auth/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../context/authStore';
import api from '../../../api/axios'; // Importamos el axios configurado
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore(); // Zustand
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Llamada al backend usando la instancia de axios centralizada
      const res = await api.post('/auth/login', { email, password });
      
      // Guardamos el token en Zustand (y automáticamente en LocalStorage)
      login(res.data.token);
      
      // Redirigimos al Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || "No se pudo conectar con el servidor"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">IoT Blockchain</h2>
          <p className="text-gray-500 mt-2">Ingresa a tu panel de control</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo Electrónico"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ejemplo.com"
            required
          />

          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta? <span className="text-blue-600 font-medium">Contacta al Super Admin</span>
        </div>
      </div>
    </div>
  );
};

// ESTA ES LA LÍNEA QUE FALTABA Y CAUSABA EL ERROR EN AppRoutes
export default LoginPage;