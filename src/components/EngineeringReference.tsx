/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERICON Simulator - Tab 7: Comprehensive Engineering Reference & Knowledge Library.
 * Consolidates architectural models, mechanical ports, formulas, assumptions, and calibrations.
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Settings, 
  FileText, 
  Download, 
  ShieldCheck, 
  Compass, 
  Info, 
  Send, 
  MessageSquare,
  Newspaper,
  CheckCircle2,
  ListRestart,
  Activity,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, RodentSpecies } from '../types';

interface EngineeringReferenceProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
  onChangeOwepDesign: (val: 'flap_door' | 'flex_finger' | 'hybrid') => void;
}

export const EngineeringReference: React.FC<EngineeringReferenceProps> = ({ 
  specs, 
  calc,
  rodentSpecies,
  owepDesign,
  onChangeOwepDesign
}) => {
  // Nested Navigator Tab inside reference library
  const [activeSubTab, setActiveSubTab] = useState<'owep' | 'formulas' | 'assumptions' | 'registry' | 'broadcasts'>('owep');

  // Accordion states for Technical and Biosecurity field notes
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({
    construction: false,
    biosecurity: false,
  });

  // Shared state with Developer Console via localStorage
  const [newsList, setNewsList] = useState<Array<{
    id: string;
    title: string;
    body: string;
    date: string;
    status: 'active' | 'archived';
  }>>(() => {
    try {
      const stored = localStorage.getItem('ericon_system_broadcasts_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'ann-init',
        title: '🚨 CRITICAL MODEL PROTECTED BY ERICON GOVERNANCE FRAMEWORK',
        body: 'Regulatory Protocol: Under ERICON governance, the Ecological Rodent Archive (ERA) system, including the Biological and Physiological Life-Support Simulation Models for Artificial Rodent Underground Archives (ARUA), operates under standardized Scientific Integrity Protection protocols. Access to dynamic model modifications or exception requests is restricted to accredited researchers through authenticated and verified credentialing gateways.',
        date: '2026-05-27',
        status: 'active'
      },
      {
        id: 'news-offline',
        title: '🔌 OFFLINE DATA SYNC VIA INDEXEDDB RELEASED',
        body: 'Technical Milestone: Standard researchers and field technicians operating off-grid can now capture rodent and agricultural specimens completely offline. Unsynced observations are held in a secure local browser queue (IndexedDB) and can be synced back to central archives once internet service is recovered.',
        date: '2026-05-28',
        status: 'active'
      },
      {
        id: 'news-integrity',
        title: '🛡️ DISASTER RECOVERY & DISASTER SCHEMA BACKUPS ENABLED',
        body: 'System Stability update: Added full manual JSON backup compilation and disaster recovery restore tools. Science administrators can now export compliance schema envelopes containing active study boundaries and rewrite sandbox datasets under emergency override clearances.',
        date: '2026-05-28',
        status: 'active'
      }
    ];
  });

  // Sync news updates from state to localStorage
  useEffect(() => {
    localStorage.setItem('ericon_system_broadcasts_v2', JSON.stringify(newsList));
  }, [newsList]);

  // Real-time synchronization
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('ericon_system_broadcasts_v2');
        if (stored) setNewsList(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Form states and alerts
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);

  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const isNewsFresh = (dateString: string) => {
    try {
      const pubTime = new Date(dateString).getTime();
      const currentLocalTime = new Date("2026-06-02T15:00:00Z").getTime();
      const diffMs = currentLocalTime - pubTime;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 6;
    } catch {
      return false;
    }
  };

  const handlePostNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftBody.trim()) return;

    const newBroadcast = {
      id: `news-${Date.now()}`,
      title: draftTitle.trim(),
      body: draftBody.trim(),
      date: "2026-06-02",
      status: 'active' as const
    };

    const updated = [newBroadcast, ...newsList];
    setNewsList(updated);
    localStorage.setItem('ericon_system_broadcasts_v2', JSON.stringify(updated));
    localStorage.setItem('ericon_admin_is_logged_in', 'true');
    
    setDraftTitle('');
    setDraftBody('');
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3500);
  };

  const handlePostFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const newTicket = {
      id: `ticket-${Date.now()}`,
      name: feedbackName || "Guest Reviewer",
      email: feedbackEmail || "anonymous@ericon.org",
      type: feedbackType,
      message: feedbackText.trim(),
      date: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem('ericon_feedback_tickets') || '[]';
      const parsed = JSON.parse(existing);
      parsed.push(newTicket);
      localStorage.setItem('ericon_feedback_tickets', JSON.stringify(parsed));
    } catch {}

    setFeedbackName('');
    setFeedbackEmail('');
    setFeedbackText('');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3500);
  };

  const handleDownloadSpecs = () => {
    const data = {
      spec_title: "ERICON PIPELINE CO-DEVELOPMENT REFERENCE RECORD",
      timestamp: new Date().toISOString(),
      active_target_rodent: rodentSpecies,
      selected_owep_design: owepDesign,
      parameters: specs,
      calculations: {
        reynolds_number: calc.reynoldsNumber,
        average_velocity_ms: calc.velocity,
        air_density_kg_m3: calc.density,
        sutherland_viscosity_pa_s: calc.viscosity,
        friction_factor: calc.frictionFactor,
        dynamic_regume: calc.flowRegume,
        wall_shear_stress_pa: calc.shearStress,
        pneumatic_mechanical_power_w: calc.pneumaticPower,
        theoretical_terminal_capsule_velocity_ms: calc.maxCapsuleVelocity
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ERICON_Engineering_Report_${Math.round(Date.now() / 1000)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100" id="engineering-reference-container">
      
      {/* KNOWLEDGE LIBRARY BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-850 text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              ERICON Conduit Engineering Reference Library
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Standard operating math frameworks, OWEP mechanical details, and compliance audit parameters.
            </p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleDownloadSpecs}
          className="px-3.5 py-1.5 border border-slate-800 hover:border-emerald-500 hover:bg-slate-950 text-slate-350 hover:text-emerald-400 bg-slate-900 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-2 duration-150 cursor-pointer w-max self-start lg:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export System State JSON
        </button>
      </div>

      {/* COMPONENT SUB-TABS SELECTOR */}
      <div className="flex flex-wrap bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-[10px] font-mono uppercase font-black text-slate-600 gap-1.5 shadow-3xs max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('owep')}
          className={`p-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeSubTab === 'owep' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'}`}
        >
          🔒 OWEP Designs
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('formulas')}
          className={`p-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeSubTab === 'formulas' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'}`}
        >
          📐 Formula Library
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('assumptions')}
          className={`p-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeSubTab === 'assumptions' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'}`}
        >
          🧬 Assumptions &amp; Calibrations
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('registry')}
          className={`p-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeSubTab === 'registry' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'}`}
        >
          ℹ️ System Spec Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('broadcasts')}
          className={`p-2 px-3.5 rounded-lg transition-all cursor-pointer ${activeSubTab === 'broadcasts' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-500'}`}
        >
          📻 Technical Bulletins ({newsList.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* SUBTAB 1 - OWEP DESIGNS DISPLAY */}
        {activeSubTab === 'owep' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4">
              <div>
                <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-100">
                  One-Way Entry Port (OWEP) Mechanical Sub-options
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Active mechanical gates built to capture mammals efficiently while denying backward movement (0% egress rates).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="owep-designs-grid">
                
                {/* Flap Gate Card */}
                <button 
                  type="button" 
                  onClick={() => onChangeOwepDesign('flap_door')}
                  className={`p-4 rounded-xl text-left transition duration-150 select-none cursor-pointer flex flex-col justify-between h-48 border ${
                    owepDesign === 'flap_door' 
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500 text-emerald-950 dark:text-emerald-400 ring-2 ring-emerald-500/10' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block tracking-wider">
                        Design OPTION A (Gate)
                      </span>
                      {owepDesign === 'flap_door' && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">Selected</span>}
                    </div>
                    <h5 className="text-xs font-bold font-sans">Gravity-Fed Flap Gate</h5>
                    <p className="text-[9.5px] text-slate-505 dark:text-slate-400 font-sans leading-relaxed">
                      Lightweight vertical aluminum composite hinge demanding under 0.5N force to pass. Incorporates a rigid floor <strong className="font-semibold text-slate-700 dark:text-slate-300">Stopper Ridge</strong> preventing claw retrograde overrides.
                    </p>
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-400 uppercase mt-4">Structural integrity: High</span>
                </button>
                
                {/* Flex Finger Card */}
                <button 
                  type="button"
                  onClick={() => onChangeOwepDesign('flex_finger')}
                  className={`p-4 rounded-xl text-left transition duration-150 select-none cursor-pointer flex flex-col justify-between h-48 border ${
                    owepDesign === 'flex_finger' 
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500 text-emerald-950 dark:text-emerald-400 ring-2 ring-emerald-500/10' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block tracking-wider">
                        Design OPTION B (Finger)
                      </span>
                      {owepDesign === 'flex_finger' && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">Selected</span>}
                    </div>
                    <h5 className="text-xs font-bold font-sans">Radial Flex-Finger Funnel</h5>
                    <p className="text-[9.5px] text-slate-505 dark:text-slate-400 font-sans leading-relaxed">
                      Blunt-tipped flexible radial needles arranged in a tapered cone. Displaces outward under minor head-shove pressure. Mechanically interlocks and tightens if backpressure or retrograde climbing is attempted.
                    </p>
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-400 uppercase mt-4">Retrograde Lock: Extreme</span>
                </button>
                
                {/* Hybrid Gate Card */}
                <button 
                  type="button"
                  onClick={() => onChangeOwepDesign('hybrid')}
                  className={`p-4 rounded-xl text-left transition duration-150 select-none cursor-pointer flex flex-col justify-between h-48 border ${
                    owepDesign === 'hybrid' 
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/15 border-emerald-500 text-emerald-950 dark:text-emerald-400 ring-2 ring-emerald-500/10' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase block tracking-wider">
                        Design OPTION C (Hybrid)
                      </span>
                      {owepDesign === 'hybrid' && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">Selected</span>}
                    </div>
                    <h5 className="text-xs font-bold font-sans">Hybrid Adaptive OWEP</h5>
                    <p className="text-[9.5px] text-slate-505 dark:text-slate-400 font-sans leading-relaxed">
                      Merges a lightweight, spring-assisted overhead hinge flap with low-friction polymer guide fingers. Blocks crawl retrograde routes while preserving minimal sliding drag within humid, dusty field conduits.
                    </p>
                  </div>
                  <span className="text-[8.5px] font-mono text-slate-400 uppercase mt-4">Mechanical Reliability: Maximum</span>
                </button>

              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4">
              <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b pb-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Technical &amp; Engineering Field Notes
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-600 dark:text-slate-400">
                {/* Accordion 1: Subterranean Pipeline */}
                <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <button
                    type="button"
                    onClick={() => setOpenNotes(prev => ({ ...prev, construction: !prev.construction }))}
                    className="w-full flex items-center justify-between text-left font-mono text-[10px] font-bold uppercase text-slate-705 focus:outline-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{openNotes.construction ? '▼' : '▶'}</span>
                      <span>Subterranean Pipeline Construction</span>
                    </span>
                    <span className="text-[9px] text-slate-400">{openNotes.construction ? 'COLLAPSE' : 'EXPAND'}</span>
                  </button>
                  
                  {openNotes.construction && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 animate-fade-in text-xs leading-relaxed">
                      <p>
                        Conduits consist of high-density <strong className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">Polyamide-6 ETT</strong> (Ecological Transfer Tunnels) smooth-walled bores, keeping absolute frictional resistance extremely low (roughness parameter ε typically under 0.015 mm). Tunnels are laid below the shallow cultivation freeze line, stabilizing microclimatic temperatures from seasonal spikes.
                      </p>
                      <p>
                        Subterranean modules features passive gravity drainage channels to discharge agricultural condensation, preventing fluid build-ups that could hinder mechanical OWEP gates.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Biosecurity Containment Core */}
                <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                  <button
                    type="button"
                    onClick={() => setOpenNotes(prev => ({ ...prev, biosecurity: !prev.biosecurity }))}
                    className="w-full flex items-center justify-between text-left font-mono text-[10px] font-bold uppercase text-slate-705 focus:outline-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{openNotes.biosecurity ? '▼' : '▶'}</span>
                      <span>Biosecurity &amp; Non-toxic Containment Core</span>
                    </span>
                    <span className="text-[9px] text-slate-400">{openNotes.biosecurity ? 'COLLAPSE' : 'EXPAND'}</span>
                  </button>
                  
                  {openNotes.biosecurity && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 animate-fade-in text-xs leading-relaxed">
                      <p>
                        Unlike chemical rat poison which results in biomagnification (killing endangered falcons, owls, and local cats that consume slow, poisoned rodents), ERICON relies strictly on physical direction controls. 
                      </p>
                      <p>
                        The subterranean holdings use robust, insulated double-wall polyurethane insulation boxes. Captures are kept safe, dry, thermally stable, and well-ventilated, giving researchers clean, healthy samples for epidemiological DNA testing.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2 - FORMULA LIBRARY */}
        {activeSubTab === 'formulas' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-3xs space-y-6">
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" /> 
                Fluid Mechanics &amp; Pneumatic Formula Library
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Mathematical equations implemented directly by our solver engine to evaluate pipeline drag and velocities in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              
              {/* Formula 1: Sutherland Viscosity */}
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 font-bold px-2 py-0.5 rounded uppercase tracking-wide w-max block">
                    Viscosity Calculation
                  </span>
                  <h5 className="text-xs font-bold font-sans">Sutherland's Formula</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Evaluates the dynamic viscosity of air (&mu;) based on ambient Kelvin temperature:
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 text-center rounded font-mono text-[11px] font-bold text-emerald-950 dark:text-emerald-400 leading-normal my-2">
                    &mu; = &mu;₀ • (T / T₀)¹.⁵ • (T₀ + S) / (T + S)
                  </div>
                </div>
                <div className="text-[9px] font-mono text-slate-400 border-t pt-2 mt-2 space-y-0.5">
                  <p>• &mu;₀ = 1.827 &times; 10⁻⁵ Pa•s (Reference Viscosity)</p>
                  <p>• T₀ = 291.15 K (Reference Temperature)</p>
                  <p>• S = 120.0 K (Sutherland's Constant)</p>
                </div>
              </div>

              {/* Formula 2: Gas Density */}
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wide w-max block">
                    Ideal Gas Law
                  </span>
                  <h5 className="text-xs font-bold font-sans">Air Density Calculation</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Derives specific weight and density of dry air (&rho;) assuming linear thermodynamic pressure:
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 text-center rounded font-mono text-[11px] font-bold text-emerald-950 dark:text-emerald-400 leading-normal my-2">
                    &rho; = P / (R • T)
                  </div>
                </div>
                <div className="text-[9px] font-mono text-slate-400 border-t pt-2 mt-2 space-y-0.5">
                  <p>• P = Static Abs pressure inside pipeline (Pa)</p>
                  <p>• R = 287.05 J/(kg•K) (Dry Air Gas Constant)</p>
                  <p>• T = Absolute temperature in Kelvin (K)</p>
                </div>
              </div>

              {/* Formula 3: Darcy Friction Factor */}
              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wide w-max block">
                    Friction Calculation
                  </span>
                  <h5 className="text-xs font-bold font-sans">Haaland's Friction Factor Approximation</h5>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Iteratively calculates explicit Darcy factor (f) across smooth and rough turbulent boundary walls:
                  </p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 text-center rounded font-mono text-[10px] font-bold text-emerald-950 dark:text-emerald-400 leading-normal my-2">
                    1/&radic;f &asymp; -1.8 • log₁₀[ (&epsilon;/D / 3.7)¹.¹¹ + 6.9/Re ]
                  </div>
                </div>
                <div className="text-[9px] font-mono text-slate-400 border-t pt-2 mt-2 space-y-0.5">
                  <p>• &epsilon;/D = Relative pipe roughness ratio</p>
                  <p>• Re = Pipe Reynolds Number (&rho;vd/&mu;)</p>
                  <p>• Laminar Exception: f = 64/Re when Re &lt; 2300</p>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                <strong className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 block uppercase">Pneumatic Air Speed Conversion (Iterative)</strong>
                <p className="leading-relaxed">
                  The volumetric air flow velocity is calculated by solving the complete <strong className="font-semibold text-slate-800 dark:text-slate-250">Darcy-Weisbach head loss</strong> formula recursively:
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 border rounded font-mono text-center font-bold text-emerald-950 dark:text-emerald-400 my-1 text-[11px]">
                  v = &radic;( 2 • D • &Delta;P / (f • &rho; • L) )
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-400">
                <strong className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 block uppercase">Terminal Canister (Capsule) Kinetic Solver</strong>
                <p className="leading-relaxed">
                  Terminal speed matches push-forces versus air drag resistances inside the conduit:
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 border rounded font-mono text-center font-bold text-emerald-950 dark:text-emerald-400 my-1 text-[11px]">
                  V_cap = &radic;( 2 • (F_press - F_fric) / (Cd • Area • &rho;) )
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 3 - SCIENTIFIC ASSUMPTIONS & CALIBRATIONS */}
        {activeSubTab === 'assumptions' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-slate-800 dark:text-slate-100">
            
            {/* Scientific assumptions info */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4">
              <div>
                <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Core Scientific Hypotheses &amp; Assumptions
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Established biological, thermodynamic and fluid standards on running live models safely.
                </p>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-650 dark:text-slate-400 leading-relaxed">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg space-y-1">
                  <strong className="font-mono text-[9.5px] uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Assumption 1: Uniform Isothermal Gas State</strong>
                  <p className="text-[11px]">
                    Air flowing through the sub-surface polyamide tubing is assumed to adapt isothermally to the surrounding deep earth matrix temperature (specs.temperature). No heat is generated dynamically by friction against the tube skin.
                  </p>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg space-y-1">
                  <strong className="font-mono text-[9.5px] uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Assumption 2: Continuous Non-viscous Sliding Contact</strong>
                  <p className="text-[11px]">
                    Mechanical transport canisters holding specimens are assumed to glide completely flat against the bottom sleeve of the pipeline. Sliding coefficients (&mu;_sliding) assume zero build-up of sand, water pockets, or dry dust inside.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg space-y-1">
                  <strong className="font-mono text-[9.5px] uppercase tracking-wide text-emerald-800 dark:text-emerald-400">Assumption 3: Thermoneutral Metabolic Thresholds</strong>
                  <p className="text-[11px]">
                    Mammal metabolic stress indexes escalate linearily if ambient pipeline temperatures deviate from thermoneutral zones. Survival rates degrade towards 0% if ventilation drops below 8 ACH or values drop under 0C / exceed 38C.
                  </p>
                </div>
              </div>
            </div>

            {/* Calibration Targets */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono font-black uppercase text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Calibration Specifications &amp; Thresholds
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Sokoine University of Agriculture (SUA) multi-year laboratory safety limits.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-[10px]">
                  <div className="space-y-1 border-b border-dashed dark:border-slate-800 pb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MIN FLOW INTEGRITY</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">18.0 ACH</strong>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans leading-tight">
                      Minimum Air Changes per hour required to guarantee stable carbon dioxide clearance inside holding pods.
                    </p>
                  </div>

                  <div className="space-y-1 border-b border-dashed dark:border-slate-800 pb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MAX PHYSICAL TERMINAL VEL</span>
                      <strong className="text-amber-600 dark:text-amber-400">2.5 - 4.5 m/s</strong>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans leading-tight">
                      Absolute upper limits for safe physical transport based on species mass.
                    </p>
                  </div>

                  <div className="space-y-1 pb-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">DIFFICULT SUCTION GRADIENT</span>
                      <strong className="text-[#15462D] dark:text-emerald-400">&Delta;P &gt; 15.0 kPa</strong>
                    </div>
                    <p className="text-[9px] text-slate-500 font-sans leading-tight">
                      Excessive pressures trigger claw-holding and extreme behavioral regression inside conduits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border text-[9px] font-mono leading-relaxed text-slate-500">
                ⚠️ <strong className="uppercase font-bold text-slate-700 dark:text-slate-350">Calibration Notice:</strong> Solvers assume healthy adults. Infant or pregnant specimens exhibit substantially lower draft resistance coefficients. Keep standard pressure gradients moderate during breeding months.
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 4 - SYSTEM SPEC REGISTRY */}
        {activeSubTab === 'registry' && (
          <div className="flex flex-col gap-6 animate-fade-in font-sans">
            
            {/* Spec Registry Box */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-5">
              <div className="flex items-center gap-2 border-b dark:border-slate-850 pb-2.5 mb-3.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-mono font-extrabold text-[#15462D] dark:text-emerald-400 uppercase tracking-wider">ERICON Standard Specs, Governance &amp; Version Registry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Identity parameters</span>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">System Name</strong>
                  <p className="text-xs font-black text-[#15462D] dark:text-emerald-400">ERICON System</p>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"/>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">Full Designation</strong>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Ecological Rodent Interception and Containment Network</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Project classification</span>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">Category Domain</strong>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Scientific Research, Agricultural Technology, Ecological Monitoring &amp; Rodent Management</p>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"/>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">System Environment</strong>
                  <p className="text-xs text-slate-400">Web Application Container (Express &amp; React 18 / CJS Bundler)</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Build Version &amp; Origins</span>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">Current Edition</strong>
                  <p className="text-xs font-bold text-emerald-805 dark:text-emerald-400">v1.3 Experimental Release (2026)</p>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"/>
                  <strong className="text-[11px] uppercase text-slate-800 dark:text-slate-200 block">Geographic Origin</strong>
                  <p className="text-xs text-slate-550 dark:text-slate-400 flex items-center gap-1.5 leading-none">
                    <span className="text-xs">🇹🇿</span> United Republic of Tanzania
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs md:col-span-2 space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Standard Capabilities Matrix</span>
                  <strong className="text-[11px] uppercase text-slate-850 dark:text-slate-250 block">Integrated Compliance Operations</strong>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      "Subterranean Flow Modeling", "Interactive Diagnostics", "IndexedDB Offline Records", 
                      "Species Ecology Profiles", "Telemetry Overrides", "Audit Logs Checksums",
                      "OWEP Anti-Egress Validation", "SUA Peer Collaboration Desk", "Regional Governance Protection"
                    ].map(v => (
                      <span key={v} className="bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/60 rounded text-[9px] font-mono px-2 py-0.5">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs space-y-1">
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider font-bold">Primary Sub-Modules</span>
                  <strong className="text-[11px] uppercase text-slate-805 block">Sub-System Envelopes</strong>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    ERAS Archive Conduit, Biological and Physiological Life-Support Simulation Models for Artificial Rodent Underground Archives (ARUA), and the Ecosystem Portal.
                  </p>
                </div>

              </div>
            </div>

            {/* Scientific credentials & academic coordinators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="academic-citation-credits">
              
              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider border-b dark:border-slate-800 pb-1.5 mb-2.5">
                    <GraduationCap className="w-5 h-5 text-emerald-700" />
                    SUA Principal Inventor Profile
                  </div>
                  
                  <div className="space-y-1.5">
                    <h5 className="text-[13px] font-black font-mono text-slate-900 dark:text-slate-100">Joshua Reuben Jakoniko, MSc</h5>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans mt-1">
                      🎓 <strong>MSc Public Health Pest Management</strong> &amp; <strong>BSc Wildlife Management</strong> — Sokoine University of Agriculture (SUA).
                    </p>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
                      📜 <strong>Diploma in Animal Health and Production</strong> — Livestock Training Agency (LITA), Madaba Campus.
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 italic border-l-2 border-emerald-600 pl-3.5 pt-1 mt-2 font-medium">
                      Core field expertise in tropical rodent ecology, disease dynamics, and safe subterranean non-chemical agricultural physical gating systems.
                    </p>
                  </div>
                </div>
                <div className="border-t dark:border-slate-850 pt-2.5 mt-4 text-[10px] font-mono text-[#15462D] dark:text-emerald-400">
                  United Republic of Tanzania 🇹🇿 — Postgrad SUA
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider border-b dark:border-slate-800 pb-1.5 mb-2.5">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    Academic Citation Reference
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
                    Researchers publishing comparative agricultural, biothermal, or rodent pest exclusion study findings are requested to cite this dashboard and simulated results:
                  </p>
                  <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-2.5 rounded-lg text-[9px] font-mono text-slate-700 dark:text-slate-350 leading-relaxed mt-3 select-all cursor-text font-bold">
                    Jakoniko, J. R. (2026). ERICON Project 2026: Subterranean Air Transport System Pneumatic Simulators and Biological Data Portal. United Republic of Tanzania: SUA Academic Press.
                  </div>
                </div>
                <div className="border-t dark:border-slate-850 pt-2.5 mt-4 text-[10px] font-mono text-slate-450 uppercase">
                  Approved for Peer and Academic Citation
                </div>
              </div>

            </div>

            {/* VERSION UPDATE DOCUMENTATION */}
            <div className="bg-slate-50 dark:bg-slate-950/45 p-5 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3.5">
              <h5 className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b dark:border-slate-850 pb-2">
                Version History &amp; Milestones Log
              </h5>

              <div className="space-y-4 text-[11px] font-sans text-slate-550 leading-relaxed">
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">v1.3</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[8px] font-extrabold px-1.5 py-0.2 rounded">ACTUAL</span>
                    <span className="text-[10px] text-slate-400 font-normal">June 2026</span>
                  </div>
                  <p className="pl-4 border-l border-slate-250 mt-1">
                    Moved Taxonomy profiles into native high-fidelity Ecological Catalog (TAB 6). Re-routed Formula databases, Sutherland viscosity approximations, and calibration reference specs into self-contained Reference Hub (TAB 7).
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">v1.2</span>
                    <span className="text-[10px] text-slate-400 font-normal">May 2026</span>
                  </div>
                  <p className="pl-4 border-l border-slate-250 mt-1">
                    Added IndexedDB offline specimen capture syncing. Implemented cryptographic checksum rollback checks guarding mathematical fluid calculations against tampering.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">v1.0</span>
                    <span className="text-[10px] text-slate-400 font-normal">March 2026</span>
                  </div>
                  <p className="pl-4 border-l border-slate-250 mt-1">
                    Initial Sokoine University of Agriculture (SUA) experimental deployment. Mounted basic Darcy-Weisbach flow equation solvers and three elementary OWEP mechanical option triggers.
                  </p>
                </div>
              </div>
            </div>

            {/* Developer feedback ticket desk */}
            <div className="bg-slate-50 dark:bg-slate-950/45 border border-slate-200 dark:border-slate-850 rounded-xl p-5" id="developer-feedback-desk">
              <div className="flex items-center gap-1.5 text-slate-880 dark:text-slate-200 font-mono font-bold text-xs uppercase tracking-wider border-b dark:border-slate-850 pb-2 mb-3">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                Sokoine University coordination desk &amp; Bug Submission
              </div>
              
              {feedbackSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] mb-3 rounded flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Successfully compiled feedback. Coordination record queued locally.
                </div>
              )}

              <form onSubmit={handlePostFeedback} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px] font-mono font-bold">
                <div className="space-y-1">
                  <label className="text-slate-450 uppercase block text-[9px]">Investigator Name</label>
                  <input
                    type="text"
                    placeholder="E.g. Dr. Severine SUA"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600 h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 uppercase block text-[9px]">Email Coordinates</label>
                  <input
                    type="email"
                    placeholder="your@sua.ac.tz"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600 h-10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 uppercase block text-[9px]">Category</label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600 h-10"
                  >
                    <option value="bug">Report Bug / Deviation</option>
                    <option value="feature">Request Core Module</option>
                    <option value="sua_coord">Sokoine Univ Coordination</option>
                    <option value="other">General Inquiries</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 uppercase block text-[9px]">Message Details</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Simulation Reynolds index feedback..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono text-slate-805 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600 h-10"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-950 hover:bg-emerald-900 text-white font-mono px-4 text-[10px] font-bold uppercase rounded cursor-pointer transition flex items-center justify-center gap-1.5 h-10"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      Submit
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* SUBTAB 5 - PLATFORM BROADCASTS BULLETIN */}
        {activeSubTab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans">
            
            {/* News Lists */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-mono font-extrabold text-[#15462D] dark:text-emerald-400 uppercase tracking-wider block">
                  📰 Active Technical Bulletins &amp; Compliance Notes
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {newsList.length} notices active
                </span>
              </div>

              {newsList.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 border border-dashed rounded-xl p-8 text-center border-slate-200 dark:border-slate-850">
                  <Newspaper className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs font-mono uppercase font-bold text-slate-455">No bulletins active</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newsList.map((item) => {
                    const fresh = isNewsFresh(item.date);
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-xl transition-all shadow-3xs bg-white dark:bg-slate-900 ${
                          fresh ? 'border-amber-400 bg-amber-500/5 dark:bg-amber-950/10' : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                              fresh ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60' : 'bg-slate-100 dark:bg-slate-950 text-slate-500'
                            }`}>
                              System Notice
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.date}
                            </span>
                          </div>

                          {fresh && (
                            <span className="bg-amber-500 text-amber-950 font-mono font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider animate-pulse shrink-0">
                              NEW!
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 block tracking-tight uppercase font-mono">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-2 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Post Bulletin Form */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 flex flex-col gap-4 self-start">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-400 uppercase block tracking-wider pb-1 border-b dark:border-slate-850">
                  ⚡ Technical Broadcast Console
                </span>
                <p className="text-[10px] text-slate-500 font-sans leading-tight mt-1.5">
                  Compose a global notification broadcast. Propagation is instantaneous, and includes a rolling "NEW!" freshness tracker.
                </p>
              </div>

              {postSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] rounded flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bulletin posted successfully!
                </div>
              )}

              <form onSubmit={handlePostNews} className="space-y-3 text-[10px] font-mono font-bold">
                <div className="space-y-1">
                  <label className="text-slate-550 dark:text-slate-400 uppercase text-[9px]">Notification Header Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Improved DBSCAN density thresholds"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-550 dark:text-slate-400 uppercase text-[9px]">Overview Content Details</label>
                  <textarea
                    required
                    placeholder="Provide details about equations compiled, compliance standards accepted..."
                    value={draftBody}
                    onChange={(e) => setDraftBody(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 h-24 text-xs font-mono text-slate-800 dark:text-slate-200 rounded focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-mono uppercase tracking-wider py-2 rounded text-[10px] font-bold block transition cursor-pointer"
                >
                  Publish Bulletin Frame
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
