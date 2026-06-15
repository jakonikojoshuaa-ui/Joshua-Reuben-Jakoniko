/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Cpu, Wind, ShieldAlert, BadgeInfo, Weight, Zap, Gauge, Clock, Trash2, Plus, TrendingUp, History, Play, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, CapsuleSimulation, RodentSpecies } from '../types';
import { calculatePhysics, calculateSurvivalScore } from '../utils/physics';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Heart, Activity, AlertTriangle, CheckCircle, Flame, Snowflake, ShieldCheck } from 'lucide-react';

interface AnalyticsPanelProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  capsule: CapsuleSimulation;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
}

const SPECIES_PROFILES: Record<RodentSpecies, { 
  label: string; 
  isRat: boolean; 
  optMin: number; 
  optMax: number; 
  maxSafeVel: number; 
  fatalVel: number;
  minFlowLmin: number;
}> = {
  field_mouse: {
    label: 'Field Mouse (Apodemus sylvaticus)',
    isRat: false,
    optMin: 20,
    optMax: 26,
    maxSafeVel: 2.5,
    fatalVel: 8.0,
    minFlowLmin: 0.25,
  },
  house_mouse: {
    label: 'House Mouse (Mus musculus)',
    isRat: false,
    optMin: 22,
    optMax: 26,
    maxSafeVel: 2.5,
    fatalVel: 8.0,
    minFlowLmin: 0.25,
  },
  mastomys_natalensis: {
    label: 'Multimammate Mouse (Mastomys natalensis)',
    isRat: false,
    optMin: 24, // Tropical field mouse thrives at warmer ranges
    optMax: 32,
    maxSafeVel: 3.0,
    fatalVel: 9.0,
    minFlowLmin: 0.45,
  },
  arvicanthis_spp: {
    label: 'African Grass Rat (Arvicanthis spp.)',
    isRat: true,
    optMin: 22,
    optMax: 29,
    maxSafeVel: 3.5,
    fatalVel: 10.0,
    minFlowLmin: 0.8,
  },
  roof_rat: {
    label: 'Roof Rat (Rattus rattus)',
    isRat: true,
    optMin: 20,
    optMax: 26,
    maxSafeVel: 4.0,
    fatalVel: 11.0,
    minFlowLmin: 1.0,
  },
  brown_rat: {
    label: 'Brown Rat (Rattus norvegicus)',
    isRat: true,
    optMin: 18,
    optMax: 24,
    maxSafeVel: 4.5,
    fatalVel: 12.0,
    minFlowLmin: 1.2,
  },
};

const TRAP_NIGHT_PRESETS = [
  { id: 'tn-winter', name: 'Trap Night 12 (High Drift Chill)', color: '#3b82f6', scores: [82, 75, 68, 62, 54, 49, 44, 45, 41, 40] },
  { id: 'tn-summer', name: 'Trap Night 15 (Decompression Shock)', color: '#f59e0b', scores: [61, 62, 60, 64, 63, 61, 65, 62, 64, 63] },
  { id: 'tn-spring', name: 'Trap Night 19 (Optimal Sub-Slab Run)', color: '#10b981', scores: [94, 95, 95, 96, 95, 97, 98, 97, 98, 99] }
];

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ 
  specs, 
  calc, 
  capsule,
  rodentSpecies,
  owepDesign
}) => {
  // Custom overlays state
  const [customOverlays, setCustomOverlays] = useState<{ id: string; name: string; color: string; scores: number[] }[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_custom_overlays');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeOverlays, setActiveOverlays] = useState<string[]>([]);

  // Species visibility toggles inside the Recharts historic trends chart
  const [visibleSpecies, setVisibleSpecies] = useState<Record<RodentSpecies, boolean>>({
    field_mouse: true,
    house_mouse: true,
    mastomys_natalensis: true,
    arvicanthis_spp: true,
    roof_rat: true,
    brown_rat: true,
  });

  // Compile active survival scores across historical runs dynamically mapped to current specs adjustments
  const chartsData = useMemo(() => {
    const runs = [
      { id: 'Run 1', name: 'Run 1 (Base Inflow)', p1: 100, p2: 95, temp: 22 },
      { id: 'Run 2', name: 'Run 2 (High Vacuum)', p1: 110, p2: 92, temp: 18 },
      { id: 'Run 3', name: 'Run 3 (Dusk Chill)', p1: 105, p2: 100, temp: 14 },
      { id: 'Run 4', name: 'Run 4 (Thermal Leak)', p1: 102, p2: 96, temp: 35 },
      { id: 'Run 5', name: 'Run 5 (Pressure Drop)', p1: 85, p2: 81, temp: 24 },
      { id: 'Run 6', name: 'Run 6 (Laminar Sweet)', p1: 108, p2: 102, temp: 25 },
      { id: 'Run 7', name: 'Run 7 (Power Surge)', p1: 125, p2: 110, temp: 28 },
      { id: 'Active', name: 'Current Calibration', p1: specs.p1, p2: specs.p2, temp: specs.temperature }
    ];

    return runs.map(r => {
      const rSpecs: SystemSpecs = {
        ...specs,
        p1: r.p1,
        p2: r.p2,
        temperature: r.temp
      };
      const rCalc = calculatePhysics(rSpecs);

      return {
        name: r.id,
        fullName: r.name,
        field_mouse: calculateSurvivalScore(rSpecs, rCalc, 'field_mouse'),
        house_mouse: calculateSurvivalScore(rSpecs, rCalc, 'house_mouse'),
        mastomys_natalensis: calculateSurvivalScore(rSpecs, rCalc, 'mastomys_natalensis'),
        arvicanthis_spp: calculateSurvivalScore(rSpecs, rCalc, 'arvicanthis_spp'),
        roof_rat: calculateSurvivalScore(rSpecs, rCalc, 'roof_rat'),
        brown_rat: calculateSurvivalScore(rSpecs, rCalc, 'brown_rat')
      };
    });
  }, [specs]);

  // Kinetic energy calculation for capsule
  const kineticEnergy = 0.5 * (specs.capsuleMass / 1000) * Math.pow(capsule.velocity, 2);
  const reCol = calc.flowRegume === 'Laminar' 
    ? 'text-emerald-600' 
    : calc.flowRegume === 'Transition' 
    ? 'text-amber-600' 
    : 'text-rose-600';

  const reBg = calc.flowRegume === 'Laminar' 
    ? 'bg-emerald-50/20 border-emerald-100' 
    : calc.flowRegume === 'Transition' 
    ? 'bg-amber-50/20 border-amber-100' 
    : 'bg-rose-50/20 border-rose-100';

  // ERICON Rodent Survival Code Calculations
  const volumeTube = Math.PI * Math.pow(specs.diameter / 2000, 2) * specs.length; // tube volume in cubic meters
  const flowHourly = calc.flowRateVolumetric * 3600; // m3/h flow rate of air
  const ach = flowHourly / Math.max(volumeTube, 0.001); // Air Changes per Hour

  const activeProfile = SPECIES_PROFILES[rodentSpecies] || SPECIES_PROFILES.field_mouse;
  const speciesLabel = activeProfile.label;
  const isRat = activeProfile.isRat;
  const optMin = activeProfile.optMin;
  const optMax = activeProfile.optMax;
  const maxSafeVel = activeProfile.maxSafeVel;
  const fatalVel = activeProfile.fatalVel;
  const minFlowLmin = activeProfile.minFlowLmin;

  // 1. Oxygen / CO2 Ventilation Rate Status (ACH)
  let achStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  let achText = '';
  if (ach < 8) {
    achStatus = 'fatal';
    achText = 'Lethal Stagnation: High carbon dioxide buildup and risk of hypoxia/asphyxiation.';
  } else if (ach < 18) {
    achStatus = 'warning';
    achText = 'Low air changes code: Marginal fresh gas content for sustained holding.';
  } else if (ach > 180) {
    achStatus = 'warning';
    achText = 'High wind draft turnover: Core draft causes rapid convective water loss & hydration risk.';
  } else {
    achStatus = 'excellent';
    achText = 'Ideal Fresh Air Turnover: Steady 15-150 air changes/hour matches metabolism requirements.';
  }

  // 2. Draft / Wind Chill Velocity Assessment
  let velStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  let velText = '';

  if (calc.velocity < 0.05) {
    velStatus = 'warning';
    velText = 'Stagnant pockets: Poor convective exhaust clearing.';
  } else if (calc.velocity > fatalVel) {
    velStatus = 'fatal';
    velText = 'Lethal sweep drag: Severe blast velocity Sweeps rodents off feet, initiating mechanical impact injuries.';
  } else if (calc.velocity > maxSafeVel) {
    velStatus = 'warning';
    velText = 'High convective wind chill draft: High risk of hypothermic stress for thin nesting species.';
  } else {
    velStatus = 'excellent';
    velText = 'Comfortable ventilation speed: Low-convective draft matches standard laboratory limits.';
  }

  // 3. Absolute Operating Pressure / Barotrauma Assessment
  let pressStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  let pressText = '';
  if (calc.avgPressure < 45 || specs.p2 < 45) {
    pressStatus = 'fatal';
    pressText = 'Severe Decompression/Vacuum: Pulmonic barotrauma, hypoxia, and lethal lung expansion.';
  } else if (calc.avgPressure < 85 || specs.p2 < 82) {
    pressStatus = 'warning';
    pressText = 'Sub-atmospheric depressurization: Triggers physical breathing stress over days.';
  } else if (calc.avgPressure > 175 || specs.p1 > 175) {
    pressStatus = 'fatal';
    pressText = 'Fatal hyperbaric compression: Core pressures stress rodent physical middle ear and lungs.';
  } else if (calc.avgPressure > 120 || specs.p1 > 120) {
    pressStatus = 'warning';
    pressText = 'Hyperbaric load: Mild internal ear pressure and stress. Safe for only short duration.';
  } else {
    pressStatus = 'excellent';
    pressText = 'Ideal Atmo Balance: Standard barometric pressures prevent respiratory stress.';
  }

  // 4. Biothermal Temperature Triage
  let tempStatus: 'excellent' | 'warning' | 'fatal' = 'excellent';
  let tempText = '';

  if (specs.temperature <= 0 || specs.temperature >= 38) {
    tempStatus = 'fatal';
    tempText = specs.temperature <= 0 
      ? 'Extreme Frostbite: Lethal hypothermia inside unheated Polyamide conduits.'
      : 'Severe Hyperthermia: Lethal body temp limits causing heat death.';
  } else if (specs.temperature < optMin) {
    tempStatus = 'warning';
    tempText = 'Cool draft stress: Speeds up metabolic exhaustion (rodents must eat 3x more).';
  } else if (specs.temperature > optMax) {
    tempStatus = 'warning';
    tempText = 'High core temperature: Rapid dehydration and breathing stress.';
  } else {
    tempStatus = 'excellent';
    tempText = 'Thermoneutral zone equilibrium: Perfect core metabolic conservation.';
  }

  // Aggregate Rodent Safety Index (%)
  let survivalScore = 98;
  if (achStatus === 'fatal' || velStatus === 'fatal' || pressStatus === 'fatal' || tempStatus === 'fatal') {
    survivalScore = 0;
  } else {
    if (achStatus === 'warning') survivalScore -= 15;
    if (velStatus === 'warning') survivalScore -= 20;
    if (pressStatus === 'warning') survivalScore -= 22;
    if (tempStatus === 'warning') {
      const diff = Math.abs(specs.temperature - (optMin + optMax) / 2);
      survivalScore -= Math.min(Math.round(diff * 2.5), 32);
    }
    // smooth bounds [5, 99]
    survivalScore = Math.max(Math.min(survivalScore, 99), 5);
  }

  // --- 5-Minute Telemetry Survival History State ---
  const [logHistory, setLogHistory] = useState<{
    id: string;
    time: string;
    timestampMs: number;
    score: number;
    species: RodentSpecies;
    ach: number;
    temp: number;
    status: 'excellent' | 'warning' | 'fatal';
  }[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_survival_history_log_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        const cutoff = Date.now() - 5 * 60 * 1000;
        return parsed.filter((item: any) => item.timestampMs >= cutoff);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [autoLogEnabled, setAutoLogEnabled] = useState(true);

  // Synchronize history log to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ericon_survival_history_log_v2', JSON.stringify(logHistory));
    } catch (e) {
      console.error(e);
    }
  }, [logHistory]);

  // Clean stale logs older than 5 minutes periodically
  useEffect(() => {
    const cleaner = setInterval(() => {
      const cutoff = Date.now() - 5 * 60 * 1000;
      setLogHistory(prev => {
        const filtered = prev.filter(e => e.timestampMs >= cutoff);
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(cleaner);
  }, []);

  // Debounced auto-log on any parameter tweak (after 1.5 seconds of static values)
  useEffect(() => {
    if (!autoLogEnabled) return;

    const handler = setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timestampMs = now.getTime();
      const rawStatus: 'excellent' | 'warning' | 'fatal' = survivalScore >= 90 ? 'excellent' : survivalScore >= 50 ? 'warning' : 'fatal';

      setLogHistory(prev => {
        const cutoff = Date.now() - 5 * 60 * 1000;
        const currentLogs = prev.filter(e => e.timestampMs >= cutoff);

        // Avoid exact match duplicate at the end of the log to prevent UI clutter
        if (currentLogs.length > 0) {
          const last = currentLogs[currentLogs.length - 1];
          if (Math.abs(last.score - survivalScore) < 0.1 &&
              last.species === rodentSpecies &&
              Math.abs(last.temp - specs.temperature) < 0.1 &&
              Math.abs(last.ach - ach) < 0.1) {
            return currentLogs;
          }
        }

        const newEntry = {
          id: Math.random().toString(36).substring(2, 9),
          time: timeStr,
          timestampMs,
          score: survivalScore,
          species: rodentSpecies,
          ach,
          temp: specs.temperature,
          status: rawStatus
        };

        return [...currentLogs, newEntry];
      });
    }, 1500);

    return () => clearTimeout(handler);
  }, [survivalScore, rodentSpecies, ach, specs.temperature, autoLogEnabled]);

  // Periodic steady logger (every 15 seconds) to ensure time series moves forward even under static parameters
  useEffect(() => {
    if (!autoLogEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timestampMs = now.getTime();
      const rawStatus: 'excellent' | 'warning' | 'fatal' = survivalScore >= 90 ? 'excellent' : survivalScore >= 50 ? 'warning' : 'fatal';

      setLogHistory(prev => {
        const cutoff = Date.now() - 5 * 60 * 1000;
        const currentLogs = prev.filter(e => e.timestampMs >= cutoff);

        // Only log if last log is older than 12 seconds
        if (currentLogs.length > 0) {
          const last = currentLogs[currentLogs.length - 1];
          if (timestampMs - last.timestampMs < 12000) {
            return currentLogs;
          }
        }

        const newEntry = {
          id: Math.random().toString(36).substring(2, 9),
          time: timeStr,
          timestampMs,
          score: survivalScore,
          species: rodentSpecies,
          ach,
          temp: specs.temperature,
          status: rawStatus
        };
        return [...currentLogs, newEntry];
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [survivalScore, rodentSpecies, ach, specs.temperature, autoLogEnabled]);

  // Manual log capture
  const handleManualAddLog = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timestampMs = now.getTime();
    const rawStatus: 'excellent' | 'warning' | 'fatal' = survivalScore >= 90 ? 'excellent' : survivalScore >= 50 ? 'warning' : 'fatal';

    setLogHistory(prev => {
      const cutoff = Date.now() - 5 * 60 * 1000;
      const currentLogs = prev.filter(e => e.timestampMs >= cutoff);

      const newEntry = {
        id: Math.random().toString(36).substring(2, 9),
        time: timeStr,
        timestampMs,
        score: survivalScore,
        species: rodentSpecies,
        ach,
        temp: specs.temperature,
        status: rawStatus
      };
      return [...currentLogs, newEntry];
    });
  };

  const handleClearHistory = () => {
    setLogHistory([]);
  };

  // Sparkline coordinates
  const sparklinePaths = useMemo(() => {
    if (logHistory.length < 2) return { line: '', area: '' };
    const width = 500;
    const height = 90;
    const paddingX = 15;
    const paddingY = 15;
    const chartWidth = width - 2 * paddingX;
    const chartHeight = height - 2 * paddingY;

    const points = logHistory.map((entry, index) => {
      const x = paddingX + (index / (logHistory.length - 1)) * chartWidth;
      // Map survival score 0-100 to y-pos inside chart bounds (100 is top, 0 is bottom)
      const y = height - paddingY - (entry.score / 100) * chartHeight;
      return { x, y };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    
    const startX = paddingX;
    const endX = paddingX + chartWidth;
    const bottomY = height - paddingY;
    const areaPath = `M ${startX.toFixed(1)} ${bottomY.toFixed(1)} L ${points.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} L ${endX.toFixed(1)} ${bottomY.toFixed(1)} Z`;

    return { line: linePath, area: areaPath };
  }, [logHistory]);

  const currentTrend = useMemo(() => {
    if (logHistory.length < 2) return 'stable';
    const last = logHistory[logHistory.length - 1].score;
    const prevScore = logHistory[logHistory.length - 2].score;
    if (last > prevScore) return 'improving';
    if (last < prevScore) return 'declining';
    return 'stable';
  }, [logHistory]);

  // Aesthetic color maps for the survival status card
  const survivalCol = survivalScore >= 90
    ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50'
    : survivalScore >= 50
    ? 'text-amber-600 border-amber-200 bg-amber-50/50'
    : 'text-rose-600 border-rose-200 bg-rose-50/50';

  const survivalButtonPillCol = survivalScore >= 90
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
    : survivalScore >= 50
    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm';

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm shadow-md p-6 flex flex-col gap-6" id="analytics-panel">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4" id="analytics-header">
        <div className="flex items-center gap-2">
          <Heart className="w-4.5 h-4.5 text-emerald-700 fill-emerald-100 animate-pulse" />
          <h2 className="text-xs font-mono font-bold text-emerald-900 tracking-widest uppercase">
            ERICON Ecological Survival Diagnostics
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200 uppercase">
          ● REAL-TIME BIOPHYSIOLOGICAL TELEMETRY
        </span>
      </div>

      {/* ================= BIOPHYSICAL SURVIVAL INDEX CARD ================= */}
      <div className={`border-2 rounded-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all ${survivalCol}`}>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 font-bold font-mono text-sm uppercase tracking-wider text-slate-800">
            <Activity className="w-5 h-5 text-emerald-600 animate-pulse animate-duration-[1.5s]" />
            Rodent Habitability Status: 
            <span className={survivalScore >= 90 ? 'text-emerald-700' : survivalScore >= 50 ? 'text-amber-700' : 'text-rose-700 font-extrabold animate-bounce'}>
              {survivalScore >= 90 ? 'EXCELLENT' : survivalScore >= 50 ? 'MARGINAL/STRESSED' : 'UNINHABITABLE (LETHAL)'}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 max-w-xl leading-relaxed mt-1">
            Evaluating conditions inside ERAS tunnel structures for <strong>{speciesLabel}</strong>. 
            {survivalScore >= 90 
              ? ' Ambient pressures, fresh air changes, and convective velocities are configured inside optimal physiological limits. Supporting long-term, month-scale safe containment without distress.' 
              : survivalScore >= 50 
              ? ' High metabolic stress detected. The current configurations push parameters to survival limits. Prolonged exposures may lead to accelerated desiccation, physical shivering, or lung stress.' 
              : ' SYSTEM WARNING: Crucial respiratory thresholds violated. Unheated environments, severe draft forces, or dangerous vacuum suction indexes will trigger rapid mortality.'}
          </p>
        </div>
        
        {/* Dynamic circular survival gauge */}
        <div className="flex flex-col items-center justify-center shrink-0 pr-2">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-20 h-20 -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="#e2e8f0" strokeWidth="6.5" fill="none" className="opacity-45" />
              <circle 
                cx="40" 
                cy="40" 
                r="32" 
                stroke={survivalScore >= 90 ? '#10b981' : survivalScore >= 50 ? '#f59e0b' : '#ef4444'} 
                strokeWidth="6.5" 
                fill="none" 
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - survivalScore / 100)}`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-mono font-black text-slate-800 leading-none">{survivalScore}%</span>
              <span className="text-[7px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">SURVIVAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DETAILED HABITABILITY PARAMS CHECKLIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="biophysical-checklist">
        
        {/* Metric 1: ACH */}
        <div className={`border rounded-sm p-4 flex flex-col justify-between transition-all ${
          achStatus === 'excellent' ? 'bg-emerald-50/5 border-emerald-100 hover:bg-emerald-50/15' : achStatus === 'warning' ? 'bg-amber-50/5 border-amber-100 hover:bg-amber-50/15' : 'bg-rose-50/5 border-rose-100 hover:bg-rose-50/15'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">1. Air Turnover (Respiration)</span>
            <span className={`px-2 py-0.5 text-[8px] font-bold rounded-sm uppercase ${
              achStatus === 'excellent' ? 'bg-emerald-100 text-emerald-800' : achStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>{achStatus}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-mono font-bold text-slate-800">
              {ach.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">ACH</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
            {achText}
          </p>
        </div>

        {/* Metric 2: Convective Wind draft */}
        <div className={`border rounded-sm p-4 flex flex-col justify-between transition-all ${
          velStatus === 'excellent' ? 'bg-emerald-50/5 border-emerald-100 hover:bg-emerald-50/15' : velStatus === 'warning' ? 'bg-amber-50/5 border-amber-100 hover:bg-amber-50/15' : 'bg-rose-50/5 border-rose-100 hover:bg-rose-50/15'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">2. Velocity (Wind Stress)</span>
            <span className={`px-2 py-0.5 text-[8px] font-bold rounded-sm uppercase ${
              velStatus === 'excellent' ? 'bg-emerald-100 text-emerald-800' : velStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>{velStatus}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-mono font-bold text-slate-800">
              {calc.velocity.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">m/s</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
            {velText}
          </p>
        </div>

        {/* Metric 3: Respiration Pressure (Barotrauma) */}
        <div className={`border rounded-sm p-4 flex flex-col justify-between transition-all ${
          pressStatus === 'excellent' ? 'bg-emerald-50/5 border-emerald-100 hover:bg-emerald-50/15' : pressStatus === 'warning' ? 'bg-amber-50/5 border-amber-100 hover:bg-amber-50/15' : 'bg-rose-50/5 border-rose-100 hover:bg-rose-50/15'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">3. Atmospheric Barometric</span>
            <span className={`px-2 py-0.5 text-[8px] font-bold rounded-sm uppercase ${
              pressStatus === 'excellent' ? 'bg-emerald-100 text-emerald-800' : pressStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>{pressStatus}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-mono font-bold text-slate-800">
              {calc.avgPressure.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">kPa P_avg</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
            {pressText} (P1: {specs.p1.toFixed(0)} kPa, P2: {specs.p2.toFixed(0)} kPa)
          </p>
        </div>

        {/* Metric 4: Biothermal temperature */}
        <div className={`border rounded-sm p-4 flex flex-col justify-between transition-all ${
          tempStatus === 'excellent' ? 'bg-emerald-50/5 border-emerald-100 hover:bg-emerald-50/15' : tempStatus === 'warning' ? 'bg-amber-50/5 border-amber-100 hover:bg-amber-50/15' : 'bg-rose-50/5 border-rose-100 hover:bg-rose-50/15'
        }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">4. Biophysical Ambient Temp</span>
            <span className={`px-2 py-0.5 text-[8px] font-bold rounded-sm uppercase ${
              tempStatus === 'excellent' ? 'bg-emerald-100 text-emerald-800' : tempStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>{tempStatus}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2.5">
            <span className="text-2xl font-mono font-bold text-slate-800">
              {specs.temperature}
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">°C</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-2 leading-relaxed">
            {tempText} (Safe bounds: {optMin} - {optMax} °C)
          </p>
        </div>

      </div>

      {/* HISTORIC SUBTERRANEAN VENTILATION INSIGHTS CHECKLIST */}
      <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-[10px] text-slate-600 leading-relaxed font-sans flex flex-col gap-1.5" id="eras-architect-notes">
        <h4 className="font-mono font-bold text-emerald-900 uppercase text-[10.5px]">ERICON Architect Engineering Compliance</h4>
        <p>• <strong>Respiration Rate (ERICON 2023 Guidelines)</strong>: Rodents inside deep subterranean channels demand a minimum fresh air inflow corresponding to <strong>{minFlowLmin} L/min</strong> per individual. Your current volumetric flow rate Q matches <strong>{(calc.flowRateVolumetric * 1000).toFixed(2)} L/sec</strong> which fully satisfies breathing demand for large aggregate populations.</p>
        <p>• <strong>Thermal Shivering & Glycogen Burn</strong>: If temperature drops below {optMin}°C (optimal comfort limit), rodents will begin muscle thermogenesis, increasing feed intake demands. Keep temps in the green zone to reduce monthly system sustenance costs.</p>
      </div>

      {/* ================= 5-MINUTE SURVIVAL HISTORICAL TRACKER ================= */}
      <hr className="border-t border-slate-100 my-1" />

      <div className="border-2 border-slate-200 rounded-sm p-5 bg-slate-50/30 flex flex-col gap-4" id="habitability-survival-log">
        
        {/* Header and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-blue-950 animate-duration-[4s] animate-spin-slow" />
            <div className="flex flex-col">
              <h3 className="text-xs font-mono font-bold text-slate-800 tracking-wider uppercase">
                5-Min Habitability Log &amp; Physiological Trend
              </h3>
              <p className="text-[9px] text-slate-400 font-sans">
                Time-stamped monitoring to track the long-term bio-impact of pneumatic flow adjustments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Auto Logging Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoLogEnabled}
                onChange={(e) => setAutoLogEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm text-emerald-600 focus:ring-0 focus:ring-offset-0 border-slate-300"
              />
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Auto-Sampling</span>
            </label>

            <span className="h-4 w-px bg-slate-200 hidden sm:inline" />

            {/* Manual Snapshot */}
            <button
              onClick={handleManualAddLog}
              className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-sm transition shadow-2xs cursor-pointer"
              title="Add a manual telemetry snapshot of current configurations"
            >
              <Plus className="w-3 h-3 text-slate-500" />
              Add Snapshot
            </button>

            {/* Clear history */}
            <button
              onClick={handleClearHistory}
              disabled={logHistory.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono font-bold bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 active:bg-rose-100 disabled:opacity-40 disabled:hover:bg-white rounded-sm transition shadow-2xs cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-rose-500" />
              Clear Log
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Left panel: Sparkline trend visualizer */}
          <div className="col-span-1 xl:col-span-7 bg-white border border-slate-200 rounded-sm p-4 flex flex-col justify-between gap-3 min-h-[160px]">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Historical Trend Curve (last 5 min)</span>
              
              {/* Trend Direction Indicator */}
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Trend:</span>
                {currentTrend === 'improving' ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-0.5 text-[8px]">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-600" /> Improving
                  </span>
                ) : currentTrend === 'declining' ? (
                  <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-0.5 text-[8px] animate-pulse">
                    ↘ Declining
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm uppercase text-[8px]">
                    → Stable
                  </span>
                )}
              </div>
            </div>

            {/* Sparkline canvas container */}
            <div className="relative flex-1 bg-slate-50/40 border border-slate-100 rounded-sm flex items-center justify-center py-2 overflow-hidden min-h-[90px]">
              {logHistory.length < 2 ? (
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <Clock className="w-5.5 h-5.5 text-slate-300 animate-pulse mt-0.5" />
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-1.5 uppercase tracking-wide">
                    Gathering Telemetry Samples...
                  </span>
                  <p className="text-[8.5px] text-slate-400 max-w-xs font-sans mt-0.5 leading-tight">
                    Requires at least 2 snapshot data points. Tick "Auto-Sampling" or click "Add Snapshot" to instantly record parameters.
                  </p>
                </div>
              ) : (
                <div className="w-full h-full relative px-1">
                  <svg className="w-full h-full min-h-[90px]" viewBox="0 0 500 90" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Helper Horizontal Guideline: Comfort Threshold at 90% */}
                    <line 
                      x1="0" y1="24" x2="500" y2="24" 
                      stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" 
                      className="opacity-45"
                    />
                    <text x="6" y="21" className="fill-emerald-800 text-[6.5px] font-mono font-black uppercase tracking-wider opacity-60">
                      Comfort Zone (90%)
                    </text>

                    {/* Helper Horizontal Guideline: Critical Stress Threshold at 50% */}
                    <line 
                      x1="0" y1="56" x2="500" y2="56" 
                      stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" 
                      className="opacity-45"
                    />
                    <text x="6" y="53" className="fill-amber-800 text-[6.5px] font-mono font-black uppercase tracking-wider opacity-60">
                      Metabolic Stress Limit (50%)
                    </text>

                    {/* Sparkline Area Fill */}
                    {sparklinePaths.area && (
                      <path d={sparklinePaths.area} fill="url(#sparkline-grad)" />
                    )}

                    {/* Sparkline Stroke Line */}
                    {sparklinePaths.line && (
                      <path 
                        d={sparklinePaths.line} 
                        fill="none" 
                        stroke={logHistory[logHistory.length - 1].score >= 90 ? '#059669' : logHistory[logHistory.length - 1].score >= 50 ? '#d97706' : '#dc2626'} 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Accent Markers for individual points */}
                    {logHistory.map((entry, index) => {
                      const x = 15 + (index / (logHistory.length - 1)) * 470;
                      // Match mapping inside sparklinePaths
                      const y = 90 - 15 - (entry.score / 100) * 60;
                      const isLast = index === logHistory.length - 1;
                      return (
                        <g key={entry.id}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r={isLast ? "3.5" : "2"} 
                            fill={entry.score >= 90 ? '#10b981' : entry.score >= 50 ? '#f59e0b' : '#ef4444'} 
                            stroke="#ffffff" 
                            strokeWidth="1" 
                          />
                        </g>
                      );
                    })}

                    {/* Historical Preset & Custom Overlays */}
                    {activeOverlays.map(overlayId => {
                      const overlay = [...TRAP_NIGHT_PRESETS, ...customOverlays].find(o => o.id === overlayId);
                      if (!overlay) return null;
                      const points = overlay.scores.map((s, index) => {
                        const x = 15 + (index / (overlay.scores.length - 1)) * 470;
                        const y = 90 - 15 - (s / 100) * 60;
                        return { x, y };
                      });
                      const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                      return (
                        <g key={overlay.id}>
                          <path
                            d={linePath}
                            fill="none"
                            stroke={overlay.color}
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="opacity-90"
                          />
                          {points.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="2.5"
                              fill={overlay.color}
                              stroke="#ffffff"
                              strokeWidth="0.5"
                            />
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between font-mono text-[8.5px] text-slate-400 px-1">
              <span>5m Ago (Epoch Start)</span>
              <span>Active Telemetry Snapshot Interval: Dynamic</span>
              <span>Present Moment</span>
            </div>

            {/* Compare Trends Feature controls */}
            <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-[9.5px] font-mono font-bold uppercase text-slate-700 tracking-wider">
                  Compare Historical Trap Nights
                </span>
                {logHistory.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const name = `Custom Overlay #${customOverlays.length + 1} (${new Date().toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'})})`;
                      const newOverlay = {
                        id: `custom-${Date.now()}`,
                        name,
                        color: '#a855f7', // dynamic violet
                        scores: logHistory.map(l => l.score)
                      };
                      const updated = [...customOverlays, newOverlay];
                      setCustomOverlays(updated);
                      localStorage.setItem('ericon_custom_overlays', JSON.stringify(updated));
                      setActiveOverlays(prev => [...prev, newOverlay.id]);
                    }}
                    className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white font-mono text-[8px] uppercase font-bold rounded-sm cursor-pointer shadow-xs transition-colors"
                  >
                    + Save Current Run as Overlay
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[...TRAP_NIGHT_PRESETS, ...customOverlays].map((tn) => {
                  const isActive = activeOverlays.includes(tn.id);
                  return (
                    <button
                      key={tn.id}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          setActiveOverlays(prev => prev.filter(id => id !== tn.id));
                        } else {
                          setActiveOverlays(prev => [...prev, tn.id]);
                        }
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-left cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-slate-50 border-slate-400 font-bold' 
                          : 'bg-white hover:bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tn.color }} />
                      <div className="flex-grow min-w-0 font-mono text-[8.5px]">
                        <p className="truncate text-slate-800 uppercase tracking-tight font-black leading-tight">{tn.name}</p>
                        <p className="text-[7.5px] text-slate-400 leading-none mt-0.5 font-medium">
                          Avg Score: {(tn.scores.reduce((a,b)=>a+b,0)/tn.scores.length).toFixed(0)}% • {isActive ? 'Hide Line' : 'Overlay Line'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Log sheet */}
          <div className="col-span-1 xl:col-span-5 flex flex-col gap-2 bg-white border border-slate-200 rounded-sm p-4">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              Recorded Chronological Logs ({logHistory.length} entries)
            </span>

            {/* Scroll Container */}
            <div className="overflow-y-auto max-h-[128px] border border-slate-100 rounded-sm bg-slate-50/20 p-1 flex flex-col gap-1.5" id="chronicle-timeline-records">
              {logHistory.length === 0 ? (
                <div className="text-center py-8 text-[9px] font-mono text-slate-400 italic">
                  No log chronicle entries registered yet.
                </div>
              ) : (
                [...logHistory].reverse().map((entry) => {
                  let badgeCol = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (entry.status === 'warning') badgeCol = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (entry.status === 'fatal') badgeCol = 'bg-rose-50 text-rose-800 border-rose-200';

                  const spShort = entry.species.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                  return (
                    <div 
                      key={entry.id} 
                      className={`border rounded-sm px-2.5 py-1.5 flex items-center justify-between gap-3 text-[9.5px] font-mono transition bg-white hover:border-slate-350 hover:shadow-xs`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-slate-400 font-bold select-none shrink-0">{entry.time}</span>
                        <span className="h-3 w-px bg-slate-200 shrink-0" />
                        
                        {/* Species & stats summaries */}
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-800 font-bold truncate tracking-tight">{spShort}</span>
                          <span className="text-[8.5px] text-slate-400 truncate leading-none">
                            {entry.temp.toFixed(0)}°C • {entry.ach.toFixed(0)} ACH
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className={`px-1.5 py-0.5 rounded-xs border font-black shrink-0 ${badgeCol} text-[8.5px]`}>
                        S.I. {entry.score}%
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ================= RECHARTS SPECIES-SPECIFIC TRENDS VIEW ================= */}
      <div className="border-2 border-slate-200 rounded-sm p-5 bg-white flex flex-col gap-4 mt-4" id="species-survival-recharts-trends">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-700 animate-pulse" />
            <div className="flex flex-col">
              <h3 className="text-xs font-mono font-bold text-slate-800 tracking-wider uppercase">
                Species-Specific Historical Survival Trends (Recharts)
              </h3>
              <p className="text-[9px] text-slate-400 font-sans">
                Dynamic comparative tracking of rodent survival index across previous audit runs versus current active settings.
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setVisibleSpecies({
                field_mouse: true, house_mouse: true, mastomys_natalensis: true,
                arvicanthis_spp: true, roof_rat: true, brown_rat: true
              })}
              className="px-2 py-0.5 text-[8px] font-bold font-mono bg-slate-150 text-slate-600 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
            >
              Check All
            </button>
            <button
              onClick={() => setVisibleSpecies({
                field_mouse: false, house_mouse: false, mastomys_natalensis: false,
                arvicanthis_spp: false, roof_rat: false, brown_rat: false
              })}
              className="px-2 py-0.5 text-[8px] font-bold font-mono bg-slate-150 text-slate-600 hover:bg-slate-200 rounded border border-slate-300 cursor-pointer"
            >
              Uncheck All
            </button>
          </div>
        </div>

        {/* Species selector checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-sm border border-slate-150">
          {(Object.keys(visibleSpecies) as Array<RodentSpecies>).map((sp) => {
            const colors: Record<RodentSpecies, string> = {
              field_mouse: '#10b981',
              house_mouse: '#3b82f6',
              mastomys_natalensis: '#f59e0b',
              arvicanthis_spp: '#ea580c',
              roof_rat: '#8b5cf6',
              brown_rat: '#ef4444'
            };
            const labels: Record<RodentSpecies, string> = {
              field_mouse: 'Field Mouse',
              house_mouse: 'House Mouse',
              mastomys_natalensis: 'Mastomys',
              arvicanthis_spp: 'Grass Rat',
              roof_rat: 'Roof Rat',
              brown_rat: 'Brown Rat'
            };
            return (
              <label key={sp} className="flex items-center gap-2 select-none cursor-pointer text-[10px] font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={visibleSpecies[sp]}
                  onChange={(e) => setVisibleSpecies(prev => ({ ...prev, [sp]: e.target.checked }))}
                  className="accent-emerald-600 w-3.5 h-3.5 rounded"
                  style={{ accentColor: colors[sp] }}
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[sp] }} />
                  {labels[sp]}
                </span>
              </label>
            );
          })}
        </div>

        {/* Recharts SVG Box */}
        <div className="h-[240px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartsData} margin={{ top: 12, right: 24, left: -24, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" domain={[0, 100]} label={{ value: 'Survival (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '9px', fill: '#64748b', fontWeight: 'bold' } }} style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const runItem = chartsData.find(d => d.name === label);
                    return (
                      <div className="recharts-custom-tooltip p-3.5 shadow-xl text-[9px] max-w-[280px]">
                        <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1.5 uppercase mb-2 tracking-wider">
                          {runItem ? runItem.fullName : label}
                        </p>
                        <div className="space-y-1">
                          {payload.map((p) => (
                            <div key={p.name} className="flex items-center justify-between gap-6">
                              <span style={{ color: p.color }} className="font-bold">
                                {p.name === 'field_mouse' ? 'Field Mouse' : p.name === 'house_mouse' ? 'House Mouse' : p.name === 'mastomys_natalensis' ? 'Mastomys' : p.name === 'arvicanthis_spp' ? 'Grass Rat' : p.name === 'roof_rat' ? 'Roof Rat' : 'Brown Rat'}
                              </span>
                              <span className="font-extrabold">{p.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {visibleSpecies.field_mouse && <Line type="monotone" dataKey="field_mouse" name="Field Mouse" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
              {visibleSpecies.house_mouse && <Line type="monotone" dataKey="house_mouse" name="House Mouse" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
              {visibleSpecies.mastomys_natalensis && <Line type="monotone" dataKey="mastomys_natalensis" name="Mastomys" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
              {visibleSpecies.arvicanthis_spp && <Line type="monotone" dataKey="arvicanthis_spp" name="Grass Rat" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
              {visibleSpecies.roof_rat && <Line type="monotone" dataKey="roof_rat" name="Roof Rat" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
              {visibleSpecies.brown_rat && <Line type="monotone" dataKey="brown_rat" name="Brown Rat" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr className="border-t border-slate-100 my-1" />

      {/* TITLED HEADING FOR DOWNSTREAM FLUID THERMODYNAMICS */}
      <div className="flex items-center gap-1 mt-2 text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
        <Wind className="w-3.5 h-3.5 text-slate-400" />
        Secondary Fluid Dynamics Telemetry
      </div>

      {/* HIGHLIGHT REGIME BLOCK */}
      <div className={`border-2 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${reBg} border-slate-200`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold font-mono text-xs uppercase tracking-wider text-slate-800">
            <Wind className="w-4 h-4 text-emerald-600" />
            Flow Regime: <span className={reCol}>{calc.flowRegume.toUpperCase()}</span>
          </div>
          <p className="text-[10px] text-slate-500 max-w-sm font-sans leading-relaxed mt-1">
            {calc.flowRegume === 'Laminar' 
              ? 'Air flows in smooth parallel layers (Vectors V1) with minimal lateral mixing. This maximizes pneumatic efficiency and capsule stability.' 
              : calc.flowRegume === 'Transition' 
              ? 'Fluid layers are beginning to wave. Slight eddies form, increasing Darcy friction losses and thermal dissipation.' 
              : 'Flow is highly chaotic with turbulent eddies. High energy loss occurs through friction and wall shear. Viscosity has less influence than momentum.'}
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Reynolds Number</span>
          <span className={`text-2xl font-mono font-bold tracking-tight leading-none mt-1 ${reCol}`}>
            {calc.reynoldsNumber.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase font-semibold">Laminar limit: &lt; 2300</span>
        </div>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3" id="physics-stats-grid">
        
        {/* Air Density */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Density (ρ)</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {calc.density.toFixed(3)} <span className="text-xs font-normal text-slate-500 font-sans">kg/m³</span>
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Avg pressure: {(calc.avgPressure).toFixed(0)} kPa.
          </p>
        </div>

        {/* Viscosity */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Viscosity (μ)</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {(calc.viscosity * 1e6).toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">μPa·s</span>
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Sutherland equation at {specs.temperature}°C.
          </p>
        </div>

        {/* Volumetric Flow Rate */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Discharge (Q)</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {(calc.flowRateVolumetric * 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500 font-sans">L/s</span>
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Volumetric: {(calc.flowRateVolumetric).toFixed(4)} m³/s.
          </p>
        </div>

        {/* Mass Flow Rate */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Mass Flow Rate</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {(calc.flowRateMass * 3600).toFixed(1)} <span className="text-xs font-normal text-slate-500 font-sans">kg/h</span>
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Hourly molecular mass transit in tube.
          </p>
        </div>

        {/* Darcy Friction Factor */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Darcy Friction (f)</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {calc.frictionFactor.toFixed(4)}
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Outer boundary walls resistance.
          </p>
        </div>

        {/* Wall Shear Stress */}
        <div className="p-4 border-2 border-slate-200 rounded-sm bg-slate-50/50 hover:bg-slate-50 transition duration-200">
          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider font-bold">Wall Shear (τ_w)</span>
          <span className="text-base font-bold font-mono text-blue-950 block mt-1">
            {calc.shearStress.toFixed(3)} <span className="text-xs font-normal text-slate-500 font-sans">Pa</span>
          </span>
          <p className="text-[9px] text-slate-400 leading-snug font-mono mt-1.5">
            Viscous scrubbing force inside lining.
          </p>
        </div>
      </div>

      {/* PNEUMATIC CAPSULE SIMULATION TELEMETRY (IF CO-ACTIVE) */}
      {(capsule.position > 0 || capsule.isCompleted) && (
        <div className="border-2 border-slate-200 rounded-sm bg-slate-50/50 p-5 flex flex-col gap-4" id="capsule-simulation-results">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 tracking-wider font-mono">
              <Weight className="w-4 h-4 text-emerald-600" />
              PNEUMATIC CARRIER IN-FLIGHT TELEMETRY
            </div>
            
            <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
              {capsule.isActive ? 'IN TRANSIT' : 'DELIVERED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            {/* Position */}
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">POSITION</span>
              <span className="text-base font-mono font-bold text-slate-800 mt-1">
                {capsule.position.toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">m</span> / {specs.length} m
              </span>
            </div>

            {/* Velocity */}
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">VELOCITY</span>
              <span className="text-base font-mono font-bold text-slate-800 mt-1">
                {capsule.velocity.toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">m/s</span>
              </span>
            </div>

            {/* Elapsed Time */}
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">ELAPSED TIME</span>
              <span className="text-base font-mono font-bold text-slate-800 mt-1">
                {capsule.time.toFixed(3)} <span className="text-xs font-normal text-slate-500 font-sans">sec</span>
              </span>
            </div>

            {/* Kinetic Energy */}
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">ENERGY (E_K)</span>
              <span className="text-base font-mono font-bold text-slate-800 mt-1">
                {kineticEnergy.toFixed(2)} <span className="text-xs font-normal text-slate-500 font-sans">Joules</span>
              </span>
            </div>
          </div>

          {/* Quick flight diagnostics indicator */}
          <div className="border-l-4 border-blue-900 bg-blue-50/20 rounded-sm p-3.5 text-[10px] text-slate-600 leading-relaxed font-sans">
            <strong>Simulation Insights:</strong> This canister is pushed by the air piston differential force: <strong>{((specs.p1 - specs.p2) * ((Math.PI / 4) * Math.pow(specs.diameter/1000, 2)) * 1000 * specs.capsuleClearance).toFixed(1)} N</strong>. Resistance of wall friction: <strong>{(specs.capsuleFriction * (specs.capsuleMass / 1000) * 9.81).toFixed(2)} N</strong>. Drag terminal limit speeds will cap the device at <strong>{calc.maxCapsuleVelocity.toFixed(1)} m/s</strong>.
          </div>
        </div>
      )}

    </div>
  );
};
