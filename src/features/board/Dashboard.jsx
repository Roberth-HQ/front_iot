import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { useProjectStore } from '../../store/projectStore';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend 
} from 'recharts';
import { 
  Activity, Cpu, MapPin, ShieldCheck, RefreshCw, AlertTriangle, Navigation, Eye, EyeOff
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { selectedProjectId, projects } = useProjectStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ locations: 0, devices: 0, sensors: 0, blockchainBlocks: 0 });
  const [allSensors, setAllSensors] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [visibleSensors, setVisibleSensors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showGPS, setShowGPS] = useState(false); // <--- Nuevo estado para el permiso

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const activeProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
    [projects, selectedProjectId]
  );

  const loadDashboardData = async (projectId) => {
    try {
      setLoading(true);
      const [structRes, bcRes] = await Promise.all([
        api.get(`/project/estructura/${projectId}`),
        api.get(`/api/blockchain/explorer?projectId=${projectId}`)
      ]);

      const project = structRes.data;

      // --- CAMBIO AQUÍ: Verificación por tipo de Locación ---
      const hasGPSLocation = project.locations?.some(loc => 
        loc.type === 'LOGISTICS' || loc.type === 'INDUSTRIAL'
      );
      setShowGPS(hasGPSLocation);
      // -----------------------------------------------------

      const uniqueSensorsMap = new Map();
      const uniqueDevicesSet = new Set();

      if (project.locations) {
        project.locations.forEach(loc => {
          const allDevsInLoc = [
            ...(loc.devices || []),
            ...(loc.gateways?.flatMap(g => g.devices) || [])
          ].filter(Boolean);

          allDevsInLoc.forEach(dev => {
            uniqueDevicesSet.add(dev.id);
            dev.sensors?.forEach(s => {
              if (!uniqueSensorsMap.has(s.id)) {
                uniqueSensorsMap.set(s.id, s);
              }
            });
          });
        });
      }

      const sensorsFound = Array.from(uniqueSensorsMap.values());
      const readingsPromises = sensorsFound.map(s => api.get(`/readings/sensor/${s.id}?limit=20`));
      const allReadingsRes = await Promise.all(readingsPromises);

      const timeMap = {};
      allReadingsRes.forEach((res, index) => {
        const sensorName = sensorsFound[index].name;
        res.data.forEach(reading => {
          const time = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!timeMap[time]) timeMap[time] = { name: time };
          timeMap[time][sensorName] = reading.value;
        });
      });

      const finalChartData = Object.values(timeMap).sort((a, b) => a.name.localeCompare(b.name));

      const initialVisibility = {};
      sensorsFound.forEach(s => {
        const isGps = s.type === 'lat' || s.type === 'lng';
        initialVisibility[s.name] = !isGps; 
      });

      setAllSensors(sensorsFound);
      setVisibleSensors(initialVisibility);
      setChartData(finalChartData);
      setStats({
        locations: project.locations?.length || 0,
        devices: uniqueDevicesSet.size,
        sensors: sensorsFound.length,
        blockchainBlocks: bcRes.data?.length || 0
      });

    } catch (err) {
      console.error("❌ Error en Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSensor = (name) => {
    setVisibleSensors(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    if (selectedProjectId) loadDashboardData(selectedProjectId);
  }, [selectedProjectId]);

  if (!selectedProjectId) {
    return (
      <div className="no-project-container">
        <AlertTriangle size={64} color="#f59e0b" />
        <h2>Proyecto no seleccionado</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>{activeProject?.name}</h1>
          <p>Monitoreo de activos y verificación Blockchain</p>
        </div>
        <div className="header-actions">
          {/* AHORA DEPENDE DEL ESTADO showGPS ACTUALIZADO POR LOCATIONS */}
          {showGPS && (
            <button className="btn-map" onClick={() => navigate('/mapa-recorrido')}>
              <Navigation size={18} /> <span>Ruta GPS</span>
            </button>
          )}
          <button className="btn-refresh" onClick={() => loadDashboardData(selectedProjectId)} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </header>

      <div className="sensor-filter-bar">
        {allSensors.map((s, idx) => (
          <button 
            key={s.id} 
            className={`filter-chip ${visibleSensors[s.name] ? 'active' : ''}`}
            onClick={() => toggleSensor(s.name)}
            style={{ '--chip-color': COLORS[idx % COLORS.length] }}
          >
            {visibleSensors[s.name] ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{s.name}</span>
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><MapPin /></div>
          <div className="stat-val">
            <span className="number">{stats.locations}</span>
            <span className="label">Locaciones</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><Cpu /></div>
          <div className="stat-val">
            <span className="number">{stats.devices}</span>
            <span className="label">Dispositivos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><Activity /></div>
          <div className="stat-val">
            <span className="number">{stats.sensors}</span>
            <span className="label">Sensores</span>
          </div>
        </div>
        <div className="stat-card highlighted">
          <div className="stat-icon bg-gold"><ShieldCheck /></div>
          <div className="stat-val">
            <span className="number">{stats.blockchainBlocks}</span>
            <span className="label">Bloques BC</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="chart-section">
          <h3>Telemetría en Tiempo Real</h3>
          <div className="responsive-chart">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Legend />
                {allSensors.map((s, idx) => (
                  visibleSensors[s.name] && (
                    <Line
                      key={s.id}
                      type={s.type === 'tapa' ? "stepAfter" : "monotone"}
                      dataKey={s.name}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;