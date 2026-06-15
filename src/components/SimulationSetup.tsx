/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERICON Simulator - Tab 1: Simulation Setup Component
 */

import React, { useState } from 'react';
import { 
  Ruler, Thermometer, Layers, Zap, ArrowRight, ShieldAlert, Check, HelpCircle
} from 'lucide-react';
import { SystemSpecs, RodentSpecies } from '../types';

interface SimulationSetupProps {
  specs: SystemSpecs;
  onChangeSpecs: (newSpecs: SystemSpecs) => void;
  rodentSpecies: RodentSpecies;
  onChangeRodentSpecies: (val: RodentSpecies) => void;
  owepDesign: 'flap_door' | 'flex_finger' | 'hybrid';
  onChangeOwepDesign: (val: 'flap_door' | 'flex_finger' | 'hybrid') => void;
  
  // New setup variables
  entryDiameter: number;
  onChangeEntryDiameter: (val: number) => void;
  exitDiameter: number;
  onChangeExitDiameter: (val: number) => void;
  humidity: number;
  onChangeHumidity: (val: number) => void;
  atmosphericPressure: number;
  onChangeAtmosphericPressure: (val: number) => void;
}

export const SimulationSetup: React.FC<SimulationSetupProps> = ({
  specs,
  onChangeSpecs,
  rodentSpecies,
  onChangeRodentSpecies,
  owepDesign,
  onChangeOwepDesign,
  entryDiameter,
  onChangeEntryDiameter,
  exitDiameter,
  onChangeExitDiameter,
  humidity,
  onChangeHumidity,
  atmosphericPressure,
  onChangeAtmosphericPressure,
}) => {
  const [unitPref, setUnitPref] = useState<'metric' | 'imperial'>('metric');
  const [tempPref, setTempPref] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [roleLevel, setRoleLevel] = useState<number>(3); // Set to active Level 3 for smooth editing
  const [activeAccordion, setActiveAccordion] = useState<'flap' | 'flex' | 'hybrid' | null>(
    owepDesign === 'flap_door' ? 'flap' : owepDesign === 'flex_finger' ? 'flex' : 'hybrid'
  );

  const activePreset = React.useMemo(() => {
    if (
      specs.p1 === 104 &&
      specs.p2 === 98 &&
      specs.length === 30 &&
      specs.diameter === 80 &&
      specs.roughness === 0.0012 &&
      specs.temperature === 22 &&
      specs.capsuleMass === 150 &&
      owepDesign === 'flap_door'
    ) {
      return 'perimeter';
    }
    if (
      specs.p1 === 112 &&
      specs.p2 === 88 &&
      specs.length === 50 &&
      specs.diameter === 130 &&
      specs.roughness === 0.002 &&
      specs.temperature === 20 &&
      specs.capsuleMass === 650 &&
      owepDesign === 'flex_finger'
    ) {
      return 'warehouse';
    }
    if (
      specs.p1 === 108 &&
      specs.p2 === 92 &&
      specs.length === 40 &&
      specs.diameter === 100 &&
      specs.roughness === 0.0015 &&
      specs.temperature === 25 &&
      specs.capsuleMass === 220 &&
      owepDesign === 'hybrid'
    ) {
      return 'grain';
    }
    if (
      specs.p1 === 106 &&
      specs.p2 === 94 &&
      specs.length === 25 &&
      specs.diameter === 90 &&
      specs.roughness === 0.0015 &&
      specs.temperature === 15 &&
      specs.capsuleMass === 180 &&
      owepDesign === 'flap_door'
    ) {
      return 'mixed';
    }
    return null;
  }, [specs, owepDesign]);

  const handleSliderChange = (field: keyof SystemSpecs, value: number) => {
    let newSpecs = { ...specs, [field]: value };
    
    // Safety guard to prevent static lock on pressures
    if (field === 'p1' && value <= specs.p2) {
      newSpecs.p1 = specs.p2 + 5;
    } else if (field === 'p2' && value >= specs.p1) {
      newSpecs.p2 = Math.max(specs.p1 - 5, 10);
    }
    
    onChangeSpecs(newSpecs);
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'perimeter':
        onChangeSpecs({
          ...specs,
          p1: 104,
          p2: 98,
          length: 30,
          diameter: 80,
          roughness: 0.0012,
          temperature: 22,
          capsuleMass: 150,
        });
        onChangeRodentSpecies('field_mouse');
        onChangeOwepDesign('flap_door');
        setActiveAccordion('flap');
        break;
      case 'warehouse':
        onChangeSpecs({
          ...specs,
          p1: 112,
          p2: 88,
          length: 50,
          diameter: 130,
          roughness: 0.002,
          temperature: 20,
          capsuleMass: 650,
        });
        onChangeRodentSpecies('brown_rat');
        onChangeOwepDesign('flex_finger');
        setActiveAccordion('flex');
        break;
      case 'grain':
        onChangeSpecs({
          ...specs,
          p1: 108,
          p2: 92,
          length: 40,
          diameter: 100,
          roughness: 0.0015,
          temperature: 25,
          capsuleMass: 220,
        });
        onChangeRodentSpecies('mastomys_natalensis');
        onChangeOwepDesign('hybrid');
        setActiveAccordion('hybrid');
        break;
      case 'mixed':
        onChangeSpecs({
          ...specs,
          p1: 106,
          p2: 94,
          length: 25,
          diameter: 90,
          roughness: 0.0015,
          temperature: 15,
          capsuleMass: 180,
        });
        onChangeRodentSpecies('house_mouse');
        onChangeOwepDesign('flap_door');
        setActiveAccordion('flap');
        break;
      default:
        break;
    }
  };

  const handleOwepToggle = (type: 'flap' | 'flex' | 'hybrid') => {
    setActiveAccordion(activeAccordion === type ? null : type);
    if (type === 'flap') onChangeOwepDesign('flap_door');
    else if (type === 'flex') onChangeOwepDesign('flex_finger');
    else onChangeOwepDesign('hybrid');
  };

  return (
    <div className="space-y-6" id="setup-tab-root-container">
      {/* 2-Column Grid for Setup Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUMN 1 CARD 1: PIPELINE GEOMETRY */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Ruler className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Pipeline Geometry
            </h3>
          </div>

          <div className="space-y-4">
            {/* Tube Diameter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Tube Inner Diameter (D)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{specs.diameter} mm</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="5"
                value={specs.diameter}
                onChange={(e) => handleSliderChange('diameter', parseInt(e.target.value))}
                className="w-full h-1.5 accent-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>50 mm</span>
                <span>175 mm</span>
                <span>300 mm</span>
              </div>
            </div>

            {/* Tunnel Length */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Tunnel Length (L)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{specs.length} m</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={specs.length}
                onChange={(e) => handleSliderChange('length', parseInt(e.target.value))}
                className="w-full h-1.5 accent-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>5 m</span>
                <span>125 m</span>
                <span>250 m</span>
              </div>
            </div>

            {/* Pipe Roughness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Pipe Roughness (ε)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{specs.roughness.toFixed(4)} mm</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.02"
                step="0.0001"
                value={specs.roughness}
                onChange={(e) => handleSliderChange('roughness', parseFloat(e.target.value))}
                className="w-full h-1.5 accent-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0.0001 mm (S)</span>
                <span>0.010 mm</span>
                <span>0.020 mm (R)</span>
              </div>
            </div>

            {/* Grid for newly asked Entry Diameter & Exit Diameter */}
            <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Entry Diameter</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={entryDiameter}
                    onChange={(e) => onChangeEntryDiameter(Math.min(Math.max(parseInt(e.target.value) || 10, 10), 300))}
                    className="w-full text-xs font-mono font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2 Outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400 uppercase">mm</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-mono font-bold uppercase">Exit Diameter</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={exitDiameter}
                    onChange={(e) => onChangeExitDiameter(Math.min(Math.max(parseInt(e.target.value) || 10, 10), 300))}
                    className="w-full text-xs font-mono font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-2 Outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[9px] font-mono text-slate-400 uppercase">mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 1 CARD 2: ENVIRONMENTAL CONDITIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Thermometer className="w-4.5 h-4.5 text-rose-500" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Environmental Conditions
            </h3>
          </div>

          <div className="space-y-4">
            {/* Temperature */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Ambient Temp (T)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{specs.temperature} °C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                step="1"
                value={specs.temperature}
                onChange={(e) => handleSliderChange('temperature', parseInt(e.target.value))}
                className="w-full h-1.5 accent-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>-10 °C</span>
                <span>20 °C</span>
                <span>50 °C</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Relative Humidity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{humidity} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={humidity}
                onChange={(e) => onChangeHumidity(parseInt(e.target.value))}
                className="w-full h-1.5 accent-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>0 % (Dry)</span>
                <span>50 %</span>
                <span>100 % (Wet)</span>
              </div>
            </div>

            {/* Atmospheric Pressure */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-500 font-bold uppercase">Atmospheric Pressure</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{atmosphericPressure.toFixed(1)} kPa</span>
              </div>
              <input
                type="range"
                min="80"
                max="120"
                step="0.5"
                value={atmosphericPressure}
                onChange={(e) => onChangeAtmosphericPressure(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>80.0 kPa (High Alt)</span>
                <span>101.3 kPa (Standard)</span>
                <span>120.0 kPa (Dense Sealevel)</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 CARD 1: SCENARIO PRESETS (Spans full-width to utilize empty side space & avoid word congestion) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs flex flex-col gap-4 md:col-span-2" id="scenarios-presets-stretched-card">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Zap className="w-4.5 h-4.5 text-amber-500 ml-0.5 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Scenario Presets
            </h3>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Apply pre-calibrated configurations optimizing physical environmental pressures, capsule friction, and safe limits for target campaigns.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => applyPreset('perimeter')}
              className={`ericon-preset-spec-btn p-3 border rounded-lg text-center transition-all duration-200 select-none flex items-center justify-center h-16 cursor-pointer ${
                activePreset === 'perimeter'
                  ? 'ericon-preset-spec-btn-active border-emerald-850 bg-[#15462D] text-white font-extrabold shadow-md ring-2 ring-emerald-500/20 shadow-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <span className="text-[10.5px] tracking-wide uppercase">
                🌿 Farm Perimeter
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('warehouse')}
              className={`ericon-preset-spec-btn p-3 border rounded-lg text-center transition-all duration-200 select-none flex items-center justify-center h-16 cursor-pointer ${
                activePreset === 'warehouse'
                  ? 'ericon-preset-spec-btn-active border-emerald-850 bg-[#15462D] text-white font-extrabold shadow-md ring-2 ring-emerald-500/20 shadow-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <span className="text-[10.5px] tracking-wide uppercase">
                🏢 Warehouse
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('grain')}
              className={`ericon-preset-spec-btn p-3 border rounded-lg text-center transition-all duration-200 select-none flex items-center justify-center h-16 cursor-pointer ${
                (activePreset === 'grain' || activePreset === 'mixed')
                  ? 'ericon-preset-spec-btn-active border-emerald-850 bg-[#15462D] text-white font-extrabold shadow-md ring-2 ring-emerald-500/20 shadow-[#15462D]/20'
                  : 'border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold'
              }`}
            >
              <span className="text-[10px] tracking-wide uppercase">
                🏡 Peridomestic / Mixed Env
              </span>
            </button>
          </div>

          <div className={`p-3 rounded-lg text-[10.5px] font-mono text-center flex items-center justify-center gap-2 transition-all border ${
            activePreset === null 
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-900 dark:text-emerald-400 font-extrabold' 
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-500'
          }`}>
            <span className={`w-2 h-2 rounded-full ${activePreset === null ? 'bg-emerald-600 animate-pulse' : 'bg-slate-350 dark:bg-slate-700'}`} />
            <span className="uppercase tracking-wider">
              {activePreset === null ? 'Custom Scenario Activated (Manual adjustments)' : 'Preset Configuration Locked & Verified'}
            </span>
          </div>
        </div>

      </div>

      {/* OWEP SELECTION PORTAL (LIGHTWEIGHT SYSTEM ACCORDION SELECTOR WITH NEW GRAPHICS IN TAB 1) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4" id="owep-selection-lightweight-block">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <HelpCircle className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            One-Way Entry Port (OWEP) Setup Choices
          </h3>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Mechanical non-lethal backpressure mechanism securing one-way unidirectional transfer. Select an anti-egress configuration below:
        </p>

        <div className="space-y-2">
          
          {/* OWEP Design 1: Gravity-Fed Flap Gate */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleOwepToggle('flap')}
              className={`w-full flex items-center justify-between p-3 text-left font-mono text-[11px] transition duration-200 select-none cursor-pointer ${
                owepDesign === 'flap_door'
                  ? 'bg-emerald-50/15 dark:bg-emerald-950/20 font-bold border-l-4 border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/40 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${owepDesign === 'flap_door' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>One-Way Entry Port: Gravity-Fed Flap Gate</span>
              </span>
              <span className="text-slate-400 text-xs">
                {activeAccordion === 'flap' ? '▼' : '►'}
              </span>
            </button>
            {activeAccordion === 'flap' && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <p>Lightweight pivot hinge (&lt;0.5 N resist force) allows comfortable entryway. Stop-ridge blocks backwards claw egress manipulation.</p>
                </div>
              </div>
            )}
          </div>

          {/* OWEP Design 2: Radial Flex-Finger Funnel */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleOwepToggle('flex')}
              className={`w-full flex items-center justify-between p-3 text-left font-mono text-[11px] transition duration-200 select-none cursor-pointer ${
                owepDesign === 'flex_finger'
                  ? 'bg-emerald-50/15 dark:bg-emerald-950/20 font-bold border-l-4 border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/40 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${owepDesign === 'flex_finger' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>One-Way Entry Port: Radial Flex-Finger Funnel</span>
              </span>
              <span className="text-slate-400 text-xs">
                {activeAccordion === 'flex' ? '▼' : '►'}
              </span>
            </button>
            {activeAccordion === 'flex' && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p>Flexible interlocking radial tines secure passage. Comfortably expands for rodent transit and seals instantly upon backwards attempts.</p>
                </div>
              </div>
            )}
          </div>

          {/* OWEP Design 3: Hybrid Adaptive OWEP */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleOwepToggle('hybrid')}
              className={`w-full flex items-center justify-between p-3 text-left font-mono text-[11px] transition duration-200 select-none cursor-pointer ${
                owepDesign === 'hybrid'
                  ? 'bg-emerald-50/15 dark:bg-emerald-950/20 font-bold border-l-4 border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/40 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${owepDesign === 'hybrid' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                <span>One-Way Entry Port: Hybrid Adaptive OWEP</span>
              </span>
              <span className="text-slate-400 text-xs">
                {activeAccordion === 'hybrid' ? '▼' : '►'}
              </span>
            </button>
            {activeAccordion === 'hybrid' && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in">
                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <p>Integrates a spring-loaded vertical hinge with low friction plastic radial interlocking fingers for maximum egress securement.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
