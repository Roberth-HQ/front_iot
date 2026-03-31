import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Cpu, ArrowLeft, Plus, Wifi, WifiOff, Trash2, ZapOff, 
  Activity, Thermometer, Droplets, Gauge, ChevronDown, ChevronUp 
} from 'lucide-react';
import './Devices.css';

const DevicesPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDevice, setExpandedDevice] = useState(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/devices');
      // Filtramos por locationId
      const filtered = res.data.filter(d => d.locationId === locationId);
      setDevices(filtered);
    } catch (err) {
      console.error("Error cargando dispositivos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) fetchDevices();
  }, [locationId]);

  // AGREGAMOS LA FUNCIÓN QUE FALTABA
  const handleRevoke = async (id) => {
    if (window.confirm("¿Estás seguro de revocar este dispositivo?")) {
      try {
        await api.patch(`/devices/${id}/revoke`);
        fetchDevices(); // Recargar lista
      } catch (err) {
        alert("Error al revocar");
      }
    }
  };

  const getSensorIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'temperature': return <Thermometer size={16} />;
      case 'humidity': return <Droplets size={16} />;
      default: return <Gauge size={16} />;
    }
  };

  return (
    <div className="devices-container">
      <div className="devices-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="title-section">
          <h1>Dispositivos IoT</h1>
          <p>Gestionando locación: {locationId}</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} /> Vincular Nuevo
        </button>
      </div>

      <table className="devices-table">
        <thead>
          <tr>
            <th></th>
            <th>Dispositivo</th>
            <th>ID Físico</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((dev) => (
            <React.Fragment key={dev.id}>
              <tr>
                <td>
                  <button 
                    className="btn-expand" 
                    onClick={() => setExpandedDevice(expandedDevice === dev.id ? null : dev.id)}
                  >
                    {expandedDevice === dev.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                </td>
                <td>
                  <div className="device-info-cell">
                    <div className="device-avatar"><Cpu size={20} /></div>
                    <span>{dev.name || 'ESP32 Node'}</span>
                  </div>
                </td>
                <td className="mono-text">{dev.deviceId}</td>
                <td>
                  <span className={`status-pill ${dev.status}`}>
                    {dev.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn-revoke" 
                    onClick={() => handleRevoke(dev.id)} 
                    disabled={dev.status === 'REVOKED'}
                  >
                    <ZapOff size={16} />
                  </button>
                </td>
              </tr>
              {expandedDevice === dev.id && (
                <tr className="sensors-row">
                  <td colSpan="5">
                    <div className="sensors-container">
                      <h4><Activity size={16} /> Sensores Vinculados</h4>
                      <div className="sensors-grid">
                        {dev.sensors && dev.sensors.length > 0 ? (
                          dev.sensors.map(snr => (
                            <div 
                              key={snr.id} 
                              className="sensor-card clickable" 
                              onClick={() => navigate(`/sensor/${snr.id}`)}
                            >
                              {getSensorIcon(snr.type)}
                              <div className="sensor-details">
                                <span className="sensor-name">{snr.name || snr.type}</span>
                                <span className="sensor-value">-- {snr.unit || ''}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="no-sensors">Sin sensores configurados.</p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DevicesPage;