/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FolderGit, Plus, Search, Filter, ShieldCheck, MapPin, Calendar, HelpCircle, X, ChevronRight, Check
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Pending Approval';
  location: string;
  lead: string;
  startDate: string;
  description: string;
  budget?: string;
  specimensCount: number;
  un_code?: string;
}

const PRESET_PROJECTS: Project[] = [
  {
    id: 'PRJ-2026-001',
    name: 'Biosecurity & Suction Core Zoonotic Dispersion Program',
    status: 'Active',
    location: 'Morogoro Region, Tanzania',
    lead: 'Dr. Severine Jenkins',
    startDate: '2026-01-15',
    description: 'A study validating the ecological exclusion effectiveness of the ERICON friction-grip physical suction-flap grids on target vector groups.',
    budget: '$45,000 USD',
    specimensCount: 1250,
    un_code: 'SUA-ECOLOGY-2026-A'
  },
  {
    id: 'PRJ-2026-002',
    name: 'Sub-Saharan Smallholder Silo Rodent Repulsion Initiative',
    status: 'Active',
    location: 'Dodoma, Tanzania',
    lead: 'Dr. Joseph Massawe',
    startDate: '2026-03-01',
    description: 'Calibrating physical warehouse grain inlet seals to repel endemic murid species from localized family grain stores and warehouses.',
    budget: '$32,000 USD',
    specimensCount: 540,
    un_code: 'DODOMA-SILO-V5'
  },
  {
    id: 'PRJ-2025-009',
    name: 'Tanzania Native Micro-fauna & Avian Indicator Assessment',
    status: 'Completed',
    location: 'Morogoro Highlands',
    lead: 'Lilian Kamazima',
    startDate: '2025-02-10',
    description: 'Longitudinal analysis mapping surrounding biodiversity indices (birds and mammals) to demonstrate zero-chemical bait environmental safety.',
    budget: '$18,500 USD',
    specimensCount: 420,
    un_code: 'BIO-INDICATOR-COHORT'
  }
];

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_projects_modular');
      return saved ? JSON.parse(saved) : PRESET_PROJECTS;
    } catch {
      return PRESET_PROJECTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('PRJ-2026-001');

  // Modal to create project
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjLead, setNewProjLead] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('');
  const [newProjDate, setNewProjDate] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');

  // Settle selection details
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Synchronize helper
  const saveProjects = (newList: Project[]) => {
    setProjects(newList);
    localStorage.setItem('ericon_projects_modular', JSON.stringify(newList));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjLead) {
      alert("Please enter a valid Project title and Lead investigator.");
      return;
    }
    const newId = `PRJ-2026-0${projects.length + 1}`;
    const newP: Project = {
      id: newId,
      name: newProjName,
      status: 'Pending Approval',
      location: newProjLocation || 'Morogoro Region',
      lead: newProjLead,
      startDate: newProjDate || new Date().toISOString().slice(0, 10),
      description: newProjDesc || 'Bespoke scientific research project catalogued inside the decentralized academic node.',
      specimensCount: 0,
      budget: '$12,000 USD'
    };

    const updated = [newP, ...projects];
    saveProjects(updated);
    setSelectedProjectId(newId);
    setShowCreateModal(false);
    
    // reset form fields
    setNewProjName('');
    setNewProjLead('');
    setNewProjLocation('');
    setNewProjDate('');
    setNewProjDesc('');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Search and Filters Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        <div className="flex gap-2.5 items-center w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, name or lead..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs w-[240px] focus:outline-none focus:ring-1 focus:ring-[#15462D]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-[#15462D] hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 uppercase tracking-wide transition cursor-pointer active:scale-95 shadow-3xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Grid: Master List */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[500px] overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-xs text-slate-400 font-mono italic">
              No matching project records found in registry.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isActive = p.id === selectedProjectId;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition flex justify-between items-center group relative text-left ${
                    isActive 
                      ? 'border-[#15462D] bg-[#15462D]/5 ring-1 ring-[#15462D]/20 shadow-4xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] font-extrabold pb-1">
                      <span className="text-slate-430 uppercase">{p.id}</span>
                      <span className="text-slate-350">•</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase leading-none font-bold ${
                        p.status === 'Active' ? 'bg-emerald-100 text-emerald-950' :
                        p.status === 'Completed' ? 'bg-slate-105 text-slate-705' : 'bg-amber-100 text-amber-950'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-[12px] leading-snug group-hover:text-[#15462D] transition duration-150">
                      {p.name}
                    </h4>
                    <p className="text-[10.5px] text-slate-400 font-medium">Investigator: {p.lead}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Right Grid: Selected Detail Card, Lazy loaded on selection */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4 animate-fade-in">
              <div className="flex justify-between items-start border-b pb-3 mb-2 border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderGit className="w-5 h-5 text-emerald-800" />
                    <span className="font-mono text-[10px] text-slate-400 font-black tracking-wider uppercase">
                      PROJECT DOSSIER FILE: {selectedProject.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase mt-1">
                    {selectedProject.name}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded font-mono text-[9px] font-black uppercase tracking-wider ${
                  selectedProject.status === 'Active' ? 'bg-emerald-100 text-emerald-950' :
                  selectedProject.status === 'Completed' ? 'bg-slate-100 text-slate-850' : 'bg-amber-100 text-amber-950'
                }`}>
                  {selectedProject.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Principal Investigator</span>
                  <span className="font-sans text-xs font-bold text-slate-700 block mt-1">{selectedProject.lead}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Research Site</span>
                  <span className="font-sans text-xs font-semibold text-slate-700 block mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-center text-slate-500 shrink-0" />
                    {selectedProject.location}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Commencement Date</span>
                  <span className="font-sans text-xs text-slate-705 block mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-center text-slate-500 shrink-0" />
                    {selectedProject.startDate}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Registered Specimens Logged</span>
                  <span className="font-sans text-xs font-black text-emerald-805 block mt-1">
                    {selectedProject.specimensCount} Specimens
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-mono text-[9px] text-slate-400 font-bold uppercase">Executive Scope & Methodology Summary</span>
                <p className="text-xs text-slate-650 leading-relaxed font-sans mt-0.5">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.un_code && (
                <div className="bg-emerald-50 bg-opacity-20 border border-emerald-150 p-3 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-[#15462D]">Tanzanian Wildlife Protection Authority Clearances</span>
                  </div>
                  <span className="font-bold text-slate-750 bg-white border px-1.5 py-0.5 rounded text-[10px]">{selectedProject.un_code}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-16 text-center text-xs text-slate-400 font-mono italic">
              Select any project record on the left pane to view integrated laboratory variables and site descriptions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-xl shadow-lg w-full max-w-md p-5 flex flex-col gap-4 animate-scale-up text-xs font-sans">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-mono font-extrabold uppercase text-xs tracking-wider text-slate-800">
                ➕ Create Academic Research Project
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-3 font-mono">
              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-500 uppercase">Project Title:</label>
                <input 
                  type="text"
                  required
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  placeholder="e.g. Phase VI Smallholder Co-op Exclusion Audits"
                  className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Principal Lead:</label>
                  <input 
                    type="text"
                    required
                    value={newProjLead}
                    onChange={e => setNewProjLead(e.target.value)}
                    placeholder="e.g. Dr. Severine Jenkins"
                    className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Geographic Location:</label>
                  <input 
                    type="text"
                    value={newProjLocation}
                    onChange={e => setNewProjLocation(e.target.value)}
                    placeholder="e.g. Morogoro, Tanzania"
                    className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Commencement Date:</label>
                  <input 
                    type="date"
                    value={newProjDate}
                    onChange={e => setNewProjDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-800"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-400">Clearance Registry:</label>
                  <div className="bg-slate-105 border p-2 rounded text-slate-500 font-sans italic select-none">
                    Tanzania COSTA-02
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-500 uppercase">Executive Description:</label>
                <textarea 
                  rows={3}
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  placeholder="Summarize the core parameters, target rodent vectors, and trap methods..."
                  className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 border-t pt-3 mt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 border text-slate-600 px-4 py-2 rounded-lg cursor-pointer font-bold uppercase transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#15462D] hover:bg-emerald-900 border border-emerald-950 font-black text-white px-5 py-2' rounded-lg cursor-pointer uppercase transition"
                >
                  Instantiate Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
