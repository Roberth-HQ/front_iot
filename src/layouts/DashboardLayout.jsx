import React, {useEffect} from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Cpu, 
  Link as LinkIcon, 
  Users, 
  Settings,
  UserCircle 
} from 'lucide-react'; // Iconos pro
import { useThemeStore } from '../store/themeStore';
import { useProjectStore } from '../store/projectStore';
import api from '../api/axios'
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

const DashboardLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Proyectos', path: '/proyectos', icon: <FolderKanban size={20} /> },
    { name: 'Dispositivos', path: '/dispositivos', icon: <Cpu size={20} /> },
    { name: 'Blockchain', path: '/blockchain', icon: <LinkIcon size={20} /> },
    { name: 'Usuarios', path: '/usuarios', icon: <Users size={20} /> },
    { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
  ];
  const { projects, setProjects, selectedProjectId, setSelectedProject } = useProjectStore();

  // Cargamos los proyectos al entrar al Dashboard
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/project');
        setProjects(res.data);
        if (res.data.length > 0 && !selectedProjectId) {
          setSelectedProject(res.data[0].id); // Selecciona el primero por defecto
        }
      } catch (err) {
        console.error("Error cargando proyectos", err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="dashboard-container">
      {/* --- SIDEBAR IZQUIERDO --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">🧊</span> Cube Factory
        </div>
        
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
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

        {/* Info del Usuario al final del Sidebar (Opcional) */}
        <div className="sidebar-footer">
          <div className="user-badge">
            <UserCircle size={30} color="var(--primary-color)" />
            <div className="user-info">
              <p className="user-name">Admin Root</p>
              <p className="user-role">Superuser</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO DERECHO --- */}
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
    {/* El interruptor de Luna/Sol que faltaba */}
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
    </div>
  </div>
</header>

        {/* EL "LIENZO" DONDE CAMBIAN LAS PÁGINAS */}
        <main className="content-body">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;