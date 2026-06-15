/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Layers3, Activity, ChevronLeft, ChevronRight, 
  HelpCircle, Eye, Sliders, Calendar, MapPin, Tag, BrainCircuit
} from 'lucide-react';
import { RodentSpecimen } from '../../types';

interface SpecimensTabProps {
  specimens: RodentSpecimen[];
}

export function SpecimensTab({ specimens }: SpecimensTabProps) {
  // Filters, search, pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | null>(null);

  // Pagination page size
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search/Filter specimens
  const filteredSpecimens = useMemo(() => {
    return specimens.filter(s => {
      const matchSearch = s.Record_ID.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.Location_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.Species_ID.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSpecies = speciesFilter === 'all' || s.Species_ID === speciesFilter;
      const matchSite = siteFilter === 'all' || s.Site_Type === siteFilter || (siteFilter === 'unprotected' && s.Site_Type?.includes('Control'));
      return matchSearch && matchSpecies && matchSite;
    });
  }, [specimens, searchQuery, speciesFilter, siteFilter]);

  // Total pages
  const totalPages = Math.ceil(filteredSpecimens.length / itemsPerPage) || 1;

  // Safe current page clamped
  const activePage = Math.min(currentPage, totalPages);

  // Paginated partition (prevents rendering huge datasets)
  const paginatedSpecimens = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredSpecimens.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSpecimens, activePage]);

  // Selected specimen detail
  const selectedSpecimen = useMemo(() => {
    if (!selectedSpecimenId) {
      return paginatedSpecimens[0] || null;
    }
    return specimens.find(s => s.Record_ID === selectedSpecimenId) || paginatedSpecimens[0] || null;
  }, [specimens, selectedSpecimenId, paginatedSpecimens]);

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Search, Filter strips */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Quick search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Record ID or zone..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page on filter
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-[220px] focus:outline-none focus:ring-1 focus:ring-[#15462D]"
            />
          </div>

          {/* Species Select dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select 
              value={speciesFilter}
              onChange={e => {
                setSpeciesFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-semibold text-slate-800"
            >
              <option value="all">All Species</option>
              <option value="Mastomys natalensis">Mastomys natalensis</option>
              <option value="Rattus rattus">Rattus rattus</option>
              <option value="Mus musculus">Mus musculus</option>
              <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
            </select>
          </div>

          {/* Intervention Sites filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select 
              value={siteFilter}
              onChange={e => {
                setSiteFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none font-semibold text-slate-800"
            >
              <option value="all">All Interventions</option>
              <option value="ERICON Fully Protected Farm">Fully Protected Farms</option>
              <option value="ERICON Semi-Protected Farm">Semi-Protected Farms</option>
              <option value="unprotected">Unprotected Controls</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono font-bold leading-none uppercase">
          Total Registered Assets: {filteredSpecimens.length} Records
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Grid: Compact paginated Table to prevent sluggish UI rendering */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-col justify-between gap-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 font-mono text-[9px] uppercase font-bold text-slate-450 bg-slate-50/50">
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Target Species</th>
                  <th className="py-2.5 px-3">Field Zone</th>
                  <th className="py-2.5 px-3 text-center">Weight (g)</th>
                  <th className="py-2.5 px-3 text-center">Diagnostics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSpecimens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center font-mono text-slate-400 italic">
                      Zero matching biological specimens logged in current view. Use Filters above to expand search vectors.
                    </td>
                  </tr>
                ) : (
                  paginatedSpecimens.map((spec) => {
                    const isHighlighted = selectedSpecimen?.Record_ID === spec.Record_ID;
                    return (
                      <tr 
                        key={spec.Record_ID}
                        onClick={() => setSelectedSpecimenId(spec.Record_ID)}
                        className={`cursor-pointer transition duration-150 ${
                          isHighlighted 
                            ? 'bg-[#15462D]/5 font-semibold text-emerald-950' 
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-[11px] font-black">{spec.Record_ID}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{spec.Species_ID}</td>
                        <td className="py-3 px-3 font-medium text-slate-650 shrink-0">{spec.Location_Name}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{spec.Weight_g}g</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono text-[9.5px] font-bold bg-[#15462D]/10 text-emerald-950 rounded px-1.5 py-0.5 uppercase">
                            {spec.Sex === 'Male' ? 'M' : 'F'} • {spec.Maturity_Stage[0]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Clean Pagination Panel */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 font-mono text-xs">
              <span className="text-slate-430">Page {activePage} of {totalPages} ({filteredSpecimens.length} total)</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={activePage === 1}
                  className="p-1 px-3 border rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 select-none cursor-pointer text-[10.5px] transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline text-slate-600 align-text-bottom" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={activePage === totalPages}
                  className="p-1 px-3 border rounded-lg bg-slate-50 hover:bg-slate-100 disabled:opacity-40 select-none cursor-pointer text-[10.5px] transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 inline text-slate-600 align-text-bottom" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Detailed morphometrics view, only loaded on select */}
        <div className="xl:col-span-5">
          {selectedSpecimen ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4 animate-fade-in text-slate-800">
              <div className="border-b pb-3.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-805" />
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">
                    LABORATORY MORPHOMETRIC RECORD: {selectedSpecimen.Record_ID}
                  </span>
                </div>
                <h3 className="text-sm font-black tracking-tight leading-none mt-2 uppercase text-slate-900">
                  {selectedSpecimen.Species_ID}
                </h3>
              </div>

              {/* Grid morphometrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[10.5px]">
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Observer Weight</span>
                  <span className="font-sans text-xs text-slate-800 font-black block mt-1">{selectedSpecimen.Weight_g}g</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Head & Body Scale</span>
                  <span className="font-sans text-xs text-slate-850 block mt-1">{selectedSpecimen.Head_Body_Length_mm} mm</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Tail Length</span>
                  <span className="font-sans text-xs text-slate-800 block mt-1">{selectedSpecimen.Tail_Length_mm} mm</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Hind Foot measurement</span>
                  <span className="font-sans text-xs text-slate-800 block mt-1">{selectedSpecimen.Hind_Foot_mm} mm</span>
                </div>
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Parasite External Load</span>
                  <span className={`font-sans text-xs font-black block mt-1 ${
                    selectedSpecimen.Parasite_Load_Ext > 1 ? 'text-amber-600' : 'text-slate-700'
                  }`}>
                    Level {selectedSpecimen.Parasite_Load_Ext}/3
                  </span>
                </div>
                <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-2.5">
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-none uppercase">Reproduction Status</span>
                  <span className="font-sans text-xs text-slate-750 block mt-1 truncate">{selectedSpecimen.Reproductive_Condition}</span>
                </div>
              </div>

              {/* Geographic, site information */}
              <div className="border-t pt-3.5 space-y-3">
                <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Captured Telemetry coordinates</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <p className="flex items-center gap-1 font-mono text-[11px] text-slate-650">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lat: {selectedSpecimen.GPS_Latitude.toFixed(4)}</span>
                  </p>
                  <p className="flex items-center gap-1 font-mono text-[11px] text-slate-650">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lon: {selectedSpecimen.GPS_Longitude.toFixed(4)}</span>
                  </p>
                </div>

                <div className="bg-[#15462D]/5 border rounded-lg p-3 flex justify-between gap-3 text-[11px] leading-tight">
                  <div className="space-y-0.5">
                    <p className="font-mono text-[9px] text-slate-400 font-black uppercase">Study Site Registry</p>
                    <p className="font-bold text-[#15462D]">{selectedSpecimen.Site_Type || 'M4 Treatment Grid'}</p>
                  </div>
                  <Tag className="w-4 h-4 text-[#15462D]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-16 text-center text-xs text-slate-400 font-mono italic">
              Select any specimen record grid row on the left pane to dynamically load morphometrics and pathology values.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
