import React from 'react';
import Button from '../../../components/Button'
import { Save, X } from 'lucide-react';

const ProjectForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  return (
    <form onSubmit={onSubmit} className="modern-form">
      <div className="form-group">
        <label>Nombre de la Planta / Proyecto</label>
        <input 
          value={formData.name || ''}
          onChange={e => setFormData({...formData, name: e.target.value})}
          placeholder="Ej: Central Hidroeléctrica Norte"
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Descripción Técnica</label>
        <textarea 
          value={formData.description || ''}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Detalles de la ubicación o activos..."
          className="form-textarea"
        />
      </div>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel} icon={<X size={18} />}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" icon={<Save size={18} />}>
          {isEditing ? 'Actualizar' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;