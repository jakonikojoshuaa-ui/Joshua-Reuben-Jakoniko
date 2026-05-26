/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Gauge, Trash2, Milestone, Thermometer, Box, Zap } from 'lucide-react';
import { SystemSpecs, RodentSpecies } from '../types';

interface ControlPanelProps {
  specs: SystemSpecs;
  onChangeSpecs: (newSpecs: SystemSpecs) => void;
  rodentSpecies: RodentSpecies;
  onChangeRodentSpecies: (val: RodentSpecies) => void;
  owepDesign: 'flap_door' | 'flex_finger';
  onChangeOwepDesign: (val: 'flap_door' | 'flex_finger') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  specs, 
  onChangeSpecs,
  rodentSpecies,
  onChangeRodentSpecies,
  owepDesign,
  onChangeOwepDesign
}) => {
  const [customPresets, setCustomPresets] = React.useState<{ label: string; specs: SystemSpecs; species?: RodentSpecies; owepDesign?: 'flap_door' | 'flex_finger' }[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_custom_presets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newPresetLabel, setNewPresetLabel] = React.useState('');

  const handleSavePreset = () => {
    if (!newPresetLabel.trim()) {
      alert('Please enter a custom preset label first.');
      return;
    }
    const dup = customPresets.find(p => p.label.toLowerCase() === newPresetLabel.trim().toLowerCase());
    if (dup) {
      if (!confirm(`An ERICON preset named "${newPresetLabel.trim()}" already exists. Overwrite?`)) {
        return;
      }
    }
    const updated = dup 
      ? customPresets.map(p => p.label.toLowerCase() === newPresetLabel.trim().toLowerCase() ? { label: newPresetLabel.trim(), specs, species: rodentSpecies, owepDesign } : p)
      : [...customPresets, { label: newPresetLabel.trim(), specs, species: rodentSpecies, owepDesign }];
    
    setCustomPresets(updated);
    localStorage.setItem('ericon_custom_presets_v1', JSON.stringify(updated));
    setNewPresetLabel('');
  };

  const handleDeletePreset = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.label !== label);
    setCustomPresets(updated);
    localStorage.setItem('ericon_custom_presets_v1', JSON.stringify(updated));
  };

  const handleLoadPreset = (preset: { label: string; specs: SystemSpecs; species?: RodentSpecies; owepDesign?: 'flap_door' | 'flex_finger' }) => {
    onChangeSpecs(preset.specs);
    if (preset.species) onChangeRodentSpecies(preset.species);
    if (preset.owepDesign) onChangeOwepDesign(preset.owepDesign);
  };

  const handleSliderChange = (field: keyof SystemSpecs, value: number) => {
    // Keep pressure P1 strictly >= P2 + 5 to avoid negative flows or static locks
    let newSpecs = { ...specs, [field]: value };
    
    if (field === 'p1' && value <= specs.p2) {
      newSpecs.p1 = specs.p2 + 5;
    } else if (field === 'p2' && value >= specs.p1) {
      newSpecs.p2 = Math.max(specs.p1 - 5, 10);
    }
    
    onChangeSpecs(newSpecs);
  };

  // Preset Configurations for ERICON rodent systems
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'perimeter': // Hedgerow Field Mouse setting
        onChangeSpecs({
          p1: 104, // Gentle pressure push
          p2: 98,  // Minimal vacuum draft
          length: 30, // 30 meters
          diameter: 80, // 80 mm tube (tight path for mice)
          roughness: 0.0012, // extremely smooth tube
          temperature: 22, // perfect thermoneutral temperature
          capsuleMass: 150, // Lightweight mouse transfer capsule
          capsuleFriction: 0.05, // polished track
          capsuleClearance: 0.98,
        });
        onChangeRodentSpecies('field_mouse');
        onChangeOwepDesign('flap_door');
        break;
      case 'silo': // Grain Silo Brown Rat setting
        onChangeSpecs({
          p1: 112, // slightly higher suction flow
          p2: 88,  // stronger ventilation for rats
          length: 50, // 50 meters
          diameter: 130, // larger 130mm tube for adult rats
          roughness: 0.002, // standard tube
          temperature: 20, // slightly cooler
          capsuleMass: 650, // heavier rat transfer capsule
          capsuleFriction: 0.09,
          capsuleClearance: 0.96,
        });
        onChangeRodentSpecies('brown_rat');
        onChangeOwepDesign('flex_finger');
        break;
      case 'winter': // Winter perimeter run
        onChangeSpecs({
          p1: 106,
          p2: 94,
          length: 40,
          diameter: 90,
          roughness: 0.0015,
          temperature: 8, // harsh cold air!
          capsuleMass: 250,
          capsuleFriction: 0.07,
          capsuleClearance: 0.97,
        });
        onChangeRodentSpecies('house_mouse');
        onChangeOwepDesign('flap_door');
        break;
      case 'peak': // Perfect thermal control run
        onChangeSpecs({
          p1: 103,
          p2: 99, // extremely gentle flow
          length: 15,
          diameter: 100,
          roughness: 0.0015,
          temperature: 24, // ideal 24°C thermal neutral
          capsuleMass: 180,
          capsuleFriction: 0.06,
          capsuleClearance: 0.98,
        });
        onChangeRodentSpecies('house_mouse');
        onChangeOwepDesign('flex_finger');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm shadow-md p-6 flex flex-col gap-6" id="control-panel">
      
      {/* Segment Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4" id="control-panel-header">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-800" />
          <h2 className="text-xs font-mono font-bold text-emerald-900 tracking-widest uppercase">
            ERICON System Configurator
          </h2>
        </div>
        
        {/* Preset quick pills */}
        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm">
          ECO-CONTROL V5.2
        </span>
      </div>

      {/* QUICK PRESETS CARDS */}
      <div className="flex flex-col gap-3.5" id="system-presets-section">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest">
          Active Field Scenarios
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => applyPreset('perimeter')}
            className={`p-3 border rounded-sm text-left transition duration-200 cursor-pointer ${
              rodentSpecies === 'field_mouse' && specs.p1 <= 105
                ? 'border-emerald-600 bg-emerald-50/20'
                : 'border-slate-200 hover:border-emerald-800 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="font-mono font-bold text-emerald-800 uppercase">🌿 Perimeter Run</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Field Mouse // Flap Door</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('silo')}
            className={`p-3 border rounded-sm text-left transition duration-200 cursor-pointer ${
              rodentSpecies === 'brown_rat'
                ? 'border-emerald-600 bg-emerald-50/20'
                : 'border-slate-200 hover:border-emerald-800 bg-white hover:bg-slate-50/50'
            }`}
          >
            <div className="font-mono font-bold text-slate-700 uppercase">🌾 Grain Silo</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Brown Rat // Flex-Finger</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('winter')}
            className="p-3 border border-slate-200 hover:border-emerald-800 bg-white hover:bg-slate-50/50 rounded-sm text-left transition duration-200 cursor-pointer"
          >
            <div className="font-mono font-bold text-slate-700 uppercase">❄️ Winter Cold Run</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">8°C temp simulation</div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('peak')}
            className="p-3 border border-slate-200 hover:border-emerald-800 bg-white hover:bg-slate-50/50 rounded-sm text-left transition duration-200 cursor-pointer"
          >
            <div className="font-mono font-bold text-slate-700 uppercase">🔬 Peak Bio-Control</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">24°C ideal ventilation</div>
          </button>
        </div>
      </div>

      {/* CUSTOM PRESETS MANAGER */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-5" id="custom-presets-section">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
          Custom Research Presets
        </span>
        
        {/* Save Form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="E.g., Morogoro Field-01"
            value={newPresetLabel}
            onChange={(e) => setNewPresetLabel(e.target.value)}
            className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-slate-850 focus:border-emerald-700 outline-none"
            id="input-custom-preset-label"
          />
          <button
            type="button"
            onClick={handleSavePreset}
            className="bg-emerald-800 hover:bg-emerald-900 border border-emerald-950 text-white font-mono text-[10px] font-bold uppercase py-2 px-3 rounded cursor-pointer transition flex items-center gap-1.5 shrink-0"
            id="btn-save-custom-preset"
          >
            <Zap className="w-3.5 h-3.5" />
            Save Preset
          </button>
        </div>

        {/* Custom Presets List */}
        {customPresets.length === 0 ? (
          <p className="text-[10px] text-slate-400 font-mono italic">No custom presets saved. Type a label above to store your active core specs.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {customPresets.map((preset) => (
              <div
                key={preset.label}
                onClick={() => handleLoadPreset(preset)}
                className={`p-2.5 border rounded-sm text-left bg-white hover:bg-slate-50/50 transition cursor-pointer flex flex-col justify-between group relative border-slate-200`}
              >
                <div>
                  <div className="font-mono font-bold text-emerald-950 truncate max-w-[120px]" title={preset.label}>
                    💾 {preset.label}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    {preset.specs.p1} / {preset.specs.p2} kPa • {preset.specs.length}m
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDeletePreset(preset.label, e)}
                  title="Delete Custom Preset"
                  className="absolute right-1.5 top-1.5 p-1 text-slate-400 hover:text-rose-600 bg-slate-100/50 hover:bg-rose-50 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RODENT SPECIES SELECTOR CORES */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-5">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
          Target Rodent Species Profile
        </span>
        <div className="flex flex-col gap-2">
          {[
            { id: 'field_mouse', name: 'Field Mouse (Apodemus sylvaticus)', desc: '20-30g • Thermoneutral 21-25°C • Highly sensitive to draft velocity.', defMass: 150 },
            { id: 'house_mouse', name: 'House Mouse (Mus musculus)', desc: '15-25g • Thermoneutral 22-26°C • Fits tight 80-100mm core tubes.', defMass: 120 },
            { id: 'mastomys_natalensis', name: 'Mastomys natalensis (Multimammate Mouse)', desc: '20-80g • Thermoneutral 24-32°C • Most common field mouse in tropical Africa.', defMass: 180 },
            { id: 'arvicanthis_spp', name: 'Arvicanthis spp. (African Grass Rat)', desc: '50-150g • Thermoneutral 22-29°C • Highly abundant tropical Sub-Saharan pest.', defMass: 320 },
            { id: 'roof_rat', name: 'Roof Rat (Rattus rattus)', desc: '150-250g • Thermoneutral 20-26°C • Extremely agile climber, nests in roofs & tree crowns.', defMass: 450 },
            { id: 'brown_rat', name: 'Brown Rat (Rattus norvegicus)', desc: '200-500g • Thermoneutral 18-24°C • Heavy sewer pest. Demand high volumetric air exchange rates.', defMass: 650 },
          ].map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => {
                onChangeRodentSpecies(sp.id as any);
                // Dynamically adjust capsule mass to fit species default transfer canister
                handleSliderChange('capsuleMass', sp.defMass);
              }}
              className={`p-2.5 border rounded-sm text-left transition ${
                rodentSpecies === sp.id
                  ? 'border-emerald-600 bg-emerald-50/10 text-emerald-950 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs">{sp.name}</span>
                {rodentSpecies === sp.id && <span className="text-[9px] text-emerald-600 font-extrabold uppercase bg-emerald-100/50 px-1.5 py-0.5 rounded-sm">Selected</span>}
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-relaxed font-sans">{sp.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ONE-WAY ENTRY PORT (OWEP) MECHANICAL OPTION */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block">
          OWEP Anti-Egress Mechanics (ERICON 2023)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeOwepDesign('flap_door')}
            className={`p-2.5 border text-center font-mono rounded-sm transition ${
              owepDesign === 'flap_door'
                ? 'border-emerald-600 bg-emerald-50/10 font-bold text-emerald-900'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Design Option A</div>
            <div className="text-[8px] text-slate-400 uppercase mt-1">Gravity Flap Door</div>
          </button>

          <button
            type="button"
            onClick={() => onChangeOwepDesign('flex_finger')}
            className={`p-2.5 border text-center font-mono rounded-sm transition ${
              owepDesign === 'flex_finger'
                ? 'border-emerald-600 bg-emerald-50/10 font-bold text-emerald-900'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Design Option B</div>
            <div className="text-[8px] text-slate-400 uppercase mt-1">Flex-Finger Funnel</div>
          </button>
        </div>
        <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
          {owepDesign === 'flap_door'
            ? 'Top vertical hinge (<0.5 N counterweight) with bottom stopper ridge. Rodents push under to enter.'
            : 'Blunt-tipped radial interlocking fingers ready to compress outwards, neutralizing back-claw escape.'}
        </p>
      </div>

      {/* DIFFERENTIAL PRESSURE SECTION */}
      <div className="flex flex-col gap-4 bg-slate-50 p-4 border border-slate-200 rounded-sm">
        <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-blue-900 tracking-wider uppercase">
          <Gauge className="w-4 h-4 text-blue-600" />
          Pressure Gradients (P1 / P2)
        </div>
        
        {/* P1 (OWEP Inlet) Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-bold uppercase">Inlet Pressure (P₁)</span>
            <span className="font-semibold text-blue-900 bg-white border border-slate-300 px-2 py-0.5 rounded-sm text-[11px]">
              {specs.p1.toFixed(0)} <span className="text-[9px] text-slate-400 font-normal">kPa</span>
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            step="5"
            value={specs.p1}
            id="input-p1"
            onChange={(e) => handleSliderChange('p1', parseFloat(e.target.value))}
            className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-sm appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>100 kPa (Atm)</span>
            <span>300 kPa (Std)</span>
            <span>500 kPa (Max)</span>
          </div>
        </div>

        {/* P2 (EMA Hub Vacuum) Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-bold uppercase">Vacuum Suction (P₂)</span>
            <span className="font-semibold text-blue-900 bg-white border border-slate-300 px-2 py-0.5 rounded-sm text-[11px]">
              {specs.p2.toFixed(0)} <span className="text-[9px] text-slate-400 font-normal">kPa</span>
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={specs.p2}
            id="input-p2"
            onChange={(e) => handleSliderChange('p2', parseFloat(e.target.value))}
            className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-sm appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>10 kPa (Vac)</span>
            <span>55 kPa (Med)</span>
            <span>100 kPa (Atm)</span>
          </div>
        </div>
      </div>

      {/* CORE PIPELINE GEOMETRY */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-slate-700 tracking-wider uppercase">
          <Milestone className="w-4 h-4 text-slate-500" />
          Polyamide-6 Core Dimensions
        </div>

        {/* Inner Tube Diameter */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Tube Diameter (D)</label>
            <div className="relative">
              <input
                type="number"
                min="50"
                max="300"
                value={specs.diameter}
                id="input-diameter"
                onChange={(e) => handleSliderChange('diameter', Math.min(Math.max(parseInt(e.target.value) || 50, 50), 300))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400 uppercase">mm</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Range: 50–300mm</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Total Length (L)</label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="250"
                value={specs.length}
                id="input-length"
                onChange={(e) => handleSliderChange('length', Math.min(Math.max(parseInt(e.target.value) || 5, 5), 250))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400 uppercase">m</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Range: 5–250m</span>
          </div>
        </div>

        {/* Core Temperature & Surface Roughness */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono font-bold uppercase">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              Core Temp (T)
            </div>
            <div className="relative">
              <input
                type="number"
                min="-40"
                max="100"
                value={specs.temperature}
                id="input-temperature"
                onChange={(e) => handleSliderChange('temperature', Math.min(Math.max(parseInt(e.target.value) || 0, -40), 100))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400">°C</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Roughness (ε)</label>
            <div className="relative">
              <input
                type="number"
                min="0.0001"
                max="0.02"
                step="0.0001"
                value={specs.roughness}
                id="input-roughness"
                onChange={(e) => handleSliderChange('roughness', Math.min(Math.max(parseFloat(e.target.value) || 0.0001, 0.0001), 0.02))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* PNEUMATIC CARRIER SPECS */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-1.5 font-bold font-mono text-xs text-slate-700 tracking-wider uppercase">
          <Box className="w-4 h-4 text-indigo-500" />
          Payload Canister Profile
        </div>

        {/* Capsule Mass */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-600 font-bold uppercase">Cylinder Mass (m)</span>
            <span className="font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm text-[11px]">
              {specs.capsuleMass} <span className="text-[9px] text-slate-400">g</span>
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="4000"
            step="10"
            value={specs.capsuleMass}
            id="input-capsule-mass"
            onChange={(e) => handleSliderChange('capsuleMass', parseInt(e.target.value))}
            className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-sm appearance-none cursor-pointer"
          />
        </div>

        {/* Polyamide low-friction coefficient & Clearance seal ratios */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Friction (μ)</label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                max="0.4"
                step="0.01"
                value={specs.capsuleFriction}
                id="input-capsule-friction"
                onChange={(e) => handleSliderChange('capsuleFriction', Math.min(Math.max(parseFloat(e.target.value) || 0.01, 0.01), 0.4))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Seal Ratio</label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                max="1.0"
                step="0.01"
                value={specs.capsuleClearance}
                id="input-capsule-clearance"
                onChange={(e) => handleSliderChange('capsuleClearance', Math.min(Math.max(parseFloat(e.target.value) || 0.5, 0.5), 1.0))}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-sm p-2 focus:border-blue-900 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

