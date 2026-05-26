/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, FileText, Download, ShieldCheck, Database, HardDrive, Compass, Info, HeartHandshake, GraduationCap } from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, RodentSpecies } from '../types';

interface SpecsDocumentationProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger';
  onChangeOwepDesign: (val: 'flap_door' | 'flex_finger') => void;
}

export const SpecsDocumentation: React.FC<SpecsDocumentationProps> = ({ 
  specs, 
  calc,
  rodentSpecies,
  owepDesign,
  onChangeOwepDesign
}) => {
  // Simple engineering config download utility
  const handleDownloadConfig = () => {
    const data = {
      spec_title: "ERICON ECOLOGICAL CONDUIT INFRASTRUCTURE COMPLIANCE REPORT",
      timestamp: new Date().toISOString(),
      target_species: rodentSpecies,
      selected_owep_design: owepDesign,
      parameters: specs,
      calculations: {
        reynolds_number: calc.reynoldsNumber,
        average_velocity_ms: calc.velocity,
        air_changes_per_hour: (calc.flowRateVolumetric * 3600) / (Math.PI * Math.pow(specs.diameter / 2000, 2) * specs.length),
        darcy_friction: calc.frictionFactor,
        dynamic_regume: calc.flowRegume,
        pressure_gradient_dp: calc.dp
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Polya6_System_Report_${Math.round(Date.now() / 1000)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm shadow-md p-6 flex flex-col gap-6" id="specs-documentation-section">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4" id="specs-header">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-850" />
          <h2 className="text-xs font-mono font-bold text-emerald-900 tracking-widest uppercase">
            ERICON System Hierarchy & Biological Safe Design Specs
          </h2>
        </div>
        
        <button
          onClick={handleDownloadConfig}
          type="button"
          id="btn-download-json"
          className="px-3 py-1.5 border-2 border-slate-200 hover:border-emerald-850 hover:bg-slate-50 text-slate-700 bg-white rounded-sm text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export System Specs Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="specs-content-grid">
        
        {/* LEFT COLUMN: CONCEPT RENDER AND CAD PROFILE */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Macro-to-Micro Integration Blueprint (16:9 CAD Concept)
          </span>
          
          {/* Framed Image Display */}
          <div className="border-2 border-slate-200 rounded-sm overflow-hidden bg-slate-50 p-2 relative shadow-xs hover:shadow-md transition-shadow">
            <img
              src="/src/assets/images/system_blueprint_1779699602204.png"
              alt="ERAS Subterranean Direct Pressure Transit Core Blueprint Render"
              referrerPolicy="no-referrer"
              className="w-full h-auto aspect-video object-cover rounded-sm shadow-inner"
              id="blueprint-render-img"
            />
            {/* Visual CAD-like HUD overlay */}
            <div className="absolute bottom-4 right-4 bg-emerald-900/95 text-white font-mono text-[7px] px-2.5 py-1 rounded-sm tracking-widest">
              COMPLIANCE STATUS: TOXICANT_FREE_ACTIVE
            </div>
          </div>
          
          <h3 className="text-xs font-mono font-bold text-emerald-900 uppercase">Humane Structural Control Principles</h3>
          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
            Unlike conventional chemical baits causing toxic second-tier mortality cascades safely down the ecological nesting chain (predatory raptors, snakes, family pets), the <strong>Ecological Rodent Interception and Containment Network (ERICON)</strong> aggregate pest species mechanically. It routes capture paths cleanly from perimeter agricultural hedgerow hotspots straight down into spacious, safe subterranean holding modules designed with thermal neutral balances, active airflow turnover, and zero escape potential.
          </p>
        </div>

        {/* RIGHT COLUMN: TECHNICAL SPEC SHEETS (THE ERICON HIERARCHY) */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            ERICON Infrastructure Hierarchy & Component Matrix
          </span>

          <div className="overflow-hidden border-2 border-slate-200 rounded-sm text-xs font-sans" id="materials-table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200 text-[9px] uppercase font-mono font-bold text-slate-500">
                  <th className="p-3 w-1/4">Tier</th>
                  <th className="p-3 w-1/3">Full Naming Nomenclature</th>
                  <th className="p-3">Functional Description & Bio-Relevance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-3 font-bold font-mono text-[10px] text-emerald-700">ERICON</td>
                  <td className="p-3">Ecological Rodent Interception Network</td>
                  <td className="p-3 text-slate-500 text-[10.5px]">Farm perimeter scale networking. Bounds subsurface facility entries during crop sowing and nesting cycles.</td>
                </tr>
                <tr className="bg-slate-50/20">
                  <td className="p-3 font-bold font-mono text-[10px] text-emerald-700">ERAS</td>
                  <td className="p-3">Ecological Rodent Archive System</td>
                  <td className="p-3 text-slate-500 text-[10.5px]">Subterranean high-volume conduits. Integrating smooth <strong>Polyamide-6 ETT</strong> (Ecological Transfer Tunnels) & <strong>CRT</strong> (Corner Rodent Tunnels).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold font-mono text-[10px] text-emerald-700">EMA</td>
                  <td className="p-3">Ecological Rodent Archive Module</td>
                  <td className="p-3 text-slate-500 text-[10.5px]">Terminal soil-level insulated containment chambers. Strategically aggregates captures safely for biometric tracking and release.</td>
                </tr>
                <tr className="bg-slate-50/20">
                  <td className="p-3 font-bold font-mono text-[10px] text-blue-700">OWEP</td>
                  <td className="p-3">One-Way Entry Port</td>
                  <td className="p-3 text-slate-500 text-[10.5px]">Bio-optimized entries that let mammals step inward easily, but interlock physically to support 0% egress (escape).</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* OWEP INLET OPTIONS INTERACTIVE COMPONENT DETAILS */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              One-Way Entry Port (OWEP) Mechanical Sub-options
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="station-specs-grid">
              
              <button 
                type="button" 
                onClick={() => onChangeOwepDesign('flap_door')}
                className={`p-4 rounded-sm text-left transition select-none ${
                  owepDesign === 'flap_door' 
                    ? 'bg-emerald-50/35 border-2 border-emerald-500' 
                    : 'bg-slate-50 border-2 border-slate-200 hover:border-emerald-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase block tracking-wider">
                    Design Option A (Flap)
                  </span>
                  {owepDesign === 'flap_door' && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 py-0.5 rounded-sm">Active</span>}
                </div>
                <h4 className="text-xs font-bold font-sans mt-2">Gravity-Fed Flap Gate</h4>
                <p className="text-[10px] text-slate-600 font-sans mt-1.5 leading-relaxed">
                  Lightweight precision vertical hinge (under 0.5N force required). Features a rigid bottom <strong>Stopper Ridge</strong> that blocks claw retrograde manipulation, preventing egress.
                </p>
              </button>
              
              <button 
                type="button"
                onClick={() => onChangeOwepDesign('flex_finger')}
                className={`p-4 rounded-sm text-left transition select-none ${
                  owepDesign === 'flex_finger' 
                    ? 'bg-emerald-50/35 border-2 border-emerald-500' 
                    : 'bg-slate-50 border-2 border-slate-200 hover:border-emerald-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-900 uppercase block tracking-wider">
                    Design Option B (Fingers)
                  </span>
                  {owepDesign === 'flex_finger' && <span className="text-[8px] bg-indigo-100 text-indigo-800 font-bold px-1 py-0.5 rounded-sm">Active</span>}
                </div>
                <h4 className="text-xs font-bold font-sans mt-2">Radial Flex-Finger Funnel</h4>
                <p className="text-[10px] text-slate-600 font-sans mt-1.5 leading-relaxed">
                  Blunt-tipped flexible radial needles arranged in a tapered loose funnel. Flexes outward comfortably for entry, but compresses and interlocks firmly when backpressure or egress is attempted.
                </p>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* SCIENTIFIC ADVISORY & RESEARCH COMPLIANCE CREDITS */}
      <div className="mt-2 pt-6 border-t border-slate-200" id="scientific-credits">
        <div className="bg-gradient-to-br from-emerald-50/40 to-slate-50 border-2 border-emerald-600/30 rounded-xs p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="bg-emerald-600 text-white rounded-md p-3 flex-shrink-0 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5 text-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold text-emerald-950 uppercase tracking-widest block">
                Principal Scientific Contributor & Coordinator
              </span>
              <span className="text-[8px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider w-max">
                Research Compliance
              </span>
            </div>
            
            <h3 className="text-sm font-bold font-mono text-emerald-900 leading-tight">
              Joshua Reuben Jakoniko
            </h3>
            
            <div className="text-[10px] font-sans leading-relaxed text-slate-600 flex flex-col gap-1">
              <p>
                🎓 <strong>MSc Public Health Pest Management</strong> &amp; <strong>BSc Wildlife Management</strong> — Sokoine University of Agriculture
              </p>
              <p>
                📜 <strong>Diploma in Animal Health and Production</strong> — LITA Campus of MADABA
              </p>
              <p className="mt-1 pl-3 border-l-2 border-emerald-500 italic text-slate-500 font-medium">
                Research field expertise: Rodent Ecology and Rodent-borne Zoonotic Diseases. ERICON's non-toxic physical gates, micro-ventilation systems, and dynamic transport metrics comply with modern subterranean ecological containment protocols to avoid trophic-level mortality cascades.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
