import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Cpu, 
  ArrowLeft, 
  Plus, 
  Wifi, 
  WifiOff, 
  Trash2, 
  RefreshCcw, 
  ZapOff,
  Activity
} from 'lucide-react';
import './Devices.css';

const DevicesPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Estado para el formulario (deviceId es el ChipID/MAC del ESP32)
  const [formData, setFormData] = useState({ 
    deviceId: '', 
    name: '', 
    gatewayId: '' 
  });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // OJO: Como tu backend aún no filtra por locationId en el GET, 
      // aquí traemos todos, pero lo ideal sería /devices?locationId=...
      const res = await api.get('/devices');
      // Filtramos en el front por ahora para que solo veas los de esta locación
      const filtered = res.data.filter(d => d.locationId === locationId);
      setDevices(filtered);
    } catch (err) {
      console.error("Error cargando dispositivos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [locationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Enviamos los datos al backend incluyendo el locationId de la URL
      await api.post('/devices', { ...formData, locationId });
      setShowModal(false);
      setFormData({ deviceId: '', name: '', gatewayId: '' });
      fetchDevices();
    } catch (err) {
      alert("Error al vincular dispositivo: " + err.response?.data?.message);
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("¿Deseas revocar el acceso a este dispositivo?")) {
      try {
        await api.patch(`/devices/${id}/revoke`);
        fetchDevices();
      } catch (err) {
        alert("No se pudo revocar");
      }
    }
  };

  // Función para dar color al estado
  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: { color: '#22c55e', bg: '#dcfce7', icon: <Wifi size={14}/> },
      PENDING: { color: '#eab308', bg: '#fef9c3', icon: <Activity size={14}/> },
      REVOKED: { color: '#ef4444', bg: '#fee2e2', icon: <WifiOff size={14}/> }
    };
    const current = styles[status] || styles.PENDING;
    return (
      <span className="status-badge" style={{ backgroundColor: current.bg, color: current.color }}>
        {current.icon} {status}
      </span>
    );
  };

  return (
    <div className="devices-container">
      <div className="devices-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="title-section">
          <h1>Dispositivos IoT (ESP32)</h1>
          <p>Gestiona los nodos de esta ubicación</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Vincular Nuevo ESP
        </button>
      </div>

      {loading ? (
        <div className="loader">Cargando dispositivos...</div>
      ) : (
        <div className="devices-list">
          {devices.length === 0 && <p className="empty-msg">No hay dispositivos vinculados a esta área.</p>}
          
          <table className="devices-table">
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Chip ID / MAC</th>
                <th>Estado</th>
                <th>Última Señal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(dev => (
                <tr key={dev.id}>
                  <td>
                    <div className="device-info-cell">
                      <div className="device-avatar"><Cpu size={20} /></div>
                      <span>{dev.name || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="mono-text">{dev.deviceId}</td>
                  <td>{getStatusBadge(dev.status)}</td>
                  <td>{dev.lastSeen ? new Date(dev.lastSeen).toLocaleString() : 'Nunca'}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-revoke" 
                        title="Revocar"
                        onClick={() => handleRevoke(dev.id)}
                        disabled={dev.status === 'REVOKED'}
                      >
                        <ZapOff size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE VINCULACIÓN */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Vincular ESP32</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Chip ID / Device ID (Obligatorio)</label>
                <input 
                  placeholder="Ej: ESP32-908234"
                  value={formData.deviceId}
                  onChange={e => setFormData({...formData, deviceId: e.target.value})}
                  required
                />
                <small>Introduce el ID único que muestra el monitor serie del ESP32</small>
              </div>
              <div className="form-group">
                <label>Nombre Amigable</label>
                <input 
                  placeholder="Ej: Sensor Temperatura Humos"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Vincular</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;