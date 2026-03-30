import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // VERIFICA QUE ESTA RUTA SEA CORRECTA
import { MapPin, ArrowLeft, Plus, Trash2, Edit3, Smartphone, Loader2, Cpu } from 'lucide-react';
import './Locations.css';

const LocationsPage = () => {
  const { projectId } = useParams(); 
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/location?projectId=${projectId}`);
      // Nos aseguramos de que siempre sea un array
      setLocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando locaciones", err);
      setLocations([]); // Evita que el .map falle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (projectId) fetchLocations(); 
  }, [projectId]);

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', address: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/location/${editingId}`, formData);
      } else {
        await api.post(`/location`, { ...formData, projectId });
      }
      closeModal();
      fetchLocations();
    } catch (err) {
      alert("Error al guardar");
    }
  };

  return (
    <div className="locations-container">
      <div className="locations-header">
        <button className="btn-back" onClick={() => navigate('/proyectos')}>
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="title-section">
          <h1>Locaciones del Proyecto</h1>
          <p>ID: {projectId}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nueva Locación
        </button>
      </div>

      {loading ? (
        <div className="loader">Cargando...</div>
      ) : (
        <div className="grid-locations">
          {locations && locations.map(loc => (
            <div key={loc.id} className="location-card">
              <div className="card-icon">
                <MapPin size={32} color="var(--primary-color)" />
              </div>
              <div className="card-info">
                <h3>{loc.name}</h3>
                <p>{loc.address || 'Sin dirección'}</p>
              </div>
              {/* EL BOTÓN QUE NOS IMPORTA */}
              <button 
                className="btn-view-devices" 
                onClick={() => navigate(`/location/${loc.id}/devices`)}
              >
                <Cpu size={16} /> Gestionar Dispositivos
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Editar' : 'Nueva'} Locación</h2>
            <form onSubmit={handleSubmit}>
              <input 
                placeholder="Nombre"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <input 
                placeholder="Dirección"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;