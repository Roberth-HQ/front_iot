import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR (Barra Lateral) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          🔗 Blockchain IoT
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="block py-2 px-4 hover:bg-slate-800 rounded transition">
            🏠 Panel Principal
          </Link>
          <Link to="/proyectos" className="block py-2 px-4 hover:bg-slate-800 rounded transition">
            📁 Proyectos
          </Link>
          <Link to="/dispositivos" className="block py-2 px-4 hover:bg-slate-800 rounded transition">
            📱 Dispositivos
          </Link>
          <Link to="/blockchain" className="block py-2 px-4 hover:bg-slate-800 rounded transition">
            ⛓️ Blockchain Logs
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700 text-sm">
          Usuario: <span className="text-blue-400">{user?.email}</span>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER (Cabecera) */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-700">Sistema de Gestión</h2>
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* VISTA DINÁMICA (Aquí se cargan las páginas) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* ESTO ES VITAL: Aquí React Router inyecta la página */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;