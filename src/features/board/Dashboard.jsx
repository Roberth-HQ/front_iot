import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useProjectStore } from '../../store/projectStore';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, Cpu, MapPin, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedProjectId, projects } = useProjectStore();
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [stats, setStats] = useState({ 
    devices: 0, locations: 0, sensors: 0, blockchainBlocks: 0 
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

const loadDashboardData = async (projectId) => {
  try {
    setLoading(true);
    
    // 1. Traemos el proyecto con todas sus ramas
    const res = await api.get(`/project/${projectId}`);
    const projectData = res.data;

    // 2. Traemos los bloques de la blockchain
    const bcRes = await api.get(`/api/blockchain/explorer?projectId=${projectId}`);

    // --- CÁLCULO DE CONTADORES ---
    let totalDevices = 0;
    let totalSensors = 0;

    // Recorremos locaciones -> dispositivos -> sensores
    const locations = projectData.locations || [];
    
    locations.forEach(loc => {
      const devices = loc.devices || [];
      totalDevices += devices.length;
      
      devices.forEach(dev => {
        totalSensors += (dev.sensors?.length || 0);
      });
    });

    setStats({
      locations: locations.length,
      devices: totalDevices,
      sensors: totalSensors,
      blockchainBlocks: bcRes.data.length
    });

    // --- MAPEO DE LA GRÁFICA (Datos reales del Blockchain) ---
    const activityMap = {};
    bcRes.data.forEach(block => {
      // Usamos la fecha del bloque como llave
      const date = new Date(block.createdAt).toLocaleDateString('es-ES', { weekday: 'short' });
      // Sumamos la cantidad de lecturas que tiene ese bloque (batchData)
      const readingsCount = block.batchData ? block.batchData.length : 0;
      activityMap[date] = (activityMap[date] || 0) + readingsCount;
    });

    const formattedChartData = Object.keys(activityMap).map(key => ({
      name: key,
      lecturas: activityMap[key]
    }));

    setChartData(formattedChartData.length > 0 ? formattedChartData : [{name: 'Sin datos', lecturas: 0}]);

  } catch (err) {
    console.error("Error en Dashboard:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (selectedProjectId) loadDashboardData(selectedProjectId);
  }, [selectedProjectId]);

  // Si no hay proyecto, mostramos aviso
  if (!selectedProjectId) {
    return (
      <div className="no-project-container">
        <AlertTriangle size={64} color="#f59e0b" />
        <h2>Selecciona un Proyecto</h2>
        <p>Necesitamos un contexto para mostrar las métricas de integridad y nodos.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-info">
          <h2>Panel de Control: {activeProject?.name}</h2>
          <p>Métricas de red inmutable y despliegue de sensores</p>
        </div>
        <button className="btn-refresh" onClick={() => loadDashboardData(selectedProjectId)}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> 
          {loading ? 'Sincronizando...' : 'Actualizar'}
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><MapPin /></div>
          <div className="stat-val">
            <span className="label">Locaciones</span>
            <span className="number">{stats.locations}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><Cpu /></div>
          <div className="stat-val">
            <span className="label">Dispositivos</span>
            <span className="number">{stats.devices}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><Activity /></div>
          <div className="stat-val">
            <span className="label">Sensores</span>
            <span className="number">{stats.sensors}</span>
          </div>
        </div>
        <div className="stat-card highlighted">
          <div className="stat-icon bg-gold"><ShieldCheck /></div>
          <div className="stat-val">
            <span className="label">Bloques Blockchain</span>
            <span className="number">{stats.blockchainBlocks}</span>
          </div>
        </div>
      </div>

      <div className="main-chart-area">
        <div className="chart-info">
          <h3>Flujo de Integridad (Lecturas procesadas)</h3>
          <p>Volumen de datos verificados y añadidos a la cadena por día.</p>
        </div>
        <div className="chart-h">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
              <Tooltip contentStyle={{borderRadius: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)'}} />
              <Area type="monotone" dataKey="lecturas" stroke="#6366f1" fillOpacity={1} fill="url(#colorRead)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;