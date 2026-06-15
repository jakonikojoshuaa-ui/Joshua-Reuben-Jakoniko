/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ERICON Simulator - Tab 2: Airflow Simulator Dashboard
 */

import React from 'react';
import { Play, Pause, RotateCcw, Wind, Gauge, Activity, RefreshCw } from 'lucide-react';
import { SystemSpecs, PhysicsCalculations, CapsuleSimulation } from '../types';

interface AirflowSimulatorProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  capsule: CapsuleSimulation;
  onLaunchCapsule: () => void;
  onResumeCapsule: () => void;
  onPauseCapsule: () => void;
  onResetCapsule: () => void;
}

export const AirflowSimulator: React.FC<AirflowSimulatorProps> = ({
  specs,
  calc,
  capsule,
  onLaunchCapsule,
  onResumeCapsule,
  onPauseCapsule,
  onResetCapsule,
}) => {
  // Compute Air Exchange Rate (ACH)
  const volumeTube = Math.PI * Math.pow(specs.diameter / 2000, 2) * specs.length;
  const flowHourly = calc.flowRateVolumetric * 3600;
  const ach = flowHourly / Math.max(volumeTube, 0.001);

  // Compute Pressure Gradient (Pa / m)
  const pressureGrad = ((specs.p1 - specs.p2) * 1000) / specs.length;

  // Determine Flow Status Highlight matches
  const isNegativePressure = specs.p2 > specs.p1;
  const regime = calc.flowRegume; // 'Laminar' | 'Transition' | 'Turbulent'

  const isLaminarActive = !isNegativePressure && regime === 'Laminar';
  const isTransitionActive = !isNegativePressure && regime === 'Transition';
  const isTurbulentActive = !isNegativePressure && regime === 'Turbulent';

  // Format percentage for capsule along the pipeline
  const capsuleProgress = Math.min(Math.max((capsule.position / specs.length) * 100, 0), 100);

  return (
    <div className="space-y-6" id="airflow-simulator-workspace-container">
      
      {/* SECTION 1: DYNAMIC PIPELINE PROGRESS & CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100 flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Pneumatic Capsule Transit Control
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Execute live fluid dynamics particle integration sweeps along the tube.
            </p>
          </div>

          {/* SIMULATION STATE BUTTONS */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {!capsule.isActive && capsule.position === 0 ? (
              <button
                type="button"
                onClick={onLaunchCapsule}
                className="px-3.5 py-2 bg-emerald-650 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Run Simulation
              </button>
            ) : capsule.isActive ? (
              <button
                type="button"
                onClick={onPauseCapsule}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={onResumeCapsule}
                disabled={capsule.isCompleted}
                className="px-3.5 py-2 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer border-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Resume
              </button>
            )}

            <button
              type="button"
              onClick={onResetCapsule}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* CAPSULE SCHEMATIC LINE (COMPACT RUNNERS) */}
        <div className="relative font-mono bg-slate-950/60 p-4 border border-slate-850 rounded-lg">
          <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-widest mb-3">
            <span>Entry (P1)</span>
            {capsule.isCompleted ? (
              <span className="text-emerald-400 font-extrabold animate-pulse">● Destination Received</span>
            ) : capsule.isActive ? (
              <span className="text-blue-400 font-mono">Position: {capsule.position.toFixed(2)} m / {specs.length} m</span>
            ) : capsule.position > 0 ? (
              <span className="text-amber-400">● Paused at {capsule.position.toFixed(2)} m</span>
            ) : (
              <span>Idling</span>
            )}
            <span>Terminal (P2)</span>
          </div>

          <div className="h-2 bg-slate-800 rounded-full relative overflow-visible mb-1">
            {/* Background flow effect */}
            <div 
              className={`absolute inset-0 rounded-full opacity-10 transition-colors ${
                isNegativePressure ? 'bg-emerald-500' : isTurbulentActive ? 'bg-rose-500' : isTransitionActive ? 'bg-amber-500' : 'bg-blue-500'
              }`} 
            />
            
            {/* Capsule Dot Marker */}
            <div 
              style={{ left: `${capsuleProgress}%` }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-75 ${
                capsule.isCompleted ? 'bg-emerald-500' : capsule.isActive ? 'bg-blue-500 animate-pulse scale-110' : 'bg-slate-500'
              }`}
            >
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex justify-between text-[8px] text-slate-500">
            <span>0.0 m</span>
            <span>{(specs.length / 2).toFixed(1)} m</span>
            <span>{specs.length}.0 m</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: DYNAMIC ENGINEERING RESULTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4" id="airflow-stats-grid">
        
        {/* Air Velocity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
            <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Air Velocity</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {calc.velocity.toFixed(3)} <span className="text-xs font-medium text-slate-500">m/s</span>
            </span>
          </div>
        </div>

        {/* Pressure Gradient */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Pressure Gradient</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {pressureGrad.toFixed(1)} <span className="text-xs font-medium text-slate-500">Pa/m</span>
            </span>
          </div>
        </div>

        {/* Air Exchange Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Air Exchange Rate</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {ach.toFixed(1)} <span className="text-xs font-medium text-slate-500">ACH</span>
            </span>
          </div>
        </div>

        {/* Reynolds Number */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase leading-none mb-1">Reynolds Number</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">
              {calc.reynoldsNumber.toFixed(0)} <span className="text-xs font-medium text-slate-500">Re</span>
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 3: FLOW STATUS INDICATORS GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-3xs space-y-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Pneumatic Fluid Classification
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Real-time classification based on Reynolds pipe transport variables and boundary pressure inputs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs font-mono">
          
          {/* LAMINAR INDICATOR BOX */}
          <div 
            className={`border rounded-lg p-3.5 flex flex-col justify-between h-24 transition-all duration-200 ${
              isLaminarActive
                ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/25 ring-2 ring-blue-500/10'
                : 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 opacity-45'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-700 dark:text-blue-400 text-[10px] uppercase">
                🟦 Laminar
              </span>
              {isLaminarActive && (
                <span className="text-[7.5px] bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Stable, parallel stream-lined flow paths. Quiet, minimal structural frictional drag.
            </p>
          </div>

          {/* TRANSITIONAL INDICATOR BOX */}
          <div 
            className={`border rounded-lg p-3.5 flex flex-col justify-between h-24 transition-all duration-200 ${
              isTransitionActive
                ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/25 ring-2 ring-amber-500/10'
                : 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 opacity-45'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-700 dark:text-amber-400 text-[10px] uppercase">
                🟧 Transitional
              </span>
              {isTransitionActive && (
                <span className="text-[7.5px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Intermittent flow fluctuations between streamlined lines and minor kinetic shears.
            </p>
          </div>

          {/* TURBULENT INDICATOR BOX */}
          <div 
            className={`border rounded-lg p-3.5 flex flex-col justify-between h-24 transition-all duration-200 ${
              isTurbulentActive
                ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/25 ring-2 ring-rose-500/10'
                : 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 opacity-45'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-rose-750 dark:text-rose-400 text-[10px] uppercase">
                🟥 Turbulent
              </span>
              {isTurbulentActive && (
                <span className="text-[7.5px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Vigorous, swirling fluid vortex elements. Generates severe secondary aerodynamic resistance.
            </p>
          </div>

          {/* NEGATIVE PRESSURE ZONE INDICATOR BOX */}
          <div 
            className={`border rounded-lg p-3.5 flex flex-col justify-between h-24 transition-all duration-200 ${
              isNegativePressure
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/25 ring-2 ring-emerald-500/10'
                : 'border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 opacity-45'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-800 dark:text-emerald-400 text-[10px] uppercase">
                🟩 Negative Zone
              </span>
              {isNegativePressure && (
                <span className="text-[7.5px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Outlet pressure (P2) exceeds input pressure (P1), inducing reverse siphon/vent airflow loops.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
