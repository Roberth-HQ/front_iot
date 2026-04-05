import React, { useState } from 'react';
import { Save, ShieldCheck, Cpu, Moon, Sun, Download, BellRing } from 'lucide-react';
import './SettingsPage.css';
import { useThemeStore } from '../../store/themeStore'; // Importamos tu store de tema

const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [settings, setSettings] = useState({
    theme: 'system',
    syncInterval: 50,
    notifications: true,
    auditLogging: true
  });

  const [passwordData, setPasswordData] = useState({ old: '', new: '' });

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h2>Configuración del Sistema</h2>
        <p>Ajustes globales de seguridad, red IoT y personalización.</p>
      </header>

      <div className="settings-grid">
        
        {/* SECCIÓN: SEGURIDAD */}
        <section className="settings-card">
          <div className="card-header">
            <ShieldCheck className="icon-gold" />
            <h3>Seguridad de Cuenta</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="btn-save">Actualizar Credenciales</button>
          </div>
        </section>

        {/* SECCIÓN: PARÁMETROS BLOCKCHAIN / IOT */}
        <section className="settings-card">
          <div className="card-header">
            <Cpu className="icon-blue" />
            <h3>Parámetros de Red IoT</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Tamaño del Lote (Batch Size)</label>
              <select value={settings.syncInterval} onChange={(e) => setSettings({...settings, syncInterval: e.target.value})}>
                <option value="10">10 Lecturas (Alta frecuencia)</option>
                <option value="50">50 Lecturas (Equilibrado)</option>
                <option value="100">100 Lecturas (Optimizado)</option>
              </select>
              <small>Número de lecturas necesarias antes de sellar un bloque en la Blockchain.</small>
            </div>
            <div className="form-group toggle-group">
              <label>Auditoría Continua</label>
              <input type="checkbox" checked={settings.auditLogging} />
            </div>
          </div>
        </section>

        {/* SECCIÓN: PREFERENCIAS VISUALES */}
        <section className="settings-card">
          <div className="card-header">
            {settings.theme === 'dark' ? <Moon /> : <Sun />}
            <h3>Preferencia Visual</h3>
          </div>
          <div className="card-body">
            <div className="theme-selector">
      <button 
        className={!isDarkMode ? 'active' : ''} 
        onClick={() => isDarkMode && toggleTheme()} // Si está oscuro, lo cambia a claro
      >
        <Sun size={14} /> Claro
      </button>
      <button 
        className={isDarkMode ? 'active' : ''} 
        onClick={() => !isDarkMode && toggleTheme()} // Si está claro, lo cambia a oscuro
      >
        <Moon size={14} /> Oscuro
      </button>
    </div>
          </div>
        </section>

        {/* SECCIÓN: EXPORTACIÓN */}
        <section className="settings-card highlighted-card">
          <div className="card-header">
            <Download className="icon-green" />
            <h3>Respaldo y Auditoría</h3>
          </div>
          <div className="card-body">
            <p>Descarga el historial completo de hashes y firmas para verificación externa.</p>
            <button className="btn-export">Exportar Libro Mayor (JSON)</button>
          </div>
        </section>

      </div>
      
      <div className="settings-footer">
        <button className="btn-main-save"><Save size={18} /> Guardar todos los cambios</button>
      </div>
    </div>
  );
};

export default SettingsPage;