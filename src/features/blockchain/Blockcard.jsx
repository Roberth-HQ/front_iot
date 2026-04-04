import React from 'react';
import { Link as LinkIcon, Database, ShieldCheck, Clock } from 'lucide-react';

const BlockCard = ({ block, index, totalBlocks }) => {
  return (
    <div className="block-card">
      <div className="block-dot" />
      
      <div className="block-header">
        <span className="block-id">BLOQUE #{totalBlocks - index}</span>
        <span className="flex items-center gap-1 text-slate-500 text-sm">
          <Clock size={14} /> {new Date(block.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="hash-section">
        <div>
          <span className="hash-label">Merkle Root (Actual)</span>
          <div className="hash-value hash-valid">
            <ShieldCheck size={14} className="inline mr-2 text-green-500" />
            {block.hash}
          </div>
        </div>

        <div>
          <span className="hash-label">Hash Anterior (Chain Link)</span>
          <div className="hash-value">
            <LinkIcon size={14} className="inline mr-2 text-blue-400" />
            {block.previousHash || "00000000000000000000000000000000"}
          </div>
        </div>
      </div>

      <div className="batch-info">
        <Database size={16} />
        <span>
          <strong>{block.batchData?.length || 0} Lecturas</strong> firmadas por: 
          <code className="ml-2 bg-white/50 px-2 rounded">{block.device?.name}</code>
        </span>
      </div>
    </div>
  );
};

export default BlockCard;