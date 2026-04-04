import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Cpu, ArrowLeft, Plus, Trash2, ZapOff, Activity, 
  Thermometer, Droplets, Gauge, ChevronDown, ChevronUp, 
  X, PlusCircle, ChevronRight 
} from 'lucide-react';
import './Devices.css';

const DevicesPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDevice, setExpandedDevice] = useState(null);

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const [newDevice, setNewDevice] = useState({ deviceId: '', name: '' });
  const [newSensor, setNewSensor] = useState({ name: '', type: 'temperature', unit: '°C' });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/devices');
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

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/devices', { ...newDevice, locationId });
      setShowDeviceModal(false);
      setNewDevice({ deviceId: '', name: '' });
      fetchDevices();
    } catch (err) { alert("Error al vincular"); }
  };

  const handleCreateSensor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sensors', { ...newSensor, deviceId: selectedDeviceId });
      setShowSensorModal(false);
      setNewSensor({ name: '', type: 'temperature', unit: '°C' });
      fetchDevices();
    } catch (err) { alert("Error al crear sensor"); }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm("¿Eliminar definitivamente este dispositivo?")) {
      try {
        await api.delete(`/devices/${id}`);
        fetchDevices();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("¿Revocar acceso?")) {
      try { await api.patch(`/devices/${id}/revoke`); fetchDevices(); } 
      catch (err) { alert("Error al revocar"); }
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
      {/* BREADCRUMBS */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-item clickable" onClick={() => navigate('/proyectos')}>Proyectos</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item clickable" onClick={() => navigate(-1)}>Locaciones</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item active">Dispositivos</span>
      </nav>

      <div className="devices-header">
        <button className="btn-back-theme" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="title-section">
          <h1>Dispositivos IoT</h1>
          <p className="subtitle-theme">Locación: <strong>{locationId}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowDeviceModal(true)}>
          <Plus size={20} /> Vincular Nuevo
        </button>
      </div>

      {/* MODAL DISPOSITIVO */}
      {showDeviceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo Dispositivo</h2>
              <button className="btn-close" onClick={() => setShowDeviceModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateDevice}>
              <div className="form-group">
                <label>ID Físico (Unique)</label>
                <input type="text" required value={newDevice.deviceId} onChange={(e) => setNewDevice({...newDevice, deviceId: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nombre Personalizado</label>
                <input type="text" value={newDevice.name} onChange={(e) => setNewDevice({...newDevice, name: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDeviceModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Vincular</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SENSOR */}
      {showSensorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Añadir Sensor</h2>
              <button className="btn-close" onClick={() => setShowSensorModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateSensor}>
              <div className="form-group">
                <label>Nombre del Sensor</label>
                <input type="text" required value={newSensor.name} onChange={(e) => setNewSensor({...newSensor, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tipo de Sensor</label>
                <select className="modal-select" value={newSensor.type} onChange={(e) => setNewSensor({...newSensor, type: e.target.value})}>
                  <option value="temperature">Temperatura</option>
                  <option value="humidity">Humedad</option>
                  <option value="pressure">Presión</option>
                  <option value="co2">CO2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unidad (Ej: °C)</label>
                <input type="text" value={newSensor.unit} onChange={(e) => setNewSensor({...newSensor, unit: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSensorModal(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Crear Sensor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
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
                    <button className="btn-expand" onClick={() => setExpandedDevice(expandedDevice === dev.id ? null : dev.id)}>
                      {expandedDevice === dev.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                    </button>
                  </td>
                  <td>
                    <div className="device-info-cell">
                      <div className="device-avatar"><Cpu size={18} /></div>
                      <span className="device-name-text">{dev.name || 'ESP32 Node'}</span>
                    </div>
                  </td>
                  <td><code className="mono-text-theme">{dev.deviceId}</code></td>
                  <td><span className={`status-pill ${dev.status}`}>{dev.status}</span></td>
                  <td className="actions-cell">
                    <button className="btn-revoke" title="Revocar" onClick={() => handleRevoke(dev.id)} disabled={dev.status === 'REVOKED'}>
                      <ZapOff size={16} />
                    </button>
                    <button className="btn-delete-device" title="Eliminar" onClick={() => handleDeleteDevice(dev.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
                {expandedDevice === dev.id && (
                  <tr className="sensors-row-theme">
                    <td colSpan="5">
                      <div className="sensors-expanded-container">
                        <div className="sensors-header-inline">
                          <h4><Activity size={16} /> Sensores Vinculados</h4>
                          <button className="btn-add-sensor" onClick={() => { setSelectedDeviceId(dev.id); setShowSensorModal(true); }}>
                            <PlusCircle size={14} /> Nuevo Sensor
                          </button>
                        </div>
                        <div className="sensors-grid">
                          {dev.sensors?.map(snr => (
                            <div key={snr.id} className="sensor-card-theme" onClick={() => navigate(`/sensor/${snr.id}`)}>
                              <div className="sensor-icon-circle">{getSensorIcon(snr.type)}</div>
                              <div className="sensor-details">
                                <span className="snr-name">{snr.name || snr.type}</span>
                                <span className="snr-value">-- {snr.unit}</span>
                              </div>
                            </div>
                          ))}
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
    </div>
  );
};

export default DevicesPage;