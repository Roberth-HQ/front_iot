import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link as LinkIcon, Database, ShieldCheck, Cpu, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import './BlockchainPage.css';
import { useProjectStore } from '../../store/projectStore';

const BlockchainPage = () => {
  const { selectedProjectId } = useProjectStore();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null); // Para el spinner del botón
  const [auditReport, setAuditReport] = useState(null);

  useEffect(() => {
    if (selectedProjectId) {
      fetchData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchData = async (projectId) => {
    try {
      setLoading(true);
      // 1. Traer los bloques
      const res = await api.get(`/api/blockchain/explorer?projectId=${projectId}`);
      setBlocks(res.data);
      
      // 2. Si hay bloques, auditar el primer dispositivo que encontremos (o mejorar lógica después)
      if (res.data.length > 0) {
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
      alert(res.data.message); // Aquí podrías usar un Toast más elegante
      // Opcional: Actualizar el estado local para mostrar un check verde
    } catch (err) {
      alert("Error en la verificación técnica.");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="blockchain-container">
      {/* SECCIÓN 1: DASHBOARD DE ESTADO (NUEVA) */}
      <section className="audit-summary">
        <div className={`status-card ${auditReport?.isValidChain ? 'status-ok' : 'status-error'}`}>
          <div className="status-icon">
            {auditReport?.isValidChain ? <ShieldCheck size={40} /> : <AlertTriangle size={40} />}
          </div>
          <div className="status-text">
            <h3>Estado de Integridad de Datos</h3>
            <p>{auditReport?.isValidChain ? "Cadena verificada y sellada." : "Se detectaron inconsistencias en la cadena."}</p>
          </div>
          <button className="re-audit-btn" onClick={() => fetchData(selectedProjectId)}>
            Escanear ahora
          </button>
        </div>
      </section>

      <header className="blockchain-header">
        <h2><Search size={20} className="inline mr-2"/>Explorador de Auditoría</h2>
        <p>Registros protegidos mediante Merkle Trees y Hash Chaining.</p>
      </header>

      {loading ? (
        <div className="loader">Verificando criptografía...</div>
      ) : (
        <div className="blockchain-feed">
          {blocks.map((block, index) => (
            <div key={block.id} className="block-card">
              <div className="block-header">
                <span className="block-number">B-{blocks.length - index}</span>
                <span className="block-date">
                  <Clock size={12} /> {new Date(block.createdAt).toLocaleString()}
                </span>
                {/* BOTÓN DE VERIFICACIÓN (PUNTO 1 Y 5) */}
                <button 
                  className={`verify-btn ${verifyingId === block.id ? 'loading' : ''}`}
                  onClick={() => handleVerifyBlock(block.id)}
                  disabled={verifyingId === block.id}
                >
                  {verifyingId === block.id ? "Verificando..." : "Verificar Bloque"}
                </button>
              </div>

              <div className="hash-grid">
                <div className="hash-item">
                  <label>Block Hash (Sello del Bloque)</label>
                  <code className="block-hash">{block.blockHash}</code>
                </div>
                <div className="hash-item">
                  <label>Merkle Root</label>
                  <code className="merkle-root">{block.merkleRoot}</code>
                </div>
                <div className="hash-item">
                  <label>Previous Hash</label>
                  <code className="prev-hash">{block.previousHash}</code>
                </div>
              </div>

              <div className="block-footer">
                <Database size={14} />
                <span>{block.batchData?.length} lecturas de <strong>{block.device?.name}</strong></span>
                <CheckCircle size={14} className="ml-auto text-green-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockchainPage;