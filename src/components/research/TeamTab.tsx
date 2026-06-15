/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, ShieldCheck, Mail, LogIn, Trash2, 
  Settings, Check, Compass, HelpCircle, ClipboardCheck, Share2, ClipboardCopy
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Leader' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending Acceptance';
}

interface ReviewerLink {
  id: string;
  recipient: string;
  code: string;
  accessScope: string;
  expiration: string;
}

const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'MEM-01', name: 'Dr. Severine Jenkins', email: 's.jenkins@sua.ac.tz', role: 'Leader', status: 'Active' },
  { id: 'MEM-02', name: 'Dr. Joseph Massawe', email: 'j.massawe@sua.ac.tz', role: 'Admin', status: 'Active' },
  { id: 'MEM-03', name: 'Lilian Kamazima', email: 'l.kamazima@gis-center.org', role: 'Editor', status: 'Active' },
  { id: 'MEM-04', name: 'Baraka Shayo', email: 'b.shayo@sua.ac.tz', role: 'Viewer', status: 'Active' }
];

const INITIAL_LINKS: ReviewerLink[] = [
  { id: 'LNK-01', recipient: 'Ministry of Agriculture Audit Team', code: 'REV-MORO-5921-A', accessScope: 'Full Read-Only Access', expiration: '30 Days' },
  { id: 'LNK-02', recipient: 'WHO Zoonotic Disease Observer', code: 'REV-WHO-9102-C', accessScope: 'Charts Only', expiration: '7 Days' }
];

export function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_team_members_modular');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [links, setLinks] = useState<ReviewerLink[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_reviewer_links_modular');
      return saved ? JSON.parse(saved) : INITIAL_LINKS;
    } catch {
      return INITIAL_LINKS;
    }
  });

  // Invite states
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemRole, setNewMemRole] = useState<'Admin' | 'Leader' | 'Editor' | 'Viewer'>('Viewer');

  // Reviewer Link states
  const [newLnkRecipient, setNewLnkRecipient] = useState('');
  const [newLnkScope, setNewLnkScope] = useState('Full Read-Only Access');
  const [newLnkExpiration, setNewLnkExpiration] = useState('7 Days');

  // Sync Helpers
  const saveMembers = (list: TeamMember[]) => {
    setMembers(list);
    localStorage.setItem('ericon_team_members_modular', JSON.stringify(list));
  };
  const saveLinks = (list: ReviewerLink[]) => {
    setLinks(list);
    localStorage.setItem('ericon_reviewer_links_modular', JSON.stringify(list));
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemEmail) {
      alert("Please provide the researcher's name and academic email address.");
      return;
    }

    const newId = `MEM-0${members.length + 1}`;
    const newM: TeamMember = {
      id: newId,
      name: newMemName,
      email: newMemEmail,
      role: newMemRole,
      status: 'Pending Acceptance'
    };

    const updated = [...members, newM];
    saveMembers(updated);

    // reset fields
    setNewMemName('');
    setNewMemEmail('');
    setNewMemRole('Viewer');
    alert("✉️ ROLE INVITATION SENT: An academic registration link has been broadcast to their inbox.");
  };

  const handleRemoveMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke clearances and delete ${name} from key research modules?`)) {
      const updated = members.filter(m => m.id !== id);
      saveMembers(updated);
    }
  };

  const handleChangeRole = (id: string, nextRole: 'Admin' | 'Leader' | 'Editor' | 'Viewer') => {
    const updated = members.map(m => {
      if (m.id === id) {
        return { ...m, role: nextRole };
      }
      return m;
    });
    saveMembers(updated);
    alert(`⚡ CLEARANCE UPDATE: Staff credentials adjusted to ${nextRole} successfully.`);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLnkRecipient) {
      alert("Please provide the name of the external auditor or recipient.");
      return;
    }

    const nextId = `LNK-0${links.length + 1}`;
    const randCode = `REV-${newLnkRecipient.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newL: ReviewerLink = {
      id: nextId,
      recipient: newLnkRecipient,
      code: randCode,
      accessScope: newLnkScope,
      expiration: newLnkExpiration
    };

    const updated = [...links, newL];
    saveLinks(updated);

    setNewLnkRecipient('');
    alert(`🔑 REVIEWER LINK GENERATED: Code ${randCode} is now active.`);
  };

  const handleRevokeLink = (id: string) => {
    if (confirm("Revoke this secure link instantly? External observers will lose read-only ledger access.")) {
      const updated = links.filter(l => l.id !== id);
      saveLinks(updated);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in text-slate-800">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Span: Team Members Directory & Admin Actions */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
          <div className="border-b pb-3 flex justify-between items-center">
            <h3 className="text-xs uppercase font-extrabold font-mono tracking-wider text-slate-705 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-emerald-805" />
              <span>Research Members Directory ({members.length})</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-[#15462D]/10 text-[#15462D] px-2 py-0.5 rounded leading-none select-none uppercase">
              SUA Co-op Node
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs leading-normal border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 font-mono text-[9px] uppercase font-bold text-slate-450 bg-slate-50/50">
                  <th className="py-2.5 px-3">Scientist Name</th>
                  <th className="py-2.5 px-3">Clearance Access Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Revoke Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{m.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">{m.email}</p>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.id, e.target.value as any)}
                        className="bg-slate-50 border rounded p-1 font-mono text-[10px] font-bold text-slate-700"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Leader">Leader</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-black uppercase ${
                        m.status === 'Active' ? 'bg-emerald-100 text-emerald-950' : 'bg-amber-100 text-amber-950 animate-pulse'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id, m.name)}
                        className="p-1 text-slate-400 hover:text-red-700 cursor-pointer rounded transition hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Invite Form */}
          <form onSubmit={handleInviteMember} className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs items-end">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-450 uppercase">Invite Name:</label>
              <input 
                type="text" 
                required 
                placeholder="Dr. Severine Jenkins"
                value={newMemName}
                onChange={e => setNewMemName(e.target.value)}
                className="bg-slate-50 border rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-805"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-450 uppercase">Invite Email:</label>
              <input 
                type="email" 
                required 
                placeholder="s.jenkins@sua.ac.tz" 
                value={newMemEmail}
                onChange={e => setNewMemEmail(e.target.value)}
                className="bg-slate-50 border rounded p-2 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-805"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-450 uppercase">Access Role:</label>
              <select 
                value={newMemRole}
                onChange={e => setNewMemRole(e.target.value as any)}
                className="bg-slate-50 border rounded p-2 "
              >
                <option value="Admin">Admin</option>
                <option value="Leader">Leader</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-[#15462D] hover:bg-emerald-900 font-black text-white p-2 rounded-lg cursor-pointer transition uppercase text-center flex items-center justify-center gap-1.5 border border-emerald-950 shadow-3xs h-[36px]"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>Invite Member</span>
            </button>
          </form>
        </div>

        {/* Right Span: External Reviewer Links generator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-4">
            <h4 className="text-[10px] font-bold font-mono uppercase text-slate-705 border-b pb-2 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-805" />
              <span>Secure Reviewer Sharing Link</span>
            </h4>

            {/* Generated links list */}
            <div className="space-y-3">
              {links.map(lnk => (
                <div key={lnk.id} className="bg-slate-50 border border-slate-150 rounded-lg p-3 space-y-1.5 text-xs font-sans relative group">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-slate-800 leading-tight truncate pr-4">{lnk.recipient}</p>
                    <button
                      type="button"
                      onClick={() => handleRevokeLink(lnk.id)}
                      className="text-[9px] font-mono font-bold text-red-700 bg-red-105 border px-1 hover:bg-red-200 cursor-pointer rounded leading-none py-0.5 uppercase shrink-0"
                    >
                      Revoke
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Scope: <strong>{lnk.accessScope}</strong> | Exp: {lnk.expiration}</p>
                  
                  <div className="flex justify-between items-center pt-2 font-mono text-[10px]">
                    <span className="bg-white border font-bold px-1.5 py-0.5 rounded leading-none text-emerald-855">{lnk.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(lnk.code);
                        alert(`📋 Code ${lnk.code} copied to clipboards successfully!`);
                      }}
                      className="text-slate-450 hover:text-slate-700 cursor-pointer p-0.5 rounded shrink-0"
                      title="Copy Link code"
                    >
                      <ClipboardCopy className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Link creator form */}
            <form onSubmit={handleGenerateLink} className="border-t pt-3 flex flex-col gap-3 font-mono text-xs mt-2">
              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-450 uppercase">Auditor / Recipient:</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Sokoine General Assembly"
                  value={newLnkRecipient}
                  onChange={e => setNewLnkRecipient(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:border-[#15462D] font-sans text-xs text-slate-805"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-450 uppercase">Scope Level:</label>
                <select 
                  value={newLnkScope} 
                  onChange={e => setNewLnkScope(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-1.5"
                >
                  <option value="Full Read-Only Access">Full Read-Only Access</option>
                  <option value="Charts Only">Charts Only</option>
                  <option value="Reports Only">Reports Only</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-450 uppercase">Expiration Interval:</label>
                <select 
                  value={newLnkExpiration} 
                  onChange={e => setNewLnkExpiration(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded p-1.5"
                >
                  <option value="7 Days">7 Days Limit</option>
                  <option value="30 Days">30 Days Period</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-[#15462D] hover:bg-emerald-900 text-white font-extrabold py-2 px-3 rounded-lg cursor-pointer text-center uppercase tracking-wide transition border border-emerald-950 mt-1"
              >
                Generate observer Key
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
