import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { UserPlus, Trash2, Edit3, Shield, Mail, X } from 'lucide-react';
import './UsersPage.css';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'ADMIN' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/admins');
      setUsers(res.data);
    } catch (err) { console.error("Error al traer usuarios"); }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ email: user.email, password: '', role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ email: '', password: '', role: 'ADMIN' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/auth/admins/${editingUser.id}`, formData);
      } else {
        await api.post('/auth/create-admin', formData);
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) { alert(err.response?.data?.message || "Error en la operación"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este administrador?")) {
      await api.delete(`/auth/admins/${id}`);
      fetchUsers();
    }
  };

  return (
    <div className="users-container">
      <header className="users-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p style={{color: 'var(--text-secondary)'}}>Control de acceso para administradores del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} style={{marginRight: '8px'}} /> Nuevo Admin
        </button>
      </header>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Mail size={16} color="var(--text-secondary)"/>
                    {user.email}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role === 'SUPER_ADMIN' ? 'role-super' : 'role-admin'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleOpenModal(user)}><Edit3 size={16}/></button>
                  <button className="btn-danger" onClick={() => handleDelete(user.id)}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h3>{editingUser ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
              <X cursor="pointer" onClick={() => setIsModalOpen(false)} />
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="admin@empresa.com"
                />
              </div>

              <div className="form-group">
                <label>{editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                <input 
                  type="password" 
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Rol de Sistema</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;