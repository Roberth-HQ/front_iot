import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import Button from '../../../components/Button.jsx';
import Input from '../../../components/Input.jsx';
import ThemeToggle from '../../../components/ThemeToggle.jsx';
import api from '../../../api/axios.js';
import './LoginPage.css'; // <--- IMPORTAMOS EL CSS NUEVO
import portadaImage from '../../../assets/portada.jpg'; // <--- IMPORTAMOS TU IMAGEN

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      const user = response.data.user || { email };

      loginAction(user, token);
      navigate('/dashboard');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Servidor no disponible'));
    }
  };

  return (
    <div className="split-container">
      {/* Botón de tema flotante moderna */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* --- LADO IZQUIERDO (IMAGEN) --- */}
      <div className="image-section" style={{ backgroundImage: `url(${portadaImage})` }}>
        {/* Aquí puedes poner un logo flotante de la fábrica si quieres */}
      </div>

      {/* --- LADO DERECHO (LOGIN) --- */}
      <div className="login-section">
        <div className="login-form-wrapper">
          <h2 className="factory-logo">Cube Factory</h2>
          
          <form onSubmit={handleFormSubmit}>
            <Input 
              placeholder="Teléfono, usuario o correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input 
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div style={{ marginTop: '20px' }}>
              <Button type="submit">Entrar al Sistema</Button>
            </div>
          </form>

          <div className="divider">
            <div className="divider-line"></div>
            <div className="divider-text">O</div>
            <div className="divider-line"></div>
          </div>

          <a href="#" className="forgot-password">
            ¿Has olvidado la contraseña?
          </a>

          <div style={{ marginTop: '30px', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <p>
              ¿No tienes una cuenta? <span className="link-text" style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold' }}>Regístrate aquí</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;