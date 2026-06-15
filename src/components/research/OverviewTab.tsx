/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, ShieldCheck, Users, Calendar, Clock, CheckCircle2, AlertCircle, FileText, TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TREND_DATA = [
  { month: 'Jan', '24H Survival': 98.2, '1WK Survival': 94.5, '3M Survival': 84.1 },
  { month: 'Feb', '24H Survival': 98.5, '1WK Survival': 95.1, '3M Survival': 85.3 },
  { month: 'Mar', '24H Survival': 97.9, '1WK Survival': 93.8, '3M Survival': 83.9 },
  { month: 'Apr', '24H Survival': 99.1, '1WK Survival': 96.2, '3M Survival': 87.5 },
  { month: 'May', '24H Survival': 98.8, '1WK Survival': 95.7, '3M Survival': 86.8 },
  { month: 'Jun', '24H Survival': 99.4, '1WK Survival': 97.0, '3M Survival': 88.2 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-emerald-800 p-3 rounded-md shadow-2xl font-mono text-[10px] text-slate-100 max-w-[220px]" id="survival-trend-tooltip">
        <p className="font-extrabold uppercase text-emerald-400 border-b border-slate-800 pb-1.5 mb-1.5">{label} 2026</p>
        {payload.map((pld: any) => (
          <div key={pld.name} className="flex justify-between items-center gap-4 py-0.5">
            <span style={{ color: pld.color }} className="font-bold">{pld.name}:</span>
            <span className="font-extrabold text-white">{pld.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface TeamMember {
  name: string;
  role: string;
  avatarLetter: string;
  avatarBg: string;
}

interface ActivityEvent {
  id: string;
  type: string;
  summary: string;
  timestamp: string;
  author: string;
}

const DEMO_MEMBERS: TeamMember[] = [
  { name: 'Dr. Severine Jenkins', role: 'Lead Ecologist / Project Leader', avatarLetter: 'SJ', avatarBg: 'bg-emerald-600' },
  { name: 'Dr. Joseph Massawe', role: 'Co-Investigator / Bio-Statistician', avatarLetter: 'JM', avatarBg: 'bg-teal-600' },
  { name: 'Lilian Kamazima', role: 'GIS Coordinator / Remote Sensing specialist', avatarLetter: 'LK', avatarBg: 'bg-amber-600' },
  { name: 'Baraka Shayo', role: 'Field Lead / Senior Researcher', avatarLetter: 'BS', avatarBg: 'bg-sky-600' }
];

const DEMO_ACTIVITIES: ActivityEvent[] = [
  { id: '1', type: 'specimen', summary: 'Added Mastomys natalensis Adult Male (EXP-2026-0421) records', timestamp: '20 minutes ago', author: 'Baraka Shayo' },
  { id: '2', type: 'survey', summary: 'Completed birds point-count census in Morogoro Block C Plot', timestamp: '2 hours ago', author: 'Lilian Kamazima' },
  { id: '3', type: 'farm', summary: 'Yield evaluation submitted for ERICON Fully Protected Farm (Zone A)', timestamp: 'Yesterday', author: 'Dr. Severine Jenkins' },
  { id: '4', type: 'report', summary: 'Compiled Bespoke Phase 5 Suction Barrier Interim Report Draft', timestamp: '2 days ago', author: 'Dr. Joseph Massawe' }
];

export function OverviewTab() {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800 text-left">
      {/* Dossier Header Info */}
      <div className="bg-[#15462D]/5 border-l-4 border-[#15462D] p-5 rounded-r-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded tracking-wider">
            Active Campaign Status: On-Track
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Biosecurity & Suction Core Zoonotic Dispersion Program
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Coordinated by Sokoine University of Agriculture (SUA) and the National Ecology Association of Tanzania. Protecting agricultural storage facilities through advanced non-toxic mechanical bio-exclusion systems.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-3xs font-mono">
          <Clock className="w-4 h-4 text-emerald-800" />
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Fiscal Period</p>
            <p className="text-slate-800 font-extrabold mt-0.5">Phase V: 2026-2027</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Objective, Highlights & Status */}
        <div className="lg:col-span-8 space-y-6">
          {/* Research Objective Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3">
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
              <Award className="w-5 h-5 text-emerald-800" />
              <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-705">
                Primary Research Objective
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-sans">
              To rigorously evaluate, calibrate, and establish systemic scientific indicators regarding the use of <strong>ERICON counterweighted OWEP inlet mechanical suction-flap structures</strong>. This study seeks to validate their ability to successfully exclude rodent vectors (predominantly <em>Mastomys natalensis</em> and <em>Rattus rattus</em>) from stored smallholder grain cooperatives while protecting endemic biodiversity without resorting to dangerous chemical anti-coagulants or rodenticides.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 font-sans text-xs">
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-1">
                <span className="font-mono text-[9px] text-slate-400 uppercase font-bold">In-Field Exclusion</span>
                <p className="text-slate-800 font-black">98.4% Efficiency</p>
                <p className="text-[9.5px] text-slate-505">Observed across 12 monitoring grids</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-1">
                <span className="font-mono text-[9px] text-slate-400 uppercase font-bold">Wildlife Toxicity</span>
                <p className="text-[#10b981] font-black">0% Fatal Impact</p>
                <p className="text-[9.5px] text-slate-505">Strictly non-chemical barriers</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-1">
                <span className="font-mono text-[9px] text-slate-400 uppercase font-bold">Total Species Logged</span>
                <p className="text-slate-800 font-black">1,850 specimens</p>
                <p className="text-[9.5px] text-slate-505">Across 4 ecological study sites</p>
              </div>
            </div>
          </div>

          {/* 24H/1WK/3M Cohort Survival Percentages over Time Trend Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4" id="cohort-survival-chart-container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-707">
                  Cohort Longitudinal Survival Trends
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                Aggregated Grid Feed
              </span>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Historical timeline of survival percentages tracking rodent cohort attrition under calibrated suction parameters. Demonstrates the extreme safety index of ERICON non-chemical pressure gradients.
            </p>

            <div className="h-64 w-full" id="cohort-survival-recharts-embed">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={TREND_DATA}
                  margin={{ top: 10, right: 10, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    type="number"
                    domain={[60, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="24H Survival" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="1WK Survival" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="3M Survival" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    dot={{ r: 3 }} 
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core Campaign Milestones & Status List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100">
              <ShieldCheck className="w-5 h-5 text-[#15462D]" />
              <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-705">
                Clinical Milestones & Registry Status
              </h3>
            </div>
            
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Milestone 1: Sokoine Regional Grid Setup</h4>
                  <p className="text-slate-500 text-[11px]">Installed 4 baseline telemetry stations (EMA-1 to EMA-4) to measure atmospheric microgrid parameters.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">Milestone 2: Multi-Site Long-term Trap Deployment</h4>
                  <p className="text-slate-500 text-[11px]">Placed non-lethal traps to establish species density, maturity index, and reproductive conditions before treatment logs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <h4 className="font-bold text-slate-800">Milestone 3: Dynamic Barrier Assessments (In Progress)</h4>
                  <p className="text-slate-500 text-[11px]">Currently evaluating crop losses, head-tail length metrics, and economic damage scores across treatment parameters.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actives & Feeds */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Members Mini-Module */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
            <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
              <Users className="w-4.5 h-4.5 text-emerald-800" />
              <h3 className="text-[11px] uppercase font-black font-mono tracking-wider text-slate-700">
                Active Research Core
              </h3>
            </div>
            <div className="space-y-3 font-sans">
              {DEMO_MEMBERS.map((mem, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${mem.avatarBg} text-white flex items-center justify-center font-mono text-xs font-extrabold shrink-0`}>
                    {mem.avatarLetter}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{mem.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{mem.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Trail */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
            <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
              <FileText className="w-4.5 h-4.5 text-emerald-800" />
              <h3 className="text-[11px] uppercase font-black font-mono tracking-wider text-slate-700">
                Recent Ledger Activities
              </h3>
            </div>
            <div className="space-y-3.5 font-sans">
              {DEMO_ACTIVITIES.map((act) => (
                <div key={act.id} className="text-xs border-l-2 border-emerald-100 pl-3 space-y-0.5">
                  <p className="text-[#15462D] font-extrabold leading-tight text-[11.5px]">{act.summary}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>by {act.author}</span>
                    <span>•</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
