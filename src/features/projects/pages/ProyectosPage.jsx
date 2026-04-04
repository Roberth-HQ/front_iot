import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Home, Factory, Trash2, Edit3, ChevronRight } from 'lucide-react';
import './Proyectos.css';
import { useNavigate } from 'react-router-dom';

const ProyectosPage = () => {
  const [proyectos, setProyectos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({ name: '', description: '', type: 'CASA' });
  const navigate = useNavigate();

  const fetchProyectos = async () => {
    try {
      const res = await api.get('/project');
      setProyectos(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProyectos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, ...dataToSend } = formData;
    try {
      if (editingId) {
        await api.put(`/project/${editingId}`, dataToSend);
      } else {
        await api.post('/project', dataToSend);
      }
      closeModal();
      fetchProyectos();
    } catch (err) {
      alert("Error al procesar la solicitud");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este proyecto?")) {
      try {
        await api.delete(`/project/${id}`);
        fetchProyectos();
      } catch (err) { 
        alert("Error al eliminar: Verifica si tiene locaciones vinculadas"); 
      }
    }
  };

  const openEdit = (proyecto) => {
    setEditingId(proyecto.id);
    setFormData({ 
      name: proyecto.name, 
      description: proyecto.description || '', 
      type: proyecto.type || 'CASA' 
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', type: 'CASA' });
  };

  return (
    <div className="proyectos-container">
      {/* --- SECUENCIA BREADCRUMBS --- */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-item active">Proyectos</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item">Locaciones</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item">Dispositivos</span>
      </nav>

      <div className="header-proyectos">
        <div className="title-area">
          <h1>Mis Proyectos</h1>
          <p className="subtitle">Gestiona tus entornos de monitoreo</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo Proyecto
        </button>
      </div>

      <div className="grid-proyectos">
        {proyectos.map(p => (
          <div key={p.id} className="proyecto-card">
            <div className="card-actions-menu">
              <button onClick={() => openEdit(p)} className="icon-btn edit"><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(p.id)} className="icon-btn delete"><Trash2 size={16} /></button>
            </div>
            
            <div className="proyecto-icon">
              {p.type === 'INDUSTRIA' ? 
                <Factory size={48} className="icon-svg-industry" /> : 
                <Home size={48} className="icon-svg-home" />
              }
            </div>
            
            <h3>{p.name}</h3>
            <span className={`badge ${p.type?.toLowerCase() || 'casa'}`}>{p.type || 'CASA'}</span>
            <p className="description">{p.description}</p>
            
            <button 
              className="btn-manage" 
              onClick={() => navigate(`/proyectos/${p.id}/locations`)}
            >
              Gestionar Locaciones
            </button>
          </div>
        ))}
      </div>

      {/* --- MODAL CON CLASES DEL TEMA --- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo de Entorno</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="modal-select"
                >
                  <option value="CASA">🏠 Hogar / Residencial</option>
                  <option value="INDUSTRIA">🏭 Industrial</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">Cancelar</button>
                <button type="submit" className="btn-save">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyectosPage;