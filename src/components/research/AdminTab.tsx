import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, FileSpreadsheet, Lock, AlertCircle, Cpu, Calendar, User, Eye, Terminal, Globe } from 'lucide-react';
import { exportPremiumExcelSpreadsheet } from '../../utils/premiumExport';

export function AdminTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('ericon_logged_scientist');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const fetchLogs = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email || ''
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Security clearance rejected by biometric indexer.');
      } else {
        setLogs(data.logs || []);
      }
    } catch (err) {
      setError('Anomaly detected in administration downlink routing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    const query = filterQuery.toLowerCase();
    return (
      (l.email && l.email.toLowerCase().includes(query)) ||
      (l.action && l.action.toLowerCase().includes(query)) ||
      (l.description && l.description.toLowerCase().includes(query)) ||
      (l.ip && l.ip.toLowerCase().includes(query))
    );
  });

  const handleExportSpreadsheet = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp (UTC)", "User Account Email", "Performed Action", "IP / Device Profile"];
    const rows = logs.map(l => [
      l.timestamp || '',
      l.email || '',
      l.action || l.description || '',
      l.ip || '127.0.0.1'
    ]);

    exportPremiumExcelSpreadsheet(
      `ERICON_Admin_Biosecurity_AuditLedger_${Date.now()}.xls`,
      'ERICON Administrative Biosecurity and System Action Trail Ledger',
      'Confidential Chain-of-Custody Compliance Audit Record',
      headers,
      rows,
      {
        'Administrator Email': currentUser?.email || 'Unknown',
        'Authentication Node': 'Primary Security Core Master Gatewall',
        'Storage File Mapped': 'users.json (Local Server Persistent File)',
        'Registry Identifier': 'MOR-REG-SEC-01',
        'Audit Row Count': `${logs.length} administrative events mapped`,
        'Certificate Status': 'VERIFIED'
      }
    );

    // Dispatch toast notification event matching existing patterns
    window.dispatchEvent(new CustomEvent('ericon_show_toast', { 
      detail: { message: "🔒 Biosecurity Ledger compiled and generated successfully!", type: "success" } 
    }));
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="bg-white border-2 border-rose-300 rounded-2xl p-8 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <Lock className="w-12 h-12 mx-auto text-rose-650 animate-bounce" />
        <h2 className="text-lg font-mono font-black text-rose-950 uppercase tracking-widest">Access Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          You are authenticated as <strong className="text-slate-800">{currentUser?.username || 'Guest'}</strong>.
          Only personnel with explicit <strong className="text-rose-700">Admin</strong> clearance roles are authorized to access the Biosecurity Security Ledger mapping coordinates in <code className="font-mono bg-slate-100 p-0.5 rounded text-[10.5px]">users.json</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-6" id="admin-control-panel-root">
      
      {/* Tab Header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 rounded-xl flex items-center justify-center shadow-3xs">
            <Shield className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-extrabold uppercase bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded tracking-widest">
              Master Access
            </span>
            <h2 className="text-md font-sans font-black text-slate-900 tracking-tight leading-none mt-1">
              Admin Biosecurity Control Panel
            </h2>
            <p className="text-[10.5px] text-slate-450 font-medium font-sans">
              Real-time administrative ledger mapped from physical <code className="font-mono bg-slate-100 text-rose-700 px-1 rounded text-[10px]">users.json</code> database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-lg text-xs cursor-pointer select-none transition flex items-center gap-1.5 font-bold font-mono"
            title="Reload Security Stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleExportSpreadsheet}
            disabled={loading || logs.length === 0}
            className="p-2 px-3 bg-slate-900 border border-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs cursor-pointer select-none transition flex items-center gap-1.5 font-bold font-mono"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-430" />
            <span>Export XLS Ledger</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex gap-3 text-xs font-sans items-center">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <strong className="font-bold">Downlink Outage:</strong> {error}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Controls toolbar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search audit parameters, operator emails, matched events, or IP directions..."
                value={filterQuery}
                id="admin-search-input"
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none rounded-xl pl-9 pr-4 py-2.5 text-slate-800 transition placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-[10.5px] font-mono text-slate-500 flex items-center gap-2 self-start md:self-auto shrink-0 select-none">
              <Cpu className="w-3.5 h-3.5 text-emerald-700" />
              <span>Security Mapped Node: <strong className="text-slate-800 font-extrabold uppercase">users.json</strong></span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner bg-slate-50/50">
            <table className="w-full border-collapse text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-100/85 text-slate-600 font-bold uppercase text-[9.5px] tracking-wider border-b border-slate-200 select-none">
                  <th className="p-4 py-3 border-r border-slate-200 max-w-[170px]"><div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> <span>Timestamp (UTC)</span></div></th>
                  <th className="p-4 py-3 border-r border-slate-200"><div className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> <span>User Account Email</span></div></th>
                  <th className="p-4 py-3 border-r border-slate-200"><div className="flex items-center gap-1"><Terminal className="w-3 h-3 text-slate-400" /> <span>Performed Action</span></div></th>
                  <th className="p-4 py-3"><div className="flex items-center gap-1"><Globe className="w-3 h-3 text-slate-400" /> <span>IP / Device Profile</span></div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white font-mono text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 font-sans italic text-xs">
                      <div className="flex flex-col items-center justify-center gap-3 animate-pulse">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
                        <span>Synchronizing biosecurity directories with users.json persistent storage...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-slate-400 font-sans italic text-xs">
                      {logs.length === 0 ? "LEDGER EMPTY: Secure handshake initialized. Trigger system actions to populate records." : "No matching administrative logs found in active filtration."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSecurityAudit = log.type === 'SECURITY';
                    return (
                      <tr key={log.id} className={`hover:bg-slate-50/70 transition duration-150 ${isSecurityAudit ? 'bg-rose-50/15' : ''}`}>
                        <td className="p-4 py-3 border-r border-slate-105 font-mono text-slate-500 text-[10.5px] whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19) : 'No timestamp'}
                        </td>
                        <td className="p-4 py-3 border-r border-slate-105 font-sans font-semibold text-slate-800 whitespace-nowrap">
                          {log.email || 'system@ericon.org'}
                        </td>
                        <td className="p-4 py-3 border-r border-slate-105 font-sans text-slate-700 leading-relaxed min-w-[200px]">
                          <span className={`inline-block mr-2 px-1.5 py-0.2 rounded-sm text-[9.5px] font-mono font-extrabold select-none ${
                            isSecurityAudit ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-750 border'
                          }`}>
                            {log.type || 'SYSTEM'}
                          </span>
                          {log.action || log.description || 'System state update'}
                        </td>
                        <td className="p-4 py-3 font-mono text-slate-500 text-[10.5px] whitespace-nowrap">
                          {log.ip || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
            <span>Rendered {filteredLogs.length} of {logs.length} biometric sessions from users.json storage</span>
            <span>Authentication Clearance Mapped: Admin Level 3</span>
          </div>

        </div>
      )}

    </div>
  );
}
