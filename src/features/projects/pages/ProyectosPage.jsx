import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Home, Factory, Trash2, Edit3 } from 'lucide-react';
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
    
    // 1. Limpiamos los datos: Quitamos 'type' porque tu Prisma no lo tiene aún
    // Esto evita el error "Unknown argument type"
    const { type, ...dataToSend } = formData;

    try {
      if (editingId) {
        // 2. PUT: Usamos editingId que es el ID que guardamos al hacer clic en editar
        await api.put(`/project/${editingId}`, dataToSend);
      } else {
        // 3. POST: Crear nuevo
        await api.post('/project', dataToSend);
      }
      closeModal();
      fetchProyectos();
    } catch (err) {
      console.error("Error en el submit:", err.response?.data);
      alert("Error al procesar la solicitud en el servidor");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta planta?")) {
      try {
        await api.delete(`/project/${id}`);
        fetchProyectos();
      } catch (err) { 
        console.error(err);
        alert("Error al eliminar: Es posible que tenga locaciones vinculadas"); 
      }
    }
  };

  const openEdit = (proyecto) => {
    setEditingId(proyecto.id);
    // Cargamos los datos en el formulario
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
      <div className="header-proyectos">
        <div>
          <h1>Mis Proyectos</h1>
          <p className="subtitle">Gestiona tus entornos de monitoreo</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Proyecto</button>
      </div>

      <div className="grid-proyectos">
        {proyectos.map(p => (
          <div key={p.id} className="proyecto-card">
            <div className="card-actions-menu">
              <button onClick={() => openEdit(p)} className="icon-btn"><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(p.id)} className="icon-btn delete"><Trash2 size={16} /></button>
            </div>
            
            <div className="proyecto-icon">
              {/* Aquí el icono cambia visualmente según el estado, aunque no se guarde en DB aún */}
              {formData.type === 'INDUSTRIA' ? <Factory size={48} color="var(--primary-color)" /> : <Home size={48} color="#10b981" />}
            </div>
            
            <h3>{p.name}</h3>
            {/* El badge se mantiene visualmente */}
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content shadow-lg">
            <h2>{editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <label>Tipo de Entorno (Solo visual)</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="modal-select"
              >
                <option value="CASA">🏠 Hogar / Residencial</option>
                <option value="INDUSTRIA">🏭 Industrial</option>
              </select>

              <label>Descripción</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
              
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