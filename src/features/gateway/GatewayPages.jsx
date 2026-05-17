import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
  ArrowLeft, Plus, Trash2, Edit3, ChevronRight, 
  Settings, Wifi, Box, Terminal, Monitor, Clock 
} from 'lucide-react';
import './Gateway.css';

const GatewaysPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  
  // ESTADOS PRINCIPALES
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [configText, setConfigText] = useState("");

  // 1. CARGAR DATOS DEL BACKEND
  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/gateways?locationId=${locationId}`);
      setGateways(res.data);
    } catch (err) {
      console.error("Error cargando gateways:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      setGateways([]);
      fetchGateways();}
  }, [locationId]);

  // 2. MODAL CON JSON
  const openModal = (gw = null) => {
    if (gw) {
      setSelectedGateway(gw);
      setConfigText(JSON.stringify(gw.config || {}, null, 2));
    } else {
      setSelectedGateway(null);

      const exampleJson = {
        gatewayMac: "22:0A:C4:00:01:10",
        publicKey: "LLAVE_PUBLICA_EN_ESP32",
        locationId: locationId,
        devices: [
          {
            deviceId: "NODO-TANQUE",
            name: "Sensores de Cisterna",
            sensors: [
              { name: "Nivel Agua", type: "nivel", unit: "mm" },
              { name: "Humedad", type: "humedad", unit: "%" }
            ]
          },
          {
            deviceId: "NODO-GPS",
            name: "Módulo de Ubicación",
            sensors: [
              { name: "Latitud", type: "lat", unit: "deg" },
              { name: "Longitud", type: "lng", unit: "deg" }
            ]
          }
        ]
      };

      setConfigText(JSON.stringify(exampleJson, null, 2));
    }

    setShowModal(true);
  };

  // 3. ELIMINAR
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta infraestructura?")) {
      try {
        await api.delete(`/gateways/${id}`);
        fetchGateways();
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="gateways-container">

      {/* NAV */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-item clickable" onClick={() => navigate('/proyectos')}>Proyectos</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item clickable" onClick={() => navigate(-1)}>Locación</span>
        <ChevronRight size={14} className="separator" />
        <span className="breadcrumb-item active">Gateways</span>
      </nav>

      {/* HEADER */}
      <div className="gateways-header">
        <button className="btn-back-theme" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="title-section">
          <h1 className="theme-title">Gestión de Gateways</h1>
          <p className="subtitle-theme">Locación ID: <strong>{locationId}</strong></p>
        </div>

        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={20} /> Vincular Nuevo
        </button>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="gateways-grid">
          {gateways.length === 0 ? (
            <div className="empty-gateway-card">
              <div className="empty-icon-glow">
                <Wifi size={48} className="wifi-pulse" />
              </div>
              <h3>En espera de infraestructura</h3>
              <p>No se han detectado Gateways vinculados a esta locación.</p>
            </div>
          ) : (
            gateways.map((gw) => (
              <div key={gw.id} className="gateway-card">
                <div className="gw-card-header">
                  <div className="gw-icon-wrapper"><Settings size={22} /></div>
                  <div className="gw-info-text">
                    <h3>{gw.name}</h3>
                    <span className={`status-pill ${gw.status.toLowerCase()}`}>
                      ● {gw.status === 'PENDING' ? 'EN ESPERA' : 'ACTIVO'}
                    </span>
                  </div>
                </div>

                <div className="gw-stats-body">
                  <div className="stat-row">
                    <Terminal size={14} /> <code>{gw.gatewayMac}</code>
                  </div>
                  <div className="stat-row">
                    <Box size={14} /> <span>{gw.devices?.length || 0} Nodos vinculados</span>
                  </div>
                  <div className="stat-row">
                    <Clock size={14} /> <span>{new Date(gw.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button 
                  className="btn-gw-main"
                  onClick={() => navigate(`/location/${locationId}/devices`)}
                >
                  <Monitor size={18} /> Gestionar Dispositivos
                </button>

                <div className="gw-actions-row">
                  <button className="btn-gw-icon" title="Terminal">
                    <Terminal size={18} />
                  </button>

                  <button 
                    className="btn-gw-icon" 
                    onClick={() => openModal(gw)} 
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>

                  <button 
                    className="btn-gw-icon delete" 
                    onClick={() => handleDelete(gw.id)} 
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL JSON */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <h2>Configuración JSON</h2>

            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              rows={18}
              style={{ width: "100%" }}
            />

            <button onClick={() => setShowModal(false)}>
              Cerrar
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default GatewaysPage;