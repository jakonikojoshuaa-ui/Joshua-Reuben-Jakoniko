/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Star, Clock, Save, Trash2, ArrowRight, ShieldCheck, 
  HelpCircle, RefreshCw, Layers, Sparkles, AlertCircle, Bookmark, CheckCircle2
} from 'lucide-react';
import { SystemSpecs, RodentSpecies } from '../types';

// Hardcoded structures to search over
interface FormulaItem {
  id: string;
  name: string;
  expression: string;
  category: 'formulas';
  description: string;
}

interface SpeciesItem {
  id: RodentSpecies;
  name: string;
  scientificName: string;
  category: 'species';
  emoji: string;
}

interface ReportItem {
  id: string;
  name: string;
  category: 'reports';
  description: string;
}

interface ProjectItem {
  id: string;
  name: string;
  category: 'projects';
  description: string;
}

interface OwepItem {
  id: 'flap_door' | 'flex_finger' | 'hybrid';
  name: string;
  category: 'OWEP designs';
  description: string;
}

interface LogItem {
  id: string;
  name: string;
  category: 'logs';
  message: string;
}

type SearchItem = FormulaItem | SpeciesItem | ReportItem | ProjectItem | OwepItem | LogItem;

const STATIC_SEARCH_DATA: SearchItem[] = [
  // Formulas
  { id: 'f-sutherland', name: "Sutherland's Dynamic Viscosity Formula", expression: "μ = μ₀ · (T / T₀)¹⁵ · (T₀ + S) / (T + S)", category: 'formulas', description: 'Calculates specific mechanical air drag based on thermodynamic ambient heat levels in Kelvin.' },
  { id: 'f-density', name: 'Ideal Gas Law Air Density Solver', expression: "ρ = P / (R · T)", category: 'formulas', description: 'Derives localized specific fluidic air weight inside polyamide conduit.' },
  { id: 'f-haaland', name: "Haaland's Explicit Darcy Friction Approximation", expression: "1/√f ≈ -1.8 · log₁₀[ (ε/D / 3.7)¹¹¹ + 6.9/Re ]", category: 'formulas', description: 'Evaluates boundary wall shear loss under moderate-to-high Reynolds indices.' },
  { id: 'f-darcy', name: 'Darcy-Weisbach Volumetric Flow Equation', expression: "v = √( 2 · D · ΔP / (f · ρ · L) )", category: 'formulas', description: 'Standard pressure loss equation for assessing subterranean fluid velocity.' },
  { id: 'f-terminal', name: 'Terminal Canister Kinetic Velocity Solver', expression: "V_cap = √( 2 · (F_press - F_fric) / (Cd · Area · ρ) )", category: 'formulas', description: 'Tracks optimal mammalian canister capsule transit bounds.' },

  // Rodent Species
  { id: 'field_mouse', name: 'Field Mouse / Wood Mouse', scientificName: 'Apodemus sylvaticus', category: 'species', emoji: '🐹' },
  { id: 'house_mouse', name: 'Common House Mouse', scientificName: 'Mus musculus', category: 'species', emoji: '🐭' },
  { id: 'mastomys_natalensis', name: 'African Multimammate Mouse', scientificName: 'Mastomys natalensis', category: 'species', emoji: '🌍' },
  { id: 'arvicanthis_spp', name: 'African Grass Rat', scientificName: 'Arvicanthis niloticus', category: 'species', emoji: '🌾' },
  { id: 'roof_rat', name: 'Roof Rat / Black Rat', scientificName: 'Rattus rattus', category: 'species', emoji: '🧗' },
  { id: 'brown_rat', name: 'Brown Rat / sewer Rat', scientificName: 'Rattus norvegicus', category: 'species', emoji: '🐀' },

  // OWEP Designs
  { id: 'flap_door', name: 'Gravity-Fed Flap Gate', category: 'OWEP designs', description: 'Option A: Lightweight aluminum composite vertical flap requiring low entry force (<0.5N).' },
  { id: 'flex_finger', name: 'Radial Flex-Finger Funnel', category: 'OWEP designs', description: 'Option B: Tapered radial flexible fingers designed for high-density agricultural conduits.' },
  { id: 'hybrid', name: 'Hybrid Adaptive OWEP Gate', category: 'OWEP designs', description: 'Option C: Combined spring-assisted gate with polymer fingers for dry, dusty environments.' },

  // Project Templates
  { id: 'proj-sua-a', name: 'SUA Experimental Field - Row Alfa', category: 'projects', description: 'Sokoine University primary test site with damp topsoil and short-tube networks (15m).' },
  { id: 'proj-madaba', name: 'Madaba Crop Storage Vault Beta', category: 'projects', description: 'Deep mountain seed depository pipeline layout featuring high ventilation requirements.' },
  { id: 'proj-manzese', name: 'Manzese Underground Tunnel Complex', category: 'projects', description: 'High-friction industrial concrete-adjacent tunnel for heavy fossorial Rattus control.' },

  // Analytics Reports
  { id: 'rep-flow', name: 'Pneumatic Air Velocity Analysis Report', category: 'reports', description: 'Examines turbulence development under dynamic pressure gradients.' },
  { id: 'rep-drag', name: 'Mammalian Capsule Friction Profiler', category: 'reports', description: 'Calculates optimal mechanical tolerances before capsule blockage happens.' },
  { id: 'rep-climate', name: 'Sokoine Agricultural Humidity Trend Log', category: 'reports', description: 'Synthesizes 24-hour microgrid relative humidity variations.' },

  // Log Terms
  { id: 'log-vent', name: 'Minimum Ventilation Rate Standard', category: 'logs', message: 'Checks if containment air changes satisfy stable carbon dioxide limits of >= 18.0 ACH.' },
  { id: 'log-reynold', name: 'Reynolds Laminar Boundary Threshold', category: 'logs', message: 'Identifies immediate transition state if Reynolds numbers exceeds 2300.' },
  { id: 'log-temp', name: 'Thermoneutral Environmental Envelope', category: 'logs', message: 'Triggers safety critical alerts if microclimates drift from designated target species bounds.' }
];

interface FavoriteItem {
  id: string;
  name: string;
  type: 'preset' | 'species_config' | 'project_linked';
  date: string;
  specs: SystemSpecs;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
  entryDiameter: number;
  exitDiameter: number;
}

interface RecentActivity {
  id: string;
  action: string;
  date: string;
  specs: SystemSpecs;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
}

interface SimulatorCompanionProps {
  // Current parent state pointers
  specs: SystemSpecs;
  rodentSpecies: RodentSpecies;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
  entryDiameter: number;
  exitDiameter: number;
  humidity: number;
  atmosphericPressure: number;

  // React state setters to trigger state updates in parent
  onApplySpecs: (newSpecs: SystemSpecs) => void;
  onApplySpecies: (newSp: RodentSpecies) => void;
  onApplyOwepDesign: (newOwep: 'flap_door' | 'flex_finger' | 'hybrid') => void;
  onApplyDiameters: (entry: number, exit: number) => void;
  onApplyTab: (tab: 'controls' | 'species' | 'results' | 'logs' | 'reports') => void;
}

export const SimulatorCompanion: React.FC<SimulatorCompanionProps> = ({
  specs,
  rodentSpecies,
  owepDesign,
  entryDiameter,
  exitDiameter,
  humidity,
  atmosphericPressure,
  onApplySpecs,
  onApplySpecies,
  onApplyOwepDesign,
  onApplyDiameters,
  onApplyTab
}) => {
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  
  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteType, setFavoriteType] = useState<'preset' | 'species_config' | 'project_linked'>('preset');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Recent Action history
  const [recents, setRecents] = useState<RecentActivity[]>([]);

  // Draft & Auto save stats
  const [lastAutoSave, setLastAutoSave] = useState<string>('');
  const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);

  // Load Favorites from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ericon_sim_favorites_v2');
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        // Hydrate with initial gorgeous presets
        const defaultFavorites: FavoriteItem[] = [
          {
            id: 'avg-field',
            name: 'Mwanza Field Mouse Standard Track',
            type: 'preset',
            date: '2026-06-01',
            specs: { p1: 101.5, p2: 100.0, length: 12, diameter: 90, roughness: 0.0015, temperature: 24, capsuleMass: 22, capsuleFriction: 0.08, capsuleClearance: 0.98 },
            rodentSpecies: 'field_mouse',
            owepDesign: 'flap_door',
            entryDiameter: 90,
            exitDiameter: 90
          },
          {
            id: 'mastomys-proj-sua',
            name: 'Morogoro Mastomys High Suction Vault',
            type: 'project_linked',
            date: '2026-06-02',
            specs: { p1: 105.0, p2: 98.2, length: 25, diameter: 110, roughness: 0.002, temperature: 28, capsuleMass: 55, capsuleFriction: 0.09, capsuleClearance: 0.96 },
            rodentSpecies: 'mastomys_natalensis',
            owepDesign: 'hybrid',
            entryDiameter: 110,
            exitDiameter: 110
          }
        ];
        setFavorites(defaultFavorites);
        localStorage.setItem('ericon_sim_favorites_v2', JSON.stringify(defaultFavorites));
      }
    } catch {}

    // Load Recents list
    try {
      const storedRecents = localStorage.getItem('ericon_sim_recents_v2');
      if (storedRecents) {
        setRecents(JSON.parse(storedRecents));
      } else {
        const initialRecents: RecentActivity[] = [
          {
            id: 'rec-1',
            action: 'Calibrated Field Mouse Standard Transit',
            date: new Date(Date.now() - 30 * 60000).toISOString(),
            specs: { p1: 101.3, p2: 100.2, length: 15, diameter: 90, roughness: 0.0015, temperature: 22, capsuleMass: 18, capsuleFriction: 0.08, capsuleClearance: 0.98 },
            rodentSpecies: 'field_mouse',
            owepDesign: 'flap_door'
          }
        ];
        setRecents(initialRecents);
        localStorage.setItem('ericon_sim_recents_v2', JSON.stringify(initialRecents));
      }
    } catch {}

    // Check if draft was restored previously on startup
    const loadedDraft = localStorage.getItem('ericon_draft_sim_v2');
    if (loadedDraft) {
      setDraftRestoredNotice(true);
      setTimeout(() => setDraftRestoredNotice(false), 8000);
    }
  }, []);

  // Sync favorites
  const persistFavorites = (updated: FavoriteItem[]) => {
    setFavorites(updated);
    localStorage.setItem('ericon_sim_favorites_v2', JSON.stringify(updated));
  };

  // Run Global Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = STATIC_SEARCH_DATA.filter(item => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchDesc = ('description' in item) ? item.description.toLowerCase().includes(q) : false;
      const matchExpr = ('expression' in item) ? item.expression.toLowerCase().includes(q) : false;
      const matchSci = ('scientificName' in item) ? item.scientificName.toLowerCase().includes(q) : false;
      const matchMsg = ('message' in item) ? item.message.toLowerCase().includes(q) : false;
      
      return matchName || matchCat || matchDesc || matchExpr || matchSci || matchMsg;
    });
    setSearchResults(filtered);
  }, [searchQuery]);

  // Recording recent actions automatically when crucial props update
  // We debounce/record standard variations to prevent clogging
  useEffect(() => {
    const timer = setTimeout(() => {
      const newAction: RecentActivity = {
        id: `rec-${Date.now()}`,
        action: `Set parameters: P1 ${specs.p1} kPa, Species [${rodentSpecies}]`,
        date: new Date().toISOString(),
        specs: { ...specs },
        rodentSpecies,
        owepDesign
      };

      setRecents(prev => {
        // Prevent adding identical values consecutively
        if (prev.length > 0) {
          const last = prev[0];
          if (last.specs.p1 === specs.p1 && last.specs.p2 === specs.p2 && last.rodentSpecies === rodentSpecies && last.owepDesign === owepDesign) {
            return prev;
          }
        }
        const updated = [newAction, ...prev].slice(0, 5);
        localStorage.setItem('ericon_sim_recents_v2', JSON.stringify(updated));
        return updated;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [specs.p1, specs.p2, specs.length, rodentSpecies, owepDesign]);

  // Handles adding new favorite
  const handleSaveFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!favoriteName.trim()) return;

    const newFav: FavoriteItem = {
      id: `fav-${Date.now()}`,
      name: favoriteName.trim(),
      type: favoriteType,
      date: new Date().toISOString().split('T')[0],
      specs: { ...specs },
      rodentSpecies,
      owepDesign,
      entryDiameter,
      exitDiameter
    };

    const updated = [newFav, ...favorites];
    persistFavorites(updated);
    setFavoriteName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handles deleting favorite
  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f.id !== id);
    persistFavorites(updated);
  };

  // Apply favorite preset/config to simulation
  const handleApplyFavorite = (fav: FavoriteItem) => {
    onApplySpecs(fav.specs);
    onApplySpecies(fav.rodentSpecies);
    onApplyOwepDesign(fav.owepDesign);
    onApplyDiameters(fav.entryDiameter, fav.exitDiameter);

    // Record action
    const newAction: RecentActivity = {
      id: `rec-${Date.now()}`,
      action: `Restored Favorite Preset: "${fav.name}"`,
      date: new Date().toISOString(),
      specs: fav.specs,
      rodentSpecies: fav.rodentSpecies,
      owepDesign: fav.owepDesign
    };
    setRecents(prev => {
      const updated = [newAction, ...prev].slice(0, 5);
      localStorage.setItem('ericon_sim_recents_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Apply recent activity state
  const handleApplyRecent = (rec: RecentActivity) => {
    onApplySpecs(rec.specs);
    onApplySpecies(rec.rodentSpecies);
    onApplyOwepDesign(rec.owepDesign);
  };

  // Handle Search Result Click Redirects
  const handleSearchResultClick = (item: SearchItem) => {
    if (item.category === 'species') {
      onApplySpecies(item.id as RodentSpecies);
      onApplyTab('species');
    } else if (item.category === 'OWEP designs') {
      onApplyOwepDesign(item.id as any);
      onApplyTab('controls');
    } else if (item.category === 'formulas') {
      alert("ℹ️ Formulas & Reference Manuals have been centralized in the ERICON Technical Reference Library. Go to the [Research Portal] > [Settings] tab to inspect dynamic calculations & mechanical principles.");
      onApplyTab('controls');
    } else if (item.category === 'reports') {
      onApplyTab('reports');
    } else if (item.category === 'projects') {
      // Simulate standard project environment
      let customSpecs: SystemSpecs = { ...specs };
      if (item.id === 'proj-sua-a') {
        customSpecs = { ...specs, length: 15, diameter: 90, roughness: 0.0015, temperature: 24.5 };
        onApplySpecies('field_mouse');
      } else if (item.id === 'proj-madaba') {
        customSpecs = { ...specs, length: 30, diameter: 110, roughness: 0.002, temperature: 18.0 };
        onApplySpecies('roof_rat');
      } else if (item.id === 'proj-manzese') {
        customSpecs = { ...specs, length: 45, diameter: 120, roughness: 0.003, temperature: 22.0 };
        onApplySpecies('brown_rat');
      }
      onApplySpecs(customSpecs);
      onApplyTab('controls');
    } else if (item.category === 'logs') {
      onApplyTab('logs');
    }
    setSearchQuery('');
  };

  // Background Auto Saver every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const draftData = {
        specs,
        rodentSpecies,
        owepDesign,
        entryDiameter,
        exitDiameter,
        humidity,
        atmosphericPressure,
        savedAt: new Date().toLocaleTimeString()
      };
      localStorage.setItem('ericon_draft_sim_v2', JSON.stringify(draftData));
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSave(timeStr);
    }, 30000);

    return () => clearInterval(interval);
  }, [specs, rodentSpecies, owepDesign, entryDiameter, exitDiameter, humidity, atmosphericPressure]);

  return (
    <div className="flex flex-col gap-6 text-slate-800 dark:text-slate-100" id="simulator-companion-panel">
      
      {/* 1. DRAFT RECOVERY / AUTO SAVE NOTICE */}
      {draftRestoredNotice && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-between gap-3 p-3.5 rounded-xl text-emerald-900 dark:text-emerald-400 font-mono text-[11px] animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span><strong>Draft Recovered:</strong> Restored unfinished model parameters from previous container session.</span>
          </div>
          <button 
            type="button" 
            onClick={() => setDraftRestoredNotice(false)} 
            className="text-[10px] text-slate-400 hover:text-emerald-500 font-bold uppercase transition bg-transparent border-0 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* 2. AUTO SAVE BEAT INDICATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-slate-350 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="uppercase text-slate-400 font-bold">Background Engine Health</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin-slow" />
          <span>Auto-save every 30s: <strong className="text-emerald-400">{lastAutoSave ? `Saved at ${lastAutoSave}` : 'Armed'}</strong></span>
        </div>
      </div>

      {/* 3. GLOBAL SEARCH ENGINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-3xs space-y-3.5 relative">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-mono font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#15462D] dark:text-emerald-400" />
              Global Simulator Search
            </h4>
            <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
              Instantly resolve formulas, species, OWEPs, reports, and logs.
            </p>
          </div>
          <span className="text-[8px] bg-slate-100 dark:bg-slate-950 font-mono px-1.5 py-0.5 text-slate-500 uppercase rounded">INDEX LEVEL 3</span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search e.g. sutherland, mastomys, flap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 pl-9 text-xs font-mono font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 text-slate-800 dark:text-slate-150"
            id="global-simulator-search-input"
          />
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[10px] text-zinc-400 hover:text-zinc-650 bg-transparent border-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* SEARCH RESULTS POPOVER */}
        {searchResults.length > 0 && (
          <div className="absolute top-[105px] left-0 right-0 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border-2 border-emerald-500/25 rounded-xl z-20 shadow-lg p-2 space-y-1.5 font-mono animate-fade-in">
            <span className="text-[8.5px] text-slate-400 font-bold block px-2 uppercase tracking-widest pb-1 border-b dark:border-slate-850">
              Resolved search matches ({searchResults.length})
            </span>
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSearchResultClick(item)}
                className="w-full text-left p-2 rounded-lg hover:bg-emerald-500/5 dark:hover:bg-emerald-950/20 border-0 flex items-start gap-2.5 transition cursor-pointer"
              >
                <div className="flex flex-col w-full text-xs">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-[#15462D] dark:text-emerald-400 text-[11px] flex items-center gap-1.5 truncate">
                      {'emoji' in item && <span className="font-sans shrink-0">{item.emoji}</span>}
                      {item.name}
                    </span>
                    <span className="text-[8px] bg-slate-100 dark:bg-slate-950 text-slate-500 font-black tracking-widest uppercase px-1.5 py-0.5 rounded shrink-0">
                      {item.category}
                    </span>
                  </div>
                  
                  {/* Additional diagnostic parameters details */}
                  {'expression' in item && (
                    <span className="text-[10px] text-emerald-700 font-black mt-1 bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-dashed leading-none">{item.expression}</span>
                  )}
                  {'scientificName' in item && (
                    <span className="text-[10px] italic text-slate-500 font-sans mt-0.5">{item.scientificName}</span>
                  )}
                  {'description' in item && (
                    <span className="text-[9.5px] text-slate-455 font-sans mt-1 leading-normal">{item.description}</span>
                  )}
                  {'message' in item && (
                    <span className="text-[9.5px] text-slate-455 font-sans mt-1 leading-normal">{item.message}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. FAVORITES PRESETS MANAGER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-3xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-mono font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Favorites &amp; Simulation Presets
          </h4>
          <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
            Save and restore custom simulation models and rodent setups instantly.
          </p>
        </div>

        {/* Saved Favorites List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1" id="favorites-presets-mini-list">
          {favorites.length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-lg font-sans text-xs text-slate-400">
              No favorites saved yet. Capture parameters below!
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => handleApplyFavorite(fav)}
                className="group flex flex-col p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl hover:border-amber-500 transition duration-150 cursor-pointer font-mono"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate pr-2">
                      {fav.name}
                    </span>
                    <span className="text-[8px] bg-amber-500/10 text-amber-800 dark:text-amber-400 uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded w-max mt-1">
                      {fav.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteFavorite(fav.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 border-0 cursor-pointer shrink-0 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 border-t border-dashed dark:border-slate-800 pt-2 mt-2 text-[9px] text-slate-450 uppercase font-black">
                  <div>Species: <strong className="text-slate-755 dark:text-slate-300">{fav.rodentSpecies.replace('_', ' ')}</strong></div>
                  <div>P1: <strong className="text-slate-755 dark:text-slate-300">{fav.specs.p1} kPa</strong></div>
                  <div>Gate: <strong className="text-slate-755 dark:text-slate-300">{fav.owepDesign.replace('_', ' ')}</strong></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Save Current Preset Form */}
        <form onSubmit={handleSaveFavorite} className="border-t border-slate-100 dark:border-slate-850 pt-3.5 space-y-3">
          <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Save Current System Config
          </span>
          
          {saveSuccess && (
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] rounded font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Saved configuration profile securely!
            </div>
          )}

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Preset Name (e.g., Mwanza wet weather)"
              required
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-600 text-slate-800 dark:text-slate-150"
            />
            <select
              value={favoriteType}
              onChange={(e) => setFavoriteType(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs font-mono font-bold text-slate-655 dark:text-slate-350 focus:outline-none"
            >
              <option value="preset">Preset specs</option>
              <option value="species_config">Rodent Spec</option>
              <option value="project_linked">Project Link</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-[#15462D] font-mono font-black text-[10px] uppercase rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition border-0 shadow-3xs"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Bookmark State Profile
          </button>
        </form>
      </div>

      {/* 5. RECENT TRANSIT ACTIVITY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-3xs space-y-3.5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h4 className="text-xs font-mono font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#15462D] dark:text-emerald-400" />
            Recent Simulation Activity
          </h4>
          <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
            Re-run or audit parameters representing recent sandbox simulations.
          </p>
        </div>

        <div className="space-y-2 font-mono">
          {recents.map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => handleApplyRecent(rec)}
              className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg flex items-center justify-between text-[10.5px] cursor-pointer transition gap-3"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-slate-700 dark:text-slate-350 font-bold truncate">
                  {rec.action}
                </span>
                <span className="text-[8px] text-slate-400 mt-0.5">
                  {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-450 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
