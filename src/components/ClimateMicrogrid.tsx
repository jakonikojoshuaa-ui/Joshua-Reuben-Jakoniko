import React, { useState, useEffect } from 'react';
import { Thermometer, Wind, AlertTriangle, ShieldCheck, HelpCircle, RotateCcw } from 'lucide-react';

interface ClimateMeasurements {
  temp: number; // °C
  wind: number; // m/s
}

export const ClimateMicrogrid: React.FC = () => {
  // Climate states for the three crucial sub-systems
  const [ema, setEma] = useState<ClimateMeasurements>({ temp: 22, wind: 4.5 });
  const [crt, setCrt] = useState<ClimateMeasurements>({ temp: 20, wind: 3.2 });
  const [pipe, setPipe] = useState<ClimateMeasurements>({ temp: 15, wind: 8.4 });

  // Safety threshold calculations
  const calculateAverages = () => {
    const avgTemp = (ema.temp + crt.temp + pipe.temp) / 3;
    const avgWind = (ema.wind + crt.wind + pipe.wind) / 3;
    return {
      avgTemp: parseFloat(avgTemp.toFixed(1)),
      avgWind: parseFloat(avgWind.toFixed(1)),
    };
  };

  const { avgTemp, avgWind } = calculateAverages();

  // Determine transit lethality classification based on bio-environmental physics
  const getLethalityReport = () => {
    let isLethal = false;
    const reasons: string[] = [];

    if (avgTemp <= 5) {
      isLethal = true;
      reasons.push('Severe Ambient Frigidity: High hypothermic shock risk (< 5°C).');
    }
    if (avgTemp >= 38) {
      isLethal = true;
      reasons.push('Extreme Thermal Danger: High risk of dehydrative heatstroke (>= 38°C).');
    }
    if (avgWind >= 18) {
      isLethal = true;
      reasons.push('Turbulent Kinetic Gale: Wind velocity meets fatal asphyxiation or chest compression threshold (>= 18m/s).');
    }
    if (avgTemp <= 12 && avgWind >= 12) {
      isLethal = true;
      reasons.push('Combined Cold Wind Chill: High risk of sudden respiratory distress or freezing shock.');
    }

    return {
      isLethal,
      reasons: reasons.length > 0 ? reasons : ['Environmental metrics are within acceptable rodent bio-stabilities.'],
    };
  };

  const report = getLethalityReport();

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded p-5 font-mono text-xs text-slate-300 shadow-xl relative overflow-hidden" id="ericon-climate-sensors shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/40">
            <Thermometer className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-[11.5px] font-black uppercase text-white tracking-widest">
              Biothermal Microclimate Rig
            </h3>
            <p className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">
              Sub-Sector Sensors: EMA, CRT & PIPE TUNNEL
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setEma({ temp: 22, wind: 4.5 });
            setCrt({ temp: 20, wind: 3.2 });
            setPipe({ temp: 15, wind: 8.4 });
          }}
          className="text-slate-500 hover:text-white transition-colors duration-150 p-1 rounded-sm border border-transparent hover:border-slate-800 hover:bg-slate-950/50"
          title="Reset Sensor Calibration Defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of the three sub-systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 mb-5">
        
        {/* EMA Sub-sector */}
        <div className="bg-slate-950/60 rounded border border-slate-800 p-3.5 relative" id="ema-microclimate-unit">
          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-1.5">
            <span className="text-[10px] font-black text-emerald-400 tracking-wider">01 // EMA STATION</span>
            <span className="bg-slate-900 text-[8.5px] px-1.5 py-0.5 border border-slate-800 rounded font-bold text-slate-400">AGGR-V4</span>
          </div>
          
          {/* Temperature control */}
          <div className="space-y-1.5 mb-3.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                Temperature:
              </span>
              <span className="text-white font-extrabold">{ema.temp}°C</span>
            </div>
            <input 
              type="range"
              min="-20"
              max="60"
              value={ema.temp}
              onChange={(e) => setEma({ ...ema, temp: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>-20°C</span>
              <span>Comfort Range (18°-28°)</span>
              <span>60°C</span>
            </div>
          </div>

          {/* Wind Speed control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" />
                Air movement:
              </span>
              <span className="text-white font-extrabold">{ema.wind} m/s</span>
            </div>
            <input 
              type="range"
              min="0"
              max="35"
              step="0.1"
              value={ema.wind}
              onChange={(e) => setEma({ ...ema, wind: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>0 m/s</span>
              <span>Lethal Gales (&gt;18m/s)</span>
              <span>35 m/s</span>
            </div>
          </div>
        </div>

        {/* CRT Sub-sector */}
        <div className="bg-slate-950/60 rounded border border-slate-800 p-3.5 relative" id="crt-microclimate-unit">
          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-1.5">
            <span className="text-[10px] font-black text-emerald-400 tracking-wider">02 // CRT TERMINAL</span>
            <span className="bg-slate-900 text-[8.5px] px-1.5 py-0.5 border border-slate-800 rounded font-bold text-slate-400">RECOV-H3</span>
          </div>
          
          {/* Temperature control */}
          <div className="space-y-1.5 mb-3.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                Temperature:
              </span>
              <span className="text-white font-extrabold">{crt.temp}°C</span>
            </div>
            <input 
              type="range"
              min="-20"
              max="60"
              value={crt.temp}
              onChange={(e) => setCrt({ ...crt, temp: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>-20°C</span>
              <span>Comfort Range (18°-28°)</span>
              <span>60°C</span>
            </div>
          </div>

          {/* Wind Speed control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" />
                Air movement:
              </span>
              <span className="text-white font-extrabold">{crt.wind} m/s</span>
            </div>
            <input 
              type="range"
              min="0"
              max="35"
              step="0.1"
              value={crt.wind}
              onChange={(e) => setCrt({ ...crt, wind: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>0 m/s</span>
              <span>Gentle Drafting</span>
              <span>35 m/s</span>
            </div>
          </div>
        </div>

        {/* PIPE TUNNEL Sub-sector */}
        <div className="bg-slate-950/60 rounded border border-slate-800 p-3.5 relative" id="pipe-microclimate-unit">
          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-1.5">
            <span className="text-[10px] font-black text-emerald-400 tracking-wider">03 // PIPE CONDUIT</span>
            <span className="bg-slate-900 text-[8.5px] px-1.5 py-0.5 border border-slate-800 rounded font-bold text-slate-400">TRANS-F8</span>
          </div>
          
          {/* Temperature control */}
          <div className="space-y-1.5 mb-3.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                Temperature:
              </span>
              <span className="text-white font-extrabold">{pipe.temp}°C</span>
            </div>
            <input 
              type="range"
              min="-20"
              max="60"
              value={pipe.temp}
              onChange={(e) => setPipe({ ...pipe, temp: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>-20°C</span>
              <span>In-transit Vacuum</span>
              <span>60°C</span>
            </div>
          </div>

          {/* Wind Speed control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" />
                Air movement:
              </span>
              <span className="text-white font-extrabold">{pipe.wind} m/s</span>
            </div>
            <input 
              type="range"
              min="0"
              max="35"
              step="0.1"
              value={pipe.wind}
              onChange={(e) => setPipe({ ...pipe, wind: parseFloat(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[7px] text-slate-500">
              <span>0 m/s</span>
              <span>Pneumatic Suctions</span>
              <span>35 m/s</span>
            </div>
          </div>
        </div>

      </div>

      {/* Aggregate Computations and Lethal vs Stable Simulation Report */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden" id="environmental-sensor-aggregator">
        {/* Glow corner representing current level */}
        <div className={`absolute bottom-0 right-0 w-28 h-28 opacity-10 blur-xl pointer-events-none rounded-full ${
          report.isLethal ? 'bg-rose-500' : 'bg-emerald-500'
        }`} />

        <div className="flex-1 w-full space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-900 pb-2">
            <span className="bg-slate-800 border border-slate-700 text-slate-300 font-black text-[9.5px] px-2 py-0.5 rounded tracking-wide">
              SYSTEM ATMOSPHERIC RECKONER
            </span>
            <span className="text-slate-400 text-[10px] font-bold">
              AGGREGATED METRIC COMPUTATION ENGINE
            </span>
          </div>

          {/* Calculations Table */}
          <div className="grid grid-cols-2 gap-3 max-w-md pt-0.5">
            <div className="bg-slate-900/40 border border-slate-900 p-2 rounded flex items-center gap-2.5">
              <Thermometer className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-[8.5px] text-slate-500 uppercase font-extrabold">Avg Temp Estimate</p>
                <p className={`text-sm font-black ${avgTemp <= 5 || avgTemp >= 38 ? 'text-rose-400' : 'text-white'}`}>
                  {avgTemp}°C
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-2 rounded flex items-center gap-2.5">
              <Wind className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
              <div>
                <p className="text-[8.5px] text-slate-500 uppercase font-extrabold">Avg Air Movement</p>
                <p className={`text-sm font-black ${avgWind >= 18 ? 'text-rose-400' : 'text-white'}`}>
                  {avgWind} m/s
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lethal/Stable Indicator Card */}
        <div className="shrink-0 w-full md:w-[260px] flex flex-col justify-center">
          <div className={`p-4 rounded border-2 flex flex-col items-center justify-center text-center gap-2 ${
            report.isLethal 
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-950/20' 
              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/10'
          }`} id="climate-lethality-status-card">
            
            <div className="flex items-center gap-1.5 font-black uppercase text-[11px] tracking-widest">
              {report.isLethal ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-rose-400">LETHAL CRITICAL</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">STABLE / SAFE</span>
                </>
              )}
            </div>

            <p className="text-[9.5px] leading-relaxed select-all">
              {report.reasons[0]}
            </p>

            <div className="text-[7.5px] text-zinc-500 font-extrabold pt-1 uppercase tracking-wider border-t border-slate-900 w-full">
              {report.isLethal ? '⚠️ RED DIRECTIVE: SUSPEND TRANSITS' : '✅ GREEN DIRECTIVE: INTAKE GRANTED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
