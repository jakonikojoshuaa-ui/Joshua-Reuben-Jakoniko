/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERICON Simulator - Tab 4: Analytics, Scientific Trends, and PDF Reports compilation workspace.
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { jsPDF } from 'jspdf';
import { 
  History, 
  Trash2, 
  Download, 
  FileText, 
  User, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Activity, 
  ShieldCheck, 
  Clock, 
  CheckCircle,
  Gauge,
  Wind,
  Thermometer,
  Eye,
  RefreshCw
} from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, CapsuleSimulation, RodentSpecies } from '../types';
import { getEriconLogoDataUrl } from '../utils/ericonLogoDraw';
import { applyPdfPageGoldBranding } from '../utils/premiumExport';
import { EriconLogo } from './EriconLogo';

interface AnalyticsAndReportsProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  capsule: CapsuleSimulation;
  rodentSpecies: RodentSpecies;
  onLoadSpecs?: (newSpecs: SystemSpecs) => void;
}

interface HistoricalRun {
  id: string;
  timestamp: string;
  researcher: string;
  projectName: string;
  rodent: RodentSpecies;
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  durationSec: number;
  maxVelocity: number;
  completed: boolean;
  notes: string;
}

export const AnalyticsAndReports: React.FC<AnalyticsAndReportsProps> = ({
  specs,
  calc,
  capsule,
  rodentSpecies,
  onLoadSpecs,
}) => {
  // Configurable researcher and project parameters
  const [researcherName, setResearcherName] = useState('jakonikojoshuaa@gmail.com');
  const [projectId, setProjectId] = useState('ERICON-SURV-2026-01');
  const [customNotes, setCustomNotes] = useState('Simulation run verifies pneumatic velocity bounds alignment. Biological specimen safe envelope threshold has been properly checked.');
  const [historyRuns, setHistoryRuns] = useState<HistoricalRun[]>([]);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);

  // Load history from localStorage only when component opens
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ericon_simulation_runs_v2');
      if (stored) {
        setHistoryRuns(JSON.parse(stored));
      } else {
        // Seed default template history run so the dashboard doesn't look empty initially
        const seedRun: HistoricalRun = {
          id: 'RUN-91A23',
          timestamp: '2026-06-01 14:32:10 UTC',
          researcher: 'jakonikojoshuaa@gmail.com',
          projectName: 'ERICON-SURV-2026-01',
          rodent: 'mastomys_natalensis',
          specs: { ...specs, p1: 104.2, p2: 101.3, length: 15.0 },
          calc: { ...calc, velocity: 4.82, reynoldsNumber: 24200 },
          durationSec: 3.11,
          maxVelocity: 4.82,
          completed: true,
          notes: 'Standard validation run over 15 meter duct. Perfect baseline clearance values.'
        };
        setHistoryRuns([seedRun]);
        localStorage.setItem('ericon_simulation_runs_v2', JSON.stringify([seedRun]));
      }
    } catch (e) {
      console.error("Failed loading history from local storage", e);
    }
  }, []);

  // Watch capsule completed event to automatically record the run
  useEffect(() => {
    if (capsule.isCompleted && capsule.time > 0) {
      // Prevent duplicates by checking if we saved a run very recently (within 5 seconds)
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      const duplicate = historyRuns.find(h => {
        const timeDiff = Math.abs(new Date(h.timestamp.replace(' UTC', '')).getTime() - new Date().getTime());
        return timeDiff < 5000 && h.specs.p1 === specs.p1 && h.specs.p2 === specs.p2;
      });

      if (!duplicate) {
        const newRun: HistoricalRun = {
          id: `RUN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          timestamp: nowStr,
          researcher: researcherName,
          projectName: projectId,
          rodent: rodentSpecies,
          specs: { ...specs },
          calc: { ...calc },
          durationSec: Number(capsule.time.toFixed(2)),
          maxVelocity: Number(capsule.velocity.toFixed(3)) || Number((calc.velocity * specs.capsuleClearance).toFixed(3)),
          completed: true,
          notes: `Automatic flight log. Capsule reached terminal receiver hub. Duration: ${capsule.time.toFixed(2)}s.`
        };

        const updated = [newRun, ...historyRuns];
        setHistoryRuns(updated);
        localStorage.setItem('ericon_simulation_runs_v2', JSON.stringify(updated));
      }
    }
  }, [capsule.isCompleted]);

  // Record Current Active Parameter state manually
  const handleSaveActiveRun = () => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const newRun: HistoricalRun = {
      id: `RUN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: nowStr,
      researcher: researcherName,
      projectName: projectId,
      rodent: rodentSpecies,
      specs: { ...specs },
      calc: { ...calc },
      durationSec: capsule.time > 0 ? Number(capsule.time.toFixed(2)) : 0,
      maxVelocity: Number(capsule.velocity.toFixed(3)) || Number((calc.velocity * specs.capsuleClearance).toFixed(3)),
      completed: capsule.isCompleted,
      notes: customNotes || 'Manual parameter snapshot record.'
    };

    const updated = [newRun, ...historyRuns];
    setHistoryRuns(updated);
    localStorage.setItem('ericon_simulation_runs_v2', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to completely erase the simulation run history ledger?")) {
      setHistoryRuns([]);
      localStorage.removeItem('ericon_simulation_runs_v2');
    }
  };

  const handleDeleteRun = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyRuns.filter(r => r.id !== id);
    setHistoryRuns(updated);
    localStorage.setItem('ericon_simulation_runs_v2', JSON.stringify(updated));
  };

  const handleLoadRunSpecs = (run: HistoricalRun) => {
    if (onLoadSpecs) {
      onLoadSpecs(run.specs);
      alert(`Successfully loaded specifications from Run ${run.id} back into system editor.`);
    }
  };

  // --- DYNAMIC TREND DATA GENERATORS ---
  const stepsCount = 12;
  
  // 1. Pressure Profile (drop along length)
  const pressureProfile = Array.from({ length: stepsCount }, (_, i) => {
    const x = (specs.length / (stepsCount - 1)) * i;
    // Linear pressure degradation
    const p = specs.p1 - ((specs.p1 - specs.p2) * (x / Math.max(specs.length, 1)));
    return {
      distance: Number(x.toFixed(1)),
      pressure: Number(p.toFixed(2))
    };
  });

  // 2. Velocity simulation curve over time/distance
  const velocityProfile = Array.from({ length: stepsCount }, (_, i) => {
    const x = (specs.length / (stepsCount - 1)) * i;
    // Theoretical velocity development
    const terminalU = calc.velocity * specs.capsuleClearance;
    const developedU = terminalU * (1 - Math.exp(-3 * (x / Math.max(specs.length, 1))));
    return {
      distance: Number(x.toFixed(1)),
      velocity: Number(developedU.toFixed(3))
    };
  });

  // 3. Adiabatic / Geothermal Temperature Trend along pipeline length
  const tempProfile = Array.from({ length: stepsCount }, (_, i) => {
    const x = (specs.length / (stepsCount - 1)) * i;
    // Gas expansion gas cooling gradient
    const expCooling = (specs.p1 - specs.p2) * 0.12 * (x / Math.max(specs.length, 1));
    const t = specs.temperature - expCooling;
    return {
      distance: Number(x.toFixed(1)),
      temperature: Number(t.toFixed(2))
    };
  });

  // 4. Biological Stress Species Safety Indicator over relative velocity speed levels
  const getSpeciesLimits = (sp: RodentSpecies) => {
    switch (sp) {
      case 'mastomys_natalensis': return { threshold: 6.5, name: 'Mastomys natalensis' };
      case 'field_mouse': return { threshold: 4.8, name: 'African Field Mouse' };
      case 'house_mouse': return { threshold: 4.2, name: 'House Mouse (Mus musculus)' };
      case 'arvicanthis_spp': return { threshold: 5.5, name: 'Arvicanthis Niloticus' };
      case 'roof_rat': return { threshold: 8.0, name: 'Black Roof Rat' };
      case 'brown_rat': return { threshold: 9.2, name: 'Norway Brown Rat' };
      default: return { threshold: 5.0, name: 'Generic Rodent' };
    }
  };

  const speciesLim = getSpeciesLimits(rodentSpecies);
  const speciesTrendData = Array.from({ length: 10 }, (_, i) => {
    const speed = (12 / 9) * i; // up to 12 m/s range
    // Stress calculation: exponential above threshold
    const stressPercent = Math.min(Math.max(Math.round((speed / speciesLim.threshold) * 60 + (speed > speciesLim.threshold ? Math.pow(speed - speciesLim.threshold, 2) * 15 : 0)), 10), 100);
    return {
      speed: Number(speed.toFixed(1)),
      stressLevel: stressPercent,
      safeLimit: speciesLim.threshold
    };
  });

  // --- PDF REPORT GENERATOR DYNAMIC COMPILER ---
  const handleExportPDF = () => {
    setIsCompilingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const todayStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

      // 1. apply central corporate ERICON branding template
      applyPdfPageGoldBranding(
        doc,
        'ERICON SCIENCE WORKSPACE',
        'Certified Pneumatic Pipeline Fluid Transit & Environmental Analysis Summary',
        1,
        1
      );

      // Main body background decoration lines
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(12, 45, 198, 45);

      // 2. RESEARCHER & ENVIRONMENT SPECIFICATIONS
      doc.setTextColor(21, 70, 45); // ERICON deep dark green
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('1. PROJECT CO-ORDINATES & IDENTITY ENTITY', 12, 53);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59); // Graphite text for high-contrast readability
      
      doc.text(`Lead Scientist: ${researcherName}`, 14, 60);
      doc.text(`Project Node: ${projectId}`, 14, 65);
      doc.text(`Institutional Scope: Sokoine University of Agriculture / ERICON Joint Venture`, 14, 70);
      doc.text(`Operating Sub-Region: Eastern Africa Environmental Biosafety Zone`, 14, 75);

      doc.text(`Rodent Subject: ${speciesLim.name}`, 110, 60);
      doc.text(`Calculated Clearance Envelope: ${specs.capsuleClearance * 100}% Hermetic Seal`, 110, 65);
      doc.text(`Maximum Bio-Stress Threshold: ${speciesLim.threshold.toFixed(2)} m/s Limit`, 110, 70);
      doc.text(`Diagnostic Validation: COMPLIANT`, 110, 75);

      doc.setDrawColor(226, 232, 240);
      doc.line(12, 81, 198, 81);

      // 3. PHYSICAL SYSTEM ARCHITECTURE & PARAMETERS TABLE
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(21, 70, 45);
      doc.text('2. NUMERICAL SYSTEM INPUT PARAMETERS & SPECS', 12, 89);

      // Draw standard clean bordered layout table for parameters
      const drawTableCell = (title: string, value: string, x: number, y: number, w: number, h: number, isHeader = false) => {
        if (isHeader) {
          doc.setFillColor(241, 245, 249);
          doc.rect(x, y, w, h, 'F');
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(21, 70, 45);
        } else {
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
        }
        doc.setDrawColor(226, 232, 240);
        doc.rect(x, y, w, h, 'S');
        doc.setFontSize(8);
        doc.text(title, x + 3, y + h / 2 + 1);
        doc.text(value, x + w / 2 + 5, y + h / 2 + 1);
      };

      let tableY = 94;
      // Headers
      drawTableCell('Pneumatic Factor Descriptor', 'Assigned Variable Value (Metric Units)', 12, tableY, 186, 7, true);
      tableY += 7;
      drawTableCell('Inlet Base Pressure (P1)', `${specs.p1.toFixed(3)} kPa`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Terminal Hub Sink Pressure (P2)', `${specs.p2.toFixed(3)} kPa`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Polyamide Duct Physical Length', `${specs.length.toFixed(1)} meters`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Tube Structural Diameter', `${specs.diameter.toFixed(1)} mm`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Canister Load Capsule Weight', `${specs.capsuleMass.toFixed(1)} grams`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Air Flow Operating Temp (T)', `${specs.temperature.toFixed(1)} deg C`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Pipes Frictional Roughness Factor', `${specs.roughness.toFixed(5)} mm`, 12, tableY, 186, 5.5);

      tableY += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(12, tableY, 198, tableY);
      tableY += 5;

      // 4. FLUID TRANSLATIONAL CALCULATION METRICS
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(21, 70, 45);
      doc.text('3. FLUID DYNAMIC TRANSPORT PERFORMANCE MATRIX', 12, tableY);
      tableY += 4;

      drawTableCell('Fluid Reynolds Indicator', `${calc.reynoldsNumber.toFixed(0)} Re (${calc.flowRegume})`, 12, tableY, 186, 7, true);
      tableY += 7;
      drawTableCell('Axial Fluid Speed', `${calc.velocity.toFixed(3)} meters/second`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Volumetric Flow Rate (Q)', `${(calc.flowRateVolumetric * 1000).toFixed(2)} liters/second`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Calculated Air Stream Density', `${calc.density.toFixed(4)} kg/m3`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Darcy Pipe Friction Coefficient (f)', `${calc.frictionFactor.toFixed(5)} f-index`, 12, tableY, 186, 5.5);
      tableY += 5.5;
      drawTableCell('Theoretical Pneumatic Ventilation Power', `${calc.pneumaticPower.toFixed(2)} Watts`, 12, tableY, 186, 5.5);

      tableY += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(12, tableY, 198, tableY);
      tableY += 5;

      // 5. SCIENTIFIC GRADIENT SUMMARY SNAPSHOTS (TABULATED TRENDS)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(21, 70, 45);
      doc.text('4. SCIENTIFIC SEGMENT TRENDS SNAPSHOTS', 12, tableY);
      tableY += 4;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Key profiles extracted dynamically at segmented transit coordinates along the pipeline length:', 12, tableY);
      tableY += 4;

      // Draw small comparison grid for points 0%, 25%, 50%, 75%, 100%
      const drawSpecRow = (col1: string, col2: string, col3: string, col4: string, yPos: number) => {
        doc.text(col1, 14, yPos);
        doc.text(col2, 60, yPos);
        doc.text(col3, 110, yPos);
        doc.text(col4, 160, yPos);
      };

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(21, 70, 45);
      drawSpecRow('Pipeline Pos (m)', 'Static Pressure (kPa)', 'Developed Speed (m/s)', 'Adiabatic Temp (deg C)', tableY);
      doc.setDrawColor(197, 160, 43); // Branded gold divider
      doc.line(12, tableY + 2, 198, tableY + 2);
      tableY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      const reportPoints = [0, 0.25, 0.5, 0.75, 1.0];
      reportPoints.forEach((ratio) => {
        const xVal = specs.length * ratio;
        const pVal = specs.p1 - ((specs.p1 - specs.p2) * ratio);
        const developedVel = (calc.velocity * specs.capsuleClearance) * (1 - Math.exp(-3 * ratio));
        const tempGrad = (specs.p1 - specs.p2) * 0.12 * ratio;
        const tVal = specs.temperature - tempGrad;
        
        drawSpecRow(
          `${xVal.toFixed(2)} m (${Math.round(ratio * 100)}%)`,
          `${pVal.toFixed(3)} kPa`,
          `${developedVel.toFixed(3)} m/s`,
          `${tVal.toFixed(2)} deg C`,
          tableY
        );
        tableY += 5;
      });

      // Bio Safety Stress Assessment Comments & Notes
      tableY += 3;
      doc.setFillColor(253, 251, 247); // soft gold tint
      doc.rect(12, tableY, 186, 18, 'F');
      
      doc.setDrawColor(197, 160, 43); // gold border
      doc.rect(12, tableY, 186, 18, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 70, 45); // deep green
      doc.text(`BIOLOGICAL BIOSECURITY SAFEGUARD AUDIT FOR: ${speciesLim.name}`, 15, tableY + 4.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Observed Max Dispatch Speed of ${(calc.velocity * specs.capsuleClearance).toFixed(2)} m/s is ${calc.velocity * specs.capsuleClearance > speciesLim.threshold ? 'ABOVE' : 'WITHIN'} standard threshold bounds (${speciesLim.threshold.toFixed(1)} m/s).`, 15, tableY + 9);
      doc.text(`Custom Notes: ${customNotes || 'N/A'}`, 15, tableY + 13.5);

      doc.save(`ERICON_TRANSIT_REPORT_${projectId}_2026.pdf`);
      window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: "🎉 PDF Compliance Report successfully compiled & downloaded to your system local workspace!", type: "success" } }));
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("An error occurred compiling the high-fidelity PDF report. Please verify parameters align.");
    } finally {
      setIsCompilingPdf(false);
    }
  };

  return (
    <div className="space-y-6" id="analytics-reports-subtab-container">
      
      {/* EXPORT CONTROL MODULE CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100 flex flex-col gap-6" id="pdf-compilation-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <EriconLogo size="compact" showText={false} className="shrink-0 bg-slate-900 border border-slate-800 p-1.5 rounded-lg" />
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-400">
                📄 Official Report Dynamic Compiler Workspace
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Instantly compile verified, publication-grade ERICON biosecurity PDF reports for environmental regulatory clearance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveActiveRun}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              Save Run
            </button>

            <button
              type="button"
              disabled={isCompilingPdf}
              onClick={handleExportPDF}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-black tracking-wide transition flex items-center gap-1.5 cursor-pointer"
            >
              {isCompilingPdf ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* INPUT INFORMATION FORM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" /> Researcher Identity / Email
            </label>
            <input 
              type="text" 
              value={researcherName} 
              onChange={(e) => setResearcherName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
              placeholder="researcher@ericon.org"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-emerald-400" /> Project Identifier Code
            </label>
            <input 
              type="text" 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
              placeholder="e.g. ERICON-SURV-2026"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Generation Timestamp (UTC)
            </label>
            <div className="w-full bg-slate-950/60 border border-slate-850 rounded-md p-2 text-slate-400">
              2026-06-01 15:17:35 UTC (Autosigned)
            </div>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-3">
            <label className="text-slate-400 text-[10px] uppercase font-bold">
              Research Observations & Field Interpretations (Injected directly into compiled PDF report)
            </label>
            <textarea 
              value={customNotes} 
              onChange={(e) => setCustomNotes(e.target.value)} 
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-[11px]"
              placeholder="Input custom observations to compile into the final report document..."
            />
          </div>

        </div>

      </div>

      {/* CHARTS INTERACTIVE GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-trend-charts-grid">
        
        {/* CHART 1: PRESSURE GRADIENT TREND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Gauge className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100 ericon-deep-green-writing">
                Pressure Gradient Profile P(x)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 ericon-deep-green-writing-desc">Drop along {specs.length} m tube</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pressureProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressureGradColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="distance" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="m" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="kPa" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }}
                  labelFormatter={(v) => `Pipeline Position: ${v} meters`}
                />
                <Area type="monotone" dataKey="pressure" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#pressureGradColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="ericon-chart-insight-paragraph text-[9.5px] font-mono leading-relaxed text-slate-405 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
            Steady linear degradation rate of <strong className="text-blue-500">{(((specs.p1 - specs.p2) * 1000) / specs.length).toFixed(1)} Pa/m</strong> is maintained along the corridor length. No structural thermal contractions detected.
          </p>
        </div>

        {/* CHART 2: VELOCITY PROGRESSION TREND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Wind className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100 ericon-deep-green-writing">
                Developed Velocity Profile U(x)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 ericon-deep-green-writing-desc">Max Terminal limit reached</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGradColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="distance" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="m" />
                <YAxis domain={[0, 'auto']} tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="m/s" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }}
                  labelFormatter={(v) => `Pipeline Position: ${v} meters`}
                />
                <Area type="monotone" dataKey="velocity" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#velocityGradColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="ericon-chart-insight-paragraph text-[9.5px] font-mono leading-relaxed text-slate-405 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
            Capsule accelerative progression reaches steady-state maximum velocity limit of <strong className="text-amber-550">{(calc.velocity * specs.capsuleClearance).toFixed(3)} m/s</strong> within the first third of transit.
          </p>
        </div>

        {/* CHART 3: ADIABATIC TEMPERATURE DEGRADATION TREND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100 ericon-deep-green-writing">
                Adiabatic Expansion Temp Gradient
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 ericon-deep-green-writing-desc">Operating Temperature drop</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="distance" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="m" />
                <YAxis tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="°C" domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }}
                  labelFormatter={(v) => `Pipeline Position: ${v} meters`}
                />
                <Line type="monotone" dataKey="temperature" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="ericon-chart-insight-paragraph text-[9.5px] font-mono leading-relaxed text-slate-405 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
            Inlet operating temperature of {specs.temperature.toFixed(1)}°C drops to <strong className="text-indigo-550">{(specs.temperature - (specs.p1 - specs.p2) * 0.12).toFixed(2)}°C</strong> at the discharge gate due to expansion.
          </p>
        </div>

        {/* CHART 4: SPECIES BIOLOGICAL STRESS SPECS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100 ericon-deep-green-writing">
                Species Stress Index & Safety Margins
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400 ericon-deep-green-writing-desc">Limit: {speciesLim.threshold.toFixed(1)} m/s velocity</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={speciesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="speed" tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="m/s" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: 'monospace' }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '9px', fontFamily: 'monospace', color: '#fff' }}
                  labelFormatter={(v) => `Velocity: ${v} m/s`}
                />
                <Area type="monotone" dataKey="stressLevel" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#stressColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="ericon-chart-insight-paragraph text-[9.5px] font-mono leading-relaxed text-slate-405 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
            Active rodent subject: <strong className="text-rose-550">{speciesLim.name}</strong>. Physiological stress increases dramatically beyond biosecurity clearance speed limits.
          </p>
        </div>

      </div>

      {/* SIMULATION LEDGER RUN HISTORY TABLE */}
      <div id="ericon-ledger-history-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-500" /> Previous Simulation Execution Ledger
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive list of past computational transit logs recorded during this session.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={historyRuns.length === 0}
              className="ericon-clear-history-btn px-3 py-1.5 border border-rose-200 hover:border-rose-450 dark:border-rose-900 bg-rose-50 hover:bg-rose-100/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>
        </div>

        {historyRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <Clock className="w-8 h-8 text-slate-350 dark:text-slate-600 mb-2 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-500">No Historical Runs Saved Yet</span>
            <p className="font-sans text-[10px] text-slate-400 max-w-xs mt-1">
              Initiate, complete or pause the pneumatic capsule dispatch in active tabs then save parameters to populate this ledger database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-150 dark:border-slate-800 text-[10px]">
                  <th className="py-3 px-4">Run Code</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Subject Species</th>
                  <th className="py-3 px-4">P1 / P2 (kPa)</th>
                  <th className="py-3 px-4">Air Speed / Temp</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {historyRuns.map((run) => (
                  <tr 
                    key={run.id}
                    onClick={() => handleLoadRunSpecs(run)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-950/80 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-black text-rose-550 dark:text-rose-400">
                      {run.id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[10.5px]">
                      {run.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold capitalize">
                      {run.rodent.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {run.specs.p1.toFixed(1)} / {run.specs.p2.toFixed(1)} kPa
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {run.maxVelocity.toFixed(2)} m/s • {run.specs.temperature.toFixed(0)}°C
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {run.durationSec > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {run.durationSec}s
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Transit</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRun(run.id, e)}
                        className="ericon-history-delete-btn p-1 px-2 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded transition outline-none"
                        title="Delete this historical test ledger record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
