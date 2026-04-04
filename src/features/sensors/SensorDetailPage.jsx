import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  ArrowLeft, Database, ShieldCheck, Clock, 
  TrendingUp, Edit3, Trash2, Cpu, X 
} from 'lucide-react';
import './SensorDetail.css';

const SensorDetailPage = () => {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [sensor, setSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true); // Solo para la carga inicial
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para el formulario del Modal
  const [editData, setEditData] = useState({ name: '', unit: '', type: '' });

  const fetchSensorData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await api.get(`/sensors/${sensorId}`);
      setSensor(res.data);
      setReadings(res.data.readings || []);
      // Pre-cargar datos en el formulario
      setEditData({ 
        name: res.data.name || '', 
        unit: res.data.unit || '', 
        type: res.data.type || '' 
      });
    } catch (err) {
      console.error("Error cargando datos", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Polling "silencioso": isSilent = true evita el parpadeo
    const interval = setInterval(() => fetchSensorData(true), 15000);
    return () => clearInterval(interval);
  }, [sensorId]);

  const handleDelete = async () => {
    if (window.confirm("¿Eliminar sensor y su historial blockchain?")) {
      try {
        await api.delete(`/sensors/${sensorId}`);
        navigate(-1);
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sensors/${sensorId}`, editData);
      setIsModalOpen(false);
      fetchSensorData(true); // Refrescar datos
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="sensor-detail-container">
      {/* Cabecera Simplificada */}
      <nav className="sensor-breadcrumb">
        <span><Cpu size={16} /> Dispositivo: <strong>{sensor?.device?.name}</strong></span>
      </nav>

      <header className="detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="sensor-title">
            <h1>{sensor?.name || sensor?.type}</h1>
            <span className="badge-id">ID: {sensor?.id?.substring(0,8)}</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-edit" onClick={() => setIsModalOpen(true)}>
            <Edit3 size={18} /> Editar
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            <Trash2 size={18} /> Eliminar
          </button>
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <p>Última Lectura</p>
            <h3>{readings[0]?.value ?? '--'} <small>{sensor?.unit}</small></h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><Database size={24} /></div>
          <div className="stat-info">
            <p>Registros en DB</p>
            <h3>{readings.length}</h3>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <section className="history-section">
        <div className="section-header">
          <h3><Clock size={20} /> Historial Blockchain</h3>
          <span className="blockchain-badge"><ShieldCheck size={14}/> SHA-256 Verified</span>
        </div>
        
        <div className="table-responsive">
          <table className="readings-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Valor</th>
                <th>Hash de Integridad</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id} className="reading-row-adaptive">
                  <td className="cell-timestamp">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="cell-value">
                    <span className="value-badge-adaptive">{r.value} {sensor?.unit}</span>
                  </td>
                  <td className="cell-hash">
                    <div className="hash-container-adaptive">
                      <ShieldCheck size={14} className="hash-icon-adaptive" />
                      <code>{r.hash?.substring(0, 24)}...</code>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- MODAL DE EDICIÓN --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Sensor</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Nombre del Sensor</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  placeholder="Ej: Temperatura Tanque"
                />
              </div>
              <div className="form-group">
                <label>Unidad de Medida</label>
                <input 
                  type="text" 
                  value={editData.unit} 
                  onChange={(e) => setEditData({...editData, unit: e.target.value})} 
                  placeholder="Ej: °C, %, hPa"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorDetailPage;