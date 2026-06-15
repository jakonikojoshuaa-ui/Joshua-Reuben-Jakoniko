/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { 
  Compass, FolderGit, Database, Sprout, Building2, BarChart3, 
  FileText, Users, Settings as SettingsIcon, Layers, Lock, Cpu
} from 'lucide-react';
import { RodentSpecimen, BiodiversitySurveyItem } from '../types';
import { INITIAL_SPECIMENS } from './research/initialData';
import { EriconLogo } from './EriconLogo';

// Lazy loaded sub-tabs utilizing route-based rendering mechanics
const OverviewTab = lazy(() => import('./research/OverviewTab').then(m => ({ default: m.OverviewTab })));
const ProjectsTab = lazy(() => import('./research/ProjectsTab').then(m => ({ default: m.ProjectsTab })));
const DataCollectionTab = lazy(() => import('./research/DataCollectionTab').then(m => ({ default: m.DataCollectionTab })));
const BiodiversityTab = lazy(() => import('./research/BiodiversityTab').then(m => ({ default: m.BiodiversityTab })));
const SpecimensTab = lazy(() => import('./research/SpecimensTab').then(m => ({ default: m.SpecimensTab })));
const FarmsTab = lazy(() => import('./research/FarmsTab').then(m => ({ default: m.FarmsTab })));
const WarehousesTab = lazy(() => import('./research/WarehousesTab').then(m => ({ default: m.WarehousesTab })));
const AnalyticsTab = lazy(() => import('./research/AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));
const ReportsTab = lazy(() => import('./research/ReportsTab').then(m => ({ default: m.ReportsTab })));
const TeamTab = lazy(() => import('./research/TeamTab').then(m => ({ default: m.TeamTab })));
const SettingsTab = lazy(() => import('./research/SettingsTab').then(m => ({ default: m.SettingsTab })));

export function ResearchPortal() {
  // Navigation active tab segment state (defaulting to the light-weight overview landing card)
  const [activeSegment, setActiveSegment] = useState<
    'overview' | 'projects' | 'collection' | 'biodiversity' | 'specimens' | 'farms' | 'warehouses' | 'analytics' | 'reports' | 'team' | 'settings'
  >('overview');

  const [specimens, setSpecimens] = useState<RodentSpecimen[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_research_database_v1');
      return stored ? JSON.parse(stored) : INITIAL_SPECIMENS;
    } catch {
      return INITIAL_SPECIMENS;
    }
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('ericon_logged_scientist');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Keep user sync regularly
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('ericon_logged_scientist');
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch {}
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Sync state whenever specimens are changed by external modules (Settings archiver, queues, etc.)
  useEffect(() => {
    const handleSpecimensReflow = () => {
      try {
        const stored = localStorage.getItem('ericon_research_database_v1');
        if (stored) {
          setSpecimens(JSON.parse(stored));
        }
      } catch (err) {
        console.warn("Failed to reflow specimen records", err);
      }
    };
    window.addEventListener('ericon_specimens_changed', handleSpecimensReflow);
    return () => window.removeEventListener('ericon_specimens_changed', handleSpecimensReflow);
  }, []);

  const handleAddSpecimen = (newItem: RodentSpecimen) => {
    const updated = [newItem, ...specimens];
    setSpecimens(updated);
    localStorage.setItem('ericon_research_database_v1', JSON.stringify(updated));
  };

  const handleUpdateSpecimen = (updatedItem: RodentSpecimen) => {
    const updated = specimens.map(s => s.Record_ID === updatedItem.Record_ID ? updatedItem : s);
    setSpecimens(updated);
    localStorage.setItem('ericon_research_database_v1', JSON.stringify(updated));
  };

  return (
    <div id="research-workspace-root" className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-slate-800 text-left">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <EriconLogo size="standard" showText={false} className="shrink-0" />
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded tracking-wide leading-none border border-emerald-200/50">
              ERICON Coordinated Grid Registry
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none pt-1">
              Research Workspace
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Academic portal for tracking biome parameters and OWEP physical suction bar metrics.
            </p>
          </div>
        </div>

        {/* Current clearance status */}
        <div className="flex items-center gap-2 bg-slate-50 border p-2.5 px-3 rounded-lg text-xs font-mono select-none shadow-3xs shrink-0 border-slate-200">
          <Lock className="w-3.5 h-3.5 text-emerald-800" />
          <div>
            <p className="text-[8px] text-slate-400 font-bold uppercase leading-none">Security Clearance</p>
            <p className="text-slate-800 font-extrabold mt-0.5 uppercase">
              {currentUser?.role || 'Guest Scientist'} Mode
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation (Route-based Tabs Selectors) */}
      <div className="bg-white border border-slate-200 p-2 rounded-xl shadow-3xs overflow-x-auto flex flex-wrap gap-1 md:grid md:grid-cols-11 text-center font-mono text-[9.5px]">
        {[
          { key: 'overview', label: 'Overview', icon: <Compass className="w-3.5 h-3.5" /> },
          { key: 'projects', label: 'Projects', icon: <FolderGit className="w-3.5 h-3.5" /> },
          { key: 'collection', label: 'Data Input', icon: <Database className="w-3.5 h-3.5" /> },
          { key: 'biodiversity', label: 'Biodiversity', icon: <Sprout className="w-3.5 h-3.5" /> },
          { key: 'specimens', label: 'Specimens', icon: <Layers className="w-3.5 h-3.5" /> },
          { key: 'farms', label: 'Farms', icon: <Sprout className="w-3.5 h-3.5" /> },
          { key: 'warehouses', label: 'Warehouses', icon: <Building2 className="w-3.5 h-3.5" /> },
          { key: 'analytics', label: 'Simulator-(Rodent Artificial Underground Achieve Airflow)', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { key: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
          { key: 'team', label: 'Team', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'settings', label: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = activeSegment === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSegment(tab.key as any)}
              className={`p-2 py-2.5 rounded-lg font-bold uppercase transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none leading-none border grow md:grow-0 ${
                isActive 
                  ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] font-extrabold shadow-sm ericon-active-portal-tab' 
                  : 'bg-white border-transparent text-slate-500 hover:text-[#15462D] hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span className="text-[8px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lazy Loaded Subcomponent Suspense Area */}
      <div className="bg-slate-100 p-1 md:p-2 rounded-2xl min-h-[450px]">
        <Suspense 
          fallback={
            <div className="w-full bg-white border border-slate-200 border-dashed rounded-xl p-8 font-mono text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-4 min-h-[360px] shadow-3xs animate-pulse">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-slate-200 border-t-[#15462D] animate-spin" />
              </div>
              <p className="font-extrabold uppercase tracking-widest text-[#15462D]">Loading Campaign segment...</p>
            </div>
          }
        >
          {activeSegment === 'overview' && <OverviewTab />}
          {activeSegment === 'projects' && <ProjectsTab />}
          {activeSegment === 'collection' && (
            <DataCollectionTab 
              specimens={specimens} 
              onAddSpecimen={handleAddSpecimen} 
              onUpdateSpecimen={handleUpdateSpecimen} 
              currentUser={currentUser} 
            />
          )}
          {activeSegment === 'biodiversity' && <BiodiversityTab />}
          {activeSegment === 'specimens' && <SpecimensTab specimens={specimens} />}
          {activeSegment === 'farms' && <FarmsTab />}
          {activeSegment === 'warehouses' && <WarehousesTab />}
          {activeSegment === 'analytics' && <AnalyticsTab specimens={specimens} />}
          {activeSegment === 'reports' && <ReportsTab specimens={specimens} />}
          {activeSegment === 'team' && <TeamTab />}
          {activeSegment === 'settings' && <SettingsTab />}
        </Suspense>
      </div>
    </div>
  );
}
