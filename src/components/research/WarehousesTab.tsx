/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Sliders, ShieldCheck, Activity, ShieldAlert,
  ArrowRight, Coins, Database, AlertCircle
} from 'lucide-react';

interface WarehouseUnit {
  id: string;
  name: string;
  type: 'Cooperative Silo' | 'Traditional Depository' | 'Bulk Vault';
  commodity: 'Maize' | 'Pearl Millet' | 'Sorghum' | 'Mixed Legumes';
  protectionStatus: 'Fully Integrated ERICON' | 'Partially Maintained' | 'Baseline (No Treatment)';
  rodentIncidentsCount: number; // Month-to-date sightings or trap triggers
  estimatedWeightLossKg: number;
  economicValueLossUSD: number;
  storedVolumeMetricTons: number;
}

const PRESET_WAREHOUSES: WarehouseUnit[] = [
  {
    id: 'WH-MOR-01',
    name: 'Morogoro Central Cooperative Silo',
    type: 'Cooperative Silo',
    commodity: 'Maize',
    protectionStatus: 'Fully Integrated ERICON',
    rodentIncidentsCount: 3,
    estimatedWeightLossKg: 42,
    economicValueLossUSD: 18,
    storedVolumeMetricTons: 350
  },
  {
    id: 'WH-MOR-02',
    name: 'Gairo District Farmer Union Vault',
    type: 'Bulk Vault',
    commodity: 'Pearl Millet',
    protectionStatus: 'Fully Integrated ERICON',
    rodentIncidentsCount: 1,
    estimatedWeightLossKg: 10,
    economicValueLossUSD: 4,
    storedVolumeMetricTons: 180
  },
  {
    id: 'WH-GAI-01',
    name: 'Lukobe Traditional Depository Network',
    type: 'Traditional Depository',
    commodity: 'Sorghum',
    protectionStatus: 'Baseline (No Treatment)',
    rodentIncidentsCount: 95,
    estimatedWeightLossKg: 1450,
    economicValueLossUSD: 640,
    storedVolumeMetricTons: 85
  },
  {
    id: 'WH-KIL-04',
    name: 'Sokoine University Experimental Store',
    type: 'Cooperative Silo',
    commodity: 'Mixed Legumes',
    protectionStatus: 'Partially Maintained',
    rodentIncidentsCount: 18,
    estimatedWeightLossKg: 240,
    economicValueLossUSD: 110,
    storedVolumeMetricTons: 120
  }
];

export function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<WarehouseUnit[]>(PRESET_WAREHOUSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedWhId, setSelectedWhId] = useState<string>('WH-MOR-01');

  const filteredWHs = useMemo(() => {
    return warehouses.filter(w => {
      const matchSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || w.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [warehouses, searchQuery, typeFilter]);

  const selectedWH = useMemo(() => {
    return warehouses.find(w => w.id === selectedWhId) || warehouses[0] || null;
  }, [warehouses, selectedWhId]);

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      {/* Search and Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-3xs flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        <div className="flex gap-2.5 items-center w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by SKU or warehouse code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-[240px] focus:outline-none focus:ring-1 focus:ring-[#15462D]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border px-3 py-1.5 rounded-lg text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select 
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-slate-800 text-[11.5px]"
            >
              <option value="all">All Depots</option>
              <option value="Cooperative Silo">Cooperative Silos</option>
              <option value="Bulk Vault">Bulk Vaults</option>
              <option value="Traditional Depository">Traditional Stores</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono font-bold leading-none uppercase select-none">
          Active Surveillance Nodes: {filteredWHs.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Warehouse Master List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {filteredWHs.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-xs text-slate-450 font-mono italic">
              No matching storage facilities logged in view.
            </div>
          ) : (
            filteredWHs.map(w => {
              const isActive = w.id === selectedWhId;
              const hasHeavyLoss = w.rodentIncidentsCount > 15;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWhId(w.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition flex items-center justify-between group relative text-left ${
                    isActive
                      ? 'border-[#15462D] bg-[#15462D]/5 ring-1 ring-[#15462D]/20 shadow-4xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] font-black tracking-wide pb-1">
                      <span className="text-slate-430 uppercase">{w.id}</span>
                      <span className="text-slate-350">•</span>
                      <span className="text-slate-600">{w.type}</span>
                    </div>

                    <h4 className="font-extrabold text-[#1a1a1a] text-xs leading-snug group-hover:text-[#15462D] transition duration-150">
                      {w.name}
                    </h4>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 pt-1">
                      <span>Crop: <strong>{w.commodity}</strong></span>
                      <span>•</span>
                      <span className={hasHeavyLoss ? 'text-red-700 font-bold' : 'text-slate-500'}>
                        {w.rodentIncidentsCount} Incidents
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Specific surveillance details, loaded on demand */}
        <div className="lg:col-span-7">
          {selectedWH ? (
            <div className="bg-white border rounded-xl p-5 shadow-3xs space-y-5 animate-fade-in text-slate-800">
              <div className="border-b pb-3.5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-4.5 h-4.5 text-emerald-805" />
                    <span className="font-mono text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      WAREHOUSE AUDIT SPECS: {selectedWH.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mt-2 uppercase">
                    {selectedWH.name}
                  </h3>
                </div>

                <span className={`px-2 py-1 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                  selectedWH.protectionStatus.includes('Fully') ? 'bg-emerald-100 text-emerald-950 animate-pulse' :
                  selectedWH.protectionStatus.includes('Partially') ? 'bg-amber-100 text-amber-950' : 'bg-red-100 text-red-950'
                }`}>
                  {selectedWH.protectionStatus}
                </span>
              </div>

              {/* Status and Commodity Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 font-mono text-[10.5px]">
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">Stored Grain Volume</span>
                  <span className="font-sans text-xs text-slate-800 font-black block mt-1">
                    {selectedWH.storedVolumeMetricTons} Metric Tons
                  </span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">Primary Commodity</span>
                  <span className="font-sans text-xs font-semibold text-slate-700 block mt-1">
                    🌾 {selectedWH.commodity}
                  </span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                  <span className="text-[8px] text-slate-400 font-bold block uppercase leading-none">Type of Depository</span>
                  <span className="font-sans text-xs text-slate-700 block mt-1">
                    🏢 {selectedWH.type}
                  </span>
                </div>
              </div>

              {/* Losses Panel */}
              <div className="border-t pt-4 space-y-3 font-sans">
                <span className="font-mono text-[9px] text-slate-400 font-black uppercase tracking-wider block">
                  Product Loss & Rodent Penetration Indicators
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 border rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500">Rodent Incident logs</span>
                    <p className={`text-xl font-mono font-black mt-1 ${
                      selectedWH.rodentIncidentsCount > 15 ? 'text-red-700' : 'text-slate-800'
                    }`}>
                      {selectedWH.rodentIncidentsCount} Events
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono uppercase">Month to date</span>
                  </div>

                  <div className="bg-slate-50 p-3 border rounded-lg">
                    <span className="text-[10px] font-medium text-slate-500">Weight Loss Index</span>
                    <p className="text-xl font-mono font-black mt-1 text-slate-800">
                      {selectedWH.estimatedWeightLossKg} kg
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono uppercase">Grain spoiled</span>
                  </div>

                  <div className="bg-slate-50 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-medium text-slate-500">Financial Loss</span>
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <p className="text-xl font-mono font-black mt-1 text-slate-900">
                      ${selectedWH.economicValueLossUSD} USD
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono uppercase">Value spoiled</span>
                  </div>
                </div>

                {selectedWH.rodentIncidentsCount > 15 && (
                  <div className="bg-red-50 bg-opacity-30 border border-red-150 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-red-950 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-bold">CRITICAL PENETRATION LEVEL EXCEEDED</p>
                      <p className="text-red-800/80 leading-relaxed font-medium">This site is an unprotected control baseline. Lack of mechanical counter-weighted suction seal mechanisms leads to high incident levels.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-16 text-center text-xs text-slate-400 font-mono italic">
              Select any logged cooperative warehouse code on the left explorer to pull atmospheric, thermal, and weight loss parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
