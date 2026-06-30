import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useProjectStore } from '../../store/projectStore';
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, Database,
  CheckCircle, RefreshCw, Box, Lock, ChevronDown, ChevronUp,
  AlertTriangle, Fingerprint, Hash, Layers, Eye, Zap,
  ScanSearch, Trash2, FileX, Edit3, Table2, Link, Unlink
} from 'lucide-react';
import './BlockchainPage.css';

const truncate = (s, n = 24) => s ? `${s.slice(0, n)}…${s.slice(-6)}` : '—';
const fmtDate  = (d) => d ? new Date(d).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function StatusIcon({ status, size = 44 }) {
  if (status === 'ok')    return <ShieldCheck size={size} />;
  if (status === 'error') return <ShieldX size={size} />;
  return <ShieldAlert size={size} />;
}

function TamperIcon({ tipo }) {
  if (tipo === 'VALUE_MODIFICADO')           return <Edit3  size={14} color="#f87171" />;
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO')  return <FileX  size={14} color="#f59e0b" />;
  if (tipo === 'FILAS_ELIMINADAS')           return <Trash2 size={14} color="#ef4444" />;
  if (tipo === 'HASH_CAMBIADO_DIRECTAMENTE') return <FileX  size={14} color="#f59e0b" />;
  if (tipo === 'VALUE_Y_HASH_MODIFICADOS')   return <Edit3  size={14} color="#ef4444" />;
  return <AlertTriangle size={14} color="#f87171" />;
}

function tamperColor(tipo) {
  if (tipo === 'VALUE_MODIFICADO')           return '#f87171';
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO')  return '#f59e0b';
  if (tipo === 'FILAS_ELIMINADAS')           return '#ef4444';
  if (tipo === 'HASH_CAMBIADO_DIRECTAMENTE') return '#f59e0b';
  if (tipo === 'VALUE_Y_HASH_MODIFICADOS')   return '#ef4444';
  return '#f87171';
}

function tamperLabel(tipo) {
  if (tipo === 'VALUE_MODIFICADO')           return 'Valor modificado en BD';
  if (tipo === 'ELIMINADO_O_HASH_CAMBIADO')  return 'Registro eliminado o hash alterado';
  if (tipo === 'FILAS_ELIMINADAS')           return 'Filas eliminadas de la BD';
  if (tipo === 'HASH_CAMBIADO_DIRECTAMENTE') return 'Hash modificado directamente';
  if (tipo === 'VALUE_Y_HASH_MODIFICADOS')   return 'Value y hash modificados';
  return 'Adulteración detectada';
}

// ── Tabla de readings del bloque ─────────────────────────────
function BlockReadingsTable({ blockId, onClose }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/blockchain/block/${blockId}/readings`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [blockId]);

  if (loading) return (
    <div className="bc-readings-panel">
      <div className="bc-readings-loading">
        <RefreshCw size={18} className="spin" /> Cargando lecturas...
      </div>
    </div>
  );
  if (!data) return null;

  return (
    <div className="bc-readings-panel">
      <div className="bc-readings-header">
        <div className="bc-readings-title">
          <Table2 size={15} color="#38bdf8" />
          Lecturas del bloque
          <span className="bc-readings-count total">{data.total} total</span>
          <span className="bc-readings-count ok">{data.integros} íntegras</span>
          {data.adulterados > 0 && (
            <span className="bc-readings-count fail">{data.adulterados} adulteradas</span>
          )}
        </div>
        <button className="bc-readings-close" onClick={onClose}>
          <ChevronUp size={15} /> Cerrar
        </button>
      </div>
      <div className="bc-readings-table-wrap">
        <table className="bc-readings-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Sensor</th>
              <th>Valor</th>
              <th>Timestamp</th>
              <th>Hash (parcial)</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {data.readings.map((r, i) => (
              <tr key={i} className={`bc-reading-row ${r.status}`}>
                <td>
                  <span className={`bc-reading-status-badge ${r.status}`}>
                    {r.status === 'ok'      && <><CheckCircle size={11}/> Íntegro</>}
                    {r.status === 'tampered'&& <><AlertTriangle size={11}/> Adulterado</>}
                    {r.status === 'deleted' && <><Trash2 size={11}/> Eliminado</>}
                    {r.status === 'unknown' && <><Eye size={11}/> Sin firma</>}
                  </span>
                </td>
                <td>
                  <div className="bc-reading-sensor">
                    <span className="bc-reading-sensor-name">{r.sensorName}</span>
                    <span className="bc-reading-sensor-type">{r.sensorType}</span>
                  </div>
                </td>
                <td>
                  <code className={`bc-reading-value ${r.status !== 'ok' ? 'tampered' : ''}`}>
                    {r.value !== null ? `${r.value} ${r.sensorUnit}` : '—'}
                  </code>
                </td>
                <td><span className="bc-reading-ts">{fmtDate(r.timestamp)}</span></td>
                <td><code className="bc-reading-hash">{r.hash}</code></td>
                <td>
                  {r.detalle && (
                    <span className={`bc-reading-detalle ${r.status}`}>{r.detalle}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────
export default function BlockchainPage() {
  const { selectedProjectId } = useProjectStore();
  const [blocks,       setBlocks]       = useState([]);
  const [auditReport,  setAuditReport]  = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [auditingAll,  setAuditingAll]  = useState(false);
  const [verifying,    setVerifying]    = useState({});
  const [blockResults, setBlockResults] = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [showReadings, setShowReadings] = useState({});

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

  const toggleReadings = (blockId) =>
    setShowReadings(s => ({ ...s, [blockId]: !s[blockId] }));

  const chainStatus    = auditReport === null ? 'unknown' : auditReport.isValidChain ? 'ok' : 'error';
  const totalBloques   = blocks.length;
  const totalLecturas  = blocks.reduce((a, b) => a + (b.batchData?.length || 0), 0);
  const auditadosTodos = Object.keys(blockResults).length === blocks.length && blocks.length > 0;
  const bloquesOk      = Object.values(blockResults).filter(r => r.isValid).length;
  const bloquesFail    = Object.values(blockResults).filter(r => !r.isValid).length;

  // Mapa blockId → motivo del auditReport
  const motivosPorBloque = {};
  if (auditReport?.report) {
    auditReport.report.forEach(b => {
      if (b.status === 'BROKEN') motivosPorBloque[b.blockId] = { motivo: b.motivo, detalle: b.detalle };
    });
  }

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
              ? `${auditReport?.report?.filter(b => b.status !== 'OK').length || 0} bloque(s) con inconsistencias. Revisa el detalle abajo.`
              : 'Ejecuta una auditoría para conocer el estado de la cadena.'}
          </div>

          {/* Badges con motivo por bloque */}
          {chainStatus === 'error' && auditReport?.report && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {auditReport.report.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="bc-badge" style={{
                    color:      b.status === 'OK' ? '#22c55e' : '#ef4444',
                    background: b.status === 'OK' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border:     `1px solid ${b.status === 'OK' ? '#22c55e40' : '#ef444440'}`,
                    flexShrink: 0
                  }}>
                    {b.status === 'OK'
                      ? <><CheckCircle size={10}/> Bloque {i+1}</>
                      : <><AlertTriangle size={10}/> Bloque {i+1}</>
                    }
                  </span>
                  {/* Motivo del fallo */}
                  {b.status === 'BROKEN' && b.motivo && (
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', alignSelf: 'center' }}>
                      — {b.motivo}
                    </span>
                  )}
                </div>
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
          { val: totalBloques,  label: 'Bloques totales',   color: '#38bdf8' },
          { val: totalLecturas, label: 'Lecturas selladas', color: '#818cf8' },
          { val: bloquesOk,     label: 'Bloques íntegros',  color: '#22c55e' },
          { val: bloquesFail,   label: 'Bloques con fallo', color: '#f87171' },
        ].map(({ val, label, color }) => (
          <div key={label} className="bc-stat-card" style={{ borderTop: `2px solid ${color}` }}>
            <div className="bc-stat-val" style={{ color }}>{val}</div>
            <div className="bc-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Banner resumen */}
      {auditadosTodos && bloquesFail === 0 && (
        <div className="bc-summary-banner ok">
          <CheckCircle size={16} color="#22c55e" />
          <span>Auditoría completa — <strong>{totalBloques}</strong> bloques sin alteraciones.</span>
        </div>
      )}
      {auditadosTodos && bloquesFail > 0 && (
        <div className="bc-summary-banner error">
          <AlertTriangle size={16} color="#f87171" />
          <span><strong>{bloquesFail}</strong> bloque(s) adulterados de {totalBloques} auditados.</span>
        </div>
      )}

      {/* Feed */}
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
            const result          = blockResults[block.id];
            const isVerif         = verifying[block.id];
            const isExp           = expanded[block.id];
            const isShowRead      = showReadings[block.id];
            const status          = result ? (result.isValid ? 'valid' : 'invalid') : 'default';
            const readingsAlterados = result?.details?.readingsAlterados || [];

            // Motivo de fallo del auditReport para ESTE bloque
            const chainFallo = motivosPorBloque[block.id];

            return (
              <div key={block.id} className={`bc-block-card ${status}`}>

                {/* Header */}
                <div className="bc-block-header">
                  <Box size={16} color="#38bdf8" />
                  <span className="bc-block-num">BLOQUE #{blocks.length - index}</span>
                  <span className="bc-block-device">
                    {block.device?.name || block.device?.deviceId || 'Dispositivo'}
                  </span>

                  {/* Badge verificación individual */}
                  {result && (
                    <span className="bc-badge" style={{
                      color:      result.isValid ? '#22c55e' : '#ef4444',
                      background: result.isValid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border:     `1px solid ${result.isValid ? '#22c55e40' : '#ef444440'}`
                    }}>
                      {result.isValid ? '✓ ÍNTEGRO' : '✗ ALTERADO'}
                    </span>
                  )}

                  {/* Badge cadena — con motivo */}
                  {chainFallo && !result && (
                    <span className="bc-badge" style={{
                      color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
                      border: '1px solid #f59e0b40'
                    }}>
                      <Unlink size={10}/> ESLABÓN ROTO
                    </span>
                  )}
                  {!chainFallo && auditReport && !result && (
                    <span className="bc-badge" style={{
                      color: '#22c55e', background: 'rgba(34,197,94,0.1)',
                      border: '1px solid #22c55e40'
                    }}>
                      <Link size={10}/> CADENA OK
                    </span>
                  )}

                  <div className="bc-block-date">
                    <Clock size={12} /> {fmtDate(block.createdAt)}
                  </div>
                </div>

                {/* Hashes */}
                <div className="bc-hash-grid">
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Lock size={10}/> Sello del Bloque</div>
                    <code className="bc-hash-code">{truncate(block.blockHash)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Database size={10}/> Merkle Root</div>
                    <code className="bc-hash-code">{truncate(block.merkleRoot)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Hash size={10}/> Hash Anterior</div>
                    <code className="bc-hash-code">{truncate(block.previousHash)}</code>
                  </div>
                  <div className="bc-hash-item">
                    <div className="bc-hash-label"><Fingerprint size={10}/> Lecturas selladas</div>
                    <code className="bc-hash-code" style={{ color: '#a78bfa' }}>
                      {block.batchData?.length || 0} lecturas
                    </code>
                  </div>
                </div>

                {/* Panel motivo fallo cadena — aparece sin necesidad de verificar */}
                {chainFallo && (
                  <div className="bc-chain-fallo-panel">
                    <div className="bc-chain-fallo-title">
                      <Unlink size={13}/> Fallo en cadena detectado
                    </div>
                    <div className="bc-chain-fallo-motivo">{chainFallo.motivo}</div>
                    {chainFallo.detalle && (
                      <div className="bc-chain-fallo-detalle">{chainFallo.detalle}</div>
                    )}
                  </div>
                )}

                {/* Panel adulteraciones de readings */}
                {result && !result.isValid && isExp && (
                  <div className="bc-audit-panel">
                    <div className="bc-audit-title">
                      <AlertTriangle size={13}/> Detalle del Fallo de Integridad
                    </div>
                    {result.details && (
                      <>
                        <div className={`bc-audit-row ${result.details.chain  ? 'row-ok' : 'row-fail'}`}>
                          {result.details.chain  ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                          Encadenamiento: {result.details.chain ? 'válido' : 'ROTO'}
                        </div>
                        <div className={`bc-audit-row ${result.details.merkle ? 'row-ok' : 'row-fail'}`}>
                          {result.details.merkle ? <CheckCircle size={13}/> : <AlertTriangle size={13}/>}
                          Merkle Root: {result.details.merkle ? 'válido' : 'ALTERADO'}
                        </div>
                      </>
                    )}
                    {readingsAlterados.length > 0 && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.75rem' }}>
                        {readingsAlterados.map((r, i) => (
                          <div key={i} className="bc-tamper-card"
                            style={{ borderColor:`${tamperColor(r.tipo)}40`, background:`${tamperColor(r.tipo)}08` }}
                          >
                            <div className="bc-tamper-header" style={{ color: tamperColor(r.tipo) }}>
                              <TamperIcon tipo={r.tipo} />
                              {tamperLabel(r.tipo)}
                              {readingsAlterados.length > 1 && (
                                <span style={{ marginLeft:'auto', fontSize:'0.65rem', opacity:0.7 }}>
                                  {i+1} de {readingsAlterados.length}
                                </span>
                              )}
                            </div>
                            <div className="bc-tamper-grid">
                              {r.id && (
                                <div className="bc-tamper-field">
                                  <span className="bc-tamper-label">ID Lectura</span>
                                  <code className="bc-tamper-val">{truncate(r.id, 16)}</code>
                                </div>
                              )}
                              {r.valueActual !== undefined && r.valueActual !== null && (
                                <div className="bc-tamper-field">
                                  <span className="bc-tamper-label">Valor adulterado</span>
                                  <code className="bc-tamper-val"
                                    style={{ color:tamperColor(r.tipo), fontWeight:700, fontSize:'0.95rem' }}>
                                    {r.valueActual}
                                  </code>
                                </div>
                              )}
                              {r.timestamp && (
                                <div className="bc-tamper-field">
                                  <span className="bc-tamper-label">Timestamp</span>
                                  <code className="bc-tamper-val">{fmtDate(r.timestamp)}</code>
                                </div>
                              )}
                              {r.sensorId && (
                                <div className="bc-tamper-field">
                                  <span className="bc-tamper-label">Sensor ID</span>
                                  <code className="bc-tamper-val">{truncate(r.sensorId, 14)}</code>
                                </div>
                              )}
                              {r.cantidadEsperada && (
                                <>
                                  <div className="bc-tamper-field">
                                    <span className="bc-tamper-label">Esperadas</span>
                                    <code className="bc-tamper-val">{r.cantidadEsperada}</code>
                                  </div>
                                  <div className="bc-tamper-field">
                                    <span className="bc-tamper-label">Encontradas</span>
                                    <code className="bc-tamper-val" style={{ color:'#f87171', fontWeight:700 }}>
                                      {r.cantidadActual}
                                    </code>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="bc-tamper-razon" style={{ borderColor: tamperColor(r.tipo) }}>
                              ⚠ {r.razon}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tabla de lecturas */}
                {isShowRead && (
                  <BlockReadingsTable blockId={block.id} onClose={() => toggleReadings(block.id)} />
                )}

                {/* Footer */}
                <div className="bc-block-footer">
                  <span style={{ fontSize:'0.7rem', color:'#64748b' }}>
                    <Zap size={11} style={{ display:'inline', marginRight:'3px' }} />
                    {block.batchData?.length || 0} lecturas · nodo auditado
                  </span>
                  <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <button
                      className="bc-btn-ghost"
                      style={{ color: '#818cf8' }}
                      onClick={() => toggleReadings(block.id)}
                    >
                      {isShowRead
                        ? <><ChevronUp size={13}/> Ocultar lecturas</>
                        : <><Table2 size={13}/> Ver lecturas</>
                      }
                    </button>
                    {result && !result.isValid && (
                      <button
                        className="bc-btn-ghost color-error"
                        onClick={() => setExpanded(e => ({ ...e, [block.id]: !isExp }))}
                      >
                        {isExp ? <><ChevronUp size={13}/> Ocultar fallo</> : <><ChevronDown size={13}/> Ver fallo</>}
                      </button>
                    )}
                    <button
                      className="bc-btn-ghost"
                      style={{ color: result?.isValid === false ? '#ef4444' : '#38bdf8' }}
                      onClick={() => handleVerify(block)}
                      disabled={isVerif || auditingAll}
                    >
                      {isVerif
                        ? <><RefreshCw size={13} className="spin"/> Verificando...</>
                        : result
                        ? <><Eye size={13}/> Re-verificar</>
                        : <><ShieldCheck size={13}/> Verificar Integridad</>
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