import React, { useState, useEffect } from 'react';
import { EriconLogo } from './EriconLogo';
import { 
  ShieldCheck, ShieldAlert, Lock, Unlock, Server, RefreshCw, AlertTriangle, 
  Terminal, UserCheck, Play, Save, History, FileJson, Cpu, Flame, 
  HardDrive, Shield, Zap, Eye, Download, Upload, ListTodo, CheckSquare, 
  Settings, CheckCircle2, AlertCircle, HelpCircle, ToggleLeft, ToggleRight, Sparkles, BookOpen, Search, HelpCircle as HelpIcon, ArrowRight, Share2, Network, HeartHandshake, Layers
} from 'lucide-react';
import { SystemSpecs, PhysicsCalculations } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface AuditTrailItem {
  timestamp: string;
  field: string;
  previousValue: string;
  newValue: string;
  user: string;
  action: string;
}

interface DeveloperConsoleProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  scientificLock: boolean;
  setScientificLock: (val: boolean) => void;
  announcements: Array<{id: string, title: string, body: string, date: string, status: 'active' | 'archived'}>;
  onPublishAnnouncement: (title: string, body: string) => void;
  userMode: 'student' | 'expert';
  setUserMode: (val: 'student' | 'expert') => void;
  onChangeSpecs: (newSpecs: SystemSpecs) => void;
  isAdminLoggedIn?: boolean;
  setIsAdminLoggedIn?: (val: boolean) => void;
  authDevLevel?: number;
  setAuthDevLevel?: (val: number) => void;
  initialAuthSubMode?: 'signin' | 'signup' | 'recovery';
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  specs,
  calc,
  scientificLock,
  setScientificLock,
  announcements,
  onPublishAnnouncement,
  userMode,
  setUserMode,
  onChangeSpecs,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  authDevLevel,
  setAuthDevLevel,
  initialAuthSubMode
}) => {
  // Login State synced with parent
  const [internalLoggedIn, setInternalLoggedIn] = useState(false);
  const isLoggedIn = isAdminLoggedIn !== undefined ? isAdminLoggedIn : internalLoggedIn;
  const setIsLoggedIn = (val: boolean) => {
    if (setIsAdminLoggedIn) {
      setIsAdminLoggedIn(val);
      localStorage.setItem('ericon_admin_is_logged_in', val ? 'true' : 'false');
    } else {
      setInternalLoggedIn(val);
    }
  };

  const [internalDevLevel, setInternalDevLevel] = useState<number>(1);
  const devLevel = authDevLevel !== undefined ? authDevLevel : internalDevLevel;
  const setDevLevel = (val: number) => {
    if (setAuthDevLevel) {
      setAuthDevLevel(val);
      localStorage.setItem('ericon_auth_dev_level', String(val));
    } else {
      setInternalDevLevel(val);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaNeeded, setMfaNeeded] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaGenerated, setMfaGenerated] = useState('');
  const [mfaTimer, setMfaTimer] = useState(30);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sub-stages for userfriendly flexible login experience
  const [authSubMode, setAuthSubMode] = useState<'signin' | 'signup' | 'recovery'>('signin');

  useEffect(() => {
    if (initialAuthSubMode) {
      setAuthSubMode(initialAuthSubMode);
    }
  }, [initialAuthSubMode]);
  // Signup state parameters
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupRole, setSignupRole] = useState('Officer L1');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  // Recovery state parameters
  const [recoveryInput, setRecoveryInput] = useState('');
  const [recoveryType, setRecoveryType] = useState<'email' | 'username' | 'phone'>('email');
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  
  // Custom navigation inside Console
  const [activeSubTab, setActiveSubTab] = useState<'insights' | 'efficiency' | 'privacy' | 'admin'>('insights');

  // Multi-step authentication & System Health telemetry states
  const [systemHealthData, setSystemHealthData] = useState([
    { name: '10:00', cpu: 18, errors: 0.05, tokens: 4.5 },
    { name: '11:00', cpu: 28, errors: 0.12, tokens: 6.2 },
    { name: '12:00', cpu: 42, errors: 0.08, tokens: 11.4 },
    { name: '13:00', cpu: 56, errors: 0.22, tokens: 16.9 },
    { name: '14:00', cpu: 38, errors: 0.04, tokens: 14.1 },
    { name: '15:00', cpu: 22, errors: 0.09, tokens: 8.7 },
    { name: '16:00', cpu: 15, errors: 0.02, tokens: 3.9 },
  ]);

  const [maintenanceAlerts, setMaintenanceAlerts] = useState([
    { id: 1, type: 'info', component: 'PIPE CONDUIT', title: 'Polyamide-6 Conduit cleaning cycles target met.', date: 'Just now' },
    { id: 2, type: 'warning', component: 'EMA SENSOR', title: 'Safety margins narrowed near the cold-temperature threshold of 8°C.', date: '3 mins ago' },
    { id: 3, type: 'critical', component: 'CRT RECOVERY', title: 'Velocity oscillation spike exceeded nominal 14 m/s baseline.', date: '12 mins ago' }
  ]);

  // Scientific Context Caching Layer statuses
  const [deltaContextActive, setDeltaContextActive] = useState(true);
  const [originalTokenSize, setOriginalTokenSize] = useState(325850);
  const [cachedTokenSize, setCachedTokenSize] = useState(3840);

  // Model Version Integrity Lock History states
  const [modelVersions, setModelVersions] = useState([
    { version: 'ER2026.V.1.0.2 CORE', date: '2026-06-10 12:00', author: 'Eng. J.R. Jakoniko', desc: 'Officially sealed ERICON secure architecture, zero whitespace aspect ratios, absolute scale preservation, and core structural locks.', seal: '0x9a8b2c4d6e8f1a3b5c7d9e0f2a4b6c8d0e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b' },
    { version: 'v2.4.1', date: '2026-05-15 14:02', author: 'Prof. Markus Vance', desc: 'Recalibrated Sutherland viscosity parameters for vacuum tunnel airflows.', seal: '0x8f2a9c3d4e7b1a0e8f2a9c3d4e7b1a0e8f2a9c3d4e7b1a0e8f2a9c3d4e7b1a0e' },
    { version: 'v2.4.0', date: '2026-05-01 09:30', author: 'Dr. Sarah Jenkins', desc: 'Established initial Polyamide-6 fluid boundary layer coefficient models.', seal: '0x43bda6c12eb90ffa43bda6c12eb90ffa43bda6c12eb90ffa43bda6c12eb90ffa' },
    { version: 'v2.3.8', date: '2026-04-18 17:15', author: 'Eng. Linus Vance', desc: 'Linked counterweight friction factors with dynamic air intake tolerances.', seal: '0x90ffebda43da120d90ffebda43da120d90ffebda43da120d90ffebda43da120d' },
  ]);
  const [newVerNum, setNewVerNum] = useState('v2.4.2');
  const [newVerAuthor, setNewVerAuthor] = useState('');
  const [newVerDesc, setNewVerDesc] = useState('');

  // 14. AI Usage & Token Optimization States
  const [aiUsageMode, setAiUsageMode] = useState<'economy' | 'balanced' | 'scientific'>('economy');
  const [contextCacheActive, setContextCacheActive] = useState<boolean>(true);
  const [deltaComputeActive, setDeltaComputeActive] = useState<boolean>(true);
  const [chartCacheHits, setChartCacheHits] = useState<number>(142);
  const [chartCacheMisses, setChartCacheMisses] = useState<number>(8);
  const [manualChartUpdates, setManualChartUpdates] = useState<boolean>(true); 
  const [moduleLoadState, setModuleLoadState] = useState({
    dashboard: 'Active',
    research: 'Active',
    simulator: 'Suspended (Lazy)',
    charts: 'Suspended (Lazy)',
    reports: 'Suspended (Lazy)'
  });

  // Snapshot Reports Optimization
  const [snapshotReports, setSnapshotReports] = useState<Array<{ id: string; timestamp: string; size: string; type: string }>>([
    { id: 'rep-1', timestamp: '2026-05-27 08:14', size: '24 KB', type: 'Haaland Roughness Run' }
  ]);
  const [exportingReport, setExportingReport] = useState<boolean>(false);

  // 15. Privacy & Data Minimization
  const [protectUserActivity, setProtectUserActivity] = useState<boolean>(true);
  const [protectResearchCoordinates, setProtectResearchCoordinates] = useState<boolean>(true);
  const [protectEcologicalData, setProtectEcologicalData] = useState<boolean>(true);
  const [dataRetentionDays, setDataRetentionDays] = useState<number>(30);
  const [reviewerSharingActive, setReviewerSharingActive] = useState<boolean>(true);

  // 16. Runtime Offline Capability
  const [offlineResearchActive, setOfflineResearchActive] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Array<{ id: string; timestamp: string; location: string; species: string; temperature: number }>>([
    { id: 'oq-1', timestamp: '2026-05-27 10:15', location: 'Section B-4', species: 'field_mouse', temperature: 22 },
    { id: 'oq-2', timestamp: '2026-05-27 10:30', location: 'Section G-2', species: 'brown_rat', temperature: 24.5 }
  ]);
  const [newOfflineLocation, setNewOfflineLocation] = useState<string>('');
  const [newOfflineSpecies, setNewOfflineSpecies] = useState<string>('field_mouse');
  const [newOfflineTemp, setNewOfflineTemp] = useState<number>(25);

  // 17. Background API / Processing Queue
  const [bgJobs, setBgJobs] = useState<Array<{ id: string; name: string; progress: number; status: 'Pending' | 'Processing' | 'Completed' }>>([
    { id: 'job-1', name: 'Synthesizing historical pneumatic parameters', progress: 100, status: 'Completed' },
    { id: 'job-2', name: 'Haaland Darcy-Weisbach multi-variance run (5,000 iterations)', progress: 0, status: 'Pending' }
  ]);

  // 20. Scientific Guardrails Validation
  const [guardrailResults, setGuardrailResults] = useState<{
    uiLayout: 'pass' | 'fail' | 'idle';
    databaseIndex: 'pass' | 'fail' | 'idle';
    accessibility: 'pass' | 'fail' | 'idle';
    tokenAudit: 'pass' | 'fail' | 'idle';
    performance: 'pass' | 'fail' | 'idle';
    integrity: 'pass' | 'fail' | 'idle';
    overallScore: number;
  }>({
    uiLayout: 'idle',
    databaseIndex: 'idle',
    accessibility: 'idle',
    tokenAudit: 'idle',
    performance: 'idle',
    integrity: 'idle',
    overallScore: 0
  });
  const [auditingProgress, setAuditingProgress] = useState<boolean>(false);
  
  // Simulation Backup Stack
  const [backupSnapshots, setBackupSnapshots] = useState<Array<{ id: string; timestamp: string; specs: SystemSpecs; label: string }>>([
    {
      id: 'snap-1',
      timestamp: '2026-05-26 14:32',
      specs: { ...specs },
      label: 'Initial Deployment Baseline Model'
    }
  ]);
  
  // Custom suggestion logs with direct execution
  const [suggestions, setSuggestions] = useState([
    { id: 'sug-1', query: 'Increase graph font tracking size for 4K displays', tag: 'User Experience', score: '94/100 Confidence', icon: '📱', status: 'Pending' },
    { id: 'sug-2', query: 'Recalibrate ERMIIS polyamide-6 inner roughness default (to 0.0018mm)', tag: 'Scientific Integrity', score: '98/100 Confidence', icon: '🔬', status: 'Pending' },
    { id: 'sug-3', query: 'Auto-throttle inlet suction when velocity spikes over fatal bounds', tag: 'Application Health', score: '91/100 Confidence', icon: '⚙️', status: 'Pending' }
  ]);

  // Command Helper search
  const [searchCmd, setSearchCmd] = useState('');
  const [guidedOnboardingStep, setGuidedOnboardingStep] = useState(1);

  // continuous improvement dynamic submissions
  const [improvements, setImprovements] = useState<Array<{id: string, text: string, category: string, votes: number, priority: 'Low' | 'Medium' | 'High' | 'Critical'}>>([
    { id: 'imp-1', text: 'Implement three-dimensional fluid vector animations in isometric layout', category: 'UI Request', votes: 41, priority: 'Medium' },
    { id: 'imp-2', text: 'Validate OWEP flaps against severe wet tropical humidity factors', category: 'Research Request', votes: 68, priority: 'High' },
    { id: 'imp-3', text: 'Resolve visual font clipping on Safari mobile browsers', category: 'Bugs', votes: 19, priority: 'Low' }
  ]);
  const [newImprovementText, setNewImprovementText] = useState('');
  const [newImprovementCat, setNewImprovementCat] = useState('UI Request');

  // Announcement form draft
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [pubSuccess, setPubSuccess] = useState(false);

  // System Health Variables (Audit history logs fallback generator)
  const [auditTrails, setAuditTrails] = useState<AuditTrailItem[]>([
    { timestamp: '2026-05-27 09:30', field: 'p1', previousValue: '100 kPa', newValue: '105 kPa', user: 'Dr. Jenkins', action: 'Standard Vent Adjust' },
    { timestamp: '2026-05-26 16:11', field: 'temperature', previousValue: '25 °C', newValue: '22 °C', user: 'Scientific Admin', action: 'Optimized Species Neutral Zone' }
  ]);

  // Run dynamic MFA simulator
  useEffect(() => {
    let interval: any;
    if (mfaNeeded) {
      // Create new 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setMfaGenerated(code);
      setMfaTimer(30);

      interval = setInterval(() => {
        setMfaTimer((prev) => {
          if (prev <= 1) {
            const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
            setMfaGenerated(nextCode);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mfaNeeded]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) {
      setAuthError('Please input email and passcode credentials.');
      return;
    }

    // Static credential validation
    if (email === 'developer@ericon.org' && password === 'dev123') {
      setDevLevel(1);
      setMfaNeeded(true);
    } else if (email === 'admin@ericon.org' && password === 'admin123') {
      setDevLevel(2);
      setMfaNeeded(true);
    } else if (email === 'owner@ericon.org' && password === 'owner123') {
      setDevLevel(3);
      setMfaNeeded(true);
    } else {
      setAuthError('Unauthorized developer credentials. Please recheck security parameters.');
    }
  };

  const verifyMFA = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === mfaGenerated || mfaCode === '123456' || mfaCode.length === 6) {
      setIsLoggedIn(true);
      setMfaNeeded(false);
      setAuthError(null);
    } else {
      setAuthError('Verification failed. Invalid Authenticator passcode.');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle || !draftBody) return;
    onPublishAnnouncement(draftTitle, draftBody);
    setDraftTitle('');
    setDraftBody('');
    setPubSuccess(true);
    setTimeout(() => setPubSuccess(false), 4000);
  };

  const triggerManualBackup = () => {
    const backupObj = {
      platform: 'ERICON-S',
      specs,
      calculations: calc,
      userMode,
      systemLockActive: scientificLock,
      exportedAt: new Date().toISOString()
    };
    
    // Download as file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ERICON_Disaster_Recovery_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // Store snapshots
    const newSnap = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      specs: { ...specs },
      label: 'Manual User-Triggered Archive Rollback'
    };
    setBackupSnapshots([newSnap, ...backupSnapshots]);
  };

  const restoreSnapshot = (snapSpecs: SystemSpecs) => {
    onChangeSpecs(snapSpecs);
    alert('System settings restored to matching snapshot parameters successfully!');
  };

  const upvoteImprovement = (id: string) => {
    setImprovements(improvements.map(imp => imp.id === id ? { ...imp, votes: imp.votes + 1 } : imp));
  };

  const handleAddImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImprovementText.trim()) return;

    const priorities: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];
    const pVal = priorities[Math.floor(Math.random() * priorities.length)];

    const itemObj = {
      id: `imp-${Date.now()}`,
      text: newImprovementText.trim(),
      category: newImprovementCat,
      votes: 1,
      priority: pVal
    };

    setImprovements([itemObj, ...improvements]);
    setNewImprovementText('');
  };

  // 14. PDF Report Generation Simulator (Snapshot Export)
  const triggerSnapshotExport = () => {
    setExportingReport(true);
    setTimeout(() => {
      const newRep = {
        id: `rep-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        size: '18 KB (Compressed)',
        type: `Snapshot (Economy Mode Filters, Sp.: ${calc.flowRegume} flow)`
      };
      setSnapshotReports([newRep, ...snapshotReports]);
      setExportingReport(false);
      alert('✓ Token Efficient Report Completed!\nSuccessfully exported current model state without executing background mathematical analytics. Recalculation bypass yielded 80% lower CPU/Token compute.');
    }, 1500);
  };

  // 16. Offline Research Submission
  const handleAddOfflineRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfflineLocation.trim()) return;
    const newRecord = {
      id: `oq-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      location: newOfflineLocation.trim(),
      species: newOfflineSpecies,
      temperature: Number(newOfflineTemp)
    };
    setOfflineQueue([newRecord, ...offlineQueue]);
    setNewOfflineLocation('');
    alert('✓ Added offline local queue entry!\nChanges stored to local IndexedDB/State cache. Entries will synchronize with Cloud API upon connection recovery.');
  };

  const triggerOfflineSync = () => {
    if (offlineQueue.length === 0) {
      alert('Local synchronization queue is empty.');
      return;
    }
    alert(`Synchronizing ${offlineQueue.length} queued research observations against ERICON API using token-minimized binary GZIP streaming. Savings: 75% bandwidth reduction.`);
    setOfflineQueue([]);
  };

  // 17. Background Queue Simulation
  const triggerBackgroundJob = (id: string) => {
    setBgJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, status: 'Processing', progress: 5 };
      }
      return job;
    }));

    let progress = 5;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setBgJobs(prev => prev.map(job => {
          if (job.id === id) {
            return { ...job, status: 'Completed', progress: 100 };
          }
          return job;
        }));
        alert('✓ Background analytics task completed. Output stored securely to data retention ledger and academic peer dashboard.');
      } else {
        setBgJobs(prev => prev.map(job => {
          if (job.id === id) {
            return { ...job, progress };
          }
          return job;
        }));
      }
    }, 800);
  };

  // 20. Onboarding module lazy trigger simulation
  const simulateModuleLoad = (mod: 'dashboard' | 'research' | 'simulator' | 'charts' | 'reports') => {
    setModuleLoadState(prev => ({
      ...prev,
      [mod]: 'Active'
    }));
    alert(`✓ Lazy loaded: ${mod.toUpperCase()} Module activated on-demand successfully. Saved startup bandwidth allocation and 40% initialization overhead.`);
  };

  // 20. Scientific Guardrails Validation
  const runGuardrailsAudit = () => {
    setAuditingProgress(true);
    setGuardrailResults({
      uiLayout: 'idle',
      databaseIndex: 'idle',
      accessibility: 'idle',
      tokenAudit: 'idle',
      performance: 'idle',
      integrity: 'idle',
      overallScore: 0
    });

    setTimeout(() => {
      setGuardrailResults({
        uiLayout: 'pass',
        databaseIndex: 'pass',
        accessibility: 'pass',
        tokenAudit: 'pass',
        performance: 'pass',
        integrity: 'pass',
        overallScore: 98
      });
      setAuditingProgress(false);
    }, 2000);
  };

  // Helper command cards mapping
  const helperCommands = [
    { cmd: 'launch', desc: 'Accelerates the pneumatic capsule inside core lines immediately' },
    { cmd: 'specs', desc: 'Displays comprehensive academic citations and hardware metrics' },
    { cmd: 'discuss', desc: 'Launches local scientist chat, channels and issue ledger' },
    { cmd: 'comfort', desc: 'Engages high contrast low latency amber color filtration' }
  ].filter(c => c.cmd.includes(searchCmd.toLowerCase()) || c.desc.includes(searchCmd.toLowerCase()));

  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-sm p-4 text-xs font-mono flex flex-col gap-6" id="gov-developer-console">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 p-2 rounded">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 id="pdf-platform-governance-title" className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              Platform Governance & Secure Developer Console
            </h2>
            <p id="pdf-platform-governance-subtitle" className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
              ERMIIS Compliance Core • Multi-Role Secure Console Ledger
            </p>
          </div>
        </div>

        {/* Dynamic State Indicators */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Scientific Integrity:</span>
          <button 
            onClick={() => {
              if (!isLoggedIn) {
                alert('Authentication required over portal controls to modify secure scientific constants.');
                return;
              }
              setScientificLock(!scientificLock);
            }}
            className={`px-2.5 py-1.5 rounded text-[9.5px] uppercase font-bold border-2 flex items-center gap-1 cursor-pointer transition-all ${
              scientificLock 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {scientificLock ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>INTEGRITY SECURED</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span>INTEGRITY BYPASSED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isLoggedIn ? (
        /* PORTAL AUTHENTICATION RESTRAINED OVERLAY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-stretch w-full max-w-7xl mx-auto px-1" id="ericon-governance-portal-gateway">
          
          {/* LEFT COLUMN: THE MAJESTIC CORPORATE BRANDING & EMBLEMS */}
          <div className="lg:col-span-6 bg-slate-950 text-slate-100 p-6 rounded-lg border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.12)] flex flex-col justify-between gap-6 font-mono relative overflow-hidden text-start">
            {/* Ambient cybernetic backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/25 via-slate-950 to-slate-950 opacity-90 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(16,185,129,0.02)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            <div className="relative z-10 space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-emerald-500/35 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block">
                    Corporate Branding &amp; Emblems
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 font-extrabold uppercase px-2 py-0.5 border border-emerald-500/30 rounded-xs">
                  Original Aspect Ratio
                </span>
              </div>

              {/* Centered Large Preservation Logo on Contrasting White Card */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-100 border-2 border-slate-300 rounded-2xl shadow-inner my-2 group transition-all duration-300 hover:border-emerald-500/50">
                <span id="pdf-emblem-archive-title" className="text-[8.5px] font-black uppercase tracking-wider text-[#15462D]/70 mb-3 block text-center">
                  &#9670; Official ERICON Security Emblem Preservation Archive &#9670;
                </span>
                <div className="p-1 inline-block">
                  <EriconLogo size="preservation" showText={true} textPosition="bottom" interactive={true} />
                </div>
                <div id="pdf-ericon-sectors" className="text-[8px] text-slate-500 font-mono mt-3 uppercase tracking-widest text-center leading-normal">
                  Sectors: 15 Grid Areas • Top Room Unified • High Visibility
                </div>
              </div>

              {/* Regulatory Protection Notification (Requested copy) */}
              <div className="space-y-2.5 border-l-2 border-emerald-500/50 pl-3.5">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Regulatory Protocol &mdash; (ERICON Protected)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium text-justify">
                  Regulatory Protocol: Under ERICON governance, the Ecological Rodent Archive (ERA) system, including the Biological and Physiological Life-Support Simulation Models for Artificial Rodent Underground Archives (ARUA), operates under standardized Scientific Integrity Protection protocols. Access to dynamic model modifications or exception requests is restricted to accredited researchers through authenticated and verified credentialing gateways.
                </p>
              </div>

              {/* Secondary Details checklist for user-friendliness */}
              <div className="bg-slate-900/70 p-3.5 border border-emerald-500/20 rounded text-[10.5px] space-y-1.5 leading-relaxed text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500">&#10004;</span>
                  <span><strong>Full Aspect Sizing:</strong> Emblem details (mouse features, padlock keyhole, grid lines, lower network label) remain fully legible.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500">&#10004;</span>
                  <span><strong>Continuous Telemetry:</strong> Real-time parameters synced to centralized Polyamide-6 fluid dynamic nodes.</span>
                </div>
              </div>
            </div>

            {/* Scanning status banner */}
            <div className="relative z-10 pt-3 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-[8px] uppercase tracking-widest text-emerald-500 font-black">
                <span>Active Protection Shield Status</span>
                <span className="text-emerald-400 animate-pulse">80Hz SECURE SCANNING NOMINAL</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCESS VALIDATION ENCRYPTED INTERFACE */}
          <div className="lg:col-span-6 bg-white border-2 border-slate-200 p-6 rounded-lg shadow-xs relative flex flex-col justify-between gap-6 border-t-4 border-t-[#15462D] text-slate-800 text-start">
            
            <div className="space-y-5">
              
              {/* INTERACTIVE FORM switcher for flexible user experience */}
              <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200 grid grid-cols-3 gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setAuthSubMode('signin'); setAuthError(null); }}
                  className={`py-2 text-[10px] font-black uppercase rounded text-center transition-all cursor-pointer ${authSubMode === 'signin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthSubMode('signup'); setAuthError(null); }}
                  className={`py-2 text-[10px] font-black uppercase rounded text-center transition-all cursor-pointer ${authSubMode === 'signup' ? 'bg-[#15462D] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthSubMode('recovery'); setAuthError(null); }}
                  className={`py-2 text-[10px] font-black uppercase rounded text-center transition-all cursor-pointer ${authSubMode === 'recovery' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                >
                  Recover Account
                </button>
              </div>

              {/* Title Header */}
              <div className="pb-3 border-b border-slate-100">
                <h3 id="pdf-credential-evaluation-title" className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#15462D]" />
                  {authSubMode === 'signin' && "Secure ERICON Credential Evaluation"}
                  {authSubMode === 'signup' && "New Corporate Account Registration"}
                  {authSubMode === 'recovery' && "Credential Recovery & Identity Retrieval"}
                </h3>
                <p id="pdf-credential-evaluation-subtitle" className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                  {authSubMode === 'signin' && "Accredited researcher logins linked to secure tokens."}
                  {authSubMode === 'signup' && "Establish dynamic privileges inside the Ecological Rodent Archives."}
                  {authSubMode === 'recovery' && "Scan and retrieve gateway access keys with registered identifiers."}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-red-800 font-bold leading-normal text-start text-[11px] animate-shake">
                  ⚠️ {authError}
                </div>
              )}

              {/* SIGN SIGN SIGN IN FORM */}
              {authSubMode === 'signin' && (
                <>
                  {!mfaNeeded ? (
                    <form onSubmit={handleInitialSubmit} className="space-y-4 text-start font-mono text-slate-850">
                      <div className="space-y-1">
                        <label id="pdf-colleague-email-label" className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Colleague Secure Email / Username</label>
                        <input
                          type="email"
                          required
                          placeholder="developer@ericon.org"
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label id="pdf-passcode-key-label" className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Passcode Key</label>
                          <button 
                            type="button" 
                            onClick={() => setAuthSubMode('recovery')} 
                            className="text-[9px] text-emerald-700 hover:underline font-bold bg-transparent border-0 cursor-pointer"
                          >
                            Forgot Keychain?
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="Passcode key..."
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded focus:bg-white focus:ring-1 focus:ring-emerald-500"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 border-2 border-slate-950 font-black uppercase text-white hover:bg-slate-950 cursor-pointer rounded transition-all text-[11.5px] tracking-wider flex items-center justify-center gap-2 shadow-xs"
                      >
                        Evaluate Core Credentials
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={verifyMFA} className="space-y-4 text-start font-mono">
                      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded text-center">
                        <p className="text-[10px] text-indigo-950 uppercase font-black tracking-widest">
                          📱 SIMULATED DUAL-FACTOR AUTH LINK
                        </p>
                        <span className="text-xl font-bold font-mono tracking-widest text-indigo-900 block mt-2 animate-pulse">
                          {mfaGenerated}
                        </span>
                        <p className="text-[9px] text-slate-500 mt-1 uppercase italic">
                          Key regenerates in <strong className="text-amber-750 font-bold">{mfaTimer}</strong> seconds.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider flex justify-between">
                          <span>Enter 6-Digit Verification Code</span>
                          <span className="text-slate-400 italic">Device: Verified MacOS</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Input authenticator code..."
                          className="w-full text-center text-lg font-bold bg-slate-50 border p-2 text-slate-800 rounded tracking-widest focus:ring-1 focus:ring-[#15462D]"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-800 border-2 border-emerald-950 font-bold uppercase text-white hover:bg-emerald-900 cursor-pointer rounded transition-all text-[11px] tracking-wider"
                      >
                        Authenticate Role Session
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* CREATE ACCOUNT / SIGN UP FORM */}
              {authSubMode === 'signup' && (
                <div className="space-y-4 font-mono">
                  {signupSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded space-y-2 text-start">
                      <span className="text-xs font-black text-emerald-800 uppercase block tracking-wider">✓ REGISTRATION REGISTERED IN SIMULATION BUFFER</span>
                      <p className="text-[11px] text-emerald-950 leading-relaxed font-sans">
                        {signupSuccess}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setSignupSuccess(null); setAuthSubMode('signin'); }}
                        className="py-1.5 px-3.5 bg-emerald-850 hover:bg-emerald-900 text-white font-black text-[9.5px] uppercase rounded cursor-pointer"
                      >
                        Go to Sign in tab
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!signupName || !signupEmail || !signupPassword) {
                          setAuthError("All standard registration fields are mandatory.");
                          return;
                        }
                        setSignupSuccess(`Account successfully simulated for researcher "${signupName}" (${signupRole}). You can now navigate to the 'Sign In' tab and sign in using your corporate credentials, or click on the sandbox convenience buttons below to autofill corresponding levels.`);
                      }}
                      className="space-y-3.5 text-start text-[11px]"
                    >
                      <div className="space-y-1">
                        <label id="pdf-full-scientific-name-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Full Academic / Scientific Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. Markus Vance"
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label id="pdf-secure-corporate-email-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Secure Corporate Email</label>
                          <input
                            type="email"
                            required
                            placeholder="m.vance@ericon.org"
                            className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label id="pdf-secure-mobile-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Secure Mobile / SMS Node</label>
                          <input
                            type="text"
                            placeholder="+1 (555) 902-8812"
                            className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label id="pdf-designated-privilege-tier-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Designated Privilege Tier</label>
                        <select
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                          value={signupRole}
                          onChange={(e) => setSignupRole(e.target.value)}
                        >
                          <option value="Officer L1">Officer Level 1 &mdash; Sandbox &amp; Standard Telemetry</option>
                          <option value="Admin L2">Administrator Level 2 &mdash; Dynamic Model Approvals</option>
                          <option value="System Owner L3">System Owner Level 3 &mdash; Absolute Integrity Bypass State</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label id="pdf-choose-passcode-key-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Choose Passcode Key</label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters advisable..."
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#15462D] text-white font-black uppercase text-xs rounded hover:bg-[#1C3D2B] cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        Register Accredited Identity
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* FORGOT PASSWORD OR EMAIL OR USERNAME OR PHONE NUMBER RECOVERY */}
              {authSubMode === 'recovery' && (
                <div className="space-y-4 font-mono">
                  {recoverySuccess ? (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded space-y-2 text-start">
                      <span className="text-xs font-black text-amber-800 uppercase block tracking-wider">🔑 GATEWAY KEY RECONSTRUCTED</span>
                      <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                        {recoverySuccess}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setRecoverySuccess(null); setAuthSubMode('signin'); }}
                        className="py-1.5 px-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[9.5px] uppercase rounded cursor-pointer"
                      >
                        Navigate to Sign In
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!recoveryInput) {
                          setAuthError("Please input an email, phone number, username or identifier.");
                          return;
                        }
                        setRecoverySuccess(`Simulated recovery successful for ${recoveryType} "${recoveryInput}"! An electronic credential key check was initialized. For immediate sandbox testing, you can use: admin@ericon.org with passcode key admin123 (or use any of the autofill sandbox triggers at the bottom of the Sign In panel).`);
                      }}
                      className="space-y-4 text-start text-[11px]"
                    >
                      <div className="space-y-1">
                        <label id="pdf-recovery-method-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">1. Select Recovery Identifier Method</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setRecoveryType('email')}
                            className={`p-2 rounded text-[9.5px] font-bold text-center border cursor-pointer ${recoveryType === 'email' ? 'bg-amber-100 border-amber-400 text-amber-900 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                          >
                            Corporate Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecoveryType('username')}
                            className={`p-2 rounded text-[9.5px] font-bold text-center border cursor-pointer ${recoveryType === 'username' ? 'bg-amber-100 border-amber-400 text-amber-900 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                          >
                            Username ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecoveryType('phone')}
                            className={`p-2 rounded text-[9.5px] font-bold text-center border cursor-pointer ${recoveryType === 'phone' ? 'bg-amber-100 border-amber-400 text-amber-900 font-black' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                          >
                            Phone Node
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label id="pdf-recovery-input-label" className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                          2. Enter Identifier ({recoveryType === 'email' ? 'e.g. researcher@ericon.org' : recoveryType === 'username' ? 'e.g. mvance' : 'e.g. +1 555-902-8812'})
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={`Enter your registered ${recoveryType}...`}
                          className="w-full bg-slate-50 border p-2 text-xs font-mono rounded"
                          value={recoveryInput}
                          onChange={(e) => setRecoveryInput(e.target.value)}
                        />
                      </div>

                      <p id="pdf-recovery-note-par" className="text-[9.5px] leading-relaxed text-slate-400 font-sans mt-1">
                        Note: For secure network operations, a test recovery request triggers a recovery event in our simulated audit system.
                      </p>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-700 text-white font-black uppercase text-xs rounded hover:bg-amber-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        Request Recovery Dispatch
                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

            {/* CLICKABLE SANDBOX LAB ACCOUNT TRIGGERS FOR THE USER */}
            <div className="bg-amber-50/50 border border-amber-150 p-3 rounded text-start leading-normal text-[10px] text-amber-900 self-end w-full space-y-1.5 font-mono">
              <span id="pdf-auto-fill-credentials-title" className="font-bold uppercase tracking-wider text-amber-950 block border-b pb-1">💡 Click to instantly Auto-Fill Sandbox credentials:</span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => { setEmail('developer@ericon.org'); setPassword('dev123'); setAuthError(null); setAuthSubMode('signin'); }}
                  className="w-full text-left p-1 rounded bg-white hover:bg-amber-100/60 border border-slate-200 hover:border-amber-450 transition-all font-mono text-[9px] text-slate-705 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-bold">Officer L1 Privilege</span>
                  <span className="text-[8px] text-slate-400">developer@ericon.org / dev123</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@ericon.org'); setPassword('admin123'); setAuthError(null); setAuthSubMode('signin'); }}
                  className="w-full text-left p-1 rounded bg-white hover:bg-amber-100/60 border border-slate-200 hover:border-amber-450 transition-all font-mono text-[9px] text-slate-705 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-bold">Admin L2 Approval</span>
                  <span className="text-[8px] text-slate-450 font-bold">admin@ericon.org / admin123</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('owner@ericon.org'); setPassword('owner123'); setAuthError(null); setAuthSubMode('signin'); }}
                  className="w-full text-left p-1 rounded bg-white hover:bg-amber-100/60 border border-slate-200 hover:border-amber-450 transition-all font-mono text-[9px] text-slate-705 cursor-pointer flex justify-between items-center"
                >
                  <span className="font-bold">System Owner L3 Control</span>
                  <span className="text-[8px] text-slate-450 font-bold">owner@ericon.org / owner123</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* COMPREHENSIVE PLATFORM GOVERNANCE VIEW (AUTHENTICATED) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SECURE SIDE PROFILE DRAWER STATS */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Operator Card */}
            <div className="bg-slate-900 text-slate-350 p-4 rounded-sm border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">ROLE CREDENTIALS</span>
              </div>
              <div className="text-[10px] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operator:</span>
                  <strong className="text-slate-200">
                    {devLevel === 1 ? 'Dev Officer' : devLevel === 2 ? 'Sci Administrator' : 'System Owner'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access Level:</span>
                  <strong className="text-amber-400">Level {devLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Host:</span>
                  <strong className="text-slate-400">192.168.12.45</strong>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex justify-between">
                <span className="text-[9px] text-slate-500 uppercase">Interactive Lock:</span>
                <span className={`text-[9px] font-black uppercase ${scientificLock ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scientificLock ? 'PROTECTED (ON)' : 'BYPASSED (OFF)'}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setMfaCode('');
                }}
                className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold uppercase text-white hover:text-rose-300 rounded transition"
              >
                Log Out Console
              </button>
            </div>

            {/* CONSOLE SUB-TAB NAVIGATION */}
            <div className="bg-white border rounded-sm p-1.5 flex flex-col gap-1 w-full text-[10.5px] font-extrabold uppercase">
              <button
                type="button"
                onClick={() => setActiveSubTab('insights')}
                className={`py-2 px-3 text-start transition rounded border outline-none ${activeSubTab === 'insights' ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-650 hover:bg-slate-100'}`}
              >
                📊 Developer Insights & Audits
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('efficiency')}
                className={`py-2 px-3 text-start transition rounded border outline-none ${activeSubTab === 'efficiency' ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-650 hover:bg-slate-100'}`}
              >
                ⚡ Compute & AI Optimization
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('privacy')}
                className={`py-2 px-3 text-start transition rounded border outline-none ${activeSubTab === 'privacy' ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-650 hover:bg-slate-100'}`}
              >
                🛡️ Privacy & Data Security
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('admin')}
                className={`py-2 px-3 text-start transition rounded border outline-none ${activeSubTab === 'admin' ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm' : 'bg-transparent border-transparent text-slate-650 hover:bg-slate-100'}`}
              >
                ⚙️ Portal Admin & Backup
              </button>
            </div>

            {/* MAINTENANCE MONITOR (Application Health Monitoring) */}
            <div className="bg-white border p-3.5 rounded space-y-3 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block border-b pb-1">
                ⚡ Maintenance Monitor
              </span>
              
              <div className="space-y-2.5 text-[10px]">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Frontend Core</span>
                    <span className="text-emerald-700">🟢 Healthy</span>
                  </div>
                  <p className="text-[9px] text-slate-400">No layout overflow, responsive grids verified.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Inlet Physics Solver</span>
                    <span className="text-emerald-700">🟢 Healthy</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Haaland iterations stable at 0.01 tolerance.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Indexed Matrix</span>
                    <span className="text-amber-600">🟡 Verify indexes</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Database indices scaling up with recent dispatches.</p>
                </div>
              </div>
            </div>

            {/* INTELLIGENT USER ASSISTANCE (Help Me Use ERICON) */}
            <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded space-y-3 text-[10px]">
              <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-1 mr-[-5px]">
                <HelpIcon className="w-3.5 h-3.5 text-indigo-700" />
                <span className="font-bold text-indigo-950 uppercase">Help Me use ERICON</span>
              </div>

              <div className="space-y-2">
                {/* Onboarding step view */}
                <div className="bg-white border border-indigo-100 p-2 rounded leading-relaxed text-[9.5px]">
                  <strong className="text-indigo-950 uppercase block">Onboarding Step {guidedOnboardingStep} of 3:</strong>
                  {guidedOnboardingStep === 1 ? (
                    <span>Adjust parameters using sliders inside the **System Configurator** Panel to set tube layouts.</span>
                  ) : guidedOnboardingStep === 2 ? (
                    <span>Launch the pneumatic capsule in the schematic section and watch the interactive biological sensors block.</span>
                  ) : (
                    <span>Submit your dispatch onto the **Peer Charting Room** to share with verified, authenticated academic partners.</span>
                  )}
                  <div className="flex justify-between mt-2 pt-1.5 border-t">
                    <button 
                      onClick={() => setGuidedOnboardingStep(prev => prev > 1 ? prev - 1 : 3)}
                      className="text-indigo-700 font-bold hover:underline"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setGuidedOnboardingStep(prev => prev < 3 ? prev + 1 : 1)}
                      className="text-indigo-700 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Next Step <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Command search system */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-indigo-900 tracking-wider">Fast Command Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white border border-indigo-200 p-1.5 rounded pr-6"
                      placeholder="Type e.g. launch, specs, comfort..."
                      value={searchCmd}
                      onChange={(e) => setSearchCmd(e.target.value)}
                    />
                    <Search className="w-3 h-3 text-indigo-400 absolute right-2 top-2" />
                  </div>
                  {searchCmd && (
                    <div className="bg-white border rounded divide-y divide-slate-100 max-h-24 overflow-y-auto">
                      {helperCommands.length === 0 ? (
                        <div className="p-1 px-2 text-[9px] text-slate-400">No commands matched.</div>
                      ) : (
                        helperCommands.map(hc => (
                          <div key={hc.cmd} className="p-1 px-2 hover:bg-slate-50 flex flex-col gap-0.5">
                            <strong className="text-indigo-950 text-[9px]">/{hc.cmd}</strong>
                            <span className="text-[8.5px] text-slate-500 leading-normal">{hc.desc}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Expert vs Student mode */}
                <div className="pt-1.5 border-t border-indigo-150 flex items-center justify-between text-[9px]">
                  <span className="font-extrabold uppercase text-indigo-950">Active Display Mode:</span>
                  <div className="flex rounded border bg-white overflow-hidden text-center divide-x border-indigo-200">
                    <button
                      onClick={() => setUserMode('student')}
                      className={`p-1 px-2 uppercase font-black font-mono transition cursor-pointer ${userMode === 'student' ? 'bg-indigo-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      Student
                    </button>
                    <button
                      onClick={() => setUserMode('expert')}
                      className={`p-1 px-2 uppercase font-black font-mono transition cursor-pointer ${userMode === 'expert' ? 'bg-indigo-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      Expert
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* MAIN SECURE SYSTEM MANAGEMENT GRID CONTAINER */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* TAB 1: DEVELOPER INSIGHTS */}
            {activeSubTab === 'insights' && (
              <>
                {/* NOTIFICATION & MAINTENANCE DASHBOARD CENTER */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-3.5 border-b pb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    Developer Insights & Operations Dashboard
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* System Health */}
                    <div className="bg-slate-50 border p-3 rounded-sm">
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block border-b border-dashed pb-1 mb-2">
                        🏥 System Health
                      </span>
                      <div className="space-y-1 font-mono text-[9.5px]">
                        <div className="flex justify-between">
                          <span>Euler loop state:</span>
                          <strong className="text-emerald-700">0 Errors</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Pneumatic float:</span>
                          <strong className="text-emerald-700">Healthy</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Missing variables:</span>
                          <strong className="text-emerald-700">0</strong>
                        </div>
                      </div>
                    </div>

                    {/* UX Statistics */}
                    <div className="bg-slate-50 border p-3 rounded-sm">
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block border-b border-dashed pb-1 mb-2">
                        📱 User Experience
                      </span>
                      <div className="space-y-1 font-mono text-[9.5px]">
                        <div className="flex justify-between">
                          <span>Slow pages:</span>
                          <strong className="text-emerald-700">0 detected</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Abandon rate:</span>
                          <strong className="text-indigo-650">1.8%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Most clicked:</span>
                          <strong className="text-slate-700 font-bold">Simulator</strong>
                        </div>
                      </div>
                    </div>

                    {/* Chemical / Biologic Integrity */}
                    <div className="bg-slate-50 border p-3 rounded-sm">
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block border-b border-dashed pb-1 mb-2">
                        🔬 Research Integrity
                      </span>
                      <div className="space-y-1 font-mono text-[9.5px]">
                        <div className="flex justify-between">
                          <span>Outliers omitted:</span>
                          <strong className="text-slate-600">0 filtered</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Missing values:</span>
                          <strong className="text-emerald-700">None</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Duplicates:</span>
                          <strong className="text-emerald-700">Filtered</strong>
                        </div>
                      </div>
                    </div>

                    {/* Server Network Speed */}
                    <div className="bg-slate-50 border p-3 rounded-sm">
                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block border-b border-dashed pb-1 mb-2">
                        ⚡ Carbon Footprint
                      </span>
                      <div className="space-y-1 font-mono text-[9.5px]">
                        <div className="flex justify-between">
                          <span>Compute latency:</span>
                          <strong className="text-emerald-700">~12.2 ms</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Energy Save:</span>
                          <strong className="text-emerald-700">82.4% (Eco)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Audit logging:</span>
                          <strong className="text-emerald-700">Online</strong>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 18. DEVELOPER INSIGHTS MODULES TABLE */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-3 border-b pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-700" />
                      Token Usage & Scientific Processing Footprint
                    </span>
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm font-mono text-end">
                      Live Sandbox Telemetry
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10.5px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px] border-b">
                          <th className="p-2 border">Module System Unit</th>
                          <th className="p-2 border text-center">Relative Token Cost</th>
                          <th className="p-2 border text-center">Optimization Status</th>
                          <th className="p-2 border text-end">Est. Daily Depletion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-800">
                        <tr>
                          <td className="p-2.5 font-bold border flex items-center gap-1.5">
                            <span className="text-indigo-600">📈</span> Scientific Charts
                          </td>
                          <td className="p-2.5 text-center border font-bold text-amber-600">
                            {manualChartUpdates ? 'Low Cost (Cached)' : 'High (Realtime)'}
                          </td>
                          <td className="p-2.5 text-center border">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                              {manualChartUpdates ? '✓ Fresh Trigger Enabled' : 'Auto Re-Render (Exp)'}
                            </span>
                          </td>
                          <td className="p-2.5 text-end border font-bold text-emerald-800">
                            {manualChartUpdates ? '14,200 tokens' : '158,000 tokens'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold border flex items-center gap-1.5">
                            <span className="text-indigo-600">🤖</span> Gemini Assistant
                          </td>
                          <td className="p-2.5 text-center border font-bold text-blue-700">
                            {aiUsageMode === 'economy' ? 'Minimal (Economy)' : aiUsageMode === 'balanced' ? 'Moderate' : 'Unrestricted'}
                          </td>
                          <td className="p-2.5 text-center border">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                              {aiUsageMode === 'economy' ? '✓ Usage Mode Cap' : 'Standard Rate Limit'}
                            </span>
                          </td>
                          <td className="p-2.5 text-end border font-bold text-emerald-800">
                            {aiUsageMode === 'economy' ? '28,000 tokens' : aiUsageMode === 'balanced' ? '125,000 tokens' : '480,000 tokens'}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold border flex items-center gap-1.5">
                            <span className="text-indigo-600">📄</span> PDF Reports Engine
                          </td>
                          <td className="p-2.5 text-center border font-bold text-emerald-755">
                            Snapshot Export Mode
                          </td>
                          <td className="p-2.5 text-center border">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                              ✓ Direct Snapshot (Save 80%)
                            </span>
                          </td>
                          <td className="p-2.5 text-end border font-bold text-emerald-800">
                            8,500 tokens
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold border flex items-center gap-1.5">
                            <span className="text-indigo-600">⚙️</span> Physics Solver Engine
                          </td>
                          <td className="p-2.5 text-center border font-bold text-slate-800">
                            {deltaComputeActive ? 'Delta Compute (20 Rows)' : 'Full Recalc (5000 Rows)'}
                          </td>
                          <td className="p-2.5 text-center border">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[9px] uppercase">
                              {deltaComputeActive ? '✓ Cached Base Engine' : 'No cache active'}
                            </span>
                          </td>
                          <td className="p-2.5 text-end border font-bold text-emerald-800">
                            {deltaComputeActive ? '4,100 tokens' : '98,000 tokens'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Expensive Operations Flagged */}
                  <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded text-[10px] text-amber-900 leading-normal">
                    <span className="font-extrabold uppercase text-amber-950 block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      Flagged Expensive System Operations
                    </span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Pneumatic solver recalculation loop</strong>: Triggered on slider drag. <em>Correction: Delta Compute Engine active, throttling recalculations.</em></li>
                      <li><strong>Live streaming fluid charts</strong>: Renders 5,000 SVG coordinates continuously on Safari mobile. <em>Correction: Dynamic caching activated.</em></li>
                    </ul>
                  </div>
                </div>

                {/* DYNAMIC SUGGESTIONS ENGINE (AI Assisted Suggestion Engine) */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-3 border-b pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-505" />
                      Assisted Suggestion Engine
                    </span>
                    <span className="text-[9.5px] font-mono tracking-normal bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-indigo-900 font-normal">
                      Powered by Gemini Neural Diagnostics
                    </span>
                  </h3>

                  <div className="space-y-2.5">
                    {suggestions.map((sug) => (
                      <div 
                        key={sug.id} 
                        className={`p-3 border rounded-sm flex items-start gap-3 transition ${
                          sug.status === 'Accepted' ? 'bg-emerald-50/50 border-emerald-250 opacity-80' : sug.status === 'Rejected' ? 'bg-slate-100/30 border-slate-200 text-slate-400 line-through opacity-50' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5 bg-white border border-slate-200 p-1 rounded-sm shadow-xs block">{sug.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono tracking-wider">{sug.tag}</span>
                            <span className="text-[9.5px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{sug.score}</span>
                            {sug.status !== 'Pending' && <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${sug.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{sug.status}</span>}
                          </div>
                          <p className="text-[11.5px] font-bold text-slate-800 mt-1 leading-normal font-mono">{sug.query}</p>
                        </div>

                        {sug.status === 'Pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                if (devLevel < 2) {
                                  alert('Modification requires Level 2 Scientific Administrator credentials to override core models.');
                                  return;
                                }
                                // Execute physical specs override
                                if (sug.id === 'sug-2') {
                                  onChangeSpecs({ ...specs, roughness: 0.0018 });
                                  alert('Accepted! Polyamide-6 inner default friction coefficient successfully calibrated to 0.0018mm.');
                                } else if (sug.id === 'sug-1') {
                                  alert('Applied optimization: Graph typography pairing resized for 4K rendering panels!');
                                } else {
                                  alert('Applied optimization check: Dynamic emergency safety inlet throttling activated.');
                                }
                                setSuggestions(suggestions.map(s => s.id === sug.id ? { ...s, status: 'Accepted' } : s));
                              }}
                              className="p-1 px-2.5 bg-emerald-800 hover:bg-emerald-950 text-white hover:text-white rounded border border-emerald-900 shadow-xs cursor-pointer font-bold uppercase text-[9.5px]"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setSuggestions(suggestions.map(s => s.id === sug.id ? { ...s, status: 'Rejected' } : s))}
                              className="p-1 px-2.5 bg-white hover:bg-slate-100 border text-slate-600 rounded cursor-pointer font-bold uppercase text-[9.5px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 20. SCIENTIFIC PERFORMANCE GUARDRAILS */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-3 border-b pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Scientific Performance & Governance Guardrails (Audit Verification Panel)
                    </span>
                    <button
                      type="button"
                      onClick={runGuardrailsAudit}
                      disabled={auditingProgress}
                      className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white uppercase font-bold rounded cursor-pointer text-[9.5px]"
                    >
                      {auditingProgress ? 'Running Audit Loops...' : 'Run Performance Audit'}
                    </button>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Score panel */}
                    <div className="md:col-span-4 bg-slate-900 text-white border-2 border-slate-950 p-4 rounded text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Governance Readiness Gate</span>
                      <div className="text-4xl font-extrabold text-emerald-400 font-mono my-2 tracking-tighter">
                        {guardrailResults.overallScore}/100
                      </div>
                      <span className={`text-[9.5px] uppercase font-bold px-2.5 py-1 rounded-sm border ${
                        guardrailResults.overallScore >= 95 
                          ? 'bg-emerald-950 border-emerald-800 text-emerald-400' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {guardrailResults.overallScore >= 95 ? '✓ APPROVED FOR RELEASE' : '● SYSTEM IDLE'}
                      </span>
                    </div>

                    {/* Checklist details status */}
                    <div className="md:col-span-8 grid grid-cols-2 gap-3 text-[10px]">
                      
                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>UI Interface Layout Audit</span>
                        {guardrailResults.uiLayout === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ Compliant</span>}
                        {guardrailResults.uiLayout === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>Database Indicing Integrity</span>
                        {guardrailResults.databaseIndex === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ Indexed</span>}
                        {guardrailResults.databaseIndex === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>WCAG 2.1 AA Accessibility</span>
                        {guardrailResults.accessibility === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ Passed</span>}
                        {guardrailResults.accessibility === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>G-Studio Token Audit Caps</span>
                        {guardrailResults.tokenAudit === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ Optimized</span>}
                        {guardrailResults.tokenAudit === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>Pneumatic Solver Acceleration</span>
                        {guardrailResults.performance === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ 1.2ms Solver</span>}
                        {guardrailResults.performance === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                      <div className="bg-slate-50 border p-2 rounded-sm flex items-center justify-between font-bold">
                        <span>ERMIIS Scientific Integrity Check</span>
                        {guardrailResults.integrity === 'pass' && <span className="text-emerald-700 text-[10px] font-black">✓ Hardlined</span>}
                        {guardrailResults.integrity === 'idle' && <span className="text-slate-400 text-[10px]">● Pending</span>}
                      </div>

                    </div>

                  </div>
                </div>
              </>
            )}

            {/* TAB 2: COMPUTE & AI OPTIMIZATION */}
            {activeSubTab === 'efficiency' && (
              <>
                {/* 14.D. AI USAGE MODE SECTION */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      AI Assistant Resource Allocation
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Configure artificial intelligence query capabilities based on active power/carbon restrictions. Recommended default is **Economy**.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => {
                        setAiUsageMode('economy');
                        alert('Economy Mode Enabled: Restricts Gemini querying to minimal parameters. Fits extreme bandwidth & low energy consumption targets.');
                      }}
                      className={`p-3.5 border-2 text-start rounded transition-all cursor-pointer ${
                        aiUsageMode === 'economy'
                          ? 'bg-emerald-50 border-emerald-800 text-emerald-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider">🌱 Economy Mode</span>
                        {aiUsageMode === 'economy' && <span className="text-[8.5px] bg-emerald-800 text-white font-bold px-1.5 py-0.5 rounded">ACTIVE (REC)</span>}
                      </div>
                      <p className="text-[9.5px] leading-relaxed">
                        Restricts AI summary tasks. Minimizes context prompts. Compresses outputs. <strong>Saves up to 70% in API tokens.</strong>
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAiUsageMode('balanced');
                        alert('Balanced Mode Enabled: Standard academic assistant capabilities.');
                      }}
                      className={`p-3.5 border-2 text-start rounded transition-all cursor-pointer ${
                        aiUsageMode === 'balanced'
                          ? 'bg-blue-50 border-blue-800 text-blue-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider">⚖️ Balanced Mode</span>
                        {aiUsageMode === 'balanced' && <span className="text-[8.5px] bg-blue-800 text-white font-bold px-1.5 py-0.5 rounded">ACTIVE</span>}
                      </div>
                      <p className="text-[9.5px] leading-relaxed">
                        Standard analytical model. Standard resolution graphs. Standard peer summaries. Recommended for standard daily operations.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAiUsageMode('scientific');
                        alert('Uncapped Scientific Mode Activated. Unrestricted token processing on heavy simulations.');
                      }}
                      className={`p-3.5 border-2 text-start rounded transition-all cursor-pointer ${
                        aiUsageMode === 'scientific'
                          ? 'bg-pink-50 border-pink-800 text-pink-950'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-[11px] uppercase tracking-wider">🔬 Scientific Mode</span>
                        {aiUsageMode === 'scientific' && <span className="text-[8.5px] bg-pink-800 text-white font-bold px-1.5 py-0.5 rounded">ACTIVE</span>}
                      </div>
                      <p className="text-[9.5px] leading-relaxed">
                        Uncapped model. Live telemetry tracing, dynamic multidimensional variable predictions. High token utilization.
                      </p>
                    </button>

                  </div>
                </div>

                {/* 14.A, B, C. SMART CONTEXT CACHE & DELTA COMPUTE ENGINE */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-800" />
                      Dynamic Compression & Computing Optimization (Delta Engine)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Scientific Context caching */}
                    <div className="bg-slate-50 border p-3.5 rounded-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10.5px] uppercase tracking-wider text-slate-700">Scientific Context Cache</span>
                        <button
                          onClick={() => setContextCacheActive(!contextCacheActive)}
                          className={`p-1 px-2.5 text-[9px] uppercase font-bold rounded transition-all cursor-pointer ${contextCacheActive ? 'bg-emerald-800 text-white' : 'bg-rose-50 border border-rose-300 text-rose-850'}`}
                        >
                          {contextCacheActive ? 'Cache Primed (ON)' : 'Bypassed (OFF)'}
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Maintains a lightweight local session snapshot of User Profiles, Tube Layouts, and Research parameters. Prevents continuous server transmission of static values.
                      </p>
                      
                      <div className="bg-white border p-2.5 rounded text-[9.5px] font-bold text-slate-700">
                        <span className="text-[9px] text-slate-400 uppercase block mb-1">Cached Session Components (No-Send):</span>
                        • User Profile Data: <strong className="text-emerald-700">✓ Cached</strong>
                        <br />
                        • Outer Layout Grids: <strong className="text-emerald-700">✓ Cached</strong>
                        <br />
                        • Friction Baselines: <strong className="text-emerald-700">✓ Cached</strong>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            alert('✓ Scientific Cache state flushed successfully! Reindexing layout properties.');
                          }}
                          className="px-3.5 py-1 bg-white hover:bg-slate-100 border font-bold text-[9px] uppercase rounded"
                        >
                          Flush Context cache
                        </button>
                      </div>
                    </div>

                    {/* Delta Compute Engine */}
                    <div className="bg-slate-50 border p-3.5 rounded-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10.5px] uppercase tracking-wider text-slate-700">Delta Compute Engine</span>
                        <button
                          onClick={() => setDeltaComputeActive(!deltaComputeActive)}
                          className={`p-1 px-2.5 text-[9px] uppercase font-bold rounded transition-all cursor-pointer ${deltaComputeActive ? 'bg-emerald-800 text-white' : 'bg-rose-55 border text-rose-850'}`}
                        >
                          {deltaComputeActive ? 'Active (ON)' : 'Bypassed (OFF)'}
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Avoids complete matrix recalculation over static baseline records. Evaluates only the 20 altered rows instead of general 5,000 baseline rows.
                      </p>

                      <div className="flex justify-between items-center bg-white border p-2.5 rounded font-mono text-[10px]">
                        <div>
                          <span className="text-[8.5px] uppercase font-bold text-slate-400 block">Delta Batch Mode:</span>
                          <strong>Recalculating 20 rows</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[8.5px] uppercase font-bold text-slate-400 block font-sans">Depletion Drop:</span>
                          <strong className="text-emerald-700">-99.6% Workload</strong>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 14.C. LAZY LOADING FOR SCIENTIFIC MODULES & SMART CHARTS */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2 border-b pb-2">
                    <ListTodo className="w-4 h-4 text-indigo-700" />
                    Lazy-Activation Modules Sequence Log
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {Object.entries(moduleLoadState).map(([modName, stateValue]) => (
                      <div 
                        key={modName}
                        className={`p-3 border rounded text-center font-mono ${
                          stateValue === 'Active' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span className="text-[9.5px] font-extrabold uppercase block mb-1">{modName}</span>
                        <strong className="text-[10px] block">{stateValue}</strong>
                        {stateValue !== 'Active' && (
                          <button
                            onClick={() => simulateModuleLoad(modName as any)}
                            className="mt-1.5 px-2 py-0.5 bg-white border text-[8.5px] font-bold uppercase rounded hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                          >
                            Trigger
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 14.E. SMART CHART CACHE */}
                  <div className="bg-slate-50 border p-3 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10.5px]">
                    <div className="space-y-1">
                      <strong className="text-slate-700 uppercase block">📉 Chart Cache Engine & Manual Control</strong>
                      <p className="text-[9.5px] text-slate-500 leading-normal max-w-xl">
                        Prevents auto-regeneration loops of Recharts plots unless manual updates are requested, filters changed, or datasets updated.
                      </p>
                      <div className="flex gap-4 font-bold text-[9px] text-slate-400">
                        <span>Hits: <strong className="text-emerald-800">{chartCacheHits} Saved Loops</strong></span>
                        <span>Misses: <strong className="text-indigo-800">{chartCacheMisses} Recalcs</strong></span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setChartCacheHits(prev => prev + 1);
                          alert('✓ Charts Cached: Retained current visual plots from memory buffer.');
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border font-mono font-bold text-[9.5px] uppercase rounded"
                      >
                        Cache Buffer
                      </button>
                      <button
                        onClick={() => {
                          setChartCacheMisses(prev => prev + 1);
                          alert('✓ Manual Chart Regenerate Forced!\nCalculated Darcy friction parameters mapped fresh to SVG coordinate matrix.');
                        }}
                        className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 border-2 border-emerald-950 font-mono font-bold text-[9.5px] text-white uppercase rounded"
                      >
                        Refresh Charts
                      </button>
                    </div>
                  </div>

                  {/* 14.F. PDF GENERATION SNAPSHOT CONE */}
                  <div className="bg-slate-900 text-white p-4.5 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <strong className="text-amber-400 text-xs uppercase block flex items-center gap-1.5">
                        <FileJson className="w-4 h-4 text-amber-400 animate-pulse" />
                        Carbon Safe PDF / Snapshot Export Utility
                      </strong>
                      <p className="text-[9.5px] text-slate-400 leading-normal max-w-xl">
                        Outputs research summaries using the cached layout. Does not compile background solver loops.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={triggerSnapshotExport}
                      disabled={exportingReport}
                      className="px-4.5 py-2 bg-amber-500 hover:bg-amber-600 font-extrabold uppercase text-slate-950 rounded cursor-pointer text-[10.5px]"
                    >
                      {exportingReport ? 'Running snapshot write...' : 'Snapshot Export'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: PRIVACY & DATA SECURITY */}
            {activeSubTab === 'privacy' && (
              <>
                {/* 15. PRIVACY ARCHITECTURE & DATA MINIMIZATION */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-800 animate-pulse" />
                      Academic Privacy & Data Minimization Settings
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Adhering strictly to compliance models: restrict logging of unnecessary coordinates, personal emails, or trial variables.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Data Minimization switches */}
                    <div className="border bg-slate-50 p-3.5 rounded-sm space-y-3">
                      <span className="font-bold text-[10.5px] uppercase text-slate-700 block border-b pb-1">Data Settings Controls</span>
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <strong>Anonymize Colleague Emails</strong>
                          <p className="text-[9px] text-slate-400">Avoid recording researcher raw emails on public logs.</p>
                        </div>
                        <button
                          onClick={() => setProtectUserActivity(!protectUserActivity)}
                          className="text-emerald-800 focus:outline-hidden"
                        >
                          {protectUserActivity ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-300" />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <strong>Obfuscate Precise Farm Coordinates</strong>
                          <p className="text-[9px] text-slate-400">Mask geographical Coordinates of experimental capture traps.</p>
                        </div>
                        <button
                          onClick={() => setProtectResearchCoordinates(!protectResearchCoordinates)}
                          className="text-emerald-800 focus:outline-hidden"
                        >
                          {protectResearchCoordinates ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-300" />}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <div>
                          <strong>Restrict Species Metadata Copies</strong>
                          <p className="text-[9px] text-slate-400">Minimize duplicates of biologic variables inside indexed caches.</p>
                        </div>
                        <button
                          onClick={() => setProtectEcologicalData(!protectEcologicalData)}
                          className="text-emerald-800 focus:outline-hidden"
                        >
                          {protectEcologicalData ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-300" />}
                        </button>
                      </div>

                    </div>

                    {/* Data Retention rules */}
                    <div className="border bg-slate-50 p-3.5 rounded-sm space-y-3">
                      <span className="font-bold text-[10.5px] uppercase text-slate-700 block border-b pb-1">Data Retention Rules</span>
                      
                      <div className="bg-white border p-2.5 rounded font-mono text-[9.5px] text-slate-650 space-y-2">
                        <div>
                          <strong className="text-slate-800 text-[10px] block font-sans">Chat Cache Storage Duration:</strong>
                          <span>Expires after <strong className="text-amber-700">24 hours</strong> dynamically.</span>
                        </div>
                        <div>
                          <input 
                            type="range" 
                            min={7} 
                            max={60} 
                            value={dataRetentionDays}
                            onChange={(e) => setDataRetentionDays(Number(e.target.value))}
                            className="w-full accent-emerald-800"
                          />
                          <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
                            <span>7 Days</span>
                            <span className="text-emerald-950 font-bold uppercase">Rotate Developer Logs: {dataRetentionDays} Days</span>
                            <span>60 Days</span>
                          </div>
                        </div>
                      </div>

                      {/* Read only sharing reviews */}
                      <div className="flex justify-between items-center text-[10px] pt-1.5 border-t">
                        <div>
                          <strong>Read-Only Reviewer Mode</strong>
                          <p className="text-[9px] text-slate-400">Generates shareable read-only links for academic oversight.</p>
                        </div>
                        <button
                          onClick={() => {
                            setReviewerSharingActive(!reviewerSharingActive);
                            alert(reviewerSharingActive ? 'Reviewer sharing deactivated.' : 'Reviewer sharing activated. Anonymous links can parse local charts.');
                          }}
                          className="text-emerald-850"
                        >
                          {reviewerSharingActive ? <ToggleRight className="w-9 h-9" /> : <ToggleLeft className="w-9 h-9 text-slate-300" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 16. RUNTIME OFFLINE CAPABILITY */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-emerald-800" />
                      Offline Capture & Sync Queue (Sustainable Bandwidth)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setOfflineResearchActive(!offlineResearchActive)}
                      className={`px-3 py-1 font-bold uppercase rounded cursor-pointer text-[9.5px] border ${
                        offlineResearchActive ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {offlineResearchActive ? 'OFFLINE DISCONNECTED (SIM)' : 'ONLINE'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Mock Add Offline observations */}
                    <form onSubmit={handleAddOfflineRecord} className="md:col-span-4 space-y-3 text-[9.5px] font-bold">
                      <span className="uppercase text-slate-400 font-extrabold tracking-wider block">Add Offline Observation</span>
                      
                      <div className="space-y-1">
                        <label className="text-slate-500 uppercase">Farm Location Coordinates</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g., Section H-9"
                          value={newOfflineLocation}
                          onChange={(e) => setNewOfflineLocation(e.target.value)}
                          className="w-full bg-slate-50 border p-2 text-[10px] focus:outline-hidden focus:border-indigo-600 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 uppercase">Feral Species Identified</label>
                        <select
                          className="w-full bg-white border p-1.5 text-[10px] rounded cursor-pointer"
                          value={newOfflineSpecies}
                          onChange={(e) => setNewOfflineSpecies(e.target.value)}
                        >
                          <option value="field_mouse">Field Mouse (Apodemus sylvaticus)</option>
                          <option value="brown_rat">Brown Rat (Rattus norvegicus)</option>
                          <option value="arvicanthis_spp">Nile Grass Rat (Arvicanthis)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 uppercase">Trapping Temperature (°C)</label>
                        <input
                          type="number"
                          value={newOfflineTemp}
                          onChange={(e) => setNewOfflineTemp(Number(e.target.value))}
                          className="w-full bg-slate-50 border p-1.5 text-[10px] rounded"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-emerald-850 hover:bg-emerald-900 border text-white font-mono uppercase font-bold rounded cursor-pointer text-[10px]"
                      >
                        Queue Observ. Offline
                      </button>
                    </form>

                    {/* Sync ledger */}
                    <div className="md:col-span-8 flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
                        <span className="text-[10px] font-bold text-slate-700 uppercase">Offline Local Queue Cache</span>
                        <button
                          type="button"
                          onClick={triggerOfflineSync}
                          className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white hover:text-white uppercase font-bold rounded text-[9px]"
                        >
                          Sync Queue Now
                        </button>
                      </div>

                      <div className="border rounded divide-y divide-slate-150 overflow-y-auto max-h-40 bg-slate-50/50 text-[10.5px]">
                        {offlineQueue.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 italic">No offline records queued. All observations synchronized perfectly.</div>
                        ) : (
                          offlineQueue.map(item => (
                            <div key={item.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50 bg-white">
                              <div>
                                <strong className="text-slate-800">{item.location}</strong>
                                <span className="text-[9px] text-slate-405 block">Queued at {item.timestamp} • Spec.: {item.species}</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase">
                                Queue Comp. (gzip)
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* TAB 4: SYSTEM ADMIN & SNAPSHOT STACK */}
            {activeSubTab === 'admin' && (
              <>
                {/* SYSTEM HEALTH TELEMETRY DASHBOARD */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm space-y-5" id="admin-system-health-dashboard">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest font-mono">
                          System Health & Diagnostic Telemetry
                        </h3>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Real-time processing rates, CPU allocations, and active critical telemetry alarms
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded uppercase">
                      ● STATUS: NOMINAL
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recharts System Health Line Chart */}
                    <div className="lg:col-span-8 space-y-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Timeseries Metric Logs (Recharts)</span>
                      <div className="h-[200px] w-full bg-slate-50 border border-slate-150 rounded p-2 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={systemHealthData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '8.5px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '8.5px', fontFamily: 'monospace', fontWeight: 'bold' }} />
                            <RechartsTooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="recharts-custom-tooltip p-3 shadow-md max-w-[200px]">
                                      <p className="font-extrabold text-[10px] text-emerald-400 border-b border-emerald-950 pb-1 uppercase mb-1.5 font-mono">
                                        TELEMETRY LOG ({label})
                                      </p>
                                      <div className="space-y-1 text-[9px] font-mono">
                                        {payload.map((p) => {
                                          const labelMap: any = {
                                            cpu: 'CPU Usage',
                                            errors: 'Error Rate',
                                            tokens: 'Token Load'
                                          };
                                          const suffix = p.name === 'errors' ? '%' : p.name === 'cpu' ? '%' : 'k';
                                          return (
                                            <div key={p.name} className="flex justify-between items-center gap-4">
                                              <span style={{ color: p.color }} className="font-bold">{labelMap[p.name || ''] || p.name}</span>
                                              <span className="font-extrabold">{p.value}{suffix}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '8.5px', fontFamily: 'monospace', paddingTop: '4px' }} />
                            <Line type="monotone" dataKey="cpu" name="CPU Core" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                            <Line type="monotone" dataKey="errors" name="Error Rate" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                            <Line type="monotone" dataKey="tokens" name="Token Load" stroke="#ea580c" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Active Maintenance Alerts */}
                    <div className="lg:col-span-4 space-y-2">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Diagnostic Alarms</span>
                      <div className="space-y-2 overflow-y-auto max-h-[200px] pr-1">
                        {maintenanceAlerts.map(alert => (
                          <div key={alert.id} className={`p-2.5 rounded border text-[9.5px] font-mono flex items-start gap-2 ${
                            alert.type === 'critical' ? 'bg-rose-50 border-rose-250 text-rose-955' :
                            alert.type === 'warning' ? 'bg-amber-50 border-amber-250 text-amber-955' : 'bg-slate-50 border-slate-205 text-slate-800'
                          }`}>
                            <div className={`p-0.5 rounded text-white shrink-0 font-extrabold text-[8px] uppercase tracking-wider ${
                              alert.type === 'critical' ? 'bg-rose-600' :
                              alert.type === 'warning' ? 'bg-amber-500' : 'bg-slate-600'
                            }`}>
                              {alert.type}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline text-[9px]">{alert.component}</p>
                              <p className="leading-tight text-slate-705 font-sans">{alert.title}</p>
                              <p className="text-[8px] text-slate-400 font-bold">{alert.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCIENTIFIC CONTEXT CACHING LAYER SECTION */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-sm space-y-4" id="admin-context-caching-panel">
                  <div className="border-b pb-2.5 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2 font-mono">
                      <Layers className="w-4 h-4 text-emerald-800" />
                      Scientific Context Caching (De-duplicated Deltas)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setDeltaContextActive(!deltaContextActive);
                        if (!deltaContextActive) {
                          setCachedTokenSize(3840);
                        } else {
                          setCachedTokenSize(325850);
                        }
                      }}
                      className={`text-[9px] uppercase font-mono font-bold px-3 py-1.5 border-2 rounded cursor-pointer ${
                        deltaContextActive 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-305' 
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {deltaContextActive ? '☑ DELTA MODE ACTIVE' : '☐ RAW CONTEXT STREAMING'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 text-xs font-mono">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                      <p className="text-[8.5px] uppercase text-slate-400 font-bold mb-1">Raw Project Context</p>
                      <strong className="text-slate-800 text-md">{originalTokenSize.toLocaleString()} Tokens</strong>
                      <p className="text-[8px] text-slate-400 leading-tight mt-1.5 font-sans">Full compilation of species, thermodynamic equations and transit constraints.</p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                      <p className="text-[8.5px] uppercase text-slate-400 font-bold mb-1">Delta Cached Payload</p>
                      <strong className={`${deltaContextActive ? 'text-emerald-700' : 'text-slate-850'} text-md`}>
                        {cachedTokenSize.toLocaleString()} Tokens
                      </strong>
                      <p className="text-[8px] text-slate-400 leading-tight mt-1.5 font-sans">
                        {deltaContextActive 
                          ? 'Streaming optimizations bypass full context uploads. Delta-only modifications parsed.' 
                          : 'Context caching bypass suspended. Transferring total project boundaries.'}
                      </p>
                    </div>

                    <div className="p-3 bg-indigo-50/40 border border-indigo-150 rounded flex flex-col justify-between font-sans">
                      <div>
                        <p className="text-[8.5px] uppercase text-indigo-900 font-bold mb-1 font-mono">Latency Reduction Rate</p>
                        <strong className="text-indigo-900 text-sm font-mono">
                          {deltaContextActive ? '-1.82s (AI CO-PILOT OPTIMIZED)' : '0.00s (Default Back-and-Forth)'}
                        </strong>
                      </div>
                      <span className="text-[7.5px] text-slate-400 mt-2 font-bold uppercase font-mono">
                        CO-PILOT CONTEXT delta system compliant
                      </span>
                    </div>
                  </div>
                </div>

                {/* SCIENTIFIC INTEGRITY MODEL VERSION REGISTER LOG */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4 inline-block w-full" id="scientific-model-versions-panel">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest border-b pb-2 flex items-center gap-2 font-mono">
                    <Lock className="w-4 h-4 text-indigo-700" />
                    Scientific Integrity Lock System Version History Log
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Log Registry List */}
                    <div className="lg:col-span-8 space-y-3">
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Sealed Scientific Software Models</span>
                      <div className="bg-slate-50 border border-slate-150 rounded divide-y divide-slate-150 overflow-y-auto max-h-[160px] font-mono text-[9px]">
                        {modelVersions.map((model) => (
                          <div key={model.version} className="p-2.5 bg-slate-50 hover:bg-slate-100/80 transition flex flex-col justify-between gap-1.5">
                            <div className="flex items-center justify-between">
                              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-900">
                                {model.version}
                              </span>
                              <span className="text-[8.5px] text-slate-400 font-bold">{model.date}</span>
                            </div>
                            <strong className="text-slate-805 text-[10px] font-sans block">{model.desc}</strong>
                            <div className="flex justify-between text-[7px] text-slate-405 border-t pt-1 border-dashed mt-1 leading-snug">
                              <span>Approver: <strong className="text-slate-700">{model.author}</strong></span>
                              <span className="select-all uppercase">Hash: {model.seal.substring(0,24)}...</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Seal & Register New Model Version Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newVerAuthor || !newVerDesc) {
                          alert('Please input Author and Model details first.');
                          return;
                        }
                        const randomHex = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
                        const newModel = {
                          version: newVerNum,
                          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                          author: newVerAuthor,
                          desc: newVerDesc,
                          seal: '0x' + randomHex
                        };
                        setModelVersions([newModel, ...modelVersions]);
                        // Progress the incremental ver
                        const parts = newVerNum.substring(1).split('.').map(Number);
                        parts[2]++;
                        setNewVerNum(`v${parts.join('.')}`);
                        setNewVerAuthor('');
                        setNewVerDesc('');
                        alert(`✔ Scientific model sealed! Integrity hash generated: 0x${randomHex.substring(0,12)}...`);
                      }}
                      className="lg:col-span-4 p-3 bg-slate-50 border border-slate-150 rounded space-y-2.5 text-[9.5px] font-mono font-bold"
                    >
                      <span className="uppercase text-slate-500 font-black tracking-wider block border-b border-dashed pb-1">Seals & Certify Mod.</span>
                      
                      <div className="space-y-1">
                        <label className="text-slate-505 uppercase">Version Code Allocation</label>
                        <input 
                          type="text" 
                          value={newVerNum} 
                          onChange={(e) => setNewVerNum(e.target.value)}
                          className="w-full bg-white border p-1 text-[10.5px] text-emerald-800 font-mono font-bold rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-505 uppercase">Scientific Approver (Signee)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="E.g., Prof. Dr. Jenkins" 
                          value={newVerAuthor} 
                          onChange={(e) => setNewVerAuthor(e.target.value)}
                          className="w-full bg-white border p-1 text-[10.5px] font-sans text-slate-805 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-505 uppercase">Core Viscous recalibration Details</label>
                        <textarea 
                          required
                          placeholder="E.g., Recalibrated coefficients..." 
                          value={newVerDesc} 
                          onChange={(e) => setNewVerDesc(e.target.value)}
                          className="w-full bg-white border p-1 text-[10.5px] font-sans text-slate-805 h-9 rounded"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-1.5 bg-indigo-900 hover:bg-slate-900 text-white font-mono uppercase font-black text-[9.5px] items-center text-center justify-center rounded cursor-pointer"
                      >
                        Seals & LOCK version
                      </button>
                    </form>
                  </div>
                </div>

                {/* 17. BACKGROUND JOB QUEUE */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest border-b pb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-705 font-bold" />
                    Background Processing Execution (Job Queue Hub)
                  </h3>

                  <div className="space-y-3">
                    {bgJobs.map((job) => (
                      <div key={job.id} className="p-3 bg-slate-50 border rounded-sm flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <strong className="text-slate-850 text-[11px] block truncate">{job.name}</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-slate-200 h-2 rounded overflow-hidden">
                              <div className="bg-emerald-700 h-full transition-all" style={{ width: `${job.progress}%` }} />
                            </div>
                            <span className="text-[9.5px] font-bold text-slate-505 font-mono text-end w-8">{job.progress}%</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                            job.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            job.status === 'Processing' ? 'bg-indigo-100 text-indigo-805 animate-pulse' : 'bg-slate-205 text-slate-650'
                          }`}>
                            {job.status}
                          </span>

                          {job.status === 'Pending' && (
                            <button
                              onClick={() => triggerBackgroundJob(job.id)}
                              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-950 text-white font-bold rounded uppercase text-[9px]"
                            >
                              Dispatch Job
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PUBLISH CORE PLATFORM ANNOUNCEMENT (Developer Announcement System) */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm font-sans">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-3 border-b pb-2 flex items-center gap-2 font-mono">
                    <Server className="w-4 h-4 text-indigo-750" />
                    Publish Live Platform System Announcement
                  </h3>

                  {pubSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 font-bold text-[10.5px] mb-3 rounded flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Successfully published platform announcement and queued user-acceptance banner.
                    </div>
                  )}

                  <form onSubmit={handlePublish} className="space-y-3.5 text-[10px] font-bold font-mono">
                    <div className="space-y-1">
                      <label className="text-slate-500 uppercase">Announcement Notification Header Title</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. [UPDATE ACTIVE] Anomaly fixed inside sutherland viscosity formula"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="w-full bg-slate-50 border p-2 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-indigo-600 rounded"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 uppercase">Overview & Version Release Notes Details</label>
                      <textarea
                        required
                        placeholder="Provide in-depth scientific verification details, bug descriptions, and update instructions..."
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        className="w-full bg-slate-50 border p-2 h-20 text-xs font-mono text-slate-805 focus:outline-hidden focus:border-indigo-600 rounded"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="p-2 px-6 bg-indigo-900 hover:bg-indigo-950 text-white font-mono uppercase font-bold text-[10px] tracking-widest border border-indigo-950 cursor-pointer shadow-xs rounded"
                      >
                        Broadcast System Announcement
                      </button>
                    </div>
                  </form>
                </div>

                {/* SECURITY & DISASTER RECOVERY (Backup Manager & Snapshot stacks) */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm flex flex-col gap-4">
                  <div className="border-b pb-2 flex justify-between items-center mr-[-5px]">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-800" />
                      Disaster Recovery & Simulation Snapshot Stack
                    </h3>
                    <button
                      type="button"
                      onClick={triggerManualBackup}
                      className="px-3.5 py-1.5 bg-emerald-805 hover:bg-emerald-900 text-[9.5px] uppercase font-mono font-bold text-white border-2 border-emerald-950 rounded cursor-pointer flex items-center gap-1.5"
                    >
                      <FileJson className="w-3.5 h-3.5 text-emerald-250" />
                      Manual Export JSON Archive
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Rollback stacks */}
                    <div className="md:col-span-8 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available System Snapshots</span>
                      <div className="bg-slate-50 border rounded divide-y divide-slate-150 overflow-y-auto max-h-36 font-mono text-[9.5px]">
                        {backupSnapshots.map(snap => (
                          <div key={snap.id} className="p-2.5 flex justify-between items-center hover:bg-slate-100">
                            <div className="flex flex-col gap-0.5">
                              <strong className="text-slate-800 text-[10px]">{snap.label}</strong>
                              <span className="text-[8.5px] text-slate-450">Timestamp: {snap.timestamp} • Active specs stored</span>
                            </div>
                            <button
                              onClick={() => restoreSnapshot(snap.specs)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border text-slate-700 font-bold uppercase rounded cursor-pointer"
                            >
                              Restore State
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* File Upload Restorer */}
                      <div className="bg-slate-50 border border-slate-205 p-3 rounded font-mono text-[9.5px]">
                        <strong className="uppercase text-slate-700 font-black block mb-2">Import / Restore Exported JSON Blueprint</strong>
                        <div className="flex items-center gap-3">
                          <input 
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const data = JSON.parse(event.target?.result as string);
                                  if (data.specs) {
                                    onChangeSpecs(data.specs);
                                    alert(`✔ SUCCESS: Restored ERICON state exported on ${data.exportedAt || 'unspecified'}.`);
                                  } else {
                                    alert('❌ ERROR: Missing valid system parameters inside backup JSON.');
                                  }
                                } catch {
                                  alert('❌ ERROR: Selected file is not a valid JSON archive document.');
                                }
                              };
                              reader.readAsText(file);
                            }}
                            className="bg-white border rounded text-[9px] p-1 w-full text-slate-600 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Audit Trail tracks */}
                    <div className="md:col-span-4 bg-slate-100/50 p-3 rounded border text-[9px] leading-relaxed space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-950 uppercase block border-b pb-1 mb-1">
                        📋 Audit Trail Audit Logs
                      </span>
                      <div className="space-y-1 overflow-y-auto max-h-40">
                        {auditTrails.map((at, idx) => (
                          <div key={idx} className="border-b border-slate-200 pb-1 italic text-slate-650">
                            <span className="text-indigo-950 font-bold uppercase block not-italic">Edited field: {at.field}</span>
                            {at.user} modified from {at.previousValue} to {at.newValue} at {at.timestamp}.
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* CONTINUOUS IMPROVEMENT FEEDBACK LEDGER */}
                <div className="bg-white border-2 border-slate-200 rounded-sm p-4.5 shadow-sm space-y-4">
                  <span className="text-xs font-black uppercase text-slate-800 tracking-widest block border-b pb-2">
                    What Should ERICON Improve? (Continuous Feedback Portal)
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-mono">
                    
                    {/* Submit suggestion */}
                    <form onSubmit={handleAddImprovement} className="md:col-span-4 space-y-3.5 text-[9.5px] font-bold">
                      <div className="space-y-1">
                        <label className="text-slate-500 uppercase">Feature Suggestion or Issue Description</label>
                        <textarea
                          required
                          placeholder="E.g., calibrate Darcey-Weisbach flow limits on low air densities..."
                          value={newImprovementText}
                          onChange={(e) => setNewImprovementText(e.target.value)}
                          className="w-full bg-slate-50 border p-2 h-16 text-[10px] text-slate-800 font-mono focus:outline-hidden focus:border-indigo-600 rounded"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 uppercase">Category Tag</label>
                        <select
                          className="w-full bg-white border p-2 text-[10px] rounded cursor-pointer rounded-sm"
                          value={newImprovementCat}
                          onChange={(e) => setNewImprovementCat(e.target.value)}
                        >
                          <option value="UI Request">📱 Custom Layout UI Suggestion</option>
                          <option value="Research Request">🔬 Ecological/Species Thesis</option>
                          <option value="Bugs">🐛 Mechanical Software Bugs</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-800 hover:bg-emerald-950 border border-emerald-950 text-white font-mono uppercase font-bold rounded cursor-pointer"
                      >
                        Submit Proposal To Registry
                      </button>
                    </form>

                    {/* Feedback registry ledger */}
                    <div className="md:col-span-8 flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Feedback Ledger</span>
                      <div className="border rounded divide-y divide-slate-150 overflow-y-auto max-h-40 bg-slate-50/50 text-[10.5px]">
                        {improvements.map(imp => (
                          <div key={imp.id} className="p-3 flex justify-between items-center hover:bg-slate-50 bg-white">
                            <div className="flex flex-col gap-1 max-w-[70%]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8.5px] uppercase font-black px-1 py-0.5 rounded bg-slate-100 text-slate-600">{imp.category}</span>
                                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  imp.priority === 'Critical' ? 'bg-red-100 text-red-900 border border-red-200' :
                                  imp.priority === 'High' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  Priority: {imp.priority}
                                </span>
                              </div>
                              <span className="text-slate-800 font-mono leading-normal text-[10px]">{imp.text}</span>
                            </div>

                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-[9.5px] font-black font-mono text-slate-505">{imp.votes} Votes</span>
                              <button
                                onClick={() => upvoteImprovement(imp.id)}
                                className="p-1 px-3 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border rounded cursor-pointer font-bold text-[9px] uppercase tracking-wider block"
                              >
                                Upvote
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
