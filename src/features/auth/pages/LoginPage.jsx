import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import api from '../../../api/axios.js';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Traemos la función 'login' de nuestro Cerebro (Zustand)
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try{
const response = await api.post('/auth/login', { email, password });
    
    // REVISIÓN AQUÍ: 
    // Si tu backend manda el token directo en response.data, úsalo así:
    const token = response.data.token;
    const user = response.data.user || { email }; // Si no viene user, inventamos uno con el email

    console.log("LOGIN_PAGE: Datos a enviar al cerebro:", { user, token });

    loginAction(user, token); // <--- Ahora sí enviamos datos reales
    
    navigate('/dashboard');
    } catch (error){
      alert('Error al iniciar sesion: ' +(error.response?.data?.message || 'Servidor no disponible'));
    }

  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <form onSubmit={handleFormSubmit} style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1e293b' }}>IoT Blockchain</h2>
        
        <Input 
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />

        <Input 
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div style={{ marginTop: '25px' }}>
          <Button type="submit" variant="primary">
            Entrar al Sistema
          </Button>
        </div>
      </form>
    </div>
  );

};

export default LoginPage;