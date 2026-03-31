import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Database, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import './SensorDetail.css';

const SensorDetailPage = () => {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      // Usamos tu ruta getSensorByIdController que ya incluye readings
      const res = await api.get(`/sensors/${sensorId}`);
      setSensor(res.data);
      // Tu service de sensor ya trae las readings ordenadas si lo configuramos
      setReadings(res.data.readings || []);
    } catch (err) {
      console.error("Error cargando datos del sensor", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Opcional: Polling cada 10 segundos para ver datos "en vivo"
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, [sensorId]);

  if (loading) return <div className="loader">Cargando historial...</div>;

  return (
    <div className="sensor-detail-container">
      <header className="detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Volver
        </button>
        <div className="sensor-title">
          <h1>{sensor?.name || sensor?.type}</h1>
          <span className="badge-id">ID: {sensor?.id}</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <TrendingUp className="icon-blue" />
          <div>
            <p>Último Valor</p>
            <h3>{readings[0]?.value ?? '--'} <small>{sensor?.unit}</small></h3>
          </div>
        </div>
        <div className="stat-card">
          <Database className="icon-green" />
          <div>
            <p>Total Lecturas</p>
            <h3>{readings.length}</h3>
          </div>
        </div>
      </div>

      <section className="history-section">
        <h3><Clock size={20} /> Historial de Lecturas (Hash Verificado)</h3>
        <div className="table-responsive">
          <table className="readings-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Valor</th>
                <th>Hash de Seguridad (Blockchain)</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="value-cell">{r.value} {sensor?.unit}</td>
                  <td className="hash-cell">
                    <ShieldCheck size={14} className="icon-shield" />
                    <code>{r.hash?.substring(0, 16)}...</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SensorDetailPage;