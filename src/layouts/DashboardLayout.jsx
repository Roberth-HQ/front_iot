import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, Cpu, Link as LinkIcon, 
  Users, Settings, UserCircle, LogOut 
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../features/auth/store/authStore'; // <-- Tu tienda de Zustand
import api from '../api/axios';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraemos la función para cerrar sesión de tu Store
  const { logout } = useAuthStore(); 
  const { projects, setProjects, selectedProjectId, setSelectedProject } = useProjectStore();

  const handleLogout = () => {
    logout(); // Limpia el estado global y el localStorage
    navigate('/login'); // Redirige al login
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/project');
        setProjects(res.data);
        if (res.data.length > 0 && !selectedProjectId) {
          setSelectedProject(res.data[0].id);
        }
      } catch (err) {
        console.error("Error cargando proyectos", err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">🧊</span> Cube Factory
        </div>
        
        <nav className="sidebar-menu">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
            { name: 'Proyectos', path: '/proyectos', icon: <FolderKanban size={20} /> },
            { name: 'Dispositivos', path: '/dispositivos', icon: <Cpu size={20} /> },
            { name: 'Blockchain', path: '/blockchain', icon: <LinkIcon size={20} /> },
            { name: 'Usuarios', path: '/usuarios', icon: <Users size={20} /> },
            { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
          ].map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="icon-wrapper">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="project-selector-wrapper">
            <label className="project-label">Proyecto Activo</label>
            <select 
              value={selectedProjectId || ''} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="project-select"
            >
              <option value="" disabled>Seleccionar proyecto...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="header-right">
            <ThemeToggle />
            <div className="header-divider"></div>
            
            <div className="user-profile-header">
              <div className="user-info-text">
                <span className="user-name">Admin</span>
                <span className="user-status">En línea</span>
              </div>
              <div className="user-avatar">
                <UserCircle size={32} strokeWidth={1.5} />
              </div>
              {/* BOTÓN DE SALIDA */}
              <button className="logout-btn" onClick={handleLogout} title="Cerrar Sesión">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;