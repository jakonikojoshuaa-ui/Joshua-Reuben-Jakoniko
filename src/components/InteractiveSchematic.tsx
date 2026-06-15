/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Play, RotateCcw, HelpCircle, ArrowRight, ShieldAlert, Cpu, Wrench, AlertTriangle, Clock, Download, Thermometer, Maximize2, Minimize2, X } from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, CapsuleSimulation, RodentSpecies } from '../types';
import { SPECIES_PROFILES } from '../utils/physics';
import { exportPremiumExcelSpreadsheet } from '../utils/premiumExport';

interface InteractiveSchematicProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  capsule: CapsuleSimulation;
  onLaunchCapsule: () => void;
  onResetCapsule: () => void;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
  survivalScore: number;
  lowSurvivalTimeMs: number;
  onSetLowSurvivalTime: (time: number | ((prev: number) => number)) => void;
  visualMode?: 'standard' | 'comfort' | 'night';
  isFloatingPip?: boolean;
  onCloseFloatingPip?: () => void;
  onExpandFloatingPip?: () => void;
  auditLogs?: any[];
}

const generateInitialPressureData = (basePressure: number, turbulent: boolean) => {
  const data: number[] = [];
  for (let i = 0; i < 20; i++) {
    const noise = (Math.sin(i * 0.8) * 0.3) + ((Math.random() - 0.5) * 0.2);
    const base = turbulent ? basePressure * 0.92 + (Math.sin(i * 1.5) * 1.2) : basePressure;
    data.push(Number((base + noise).toFixed(2)));
  }
  return data;
};

export const InteractiveSchematic: React.FC<InteractiveSchematicProps> = ({
  specs,
  calc,
  capsule,
  onLaunchCapsule,
  onResetCapsule,
  rodentSpecies,
  owepDesign,
  survivalScore,
  lowSurvivalTimeMs,
  onSetLowSurvivalTime,
  visualMode = 'standard',
  isFloatingPip = false,
  onCloseFloatingPip,
  onExpandFloatingPip,
  auditLogs = [],
}) => {
  // Zoom & Pan responsive dragging workspace
  const [zoom, setZoom] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Floating PiP collapsible tabs state: 'none', 'metrics', 'logs', 'diagnostics'
  const [expandedPipTab, setExpandedPipTab] = useState<'none' | 'metrics' | 'logs' | 'diagnostics'>('none');

  // Picture-in-Picture interactive overlay state
  const [localIsPipActive, setLocalIsPipActive] = useState<boolean>(false);
  const isPipActive = isFloatingPip || localIsPipActive;
  const setIsPipActive = (val: boolean) => {
    setLocalIsPipActive(val);
    if (!val && onCloseFloatingPip) {
      onCloseFloatingPip();
    }
  };

  // Simulator Display Mode State (Compact, Standard, Presentation, Full Research)
  const [simDisplayMode, setSimDisplayMode] = useState<'compact' | 'standard' | 'presentation' | 'research'>('standard');

  // Hover Tooltip System for explaining sections
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    flowDir: string;
    pressureChange: string;
    functionDesc: string;
    x: number;
    y: number;
  } | null>(null);

  // Refs for Touch pinch-zoom events
  const touchStartDistRef = React.useRef<number | null>(null);
  const touchStartZoomRef = React.useRef<number>(100);

  const handleMouseMoveTooltip = (e: React.MouseEvent, segmentId: string) => {
    const parentRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
    const x = e.clientX - (parentRect?.left || 0) + 15;
    const y = e.clientY - (parentRect?.top || 0) + 15;

    let title = '';
    let flowDir = '';
    let pressureChange = '';
    let functionDesc = '';

    if (segmentId === 'owep') {
      title = 'One-Way Entry Port (OWEP) Inlet';
      flowDir = specs.p2 > specs.p1 ? 'Reverse Bypass Flow (Right-to-Left)' : 'Inflow Intake Draft (Left-to-Right)';
      pressureChange = `Inflow static pressure established at P1 = ${specs.p1.toFixed(1)} kPa`;
      functionDesc = 'Mechanical low-friction gateway for capture of rodents; counterbalanced door or radial fingers allow entries but latches/blocks exit attempts.';
    } else if (segmentId === 'transit') {
      title = 'Central Transit Corridor (Polyamide-6 Duct)';
      flowDir = `Axial direction flow speed: ${calc.velocity.toFixed(3)} m/s`;
      pressureChange = `Linear degradation drop from P1 (${specs.p1.toFixed(1)} kPa) to P2 (${specs.p2.toFixed(1)} kPa)`;
      functionDesc = 'Smooth wall insulation-lined transit tube where pneumatic dispatch carriers deliver physical items & specimen profiles.';
    } else if (segmentId === 'port-alpha') {
      title = 'Fiberoptic Port Alpha';
      flowDir = 'Hermetic seal preserves axial flow vectors';
      pressureChange = 'Localized negligible drop when fully closed';
      functionDesc = 'Airtight inspection port with silicon gaskets for insertion of fiberoptic probes and camera logging sweeps.';
    } else if (segmentId === 'port-beta') {
      title = 'Inspection Hatch Beta';
      flowDir = 'Hermetic pressure seal remains closed';
      pressureChange = 'Negligible frictional boundary local pressure loss';
      functionDesc = 'Secondary airtight maintenance and inspection interface, allowing calibration sweeps of optical dispatch tags.';
    } else if (segmentId === 'terminal') {
      title = 'Terminal Receiver Hub (Exit Compartment)';
      flowDir = 'Outward discharge exhaustion vector';
      pressureChange = `Exhaust baseline sink established at P2 = ${specs.p2.toFixed(1)} kPa`;
      functionDesc = 'Secure collection cell with built-in sensors, deceleration bumper stops, and fan feedback vacuum channels.';
    }

    setActiveTooltip({
      title,
      flowDir,
      pressureChange,
      functionDesc,
      x,
      y
    });
  };

  // Maintain inspection history state with standard premium logs
  const [serviceHistory, setServiceHistory] = useState<{
    alpha: {
      lastInspection: string;
      logs: { id: string; date: string; type: string; inspector: string; details: string; status: 'completed' | 'pending' }[];
    };
    beta: {
      lastInspection: string;
      logs: { id: string; date: string; type: string; inspector: string; details: string; status: 'completed' | 'pending' }[];
    };
  }>(() => {
    try {
      const saved = localStorage.getItem('ericon_ports_service_history_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      alpha: {
        lastInspection: '2026-05-18 16:30',
        logs: [
          {
            id: 'a-1',
            date: '2026-05-18 16:30',
            type: 'Micro-Ventilation Filter Flush',
            inspector: 'Joshua Reuben Jakoniko, MSc',
            details: 'Cleared particulate build-up from transit path. Volumetric efficiency verified normal.',
            status: 'completed'
          },
          {
            id: 'a-2',
            date: '2026-05-10 09:15',
            type: 'O-Ring Elastic Check',
            inspector: 'Joshua Reuben Jakoniko, MSc',
            details: 'Checked silicone polymer seal elastic threshold. Satisfied ISO-1102 requirements for 120 kPa test pressure.',
            status: 'completed'
          }
        ]
      },
      beta: {
        lastInspection: '2026-05-20 14:45',
        logs: [
          {
            id: 'b-1',
            date: '2026-05-20 14:45',
            type: 'Gasket Inspection',
            inspector: 'Joshua Reuben Jakoniko, MSc',
            details: 'Inspected blunt interlock hinge tension. Restored to 0.5N gravity tolerance.',
            status: 'completed'
          },
          {
            id: 'b-2',
            date: '2026-05-12 11:00',
            type: 'Optical Calibration',
            inspector: 'Joshua Reuben Jakoniko, MSc',
            details: 'Aligned ERICON laser trajectory. Transit sensor timing verified at 80Hz resolution.',
            status: 'completed'
          }
        ]
      }
    };
  });

  // Save history updates
  useEffect(() => {
    try {
      localStorage.setItem('ericon_ports_service_history_v1', JSON.stringify(serviceHistory));
    } catch (e) {
      console.error(e);
    }
  }, [serviceHistory]);

  const [selectedPort, setSelectedPort] = useState<'alpha' | 'beta' | null>(null);
  const [hoveredPort, setHoveredPort] = useState<'alpha' | 'beta' | null>(null);

  const [autoInspectAlpha, setAutoInspectAlpha] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ericon_ports_auto_inspect_alpha_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [autoInspectBeta, setAutoInspectBeta] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ericon_ports_auto_inspect_beta_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [countdownAlpha, setCountdownAlpha] = useState<number>(15 * 60);
  const [countdownBeta, setCountdownBeta] = useState<number>(15 * 60);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync Auto-Inspect preferences
  useEffect(() => {
    try {
      localStorage.setItem('ericon_ports_auto_inspect_alpha_v1', String(autoInspectAlpha));
    } catch (e) {
      console.error(e);
    }
  }, [autoInspectAlpha]);

  useEffect(() => {
    try {
      localStorage.setItem('ericon_ports_auto_inspect_beta_v1', String(autoInspectBeta));
    } catch (e) {
      console.error(e);
    }
  }, [autoInspectBeta]);

  const [pressuresAlpha, setPressuresAlpha] = useState<number[]>(() => 
    generateInitialPressureData(specs.p1, lowSurvivalTimeMs >= 3 * 3600 * 1000)
  );

  const [pressuresBeta, setPressuresBeta] = useState<number[]>(() => 
    generateInitialPressureData(specs.p2, lowSurvivalTimeMs >= 3 * 3600 * 1000)
  );

  // Live local airflow pressure telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      const isTurbulent = lowSurvivalTimeMs >= 3 * 3600 * 1000;
      
      setPressuresAlpha(prev => {
        const noise = (Math.sin(Date.now() / 2000) * 0.25) + ((Math.random() - 0.5) * 0.15);
        const base = isTurbulent ? specs.p1 * 0.92 + (Math.sin(Date.now() / 5000) * 1.0) : specs.p1;
        const newVal = Number((base + noise).toFixed(2));
        return [...prev.slice(1), newVal];
      });

      setPressuresBeta(prev => {
        const noise = (Math.sin(Date.now() / 2500) * 0.25) + ((Math.random() - 0.5) * 0.15);
        const base = isTurbulent ? specs.p2 * 0.90 + (Math.sin(Date.now() / 6000) * 0.8) : specs.p2;
        const newVal = Number((base + noise).toFixed(2));
        return [...prev.slice(1), newVal];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [specs.p1, specs.p2, lowSurvivalTimeMs]);

  // Interval hook to handle auto-inspect countdown scans every 15 mins (900 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timestring = now.getFullYear() + "-" + 
        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getDate()).padStart(2, '0') + " " + 
        String(now.getHours()).padStart(2, '0') + ":" + 
        String(now.getMinutes()).padStart(2, '0') + ":" + 
        String(now.getSeconds()).padStart(2, '0');

      if (autoInspectAlpha) {
        setCountdownAlpha((prev) => {
          if (prev <= 1) {
            const newLogId = 'auto-alpha-' + Math.random().toString(36).substring(2, 9);
            const entry = {
              id: newLogId,
              date: timestring,
              type: 'Automated Telemetry Scan',
              inspector: 'Auto-Inspect System',
              details: `Periodic automated node scan. Core Survival Index currently registered at ${survivalScore.toFixed(1)}%. Primary air conduits and polymer integrity within expectations.`,
              status: 'completed' as const
            };
            setServiceHistory(prevHistory => ({
              ...prevHistory,
              alpha: {
                lastInspection: timestring,
                logs: [entry, ...prevHistory.alpha.logs]
              }
            }));
            return 15 * 60;
          }
          return prev - 1;
        });
      }

      if (autoInspectBeta) {
        setCountdownBeta((prev) => {
          if (prev <= 1) {
            const newLogId = 'auto-beta-' + Math.random().toString(36).substring(2, 9);
            const entry = {
              id: newLogId,
              date: timestring,
              type: 'Automated Telemetry Scan',
              inspector: 'Auto-Inspect System',
              details: `Periodic automated node scan. Core Survival Index currently registered at ${survivalScore.toFixed(1)}%. Laser feedback trajectory and optical hinge alignment stable.`,
              status: 'completed' as const
            };
            setServiceHistory(prevHistory => ({
              ...prevHistory,
              beta: {
                lastInspection: timestring,
                logs: [entry, ...prevHistory.beta.logs]
              }
            }));
            return 15 * 60;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoInspectAlpha, autoInspectBeta, survivalScore]);

  // Generate coordinates for flow parallel arrows to show "Laminar Airflow Vector V1"
  // Animated using SVG dashoffset or requestAnimationFrame offsets
  const arrowRows = useMemo(() => {
    if (simDisplayMode === 'compact') return 3;
    if (simDisplayMode === 'presentation') return 3;
    return 4;
  }, [simDisplayMode]);

  const arrowsPerRow = useMemo(() => {
    if (simDisplayMode === 'presentation') return 6;
    // Adapt based on velocity: higher velocity = shorter spacing / more arrows for feedback
    return Math.min(Math.max(Math.floor(calc.velocity / 3.5) + 4, 5), 12);
  }, [calc.velocity, simDisplayMode]);

  const arrowScale = useMemo(() => {
    if (simDisplayMode === 'presentation') return 1.35;
    if (simDisplayMode === 'compact') return 0.8;
    return 1.0;
  }, [simDisplayMode]);
  
  const tubesLengthFraction = 0.52; // tube occupies 52% of canvas width in center

  const isServiceRequired = lowSurvivalTimeMs >= 3 * 3600 * 1000;

  const formatHours = (ms: number) => {
    const totSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totSeconds / 3600);
    const mins = Math.floor((totSeconds % 3600) / 60);
    const secs = totSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate flow color based on state
  const flowColor = useMemo(() => {
    if (calc.flowRegume === 'Laminar') return '#2563eb'; // Deep premium blue
    if (calc.flowRegume === 'Transition') return '#d97706'; // Amber orange
    return '#dc2626'; // Turbulent Crimson red
  }, [calc.flowRegume]);

  // Handle flow speed: we will map physically computed velocity to animation speed
  const animationDuration = useMemo(() => {
    if (calc.velocity <= 0.1) return 0;
    // Map 1m/s to 4s cycle, 50m/s to 0.2s cycle
    const duration = 5 / Math.max(calc.velocity / 3, 0.2);
    return Math.min(Math.max(duration, 0.15), 10);
  }, [calc.velocity]);

  // Capsule pixel offset calculation
  const capsulePercent = capsule.position / specs.length;
  // Left side of tube starts at x=200, ends at x=720 (total span 520px)
  const tubeStartX = 200;
  const tubeWidth = 520;
  const capsuleX = tubeStartX + capsulePercent * tubeWidth;

  const profile = SPECIES_PROFILES[rodentSpecies] || SPECIES_PROFILES.field_mouse;
  const idealTemp = (profile.optMin + profile.optMax) / 2;
  const deviation = specs.temperature - idealTemp;
  const minRange = profile.optMin - 8;
  const maxRange = profile.optMax + 8;
  const indicatorPercent = Math.min(Math.max(((specs.temperature - minRange) / (maxRange - minRange)) * 100, 0), 100);
  
  const deviationSign = deviation > 0 ? '+' : '';
  const deviationColor = specs.temperature < profile.optMin 
    ? 'text-blue-600' 
    : specs.temperature > profile.optMax 
    ? 'text-rose-600' 
    : 'text-emerald-650';

  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 80));
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomReset = () => { setZoom(100); setPanX(0); setPanY(0); };
  const handleZoomPresetFit = () => { setZoom(100); setPanX(0); setPanY(0); };
  const handleZoomPresetFull = () => { setZoom(130); setPanX(-100); setPanY(-40); };

  return (
    <div 
      className={isFloatingPip 
        ? "fixed bottom-6 right-6 z-[200] w-[480px] bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl flex flex-col p-4 text-white font-mono animate-scale-up h-auto"
        : "bg-white border text-slate-800 border-slate-200 rounded-sm shadow-md overflow-hidden flex flex-col h-full"
      } 
      id="schematic-container"
    >
      {/* Mini Header for Floating PiP */}
      {isFloatingPip && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5 select-none" id="floating-pip-titlebar">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
              Underground Fluidics PiP
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {onExpandFloatingPip && (
              <button
                type="button"
                onClick={onExpandFloatingPip}
                className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition cursor-pointer"
                title="Expand to Full Workspace"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onCloseFloatingPip}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition cursor-pointer"
              title="Close PiP Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Schematic Header Toolbar */}
      {!isFloatingPip && (
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4" id="schematic-toolbar">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-600 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-[#15462D] dark:text-[#15462D] uppercase ericon-live-vector-text-header" id="ericon-live-vector-text">
                ERICON Live Vector Network Overview // ERICON Eco-Framework
              </span>
            </div>

            {/* SIMULATION DISPLAY MODE PANEL (Compact, Standard, Presentation, Full Research) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200" id="sim-display-mode-selector">
              <span className="text-[8.5px] uppercase font-mono font-bold text-slate-450 px-2">Display:</span>
              {(['compact', 'standard', 'presentation', 'research'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSimDisplayMode(mode)}
                  className={`px-2 py-1 text-[9px] font-mono font-bold uppercase rounded transition-all cursor-pointer ${
                    simDisplayMode === mode
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          
          {/* Play/Reset capsule controls and Zoom Preset */}
          <div className="flex flex-wrap items-center gap-3">
            {/* ZOOM & PAN CAD VIEW CONTROLS CONTAINER */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 text-slate-100 p-1 px-2 rounded border border-slate-800 text-[9.5px] font-mono shadow-xs select-none">
              <span className="text-[8px] text-slate-400 font-bold tracking-wider">VIEWPORT:</span>
              <button type="button" onClick={handleZoomOut} className="px-1.5 py-0.5 bg-slate-800 rounded font-black hover:bg-slate-700 cursor-pointer text-slate-200 transition" title="Zoom Out">-</button>
              <span className="font-bold text-teal-400 w-8 text-center">{zoom}%</span>
              <button type="button" onClick={handleZoomIn} className="px-1.5 py-0.5 bg-slate-800 rounded font-black hover:bg-slate-700 cursor-pointer text-slate-200 transition" title="Zoom In">+</button>
              <div className="w-[1px] h-3.5 bg-slate-700 mx-1" />
              <button type="button" onClick={handleZoomPresetFit} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition cursor-pointer">Fit</button>
              <button type="button" onClick={handleZoomPresetFull} className="px-2 py-0.5 bg-emerald-850 hover:bg-emerald-900 text-emerald-100 font-bold rounded transition cursor-pointer">Full View</button>
              <button type="button" onClick={handleZoomReset} className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition cursor-pointer">Reset</button>
              <div className="w-[1px] h-3.5 bg-slate-700 mx-1" />
              <button 
                type="button" 
                onClick={() => setIsPipActive(!isPipActive)} 
                className={`px-2 py-0.5 font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                  isPipActive 
                    ? 'bg-rose-600 text-white hover:bg-rose-700 border border-rose-500' 
                    : 'bg-blue-600 text-blue-50 hover:bg-blue-700 border border-blue-500/30'
                }`}
              >
                <Maximize2 className="w-2.5 h-2.5" />
                <span>PIP FOCUS</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {capsule.isCompleted && (
                <span className="text-xs text-emerald-600 font-mono font-bold animate-pulse px-2.5 py-1 bg-emerald-50 rounded-sm border border-emerald-200">
                  ● PAYLOAD DELIVERED
                </span>
              )}
              <button
                onClick={onLaunchCapsule}
                type="button"
                disabled={capsule.isActive}
                id="btn-dispatch"
                className={`px-4 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider font-bold transition-all ${
                  capsule.isActive 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-blue-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Dispatch Carrier
                </span>
              </button>
              
              <button
                onClick={onResetCapsule}
                type="button"
                id="btn-reset-canister"
                className="px-3 py-1.5 border-2 border-slate-200 hover:bg-slate-50 rounded-sm font-mono text-xs uppercase tracking-wider font-bold text-slate-600 transition-all"
                title="Reset parameters and capsule position"
              >
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survival Index Telemetry Monitoring and Speedup Override Controls */}
      {!isFloatingPip && (
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-200 font-mono text-[10px] select-none" id="survival-telemetry-monitoring-bar">
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <span className="text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Cpu className="w-3.5 h-3.5" /> Telemetry Detector:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-sm shrink-0">
              <span className="text-slate-400">Current S.I.:</span>
              <span className={`font-black tracking-tight ${survivalScore >= 50 ? 'text-emerald-400' : 'text-rose-400 animate-pulse font-extrabold'}`}>
                {survivalScore}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-sm shrink-0">
              <span className="text-slate-400">Stress Duration (&lt;50%):</span>
              <span className={`font-bold tracking-tight ${isServiceRequired ? 'text-rose-400 font-black animate-pulse' : lowSurvivalTimeMs > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {formatHours(lowSurvivalTimeMs)} / 03:00:00
              </span>
            </div>
            
            {isServiceRequired ? (
              <span className="text-[9px] font-bold bg-rose-950 border-2 border-rose-500/50 text-rose-300 px-2 py-0.5 rounded-xs uppercase tracking-wider animate-pulse flex items-center gap-1 font-mono">
                <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" /> Service Required
              </span>
            ) : lowSurvivalTimeMs > 0 ? (
              <span className="text-[9px] font-bold bg-amber-950/80 border border-amber-600/30 text-amber-300 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-amber-400 shrink-0 animate-spin-slow" /> Stress Accumulating...
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded-sm border border-slate-850">
                ● All Systems Nominally Sound
              </span>
            )}
          </div>

          {/* Cheat / Developer Fast Test Buttons for easy verification */}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            {survivalScore < 50 ? (
              <button
                onClick={() => {
                  // Instantly advance to 3 hours of stress metrics (10,800,000 ms)
                  onSetLowSurvivalTime(3 * 3600 * 1000);
                }}
                type="button"
                className="px-2.5 py-1 bg-amber-600 border border-amber-700 hover:bg-amber-700 active:bg-amber-800 text-white rounded-sm font-black tracking-wide leading-tight transition cursor-pointer flex items-center gap-1"
                title="Instantly fake/simulate environmental exposure to 3 hours of stress metrics to trigger Service Required state"
              >
                ⏩ Advance 3h Stress
              </button>
            ) : (
              <span className="text-[8.5px] text-slate-500 italic font-medium font-mono">
                (Reduce S.I. below 50% to activate Advance option)
              </span>
            )}
            <button
              onClick={() => onSetLowSurvivalTime(0)}
              disabled={lowSurvivalTimeMs === 0}
              type="button"
              className="px-2 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-705 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-sm font-bold leading-tight transition cursor-pointer"
            >
              Reset Clock
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive CAD Blueprint Area (Adapts dynamically to Compact/Standard/PIP styles with glass fog backdrop) */}
      <div className={
        isFloatingPip
          ? 'relative h-[195px] bg-[#0c1424] flex items-center justify-center p-2 rounded-md border border-slate-800 overflow-hidden select-none'
          : isPipActive 
            ? 'fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none' 
            : simDisplayMode === 'compact'
              ? 'relative h-[160px] min-h-[160px] bg-slate-50/50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-200 select-none'
              : 'relative flex-1 min-h-[400px] bg-slate-50/50 flex items-center justify-center p-6 overflow-hidden border-b border-slate-200 select-none'
      } id="cad-blueprint-housing">
        
        {/* If PIP focus mode is active and not floating, display clear viewport instructions and simple Exit button in the top left */}
        {isPipActive && !isFloatingPip && (
          <div className="absolute top-4 left-4 z-[110] flex items-center gap-2">
            <span className="text-[9px] bg-blue-600 text-white font-mono font-black tracking-widest px-2.5 py-0.5 rounded border border-blue-500 uppercase flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              PIP Focus Active
            </span>
            <span className="text-[9.5px] text-slate-300 font-mono font-medium uppercase tracking-wider hidden sm:inline">Interactive Vector Network Diagnostic</span>
          </div>
        )}

        {/* If Floating PIP active, display inline run and reset controls right in the viewport area */}
        {isFloatingPip && (
          <div className="absolute top-2 left-2 z-[115] flex items-center gap-1 bg-slate-900/90 p-1 rounded border border-slate-800 shadow-lg">
            <button
              onClick={onLaunchCapsule}
              disabled={capsule.isActive}
              type="button"
              className={`px-2 py-1 rounded text-[8.5px] font-bold uppercase transition flex items-center gap-1 cursor-pointer border ${
                capsule.isActive 
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-705'
              }`}
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Run</span>
            </button>
            <button
              onClick={onResetCapsule}
              type="button"
              className="px-2 py-1 rounded text-[8.5px] font-bold uppercase bg-slate-800 border border-slate-705 text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}

        {/* Expanded Close button overlay top right */}
        {isPipActive && !isFloatingPip && (
          <button
            type="button"
            onClick={() => setIsPipActive(false)}
            className="absolute top-4 right-4 z-[120] p-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-full transition cursor-pointer flex items-center justify-center"
            title="Exit Focus View"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Viewport controls for resizing bottom left while PIP in focus */}
        {isPipActive && !isFloatingPip && (
          <div className="absolute bottom-4 left-4 z-[110] flex gap-1.5 font-mono">
            <button
              type="button"
              onClick={() => { setZoom(130); setPanX(-100); setPanY(-40); }}
              className="px-2.5 py-1 bg-slate-800/80 border border-slate-705 text-slate-200 text-[9px] font-bold rounded hover:bg-slate-700 transition cursor-pointer"
            >
              Focus Core (130%)
            </button>
            <button
              type="button"
              onClick={() => { setZoom(100); setPanX(0); setPanY(0); }}
              className="px-2.5 py-1 bg-slate-800/80 border border-slate-705 text-slate-200 text-[9px] font-bold rounded hover:bg-slate-700 transition cursor-pointer"
            >
              Reset View
            </button>
          </div>
        )}

        {/* Click to expand PIP / Zoom Button overlay when standard screen and not in PIP focus mode or Floating PiP */}
        {!isPipActive && !isFloatingPip && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPipActive(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-bold rounded shadow-md border border-blue-500/30 transition-all cursor-pointer select-none"
              title="Open Dynamic Picture-in-Picture Focused View"
            >
              <Maximize2 className="w-3 h-3 animate-pulse" />
              <span>PIP Focus View</span>
            </button>
          </div>
        )}

        {/* Radial dot grid background according to Geometric Balance Design */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.75px, transparent 0.75px)', backgroundSize: '14px 14px' }} />

        <svg 
          viewBox="0 0 920 380" 
          className="w-full max-w-[920px] h-auto relative z-10 font-mono"
          id="cad-blueprint-svg"
          onDoubleClick={() => {
            setZoom(100);
            setPanX(0);
            setPanY(0);
          }}
          onWheel={(e) => {
            // Adjust zoom level dynamically
            const scaleFactor = 1.05;
            if (e.deltaY < 0) {
              setZoom(prev => Math.min(prev * scaleFactor, 400));
            } else {
              setZoom(prev => Math.max(prev / scaleFactor, 30));
            }
          }}
          onMouseDown={(e) => {
            setIsPanning(true);
            setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
          }}
          onMouseMove={(e) => {
            if (!isPanning) return;
            setPanX(e.clientX - panStart.x);
            setPanY(e.clientY - panStart.y);
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              setIsPanning(true);
              setPanStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
            } else if (e.touches.length === 2) {
              setIsPanning(false);
              const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              touchStartDistRef.current = dist;
              touchStartZoomRef.current = zoom;
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1 && isPanning) {
              setPanX(e.touches[0].clientX - panStart.x);
              setPanY(e.touches[0].clientY - panStart.y);
            } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
              const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
              const ratio = dist / touchStartDistRef.current;
              setZoom(Math.min(Math.max(Math.round(touchStartZoomRef.current * ratio), 30), 400));
            }
          }}
          onTouchEnd={() => {
            setIsPanning(false);
            touchStartDistRef.current = null;
          }}
          style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          {/* DEFINITIONS IN SVG FOR ANIMATIONS AND FILTER BLURS */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={flowColor} />
            </marker>
            <marker id="fine-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 2 L 6 5 L 0 8 z" fill="#64748b" />
            </marker>
            <marker id="force-p1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker id="force-drag" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
            </marker>
            
            {/* Linear pressure gradient color fill for tube */}
            <linearGradient id="pressure-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#eff6ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.2" />
            </linearGradient>

            {/* Tube Polyamide texture */}
            <pattern id="diagonal-hash" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#cbd5e1" strokeWidth="1" />
            </pattern>

            {/* Directional Glow Sweep/Shimmer warning gradient */}
            <linearGradient id="sweep-warning-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="35%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#dc2626" />
              <animate 
                attributeName="x1" 
                values="-100%;100%" 
                dur="1.2s" 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="x2" 
                values="0%;200%" 
                dur="1.2s" 
                repeatCount="indefinite" 
              />
            </linearGradient>

            {/* Neon safety glow filter */}
            <filter id="warning-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${panX}, ${panY}) scale(${zoom / 100})`} className="origin-center transition-transform duration-75">
          {/* ================= BACKGROUND TECHNICAL REFERENCES ================= */}
          <rect x="10" y="10" width="900" height="360" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6,4" />
          
          {/* TITLE BLOCK ARTIFACT (CAD-like drawing frame info) */}
          <g transform="translate(680, 290)" className="text-[9px] fill-slate-400">
            <rect x="0" y="0" width="210" height="65" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.75" />
            <line x1="0" y1="16" x2="210" y2="16" stroke="#e2e8f0" strokeWidth="0.75" />
            <line x1="0" y1="32" x2="210" y2="32" stroke="#e2e8f0" strokeWidth="0.75" />
            <line x1="0" y1="48" x2="210" y2="48" stroke="#e2e8f0" strokeWidth="0.75" />
            <line x1="105" y1="16" x2="105" y2="65" stroke="#e2e8f0" strokeWidth="0.75" />
            
            <text x="8" y="11" className="font-bold fill-slate-700 uppercase">TITLE: ERICON SUB-DUCT ARCHITECTURE </text>
            <text x="8" y="27">REYNOLDS: {(calc.reynoldsNumber).toFixed(0)}</text>
            <text x="113" y="27">REGIME: {calc.flowRegume.toUpperCase()}</text>
            <text x="8" y="43">D: {specs.diameter} mm</text>
            <text x="113" y="43">L: {specs.length} m</text>
            <text x="8" y="59">TEMP: {specs.temperature} °C</text>
            <text x="113" y="59">SYS SCALE: ISO-1102</text>
          </g>

          {/* ================= LEFT INLET: OWEP INLET (H.P. P1) ================= */}
          <g 
            className="cursor-help transition-all group/owep hover:opacity-95" 
            onMouseMove={(e) => handleMouseMoveTooltip(e, 'owep')} 
            onMouseLeave={() => setActiveTooltip(null)}
          >
          {/* Outer Housing Box */}
          <rect x="15" y="100" width="185" height="190" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" rx="4" id="owep-housing-box" />
          <rect x="15" y="100" width="185" height="28" fill="#f0fdf4" stroke="#10b981" strokeWidth="0" />
          <line x1="15" y1="128" x2="200" y2="128" stroke="#10b981" strokeWidth="2" />
          
          {/* OWEP Maintenance Filter Port */}
          <rect x="40" y="94" width="30" height="6" fill="#f0fdf4" stroke="#10b981" strokeWidth="1.5" rx="1" id="mport-inlet-hatch" />
          <line x1="55" y1="94" x2="55" y2="65" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="55" y1="65" x2="75" y2="65" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
          <text x="80" y="62" textAnchor="start" className="text-[8px] font-bold fill-emerald-800 tracking-wider ericon-schematic-ambient-text">
            ● OWEP MAINTENANCE PORT
          </text>
          <text x="80" y="72" textAnchor="start" className="text-[7px] fill-slate-400 font-bold uppercase ericon-schematic-ambient-text">
            HINGE & STOPPER ASSEMBLY COMPLIANCE
          </text>
          
          {/* Name Label with wrap and presentation check */}
          <text x="107" y="110" textAnchor="middle" className={`${simDisplayMode === 'presentation' ? 'text-[12.5px]' : simDisplayMode === 'compact' ? 'text-[9.5px]' : 'text-[11px]'} font-bold fill-emerald-950 tracking-wider font-mono`} id="owep-label-inlet-1">
            OWEP INFLOW
          </text>
          <text x="107" y="122" textAnchor="middle" className={`${simDisplayMode === 'presentation' ? 'text-[12.5px]' : simDisplayMode === 'compact' ? 'text-[9.5px]' : 'text-[11px]'} font-bold fill-emerald-950 tracking-wider font-mono`} id="owep-label-inlet-2">
            INLET (P1)
          </text>
          
          {/* OWEP Physical Gate Micro-Visualization */}
          <g transform="translate(150, 147)" id="owep-mechanical-gate">
            {owepDesign === 'flap_door' ? (
              // Design Option A: Gravity-Fed Flap Door
              <g>
                <rect x="0" y="0" width="45" height="81" fill="#f1f5f9" fillOpacity="0.8" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="22" cy="12" r="3.5" fill="#e2e8f0" stroke="#0f766e" strokeWidth="1.5" />
                <circle cx="22" cy="6" r="2.5" fill="#0f766e" />
                <line 
                  x1="22" 
                  y1="12" 
                  x2="22" 
                  y2="71" 
                  stroke="#0f766e" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  transform={specs.p1 > specs.p2 ? "rotate(15 22 12)" : "rotate(0 22 12)"}
                  className="transition-transform duration-300"
                />
                <rect x="24" y="72" width="7" height="6.5" fill="#ef4444" rx="1" />
                <text x="22" y="-8" textAnchor="middle" className="text-[6.5px] font-bold fill-slate-500 font-mono">
                  FLAP GATE (&lt;0.5N)
                </text>
                <text x="24" y="87" textAnchor="middle" className="text-[5.5px] font-bold fill-rose-600 font-mono">
                  STOP_RIDGE
                </text>
              </g>
            ) : owepDesign === 'flex_finger' ? (
              // Design Option B: Radial Flex-Finger Funnel pattern
              <g>
                <rect x="0" y="0" width="45" height="81" fill="#f1f5f9" fillOpacity="0.8" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M 4,14 L 20,34" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 4,66 L 20,46" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="34" x2="40" y2="34" stroke="#0284c7" strokeWidth="2" strokeDasharray="3,1" />
                <line x1="20" y1="46" x2="40" y2="46" stroke="#0284c7" strokeWidth="2" strokeDasharray="3,1" />
                <path d="M 40,30 L 40,50" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="1,1" />
                <text x="22" y="-8" textAnchor="middle" className="text-[6.5px] font-bold fill-blue-600 font-mono">
                  FLEX PIN FINGERS
                </text>
              </g>
            ) : (
              // Design Option C: Hybrid Adaptive OWEP Design Option
              <g>
                <rect x="0" y="0" width="45" height="81" fill="#f1f5f9" fillOpacity="0.8" stroke="#cbd5e1" strokeWidth="1" />
                <circle cx="22" cy="12" r="3" fill="#e2e8f0" stroke="#4f46e5" strokeWidth="1" />
                <line 
                  x1="22" 
                  y1="12" 
                  x2="22" 
                  y2="71" 
                  stroke="#4f46e5" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  transform={specs.p1 > specs.p2 ? "rotate(10 22 12)" : "rotate(0 22 12)"}
                  className="transition-transform duration-300"
                />
                <path d="M 3,20 L 15,35" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 3,60 L 15,45" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                <text x="22" y="-8" textAnchor="middle" className="text-[6.5px] font-bold fill-indigo-600 font-mono">
                  HYBRID OWEP
                </text>
              </g>
            )}
          </g>

          {/* Pressure Sensor Tap P1 Indicator inside expanded box */}
          <circle cx="107" cy="190" r="28" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,2" />
          <circle cx="107" cy="190" r="5" fill="#10b981" />
          <text x="107" y="156" textAnchor="middle" className="text-[8px] fill-slate-500 font-bold tracking-tight">P1 SENSOR</text>
          <text x="107" y="226" textAnchor="middle" className="text-[14px] font-bold fill-emerald-800 font-mono">
            {specs.p1.toFixed(1)} kPa
          </text>
          <text x="107" y="238" textAnchor="middle" className="text-[8px] fill-slate-400">INFLOW ACTIVE ENGINE</text>

          {/* Air Filter vents visual detailing */}
          <g stroke="#94a3b8" strokeWidth="1.5">
            <line x1="5" y1="145" x2="15" y2="145" />
            <line x1="5" y1="165" x2="15" y2="165" />
            <line x1="5" y1="185" x2="15" y2="185" />
            <line x1="5" y1="205" x2="15" y2="205" />
            <line x1="5" y1="225" x2="15" y2="225" />
          </g>
          
          {/* Air intake graphic label */}
          <text x="12" y="132" transform="rotate(-90 12 132)" className="text-[8px] fill-slate-400 tracking-widest uppercase ericon-schematic-ambient-text">
            Ambient Air Intake
          </text>

          {/* ================= HIGH PRESSURE REGULATOR / PRESSURE TAPS ================= */}
          {/* Leader line showing P1 boundary */}
          <path d="M 200,190 L 165,190" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
          </g>


          {/* ================= CENTRAL TRANSIT TUBE: POLYAMIDE-6 ================= */}
          <g 
            className="cursor-help transition-all group/transit" 
            onMouseMove={(e) => handleMouseMoveTooltip(e, 'transit')} 
            onMouseLeave={() => setActiveTooltip(null)}
          >
          {/* Diagonal hashing on outer boundary of tube representing the walls insulation/cladding */}
          <rect x="200" y="132" width="520" height="15" fill="url(#diagonal-hash)" stroke="#94a3b8" strokeWidth="1" />
          <rect x="200" y="228" width="520" height="15" fill="url(#diagonal-hash)" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Polyamide-6 core wall inner faces (thick clean blue technical lines) */}
          <line x1="200" y1="147" x2="720" y2="147" stroke="#1e40af" strokeWidth="2.5" />
          <line x1="200" y1="228" x2="720" y2="228" stroke="#1e40af" strokeWidth="2.5" />
          {/* Polyamide-6 Tube Access Ports & Inspection Hatches */}
          {/* Port 01: Maintenance Port Alpha */}
          <g 
            className="cursor-pointer group/alpha hover:opacity-95" 
            onClick={() => setSelectedPort(selectedPort === 'alpha' ? null : 'alpha')}
            onMouseEnter={() => setHoveredPort('alpha')}
            onMouseMove={(e) => handleMouseMoveTooltip(e, 'port-alpha')}
            onMouseLeave={() => { setHoveredPort(null); setActiveTooltip(null); }}
            id="mport-alpha-group"
          >
            <rect 
              x="310" 
              y="126" 
              width="24" 
              height="6" 
              fill={selectedPort === 'alpha' ? '#3b82f6' : (isServiceRequired ? 'url(#sweep-warning-grad)' : '#eff6ff')} 
              stroke={selectedPort === 'alpha' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#1e40af')} 
              strokeWidth={selectedPort === 'alpha' ? 2.5 : (isServiceRequired ? 2 : 1.5)} 
              filter={isServiceRequired ? 'url(#warning-glow)' : undefined}
              rx="1" 
              id="mport-alpha-fitting" 
              onMouseEnter={() => setHoveredPort('alpha')}
              onMouseLeave={() => setHoveredPort(null)}
            >
              {isServiceRequired && (
                <>
                  {selectedPort === 'alpha' && (
                    <animate 
                      attributeName="fill" 
                      values="#3b82f6;#60a5fa;#3b82f6" 
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                  )}
                  <animate 
                    attributeName="stroke" 
                    values={selectedPort === 'alpha' ? '#1d4ed8;#60a5fa;#1d4ed8' : '#dc2626;#ef4444;#dc2626'} 
                    dur="1.5s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="stroke-width" 
                    values={selectedPort === 'alpha' ? '2.5;3.5;2.5' : '2;3.5;2'} 
                    dur="1.5s" 
                    repeatCount="indefinite" 
                  />
                </>
              )}
            </rect>
            {isServiceRequired && (
              <g id="alpha-service-indicators">
                {/* Dynamic visual indicator (pulsing red halo) directly onto the port fitting */}
                <circle cx="322" cy="129" r="8.5" fill="none" stroke="#ef4444" strokeWidth="1.5" className="opacity-95">
                  <animate attributeName="r" values="4;13;4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0.1;0.95" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Central active warning bullet */}
                <circle cx="322" cy="129" r="3" fill="#dc2626" />
              </g>
            )}
            <line x1="322" y1="126" x2="322" y2="80" stroke={selectedPort === 'alpha' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#2563eb')} strokeWidth={selectedPort === 'alpha' ? 1.5 : 1} strokeDasharray="2,2" />
            <line x1="322" y1="80" x2="302" y2="80" stroke={selectedPort === 'alpha' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#2563eb')} strokeWidth={selectedPort === 'alpha' ? 1.5 : 1} strokeDasharray="2,2" />
            <text 
              x="297" 
              y="77" 
              textAnchor="end" 
              className={`text-[8px] font-bold tracking-wider transition-colors ${selectedPort === 'alpha' ? 'fill-blue-600 font-black' : (isServiceRequired ? 'fill-rose-700 font-extrabold animate-pulse' : 'fill-blue-900 group-hover/alpha:fill-blue-600')}`}
            >
              {isServiceRequired ? '⚠️ SERVICE REQUIRED — PORT ALPHA' : '● MAINTENANCE PORT ALPHA'}
            </text>
            <text 
              x="297" 
              y="87" 
              textAnchor="end" 
              className={`text-[7px] font-bold uppercase transition-colors ${selectedPort === 'alpha' ? 'fill-blue-500' : (isServiceRequired ? 'fill-rose-500' : 'fill-slate-400 group-hover/alpha:fill-slate-500')}`}
            >
              {isServiceRequired ? 'SUB-OPTIMAL ENVIRONMENT EXPOSURE DEGRADATION' : 'SECURE CLOSURE / COUPLING VALVE'}
            </text>
            {selectedPort === 'alpha' && (
              <rect x="180" y="70" width="145" height="23" fill="none" stroke="#2563eb" strokeWidth="0.75" strokeDasharray="2,2" className="opacity-60" />
            )}
          </g>

          {/* Port 02: Inspection Hatch Beta */}
          <g 
            className="cursor-pointer group/beta hover:opacity-95" 
            onClick={() => setSelectedPort(selectedPort === 'beta' ? null : 'beta')}
            onMouseEnter={() => setHoveredPort('beta')}
            onMouseMove={(e) => handleMouseMoveTooltip(e, 'port-beta')}
            onMouseLeave={() => { setHoveredPort(null); setActiveTooltip(null); }}
            id="mport-beta-group"
          >
            <rect 
              x="598" 
              y="126" 
              width="24" 
              height="6" 
              fill={selectedPort === 'beta' ? '#3b82f6' : (isServiceRequired ? 'url(#sweep-warning-grad)' : '#eff6ff')} 
              stroke={selectedPort === 'beta' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#1e40af')} 
              strokeWidth={selectedPort === 'beta' ? 2.5 : (isServiceRequired ? 2 : 1.5)} 
              filter={isServiceRequired ? 'url(#warning-glow)' : undefined}
              rx="1" 
              id="mport-beta-fitting" 
              onMouseEnter={() => setHoveredPort('beta')}
              onMouseLeave={() => setHoveredPort(null)}
            >
              {isServiceRequired && (
                <>
                  {selectedPort === 'beta' && (
                    <animate 
                      attributeName="fill" 
                      values="#3b82f6;#60a5fa;#3b82f6" 
                      dur="1.5s" 
                      repeatCount="indefinite" 
                    />
                  )}
                  <animate 
                    attributeName="stroke" 
                    values={selectedPort === 'beta' ? '#1d4ed8;#60a5fa;#1d4ed8' : '#dc2626;#ef4444;#dc2626'} 
                    dur="1.5s" 
                    repeatCount="indefinite" 
                  />
                  <animate 
                    attributeName="stroke-width" 
                    values={selectedPort === 'beta' ? '2.5;3.5;2.5' : '2;3.5;2'} 
                    dur="1.5s" 
                    repeatCount="indefinite" 
                  />
                </>
              )}
            </rect>
            {isServiceRequired && (
              <g id="beta-service-indicators">
                {/* Dynamic visual indicator (pulsing red halo) directly onto the port fitting */}
                <circle cx="610" cy="129" r="8.5" fill="none" stroke="#ef4444" strokeWidth="1.5" className="opacity-95">
                  <animate attributeName="r" values="4;13;4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0.1;0.95" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Central active warning bullet */}
                <circle cx="610" cy="129" r="3" fill="#dc2626" />
              </g>
            )}
            <line x1="610" y1="126" x2="610" y2="80" stroke={selectedPort === 'beta' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#2563eb')} strokeWidth={selectedPort === 'beta' ? 1.5 : 1} strokeDasharray="2,2" />
            <line x1="610" y1="80" x2="630" y2="80" stroke={selectedPort === 'beta' ? '#1d4ed8' : (isServiceRequired ? '#dc2626' : '#2563eb')} strokeWidth={selectedPort === 'beta' ? 1.5 : 1} strokeDasharray="2,2" />
            <text 
              x="635" 
              y="77" 
              textAnchor="start" 
              className={`text-[8px] font-bold tracking-wider transition-colors ${selectedPort === 'beta' ? 'fill-blue-600 font-black' : (isServiceRequired ? 'fill-rose-700 font-extrabold animate-pulse' : 'fill-blue-900 group-hover/beta:fill-blue-600')}`}
            >
              {isServiceRequired ? '⚠️ SERVICE REQUIRED — HATCH BETA' : '● INSPECTION HATCH BETA'}
            </text>
            <text 
              x="635" 
              y="87" 
              textAnchor="start" 
              className={`text-[7px] font-bold uppercase transition-colors ${selectedPort === 'beta' ? 'fill-blue-500' : (isServiceRequired ? 'fill-rose-500' : 'fill-slate-400 group-hover/beta:fill-slate-500')}`}
            >
              {isServiceRequired ? 'SYSTEM HABITABILTY STRESS CONDUIT EXHAUST' : 'LASER ALIGNMENT & OPTICAL PORT'}
            </text>
            {selectedPort === 'beta' && (
              <rect x="595" y="70" width="145" height="23" fill="none" stroke="#2563eb" strokeWidth="0.75" strokeDasharray="2,2" className="opacity-60" />
            )}
          </g>
          
          {/* Pressure core linear fill gradient inside the tube */}
          <rect x="200" y="148" width="520" height="79" fill="url(#pressure-grad)" />

          {/* TRANSIT TUBE TEXT LABEL */}
          <g transform="translate(460, 93)" textAnchor="middle">
            <text className="text-[12px] font-bold fill-slate-800 tracking-widest uppercase ericon-schematic-ambient-text">
              Polyamide-6 Transit Tube Core
            </text>
            <text y="14" className="text-[9px] fill-slate-500 tracking-normal ericon-schematic-ambient-text">
              Internal Clearance Ø {specs.diameter}mm • Smooth Coated Core (Roughness ε = {specs.roughness} mm)
            </text>
            {/* Fine design line pointing from text to the tube */}
            <path d="M 460,111 L 460,132" fill="none" stroke="#64748b" strokeWidth="0.75" markerEnd="url(#fine-arrow)" />
          </g>

          {/* ================= LAMINAR AIRFLOW VECTOR V1 ANIMATIONS ================= */}
          <g id="laminar-airflow-arrows">
            {/* Parallel lines showing "Laminar Flow Vectors" inside the core */}
            {[...Array(arrowRows)].map((_, rIdx) => {
              const yPos = 163 + rIdx * 17; // offset lines downward inside the tube
              
              const baseOffset = specs.p1 > specs.p2 ? (capsule.time * 1.5 * calc.velocity) % 24 : 0;
              
              return (
                <g key={`flow-line-${rIdx}`}>
                  {/* Subtle vector line */}
                  <line 
                    x1="200" 
                    y1={yPos} 
                    x2="720" 
                    y2={yPos} 
                    stroke={flowColor} 
                    strokeWidth={1.5} 
                    strokeOpacity={0.15} 
                    strokeDasharray="1, 4" 
                  />
                  
                  {/* Flow vectors flowing through */}
                  {[...Array(arrowsPerRow)].map((_, aIdx) => {
                    // Standard horizontal placement
                    const stepSize = 520 / arrowsPerRow;
                    let xPos = 200 + aIdx * stepSize + baseOffset;
                    
                    // Wrap around inside the tube bounds [200, 720]
                    if (xPos > 720) {
                      xPos = 200 + (xPos - 720);
                    }
                    
                    // Add wavy distortion if Turbulent for extra realism!
                    let finalY = yPos;
                    if (calc.flowRegume === 'Turbulent') {
                      // Sine wave distortion
                      finalY += Math.sin((xPos / 12) + (capsule.time * 20)) * 3;
                    } else if (calc.flowRegume === 'Transition') {
                      finalY += Math.sin((xPos / 24) + (capsule.time * 10)) * 1.5;
                    }

                    return (
                      <g key={`arr-${rIdx}-${aIdx}`} transform={`translate(${xPos}, ${finalY})`}>
                        {/* Custom arrow indicator */}
                        <line 
                          x1="-10" 
                          y1="0" 
                          x2="0" 
                          y2="0" 
                          stroke={flowColor} 
                          strokeWidth={2}
                          strokeOpacity={0.8}
                          markerEnd="url(#arrow)" 
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* LAMINAR VECTOR TEXT LABELS */}
          <g transform="translate(460, 203)" textAnchor="middle" className="pointer-events-none">
            <rect x="-110" y="-12" width="220" height="20" fill="#ffffff" fillOpacity="0.85" rx="3" stroke="#e2e8f0" strokeWidth="0.5" />
            <text y="1" className="text-[10px] font-bold fill-blue-700 tracking-wider font-mono">
              LAMINAR AIRFLOW VECTOR V1 = {calc.velocity.toFixed(2)} m/s
            </text>
          </g>

          </g>

          {/* ================= RIGHT CHAMBER: TERMINAL EMA HUB (L.P. P2) ================= */}
          <g 
            className="cursor-help transition-all group/terminal hover:opacity-95" 
            onMouseMove={(e) => handleMouseMoveTooltip(e, 'terminal')} 
            onMouseLeave={() => setActiveTooltip(null)}
          >
          {/* Outer Housing Box */}
          <rect x="720" y="100" width="170" height="180" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" rx="4" id="termination-hub-box" />
          <rect x="720" y="100" width="170" height="28" fill="#eff6ff" stroke="#1e3a8a" strokeWidth="0" />
          <line x1="720" y1="128" x2="890" y2="128" stroke="#1e3a8a" strokeWidth="2" />
          
          {/* Terminal Maintenance/Inspection Gate */}
          <rect x="825" y="94" width="30" height="6" fill="#eff6ff" stroke="#1e3a8a" strokeWidth="1.5" rx="1" id="mport-terminal-hatch" />
          <line x1="840" y1="94" x2="840" y2="65" stroke="#2563eb" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="840" y1="65" x2="825" y2="65" stroke="#2563eb" strokeWidth="1" strokeDasharray="2,2" />
          <text x="820" y="62" textAnchor="end" className="text-[8px] font-bold fill-blue-900 tracking-wider ericon-schematic-ambient-text">
            ● TERMINAL INSPECTION HATCH
          </text>
          <text x="820" y="72" textAnchor="end" className="text-[7px] fill-slate-400 font-bold uppercase ericon-schematic-ambient-text">
            BYPASS ACTUATOR VALVES ACCESS
          </text>
          
          {/* Name Label */}
          <text x="805" y="118" textAnchor="middle" className="text-[12px] font-bold fill-blue-900 tracking-wider">
            TERMINAL EMA HUB
          </text>
          
          {/* Pressure Sensor Tap P2 Indicator */}
          <circle cx="805" cy="180" r="28" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,2" />
          <circle cx="805" cy="180" r="6" fill="#2563eb" />
          <text x="805" y="150" textAnchor="middle" className="text-[9px] fill-slate-500">P2 PRESSURE VACUUM</text>
          <text x="805" y="222" textAnchor="middle" className="text-[15px] font-bold fill-blue-700 font-mono">
            {specs.p2.toFixed(1)} kPa
          </text>
          <text x="805" y="235" textAnchor="middle" className="text-[8px] fill-slate-400">LOW VACUUM SUCTION ENGINE</text>

          {/* Fan/Exhaust rotor graphic visualization */}
          <g transform="translate(805, 180)" className="opacity-40">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, bladeIdx) => {
              // Spin faster when velocity is high
              const bladeRotation = angle + (capsule.time * calc.velocity * 5);
              return (
                <line 
                  key={`blade-${bladeIdx}`}
                  x1="0" 
                  y1="0" 
                  x2="22" 
                  y2="0" 
                  stroke="#1e3a8a" 
                  strokeWidth="3.5" 
                  transform={`rotate(${bladeRotation})`}
                />
              );
            })}
          </g>

          <g stroke="#94a3b8" strokeWidth="1.5">
            <line x1="890" y1="145" x2="905" y2="145" />
            <line x1="890" y1="165" x2="905" y2="165" />
            <line x1="890" y1="185" x2="905" y2="185" />
            <line x1="890" y1="205" x2="905" y2="205" />
            <line x1="890" y1="225" x2="905" y2="225" />
          </g>
          
          {/* Exhaust output labels */}
          <text x="908" y="132" transform="rotate(90 908 132)" className="text-[8px] fill-slate-400 tracking-widest uppercase ericon-schematic-ambient-text">
            Discharge Exhaust Air
          </text>
          </g>


          {/* ================= PNEUMATIC CAPSULE TRANSPORT CARRIER ================= */}
          {(capsule.position > 0 || capsule.isActive || capsule.isCompleted) && (
            <g transform={`translate(${capsuleX}, 187)`} id="capsule-payload-carrier">
              {/* Leader coordinate tracker above the moving capsule */}
              <line x1="0" y1="-38" x2="0" y2="-12" stroke="#64748b" strokeWidth="0.75" strokeDasharray="2,2" />
              
              <rect x="-35" y="-53" width="70" height="15" fill="#f8fafc" stroke="#64748b" strokeWidth="0.75" rx="2" />
              <text x="0" y="-43" textAnchor="middle" className="text-[8px] fill-blue-900 font-bold whitespace-nowrap">
                x={(capsule.position).toFixed(2)}m • {(capsule.velocity).toFixed(1)}m/s
              </text>

              {/* Cylindrical capsule housing fitted inside inner diameters */}
              {/* Outer seal rings (plunger ends) */}
              <rect x="-24" y="-30" width="8" height="60" fill="#1e293b" rx="1.5" />
              <rect x="16" y="-30" width="8" height="60" fill="#1e293b" rx="1.5" />
              
              {/* Main alloy canister body */}
              <rect x="-18" y="-27" width="36" height="54" fill="#64748b" stroke="#e2e8f0" strokeWidth="0.5" />
              
              {/* Center transparent observation viewport */}
              <rect x="-10" y="-20" width="20" height="40" fill="#38bdf8" fillOpacity="0.3" stroke="#0284c7" strokeWidth="0.75" />
              
              {/* Interior Rodent passenger silhouette */}
              <g id="rodent-passenger" className="pointer-events-none">
                {rodentSpecies === 'brown_rat' ? (
                  <g>
                    {/* Rat Tail */}
                    <path d="M -8,4 Q -13,10 -15,7" fill="none" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />
                    {/* Rat Body */}
                    <ellipse cx="-1" cy="2" rx="7" ry="4.5" fill="#8e8e93" />
                    {/* Rat Head */}
                    <path d="M 6,0 C 8,1 8,3 6,4 Z" fill="#636366" />
                    {/* Pink/Grey Ears */}
                    <circle cx="2" cy="-2.5" r="2.2" fill="#fda4af" stroke="#636366" strokeWidth="0.5" />
                    {/* Eye */}
                    <circle cx="5.5" cy="1" r="0.5" fill="#000000" />
                  </g>
                ) : rodentSpecies === 'roof_rat' ? (
                  <g>
                    {/* Roof Rat - Long Tail, agile, darker */}
                    <path d="M -8,4 Q -16,13 -18,6" fill="none" stroke="#fda4af" strokeWidth="0.9" strokeLinecap="round" />
                    {/* Body */}
                    <ellipse cx="-1" cy="2" rx="6.2" ry="4" fill="#4b5563" />
                    {/* Head - pointier */}
                    <path d="M 5.2,-0.5 C 7.5,0.8 7.5,2.8 5.2,3.5 Z" fill="#374151" />
                    {/* Large prominent ears */}
                    <circle cx="1.5" cy="-3.5" r="2.8" fill="#fecdd3" stroke="#374151" strokeWidth="0.55" />
                    {/* Eye */}
                    <circle cx="5" cy="1" r="0.55" fill="#000000" />
                  </g>
                ) : rodentSpecies === 'arvicanthis_spp' ? (
                  <g>
                    {/* African Grass Rat - Grizzled stout rat, heavy construct */}
                    <path d="M -7,4 Q -10,7 -12,5" fill="none" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" />
                    {/* Stout grizzled body */}
                    <ellipse cx="-0.5" cy="2.2" rx="6.5" ry="4.8" fill="#78350f" />
                    {/* Speckled markings */}
                    <path d="M -4,0 Q 0,2 3,0 m -5,4 Q 0,5 3,3" stroke="#b45309" strokeWidth="0.8" fill="none" strokeDasharray="1,1" />
                    {/* Head - blunt */}
                    <path d="M 5,0.5 L 6,1.8 L 4.8,3.2 Z" fill="#451a03" />
                    {/* Smaller ears */}
                    <circle cx="1.2" cy="-1.8" r="1.8" fill="#fda4af" stroke="#451a03" strokeWidth="0.5" />
                    {/* Eye */}
                    <circle cx="4.5" cy="1.2" r="0.6" fill="#000000" />
                  </g>
                ) : rodentSpecies === 'mastomys_natalensis' ? (
                  <g>
                    {/* Multimammate Mouse - warm brown-grey, medium mouse */}
                    <path d="M -7.5,4 Q -12,8 -13,4" fill="none" stroke="#fda4af" strokeWidth="0.8" strokeLinecap="round" />
                    {/* Body */}
                    <ellipse cx="-1" cy="2" rx="5.4" ry="3.5" fill="#a16207" />
                    {/* Belly (white/grey) */}
                    <ellipse cx="-1" cy="4" rx="4.2" ry="1.2" fill="#f3f4f6" />
                    {/* Head */}
                    <path d="M 4,0.5 C 5.5,1.2 5.5,2.5 4,3.2 Z" fill="#78350f" />
                    {/* Ears */}
                    <circle cx="1.2" cy="-2.3" r="2.1" fill="#fda4af" stroke="#78350f" strokeWidth="0.5" />
                    {/* Eye */}
                    <circle cx="3.8" cy="1.2" r="0.5" fill="#000000" />
                  </g>
                ) : rodentSpecies === 'house_mouse' ? (
                  <g>
                    {/* Mouse Tail */}
                    <path d="M -7,4 Q -11,7 -12,3" fill="none" stroke="#fda4af" strokeWidth="0.8" strokeLinecap="round" />
                    {/* Mouse Body */}
                    <ellipse cx="-1" cy="2" rx="4.8" ry="3" fill="#64748b" />
                    {/* Mouse Head */}
                    <path d="M 3,1 C 4,1.5 4,2.5 3,3 Z" fill="#475569" />
                    {/* Pink Ears */}
                    <circle cx="1" cy="-2" r="1.8" fill="#fda4af" stroke="#475569" strokeWidth="0.5" />
                  </g>
                ) : (
                  <g>
                    {/* Field Mouse Tail */}
                    <path d="M -7,4 Q -11,6 -10,1" fill="none" stroke="#f43f5e" strokeWidth="0.7" strokeLinecap="round" />
                    {/* Field Mouse Body */}
                    <ellipse cx="-1" cy="2" rx="4.5" ry="2.8" fill="#d97706" />
                    {/* Field Mouse Head */}
                    <path d="M 3,0.5 L 4.5,2 L 3,3 Z" fill="#92400e" />
                    {/* Pink Ears */}
                    <circle cx="1" cy="-2" r="1.8" fill="#fda4af" stroke="#92400e" strokeWidth="0.5" />
                  </g>
                )}
              </g>
              
              {/* Front travel nose cone (curved cap entering the low pressure side) */}
              <path d="M 23, -26 C 35, -20 35, 20 23, 26" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />

              {/* Dynamic Vector Arrows: Pushing and Dragging Force visualizations */}
              {capsule.isActive && (
                <g>
                  {/* P1 Drive Force Vector Line (pointing right, green) */}
                  <line 
                    x1="-55" 
                    y1="0" 
                    x2="-28" 
                    y2="0" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    markerEnd="url(#force-p1)" 
                  />
                  <text x="-58" y="-5" className="text-[7px] font-semibold fill-emerald-600 font-mono" textAnchor="middle">
                    F_Press
                  </text>

                  {/* Drag/Friction drag vectors (pointing left, red) */}
                  <line 
                    x1="28" 
                    y1="0" 
                    x2="45" 
                    y2="0" 
                    stroke="#ef4444" 
                    strokeWidth="2.5" 
                    markerEnd="url(#force-drag)" 
                    transform="scale(-1, 1)"
                  />
                  <text x="58" y="-5" className="text-[7px] font-semibold fill-rose-600 font-mono" textAnchor="middle">
                    F_Resist
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ================= SCHEMATIC LABELS / CALLOUT ANNOTATIONS ================= */}
          {/* Pressure Drop Labeling Leader Line */}
          <line x1="200" y1="265" x2="300" y2="265" stroke="#94a3b8" strokeWidth="1" />
          <line x1="620" y1="265" x2="720" y2="265" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 300, 265 L 430, 265 M 490, 265 L 620, 265" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
          <text x="460" y="268" textAnchor="middle" className="text-[9px] fill-slate-500 font-normal ericon-schematic-ambient-text">
            Pressure Gradient Direction: ΔP = {(specs.p1 - specs.p2).toFixed(1)} kPa Drop
          </text>

          {/* ================= FLOATING HOVER TOOLTIP FOR MAINTENANCE PORTS ================= */}
          {hoveredPort && (
            <g 
              transform={`translate(${hoveredPort === 'alpha' ? 322 : 610}, 120)`} 
              className="pointer-events-none select-none z-50 font-mono transition-transform duration-200" 
              id="schematic-port-tooltip"
            >
              <rect 
                x="-85" 
                y="-65" 
                width="170" 
                height="54" 
                rx="4" 
                fill="#0f172a" 
                stroke={isServiceRequired ? '#f87171' : '#3b82f6'} 
                strokeWidth="1.25" 
                fillOpacity="0.95"
              />
              <polygon points="-6,-11 L 0,-3 L 6,-11" fill="#0f172a" stroke={isServiceRequired ? '#f87171' : '#3b82f6'} strokeWidth="1.25" />
              <rect x="-5.5" y="-12" width="11" height="3" fill="#0f172a" /> {/* Blend line segment */}
              
              {/* Tooltip Content */}
              <text 
                x="0" 
                y="-48" 
                textAnchor="middle" 
                className="text-[8px] font-black fill-slate-200 uppercase tracking-widest"
              >
                {hoveredPort === 'alpha' ? 'PORT ALPHA STATUS' : 'HATCH BETA STATUS'}
              </text>

              <text 
                x="0" 
                y="-34" 
                textAnchor="middle" 
                className="text-[9px] font-extrabold tracking-wider" 
                fill={isServiceRequired ? '#fca5a5' : '#34d399'}
              >
                ● {isServiceRequired ? 'SERVICE REQUIRED' : 'NOMINAL'}
              </text>

              <text 
                x="0" 
                y="-21" 
                textAnchor="middle" 
                className="text-[7.5px] font-bold fill-slate-400"
              >
                INSPECTED: {serviceHistory[hoveredPort].lastInspection}
              </text>

              <text 
                x="0" 
                y="-13" 
                textAnchor="middle" 
                className="text-[5.5px] fill-slate-500 font-semibold tracking-wider uppercase"
              >
                COGNITIVE CLADDING SECURED
              </text>
            </g>
          )}
          </g>
        </svg>

      {/* Dynamic Pop-out Picture-In-Picture (PIP) Focused Interface with glass fog backdrop */}
      {isPipActive && false && (
        <div className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 select-none animate-fade-in" id="pip-modal-overlay">
          {/* Glass Card Container */}
          <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden max-h-[90vh]" id="pip-modal-sheet">
            
            {/* Left Column: Focused blueprint */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 relative overflow-hidden min-h-[350px]">
              {/* Radial dot grid background */}
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.75px, transparent 0.75px)', backgroundSize: '16px 16px' }} />
              
              {/* Top status bar inside PIP */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="text-[9px] bg-blue-600 text-white font-mono font-black tracking-widest px-2.5 py-0.5 rounded border border-blue-500 uppercase flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  PIP Focus Active
                </span>
                <span className="text-[9.5px] text-slate-400 font-mono font-medium uppercase tracking-wider">Interactive Vector Network Diagnostic</span>
              </div>

              {/* Mobile Close Button (top-right of SVG pane) */}
              <button
                type="button"
                onClick={() => setIsPipActive(false)}
                className="absolute top-4 right-4 z-20 p-1.5 bg-slate-200 rounded-full text-slate-700 dark:text-slate-300 dark:hover:text-white transition cursor-pointer lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Viewport shortcuts bottom-left inside PIP */}
              <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => { setZoom(130); setPanX(-100); setPanY(-40); }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-250 text-[9px] font-bold rounded hover:bg-slate-100 transition cursor-pointer"
                >
                  Focus Core (130%)
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(100); setPanX(0); setPanY(0); }}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-250 text-[9px] font-bold rounded hover:bg-slate-100 transition cursor-pointer"
                >
                  Fit schematic
                </button>
              </div>

              {/* The big SVG layout inside PIP */}
              <div className="flex-1 flex items-center justify-center p-2.5 mt-6 relative overflow-hidden">
                {null}
              </div>

              <div className="text-right text-[8px] text-slate-400 font-mono mt-2 uppercase tracking-wide">
                SCROLL WHEEL TO ZOOM • PINCH GESTURE ON GRID SURFACE
              </div>
            </div>

            {/* Right Column: Information sidebar */}
            <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 text-left relative flex justify-between items-center">
                <div>
                  <span className="text-[8.5px] uppercase font-mono font-black tracking-widest text-[#15462D] dark:text-emerald-400 block mb-0.5">
                    SYSTEM DIAGNOSTICS
                  </span>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Airflow Parameters
                  </h3>
                </div>
                {/* Desktop Close action button */}
                <button
                  type="button"
                  onClick={() => setIsPipActive(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-802 transition cursor-pointer hidden lg:block"
                >
                  <X className="w-5 h-5 pointer-events-auto" />
                </button>
              </div>

              {/* Diagnostic Parameters List */}
              <div className="p-5 flex-1 space-y-4 text-left font-mono">
                {/* Specs Section */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Physical Tunnel Setup</span>
                  <div className="bg-slate-50 dark:bg-slate-955 p-2.5 rounded border dark:border-slate-850 space-y-1 text-[9.5px]">
                    <div className="flex justify-between text-slate-500">
                      <span>INLET PRESSURE (P1)</span>
                      <strong className="text-slate-800 dark:text-slate-200">{specs.p1.toFixed(1)} kPa</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SUCTION PRESSURE (P2)</span>
                      <strong className="text-slate-800 dark:text-slate-200">{specs.p2.toFixed(1)} kPa</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>TUBE SPECIFICATION</span>
                      <strong className="text-slate-800 dark:text-slate-202">Ø {specs.diameter}mm x {specs.length}m</strong>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>ROUGHNESS VALUE (ε)</span>
                      <strong className="text-slate-800 dark:text-slate-202">{specs.roughness} mm</strong>
                    </div>
                  </div>
                </div>

                {/* Aerodynamics Section */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aerodynamics &amp; Math</span>
                  <div className="bg-slate-50 dark:bg-slate-955 p-2.5 rounded border dark:border-slate-850 space-y-1 text-[9.5px]">
                    <div className="flex justify-between text-slate-500">
                      <span>VELOCITY PROFILE (V1)</span>
                      <strong className="text-blue-700 dark:text-blue-400">{(calc.velocity || 0).toFixed(2)} m/s</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>FLOW REGIME RATIO</span>
                      <span className={`font-black uppercase text-[8.5px] px-1 rounded-xs ${
                        calc.flowRegume === 'Laminar' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 text-[8px]' :
                        calc.flowRegume === 'Transition' ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/40 text-[8px]' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/40 animate-pulse text-[8px]'
                      }`}>
                        {calc.flowRegume}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>REYNOLDS NUMBER (RE)</span>
                      <strong className="text-slate-800 dark:text-slate-202">{Math.round(calc.reynoldsNumber)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>FRICTION COEFFICIENT (F)</span>
                      <strong className="text-slate-800 dark:text-slate-202">{calc.frictionFactor.toFixed(5)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>PNEUMATIC INTENSITY</span>
                      <strong className="text-slate-800 dark:text-slate-202">{calc.pneumaticPower.toFixed(2)} W</strong>
                    </div>
                  </div>
                </div>

                {/* Biological Telemetry Section */}
                <div className="space-y-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Biological Exposure Logs</span>
                  <div className="bg-slate-50 dark:bg-slate-955 p-2.5 rounded border dark:border-slate-850 space-y-1 text-[9.5px]">
                    <div className="flex justify-between text-slate-505">
                      <span>SURVIVAL SCORE INDEX</span>
                      <strong className={`font-extrabold ${survivalScore >= 50 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 animate-pulse'}`}>{survivalScore}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>TARGET SPECIMEN</span>
                      <strong className="text-slate-800 dark:text-slate-202 uppercase truncate text-[8.5px] max-w-[130px]">{rodentSpecies.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-505">
                      <span>ACCUMULATED STRESS</span>
                      <strong className="text-slate-800 dark:text-slate-202">{formatHours(lowSurvivalTimeMs)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-200 dark:border-slate-850 text-center text-[9px] font-semibold text-slate-400 uppercase font-mono">
                🛡 ERICON PiP Focal Telemetry
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Diagnostic side card overlay when PIP Focus mode is triggered as part of the smart picture view request */}
        {isPipActive && !isFloatingPip && expandedPipTab === 'metrics' && (
          <div className="w-full lg:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 max-h-[70vh] lg:max-h-none overflow-y-auto text-left font-mono z-[110] ml-0 lg:ml-6 mt-4 lg:mt-0 animate-scale-up md:absolute md:top-4 md:right-4 md:max-w-xs" id="pip-sidebar">
            {/* Header */}
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[8px] uppercase font-bold tracking-widest text-[#15462D] dark:text-[#15462D] block ericon-pip-tag">PIP TELEMETRY</span>
                <span className="text-xs font-black text-slate-850 dark:text-[#15462D] uppercase tracking-wider ericon-pip-title">CORE ENVELOPE</span>
              </div>
              <button
                type="button"
                onClick={() => setExpandedPipTab('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-655 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Params block */}
            <div className="space-y-4 text-[9.5px]">
              <div className="space-y-1 bg-[#f4fbf7] dark:bg-[#f4fbf7] p-2.5 rounded border border-[#15462D]/35">
                <span className="text-[8px] text-[#15462D] font-extrabold uppercase font-bold ericon-pip-section-header">Physics</span>
                <div className="flex justify-between mt-1"><span className="text-[#15462D]/80 ericon-pip-key">V1 VELOCITY</span><strong className="text-[#15462D] font-bold ericon-pip-val">{(calc.velocity || 0).toFixed(2)} m/s</strong></div>
                <div className="flex justify-between"><span className="text-[#15462D]/80 ericon-pip-key">REYNOLDS RE</span><strong className="text-[#15462D] font-bold ericon-pip-val">{Math.round(calc.reynoldsNumber)}</strong></div>
                <div className="flex justify-between"><span className="text-[#15462D]/80 ericon-pip-key">FRICTION F</span><strong className="text-[#15462D] font-bold ericon-pip-val">{calc.frictionFactor.toFixed(5)}</strong></div>
                <div className="flex justify-between"><span className="text-[#15462D]/80 ericon-pip-key">DIFFERENTIAL P</span><strong className="text-[#15462D] font-bold ericon-pip-val">{(specs.p1 - specs.p2).toFixed(1)} kPa</strong></div>
              </div>

              <div className="space-y-1 bg-[#f4fbf7] dark:bg-[#f4fbf7] p-2.5 rounded border border-[#15462D]/35">
                <span className="text-[8px] text-[#15462D] font-extrabold uppercase font-bold ericon-pip-section-header">Bio Exposure</span>
                <div className="flex justify-between mt-1"><span className="text-[9.5px] text-[#15462D]/80 font-semibold ericon-pip-key">SI SCORE</span><strong className="text-[#15462D] font-extrabold ericon-pip-val">{survivalScore}%</strong></div>
                <div className="flex justify-between"><span className="text-[9.5px]/[normal] text-[#15462D]/80 font-semibold ericon-pip-key">SPECIMEN</span><strong className="text-[#15462D] font-bold ericon-pip-val truncate max-w-[100px]">{rodentSpecies.replace('_', ' ')}</strong></div>
                <div className="flex justify-between"><span className="text-[9.5px]/[normal] text-[#15462D]/80 font-semibold ericon-pip-key">STRESS CLOCK</span><strong className="text-[#15462D] font-bold ericon-pip-stress-clock">{formatHours(lowSurvivalTimeMs)}</strong></div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedPipTab('none')}
                className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-705 text-white font-bold rounded shadow transition text-center cursor-pointer uppercase text-[9px]"
              >
                Close Metrics Info
              </button>
            </div>
          </div>
        )}

        {/* Floating PiP Collapsible Tabs Deck */}
        {isPipActive && (
          <div className={
            isFloatingPip
              ? "absolute bottom-2 left-2 right-2 z-[115] flex gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shadow-xl"
              : "absolute bottom-6 left-1/2 -translate-x-1/2 z-[115] flex gap-2 bg-slate-900/90 backdrop-blur p-2 rounded-lg border border-slate-800 shadow-xl"
          } id="pip-tabs-dock">
            <button
              onClick={() => setExpandedPipTab(prev => prev === 'metrics' ? 'none' : 'metrics')}
              className={`flex-1 px-2.5 py-1.5 transition text-[9px] font-mono leading-tight font-black uppercase rounded border cursor-pointer ${
                expandedPipTab === 'metrics' 
                  ? 'bg-emerald-800 text-white border-emerald-600 animate-pulse font-bold' 
                  : 'bg-slate-805 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              type="button"
            >
              {expandedPipTab === 'metrics' ? '▼ Metrics' : '[ Metrics ]'}
            </button>
            
            <button
              onClick={() => setExpandedPipTab(prev => prev === 'logs' ? 'none' : 'logs')}
              className={`flex-1 px-2.5 py-1.5 transition text-[9px] font-mono leading-tight font-black uppercase rounded border cursor-pointer ${
                expandedPipTab === 'logs' 
                  ? 'bg-blue-800 text-white border-blue-600 font-bold' 
                  : 'bg-slate-805 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              type="button"
            >
              {expandedPipTab === 'logs' ? '▼ Logs' : '[ Logs ]'}
            </button>
            
            <button
              onClick={() => setExpandedPipTab(prev => prev === 'diagnostics' ? 'none' : 'diagnostics')}
              className={`flex-1 px-2.5 py-1.5 transition text-[9px] font-mono leading-tight font-black uppercase rounded border cursor-pointer ${
                expandedPipTab === 'diagnostics' 
                  ? 'bg-amber-800 text-white border-amber-600 font-bold' 
                  : 'bg-slate-805 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              type="button"
            >
              {expandedPipTab === 'diagnostics' ? '▼ Diagnostics' : '[ Diags ]'}
            </button>
          </div>
        )}

        {/* Collapsible expanded panels content for Floating mode metrics */}
        {isFloatingPip && expandedPipTab === 'metrics' && (
          <div className="absolute top-12 left-2 right-2 z-[115] bg-slate-950/95 border border-slate-850 rounded-lg p-3 shadow-xl space-y-1.5 text-left text-xs text-slate-200 font-mono animate-scale-up">
            <div className="flex justify-between border-b border-slate-850 pb-1 mb-1 font-bold text-[8.5px]">
              <span className="text-slate-400 uppercase">Physics Telemetry</span>
              <span className="text-emerald-400 animate-pulse">● LIVE</span>
            </div>
            <div className="flex justify-between"><span className="text-slate-500">V1 Velocity:</span><strong className="text-emerald-400">{(calc.velocity || 0).toFixed(2)} m/s</strong></div>
            <div className="flex justify-between"><span className="text-slate-505">Reynolds Re:</span><strong className="text-slate-300">{Math.round(calc.reynoldsNumber)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-505">Friction Factor f:</span><strong className="text-slate-300">{calc.frictionFactor.toFixed(5)}</strong></div>
            <div className="flex justify-between"><span className="text-slate-505">Diff Pressure:</span><strong className="text-slate-300">{(specs.p1 - specs.p2).toFixed(1)} kPa</strong></div>
            <div className="flex justify-between border-t border-slate-855 pt-1 mt-1 font-bold"><span className="text-slate-500">SI Score:</span><strong className="text-emerald-400">{survivalScore}%</strong></div>
            <div className="flex justify-between"><span className="text-slate-505">Specimen:</span><strong className="text-slate-300 uppercase truncate text-[10px] max-w-[120px]">{rodentSpecies.replace('_', ' ')}</strong></div>
          </div>
        )}

        {/* Collapsible expanded logs content */}
        {isPipActive && expandedPipTab === 'logs' && (
          <div className={
            isFloatingPip
              ? "absolute top-12 left-2 right-2 z-[115] bg-slate-950/95 border border-slate-850 rounded-lg p-3 shadow-xl space-y-1 font-mono text-left animate-scale-up max-h-[120px] overflow-y-auto"
              : "absolute bottom-20 left-1/2 -translate-x-1/2 z-[115] bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl space-y-1 w-80 font-mono text-left text-xs animate-scale-up max-h-[180px] overflow-y-auto text-slate-200"
          } id="pip-logs-panel">
            <div className="border-b border-slate-800 pb-1 mb-1 flex justify-between uppercase font-black text-[8px] text-slate-400 font-bold">
              <span>Event Details</span>
              <span>Change Records</span>
            </div>
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.slice(0, 10).map((log, i) => (
                <div key={log.id || i} className="flex justify-between items-start py-0.5 border-b border-slate-800/40 last:border-b-0 text-[10px]">
                  <span className="text-slate-500 text-[8px] shrink-0 mr-1.5">{log.timestamp.includes(' ') ? log.timestamp.split(' ')[1] : log.timestamp}</span>
                  <span className="text-slate-300 truncate font-semibold flex-1">Mod: {log.field.replace('_', ' ').substring(0, 14)}</span>
                  <span className="text-emerald-450 font-bold shrink-0 font-bold">→ {log.newVal}</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-slate-500 uppercase text-[9px] font-bold">● Zero parameter logs logged yet.</div>
            )}
          </div>
        )}

        {/* Collapsible expanded diagnostics content */}
        {isFloatingPip && expandedPipTab === 'diagnostics' && (
          <div className="absolute top-12 left-2 right-2 z-[115] bg-slate-955/95 border border-slate-850 rounded-lg p-3 shadow-xl space-y-2 text-left text-xs text-slate-200 font-mono animate-scale-up">
            <div>
              <span className="text-slate-400 uppercase font-black text-[8px] block mb-1 font-bold border-b border-slate-850 pb-0.5">Flow Regimes Legend</span>
              <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-blue-500 inline-block" /> <span className="text-slate-355 font-semibold">Laminar</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-amber-500 inline-block" /> <span className="text-slate-355 font-semibold">Transition</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" /> <span className="text-slate-355 font-semibold">Turbulent</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> <span className="text-slate-355 font-semibold">Negative Zone</span></div>
              </div>
            </div>
            <div className="border-t border-slate-850 pt-1.5 mt-1">
              <span className="text-slate-400 uppercase font-black text-[8px] block font-bold">CAD Tips</span>
              <p className="text-slate-400 text-[8.5px] leading-normal leading-[1.2]">Drag to pan model path. Mouse scrollwheel triggers live zoom metrics.</p>
            </div>
          </div>
        )}

        {/* FLOATING LEGEND COVER */}
        {(!isPipActive || (isPipActive && expandedPipTab === 'diagnostics')) && !isFloatingPip && (
          <div id="ericon-floating-legend-cover" className="absolute bottom-4 left-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg rounded-sm p-3 font-mono text-[9px] w-52 flex flex-col gap-2">
            <div className="font-extrabold text-slate-850 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-1 text-[9.5px]">
              Flow Regime Legend
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-blue-500 shadow-xs border border-blue-600 shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-350">Blue</span>
              <span className="text-slate-450 dark:text-slate-500 font-normal">— Laminar Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-amber-500 shadow-xs border border-amber-600 shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-350">Orange</span>
              <span className="text-slate-450 dark:text-slate-500 font-normal">— Transitional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-rose-500 shadow-xs border border-rose-600 shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-350">Red</span>
              <span className="text-slate-450 dark:text-slate-500 font-normal">— Turbulent Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-xs bg-emerald-500 shadow-xs border border-emerald-600 shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-350">Green</span>
              <span className="text-slate-455 dark:text-slate-500 font-normal">— Negative Zone</span>
            </div>
          </div>
        )}

        {/* CAD INSTRUCTIONS DRAWER OVERLAY */}
        {(!isPipActive || (isPipActive && expandedPipTab === 'diagnostics')) && !isFloatingPip && (
          <div id="ericon-cad-viewport-guide" className="absolute bottom-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg rounded-sm p-2.5 font-mono text-[8.5px] text-slate-500 dark:text-slate-400 leading-normal max-w-[210px]">
            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">CAD VIEWPORT GUIDE:</span>
            <ul className="list-disc pl-3.5 mt-1 space-y-0.5">
              <li>Scroll <strong className="text-slate-700 dark:text-slate-350">Mouse Wheel</strong> to Zoom</li>
              <li>Press & <strong className="text-slate-700 dark:text-slate-350">Drag Mouse</strong> to Pan</li>
              <li><strong className="text-slate-700 dark:text-slate-350">Pinch gesture</strong> on touchscreens</li>
              <li><strong className="text-slate-700 dark:text-slate-350">Double-Click</strong> to Reset viewport</li>
            </ul>
          </div>
        )}

        {/* FULL CUSTOM FLOATING TARGET TOOLTIP */}
        {activeTooltip && (
          <div 
            style={{ left: `${activeTooltip.x}px`, top: `${activeTooltip.y}px` }}
            className="absolute z-50 bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl rounded-sm p-3.5 w-[290px] text-slate-200 font-mono text-[9px] pointer-events-none transition-all duration-75 flex flex-col gap-1.5"
          >
            <div className="font-black text-rose-400 uppercase border-b border-slate-800 pb-1 text-[9.5px] tracking-wide">
              {activeTooltip.title}
            </div>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[7.5px]">Airflow Direction:</span>
              <span className="text-blue-300 font-medium">{activeTooltip.flowDir}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[7.5px]">Pressure Changes:</span>
              <span className="text-amber-300 font-medium">{activeTooltip.pressureChange}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[7.5px]">Tunnel Segment Function:</span>
              <span className="text-slate-300 leading-normal leading-[1.2]">{activeTooltip.functionDesc}</span>
            </div>
          </div>
        )}
      </div>

      {/* MAINTENANCE DETAIL VIEW OVERLAY / EXPANDABLE PANEL */}
      {selectedPort && (
        <div className="bg-slate-900 border-t border-b border-slate-800 p-5 font-mono text-[10.5px] text-slate-300 animate-fadeIn" id="mport-details-panel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-md p-1.5 flex items-center justify-center shadow-xs">
                <Wrench className="w-5 h-5 text-blue-100" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block">
                  Interactive Maintenance Diagnostic Console
                </span>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  {selectedPort === 'alpha' ? 'Maintenance Port Alpha' : 'Inspection Hatch Beta'}
                  <span className={`text-[8.5px] px-1.5 py-0.5 rounded-xs border ${
                    isServiceRequired 
                      ? 'bg-rose-950 border-rose-500/40 text-rose-350 font-black animate-pulse' 
                      : 'bg-emerald-950 border-emerald-500/40 text-emerald-350'
                  }`}>
                    {isServiceRequired ? '● SERVICE REQUIRED' : '● SYSTEM NOMINAL'}
                  </span>
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPort(null)}
              className="px-2.5 py-1 bg-slate-800 border border-slate-700 hover:bg-slate-750 hover:text-white rounded-xs text-[10px] font-bold cursor-pointer transition uppercase"
            >
              ✕ Close Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Specs & Indicators */}
            <div className="col-span-1 md:col-span-4 bg-slate-1000/60 border border-slate-850 rounded-xs p-4 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="text-slate-400 font-bold border-b border-slate-850 pb-1 text-[9px] uppercase tracking-wider">
                  Access Node Metadata
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Structural Port:</span>
                  <span className="text-slate-200 capitalize font-bold">{selectedPort}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Physical Location:</span>
                  <span className="text-slate-200">{selectedPort === 'alpha' ? 'X: 322mm (Inlet side)' : 'X: 610mm (Outlet side)'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Operational Standard:</span>
                  <span className="text-slate-200">ISO-1102 Sealed</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-900">
                  <span className="text-slate-500">Last Inspection Date:</span>
                  <span className="text-teal-400 font-bold">{serviceHistory[selectedPort].lastInspection}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Coupling Aperture:</span>
                  <span className="text-slate-200">24mm Heavy Flange</span>
                </div>

                <div className="text-slate-400 font-bold border-t border-b border-slate-850 pt-2 pb-1 mt-2 text-[9px] uppercase tracking-wider">
                  Localized Pressure Telemetry
                </div>
                <div className="bg-slate-950/80 border border-slate-910 p-2.5 rounded-xs mt-1.5 flex flex-col gap-1.5 font-mono">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-slate-450 uppercase font-bold text-[8px] tracking-wider">5m Port Pressure</span>
                    <span className={`font-black tracking-wider ${lowSurvivalTimeMs >= 3 * 3600 * 1000 ? 'text-rose-450' : 'text-emerald-450'}`}>
                      {((selectedPort === 'alpha' ? pressuresAlpha : pressuresBeta)[(selectedPort === 'alpha' ? pressuresAlpha : pressuresBeta).length - 1] ?? (selectedPort === 'alpha' ? specs.p1 : specs.p2)).toFixed(2)} kPa
                    </span>
                  </div>
                  
                  {/* Embedded high-fidelity Sparkline SVG */}
                  <div className="h-[34px] w-full bg-slate-1000/95 border border-slate-920/40 rounded-xs flex items-center justify-center p-1 relative overflow-hidden">
                    {/* Visual grid reference lines internally */}
                    <div className="absolute inset-x-0 top-1/4 border-b border-slate-900/40 border-dashed w-full pointer-events-none" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-slate-900/40 border-dashed w-full pointer-events-none" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-slate-900/40 border-dashed w-full pointer-events-none" />
                    
                    {(() => {
                      const data = selectedPort === 'alpha' ? pressuresAlpha : pressuresBeta;
                      if (!data || data.length === 0) return null;
                      
                      const minVal = Math.min(...data) - 0.2;
                      const maxVal = Math.max(...data) + 0.2;
                      const valRange = maxVal - minVal || 1;
                      
                      const points = data.map((val, idx) => {
                        const x = (idx / (data.length - 1)) * 100;
                        const y = 30 - ((val - minVal) / valRange) * 26 - 2; // leave padding
                        return `${x},${y}`;
                      });
                      
                      const areaPath = `M 0,30 L ${points.join(' L ')} L 100,30 Z`;
                      const strokePath = `M ${points.join(' L ')}`;
                      
                      const idx = data.length - 1;
                      const lastX = 100;
                      const lastY = 30 - ((data[idx] - minVal) / valRange) * 26 - 2;
                      
                      const isTurbulent = lowSurvivalTimeMs >= 3 * 3600 * 1000;
                      
                      return (
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
                          <defs>
                            <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor={isTurbulent ? '#f43f5e' : '#10b981'} stopOpacity="0.4" />
                              <stop offset="100%" stopColor={isTurbulent ? '#f43f5e' : '#10b981'} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Area Fill */}
                          <path d={areaPath} fill="url(#sparkline-gradient)" />
                          
                          {/* Sparkling stroke line */}
                          <path
                            d={strokePath}
                            fill="none"
                            stroke={isTurbulent ? '#f43f5e' : '#10b981'}
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Interactive ending point pulse halo */}
                          <g>
                            <circle cx={lastX} cy={lastY} r="3" fill={isTurbulent ? '#f43f5e' : '#10b981'} className="animate-ping" fillOpacity="0.4" />
                            <circle cx={lastX} cy={lastY} r="1.5" fill={isTurbulent ? '#fda4af' : '#34d399'} />
                          </g>
                        </svg>
                      );
                    })()}
                  </div>
                  
                  <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-medium">
                    <span>-5m limit</span>
                    <span className="flex items-center gap-1">
                      {lowSurvivalTimeMs >= 3 * 3600 * 1000 ? (
                        <span className="text-rose-450 font-bold tracking-tight animate-pulse flex items-center gap-0.5 text-[7px]">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-rose-500" />
                          Blockage Warning Pattern
                        </span>
                      ) : (
                        <span>Laminar Flow Standard</span>
                      )}
                    </span>
                    <span>Live Telemetry</span>
                  </div>
                </div>

                <div className="text-slate-400 font-bold border-t border-b border-slate-850 pt-2 pb-1 mt-2 text-[9px] uppercase tracking-wider">
                  Auto-Inspect Settings
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-900 group">
                  <span className="text-slate-500 flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="auto-inspect-toggle-checkbox"
                      checked={selectedPort === 'alpha' ? autoInspectAlpha : autoInspectBeta}
                      onChange={(e) => {
                        if (selectedPort === 'alpha') {
                          setAutoInspectAlpha(e.target.checked);
                          if (e.target.checked) setCountdownAlpha(15 * 60);
                        } else {
                          setAutoInspectBeta(e.target.checked);
                          if (e.target.checked) setCountdownBeta(15 * 60);
                        }
                      }}
                      className="cursor-pointer accent-blue-500 rounded-sm w-3 h-3 bg-slate-950 border-slate-850"
                    />
                    <label htmlFor="auto-inspect-toggle-checkbox" className="cursor-pointer text-slate-350 select-none font-bold hover:text-white transition">
                      Enable Auto-Inspect
                    </label>
                  </span>
                  <span className={`text-[9.5px] font-black tracking-wider px-1.5 py-0.5 rounded-xs ${
                    (selectedPort === 'alpha' ? autoInspectAlpha : autoInspectBeta)
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-950/60'
                      : 'bg-slate-950 text-slate-500 border border-slate-910'
                  }`}>
                    {(selectedPort === 'alpha' ? autoInspectAlpha : autoInspectBeta) ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                  <span className="text-slate-500">Scan Interval:</span>
                  <span className="text-slate-300 font-bold">15 Minutes</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                  <span className="text-slate-500">Next Auto-Scan in:</span>
                  <span className={`font-mono font-bold ${
                    (selectedPort === 'alpha' ? autoInspectAlpha : autoInspectBeta)
                      ? 'text-teal-400 animate-pulse'
                      : 'text-slate-500 font-normal'
                  }`}>
                    {(selectedPort === 'alpha' ? autoInspectAlpha : autoInspectBeta)
                      ? formatCountdown(selectedPort === 'alpha' ? countdownAlpha : countdownBeta)
                      : 'Waiting Start'}
                  </span>
                </div>

                {/* Simulated Time Speed Up Section to trigger automatically generated logs */}
                <div className="py-2 flex flex-col gap-1">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed">
                    Testing Controls (Developer Diagnostic)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const timestring = now.getFullYear() + "-" + 
                        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                        String(now.getDate()).padStart(2, '0') + " " + 
                        String(now.getHours()).padStart(2, '0') + ":" + 
                        String(now.getMinutes()).padStart(2, '0') + ":" + 
                        String(now.getSeconds()).padStart(2, '0');

                      const newLogId = 'test-forced-' + Math.random().toString(36).substring(2, 9);
                      const key = selectedPort!;
                      const detailsText = key === 'alpha'
                        ? `Forced simulated maintenance node scan. Core Survival Index currently registered at ${survivalScore.toFixed(1)}%. Primary air conduits and polymer integrity within expectations.`
                        : `Forced simulated maintenance node scan. Core Survival Index currently registered at ${survivalScore.toFixed(1)}%. Laser feedback trajectory and optical hinge alignment stable.`;

                      const entry = {
                        id: newLogId,
                        date: timestring,
                        type: 'Automated Telemetry Scan',
                        inspector: 'Auto-Inspect System',
                        details: detailsText,
                        status: 'completed' as const
                      };

                      setServiceHistory(prev => ({
                        ...prev,
                        [key]: {
                          lastInspection: timestring,
                          logs: [entry, ...prev[key].logs]
                        }
                      }));

                      if (key === 'alpha') setCountdownAlpha(15 * 60);
                      else setCountdownBeta(15 * 60);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-750 active:bg-slate-705 border border-slate-700 hover:border-slate-650 hover:text-white px-2 py-1 rounded-xs text-[8.5px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    ⚡ Force Simulated 15m Scan Block
                  </button>
                </div>
              </div>

              {/* Action Button Section with Acknowledge Service */}
              <div className="flex flex-col gap-2 mt-2">
                {isServiceRequired ? (
                  <div className="bg-rose-950/20 border border-rose-900/30 rounded-xs p-2 text-[9px] leading-relaxed text-rose-300">
                    <p className="font-bold flex items-center gap-1 mb-1 text-rose-450 uppercase">
                      <AlertTriangle className="w-3 h-3 shrink-0 text-rose-400 animate-bounce" />
                      Sub-Optimal Stress Exposure
                    </p>
                    Rodents are subjected to sub-50% S.I. parameters for over 3 hours. Action required to purge system and clear logs.
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xs p-2 text-[9px] leading-relaxed text-emerald-300">
                    <p className="font-bold flex items-center gap-1 mb-1 text-emerald-450 uppercase">
                      <Clock className="w-3 h-3 shrink-0 text-emerald-400" />
                      Preventive Status Active
                    </p>
                    Current bio-parameters remain within acceptable margins. Perform routine inspections to declare continuous integrity.
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const timestring = now.toISOString().slice(0, 10) + " " + now.toLocaleTimeString(undefined, { hour12: false });
                    const newLogId = 'user-added-' + Math.random().toString(36).substring(2, 9);
                    
                    const newLogEntry = isServiceRequired ? {
                      id: newLogId,
                      date: timestring,
                      type: 'Emergency Purge & Recalibration',
                      inspector: 'Joshua Reuben Jakoniko, MSc',
                      details: 'Manually acknowledged and resolved accumulated habitability stress alert. Gas flow conduits purged, physical flaps aligned, and pressure sensors successfully zeroed.',
                      status: 'completed' as const
                    } : {
                      id: newLogId,
                      date: timestring,
                      type: 'Routine Inspection & Gasket Check',
                      inspector: 'Joshua Reuben Jakoniko, MSc',
                      details: 'Performed standard diagnostic telemetry check on coupling gasket. Rubber sealant elasticity validated; zero pressure leaks recorded.',
                      status: 'completed' as const
                    };

                    setServiceHistory(prev => {
                      const updatedLogs = [newLogEntry, ...prev[selectedPort].logs];
                      return {
                        ...prev,
                        [selectedPort]: {
                          lastInspection: timestring,
                          logs: updatedLogs
                        }
                      };
                    });

                    // Also clear/reset the low survival index clock!
                    onSetLowSurvivalTime(0);
                  }}
                  className={`w-full py-1.5 px-3 rounded-xs font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1 text-[10px] text-center border ${
                    isServiceRequired 
                      ? 'bg-rose-700 hover:bg-rose-600 border-rose-500 text-white animate-pulse font-extrabold shadow-sm' 
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-teal-405 hover:text-teal-300 font-bold'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  {isServiceRequired ? 'Acknowledge Service (Purge System)' : 'Acknowledge Service'}
                </button>
              </div>
            </div>

            {/* Right Historical Service Logs List */}
            <div className="col-span-1 md:col-span-8 bg-slate-950 border border-slate-850 rounded-sm p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold border-b border-slate-850 pb-1.5 uppercase tracking-widest">
                <span>Chronological Service History Log</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{serviceHistory[selectedPort].logs.length} Records</span>
                  <button
                    type="button"
                    onClick={() => {
                      const logs = serviceHistory[selectedPort].logs;
                      const headers = ['Record ID', 'Service Date', 'Activity Type', 'Assigned Inspector', 'Detailed Work Summary', 'Post-Service Status'];
                      const rows = logs.map(log => [
                        log.id,
                        log.date,
                        log.type,
                        log.inspector,
                        log.details || '',
                        log.status
                      ]);

                      exportPremiumExcelSpreadsheet(
                        `ERICON_Maintenance_Port_${selectedPort}_History_${new Date().toISOString().slice(0, 10)}.xls`,
                        `Subsystem Maintenance History Ledger: Port ${selectedPort}`,
                        'Integrated Mechanical Inspection and Verification Tracking Archive',
                        headers,
                        rows,
                        {
                          'System Hub Port': `Port ${selectedPort} Link Node`,
                          'Clearance Level': 'Authenticated Level-3 Bio-Security Engineers',
                          'Verification Registry': 'REG-MAINT-F80',
                          'Record Count': `${logs.length} maintenance entries`,
                          'Date Generated': new Date().toUTCString(),
                          'Report Version': 'v4.5-Hardware'
                        }
                      );

                      window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: "🎉 Maintenance Ledger Workbook generated according to ERICON Brand Standard!", type: "success" } }));
                    }}
                    className="bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-600 font-mono py-0.5 px-2 rounded-xs flex items-center gap-1 cursor-pointer transition text-[8.5px] font-bold text-teal-400 uppercase shadow-xs"
                    id="export-csv-btn"
                  >
                    <Download className="w-2.5 h-2.5 shrink-0" />
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[220px] flex flex-col gap-2 pr-1" id="mport-chronology-list">
                {serviceHistory[selectedPort].logs.map((log) => (
                  <div key={log.id} className="border border-slate-900 bg-slate-900/40 rounded-xs p-3 flex flex-col gap-1.5 hover:border-slate-800 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-850 pb-1 text-[8.5px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-teal-400 font-bold font-mono">{log.date}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-blue-350 font-bold">{log.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Inspector:</span>
                        <span className="text-slate-350 font-bold">{log.inspector}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-[9.5px]/relaxed italic">
                      "{log.details}"
                    </p>

                    <div className="flex items-center justify-between mt-0.5 text-[8px] font-mono">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">Node Status:</span>
                      <span className="text-emerald-450 font-bold uppercase py-0.5 rounded-xs">
                        ✓ {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Flow Diagnostics Footer Strip matching Geometric Balance */}
      <div 
        className="grid grid-cols-2 md:grid-cols-5 border-t border-slate-200 text-slate-700 bg-white" 
        id="schematic-diagnostics-strip"
      >
        <div className="p-4 border-r border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Flow Regime</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className={`text-base font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm ${
              calc.flowRegume === 'Laminar' 
                ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                : calc.flowRegume === 'Transition' 
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {calc.flowRegume.toUpperCase()}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2 lowercase">
            {(calc.reynoldsNumber < 2300) ? '● stable profile' : '● viscous eddies'}
          </p>
        </div>
        
        <div className="p-4 border-r border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Air Velocity V1</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-3xl font-mono font-light text-blue-900 leading-none">
              {calc.velocity.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">m/s</span>
          </div>
          <div className="w-full h-1 bg-slate-100 mt-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${Math.min((calc.velocity / 60) * 100, 100)}%` }}></div>
          </div>
        </div>

        <div className="p-4 border-r border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Reynolds Number</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-3xl font-mono font-light text-blue-900 leading-none">
              {(calc.reynoldsNumber / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">k Re</span>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2 uppercase">
            {calc.flowRegume === 'Laminar' ? '↑ stable flow' : '↓ turbulent limit'}
          </p>
        </div>

        <div className="p-4 border-r border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Differential ∆P</span>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-3xl font-mono font-light text-blue-900 leading-none">
              {(specs.p1 - specs.p2).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">kPa</span>
          </div>
          <p className="text-[9px] text-emerald-600 font-bold mt-2 font-mono">
            {specs.p1 - specs.p2 > 60 ? '↑ STABLE GRADIENT' : '● NOMINAL PRESSURE'}
          </p>
        </div>

        {/* METRIC 5: Real-world Thermal Deviation Gauge based on rodent species' thermoneutral zone LIMITS */}
        <div className="p-4 flex flex-col justify-between bg-slate-50/50">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Thermal Dev.</span>
            <span className="text-[8px] font-mono font-bold uppercase py-0.5 px-1 bg-slate-200 text-slate-700 rounded-xs truncate max-w-[70px]">
              {rodentSpecies.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-end gap-1 mt-0.5">
            <span className={`text-2xl font-mono font-semibold leading-none ${deviationColor}`}>
              {deviationSign}{deviation.toFixed(1)}<span className="text-xs">°C</span>
            </span>
            <span className="text-[8px] text-slate-400 font-mono uppercase tracking-wide">from ideal</span>
          </div>

          <div className="relative w-full h-2.5 bg-slate-250 mt-2 rounded-full overflow-hidden flex select-none" title={`Current Temp: ${specs.temperature}°C, Ideal range: ${profile.optMin}°C - ${profile.optMax}°C`}>
            {/* Cold safety boundaries */}
            <div className="h-full bg-sky-350 opacity-90" style={{ width: '35%' }}></div>
            {/* comfortable safe Thermoneutral Zone */}
            <div className="h-full bg-emerald-500 opacity-95" style={{ width: '30%' }}></div>
            {/* Hot safety boundaries */}
            <div className="h-full bg-rose-350 opacity-90" style={{ width: '35%' }}></div>
            
            {/* Flowing thermal point */}
            <div 
              className="absolute top-0 bottom-0 w-2.5 bg-slate-900 border border-white shadow-md rounded-full transition-all duration-300"
              style={{ left: `${indicatorPercent}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-1 h-1 bg-amber-400 rounded-full mx-auto my-0.5 animate-pulse"></div>
            </div>
          </div>

          <div className="text-[8.5px] text-slate-500 font-mono mt-1.5 flex justify-between uppercase">
            <span>opt: {profile.optMin}°C–{profile.optMax}°C</span>
            <span className="font-bold text-slate-700">cur: {specs.temperature}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};
