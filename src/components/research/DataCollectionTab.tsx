/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, FileText, CheckCircle2, ShieldAlert, Cpu, 
  Trash2, Send, Save, Lock, Edit3, UserCheck, HelpCircle, Activity, Sparkles, RefreshCcw
} from 'lucide-react';
import { RodentSpecimen } from '../../types';

interface DataCollectionTabProps {
  specimens: RodentSpecimen[];
  onAddSpecimen: (specimen: RodentSpecimen) => void;
  onUpdateSpecimen: (updated: RodentSpecimen) => void;
  currentUser: any;
}

export function DataCollectionTab({
  specimens,
  onAddSpecimen,
  onUpdateSpecimen,
  currentUser
}: DataCollectionTabProps) {
  // Let's deduce current permissions
  const scientistRole = currentUser?.role || 'Research Member'; // Admin, Project Leader, Research Member, Reviewer
  const isLeaderOrAdmin = scientistRole === 'Administrator' || scientistRole === 'Project Leader';

  // Toggle active form: 'biological' | 'crop_damage' | 'warehouse'
  const [activeFormType, setActiveFormType] = useState<'biological' | 'crop_damage' | 'warehouse'>('biological');
  const [formStatus, setFormStatus] = useState<'idle' | 'draft_saved' | 'saving'>('idle');
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('');

  // Let's create states for Biological Specimen form
  const [recordId, setRecordId] = useState(() => `REC-${Date.now().toString().slice(-4)}`);
  const [speciesId, setSpeciesId] = useState<'Mastomys natalensis' | 'Rattus rattus' | 'Mus musculus' | 'Arvicanthis niloticus' | 'Other'>('Mastomys natalensis');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Undetermined'>('Male');
  const [maturity, setMaturity] = useState<'Juvenile' | 'Sub-Adult' | 'Adult'>('Adult');
  const [weight, setWeight] = useState<number>(42);
  const [headBody, setHeadBody] = useState<number>(115);
  const [tailLength, setTailLength] = useState<number>(100);
  const [hindFoot, setHindFoot] = useState<number>(22);
  const [reproductive, setReproductive] = useState<'M: Scrotal' | 'M: Non-scrotal' | 'F: Perforate' | 'F: Lactating' | 'F: Pregnant'>('M: Scrotal');
  const [siteType, setSiteType] = useState<'ERICON Fully Protected Farm' | 'ERICON Semi-Protected Farm' | 'Non-ERICON Control Farm'>('ERICON Fully Protected Farm');
  const [gpsLat, setGpsLat] = useState<number>(-6.8250);
  const [gpsLon, setGpsLon] = useState<number>(37.6620);
  const [locationName, setLocationName] = useState<string>('Morogoro Block A');

  // Load draft from localstorage on mount/switch
  useEffect(() => {
    const draftKey = `ericon_draft_${activeFormType}`;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (activeFormType === 'biological') {
          if (parsed.speciesId) setSpeciesId(parsed.speciesId);
          if (parsed.sex) setSex(parsed.sex);
          if (parsed.maturity) setMaturity(parsed.maturity);
          if (parsed.weight) setWeight(Number(parsed.weight));
          if (parsed.headBody) setHeadBody(Number(parsed.headBody));
          if (parsed.tailLength) setTailLength(Number(parsed.tailLength));
          if (parsed.hindFoot) setHindFoot(Number(parsed.hindFoot));
          if (parsed.reproductive) setReproductive(parsed.reproductive);
          if (parsed.siteType) setSiteType(parsed.siteType);
          if (parsed.locationName) setLocationName(parsed.locationName);
        }
      }
    } catch (e) {
      console.warn("Failed to retrieve draft", e);
    }
  }, [activeFormType]);

  // Save draft to localstorage on change
  const triggerAutoSave = () => {
    setFormStatus('saving');
    const draftKey = `ericon_draft_${activeFormType}`;
    const draftData = {
      speciesId,
      sex,
      maturity,
      weight,
      headBody,
      tailLength,
      hindFoot,
      reproductive,
      siteType,
      locationName,
      timestamp: Date.now()
    };
    
    setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setFormStatus('draft_saved');
      setLastAutoSaveTime(new Date().toLocaleTimeString());
    }, 450);
  };

  // Trigger autosave when dependent fields change
  useEffect(() => {
    if (speciesId || sex || maturity || weight || headBody || tailLength || siteType) {
      const handler = setTimeout(() => {
        triggerAutoSave();
      }, 1000); // Debounced autosave
      return () => clearTimeout(handler);
    }
  }, [speciesId, sex, maturity, weight, headBody, tailLength, siteType]);

  // Handle manual Draft save
  const handleSaveDraftManual = () => {
    triggerAutoSave();
    alert("💾 DRAFT MANIFEST ARCHIVED: Form status has been preserved. You can resume editing safe from data loss.");
  };

  // Submit biological capture handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    const newSpecimen: RodentSpecimen = {
      Record_ID: recordId,
      Date_Captured: new Date().toLocaleDateString('en-GB'),
      Time_Checked: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      Location_Name: locationName,
      GPS_Latitude: gpsLat,
      GPS_Longitude: gpsLon,
      EMA_Node_ID: 'EMA-1',
      Species_ID: speciesId,
      Sex: sex,
      Maturity_Stage: maturity,
      Reproductive_Condition: reproductive,
      Weight_g: weight,
      Head_Body_Length_mm: headBody,
      Tail_Length_mm: tailLength,
      Hind_Foot_mm: hindFoot,
      Ear_Length_mm: 17,
      Parasite_Load_Ext: 0,
      Ectoparasite_Spp: 'None',
      Ectoparasite_Common_Name: 'None',
      Ectoparasite_Count: 0,
      Endoparasite_Presence: 'No',
      Endoparasite_Spp: 'None',
      Endoparasite_Common_Name: 'None',
      Survival_24H: 'Alive',
      Survival_1WK: 'Alive',
      Survival_2WK: 'Alive',
      Survival_1M: 'Alive',
      Survival_3M: 'Alive',
      Recapture_Status: 'New Capture',
      Time_to_Event_Days: 90,
      Event_Status: 0,
      Trap_Night_ID: 14,
      Site_Type: siteType,
      Farm_Name: locationName + ' Trial',
      Village: 'Morogoro',
      Crop_Type: 'Maize'
    };

    onAddSpecimen(newSpecimen);

    // Save to submitted keys local log to check user submit permissions
    try {
      const userSubmits = JSON.parse(localStorage.getItem('ericon_member_submitted_ids') || '[]');
      localStorage.setItem('ericon_member_submitted_ids', JSON.stringify([...userSubmits, recordId]));
    } catch {}

    // Reset draft
    localStorage.removeItem(`ericon_draft_${activeFormType}`);
    alert(`🎉 RECORD TRANSMITTED SUCCESSFULLY! Biosecurity entry successfully cataloged under ${recordId}.`);

    // Instantiate next ID
    setRecordId(`REC-${Date.now().toString().slice(-4)}`);
  };

  // Check if a record was already submitted by member
  const checkIsLockedForMember = (id: string) => {
    if (isLeaderOrAdmin) return false;
    try {
      const userSubmits = JSON.parse(localStorage.getItem('ericon_member_submitted_ids') || '[]');
      return userSubmits.includes(id);
    } catch {
      return false;
    }
  };

  // Select list of recently submitted specimens to display corrections for admin
  const submittedHistory = useMemo(() => {
    return specimens.slice(0, 5);
  }, [specimens]);

  // Admin correction active state
  const [editingSpecimenId, setEditingSpecimenId] = useState<string | null>(null);
  const [editedWeight, setEditedWeight] = useState<number>(0);
  const [editedSpecies, setEditedSpecies] = useState<any>('');

  const startCorrection = (spec: RodentSpecimen) => {
    setEditingSpecimenId(spec.Record_ID);
    setEditedWeight(spec.Weight_g);
    setEditedSpecies(spec.Species_ID);
  };

  const handleCommitCorrection = () => {
    const original = specimens.find(s => s.Record_ID === editingSpecimenId);
    if (original) {
      const updated: RodentSpecimen = {
        ...original,
        Weight_g: editedWeight,
        Species_ID: editedSpecies
      };
      onUpdateSpecimen(updated);
      setEditingSpecimenId(null);
      alert("🛠️ ADMINISTRATIVE CORRECTION RECORDED: The dataset has been updated across audit registries.");
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Selector Tabs and Status Indicator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFormType('biological')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border ${
              activeFormType === 'biological'
                ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] shadow-3xs ericon-active-portal-tab'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>1. Capture Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormType('crop_damage')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border ${
              activeFormType === 'crop_damage'
                ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] shadow-3xs ericon-active-portal-tab'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Crop Damage log</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormType('warehouse')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 border ${
              activeFormType === 'warehouse'
                ? 'bg-[#e2f1ea] border-[#15462D] text-[#15462D] shadow-3xs ericon-active-portal-tab'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>3. Warehouse Audit</span>
          </button>
        </div>

        {/* Dynamic Saving Indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              formStatus === 'saving' ? 'bg-red-400' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              formStatus === 'saving' ? 'bg-red-500' : 'bg-emerald-500'
            }`} />
          </span>
          <span>
            {formStatus === 'saving' ? 'Synching Cloud Draft...' : 
             formStatus === 'draft_saved' ? `Auto-saved locally at ${lastAutoSaveTime}` : 'Form is synchronized'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-5">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono font-black uppercase bg-[#15462D]/10 text-emerald-950 px-2 py-0.5 rounded">
                KOBO-COMPLIANT INTERACTIVE SHEETS
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase mt-1.5 flex items-center gap-1">
                <span>📝</span>
                <span>
                  {activeFormType === 'biological' && 'Field Specimen Biostatistical Registry Sheet'}
                  {activeFormType === 'crop_damage' && 'Seasonal Crop Loss & Attack Frequency Log'}
                  {activeFormType === 'warehouse' && 'Continuous Mechanical Storage Surveillance Entry'}
                </span>
              </h3>
            </div>
          </div>

          {activeFormType === 'biological' && (
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">System Record ID:</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={recordId}
                    className="bg-slate-100 border border-slate-200 rounded p-2 text-slate-500 font-bold focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Target Species Phenotype:</label>
                  <select 
                    value={speciesId} 
                    onChange={e => { setSpeciesId(e.target.value as any); }}
                    className="bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-[#15462D]"
                  >
                    <option value="Mastomys natalensis">Mastomys natalensis (Multimammate)</option>
                    <option value="Rattus rattus">Rattus rattus (Roof Rat)</option>
                    <option value="Mus musculus">Mus musculus (House Mouse)</option>
                    <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                    <option value="Other">Other Murine Species</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Sex / Gender:</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Undetermined'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => { setSex(g as any); }}
                        className={`flex-1 py-1.5 border rounded font-black transition cursor-pointer text-center text-[10px] ${
                          sex === g 
                            ? 'bg-[#15462D] border-emerald-950 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 border-slate-100">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Maturity Lifecycle Stage:</label>
                  <select 
                    value={maturity} 
                    onChange={e => { setMaturity(e.target.value as any); }}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  >
                    <option value="Adult">Adult Specimen</option>
                    <option value="Sub-Adult">Sub-Adult Specimen</option>
                    <option value="Juvenile">Juvenile Specimen</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Reproductive Assessment:</label>
                  <select 
                    value={reproductive} 
                    onChange={e => { setReproductive(e.target.value as any); }}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  >
                    <option value="M: Scrotal">Scrotal (Male)</option>
                    <option value="M: Non-scrotal">Non-scrotal (Male)</option>
                    <option value="F: Perforate">Perforate (Female)</option>
                    <option value="F: Pregnant">Pregnant (Female)</option>
                    <option value="F: Lactating">Lactating (Female)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Specimen Weight (g):</label>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={e => setWeight(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t pt-4 border-slate-100">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Head-Body (mm):</label>
                  <input 
                    type="number" 
                    value={headBody} 
                    onChange={e => setHeadBody(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Tail Length (mm):</label>
                  <input 
                    type="number" 
                    value={tailLength} 
                    onChange={e => setTailLength(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Hind Foot Scale (mm):</label>
                  <input 
                    type="number" 
                    value={hindFoot} 
                    onChange={e => setHindFoot(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-500 uppercase">Assigned Site Type:</label>
                  <select 
                    value={siteType} 
                    onChange={e => { setSiteType(e.target.value as any); }}
                    className="bg-slate-50 border border-slate-200 rounded p-2 "
                  >
                    <option value="ERICON Fully Protected Farm">ERICON Fully Protected Farm</option>
                    <option value="ERICON Semi-Protected Farm">ERICON Semi-Protected Farm</option>
                    <option value="Non-ERICON Control Farm">Non-ERICON Control Farm</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 border-slate-100 flex items-center justify-between gap-3 font-mono">
                <button
                  type="button"
                  onClick={handleSaveDraftManual}
                  className="bg-slate-100 hover:bg-slate-200 border text-slate-600 px-4 py-2 rounded-lg cursor-pointer font-bold uppercase transition"
                >
                  Save Draft State
                </button>
                <button
                  type="submit"
                  className="bg-[#15462D] hover:bg-emerald-900 text-white font-extrabold px-5 py-2 rounded-lg cursor-pointer uppercase transition flex items-center gap-1 border border-emerald-950 shadow-3xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Form</span>
                </button>
              </div>
            </form>
          )}

          {activeFormType === 'crop_damage' && (
            <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center font-mono space-y-4">
              <span className="text-[8.5px] bg-emerald-100 text-[#15462D] font-extrabold px-2 py-0.5 rounded">M4 CROP LOSS FORM</span>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-sans leading-relaxed">
                Crop Damage surveillance logs are continuously autosaved locally. Fill out standard indicators such as Planting Stage, Sample counts, and Bitter indices.
              </p>
              <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto text-left text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-550 uppercase">Planted Crop Type:</label>
                  <input type="text" defaultValue="Pearl Millet" className="bg-white border rounded p-2 font-sans placeholder-slate-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-550 uppercase">Severe Infestation Alert:</label>
                  <select className="bg-white border rounded p-2 ">
                    <option>No Severe Indicators</option>
                    <option>Yes - Exceeds safe threshold</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert("🎉 Crop loss record submission committed to experimental metrics repository!");
                }}
                className="bg-[#15462D] hover:bg-emerald-900 border text-white font-extrabold text-[10px] px-5 py-2.5 rounded-lg uppercase tracking-wide cursor-pointer active:scale-95 transition mt-4"
              >
                Submit Crop Log
              </button>
            </div>
          )}

          {activeFormType === 'warehouse' && (
            <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center font-mono space-y-4">
              <span className="text-[8.5px] bg-emerald-100 text-[#15462D] font-extrabold px-2 py-0.5 rounded">M5 WAREHOUSE LOG SHEET</span>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-sans leading-relaxed">
                Record product contamination counts, active rodent burrow sightings, and OWEP inlet seal clearance levels.
              </p>
              <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto text-left text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-550 uppercase">Warehouse Name:</label>
                  <input type="text" defaultValue="SUA East Storage" className="bg-white border rounded p-2 font-sans placeholder-slate-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-extrabold text-slate-550 uppercase">Sealed Door Gasket Wear:</label>
                  <select className="bg-white border rounded p-2">
                    <option>Excellent Condition</option>
                    <option>Minor Gap Detected</option>
                    <option>Replacement Mandatory</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  alert("🎉 Warehouse status audit reported successfully!");
                }}
                className="bg-[#15462D] hover:bg-emerald-900 border text-white font-extrabold text-[10px] px-5 py-2.5 rounded-lg uppercase tracking-wide cursor-pointer active:scale-95 transition mt-4"
              >
                Transmit Storage Entry
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Admin Correction Workbench & Members Submissions Lock List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Member Submissions Locking Explanation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-sans space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Lock className="w-4 h-4 text-emerald-800" />
              <h4 className="font-mono text-[10px] uppercase font-black tracking-wider">
                Registry Constraints Ledger
              </h4>
            </div>
            
            <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <p className="flex items-center gap-1">
                <span className="font-bold text-[#15462D]">Research Members:</span>
                <span>Can submit, cannot edit after submission.</span>
              </p>
              <p className="flex items-center gap-1">
                <span className="font-bold text-[#15462D]">Leaders/Admins:</span>
                <span>Can review, modify, and audit all records.</span>
              </p>
            </div>

            <div className="bg-white p-2 border rounded flex items-center justify-between text-[11.5px] font-mono mt-1">
              <span className="text-slate-400 font-bold uppercase text-[9px]">My Mode:</span>
              <span className="text-[#15462D] font-extrabold uppercase">
                {scientistRole === 'Administrator' ? '👑 Admin' : '🔬 Member'}
              </span>
            </div>
          </div>

          {/* Leaders & Admins Correction Board (Module 10 review) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3">
            <h4 className="text-[10px] font-bold font-mono uppercase text-slate-705 border-b pb-2">
              🛠️ Bio-Surveillance Correction board
            </h4>

            {isLeaderOrAdmin ? (
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 font-sans">
                  Select a recently uploaded specimen log from the academic registry to alter biological metrics on-demand:
                </p>

                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                  {submittedHistory.map(spec => (
                    <div 
                      key={spec.Record_ID}
                      onClick={() => startCorrection(spec)}
                      className="border border-slate-150 p-2.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition"
                    >
                      <div className="text-[11px] font-mono leading-tight">
                        <p className="font-extrabold text-[#15462D]">{spec.Record_ID}</p>
                        <p className="text-[9.5px] text-slate-400 leading-none mt-1">{spec.Species_ID} • {spec.Weight_g}g</p>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>

                {editingSpecimenId && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-3 font-mono text-[10px] animate-fade-in mt-2">
                    <div className="flex justify-between items-center pb-1.5 border-b">
                      <span className="font-bold text-slate-700">Correcting ID: {editingSpecimenId}</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-extrabold text-slate-500 uppercase">Correct Species:</label>
                      <select 
                        value={editedSpecies} 
                        onChange={e => setEditedSpecies(e.target.value)}
                        className="bg-white border rounded p-1.5 text-[11px]"
                      >
                        <option value="Mastomys natalensis">Mastomys natalensis</option>
                        <option value="Rattus rattus">Rattus rattus</option>
                        <option value="Mus musculus">Mus musculus</option>
                        <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-extrabold text-slate-500 uppercase">Correct Weight Value (g):</label>
                      <input 
                        type="number" 
                        value={editedWeight}
                        onChange={e => setEditedWeight(Number(e.target.value))}
                        className="bg-white border rounded p-1.5 text-[11px]" 
                      />
                    </div>

                    <div className="flex gap-1.5 justify-end mt-1">
                      <button 
                        type="button"
                        onClick={() => setEditingSpecimenId(null)}
                        className="bg-white border px-2.5 py-1 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={handleCommitCorrection}
                        className="bg-[#15462D] text-white px-3.5 py-1 rounded font-bold"
                      >
                        Apply Correct Logs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-center font-mono text-[10px] text-slate-400 italic">
                ⚠ Clearance standard restrict. Lead investigators can correct recorded fields on-demand.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
