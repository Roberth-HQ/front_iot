import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

const DashboardLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR FIJO */}
      <aside style={{ width: '250px', background: '#1e293b', color: 'white', padding: '20px' }}>
        <h2>IoT Menu</h2>
        <button onClick={() => { logout(); navigate('/login'); }}>Salir</button>
      </aside>

      {/* CONTENIDO DINÁMICO */}
      <main style={{ flex: 1, padding: '20px', background: '#f1f5f9' }}>
        {/* El Outlet es la "ventana" donde aparecerán las páginas hijas */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default DashboardLayout;