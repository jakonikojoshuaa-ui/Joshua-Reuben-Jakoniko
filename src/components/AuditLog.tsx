/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Terminal, Trash2, Search, Sliders, ArrowUpRight, ArrowDownRight, RefreshCw, FileText } from 'lucide-react';
import { exportPremiumExcelSpreadsheet } from '../utils/premiumExport';

export interface AuditRecord {
  id: string;
  timestamp: string;
  parameter: string;
  field: string;
  oldVal: number | string;
  newVal: number | string;
  unit?: string;
  operator: string;
}

interface AuditLogProps {
  auditLogs: AuditRecord[];
  onClearLogs: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ auditLogs, onClearLogs }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedField, setSelectedField] = useState<string>('all');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchQuery = 
        log.parameter.toLowerCase().includes(filterQuery.toLowerCase()) ||
        log.operator.toLowerCase().includes(filterQuery.toLowerCase()) ||
        String(log.oldVal).includes(filterQuery) ||
        String(log.newVal).includes(filterQuery);
      
      const matchField = selectedField === 'all' || log.field === selectedField;
      return matchQuery && matchField;
    });
  }, [auditLogs, filterQuery, selectedField]);

  // Extract changed value trend
  const renderValueTrend = (log: AuditRecord) => {
    const isNum = typeof log.oldVal === 'number' && typeof log.newVal === 'number';
    if (!isNum) {
      return (
        <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">
          {log.oldVal} → {log.newVal}
        </span>
      );
    }

    const diff = (log.newVal as number) - (log.oldVal as number);
    const isIncrease = diff > 0;
    
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
        <span className="text-slate-400 line-through">{(log.oldVal as number).toFixed(2)}</span>
        <span className="text-slate-400">→</span>
        <span className={`font-bold ${isIncrease ? 'text-emerald-700' : 'text-rose-700'}`}>
          {(log.newVal as number).toFixed(2)}
        </span>
        <span className="text-[10px] text-slate-500 font-normal">
          {log.unit || ''}
        </span>
        <span className={`flex items-center text-[9px] font-bold px-1 py-0.2 rounded-xs ${
          isIncrease ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
        }`}>
          {isIncrease ? <ArrowUpRight className="w-2.5 h-2.5 inline" /> : <ArrowDownRight className="w-2.5 h-2.5 inline" />}
          {isIncrease ? '+' : ''}{diff.toFixed(2)}
        </span>
      </div>
    );
  };

  const handleExportLogs = () => {
    if (auditLogs.length === 0) return;
    const headers = ["Record ID", "Timestamp (UTC)", "Measured Parameter", "Field Identifier", "Previous Core Value", "New Updated Value", "Authorised Operator"];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.parameter,
      l.field,
      l.oldVal,
      l.newVal,
      l.operator
    ]);

    exportPremiumExcelSpreadsheet(
      `ERICON_Simulator_Specs_AuditLog_${Date.now()}.xls`,
      'ERICON Real-Time Simulation and Parameter Change Audit Log',
      'Certified Legal Chain-of-Custody Compliance Verification Ledgers',
      headers,
      rows,
      {
        'Project Name': 'ERICON Bio-Integrated Direct Transit Systems Program',
        'Audit Node': 'Primary Fluid-Dynamics Core Simulator Grid',
        'Registry Identifier': 'MOR-REG-B12-90',
        'Audit Row Count': `${auditLogs.length} parameters logged`,
        'Date Generated': new Date().toUTCString(),
        'Report Version': 'v4.5-Ledger'
      }
    );

    window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: "🎉 Audit Log Workbook compiled & generated according to ERICON Brand Standard!", type: "success" } }));
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm p-4 flex flex-col gap-3 shadow-xs" id="audit-log-panel">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-800 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-tight text-slate-900">
            Collaborative Audit Trail Ledger
          </span>
        </div>
        <span className="text-[9px] font-black bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
          SIMULATOR LIVE
        </span>
      </div>

      <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
        Records granular modifications to pneumatic flow bounds and vacuum specs in real-time, aiding academic peer-review verification.
      </p>

      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search param or scientist..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-xs pl-7 pr-2.5 py-1.5 text-slate-800 focus:border-slate-400 outline-none"
            id="input-audit-search"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex gap-1.5 text-[10px] font-mono">
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 p-1 rounded-xs text-slate-650 cursor-pointer"
          >
            <option value="all">⚡ All Fields</option>
            <option value="p1">P1 Pressure</option>
            <option value="p2">P2 Vacuum</option>
            <option value="length">Length</option>
            <option value="diameter">Diameter</option>
            <option value="roughness">Roughness</option>
            <option value="temperature">Temperature</option>
            <option value="capsuleMass">Canister Mass</option>
            <option value="capsuleFriction">Friction</option>
            <option value="capsuleClearance">Clearance</option>
          </select>

          <button
            type="button"
            onClick={handleExportLogs}
            disabled={auditLogs.length === 0}
            className="px-2.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 text-slate-750 disabled:opacity-40 disabled:cursor-not-allowed rounded-xs py-1 transition flex items-center gap-1 cursor-pointer"
            title="Export CSV"
          >
            <FileText className="w-3 h-3" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onClearLogs}
            disabled={auditLogs.length === 0}
            className="px-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xs py-1 transition flex items-center gap-1 cursor-pointer"
            title="Clear Log Ledger"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Scrolling Log Rows */}
      <div className="max-h-[220px] overflow-y-auto border border-slate-150 rounded bg-slate-50/50 p-1 space-y-1 divide-y divide-slate-100" id="audit-rows-scroller">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 font-mono text-[10px] italic">
            {auditLogs.length === 0 ? "No variables adjusted yet. Trigger simulation values to view entries." : "No logs match active filters."}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-2 flex flex-col gap-1 text-[11px] font-mono group hover:bg-slate-100/50 transition duration-150">
              {/* Row Header */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-[11.5px] truncate max-w-[150px]" title={log.parameter}>
                  {log.parameter}
                </span>
                <span className="text-[9px] text-slate-400 font-normal shrink-0">
                  🕒 {log.timestamp}
                </span>
              </div>

              {/* Differential details */}
              <div className="flex items-center justify-between">
                {renderValueTrend(log)}
                <span className="text-[9px] bg-slate-200/50 text-slate-650 px-1.5 py-0.2 rounded font-extrabold max-w-[80px] truncate" title={log.operator}>
                  👤 {log.operator}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span>Displaying {filteredLogs.length} of {auditLogs.length} entries</span>
        <span className="opacity-80">Encryption: ERICON Secure Crypt</span>
      </div>

    </div>
  );
};
