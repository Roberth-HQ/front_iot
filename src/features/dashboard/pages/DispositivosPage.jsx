import React from 'react';
import './Dispositivos.css';

const DispositivosPage = () => {
  // Datos de ejemplo como si vinieran de tu API de IoT
  const dispositivos = [
    { id: 1, nombre: 'Sensor Temperatura A1', estado: 'Online', valor: '24°C', bateria: '85%' },
    { id: 2, nombre: 'Humedad Planta Central', estado: 'Online', valor: '45%', bateria: '12%' },
    { id: 3, nombre: 'Vibración Motor 04', estado: 'Offline', valor: '0 Hz', bateria: '0%' },
    { id: 4, nombre: 'Cámara Acceso Norte', estado: 'Online', valor: 'Activa', bateria: '100%' },
  ];

  return (
    <div className="dispositivos-container">
      <div className="header-page">
        <div>
          <h1 className="title">Gestión de Dispositivos</h1>
          <p className="subtitle">Monitoreo en tiempo real de la fábrica</p>
        </div>
        <button className="btn-add">+ Nuevo Dispositivo</button>
      </div>

      <div className="grid-dispositivos">
        {dispositivos.map((device) => (
          <div key={device.id} className="device-card">
            <div className="card-top">
              <span className={`status-dot ${device.estado.toLowerCase()}`}></span>
              <span className="device-id">ID: {device.id.toString().padStart(3, '0')}</span>
            </div>
            
            <h3 className="device-name">{device.nombre}</h3>
            
            <div className="device-stats">
              <div className="stat">
                <span className="stat-label">Lectura</span>
                <span className="stat-value">{device.valor}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Batería</span>
                <span className="stat-value" style={{ color: parseInt(device.bateria) < 20 ? '#ef4444' : 'inherit' }}>
                  {device.bateria}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-action">Configurar</button>
              <button className="btn-action primary">Ver Historial</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DispositivosPage;