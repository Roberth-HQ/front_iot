import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  ShieldCheck, AlertTriangle, Clock, Database, 
  CheckCircle, RefreshCw, Box, Lock 
} from 'lucide-react';
import './BlockchainPage.css';
import { useProjectStore } from '../../store/projectStore';

const BlockchainPage = () => {
  const { selectedProjectId } = useProjectStore();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [auditReport, setAuditReport] = useState(null);

  useEffect(() => {
    if (selectedProjectId) fetchData(selectedProjectId);
  }, [selectedProjectId]);

  const fetchData = async (projectId) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/blockchain/explorer?projectId=${projectId}`);
      setBlocks(res.data);
      
      if (res.data.length > 0) {
        // Asumimos auditoría del dispositivo del primer bloque por ahora
        const auditRes = await api.get(`/api/blockchain/audit/${res.data[0].deviceId}`);
        setAuditReport(auditRes.data);
      }
    } catch (err) {
      console.error("Error al sincronizar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBlock = async (blockId) => {
    setVerifyingId(blockId);
    try {
      const res = await api.get(`/api/blockchain/verify/${blockId}`);
      // Aquí podrías disparar una notificación tipo Toast
      alert(res.data.isValid ? "✅ Bloque íntegro" : "❌ ¡BLOQUE CORRUPTO!");
    } catch (err) {
      alert("Error en la verificación.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="blockchain-container">
      {/* EL ESCUDO DE SEGURIDAD */}
      <section className="audit-summary">
        <div className={`status-card ${auditReport?.isValidChain ? 'status-ok' : 'status-error'}`}>
          <div className="status-icon">
            {auditReport?.isValidChain ? (
              <ShieldCheck size={48} />
            ) : (
              <AlertTriangle size={48} />
            )}
          </div>
          <div className="status-text">
            <h3>{auditReport?.isValidChain ? "Integridad Garantizada" : "Alerta de Seguridad"}</h3>
            <p>
              {auditReport?.isValidChain 
                ? "Todos los registros coinciden con sus firmas criptográficas originales." 
                : "Se han detectado alteraciones manuales en los registros de la base de datos."}
            </p>
          </div>
          <button className="re-audit-btn" onClick={() => fetchData(selectedProjectId)}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            {loading ? " Verificando..." : " Re-auditar Sistema"}
          </button>
        </div>
      </section>

      <div className="blockchain-header">
        <h2>Explorador de Bloques Inmutables</h2>
        <p>Cada bloque contiene un lote de lecturas selladas con Merkle Root.</p>
      </div>

      {loading && blocks.length === 0 ? (
        <div className="loader">Sincronizando con el nodo central...</div>
      ) : (
        <div className="blockchain-feed">
          {blocks.map((block, index) => (
            <div key={block.id} className="block-card">
              <div className="block-header">
                <div className="block-info-main">
                  <Box size={18} className="text-blue-500" />
                  <span className="block-number">BLOQUE # {blocks.length - index}</span>
                </div>
                <div className="block-date">
                  <Clock size={14} /> {new Date(block.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="hash-grid">
                <div className="hash-item">
                  <label><Lock size={10} /> Sello del Bloque (Hash)</label>
                  <code>{block.blockHash}</code>
                </div>
                <div className="hash-item">
                  <label><Database size={10} /> Merkle Root (Datos)</label>
                  <code>{block.merkleRoot}</code>
                </div>
              </div>

              <div className="block-footer">
                <div className="device-tag">
                  <CheckCircle size={14} />
                  <span><strong>{block.device?.name || 'ESP32'}</strong>: {block.batchData?.length || 0} lecturas</span>
                </div>
                <button 
                  className={`verify-btn ${verifyingId === block.id ? 'loading' : ''}`}
                  onClick={() => handleVerifyBlock(block.id)}
                  disabled={verifyingId === block.id}
                >
                  {verifyingId === block.id ? "Analizando..." : "Verificar Integridad"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockchainPage;