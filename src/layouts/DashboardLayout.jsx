import React from 'react';
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
          <h2 className="page-title">
            {menuItems.find(m => m.path === location.pathname)?.name || 'Bienvenido'}
          </h2>
          
          <div className="header-right">
            <div className="search-container">
              <input type="text" placeholder="Buscar..." className="search-input" />
            </div>
            <ThemeToggle />
            <button className="icon-btn"><UserCircle size={24} /></button>
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