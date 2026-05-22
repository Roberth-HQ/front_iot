import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useProjectStore } from '../../store/projectStore';
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, Database,
  CheckCircle, RefreshCw, Box, Lock, ChevronDown, ChevronUp,
  AlertTriangle, Fingerprint, Hash, Layers, Eye, Zap,
  ScanSearch, Trash2, FileX, Edit3
} from 'lucide-react';
import './BlockchainPage.css';

const truncate = (s, n = 24) => s ? `${s.slice(0, n)}…${s.slice(-6)}` : '—';
const fmtDate  = (d) => new Date(d).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });

function StatusIcon({ status, size = 44 }) {
  if (status === 'ok')    return <ShieldCheck size={size} />;
  if (status === 'error') return <ShieldX size={size} />;
  return <ShieldAlert size={size} />;
}

// ── Ícono y color según tipo de adulteración ─────────────────
function TamperIcon({ tipo }) {
  if (tipo === 'VALUE_MODIFICADO')        return <Edit3  size={14} color="#f87171" />;
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO') return <FileX  size={14} color="#f59e0b" />;
  if (tipo === 'FILAS_ELIMINADAS')        return <Trash2 size={14} color="#ef4444" />;
  return <AlertTriangle size={14} color="#f87171" />;
}

function tamperColor(tipo) {
  if (tipo === 'VALUE_MODIFICADO')          return '#f87171';
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO') return '#f59e0b';
  if (tipo === 'FILAS_ELIMINADAS')          return '#ef4444';
  return '#f87171';
}

function tamperLabel(tipo) {
  if (tipo === 'VALUE_MODIFICADO')          return 'Valor modificado en BD';
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO') return 'Registro eliminado o hash alterado';
  if (tipo === 'FILAS_ELIMINADAS')          return 'Filas eliminadas de la BD';
  return 'Adulteración detectada';
}

export default function BlockchainPage() {
  const { selectedProjectId } = useProjectStore();
  const [blocks,       setBlocks]       = useState([]);
  const [auditReport,  setAuditReport]  = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [auditingAll,  setAuditingAll]  = useState(false);
  const [verifying,    setVerifying]    = useState({});
  const [blockResults, setBlockResults] = useState({});
  const [expanded,     setExpanded]     = useState({});

  const fetchAll = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/blockchain/explorer?projectId=${projectId}`);
      setBlocks(res.data || []);
      if (res.data?.length > 0) {
        const deviceId = res.data[0].deviceId;
        const audit    = await api.get(`/api/blockchain/audit/chain/${deviceId}`);
        setAuditReport(audit.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(selectedProjectId); }, [selectedProjectId, fetchAll]);

  const handleVerify = async (block) => {
    setVerifying(v => ({ ...v, [block.id]: true }));
    try {
      const res = await api.get(`/api/blockchain/verify/${block.id}`);
      setBlockResults(r => ({ ...r, [block.id]: res.data }));
      if (!res.data.isValid) setExpanded(e => ({ ...e, [block.id]: true }));
    } catch (err) {
      setBlockResults(r => ({ ...r, [block.id]: { isValid: false, error: err.message } }));
    } finally {
      setVerifying(v => ({ ...v, [block.id]: false }));
    }
  };

  const handleAuditAll = async () => {
    if (blocks.length === 0) return;
    setAuditingAll(true);
    const resultados = {};
    const expandidos = {};
    for (const block of blocks) {
      try {
        const res = await api.get(`/api/blockchain/verify/${block.id}`);
        resultados[block.id] = res.data;
        if (!res.data.isValid) expandidos[block.id] = true;
      } catch (err) {
        resultados[block.id] = { isValid: false, error: err.message };
        expandidos[block.id] = true;
      }
    }
    setBlockResults(resultados);
    setExpanded(expandidos);
    setAuditingAll(false);
  };

  const chainStatus   = auditReport === null ? 'unknown' : auditReport.isValidChain ? 'ok' : 'error';
  const totalBloques  = blocks.length;
  const totalLecturas = blocks.reduce((a, b) => a + (b.batchData?.length || 0), 0);
  const auditadosTodos = Object.keys(blockResults).length === blocks.length && blocks.length > 0;
  const bloquesOk     = Object.values(blockResults).filter(r => r.isValid).length;
  const bloquesFail   = Object.values(blockResults).filter(r => !r.isValid).length;

  return (
    <div className="blockchain-page">

      {/* Header */}
      <div className="bc-header">
        <div className="bc-title">
          <Layers size={22} color="#38bdf8" />
          Explorador de Cadena de Bloques
        </div>
        <div className="bc-subtitle">INTEGRIDAD CRIPTOGRÁFICA · MERKLE ROOT · ECDSA</div>
      </div>

      {/* Shield */}
      <div className={`bc-shield-wrap status-${chainStatus}`}>
        <div className="bc-shield-glow" />
        <div className="bc-shield-icon"><StatusIcon status={chainStatus} /></div>
        <div style={{ flex: 1 }}>
          <div className="bc-shield-title">
            {chainStatus === 'ok'      && 'Cadena Íntegra — Sin Alteraciones Detectadas'}
            {chainStatus === 'error'   && '¡Alerta! Se Detectaron Alteraciones en la Cadena'}
            {chainStatus === 'unknown' && 'Estado pendiente de auditoría'}
          </div>
          <div className="bc-shield-desc">
            {chainStatus === 'ok'
              ? 'Todos los bloques verificados. Los hashes encadenados coinciden.'
              : chainStatus === 'error'
              ? `${auditReport?.report?.filter(b => b.status !== 'OK').length || 0} bloque(s) con inconsistencias detectadas.`
              : 'Ejecuta una auditoría para conocer el estado de la cadena.'}
          </div>
          {chainStatus === 'error' && auditReport?.report && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {auditReport.report.map((b, i) => (
                <span key={i} className="bc-badge" style={{
                  color:      b.status === 'OK' ? '#22c55e' : '#ef4444',
                  background: b.status === 'OK' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border:     `1px solid ${b.status === 'OK' ? '#22c55e40' : '#ef444440'}`
                }}>
                  {b.status === 'OK' ? '✓' : '✗'} Bloque {i + 1}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bc-shield-actions">
          <button
            className="bc-btn-audit-all"
            onClick={handleAuditAll}
            disabled={auditingAll || loading || blocks.length === 0}
          >
            <ScanSearch size={14} className={auditingAll ? 'spin' : ''} />
            {auditingAll ? 'Auditando...' : 'Auditar Todo'}
          </button>
          <button className="bc-btn-primary" onClick={() => fetchAll(selectedProjectId)} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Cargando...' : 'Re-auditar'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bc-stats-row">
        {[
          { val: totalBloques,  label: 'Bloques totales',     color: '#38bdf8' },
          { val: totalLecturas, label: 'Lecturas selladas',   color: '#818cf8' },
          { val: bloquesOk,     label: 'Bloques íntegros',    color: '#22c55e' },
          { val: bloquesFail,   label: 'Bloques con fallo',   color: '#f87171' },
        ].map(({ val, label, color }) => (
          <div key={label} className="bc-stat-card" style={{ borderTop: `2px solid ${color}` }}>
            <div className="bc-stat-val" style={{ color }}>{val}</div>
            <div className="bc-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Banner resumen auditoría general */}
      {auditadosTodos && bloquesFail === 0 && (
        <div className="bc-summary-banner ok">
          <CheckCircle size={16} color="#22c55e" />
          <span>Auditoría completa — <strong>{totalBloques}</strong> bloques verificados sin alteraciones.</span>
        </div>
      )}
      {auditadosTodos && bloquesFail > 0 && (
        <div className="bc-summary-banner error">
          <AlertTriangle size={16} color="#f87171" />
          <span>
            Se encontraron <strong>{bloquesFail}</strong> bloque(s) adulterados de {totalBloques} auditados.
            Revisa el detalle de cada bloque marcado en rojo.
          </span>
        </div>
      )}

      {/* Feed de bloques */}
      {loading && blocks.length === 0 ? (
        <div className="bc-empty">
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block' }} />
          Sincronizando...
        </div>
      ) : blocks.length === 0 ? (
        <div className="bc-empty">
          <Box size={40} style={{ margin: '0 auto 1rem', display: 'block' }} />
          No hay bloques registrados.
          <div style={{ fontSize: '0.72rem', marginTop: '0.5rem', opacity: 0.5 }}>
            Se crean automáticamente cada 10 lecturas.
          </div>
        </div>
      ) : (
        <div className="bc-feed">
          {blocks.map((block, index) => {
            const result         = blockResults[block.id];
            const isVerif        = verifying[block.id];
            const isExp          = expanded[block.id];
            const status         = result ? (result.isValid ? 'valid' : 'invalid') : 'default';
            const auditRows      = auditReport?.report || [];
            const blockAudit     = auditRows[blocks.length - 1 - index];
            const readingAlterado = result?.details?.readingAlterado;
            const tipoColor      = readingAlterado ? tamperColor(readingAlterado.tipo) : '#f87171';

            return (
              <div key={block.id} className={`bc-block-card ${status}`}>

                {/* Header */}
                <div className="bc-block-header">
                  <Box size={16} color="#38bdf8" />
                  <span className="bc-block-num">BLOQUE #{blocks.length - index}</span>
                  <span className="bc-block-device">
                    {block.device?.name || block.device?.deviceId || 'Dispositivo'}
                  </span>

                  {result && (
                    <span className="bc-badge" style={{
                      color:      result.isValid ? '#22c55e' : '#ef4444',
                      background: result.isValid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border:     `1px solid ${result.isValid ? '#22c55e40' : '#ef444440'}`
                    }}>
                      {result.isValid ? '✓ ÍNTEGRO' : '✗ ALTERADO'}
                    </span>
                  )}
                  {blockAudit && !result && (
                    <span className="bc-badge" style={{
                      color:      blockAudit.status === 'OK' ? '#22c55e' : '#f59e0b',
                      background: blockAudit.status === 'OK' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                      border:     `1px solid ${blockAudit.status === 'OK' ? '#22c55e40' : '#f59e0b40'}`
                    }}>
                      {blockAudit.status === 'OK' ? '✓ CADENA OK' : '⚠ ESLABÓN ROTO'}
                    </span>
                  )}

                  <div className="bc-block-date">
                    <Clock size={12} /> {fmtDate(block.createdAt)}
                  </div>
                </div>

                {/* Hashes */}
                <div className="bc-hash-grid">
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Lock size={10} /> Sello del Bloque</div>
                    <code className="bc-hash-code">{truncate(block.blockHash)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Database size={10} /> Merkle Root</div>
                    <code className="bc-hash-code">{truncate(block.merkleRoot)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Hash size={10} /> Hash Anterior</div>
                    <code className="bc-hash-code">{truncate(block.previousHash)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Fingerprint size={10} /> Lecturas en bloque</div>
                    <code className="bc-hash-code" style={{ color: '#a78bfa' }}>
                      {block.batchData?.length || 0} lecturas selladas
                    </code>
                  </div>
                </div>

                {/* Panel de fallo */}
                {result && !result.isValid && isExp && (
                  <div className="bc-audit-panel">
                    <div className="bc-audit-title">
                      <AlertTriangle size={13} /> Detalle del Fallo de Integridad
                    </div>

                    {result.details && (
                      <>
                        <div className={`bc-audit-row ${result.details.chain  ? 'row-ok' : 'row-fail'}`}>
                          {result.details.chain  ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                          Encadenamiento de bloques: {result.details.chain  ? 'válido' : 'ROTO'}
                        </div>
                        <div className={`bc-audit-row ${result.details.merkle ? 'row-ok' : 'row-fail'}`}>
                          {result.details.merkle ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                          Merkle Root: {result.details.merkle ? 'válido' : 'ALTERADO'}
                        </div>
                      </>
                    )}

                    {/* Reading adulterado identificado */}
                    {readingAlterado && (
                      <div className="bc-tamper-card" style={{ borderColor: `${tipoColor}40`, background: `${tipoColor}08` }}>

                        {/* Tipo de ataque */}
                        <div className="bc-tamper-header" style={{ color: tipoColor }}>
                          <TamperIcon tipo={readingAlterado.tipo} />
                          {tamperLabel(readingAlterado.tipo)}
                        </div>

                        {/* Campos según el tipo */}
                        {readingAlterado.tipo === 'VALUE_MODIFICADO' && (
                          <div className="bc-tamper-grid">
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">ID Lectura</span>
                              <code className="bc-tamper-val">{truncate(readingAlterado.id, 16)}</code>
                            </div>
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">Valor adulterado en BD</span>
                              <code className="bc-tamper-val" style={{ color: '#f87171', fontSize: '1rem', fontWeight: 700 }}>
                                {readingAlterado.valueActual}
                              </code>
                            </div>
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">Sensor ID</span>
                              <code className="bc-tamper-val">{truncate(readingAlterado.sensorId, 14)}</code>
                            </div>
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">Timestamp</span>
                              <code className="bc-tamper-val">{fmtDate(readingAlterado.timestamp)}</code>
                            </div>
                          </div>
                        )}

                        {readingAlterado.tipo === 'ELIMINADO_O_HASH_CAMBIADO' && (
                          <div className="bc-tamper-grid">
                            <div className="bc-tamper-field" style={{ gridColumn: '1/-1' }}>
                              <span className="bc-tamper-label">Hash original afectado</span>
                              <code className="bc-tamper-val">{readingAlterado.hashOriginal}</code>
                            </div>
                          </div>
                        )}

                        {readingAlterado.tipo === 'FILAS_ELIMINADAS' && (
                          <div className="bc-tamper-grid">
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">Lecturas esperadas</span>
                              <code className="bc-tamper-val">{readingAlterado.cantidadEsperada}</code>
                            </div>
                            <div className="bc-tamper-field">
                              <span className="bc-tamper-label">Lecturas encontradas</span>
                              <code className="bc-tamper-val" style={{ color: '#f87171', fontWeight: 700 }}>
                                {readingAlterado.cantidadActual}
                              </code>
                            </div>
                          </div>
                        )}

                        <div className="bc-tamper-razon" style={{ borderColor: tipoColor, color: '#f59e0b' }}>
                          ⚠ {readingAlterado.razon}
                        </div>
                      </div>
                    )}

                    {/* Merkle falla pero sin signature para identificar */}
                    {!readingAlterado && !result.details?.merkle && (
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                        No se pudo identificar la lectura exacta. Las lecturas de este bloque
                        pueden no tener <code style={{ color: '#0284c7' }}>signature</code> almacenada.
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="bc-block-footer">
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    <Zap size={11} style={{ display: 'inline', marginRight: '3px' }} />
                    {block.batchData?.length || 0} lecturas · nodo auditado
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {result && !result.isValid && (
                      <button
                        className="bc-btn-ghost color-error"
                        onClick={() => setExpanded(e => ({ ...e, [block.id]: !isExp }))}
                      >
                        {isExp ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
                        {isExp ? 'Ocultar' : 'Ver detalle'}
                      </button>
                    )}
                    <button
                      className="bc-btn-ghost"
                      style={{ color: result?.isValid === false ? '#ef4444' : '#38bdf8' }}
                      onClick={() => handleVerify(block)}
                      disabled={isVerif || auditingAll}
                    >
                      {isVerif
                        ? <><RefreshCw size={13} className="spin" /> Verificando...</>
                        : result
                        ? <><Eye size={13} /> Re-verificar</>
                        : <><ShieldCheck size={13} /> Verificar Integridad</>
                      }
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}