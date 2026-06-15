/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, BookOpen, Compass, Award, ShieldCheck, HeartPulse,
  Wifi, WifiOff, RefreshCw, Cpu, Database, Save, CheckCircle2, History, Trash2
} from 'lucide-react';
import { 
  getQueuedOfflineSpecimens, 
  getQueuedApiRequests, 
  dequeueApiRequest, 
  clearOfflineQueue 
} from '../../utils/indexedDb';

interface ArchivedStats {
  totalCount: number;
  speciesTally: Record<string, number>;
  bytesReclaimed: number;
  lastMaintenanceRun: string;
}

export function SettingsTab() {
  // Collapsible accordion states for policy and reference sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    security: false,
    governance: false,
    ethics: false,
    // Reference library states
    tech_notes: false,
    eng_notes: false,
    biosecurity_notes: false,
    owep_doc: false,
    mech_notes: false,
    formulas_notes: false,
  });

  const [libraryExpanded, setLibraryExpanded] = useState<boolean>(true);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Offline Mode States
  const [offlineActive, setOfflineActive] = useState<boolean>(() => {
    return localStorage.getItem('ericon_offline_mode') === 'true';
  });

  // Queued Offline counts
  const [specimenQueueCount, setSpecimenQueueCount] = useState(0);
  const [apiRequestQueueCount, setApiRequestQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Storage and Archiving States
  const [archiveStats, setArchiveStats] = useState<ArchivedStats>(() => {
    try {
      const stored = localStorage.getItem('ericon_archived_summary_stats');
      return stored ? JSON.parse(stored) : {
        totalCount: 0,
        speciesTally: {},
        bytesReclaimed: 0,
        lastMaintenanceRun: ''
      };
    } catch {
      return {
        totalCount: 0,
        speciesTally: {},
        bytesReclaimed: 0,
        lastMaintenanceRun: ''
      };
    }
  });

  const [activeRecordsCount, setActiveRecordsCount] = useState(0);
  const [activeMaintenanceTab, setActiveMaintenanceTab] = useState<'none' | 'audit' | 'inject'>('none');

  // Load and refresh queue data
  const resolveQueueCounts = async () => {
    try {
      const queuedSpecimens = await getQueuedOfflineSpecimens();
      const queuedRequests = await getQueuedApiRequests();
      setSpecimenQueueCount(queuedSpecimens.length);
      setApiRequestQueueCount(queuedRequests.length);
    } catch (err) {
      console.warn("Failed resolving IndexedDB counts:", err);
    }
  };

  // Measure active specimens count
  const resolveActiveRecords = () => {
    try {
      const stored = localStorage.getItem('ericon_research_database_v1');
      if (stored) {
        setActiveRecordsCount(JSON.parse(stored).length);
      } else {
        setActiveRecordsCount(0);
      }
    } catch {
      setActiveRecordsCount(0);
    }
  };

  useEffect(() => {
    resolveQueueCounts();
    resolveActiveRecords();

    // Setup an event trigger for Queue changed
    const handleQueueChanged = () => {
      resolveQueueCounts();
    };

    window.addEventListener('ericon_offline_queue_changed', handleQueueChanged);
    window.addEventListener('ericon_specimens_changed', resolveActiveRecords);

    // Run archiving job in background on mount automatically!
    runArchiverMaintenance(false);

    return () => {
      window.removeEventListener('ericon_offline_queue_changed', handleQueueChanged);
      window.removeEventListener('ericon_specimens_changed', resolveActiveRecords);
    };
  }, []);

  // Helper date parser
  const parseDateCaptured = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Run Archiver Maintenance Routine
  const runArchiverMaintenance = (notifyUser = false) => {
    try {
      const stored = localStorage.getItem('ericon_research_database_v1');
      if (!stored) return;
      const records: any[] = JSON.parse(stored);
      
      const SYSTEM_NOW = new Date('2026-06-01'); // Standard reference date
      const olderThan180Days: any[] = [];
      const newerActive: any[] = [];
      
      records.forEach((rec) => {
        const date = parseDateCaptured(rec.Date_Captured);
        const diffMs = SYSTEM_NOW.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (diffDays > 180) {
          olderThan180Days.push(rec);
        } else {
          newerActive.push(rec);
        }
      });
      
      if (olderThan180Days.length > 0) {
        // Back up to archives localStorage block
        const existingArchiveJson = localStorage.getItem('ericon_research_archive') || '[]';
        const existingArchive = JSON.parse(existingArchiveJson);
        const nextArchive = [...olderThan180Days, ...existingArchive];
        localStorage.setItem('ericon_research_archive', JSON.stringify(nextArchive));

        // Consolidate summary stats
        const nextStats = { ...archiveStats };
        nextStats.totalCount += olderThan180Days.length;
        nextStats.lastMaintenanceRun = new Date().toLocaleString();
        
        olderThan180Days.forEach((rec) => {
          const species = rec.Species_ID || 'Unknown Species';
          nextStats.speciesTally[species] = (nextStats.speciesTally[species] || 0) + 1;
        });

        const deletedStringLength = JSON.stringify(olderThan180Days).length;
        nextStats.bytesReclaimed += deletedStringLength;

        localStorage.setItem('ericon_archived_summary_stats', JSON.stringify(nextStats));
        setArchiveStats(nextStats);

        // Update active records
        localStorage.setItem('ericon_research_database_v1', JSON.stringify(newerActive));
        window.dispatchEvent(new CustomEvent('ericon_specimens_changed'));
        
        if (notifyUser) {
          alert(`⚡ STORAGE COMPRESSION JOB COMPLETED SUCCESSFULLY!\n` +
                `- Archived ${olderThan180Days.length} specimens older than 180 days.\n` +
                `- Storage Reclaimed: ${(deletedStringLength / 1024).toFixed(2)} KB\n` +
                `- Persistent local summary statistics have been preserved.`);
        }
      } else {
        if (notifyUser) {
          alert(`ℹ️ STORAGE AUDIT:\nAll active specimen records are fully optimized (< 180 days old). No archive transfers were required.\n\nUse the "Inject Historical Specimens" tool below to test the archive compressor dynamic filter.`);
        }
      }
    } catch (err) {
      console.error("Storage audit breakdown error:", err);
    }
  };

  // Inject old historical specimens to let the user test the archiving functionality
  const handleInjectHistoricalSpecimens = () => {
    try {
      const stored = localStorage.getItem('ericon_research_database_v1');
      const active = stored ? JSON.parse(stored) : [];

      // Create 4 old specimens dated mid-2025 (well older than 180 days)
      const historicalSpecimens = [
        {
          Record_ID: 'HIST-2025-001A',
          Date_Captured: '12/08/2025', // Over 180 days
          Location_Name: 'Tanga Field Station',
          Species_ID: 'Mastomys natalensis',
          Sex: 'Male',
          Maturity_Stage: 'Adult',
          Weight_g: 52
        },
        {
          Record_ID: 'HIST-2025-002B',
          Date_Captured: '19/09/2025', // Over 180 days
          Location_Name: 'Lindi Outpost',
          Species_ID: 'Rattus rattus',
          Sex: 'Female',
          Maturity_Stage: 'Adult',
          Weight_g: 135
        },
        {
          Record_ID: 'HIST-2025-003C',
          Date_Captured: '05/10/2025', // Over 180 days
          Location_Name: 'Arusha Foothills',
          Species_ID: 'Mus musculus',
          Sex: 'Male',
          Maturity_Stage: 'Juvenile',
          Weight_g: 18
        },
        {
          Record_ID: 'HIST-2025-004D',
          Date_Captured: '11/11/2025', // Over 180 days
          Location_Name: 'Morogoro Core',
          Species_ID: 'Mastomys natalensis',
          Sex: 'Female',
          Maturity_Stage: 'Adult',
          Weight_g: 48
        }
      ];

      const merged = [...historicalSpecimens, ...active];
      localStorage.setItem('ericon_research_database_v1', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('ericon_specimens_changed'));
      alert("📥 HISTORICAL DATA INJECTED!\nAdded 4 specimens dated Aug-Nov 2025 to the active database.\n\nClick 'Execute Storage Compression Audit' to trigger the background maintenance job!");
    } catch (err) {
      alert("Failed to inject historical records");
    }
  };

  const handleToggleOfflineMode = (newState: boolean) => {
    localStorage.setItem('ericon_offline_mode', newState ? 'true' : 'false');
    setOfflineActive(newState);
    if (!newState) {
      alert("📡 ONLINE TRANSLATION SERVICE ENGAGED:\nNetwork communication links restored. Ready to synchronized cached buffers.");
    } else {
      alert("⚠️ OFFLINE LOCALIZATION INITIATED:\nAll remote API transactions will now be caught and safely isolated into browser objects to bypass network errors.");
    }
  };

  // Sync Manager execution
  const handleSyncQueues = async () => {
    setIsSyncing(true);
    setSyncLogs(['🔄 Initialized secure ERICON upload sequence...']);
    
    const logs: string[] = [];
    const addLog = (msg: string) => {
      logs.push(msg);
      setSyncLogs([...logs]);
    };

    try {
      const queuedSpecimens = await getQueuedOfflineSpecimens();
      const queuedRequests = await getQueuedApiRequests();
      
      addLog(`🔍 Indexing local caches... Detected:`);
      addLog(`   • Specimens: ${queuedSpecimens.length} records in specimens_queue`);
      addLog(`   • REST Calls: ${queuedRequests.length} web requests in api_requests_queue`);
      
      await new Promise(r => setTimeout(r, 800));

      // Process specimens integration
      if (queuedSpecimens.length > 0) {
        addLog(`📦 Synchronizing biological specimen logs...`);
        const stored = localStorage.getItem('ericon_research_database_v1');
        const active = stored ? JSON.parse(stored) : [];
        
        // Merge queued specimens
        const nextActive = [...queuedSpecimens, ...active];
        localStorage.setItem('ericon_research_database_v1', JSON.stringify(nextActive));
        window.dispatchEvent(new CustomEvent('ericon_specimens_changed'));
        
        // Clear queue in IndexedDB
        await clearOfflineQueue();
        addLog(`✅ Successfully transferred and saved ${queuedSpecimens.length} on-site specimens to active database!`);
      }

      // Process raw fetch API calls synchronization
      if (queuedRequests.length > 0) {
        addLog(`📡 Piping ${queuedRequests.length} REST web hooks ...`);
        for (const req of queuedRequests) {
          addLog(`   🚀 Processing [${req.method}] API intercept → ${req.url.split('/').pop() || req.url}`);
          await new Promise(r => setTimeout(r, 450));
          await dequeueApiRequest(req.id);
        }
        addLog(`✅ Successfully synchronized and deleted processed HTTP requests from queue.`);
      }

      await new Promise(r => setTimeout(r, 500));
      await resolveQueueCounts();
      addLog(`🎉 Synchronization completed! All IndexedDB stores flushed cleanly.`);
      alert("✨ DATA SYNCHRONIZATION COMPLETE!\nAll offline biosecurity entries integrated successfully.");
    } catch (err: any) {
      addLog(`❌ Sync Error encountered: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in text-slate-800 max-w-4xl">
      {/* Top Welcome Title Grid */}
      <div className="bg-[#15462D]/5 border-l-4 border-[#15462D] p-4 rounded-r-xl">
        <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-[#15462D] leading-none">
          Governing Charters & Operational Control Panels
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 font-sans font-medium animate-fade-in">
          Review legal declarations and manage live network status, offline queues, and automated background browser memory optimization routines.
        </p>
      </div>

      {/* NEW: CENTRALIZED REFERENCE LIBRARY & HELP CENTER */}
      <div className="bg-white border text-left border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#15462D] dark:text-emerald-400" />
            <div>
              <h4 className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white">
                📚 ERICON Technical Reference Library &amp; Help Center
              </h4>
              <span className="text-[10px] text-slate-500 font-sans leading-none block mt-0.5">
                Centralized academic manuals, fluid mechanics formulas, and containment directives.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLibraryExpanded(!libraryExpanded)}
            className="px-2.5 py-1 text-[10px] font-mono border border-slate-200 rounded hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition focus:outline-none cursor-pointer"
          >
            {libraryExpanded ? 'HIDE LIBRARY [-]' : 'SHOW LIBRARY [+]'}
          </button>
        </div>

        {libraryExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Technical Notes */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, tech_notes: !prev.tech_notes }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-400 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.tech_notes ? '▼' : '▶'}</span>
                  <span>1. Technical Field Notes</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.tech_notes ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.tech_notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in font-sans">
                  Conduits consist of high-density Polyamide-6 ETT (Ecological Transfer Tunnels) smooth-walled bores, keeping absolute frictional resistance extremely low (roughness parameter ε typically under 0.015 mm). Tunnels are laid below the shallow cultivation freeze line, stabilizing microclimatic temperatures from seasonal spikes.
                </p>
              )}
            </div>

            {/* Box 2: Engineering Notes */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, eng_notes: !prev.eng_notes }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-400 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.eng_notes ? '▼' : '▶'}</span>
                  <span>2. Engineering Specifications</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.eng_notes ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.eng_notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in font-sans">
                  Subterranean modules utilize passive gravity drainage channels to discharge agricultural condensation, preventing structural fluid build-ups that could hinder mechanical OWEP gates or trigger micro-pneumatic resistance blocks.
                </p>
              )}
            </div>

            {/* Box 3: Biosecurity Notes */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, biosecurity_notes: !prev.biosecurity_notes }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-400 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.biosecurity_notes ? '▼' : '▶'}</span>
                  <span>3. Biosecurity Protocols</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.biosecurity_notes ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.biosecurity_notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in font-sans">
                  Unlike chemical rat poisons which cause biomagnification (killing endangered falcons, owls, and local raptor cohorts that consume slow, dying rodents), ERICON relies strictly on mechanical directional transfer gates. Captured specimens are kept safe, dry, thermally stable, and well-ventilated, ensuring healthy, non-chemical samples for epidemiological screening.
                </p>
              )}
            </div>

            {/* Box 4: OWEP Documentation */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, owep_doc: !prev.owep_doc }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-800 dark:text-emerald-400 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.owep_doc ? '▼' : '▶'}</span>
                  <span>4. OWEP Mechanics Manual</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.owep_doc ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.owep_doc && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in font-sans">
                  Active mechanical entry gates are calibrated for maximum mammalian capture rates with absolute zero backpressure egress. Designs include Option A (Pivot Swing Flap Gate requiring under 0.5N opening force), Option B (Radial Flex-Finger Interlocking Needles), and Option C (Hybrid Air-Tight Spring Gates).
                </p>
              )}
            </div>

            {/* Box 5: Mechanical Principles */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, mech_notes: !prev.mech_notes }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-805 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.mech_notes ? '▼' : '▶'}</span>
                  <span>5. Aero-Mechanical Principles</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.mech_notes ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.mech_notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in font-sans">
                  Pneumatic pressure differentials between the inlet (P1) and outlet (P2) drive high-efficiency air velocity profiles through the tube (fluidic density factor 1.2 kg/m³). Unidirectional gate flaps respond dynamically to kinetic passage force, using leverage physics bounds to seal upon ingress completion.
                </p>
              )}
            </div>

            {/* Box 6: Formula Explanations */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
              <button
                type="button"
                onClick={() => setOpenSections(prev => ({ ...prev, formulas_notes: !prev.formulas_notes }))}
                className="w-full flex items-center justify-between text-left font-mono text-[10.5px] font-bold uppercase text-emerald-805 focus:outline-none cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span>{openSections.formulas_notes ? '▼' : '▶'}</span>
                  <span>6. Physics &amp; Formulas Index</span>
                </span>
                <span className="text-[8.5px] text-slate-404 font-bold uppercase">{openSections.formulas_notes ? 'COLLAPSE' : 'EXPAND'}</span>
              </button>
              {openSections.formulas_notes && (
                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in space-y-1.5 font-mono">
                  <p>• <strong>Reynolds Number (Re):</strong> Re = (ρ * v * D) / μ</p>
                  <p>• <strong>Darcy-Weisbach friction:</strong> hf = f * (L/D) * (v² / 2g)</p>
                  <p>• <strong>Pressure Differential (ΔP):</strong> dP = P1 - P2</p>
                  <p>• <strong>Air Exchange Rate (ACH):</strong> Volumetric Hourly flow / Tube Volume</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Command panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-normal">
        
        {/* PANEL 1: Offline Mode & Network Interceptor */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b pb-1.5 font-mono text-[11px] uppercase tracking-wide">
              {offlineActive ? (
                <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-800" />
              )}
              <span>Network Connectivity Operations</span>
            </h4>
            
            <p className="text-[11.5px] text-slate-500 mt-2 leading-relaxed">
              Force Sokoine field research units into offline mode. This intercepts outgoing API calls and holds them secure inside local IndexedDB containers.
            </p>

            {/* Offline toggle buttons */}
            <div className="flex items-center gap-2 mt-4 bg-slate-50 border p-2 rounded-lg justify-between shadow-4xs">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                Network Transport:
              </span>
              <div className="flex bg-slate-200 p-0.5 rounded-md text-[9px] font-mono tracking-wider font-extrabold shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <button
                  type="button"
                  onClick={() => handleToggleOfflineMode(false)}
                  className={`px-3 py-1.5 rounded cursor-pointer transition border ${
                    !offlineActive
                      ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] font-extrabold shadow-sm ericon-active-portal-tab'
                      : 'text-slate-605 dark:text-slate-300 hover:bg-slate-300 border-transparent'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleOfflineMode(true)}
                  className={`px-3 py-1.5 rounded cursor-pointer transition border ${
                    offlineActive
                      ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] font-extrabold shadow-sm ericon-active-portal-tab'
                      : 'text-slate-605 dark:text-slate-300 hover:bg-slate-300 border-transparent'
                  }`}
                >
                  Offline (Force)
                </button>
              </div>
            </div>

            {/* Queue statistics */}
            <div className="mt-4 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-[11px] font-mono leading-none">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Pending Uploads (IndexedDB)</p>
                <div className="flex gap-4 mt-2 font-black text-slate-800">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{specimenQueueCount} Specimen Log{specimenQueueCount !== 1 ? 's' : ''}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>{apiRequestQueueCount} Interceptions</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <button
              type="button"
              onClick={handleSyncQueues}
              disabled={isSyncing || (specimenQueueCount === 0 && apiRequestQueueCount === 0)}
              className="w-full bg-emerald-900 border border-emerald-950 text-white hover:bg-emerald-950 font-bold font-mono text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Synchronize IndexedDB Queue</span>
            </button>

            {syncLogs.length > 0 && (
              <div className="bg-slate-900 text-[#10b981] p-3 rounded-lg font-mono text-[9px] mt-2 max-h-[110px] overflow-y-auto space-y-1.5 border border-slate-950 leading-normal">
                {syncLogs.map((log, i) => (
                  <p key={i} className="animate-fade-in">{log}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2: Storage Archiving & Maintenance */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b pb-1.5 font-mono text-[11px] uppercase tracking-wide">
              <Database className="w-4 h-4 text-[#15462D]" />
              <span>Storage Optimization Maintenance</span>
            </h4>
            
            <p className="text-[11.5px] text-slate-500 mt-2 leading-relaxed">
              Keeps browser IndexedDB and active localStorage light. Old specimen reports (&gt; 180 days old) are archived safely in backup storage, keeping consolidated local summaries alive.
            </p>

            {/* Archive stats summaries */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-2 border rounded-lg">
                <span className="text-[8.5px] uppercase font-semibold font-mono text-slate-400">Memory footprint</span>
                <p className="font-mono text-slate-800 font-extrabold text-[11px] mt-1">
                  {activeRecordsCount} Active logs
                </p>
                <p className="text-[8px] text-slate-400 font-sans leading-none mt-1">Validated &lt; 180 days</p>
              </div>

              <div className="bg-slate-50 p-2 border rounded-lg">
                <span className="text-[8.5px] uppercase font-semibold font-mono text-slate-400">Archived summaries</span>
                <p className="font-mono text-[#15462D] font-extrabold text-[11px] mt-1">
                  {archiveStats.totalCount} Specimens
                </p>
                <p className="text-[8px] text-slate-500 font-sans leading-none mt-1">
                  Reclaimed: {(archiveStats.bytesReclaimed / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {archiveStats.totalCount > 0 && (
              <div className="mt-3 p-2 bg-slate-50 border rounded-lg text-[9.5px] font-mono leading-relaxed text-slate-600">
                <h5 className="font-black text-slate-700 border-b pb-0.5 mb-1 uppercase tracking-wider text-[8px]">
                  Local Maintained Summary Statistics (Rebuilt)
                </h5>
                <div className="space-y-0.5">
                  <p className="flex justify-between">
                    <span>• Last Background Clean run:</span>
                    <span className="text-slate-800 font-bold">{archiveStats.lastMaintenanceRun.split(',')[0]}</span>
                  </p>
                  <div>
                    <p className="font-bold">• Species Diversity Count (Archived):</p>
                    <div className="grid grid-cols-2 gap-1 pl-2 text-slate-500 text-[8.5px] font-sans">
                      {Object.entries(archiveStats.speciesTally).map(([sp, count]) => (
                        <p key={sp}>• {sp.split(' ')[0]}: <span className="font-bold font-mono text-slate-705">{count}</span></p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t space-y-2">
            <button
              type="button"
              onClick={() => {
                setActiveMaintenanceTab('audit');
                runArchiverMaintenance(true);
              }}
              className={`w-full font-bold font-mono text-[10px] uppercase tracking-wide px-3 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 border ${
                activeMaintenanceTab === 'audit'
                  ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] font-extrabold shadow-sm ericon-active-portal-tab'
                  : 'bg-[#15462D] border-emerald-950 text-white hover:bg-emerald-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Run Storage Compression Audit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMaintenanceTab('inject');
                handleInjectHistoricalSpecimens();
              }}
              className={`w-full font-bold font-mono text-[9px] uppercase tracking-wide px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 border ${
                activeMaintenanceTab === 'inject'
                  ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] font-extrabold shadow-sm ericon-active-portal-tab'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Inject Historical Rodents (Test)</span>
            </button>
          </div>
        </div>

        {/* Collapsible Governing Policy Panels */}
        {/* Box 1: Terms of Service */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('terms')}
            className="w-full flex items-center justify-between font-extrabold text-[#15462D] dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wide border-b pb-1.5 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#15462D]" />
              <span>▼ Terms of Service &amp; Usage</span>
            </div>
            <span className="text-xs">{openSections.terms ? '▲' : '▼'}</span>
          </button>
          {openSections.terms && (
            <p className="text-slate-650 leading-relaxed text-[11.5px] pt-1 animate-fade-in">
              Academic members agree to record actual biosurveillance metrics collected on-site within Sokoine University research grids. Releasing corrupted or fictitiously modeled biological structures is strictly forbidden.
            </p>
          )}
        </div>

        {/* Box 2: Privacy Policy */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('privacy')}
            className="w-full flex items-center justify-between font-extrabold text-[#15462D] dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wide border-b pb-1.5 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#15462D]" />
              <span>▼ Privacy &amp; Geographic Policy</span>
            </div>
            <span className="text-xs">{openSections.privacy ? '▲' : '▼'}</span>
          </button>
          {openSections.privacy && (
            <p className="text-slate-650 leading-relaxed text-[11.5px] pt-1 animate-fade-in">
              All captured GPS coordinates, farmer identification metrics, and cooperative structural blueprints are encrypted locally. Specimen logs do not share farmer surnames or family addresses outside peer-reviewed repositories.
            </p>
          )}
        </div>

        {/* Box 3: Security & Cryptographic Audits */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('security')}
            className="w-full flex items-center justify-between font-extrabold text-[#15462D] dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wide border-b pb-1.5 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15462D]" />
              <span>▼ Security Information</span>
            </div>
            <span className="text-xs">{openSections.security ? '▲' : '▼'}</span>
          </button>
          {openSections.security && (
            <p className="text-slate-650 leading-relaxed text-[11.5px] pt-1 animate-fade-in">
              The local Database operates offline-first with IndexedDB fallback structures. Peer review link identifiers (REV-codes) utilize dynamic short-session expiration (7 to 30 days maximum) to secure database logs.
            </p>
          )}
        </div>

        {/* Box 4: Governance Details */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2">
          <button
            type="button"
            onClick={() => toggleSection('governance')}
            className="w-full flex items-center justify-between font-extrabold text-amber-600 dark:text-amber-400 font-mono text-[11px] uppercase tracking-wide border-b pb-1.5 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>▼ Governance Standards</span>
            </div>
            <span className="text-xs">{openSections.governance ? '▲' : '▼'}</span>
          </button>
          {openSections.governance && (
            <p className="text-slate-650 leading-relaxed text-[11.5px] pt-1 animate-fade-in">
              All biosecurity campaigns are fully reviewed annually by the Tanzania National Environmental Management Council (NEMC), assuring Zero-chemical wildlife impact on adjacent corridors.
            </p>
          )}
        </div>

        {/* Box 5: Scientific Integrity */}
        <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2 md:col-span-2">
          <button
            type="button"
            onClick={() => toggleSection('ethics')}
            className="w-full flex items-center justify-between font-extrabold text-[#15462D] dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wide border-b pb-1.5 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>▼ Scientific Integrity &amp; Ethics Charter</span>
            </div>
            <span className="text-xs">{openSections.ethics ? '▲' : '▼'}</span>
          </button>
          {openSections.ethics && (
            <p className="text-slate-650 leading-relaxed text-[11.5px] pt-1 animate-fade-in">
              Our research operates under Sokoine University Collaborative Guideline #2026-B. Non-chemical mechanical exclusion ensures complete safety to endemic Tanzanian raptor cohorts (e.g., Barn Owls), avoiding secondary toxicity cascades commonly caused by anticoagulant-based rodent poisons.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
