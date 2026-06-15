/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sprout, ShieldCheck, AreaChart, TrendingUp, AlertTriangle, Coins, Sparkles, Sliders
} from 'lucide-react';

interface FarmMetric {
  categoryName: string;
  badge: string;
  cropDamagePct: number;
  yieldTons: number;
  rodentActivityIndex: 'Near Zero' | 'Moderate' | 'Severe';
  economicLossValue: number;
  explanation: string;
  color: string;
}

const CATEGORY_DATA: Record<'fully_protected' | 'semi_protected' | 'unprotected_control', FarmMetric> = {
  fully_protected: {
    categoryName: 'ERICON Fully Protected Farm',
    badge: '100% Perimeter Suction Redirection',
    cropDamagePct: 1.2,
    yieldTons: 5.4,
    rodentActivityIndex: 'Near Zero',
    economicLossValue: 40,
    color: '#065f46', // emerald-800
    explanation: 'Utilizes fully secured OWEP counter-weighted inlet gates. Multi-point suction barrier prevents 98.8% of biological vectors from penetrating grain storage boundaries, preserving seasonal crops.'
  },
  semi_protected: {
    categoryName: 'ERICON Semi-Protected Farm',
    badge: '60% Partial Barrier Coverage',
    cropDamagePct: 11.5,
    yieldTons: 4.1,
    rodentActivityIndex: 'Moderate',
    economicLossValue: 350,
    color: '#b45309', // amber-700
    explanation: 'Features local suction nodes but lacks a surrounding physical trench array. Murid vectors successfully penetrate perimeter boundaries occasionally, leading to minor bite indices and crop damage.'
  },
  unprotected_control: {
    categoryName: 'Non-ERICON Control Farm',
    badge: 'No Barrier Treatment (Baseline)',
    cropDamagePct: 28.6,
    yieldTons: 2.8,
    rodentActivityIndex: 'Severe',
    economicLossValue: 1280,
    color: '#991b1b', // red-800
    explanation: 'Exposed standard smallholder farm. Multi-species feeding patterns cause major biosecurity issues, catastrophic grain store infiltration, and extreme economic destruction indexes.'
  }
};

export function FarmsTab() {
  const [activeSegment, setActiveSegment] = useState<'fully_protected' | 'semi_protected' | 'unprotected_control'>('fully_protected');
  const [selectedCrop, setSelectedCrop] = useState<'Maize' | 'Pearl Millet' | 'Sorghum'>('Maize');

  const selectedData = CATEGORY_DATA[activeSegment];

  // Adjust mock outputs depending on crop type to provide highly interactive fidelity
  const adjustedDamage = selectedCrop === 'Maize' ? selectedData.cropDamagePct : 
                         selectedCrop === 'Pearl Millet' ? selectedData.cropDamagePct * 0.8 : selectedData.cropDamagePct * 0.6;
  const adjustedYield = selectedCrop === 'Maize' ? selectedData.yieldTons :
                        selectedCrop === 'Pearl Millet' ? selectedData.yieldTons * 0.75 : selectedData.yieldTons * 0.62;
  const adjustedLoss = selectedCrop === 'Maize' ? selectedData.economicLossValue :
                       selectedCrop === 'Pearl Millet' ? selectedData.economicLossValue * 0.85 : selectedData.economicLossValue * 0.55;

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      {/* Selector and Crop Slider */}
      <div className="bg-white border rounded-xl p-4 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
          {Object.entries(CATEGORY_DATA).map(([key, data]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSegment(key as any)}
              className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider border cursor-pointer transition ${
                activeSegment === key 
                  ? 'bg-emerald-900 border-emerald-950 text-white shadow-3xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {key === 'fully_protected' && '🛡️ Fully Protected'}
              {key === 'semi_protected' && '⚠ Semi Protected'}
              {key === 'unprotected_control' && '❌ Control Baseline'}
            </button>
          ))}
        </div>

        {/* Crop Select Slider */}
        <div className="flex items-center gap-1.5 bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono text-[9px] uppercase font-bold text-slate-400 mr-1">Crop Type:</span>
          {['Maize', 'Pearl Millet', 'Sorghum'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c as any)}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                selectedCrop === c ? 'bg-white border text-[#15462D] font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Category Dossier Summary */}
        <div className="lg:col-span-4 bg-white border rounded-xl p-5 shadow-3xs flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[9px] font-mono font-black uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded tracking-wide leading-none select-none">
              Experimental Core Segment
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
              {selectedData.categoryName}
            </h3>
            <span className="text-[10px] font-mono text-[#15462D] font-bold block mt-0.5">
              📌 {selectedData.badge}
            </span>
            <p className="text-xs text-slate-650 leading-relaxed pt-2">
              {selectedData.explanation}
            </p>
          </div>

          <div className="bg-emerald-50 bg-opacity-20 border border-emerald-150 p-3 rounded-lg flex items-center gap-2 mt-4 text-[10.5px]">
            <span className="font-mono text-emerald-800">💡</span>
            <p className="text-slate-650">Suction displacement maintains pristine ecological Shannon ratings inside adjacent corridors.</p>
          </div>
        </div>

        {/* Right Side: Key Indicators Tracker Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Indicator 1: Crop Damage Index */}
          <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">Indicator 1</span>
                <h4 className="font-extrabold text-slate-800 mt-1 leading-tight text-xs">Acreage Crop Damage Ratio</h4>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="pt-2">
              <span className="text-2xl font-mono font-black text-slate-900">{adjustedDamage.toFixed(1)}%</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Mean plants damaged per 1000 sampled canopy nodes.</p>
            </div>
            {/* simple bar visualization */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-emerald-850 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, adjustedDamage * 3))}%` }} 
              />
            </div>
          </div>

          {/* Indicator 2: Yield Tons */}
          <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">Indicator 2</span>
                <h4 className="font-extrabold text-slate-800 mt-1 leading-tight text-xs">Average Yield output</h4>
              </div>
              <Sprout className="w-4 h-4 text-emerald-855 shrink-0" />
            </div>
            <div className="pt-2">
              <span className="text-2xl font-mono font-black text-emerald-805">{adjustedYield.toFixed(2)} Tons / Ha</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Estimated dry grain yield cleared for local smallholders.</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-[#15462D] h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, adjustedYield * 15))}%` }} 
              />
            </div>
          </div>

          {/* Indicator 3: Rodent Activity Index */}
          <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">Indicator 3</span>
                <h4 className="font-extrabold text-slate-800 mt-1 leading-tight text-xs">Murine Activity Index</h4>
              </div>
              <ShieldCheck className="w-4 h-4 text-teal-605 shrink-0" />
            </div>
            <div className="pt-2">
              <span className="text-2xl font-mono font-black text-slate-800">{selectedData.rodentActivityIndex}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Based on electronic EMA sensor burrow checks.</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-teal-600 h-full transition-all duration-500" 
                style={{ width: selectedData.rodentActivityIndex === 'Near Zero' ? '15%' : selectedData.rodentActivityIndex === 'Moderate' ? '50%' : '100%' }} 
              />
            </div>
          </div>

          {/* Indicator 4: Economic Value Saved list */}
          <div className="bg-white border rounded-xl p-4 shadow-3xs space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">Indicator 4</span>
                <h4 className="font-extrabold text-slate-800 mt-1 leading-tight text-xs">Estimated Financial Loss Index</h4>
              </div>
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <div className="pt-2">
              <span className="text-2xl font-mono font-black text-slate-900">${adjustedLoss.toFixed(0)} USD / Ha</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Accrued cost from broken kernels or mold infection.</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-amber-600 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(5, adjustedLoss / 13))}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
