import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 
import { MapPin, ArrowLeft, Plus, Trash2, Edit3, Cpu, ChevronRight, X } from 'lucide-react';
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
      setLocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando locaciones", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (projectId) fetchLocations(); 
  }, [projectId]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta locación?")) {
      try {
        await api.delete(`/location/${id}`);
        fetchLocations();
      } catch (err) {
        alert("Error al eliminar. Verifique si tiene dispositivos vinculados.");
      }
    }
  };

  const openEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({ name: loc.name, address: loc.address || '' });
    setShowModal(true);
  };

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
      {/* --- BREADCRUMBS (Jerarquía visual) --- */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-item clickable" onClick={() => navigate('/proyectos')}>Proyectos</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item active">Locaciones</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item">Dispositivos</span>
      </nav>

      <div className="locations-header">
        <button className="btn-back-theme" onClick={() => navigate('/proyectos')}>
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="title-section">
          <h1>Locaciones del Proyecto</h1>
          <p className="subtitle-id">ID de Proyecto: <strong>{projectId}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nueva Locación
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Sincronizando locaciones...</p>
        </div>
      ) : (
        <div className="grid-locations">
          {locations.map(loc => (
            <div key={loc.id} className="location-card">
              {/* MENÚ DE ACCIONES (Editar/Eliminar) */}
              <div className="card-actions-menu">
                <button onClick={() => openEdit(loc)} className="icon-btn edit">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(loc.id)} className="icon-btn delete">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="card-icon">
                <MapPin size={32} color="var(--primary-color)" />
              </div>
              <div className="card-info">
                <h3>{loc.name}</h3>
                <p>{loc.address || 'Sin dirección registrada'}</p>
              </div>
              
              <button 
                className="btn-manage-devices" 
                onClick={() => navigate(`/location/${loc.id}/devices`)}
              >
                <Cpu size={16} /> Gestionar Dispositivos
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL TEMATIZADO --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Editar' : 'Nueva'} Locación</h2>
              <button className="btn-close" onClick={closeModal}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la Locación</label>
                <input 
                  placeholder="Ej: Almacén Principal"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección / Referencia</label>
                <input 
                  placeholder="Ej: Av. Principal 123"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;