import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin, ArrowLeft, Plus, Trash2, Edit3, Smartphone, Loader2 } from 'lucide-react';
import './Locations.css';

const LocationsPage = () => {
  const { projectId } = useParams(); 
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '' }); // Usamos 'address' como en el modelo de Prisma

  // 1. OBTENER LOCACIONES (Usando el query param ?projectId=)
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/location?projectId=${projectId}`);
      setLocations(res.data);
    } catch (err) {
      console.error("Error cargando locaciones", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (projectId) fetchLocations(); 
  }, [projectId]);

  // 2. CREAR O EDITAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // RUTA: PUT /location/:id
        await api.put(`/location/${editingId}`, formData);
      } else {
        // RUTA: POST /location (incluyendo projectId en el body)
        const dataToSave = { ...formData, projectId };
        await api.post(`/location`, dataToSave);
      }
      closeModal();
      fetchLocations();
    } catch (err) {
      alert("Error al procesar la locación");
    }
  };

  // 3. ELIMINAR
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta locación?")) {
      try {
        // RUTA: DELETE /location/:id
        await api.delete(`/location/${id}`);
        fetchLocations();
      } catch (err) {
        alert("Error al eliminar");
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

  return (
    <div className="locations-container">
      <div className="locations-header">
        <button className="btn-back" onClick={() => navigate('/proyectos')}>
          <ArrowLeft size={20} /> Volver a Proyectos
        </button>
        <div className="title-section">
          <h1>Locaciones del Proyecto</h1>
          <p className="subtitle">Gestiona las áreas de monitoreo para el proyecto: <strong>{projectId?.slice(0,8)}</strong></p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Nueva Locación
        </button>
      </div>

      {loading ? (
        <div className="loader"><Loader2 className="spinner" /> Cargando...</div>
      ) : (
        <div className="grid-locations">
          {locations.length === 0 && <p className="empty-msg">No hay locaciones registradas.</p>}
          
          {locations.map(loc => (
            <div key={loc.id} className="location-card">
              <div className="card-actions-top">
                <button className="btn-icon" onClick={() => openEdit(loc)}><Edit3 size={16} /></button>
                <button className="btn-icon delete" onClick={() => handleDelete(loc.id)}><Trash2 size={16} /></button>
              </div>
              
              <div className="card-icon">
                <MapPin size={32} color="var(--primary-color)" />
              </div>
              
              <div className="card-info">
                <h3>{loc.name}</h3>
                <p className="address-text">{loc.address || 'Sin dirección'}</p>
                <div className="stats">
                  <Smartphone size={14} /> <span>0 Dispositivos</span>
                </div>
              </div>
              
              <button className="btn-view-devices">Gestionar Dispositivos</button>
            </div>
          ))}
        </div>
      )}
      
      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Editar Locación' : 'Nueva Locación'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text"
                  placeholder="Ej: Almacén Norte"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dirección / Referencia</label>
                <input 
                  type="text"
                  placeholder="Ej: Pasillo 4, Puerta B"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;