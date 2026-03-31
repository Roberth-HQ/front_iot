import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useProjectStore } from '../../store/projectStore';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, Cpu, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedProjectId, projects } = useProjectStore();
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [stats, setStats] = useState({ devices: 0, locations: 0, sensors: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async (projectId) => {
    try {
      setLoading(true);
      // IMPORTANTE: Asegúrate que tu backend en /project/:id incluya locaciones y dispositivos
      const res = await api.get(`/project/${projectId}`);
      const projectData = res.data;

      // 1. Contamos Locaciones
      const locations = projectData.locations || [];
      
      // 2. Contamos Dispositivos (recorriendo locaciones)
      let devicesCount = 0;
      let sensorsCount = 0;
      
      locations.forEach(loc => {
        devicesCount += (loc.devices?.length || 0);
        // Si tienes sensores dentro de dispositivos, los contamos también
        loc.devices?.forEach(dev => {
            sensorsCount += (dev.sensors?.length || 0);
        });
      });

      setStats({
        locations: locations.length,
        devices: devicesCount,
        sensors: sensorsCount // Cambiamos "Alertas" por algo real: total de sensores
      });

      // 3. Generamos datos reales para la gráfica (simulados por ahora, pero con estructura)
      // Aquí podrías mapear las últimas readings de tus sensores
      setChartData([
        { name: 'Lun', valor: 400 },
        { name: 'Mar', valor: 300 },
        { name: 'Mie', valor: 600 },
        { name: 'Jue', valor: 800 },
        { name: 'Vie', valor: 500 },
      ]);

    } catch (err) {
      console.error("Error cargando Dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadDashboardData(selectedProjectId);
    }
  }, [selectedProjectId]);

  if (!selectedProjectId) {
    return (
      <div className="no-project-container">
        <AlertTriangle size={48} color="#f59e0b" />
        <h2>No hay proyecto seleccionado</h2>
        <p>Selecciona un proyecto en la parte superior para visualizar las estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-info">
          <h2>Panel de Control: {activeProject?.name || 'Cargando...'}</h2>
          <p>Estado general de la red IoT y sensores</p>
        </div>
        <button className="btn-refresh" onClick={() => loadDashboardData(selectedProjectId)}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Actualizar
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-box">
          <MapPin className="icon-blue" />
          <div className="stat-content">
            <span>Áreas / Sedes</span>
            <h3>{stats.locations}</h3>
          </div>
        </div>
        <div className="stat-box">
          <Cpu className="icon-purple" />
          <div className="stat-content">
            <span>Nodos ESP32</span>
            <h3>{stats.devices}</h3>
          </div>
        </div>
        <div className="stat-box">
          <Activity className="icon-green" />
          <div className="stat-content">
            <span>Sensores Activos</span>
            <h3>{stats.sensors}</h3>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Actividad de Mensajes (Últimos 5 días)</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorValue)" 
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;