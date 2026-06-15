/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sprout, Bird, ShieldAlert, Check, Plus, AlertCircle, Sparkles, Filter, HelpCircle
} from 'lucide-react';

interface BiodiversityObservation {
  id: string;
  category: 'Mammals' | 'Birds' | 'Reptiles' | 'Amphibians' | 'Invertebrates' | 'Vegetation';
  speciesLocal: string;
  speciesScientific: string;
  count: number;
  habitat: string;
  timestamp: string;
}

const PRESET_OBSERVATIONS: BiodiversityObservation[] = [
  { id: 'BIO-001', category: 'Birds', speciesLocal: 'Barn Owl', speciesScientific: 'Tyto alba', count: 2, habitat: 'Cereal storage roof context', timestamp: '2026-05-30 20:15' },
  { id: 'BIO-002', category: 'Vegetation', speciesLocal: 'Fallow Weed', speciesScientific: 'Cynodon dactylon', count: 45, habitat: 'Boundary trial plot margin', timestamp: '2026-05-30 11:30' },
  { id: 'BIO-003', category: 'Invertebrates', speciesLocal: 'Tanzanian Honeybee', speciesScientific: 'Apis mellifera scutellata', count: 80, habitat: 'Flowering boundary vegetation', timestamp: '2026-05-29 14:00' }
];

export function BiodiversityTab() {
  const [observations, setObservations] = useState<BiodiversityObservation[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_biodiversity_modular');
      return saved ? JSON.parse(saved) : PRESET_OBSERVATIONS;
    } catch {
      return PRESET_OBSERVATIONS;
    }
  });

  // Category select: 'Mammals' | 'Birds' | 'Reptiles' | 'Amphibians' | 'Invertebrates' | 'Vegetation'
  const [activeCategory, setActiveCategory] = useState<'Mammals' | 'Birds' | 'Reptiles' | 'Amphibians' | 'Invertebrates' | 'Vegetation'>('Birds');

  // Input fields for newly recorded observation
  const [localName, setLocalName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [countObserved, setCountObserved] = useState<number>(1);
  const [habitatText, setHabitatText] = useState('');

  const handleInsertObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName || !scientificName) {
      alert("Please enter a valid Common Name and Scientific taxonomy code.");
      return;
    }

    const newObs: BiodiversityObservation = {
      id: `BIO-00${observations.length + 1}`,
      category: activeCategory,
      speciesLocal: localName,
      speciesScientific: scientificName,
      count: countObserved || 1,
      habitat: habitatText || 'Agricultural perimeter trial field context',
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    const updated = [newObs, ...observations];
    setObservations(updated);
    localStorage.setItem('ericon_biodiversity_modular', JSON.stringify(updated));

    // Clear form
    setLocalName('');
    setScientificName('');
    setCountObserved(1);
    setHabitatText('');
    alert("🌿 BIODIVERSITY FIELD OBSERVATION CATALOGED: Preserved locally.");
  };

  const currentCategoryObservations = observations.filter(o => o.category === activeCategory);

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Dynamic Subcomponent Loading Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-3xs flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {(['Mammals', 'Birds', 'Reptiles', 'Amphibians', 'Invertebrates', 'Vegetation'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              // Clean form fields to prevent stray mixing of species names
              setLocalName('');
              setScientificName('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer border ${
              activeCategory === cat 
                ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] shadow-3xs ericon-active-portal-tab' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {cat === 'Mammals' && '🐁 '}
            {cat === 'Birds' && '🦅 '}
            {cat === 'Reptiles' && '🦎 '}
            {cat === 'Amphibians' && '🐸 '}
            {cat === 'Invertebrates' && '🐝 '}
            {cat === 'Vegetation' && '🌿 '}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Field Entry Sheet */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
          <div className="border-b pb-3.5">
            <span className="text-[8.5px] font-mono font-black bg-emerald-50 text-emerald-950 border border-emerald-250 px-2 py-0.5 rounded uppercase">
              {activeCategory} Log Entry
            </span>
            <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mt-2 uppercase">
              Log Observed {activeCategory} Species
            </h4>
          </div>

          <form onSubmit={handleInsertObservation} className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-500 uppercase">Common Species Name (Local):</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Tanzanian Crowned Hornbill"
                value={localName}
                onChange={e => setLocalName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#15462D] font-sans text-xs text-slate-805"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-500 uppercase">Scientific Taxonomy (Genus Spp):</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Lophoceros alboterminatus"
                value={scientificName}
                onChange={e => setScientificName(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#15462D] font-sans text-xs text-slate-805"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-450">Estimated Count Log:</label>
              <input 
                type="number" 
                required 
                value={countObserved}
                onChange={e => setCountObserved(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded p-2 "
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-[#15462D]">Specific Habitat Context notes:</label>
              <textarea 
                rows={2} 
                placeholder="e.g. Found resting inside maize canopy near boundary line"
                value={habitatText}
                onChange={e => setHabitatText(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 font-sans text-xs"
              />
            </div>

            <button
              type="submit"
              className="bg-[#15462D] hover:bg-emerald-900 font-black text-white px-4 py-2.5 rounded-lg shrink-0 flex items-center gap-1 uppercase transition mt-2 cursor-pointer border border-emerald-950 shadow-3xs"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog Observed Fauna</span>
            </button>
          </form>
        </div>

        {/* Right Pane: Table of recorded items */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
          <div>
            <h4 className="text-[11px] font-bold font-mono tracking-wider uppercase text-slate-705 border-b pb-2">
              📂 Recorded {activeCategory} Field Audits ({currentCategoryObservations.length})
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs leading-normal border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-mono text-[9px] uppercase font-bold text-slate-450 bg-slate-50/50">
                  <th className="py-2.5 px-3">Species (Local Name)</th>
                  <th className="py-2.5 px-3">Scientific Genus</th>
                  <th className="py-2.5 px-3 text-center">Count</th>
                  <th className="py-2.5 px-3">Habitat Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCategoryObservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center font-mono text-slate-400 italic">
                      No matching {activeCategory.toLowerCase()} observations listed in this session database.
                    </td>
                  </tr>
                ) : (
                  currentCategoryObservations.map((obs) => (
                    <tr key={obs.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3 font-bold text-slate-800">{obs.speciesLocal}</td>
                      <td className="py-3 px-3 font-mono text-[10.5px] text-emerald-805 italic">{obs.speciesScientific}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-650 font-bold">{obs.count}</td>
                      <td className="py-3 px-3 text-slate-500 truncate max-w-[200px]" title={obs.habitat}>{obs.habitat}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
