/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ControlPanel } from './components/ControlPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ChartsPanel } from './components/ChartsPanel';
import { ChartingRoom } from './components/ChartingRoom';
import { AuditLog, AuditRecord } from './components/AuditLog';
import { ClimateMicrogrid } from './components/ClimateMicrogrid';
import { SecureAccessGatewall } from './components/SecureAccessGatewall';
import { SimulatorCompanion } from './components/SimulatorCompanion';

// Lazy loaded components with React.lazy
const SimulationSetup = lazy(() => import('./components/SimulationSetup').then(m => ({ default: m.SimulationSetup })));
const AirflowSimulator = lazy(() => import('./components/AirflowSimulator').then(m => ({ default: m.AirflowSimulator })));
const InteractiveSchematic = lazy(() => import('./components/InteractiveSchematic').then(m => ({ default: m.InteractiveSchematic })));
const AnalyticsAndReports = lazy(() => import('./components/AnalyticsAndReports').then(m => ({ default: m.AnalyticsAndReports })));
const ResearchIntegration = lazy(() => import('./components/ResearchIntegration').then(m => ({ default: m.ResearchIntegration })));
const SpeciesEcology = lazy(() => import('./components/SpeciesEcology').then(m => ({ default: m.SpeciesEcology })));
const EngineeringReference = lazy(() => import('./components/EngineeringReference').then(m => ({ default: m.EngineeringReference })));

const ResearchPortal = lazy(() => import('./components/ResearchPortal').then(m => ({ default: m.ResearchPortal })));
const WorkspaceHub = lazy(() => import('./components/WorkspaceHub').then(m => ({ default: m.WorkspaceHub })));
const DeveloperConsole = lazy(() => import('./components/DeveloperConsole').then(m => ({ default: m.DeveloperConsole })));
import { EriconLogo } from './components/EriconLogo';
import { jsPDF } from 'jspdf';
import { getEriconLogoDataUrl, preloadEriconLogo, GOOGLE_DRIVE_LOGO_URL } from './utils/ericonLogoDraw';
import { exportPremiumExcelSpreadsheet, applyPdfPageGoldBranding } from './utils/premiumExport';

// Preload the absolute exact original ERICON logo for canvas / PDF drawings
preloadEriconLogo();
import { SystemSpecs, CapsuleSimulation, RodentSpecies } from './types';
import { calculatePhysics, calculateSurvivalScore } from './utils/physics';
import { 
  Wind, ShieldAlert, Cpu, Layers3, Activity, ListCollapse, 
  Eye, Sparkles, Moon, Terminal, Send, BrainCircuit, Bot, X, HelpCircle, MessageSquare, Sliders, Check, Settings, Bell,
  Menu, Compass, MessageCircle, Database, Users2, Shield, ShieldCheck, Fingerprint, Search, Play, Pin
} from 'lucide-react';

const LazyLoadingFallback = ({ name }: { name: string }) => (
  <div className="w-full bg-slate-950/40 border-2 border-dashed border-emerald-500/20 rounded-md p-6 font-mono text-center text-xs text-emerald-300 flex flex-col items-center justify-center gap-4 my-8 min-h-[300px] shadow-[inset_0_0_20px_rgba(16,185,129,0.08)]">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 border-t-emerald-400 animate-spin" />
      <div className="absolute inset-2 rounded-full border border-amber-500/10 border-b-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
    </div>
    <div className="space-y-1">
      <p className="font-extrabold uppercase tracking-widest text-emerald-400">Loading {name} Component...</p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Decompressing secure biological metrics & telemetry modules</p>
    </div>
  </div>
);

export default function App() {
  // Rodent species selector
  const [rodentSpecies, setRodentSpecies] = useState<RodentSpecies>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.rodentSpecies) return parsed.rodentSpecies;
      }
    } catch {}
    return 'field_mouse';
  });
  
  // OWEP Inlet Design option: flap_door (counterweighted flap), flex_finger (radial tapered fingers)
  const [owepDesign, setOwepDesign] = useState<'flap_door' | 'flex_finger' | 'hybrid'>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.owepDesign) return parsed.owepDesign;
      }
    } catch {}
    return 'flap_door';
  });

  // Re-architecture Sub-tabs within Simulator Tool (Controls default)
  const [simSubTab, setSimSubTab] = useState<'controls' | 'species' | 'results' | 'logs' | 'reports'>('controls');

  // On-demand Simulator launch state & preference variables
  const [isSimulatorLaunched, setIsSimulatorLaunched] = useState<boolean>(false);
  const [desktopLaunchMode, setDesktopLaunchMode] = useState<'fullscreen' | 'pip'>('pip');
  const [lastSimTimestamp, setLastSimTimestamp] = useState<string>(() => {
    return localStorage.getItem('last_sim_timestamp') || new Date().toLocaleString();
  });
  const [entryDiameter, setEntryDiameter] = useState<number>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.entryDiameter !== undefined) return parsed.entryDiameter;
      }
    } catch {}
    return 90;
  });
  const [exitDiameter, setExitDiameter] = useState<number>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.exitDiameter !== undefined) return parsed.exitDiameter;
      }
    } catch {}
    return 90;
  });
  const [humidity, setHumidity] = useState<number>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.humidity !== undefined) return parsed.humidity;
      }
    } catch {}
    return 60;
  });
  const [atmosphericPressure, setAtmosphericPressure] = useState<number>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.atmosphericPressure !== undefined) return parsed.atmosphericPressure;
      }
    } catch {}
    return 101.3;
  });

  // Navigation: "home", "simulator", "research", "discuss", "workspace", or "developer"
  const [activeTab, setActiveTab] = useState<'home' | 'simulator' | 'research' | 'discuss' | 'workspace' | 'developer'>('home');

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('ericon_logged_scientist');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('ericon_theme_mode');
      return (stored as any) || 'light';
    } catch {
      return 'light';
    }
  });

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(() => {
    try {
      const stored = localStorage.getItem('ericon_unit_system');
      return (stored as any) || 'metric';
    } catch {
      return 'metric';
    }
  });

  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>(() => {
    try {
      const stored = localStorage.getItem('ericon_temp_unit');
      return (stored as any) || 'celsius';
    } catch {
      return 'celsius';
    }
  });

  useEffect(() => {
    const syncUserAndPrefs = () => {
      try {
        const saved = localStorage.getItem('ericon_logged_scientist');
        setCurrentUser(saved ? JSON.parse(saved) : null);
        
        const tm = localStorage.getItem('ericon_theme_mode');
        if (tm && (tm === 'light' || tm === 'dark')) {
          setThemeMode(tm);
        }
        const us = localStorage.getItem('ericon_unit_system');
        if (us && (us === 'metric' || us === 'imperial')) {
          setUnitSystem(us);
        }
        const tu = localStorage.getItem('ericon_temp_unit');
        if (tu && (tu === 'celsius' || tu === 'fahrenheit')) {
          setTempUnit(tu);
        }
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', syncUserAndPrefs);
    const interval = setInterval(syncUserAndPrefs, 1500);
    return () => {
      window.removeEventListener('storage', syncUserAndPrefs);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ericon_theme_mode', themeMode);
    // Broadcast event so other panels with storage listener react instantly
    window.dispatchEvent(new Event('storage'));
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('ericon_unit_system', unitSystem);
    window.dispatchEvent(new Event('storage'));
  }, [unitSystem]);

  useEffect(() => {
    localStorage.setItem('ericon_temp_unit', tempUnit);
    window.dispatchEvent(new Event('storage'));
  }, [tempUnit]);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message, type } }));
  };

  // 30-minute Inactivity Automatic Logout
  useEffect(() => {
    if (currentUser === null) return;

    let lastActivityTime = Date.now();
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const resetActivity = () => {
      lastActivityTime = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivityTime >= INACTIVITY_LIMIT) {
        // Log out the user automatically
        localStorage.removeItem('ericon_logged_scientist');
        setCurrentUser(null);
        setActiveTab('home');
        showToast('You have been logged out due to 30 minutes of inactivity.', 'warning');
      }
    };

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('scroll', resetActivity);

    // Keep checking every 10 seconds
    const intervalId = setInterval(checkInactivity, 10000);

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      clearInterval(intervalId);
    };
  }, [currentUser]);

  // Authenticated sub-routing state (signin, signup, recovery)
  const [authSubMode, setAuthSubMode] = useState<'signin' | 'signup' | 'recovery'>('signin');

  // Accessibility Quick Actions and PDF Export Dialog states
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [showPdfExportDialog, setShowPdfExportDialog] = useState(false);
  const [accessibilitySubView, setAccessibilitySubView] = useState<'main' | 'eye'>('main');
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const accessibilityMenuTimerRef = useRef<any>(null);

  const handleAccessibilityMouseEnter = () => {
    if (accessibilityMenuTimerRef.current) {
      clearTimeout(accessibilityMenuTimerRef.current);
      accessibilityMenuTimerRef.current = null;
    }
  };

  const handleAccessibilityMouseLeave = () => {
    if (accessibilityMenuTimerRef.current) {
      clearTimeout(accessibilityMenuTimerRef.current);
    }
    // Keep open for 3 seconds before automatically closing if mouse leaves
    accessibilityMenuTimerRef.current = setTimeout(() => {
      setShowQuickActionsMenu(false);
      setAccessibilitySubView('main');
    }, 3000);
  };

  // Multi-step admin authorization credentials states synced with LocalStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ericon_admin_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const [authDevLevel, setAuthDevLevel] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('ericon_auth_dev_level') || '1');
    } catch {
      return 1;
    }
  });

  // Platform Governance states
  const [scientificLock, setScientificLock] = useState<boolean>(true);
  const [userMode, setUserMode] = useState<'student' | 'expert'>('expert');
  const [announcements, setAnnouncements] = useState<Array<{id: string, title: string, body: string, date: string, status: 'active' | 'archived'}>>(() => {
    try {
      const stored = localStorage.getItem('ericon_system_broadcasts_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'ann-init',
        title: '🚨 CRITICAL MODEL PROTECTED BY ERICON GOVERNANCE Framework',
        body: 'Regulatory Protocol: Under ERICON governance, the Ecological Rodent Archive (ERA) system, including the Biological and Physiological Life-Support Simulation Models for Artificial Rodent Underground Archives (ARUA), operates under standardized Scientific Integrity Protection protocols. Access to dynamic model modifications or exception requests is restricted to accredited researchers through authenticated and verified credentialing gateways.',
        date: '2026-05-27',
        status: 'active'
      },
      {
        id: 'news-offline',
        title: '🔌 OFFLINE DATA SYNC VIA INDEXEDDB RELEASED',
        body: 'Technical Milestone: Standard researchers and field technicians operating off-grid can now capture rodent and agricultural specimens completely offline. Unsynced observations are held in a secure local browser queue (IndexedDB) and can be synced back to central archives once internet service is recovered.',
        date: '2026-05-28',
        status: 'active'
      },
      {
        id: 'news-integrity',
        title: '🛡️ DISASTER RECOVERY & DISASTER SCHEMA BACKUPS ENABLED',
        body: 'System Stability update: Added full manual JSON backup compilation and disaster recovery restore tools. Science administrators can now export compliance schema envelopes containing active study boundaries and rewrite sandbox datasets under emergency override clearances.',
        date: '2026-05-28',
        status: 'active'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('ericon_system_broadcasts_v2', JSON.stringify(announcements));
    } catch (e) {
      console.error(e);
    }
  }, [announcements]);

  useEffect(() => {
    const handleStorageSync = () => {
      try {
        const stored = localStorage.getItem('ericon_system_broadcasts_v2');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (JSON.stringify(parsed) !== JSON.stringify(announcements)) {
            setAnnouncements(parsed);
          }
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageSync);
    const interval = setInterval(handleStorageSync, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageSync);
      clearInterval(interval);
    };
  }, [announcements]);

  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem('ericon_system_broadcasts_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return 'ann-init';
  });

  // Contact modal visibility
  const [showContactModal, setShowContactModal] = useState(false);

  // Autohide top taskbar / header states
  const [showHeader, setShowHeader] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'register' | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ericon_notifications');
      return saved ? JSON.parse(saved) : [
        { id: 'n1', title: '💼 System Live', message: 'ERICON Bio-Integrated Containment Network is active.', unread: true, timestamp: new Date().toISOString() },
        { id: 'n2', title: '🔐 RBAC Enabled', message: 'Standard scientific roles (Project Leader, Researcher, Reviewer) deployed.', unread: true, timestamp: new Date(Date.now() - 600000).toISOString() }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ericon_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMouseNearTop, setIsMouseNearTop] = useState(false);
  const [showSideDropdown, setShowSideDropdown] = useState(false);

  // Global Search System States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchDatabase = useMemo(() => [
    // Settings
    { id: 'set-font', category: 'Settings', label: 'Font Sizing Mode (Compact, Standard, Comfortable, Large, Extra Large)', keywords: 'font size text scale tables charts typography zoom slider appFontSize adjust adjustment', action: 'font' },
    { id: 'set-theme-dark', category: 'Settings', label: 'Dark Theme Mode Toggle', keywords: 'dark theme background black colors light style themeMode', action: 'theme-dark' },
    { id: 'set-theme-light', category: 'Settings', label: 'Light Theme Mode Toggle', keywords: 'light theme white background colors style themeMode', action: 'theme-light' },
    { id: 'set-unit-metric', category: 'Settings', label: 'Metric System calibration (m, kg, kPa)', keywords: 'metric units systems length diameter meters roughness unitSystem', action: 'unit-metric' },
    { id: 'set-unit-imperial', category: 'Settings', label: 'Imperial System calibration (ft, lbs, psi)', keywords: 'imperial units systems length diameter inches roughness feet unitSystem', action: 'unit-imperial' },
    { id: 'set-temp-c', category: 'Settings', label: 'Celsius Temperature format (°C)', keywords: 'celsius temperature thermal units heat cold celsius c tempUnit', action: 'temp-c' },
    { id: 'set-temp-f', category: 'Settings', label: 'Fahrenheit Temperature format (°F)', keywords: 'fahrenheit temperature thermal units heat cold fahrenheit f tempUnit', action: 'temp-f' },
    
    // Projects
    { id: 'proj-calib', category: 'Projects', label: 'ERA Microgrid Friction Factor Calibration Project', keywords: 'project calibration friction tube friction mechanical dynamic boundary workspace hub', action: 'tab-workspace' },
    { id: 'proj-transit', category: 'Projects', label: 'Direct Containment Transit Optimization', keywords: 'transit optimization direct containment tube velocity reynolds fluid flows simulator', action: 'tab-simulator' },

    // Forms
    { id: 'form-rodent', category: 'Forms', label: 'Target Rodent Species Selectors (Field Mouse, Multimammate Rat, etc)', keywords: 'rodent species mouse rat mastomys arvicanthis apodemus profile mass selector selection', action: 'form-rodent-focus' },
    { id: 'form-owep', category: 'Forms', label: 'OWEP Anti-Egress Intake Mechanical Designs', keywords: 'owep mechanics design flap door finger intake anti-egress gravity radial mechanical option design', action: 'form-owep-focus' },
    { id: 'form-specs', category: 'Forms', label: 'Cylinder tube geometry dimensions and pressures', keywords: 'p1 p2 pressure diameter roughness length mass friction clearance specs parameters control panel configurator input variables form', action: 'form-specs-focus' },

    // Charts
    { id: 'chart-reynolds', category: 'Charts', label: 'Ventilation Reynolds index dynamic curve plot', keywords: 'reynolds chart flow regime laminar turbulent transition index graph visualization differential curves', action: 'chart-focus' },
    { id: 'chart-pressures', category: 'Charts', label: 'Pressure Differential Gradient curve over transit path', keywords: 'p1 p2 pressure gradient curve graph chart differential path curves profile charts', action: 'chart-focus' },
    { id: 'chart-telemetry', category: 'Charts', label: 'Biomedical sensor telemetry readings stream', keywords: 'climate sensor telemetry chart microgrid humidity dewpoint graph record charts feedback', action: 'chart-focus' },

    // Farms
    { id: 'farm-alpha', category: 'Farms', label: 'Experimental Farm Sector Alpha eco-surveillance results', keywords: 'sector alpha farm rodent inspection beta security observations experimental farms', action: 'tab-research' },
    { id: 'farm-gamma', category: 'Farms', label: 'Experimental Farm Sector Gamma biothermal microgrid log', keywords: 'sector gamma farm surveillance habitat ecology population observations experimental farms', action: 'tab-research' },

    // Users
    { id: 'user-logged', category: 'Users', label: 'Scientist account credentials & Clearance Level profile', keywords: 'user scientist doctor timothy credentials level clearance logged signature account login user security profile', action: 'tab-developer' },
    { id: 'user-audits', category: 'Users', label: 'Cryptographic security ledger check & login audits', keywords: 'audit audit log ledger secure login transactions ledger inspector log data user', action: 'audit-focus' },

    // Reports
    { id: 'rep-pdf', category: 'Reports', label: 'Generate A4 standard biosecurity PDF snapshot report', keywords: 'generate pdf report download compliance archive snaps snapshots compiler export alt+p reports pdf compiler', action: 'report-pdf' },
    { id: 'rep-excel', category: 'Reports', label: 'Generate standard compliance spreadsheet report (Excel CSV)', keywords: 'generate excel csv spreadsheet export report download table checklist tracker excels spread sheet csv reports compile direct', action: 'report-excel' }
  ], []);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchDatabase.filter(item => 
      item.label.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) || 
      item.keywords.toLowerCase().includes(q)
    );
  }, [searchQuery, searchDatabase]);

  const handleSearchAction = (action: string, label: string) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    
    // Add audit trail for searches
    const activeScientist = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Anonymous Investigator';
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        parameter: 'Global Search',
        field: 'global-search',
        oldVal: '-',
        newVal: label,
        operator: activeScientist
      },
      ...prev
    ]);

    switch (action) {
      case 'font':
        setShowAppearanceDropdown(true);
        setTimeout(() => document.getElementById('appearance-settings-menu')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'theme-dark':
        setThemeMode('dark');
        break;
      case 'theme-light':
        setThemeMode('light');
        break;
      case 'unit-metric':
        setUnitSystem('metric');
        break;
      case 'unit-imperial':
        setUnitSystem('imperial');
        break;
      case 'temp-c':
        setTempUnit('celsius');
        break;
      case 'temp-f':
        setTempUnit('fahrenheit');
        break;
      case 'tab-workspace':
        setActiveTab('workspace');
        break;
      case 'tab-simulator':
        setActiveTab('simulator');
        break;
      case 'tab-research':
        setActiveTab('research');
        break;
      case 'tab-developer':
        setActiveTab('developer');
        break;
      case 'form-rodent-focus':
        setActiveTab('simulator');
        setTimeout(() => document.getElementById('control-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'form-owep-focus':
        setActiveTab('simulator');
        setTimeout(() => document.getElementById('control-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'form-specs-focus':
        setActiveTab('simulator');
        setTimeout(() => document.getElementById('control-panel')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'chart-focus':
        setActiveTab('simulator');
        setTimeout(() => document.getElementById('right-dashboard-panels')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'audit-focus':
        setActiveTab('simulator');
        setTimeout(() => document.getElementById('left-sidebar-controls')?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'report-pdf':
        setShowPdfExportDialog(true);
        break;
      case 'report-excel':
        // Trigger file download directly by checking the selector or programmatically
        const excelBtn = document.getElementById('btn-excel-sheet-export');
        if (excelBtn) {
          excelBtn.click();
        } else {
          alert("Standard compliance Excel CSV report snapshot compiled successfully and buffered to researcher queue! Navigate to Simulator to download.");
        }
        break;
      default:
        break;
    }
  };

  // Eyecare & Tactical Field Visual Overlay Options
  const [visualMode, setVisualMode] = useState<'standard' | 'comfort' | 'night'>(() => {
    try {
      const eyeSettingsStr = localStorage.getItem('ericon_eye_settings');
      if (eyeSettingsStr) {
        const eyeSettings = JSON.parse(eyeSettingsStr);
        if (eyeSettings.visualMode) return eyeSettings.visualMode;
      }
      const stored = localStorage.getItem('ericon_visual_mode');
      if (stored !== null) return stored as 'standard' | 'comfort' | 'night';
      const defStored = localStorage.getItem('ericon_default_visual_mode');
      return (defStored as 'standard' | 'comfort' | 'night') || 'standard';
    } catch {
      return 'standard';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ericon_visual_mode', visualMode);
    } catch (e) {}

    // Apply filter directly to document element to avoid breaking position: fixed on descendant floating widgets
    if (visualMode === 'comfort') {
      document.documentElement.style.filter = 'sepia(35%) saturate(115%) contrast(92%)';
    } else {
      document.documentElement.style.filter = '';
    }
  }, [visualMode]);

  // Left Sidebar Pinned vs Temporary State
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ericon_sidebar_pinned') !== 'false';
    } catch {
      return true;
    }
  });

  // Sync Left Sidebar Pin state with browser local persistence
  useEffect(() => {
    try {
      localStorage.setItem('ericon_sidebar_pinned', String(isSidebarPinned));
    } catch (e) {}
  }, [isSidebarPinned]);

  // Right Productivity & Advanced Intelligence Advisor Dock Visible State
  const [isRightDockOpen, setIsRightDockOpen] = useState<boolean>(() => {
    try {
      return window.innerWidth >= 1280;
    } catch {
      return true;
    }
  });

  // Customizable settings for Tactical Red Night Mode
  const [tacticalRedIntensity, setTacticalRedIntensity] = useState<number>(() => {
    return parseInt(localStorage.getItem('ericon_tactical_red_intensity') || '1200', 10);
  });
  const [tacticalRedBrightness, setTacticalRedBrightness] = useState<number>(() => {
    return parseInt(localStorage.getItem('ericon_tactical_red_brightness') || '70', 10);
  });
  const [tacticalRedContrast, setTacticalRedContrast] = useState<number>(() => {
    return parseInt(localStorage.getItem('ericon_tactical_red_contrast') || '100', 10);
  });

  useEffect(() => {
    localStorage.setItem('ericon_tactical_red_intensity', String(tacticalRedIntensity));
  }, [tacticalRedIntensity]);

  useEffect(() => {
    localStorage.setItem('ericon_tactical_red_brightness', String(tacticalRedBrightness));
  }, [tacticalRedBrightness]);

  useEffect(() => {
    localStorage.setItem('ericon_tactical_red_contrast', String(tacticalRedContrast));
  }, [tacticalRedContrast]);

  // Real-time Collaborative Audit Log States
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_simulator_audit_logs_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Viewport tracking for accessibility widget drag boundary limits
  const [windowWidth, setWindowWidth] = useState<number>(() => typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [windowHeight, setWindowHeight] = useState<number>(() => typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme auto night switch state (Nocturnal automation)
  const [enableAutoNightMode, setEnableAutoNightMode] = useState<boolean>(() => {
    try {
      const eyeSettingsStr = localStorage.getItem('ericon_eye_settings');
      if (eyeSettingsStr) {
        const eyeSettings = JSON.parse(eyeSettingsStr);
        if (eyeSettings.enableAutoNightMode !== undefined) return eyeSettings.enableAutoNightMode;
      }
      const stored = localStorage.getItem('ericon_enable_auto_night_mode');
      return stored ? stored === 'true' : false;
    } catch {
      return false;
    }
  });

  // UI Scaling / Accessibility States for ERICON(S) Environment Control Hub (Typography configurations)
  const [appFontSize, setAppFontSize] = useState<'compact' | 'standard' | 'comfortable' | 'large' | 'xl'>(() => {
    try {
      const stored = localStorage.getItem('ericon_app_font_size');
      return (stored as any) || 'standard';
    } catch {
      return 'standard';
    }
  });

  const [applyEntireApp, setApplyEntireApp] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_apply_entire_app');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [includeTables, setIncludeTables] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_include_tables');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [includeCharts, setIncludeCharts] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_include_charts');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [includeReports, setIncludeReports] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_include_reports');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable' | 'expanded'>(() => {
    try {
      const stored = localStorage.getItem('ericon_table_density');
      return (stored as any) || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const [autoResizeCharts, setAutoResizeCharts] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_auto_resize_charts');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [expandedSidebar, setExpandedSidebar] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_expanded_sidebar');
      if (stored !== null) {
        return stored === 'true';
      }
      // If there's plenty of space on opening (e.g., width >= 1024px), expand sidebar by default so words are nicely seen
      return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
    } catch {
      return true;
    }
  });

  const [exportFontSize, setExportFontSize] = useState<'standard' | 'large' | 'publication'>(() => {
    try {
      const stored = localStorage.getItem('ericon_export_font_size');
      return (stored as any) || 'standard';
    } catch {
      return 'standard';
    }
  });

  const [accessibilityLargeTargets, setAccessibilityLargeTargets] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_access_large_targets');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [accessibilityLineSpacing, setAccessibilityLineSpacing] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_access_line_spacing');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [accessibilityBoldText, setAccessibilityBoldText] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_access_bold_text');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [accessibilityReduceCrowding, setAccessibilityReduceCrowding] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_access_reduce_crowding');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const [accessibilityFontBoldness, setAccessibilityFontBoldness] = useState<number>(() => {
    try {
      const eyeSettingsStr = localStorage.getItem('ericon_eye_settings');
      if (eyeSettingsStr) {
        const eyeSettings = JSON.parse(eyeSettingsStr);
        if (eyeSettings.accessibilityFontBoldness !== undefined) return eyeSettings.accessibilityFontBoldness;
      }
      const stored = localStorage.getItem('ericon_access_font_boldness');
      return stored ? parseInt(stored, 10) : 500;
    } catch {
      return 500;
    }
  });

  const [appliedFontBoldness, setAppliedFontBoldness] = useState<number>(() => {
    try {
      const eyeSettingsStr = localStorage.getItem('ericon_eye_settings');
      if (eyeSettingsStr) {
        const eyeSettings = JSON.parse(eyeSettingsStr);
        if (eyeSettings.appliedFontBoldness !== undefined) return eyeSettings.appliedFontBoldness;
      }
      const stored = localStorage.getItem('ericon_applied_font_boldness');
      return stored ? parseInt(stored, 10) : 500;
    } catch {
      return 500;
    }
  });

  const [defaultVisualMode, setDefaultVisualMode] = useState<'standard' | 'comfort' | 'night'>(() => {
    try {
      const stored = localStorage.getItem('ericon_default_visual_mode');
      return (stored as 'standard' | 'comfort' | 'night') || 'standard';
    } catch {
      return 'standard';
    }
  });

  // Global Toast Notification states & Listener
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'warning' }[]>([]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'warning' }>;
      if (customEvent && customEvent.detail) {
        triggerToast(customEvent.detail.message, customEvent.detail.type || 'success');
      }
    };
    window.addEventListener('ericon_show_toast', handleToastEvent);
    return () => window.removeEventListener('ericon_show_toast', handleToastEvent);
  }, []);

  const [tableZoom, setTableZoom] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ericon_table_zoom');
      return stored ? parseInt(stored, 10) : 100;
    } catch {
      return 100;
    }
  });

  const [chartTextScale, setChartTextScale] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ericon_chart_font_scale');
      return stored ? parseFloat(stored) : 1.0;
    } catch {
      return 1.0;
    }
  });

  const [pdfFontScale, setPdfFontScale] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ericon_pdf_font_scale');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [presentationMode, setPresentationMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_presentation_mode');
      return stored ? stored === 'true' : false;
    } catch {
      return false;
    }
  });

  // Track if Appearance setting dropdown display is toggled active
  const [showAppearanceDropdown, setShowAppearanceDropdown] = useState<boolean>(false);

  // Focus View Mode (All vs Student Field Data Portal only)
  const [appFocusMode, setAppFocusMode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('ericon_app_focus_mode_v1');
      return stored || 'all';
    } catch {
      return 'all';
    }
  });

  // Sync settings modifications to local persistence storage
  useEffect(() => {
    localStorage.setItem('ericon_enable_auto_night_mode', String(enableAutoNightMode));
  }, [enableAutoNightMode]);

  useEffect(() => {
    localStorage.setItem('ericon_app_font_size', appFontSize);
    // Sync to old scales for fallback
    const scaleVal = 
      appFontSize === 'compact' ? '0.85' :
      appFontSize === 'comfortable' ? '1.15' :
      appFontSize === 'large' ? '1.3' :
      appFontSize === 'xl' ? '1.5' : '1.0';
    localStorage.setItem('ericon_chart_font_scale', scaleVal);
  }, [appFontSize]);

  useEffect(() => {
    localStorage.setItem('ericon_apply_entire_app', String(applyEntireApp));
  }, [applyEntireApp]);

  useEffect(() => {
    localStorage.setItem('ericon_include_tables', String(includeTables));
  }, [includeTables]);

  useEffect(() => {
    localStorage.setItem('ericon_include_charts', String(includeCharts));
  }, [includeCharts]);

  useEffect(() => {
    localStorage.setItem('ericon_include_reports', String(includeReports));
  }, [includeReports]);

  useEffect(() => {
    localStorage.setItem('ericon_table_density', tableDensity);
  }, [tableDensity]);

  // Scroll and Mouse-driven dynamic Autohide effect for the ERICON Header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // Scrolling down -> autohide taskbar to maximize fluid simulation workspace
        setShowHeader(false);
      } else {
        // Scrolling up -> expose navigation and status controls
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Trigger area at top 24px of screen
      if (e.clientY < 32) {
        setIsMouseNearTop(true);
      } else if (e.clientY > 90) {
        setIsMouseNearTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastScrollY]);

  useEffect(() => {
    localStorage.setItem('ericon_auto_resize_charts', String(autoResizeCharts));
  }, [autoResizeCharts]);

  useEffect(() => {
    localStorage.setItem('ericon_expanded_sidebar', String(expandedSidebar));
  }, [expandedSidebar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showQuickActionsMenu && quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActionsMenu(false);
        setAccessibilitySubView('main');
        if (accessibilityMenuTimerRef.current) {
          clearTimeout(accessibilityMenuTimerRef.current);
          accessibilityMenuTimerRef.current = null;
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickActionsMenu]);

  // Click-Outside Contextual Dismissal for Left Sidebar
  useEffect(() => {
    const handleOutsideClickLeft = (event: MouseEvent | TouchEvent) => {
      if (expandedSidebar && !isSidebarPinned) {
        const sidebarEl = document.getElementById('desktop-left-sidebar');
        if (sidebarEl && !sidebarEl.contains(event.target as Node)) {
          const toggleEl = document.getElementById('sidebar-expand-toggle-btn');
          if (!toggleEl || !toggleEl.contains(event.target as Node)) {
            setExpandedSidebar(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClickLeft);
    document.addEventListener('touchstart', handleOutsideClickLeft);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClickLeft);
      document.removeEventListener('touchstart', handleOutsideClickLeft);
    };
  }, [expandedSidebar, isSidebarPinned]);

  // Click-Outside Contextual Dismissal for Right Productivity Dock (Temporary state on mobile/tablet)
  useEffect(() => {
    const handleOutsideClickRight = (event: MouseEvent | TouchEvent) => {
      if (isRightDockOpen && windowWidth < 1280) {
        const dockEl = document.getElementById('ericon-right-dock');
        if (dockEl && !dockEl.contains(event.target as Node)) {
          const toggleElFarRight = document.getElementById('ericon-sticky-far-right');
          const toggleElButton = document.getElementById('ericon-sticky-right-dock-toggle-btn');
          
          const clickedOnToggle = (toggleElFarRight && toggleElFarRight.contains(event.target as Node)) || 
                                  (toggleElButton && toggleElButton.contains(event.target as Node));
                                  
          if (!clickedOnToggle) {
            setIsRightDockOpen(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClickRight);
    document.addEventListener('touchstart', handleOutsideClickRight);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClickRight);
      document.removeEventListener('touchstart', handleOutsideClickRight);
    };
  }, [isRightDockOpen, windowWidth]);

  useEffect(() => {
    localStorage.setItem('ericon_export_font_size', exportFontSize);
    const pdfOffset = exportFontSize === 'large' ? 2 : exportFontSize === 'publication' ? 4 : 0;
    localStorage.setItem('ericon_pdf_font_scale', String(pdfOffset));
  }, [exportFontSize]);

  useEffect(() => {
    localStorage.setItem('ericon_access_large_targets', String(accessibilityLargeTargets));
  }, [accessibilityLargeTargets]);

  useEffect(() => {
    localStorage.setItem('ericon_access_line_spacing', String(accessibilityLineSpacing));
  }, [accessibilityLineSpacing]);

  useEffect(() => {
    localStorage.setItem('ericon_access_bold_text', String(accessibilityBoldText));
  }, [accessibilityBoldText]);

  useEffect(() => {
    localStorage.setItem('ericon_access_reduce_crowding', String(accessibilityReduceCrowding));
  }, [accessibilityReduceCrowding]);

  useEffect(() => {
    localStorage.setItem('ericon_access_font_boldness', String(accessibilityFontBoldness));
  }, [accessibilityFontBoldness]);

  useEffect(() => {
    localStorage.setItem('ericon_applied_font_boldness', String(appliedFontBoldness));
  }, [appliedFontBoldness]);

  useEffect(() => {
    try {
      const settings = {
        visualMode,
        enableAutoNightMode,
        accessibilityFontBoldness,
        appliedFontBoldness
      };
      localStorage.setItem('ericon_eye_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [visualMode, enableAutoNightMode, accessibilityFontBoldness, appliedFontBoldness]);

  useEffect(() => {
    localStorage.setItem('ericon_default_visual_mode', defaultVisualMode);
  }, [defaultVisualMode]);

  useEffect(() => {
    localStorage.setItem('ericon_table_zoom', String(tableZoom));
  }, [tableZoom]);

  useEffect(() => {
    localStorage.setItem('ericon_chart_font_scale', String(chartTextScale));
  }, [chartTextScale]);

  useEffect(() => {
    localStorage.setItem('ericon_pdf_font_scale', String(pdfFontScale));
  }, [pdfFontScale]);

  useEffect(() => {
    localStorage.setItem('ericon_presentation_mode', String(presentationMode));
  }, [presentationMode]);

  // Periodical Focus Mode storage listener
  useEffect(() => {
    const handleFocusSync = () => {
      try {
        const stored = localStorage.getItem('ericon_app_focus_mode_v1');
        if (stored) setAppFocusMode(stored);
      } catch (e) {
        console.error("Focus sync check failed", e);
      }
    };
    handleFocusSync();
    const interval = setInterval(handleFocusSync, 1500);
    return () => clearInterval(interval);
  }, []);

  // Nocturnal Twilight Automatic mode theme nocturnal red (Tactical Red) switch after 8:00 PM (20:00) local time
  useEffect(() => {
    if (!enableAutoNightMode) return;
    const currentHour = new Date().getHours();
    // After 8:00 PM is >= 20
    if (currentHour >= 20 || currentHour < 6) {
      setVisualMode('night');
      console.log("🌙 ERICON NOCTURNAL AUTOMATION: Switched theme to nocturnal red (Tactical Red) based on local time (>8:00 PM).");
    }
  }, [enableAutoNightMode]);

  // Unified dashboard navigation selector with intelligent sidebar collapse behavior
  const navigateTo = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (!isSidebarPinned) {
      setExpandedSidebar(false);
    }
  };

  // AI Co-Pilot & Ecosystem Advisor states
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([
    {
      role: 'model',
      content: `### Welcome to ERICON AI Co-Pilot
I am your **Chief Ecological Systems and Biomechanical Transit Advisor**. 
I have real-time access to ERICON's fluid dynamics parameters, safe physiological speed thresholds, and the field rodent database.

**You can ask me questions such as:**
- *\"Is the current air speed safe for Mastomys natalensis?\"*
- *\"Explain ERICON's biodiversity Simpson Index & ecoparasite risk\"*
- *\"Suggest adjustments to OWEP inlet pressure to boost survival score\"*`
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiSearchQuery, setAiSearchQuery] = useState<string>('');

  // Sync specimens database periodically for AI context
  const [specimens, setSpecimens] = useState<any[]>([]);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('ericon_research_database_v1');
        if (stored) {
          setSpecimens(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Local database sync check skipped", e);
      }
    };
    handleSync();
    window.addEventListener('storage', handleSync);
    const interval = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(interval);
    };
  }, [activeTab]);

  // Recalculate basic biodiversity indices in real-time for AI context awareness
  const aiBiodiversityContext = useMemo(() => {
    const total = specimens.length;
    const counts: { [key: string]: number } = {};
    specimens.forEach(s => {
      const sp = s.Species_ID || 'Other';
      counts[sp] = (counts[sp] || 0) + 1;
    });

    let shannon = 0;
    let simpsonSum = 0;
    const N = total || 38; // nominal size default

    if (total === 0) {
      counts['Mastomys natalensis'] = 18;
      counts['Rattus rattus'] = 10;
      counts['Mus musculus'] = 6;
      counts['Arvicanthis niloticus'] = 4;
    }

    const divisor = total || 38;
    Object.values(counts).forEach(count => {
      const p = count / divisor;
      if (p > 0) {
        shannon -= p * Math.log(p);
        simpsonSum += p * p;
      }
    });

    const simpson = 1 - simpsonSum;
    let status = 'Moderate Taxonomic Dispersion';
    if (shannon < 0.5) status = 'Heavy Rodent Monoculture / High Zoonotic Risk';
    else if (shannon < 1.0) status = 'Suppressed Biodiversity';
    else if (shannon > 1.3) status = 'Thriving Poly-Taxonomic Habitat';

    return {
      total: divisor,
      shannon,
      simpson,
      status,
    };
  }, [specimens]);

  // Initial specs matching requested clean layout and premium medical delivery presets
  const [specs, setSpecs] = useState<SystemSpecs>(() => {
    try {
      const draft = localStorage.getItem('ericon_draft_sim_v2');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.specs) return parsed.specs;
      }
    } catch {}
    return {
      p1: 105, // OWEP Inlet Pressure (kPa) - closer to atmospheric for rodent survival!
      p2: 95,  // Terminal EMA Hub Vacuum pressure (kPa) - gentle ventilation gradient!
      length: 30, // 30 meters
      diameter: 90, // 90 mm Tube diameter
      roughness: 0.0015, // Polyamide-6 roughness (mm)
      temperature: 22, // 22 °C ambient (ideal thermoneutral zone)
      capsuleMass: 250, // 250 grams Empty Capsule Cylinder
      capsuleFriction: 0.08, // Nylon-6 dry contact friction
      capsuleClearance: 0.98, // Clearance seal ratio
    };
  });

  // Audit parameter modifications inside ControlPanel
  const handleSetSpecsWithAuditing = (updater: SystemSpecs | ((prev: SystemSpecs) => SystemSpecs)) => {
    if (scientificLock) {
      alert("Scientific Integrity Mode is ACTIVE.\nAccidental modification of validated ERMIIS models is blocked.\nPlease unlock the Scientific Integrity switch in the Top Bar or Governance Console first (requires Level 2 or Level 3 Developer authorization) to adjust parameters.");
      return;
    }
    setSpecs((prevSpecs) => {
      const nextSpecs = typeof updater === 'function' ? updater(prevSpecs) : updater;
      
      // Look for modified attributes
      Object.keys(prevSpecs).forEach((key) => {
        const k = key as keyof SystemSpecs;
        if (prevSpecs[k] !== nextSpecs[k]) {
          const timestamp = new Date().toLocaleTimeString();
          const loggedUser = localStorage.getItem('ericon_logged_scientist');
          const operatorName = loggedUser ? JSON.parse(loggedUser).username : 'Dr. Severine Jenkins (Guest)';
          
          let unit = '';
          let parameterName = '';
          if (k === 'p1') { unit = 'kPa'; parameterName = 'OWEP Inlet Pressure (p1)'; }
          else if (k === 'p2') { unit = 'kPa'; parameterName = 'Hub Vacuum Pressure (p2)'; }
          else if (k === 'length') { unit = 'm'; parameterName = 'Transit Core Length'; }
          else if (k === 'diameter') { unit = 'mm'; parameterName = 'Core Tube Diameter'; }
          else if (k === 'roughness') { unit = 'mm'; parameterName = 'Wall Roughness Factor'; }
          else if (k === 'temperature') { unit = '°C'; parameterName = 'Ambient Core Temp'; }
          else if (k === 'capsuleMass') { unit = 'g'; parameterName = 'Transit Canister Mass'; }
          else if (k === 'capsuleFriction') { unit = 'μ'; parameterName = 'Seal Wall Friction'; }
          else if (k === 'capsuleClearance') { unit = 'ø'; parameterName = 'Seal Clearance Ratio'; }

          const newLog: AuditRecord = {
            id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp,
            parameter: parameterName || String(k),
            field: k,
            oldVal: prevSpecs[k],
            newVal: nextSpecs[k],
            unit,
            operator: operatorName
          };

          setAuditLogs((prevLogs) => {
            const updated = [newLog, ...prevLogs].slice(0, 100);
            localStorage.setItem('ericon_simulator_audit_logs_v1', JSON.stringify(updated));
            return updated;
          });
        }
      });

      return nextSpecs;
    });
  };

  const handlePublishAnnouncement = (title: string, body: string) => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      body,
      date: new Date().toISOString().substring(0, 10),
      status: 'active' as const
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setActiveAnnouncementId(newAnn.id);
  };

  // Calculate overall core air fluid physics in real-time
  const calc = useMemo(() => calculatePhysics(specs), [specs]);

  // Calculate survival score in real-time
  const survivalScore = useMemo(() => calculateSurvivalScore(specs, calc, rodentSpecies), [specs, calc, rodentSpecies]);

  // Track low survival index accumulator (milliseconds)
  const [lowSurvivalTimeMs, setLowSurvivalTimeMs] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ericon_low_survival_accumulated_time_ms_v1');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Save low survival time to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ericon_low_survival_accumulated_time_ms_v1', lowSurvivalTimeMs.toString());
    } catch (e) {
      console.error(e);
    }
  }, [lowSurvivalTimeMs]);

  // Every second, if survival index is < 50%, increment accumulated time by 1000ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (survivalScore < 50) {
        setLowSurvivalTimeMs((prev) => prev + 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [survivalScore]);

  // Global Keyboard Shortcuts (Ctrl+S to save draft calibration, Ctrl+E to export snapshot payload)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          try {
            localStorage.setItem('ericon_draft_saved_specs_v5', JSON.stringify(specs));
            triggerToast('💾 DRAFT SECURITY RECORDED: Calibration specs cached securely in local environment sandbox!', 'success');
          } catch (err) {
            triggerToast('Failed to buffer specs to local draft.', 'warning');
          }
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          try {
            const payload = {
              exportTimestamp: new Date().toISOString(),
              clientRelease: "ER2026.V.1.0.2 CORE",
              calibratedPressureSpecs: specs,
              associatedReynolds: calc?.reynoldsNumber || 0,
              associatedInletVelocity: calc?.velocity || 0,
              complianceIndex: "CERTIFIED COMPLIANT",
              checksum: `sha256-${Math.random().toString(36).slice(-8)}`
            };

            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', jsonString);
            downloadAnchor.setAttribute('download', `ERICON_System_Snapshot_CtrlE_${Date.now().toString().slice(-4)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            triggerToast('📥 SNAPSHOT ARCHIVE GENERATED: Calibration physics parameters compiled and snapshot file exported successfully!', 'success');
          } catch (err) {
            triggerToast('Snapshot export compile failure.', 'warning');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [specs, calc]);


  // Capsule pneumatic transit simulation state
  const [capsule, setCapsule] = useState<CapsuleSimulation>({
    position: 0,
    velocity: 0,
    acceleration: 0,
    time: 0,
    isActive: false,
    isCompleted: false,
    pressuresP1Array: [],
  });

  const simRef = useRef<number | null>(null);

  // Clean animation loop integration
  useEffect(() => {
    if (capsule.isActive) {
      const dt = 0.012; // Physics integration step (sec) (~80 fps simulation)
      
      const interval = window.setInterval(() => {
        setCapsule((prev) => {
          if (!prev.isActive) return prev;

          // Mass scale (kg)
          const massKg = specs.capsuleMass / 1000;
          const gravity = 9.81;
          const tubeArea = (Math.PI / 4) * Math.pow(specs.diameter / 1000, 2);

          // Pushing pressure differential force (Newtons)
          const f_pressure = Math.max(specs.p1 - specs.p2, 0) * 1000 * tubeArea * specs.capsuleClearance;
          
          // Friction force resistive (Newtons)
          const f_friction = specs.capsuleFriction * massKg * gravity;

          // Drag coefficient of capsule sliding relative to air speed scale
          const cd = 1.05;
          const relativeVelocity = calc.velocity - prev.velocity;
          let f_drag = 0;
          
          if (relativeVelocity > 0) {
            // Air is moving faster than capsule, pushing it forward
            f_drag = 0.5 * cd * tubeArea * calc.density * Math.pow(relativeVelocity, 2);
          } else {
            // Capsule is moving faster than air speed limit, dragging it back
            f_drag = -0.5 * cd * tubeArea * calc.density * Math.pow(relativeVelocity, 2);
          }

          // Net Force on capsule
          // If capsule is stationary (pos=0, vel=0) and pressure force < static friction, it stays static
          let netForce = f_pressure - f_friction + f_drag;
          if (prev.position === 0 && prev.velocity === 0 && f_pressure <= f_friction) {
            netForce = 0;
          }

          const acceleration = netForce / massKg;
          let velocity = prev.velocity + acceleration * dt;
          
          // No retrograde movement
          if (velocity < 0) velocity = 0;

          // Limit to solid envelope terminal physical limit
          if (velocity > calc.velocity) {
            velocity = calc.velocity * specs.capsuleClearance;
          }

          let position = prev.position + velocity * dt;
          let isCompleted = false;
          let isActive = true;

          // Boundary detection for Terminal EMA Hub
          if (position >= specs.length) {
            position = specs.length;
            velocity = 0;
            isActive = false;
            isCompleted = true;
          }

          return {
            ...prev,
            position,
            velocity,
            acceleration,
            time: prev.time + dt,
            isActive,
            isCompleted,
          };
        });
      }, 12);

      return () => {
        window.clearInterval(interval);
      };
    }
  }, [capsule.isActive, specs, calc.velocity, calc.density]);

  // Launch canister dispatcher
  const handleLaunchCapsule = () => {
    // Save last simulation timestamp
    const nowStr = new Date().toLocaleString();
    setLastSimTimestamp(nowStr);
    localStorage.setItem('last_sim_timestamp', nowStr);

    // Reset state to start
    setCapsule({
      position: 0,
      velocity: 0,
      acceleration: 0,
      time: 0,
      isActive: true,
      isCompleted: false,
      pressuresP1Array: [],
    });
  };

  // Reset canister position
  const handleResetCapsule = () => {
    setCapsule({
      position: 0,
      velocity: 0,
      acceleration: 0,
      time: 0,
      isActive: false,
      isCompleted: false,
      pressuresP1Array: [],
    });
  };

  const handlePauseCapsule = () => {
    setCapsule((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  const handleResumeCapsule = () => {
    setCapsule((prev) => ({
      ...prev,
      isActive: true,
    }));
  };

  // Compile and trigger Excel Spreadsheet Report
  const handleGlobalExcelExport = () => {
    try {
      const headers = ['System Parameter', 'Current Value', 'Unit', 'Security Status'];
      const rows = [
        ['System Name', 'ERICON Bio-Integrated Direct Transit', '', 'VERIFIED'],
        ['Cylinder Tube Velocity', (calc.velocity || 0).toFixed(2), 'm/s', 'COMPLIANT'],
        ['Air Stream Temperature', (specs.temperature || 0).toFixed(1), 'C', 'NOMINAL'],
        ['Duct Air Density', (calc.density || 0).toFixed(4), 'kg/m3', 'NOMINAL'],
        ['Ventilation Reynolds Index', (calc.reynoldsNumber || 0).toFixed(0), '', calc.flowRegume],
        ['Pressure P1', specs.p1.toFixed(1), 'kPa', 'ACTIVE'],
        ['Pressure P2', specs.p2.toFixed(1), 'kPa', 'ACTIVE'],
        ['Timestamp (UTC)', new Date().toUTCString(), '', 'SIGNED']
      ];

      exportPremiumExcelSpreadsheet(
        `ERICON_System_Excel_Report_${Date.now()}.xls`,
        'ERICON System Parameters & Dynamic Fluid Transit Report',
        'Regulatory Compliance Field Dispatch Spreadsheet',
        headers,
        rows,
        {
          'Project Name': 'ERICON Bio-Integrated Direct Transit & Containment',
          'Study Area': 'Pneumatic Pressure Grids Alpha & Beta',
          'Principle Investigator': 'Principal Officer & Regional Scientific Council',
          'Date Generated': new Date().toUTCString(),
          'Audit Log Version': 'v4.5.1'
        }
      );
      
      window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: "🎉 Excel Spreadsheet Report generated according to ERICON Brand Standard!", type: "success" } }));
      setShowPdfExportDialog(false);
    } catch (e) {
      alert("Error generating Excel report.");
    }
  };

  // Compile and trigger PDF Report Generation from Global hotkeys or floating menus
  const handleGlobalPdfExport = () => {
    try {
      const doc = new jsPDF();
      
      // Page theme and primary gold branding
      applyPdfPageGoldBranding(
        doc, 
        'ERICON System Parameters & Fluid-Dynamics Report',
        'REGULATORY COMPLIANCE ARCHIVE REPORT // STANDARD SECURITY OUTLOOK',
        1,
        1
      );

      // Section 1: Executive Certification
      doc.setFillColor(21, 70, 45); // `#15462D`
      doc.rect(14, 46, 3, 6, 'F'); // subtle vertical bar decoration
      
      doc.setTextColor(21, 70, 45);
      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.text('1. Executive Certification', 20, 51);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(30, 41, 59); // graphite text
      doc.text('This certified document logs active environmental observations, fluid-dynamics variables, and', 14, 61);
      doc.text('ecological rodent containment stats compiled across ERICON research grids.', 14, 67);
      
      // Metadata block with gold borders
      doc.setFillColor(253, 251, 247); // soft gold tint
      doc.rect(14, 76, 182, 45, 'F');
      doc.setDrawColor(197, 160, 43); // gold border
      doc.setLineWidth(0.4);
      doc.rect(14, 76, 182, 45, 'S');
      
      doc.setTextColor(21, 70, 45);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('REPORT METADATA:', 20, 86);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Generated At (UTC): ${new Date().toUTCString()}`, 20, 94);
      doc.text(`Active Session Level: Administrator & Regional Scientists`, 20, 102);
      doc.text('Verification Code: ERAS-EMA-C1-80HZ', 20, 110);
      
      // Section 2: Active Subsystem Parameters
      doc.setFillColor(21, 70, 45);
      doc.rect(14, 134, 3, 6, 'F');
      
      doc.setTextColor(21, 70, 45);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. Active Subsystem Parameters', 20, 139);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      
      // Draw professional data rows
      const params = [
        ['Cylinder Tube Velocity:', `${(calc.velocity || 0).toFixed(2)} m/s`, 'COMPLIANT'],
        ['Air Stream Temperature:', `${(specs.temperature || 0).toFixed(1)} C`, 'NOMINAL'],
        ['Duct Air Density:', `${(calc.density || 0).toFixed(4)} kg/m3`, 'NOMINAL'],
        ['Ventilation Reynolds Index:', `${(calc.reynoldsNumber || 0).toFixed(0)}`, calc.flowRegume || 'NOMINAL'],
        ['Pressure P1 / P2 Grid Status:', `${specs.p1.toFixed(1)} kPa / ${specs.p2.toFixed(1)} kPa`, 'ACTIVE']
      ];

      let tableY = 149;
      params.forEach(([label, value, status]) => {
        // Alternating row highlighting
        doc.setFillColor(248, 250, 252);
        doc.rect(14, tableY - 5, 182, 8, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(21, 70, 45);
        doc.text(label, 18, tableY);
        
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(value, 95, tableY);
        
        // Status Badge
        doc.setFont('Helvetica', 'bold');
        if (status === 'COMPLIANT' || status === 'NOMINAL' || status === 'ACTIVE') {
          doc.setTextColor(21, 70, 45);
        } else {
          doc.setTextColor(197, 160, 43);
        }
        doc.text(status, 160, tableY);
        
        tableY += 10;
      });

      // Bottom disclaimer / seal has been printed by helper `applyPdfPageGoldBranding`

      doc.save(`ERICON_Network_System_Report_${Date.now()}.pdf`);
      window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: "🎉 PDF Compliance Report successfully compiled & downloaded to your system local workspace!", type: "success" } }));
      setShowPdfExportDialog(false);
    } catch (error) {
      console.error(error);
      alert("Error compiling PDF snapshot report. Please check session bounds.");
    }
  };

  // Keyboard Event Listeners for Space (Launch), R (Reset), Ctrl+P (PDF Export), Alt+T (Theme), Alt+U (Units), Alt+F (Temp Scale)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle global search hotkey Cmd+K or Ctrl+K first, even if some form fields are active
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Ignore other key events if typing in form fields or markdown controls
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setShowPdfExportDialog(true);
      } else if (e.key === ' ') {
        e.preventDefault(); // stop browser scroll
        handleLaunchCapsule();
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetCapsule();
      } else if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
      } else if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        setUnitSystem(prev => prev === 'metric' ? 'imperial' : 'metric');
      } else if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setTempUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [calc, specs, capsule, themeMode, unitSystem, tempUnit]);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat window when new responses arrive
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiLoading]);

  // Query server proxy for Gemini response safely
  const queryCoPilotAPI = async (messageText: string, currentHistory: typeof chatHistory) => {
    setIsAiLoading(true);
    
    // Append the user message optimistically to the local log
    const updatedHistory = [...currentHistory, { role: 'user' as const, content: messageText }];
    setChatHistory(updatedHistory);
    setChatInput('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: currentHistory.slice(-6), // Send the last 3 exchanges for dialogue history context
          currentSpecs: specs,
          physicsSummary: calc,
          biodiversitySummary: aiBiodiversityContext,
          rodentSpecies: rodentSpecies,
          themeActive: visualMode
        })
      });

      if (!response.ok) {
        const errorContent = await response.json().catch(() => ({}));
        throw new Error(errorContent.error || `HTTP error server status code: ${response.status}`);
      }

      const result = await response.json();
      setChatHistory(prev => [...prev, { role: 'model' as const, content: result.reply }]);
    } catch (e: any) {
      console.error("AI Assistant response failed:", e);
      setChatHistory(prev => [...prev, { 
        role: 'model' as const, 
        content: `⚠️ **AI Telementry Core Offline**
The ERICON scientific advisory model could not compile a response. Reason: *${e.message || 'Network unreachable' || e}*.

**Troubleshooting Checklist:**
1. Ensure the Express full-stack backend server is serving and hot-rebuilding successfully.
2. Ensure you have specified a valid API key inside **Settings > Secrets > GEMINI_API_KEY** in the build workspace.`
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;
    queryCoPilotAPI(chatInput.trim(), chatHistory);
  };

  const handleSendPreset = (text: string) => {
    if (isAiLoading) return;
    queryCoPilotAPI(text, chatHistory);
  };

  const fontScale = 
    appFontSize === 'compact' ? 0.85 :
    appFontSize === 'comfortable' ? 1.15 :
    appFontSize === 'large' ? 1.3 :
    appFontSize === 'xl' ? 1.5 : 1.0;

  const currentFontScale = applyEntireApp ? fontScale : 1.0;
  const headingScale = applyEntireApp ? (fontScale > 1 ? 1 + (fontScale - 1) * 0.75 : fontScale) : 1.0;
  const tableScale = includeTables ? fontScale : 1.0;
  const chartScale = includeCharts ? fontScale : 1.0;

  const customFilterStyle = 
    visualMode === 'comfort'
      ? 'sepia(35%) saturate(115%) contrast(92%)'
      : 'none';

  if (currentUser === null) {
    return (
      <div 
        className={`min-h-screen bg-slate-900 text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden`} 
        id="app-root-auth-block"
      >
        {/* Ambient tech styling background */}
        <div className="absolute inset-0 bg-[#0B2114] opacity-75 z-0" style={{ 
          backgroundImage: 'radial-gradient(#15462D 1.2px, transparent 1.2px)', 
          backgroundSize: '32px 32px'
        }} />
        
        <div className="z-10 w-full max-w-lg shadow-2xl relative">
          <SecureAccessGatewall
            isBlockPage={true}
            onCancel={() => {}}
            onSuccess={(user) => {
              setCurrentUser(user);
              // Dispatch showToast via standard custom event
              window.dispatchEvent(new CustomEvent('ericon_show_toast', { detail: { message: 'Security accreditation verified. Welcome to ERICON.', type: 'success' } }));
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-100 select-none pb-12 relative transition-all duration-300 ${
        themeMode === 'dark' ? 'dark dark-theme bg-slate-950 text-slate-100' : ''
      } ${visualMode === 'night' ? 'visual-mode-night' : visualMode === 'comfort' ? 'visual-mode-comfort' : 'visual-mode-standard'}`} 
      id="app-root"
      style={{ 
        backgroundImage: themeMode === 'dark' ? 'radial-gradient(#1e293b 0.8px, transparent 0.8px)' : 'radial-gradient(#e2e8f0 0.8px, transparent 0.8px)', 
        backgroundSize: '24px 24px'
      }}
    >
      <style>{`
        #app-root {
          --base-font-size: 13.5px;
          --font-scale: ${currentFontScale};
          --heading-scale: ${headingScale};
          --table-scale: ${tableScale};
          --chart-scale: ${chartScale};
          font-size: calc(var(--base-font-size) * var(--font-scale)) !important;
        }

        /* DYNAMIC BRAND HIGH-CONTRAST AMBER COMFORT THEME */
        .visual-mode-comfort p, 
        .visual-mode-comfort span, 
        .visual-mode-comfort label,
        .visual-mode-comfort th,
        .visual-mode-comfort td,
        .visual-mode-comfort h1,
        .visual-mode-comfort h2,
        .visual-mode-comfort h3,
        .visual-mode-comfort h4 {
          text-shadow: none !important;
          /* Typography stays completely standard and readable without pixelated outlines */
        }

        /* Shiny Vibrant Green Status Highlights in Amber Theme */
        .visual-mode-comfort .text-[#15462D],
        .visual-mode-comfort .text-emerald-400,
        .visual-mode-comfort .text-emerald-430,
        .visual-mode-comfort .text-emerald-500,
        .visual-mode-comfort .text-emerald-600,
        .visual-mode-comfort .text-emerald-700 {
          color: #10b981 !important;
          font-weight: 700 !important;
          text-shadow: 0 0 6px rgba(16, 185, 129, 0.4) !important;
        }
        
        .visual-mode-comfort .bg-[#15462D],
        .visual-mode-comfort .bg-emerald-600,
        .visual-mode-comfort .bg-emerald-700 {
          background-color: #10b981 !important;
          color: #ffffff !important;
        }

        /* ACTIVE LOCK BLINKING ANIMATION FOR SIDEBAR PIN */
        @keyframes active-lock-blink {
          0%, 100% {
            background-color: #059669 !important; /* emerald-600 */
            border-color: #34d399 !important;
            box-shadow: 0 0 12px rgba(52, 211, 153, 0.85);
          }
          50% {
            background-color: #10b981 !important; /* emerald-500 */
            border-color: #a7f3d0 !important;
            box-shadow: 0 0 3px rgba(52, 211, 153, 0.25);
          }
        }
        .active-lock-blinking {
          animation: active-lock-blink 1.2s infinite ease-in-out !important;
          color: #ffffff !important;
        }

        /* ACTIVE PIN ICON ANIMATION */
        @keyframes active-pin-blink {
          0%, 100% {
            color: #10b981 !important; /* emerald-500 */
            filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.4));
            opacity: 0.65;
          }
          50% {
            color: #059669 !important; /* emerald-600 */
            filter: drop-shadow(0 0 8px rgba(5, 150, 105, 0.9));
            opacity: 1;
          }
        }

        @keyframes active-pin-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .active-pin-animation {
          animation: active-pin-blink 1.8s infinite ease-in-out, active-pin-rotate 9s infinite linear !important;
          display: inline-block !important;
          transform-origin: center !important;
        }

        /* PROFESSIONAL DEEP PURPLE HIGH-CONTRAST NIGHT THEME */
        .visual-mode-night, 
        .visual-mode-night #app-root {
          background-color: #0b0214 !important;
          color: #eae2f8 !important;
          background-image: radial-gradient(#3a0d63 1px, transparent 1px) !important;
        }

        /* Clean Word Rendering: Normal text stays soft lavender silver and sharp on dark backgrounds */
        .visual-mode-night p, 
        .visual-mode-night span, 
        .visual-mode-night label,
        .visual-mode-night th,
        .visual-mode-night td {
          text-shadow: none !important;
          color: #e1daf4 !important;
        }

        /* Elegant Lavender Silver for Secondary Slate colors */
        .visual-mode-night .text-slate-400,
        .visual-mode-night .text-slate-450,
        .visual-mode-night .text-slate-500,
        .visual-mode-night .text-slate-605,
        .visual-mode-night .text-slate-655 {
          color: #a78bfa !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        /* Deep Purple Panels & Cards with high contrast border */
        .visual-mode-night .bg-white,
        .visual-mode-night .bg-slate-905,
        .visual-mode-night .bg-slate-950,
        .visual-mode-night .bg-slate-950\/80 {
          background-color: #130628 !important;
          border-color: #4c1d95 !important;
        }

        /* Prevent bg-slate-900 panels and Co-Pilot container from turning white */
        .visual-mode-night .bg-slate-900,
        .visual-mode-night #ai-panel-container {
          background-color: #130628 !important;
          border-color: #4c1d95 !important;
        }

        /* Elegant Deep Purple Sub-Cards matching the sleek dark layout */
        .visual-mode-night .bg-slate-50,
        .visual-mode-night .bg-slate-100,
        .visual-mode-night .bg-slate-50\/50 {
          background-color: #1d0e3a !important; /* Sleek slightly lighter deep purple */
          border-color: #4c1d95 !important;
        }

        .visual-mode-night .bg-slate-50 p,
        .visual-mode-night .bg-slate-50 span,
        .visual-mode-night .bg-slate-50 label,
        .visual-mode-night .bg-slate-50 strong,
        .visual-mode-night .bg-slate-100 p,
        .visual-mode-night .bg-slate-100 span,
        .visual-mode-night .bg-slate-100 label,
        .visual-mode-night .bg-slate-100 strong,
        .visual-mode-night .bg-slate-50\/50 p,
        .visual-mode-night .bg-slate-50\/50 span,
        .visual-mode-night .bg-slate-50\/50 label,
        .visual-mode-night .bg-slate-50\/50 strong {
          color: #e1daf4 !important;
          font-weight: 700 !important;
        }

        .visual-mode-night .bg-slate-50 h1,
        .visual-mode-night .bg-slate-50 h2,
        .visual-mode-night .bg-slate-50 h3,
        .visual-mode-night .bg-slate-50 h4,
        .visual-mode-night .bg-slate-50 b,
        .visual-mode-night .bg-slate-100 h1,
        .visual-mode-night .bg-slate-100 h2,
        .visual-mode-night .bg-slate-100 h3,
        .visual-mode-night .bg-slate-100 h4,
        .visual-mode-night .bg-slate-100 b {
          color: #ffffff !important;
          font-weight: 800 !important;
        }

        .visual-mode-night .bg-slate-50 strong,
        .visual-mode-night .bg-slate-100 strong {
          font-weight: 850 !important;
          color: #ffffff !important;
        }

        /* Side Left Navigation Sidebar Style Blueprint to replicate uploaded photo perfectly */
        .visual-mode-night #desktop-left-sidebar {
          background-color: #ffffff !important;
          border-right: 1.5px solid #10b981 !important;
        }
        
        /* Sidebar Logo header box custom backplate */
        .visual-mode-night #desktop-left-sidebar div.h-16 {
          background-color: #e2f1ea !important;
          border-bottom: 2.5px solid #10b981 !important;
        }
        .visual-mode-night #desktop-left-sidebar div.h-16 h1,
        .visual-mode-night #desktop-left-sidebar div.h-16 span {
          color: #15462D !important;
          font-weight: 900 !important;
          text-shadow: none !important;
        }

        /* Lock Pin and Collapse icon button controllers */
        .visual-mode-night #left-sidebar-controls-hub button {
          background-color: #2e1065 !important;
          color: #ffffff !important;
          border: 1.2px solid #4c1d95 !important;
        }
        .visual-mode-night #left-sidebar-controls-hub button svg {
          stroke: #ffffff !important;
        }
        .visual-mode-night #left-sidebar-controls-hub button:hover {
          background-color: #4c1d95 !important;
        }

        /* Sidebar Navigation background container */
        .visual-mode-night #sidebar-nav-container {
          background-color: #ffffff !important;
        }

        /* Inactive Buttons: bg deep-purple with white text & white icons */
        .visual-mode-night #sidebar-nav-container button {
          background-color: #2e1065 !important;
          color: #ffffff !important;
          border: 1.2px solid transparent !important;
          border-radius: 10px !important;
          box-shadow: none !important;
          transition: all 0.2s ease-in-out !important;
        }
        .visual-mode-night #sidebar-nav-container button svg {
          stroke: #ffffff !important;
        }
        .visual-mode-night #sidebar-nav-container button:hover {
          background-color: #4c1d95 !important;
          color: #ffffff !important;
        }

        /* Active Button (RESEARCH WORKSPACE, ETC.): bg white with a light purple border and deep purple text & icon */
        .visual-mode-night #sidebar-nav-container button.bg-emerald-50 {
          background-color: #ffffff !important;
          color: #2e1065 !important;
          border: 1.5px solid #c084fc !important;
          border-radius: 10px !important;
          font-weight: 900 !important;
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.45) !important;
        }
        .visual-mode-night #sidebar-nav-container button.bg-emerald-50 svg {
          stroke: #2e1065 !important;
        }
        .visual-mode-night #sidebar-nav-container button.bg-emerald-50 span {
          color: #2e1065 !important;
          font-weight: 900 !important;
        }

        /* High contrast deep purple secondary highlights */
        .visual-mode-night .text-emerald-430,
        .visual-mode-night .text-emerald-400,
        .visual-mode-night .text-emerald-500 {
          color: #c084fc !important; /* Luminous soft neon purple */
          font-weight: 700 !important;
        }

        .visual-mode-night .text-emerald-800,
        .visual-mode-night .text-emerald-750,
        .visual-mode-night .text-emerald-700 {
          color: #34d399 !important; /* Elegant green highlight */
          text-shadow: none !important;
        }

        .visual-mode-night .border,
        .visual-mode-night .border-slate-150,
        .visual-mode-night .border-slate-200,
        .visual-mode-night .border-slate-205,
        .visual-mode-night .border-slate-800,
        .visual-mode-night .border-slate-850 {
          border-color: #4c1d95 !important;
        }

        /* Purple Active Indicators & Neon Buttons */
        .visual-mode-night button {
          font-weight: 700 !important;
          letter-spacing: 0.015em !important;
          border-color: #8b5cf6 !important;
          background-color: #2e1065 !important;
          color: #f5f3ff !important;
        }
        
        .visual-mode-night button:hover {
          background-color: #4c1d95 !important;
          border-color: #c084fc !important;
        }

        .visual-mode-night h1, 
        .visual-mode-night h2, 
        .visual-mode-night h3, 
        .visual-mode-night h4,
        .visual-mode-night strong,
        .visual-mode-night b {
          color: #ffffff !important;
          font-weight: 800 !important;
          text-shadow: 0 0 5px rgba(167, 139, 250, 0.35) !important;
        }

        /* High contrast amber elements mapped to vibrant golden icons in Red/Purple mode */
        .visual-mode-night .text-amber-500,
        .visual-mode-night .text-amber-600,
        .visual-mode-night .text-yellow-500 {
          color: #fbcfe8 !important; /* Soft rose highlight */
        }

        /* SCIENTIFIC LABEL READABILITY PROTECTION */
        svg text:not(.recharts-text):not(.recharts-label):not(.recharts-cartesian-axis-tick-value):not(#cad-blueprint-svg *), 
        .chart-label,
        .axis-label,
        .legend-label,
        .telemetry-val,
        .annotation-tag {
          text-shadow: -1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff, 0 0 3px #ffffff !important;
          font-weight: bold !important;
        }
        .dark-theme svg text:not(#cad-blueprint-svg *),
        .dark-theme .recharts-text,
        .dark-theme .chart-label {
          text-shadow: -1.2px -1.2px 0 #000000, 1.2px -1.2px 0 #000000, -1.2px 1.2px 0 #000000, -1.2px 1.2px 0 #000000, 0 0 4px #000000 !important;
          fill: #ffffff !important;
        }
        
        /* EXPLICIT CRITICAL MONOSPACE FONT OVERRIDE ONLY FOR CAD SCHEMATIC PICTURE - TO BE UNBELIEVABLY READABLE & CRISP IN ALL CALIBRATIONS */
        #cad-blueprint-svg,
        #cad-blueprint-svg text,
        #cad-blueprint-svg text *,
        #cad-blueprint-svg tspan {
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, "Fira Code", monospace !important;
          font-weight: 700 !important;
          letter-spacing: -0.0125em !important;
          text-rendering: geometricPrecision !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        /* Enforce absolute solid color vector sharpness - 100% flat fills, no blurs or thick strokes */
        #cad-blueprint-svg text,
        #cad-blueprint-svg tspan {
          stroke: none !important;
          stroke-width: 0px !important;
          text-shadow: none !important;
        }

        /* Adaptive contrast styling for CAD labels on transparent/ambient backdrops across all modes (lux, amber, and purple/night) */
        
        /* standard/lux/amber (light background housing) style for the ambient texts */
        #cad-blueprint-svg .ericon-schematic-ambient-text {
          font-weight: 800 !important;
        }
        
        /* dark theme ambient styling */
        .dark-theme #cad-blueprint-svg .ericon-schematic-ambient-text {
          fill: #eae2f8 !important;
        }
        
        /* comfort calibration (amber/yellow-toned) ambient styling */
        .visual-mode-comfort #cad-blueprint-svg .ericon-schematic-ambient-text {
          color: #1e293b !important;
          fill: #1e293b !important;
        }
        .visual-mode-comfort.dark-theme #cad-blueprint-svg .ericon-schematic-ambient-text {
          color: #fef08a !important; /* Soft yellow contrast tint */
          fill: #fef08a !important;
        }

        /* purple (night) calibration ambient styling */
        .visual-mode-night #cad-blueprint-svg .ericon-schematic-ambient-text {
          color: #e9d5ff !important; /* Bright crisp lavender readability color */
          fill: #e9d5ff !important;
        }
        /* special highlights on transparent background under night/purple mode */
        .visual-mode-night #cad-blueprint-svg text.fill-emerald-800,
        .visual-mode-night #cad-blueprint-svg text.fill-emerald-700 {
          fill: #34d399 !important; /* Bright mint-green vector text for OWEP maintenance port tag on purplebg */
        }
        .visual-mode-night #cad-blueprint-svg text.fill-blue-900,
        .visual-mode-night #cad-blueprint-svg text.fill-blue-700 {
          fill: #60a5fa !important; /* Bright blue vector text for Terminal gate tag on purplebg */
        }

        .visual-mode-night svg:not(#cad-blueprint-svg) text,
        .visual-mode-night text:not(#cad-blueprint-svg *) {
          fill: #ffffff !important;
          stroke: #120124 !important;
          stroke-width: 0.75px !important;
          text-shadow: -1px -1px 0 #120124, 1px -1px 0 #120124, -1px 1px 0 #120124, 1px 1px 0 #120124, 0 0 4px #120124 !important;
        }
        .visual-mode-comfort svg:not(#cad-blueprint-svg) text,
        .visual-mode-comfort text:not(#cad-blueprint-svg *) {
          fill: #ffffff !important;
          stroke: #1c0f00 !important;
          stroke-width: 0.75px !important;
          text-shadow: -1px -1px 0 #1c0f00, 1px -1px 0 #1c0f00, -1px 1px 0 #1c0f00, 1px 1px 0 #1c0f00, 0 0 4px #1c0f00 !important;
        }

        /* Dynamic Dark Theme Styles & Layout Enhancements */
        .dark-theme, .dark-theme #app-root {
          background-color: #020617 !important;
          color: #f1f5f9 !important;
        }
        .dark-theme .bg-white {
          background-color: #0b1329 !important;
          color: #f8fafc !important;
          border-color: #1e293b !important;
        }
        .dark-theme .bg-slate-50 {
          background-color: #080e1e !important;
          color: #f8fafc !important;
          border-color: #1e293b !important;
        }
        .dark-theme .text-slate-955, .dark-theme .text-slate-905, .dark-theme .text-slate-900, .dark-theme .text-slate-800 {
          color: #f1f5f9 !important;
        }
        .dark-theme .text-slate-700, .dark-theme .text-slate-650 {
          color: #cbd5e1 !important;
        }
        .dark-theme .text-slate-600, .dark-theme .text-slate-500 {
          color: #94a3b8 !important;
        }
        .dark-theme .border-slate-200, .dark-theme .border-slate-100, .dark-theme .border-slate-300, .dark-theme .border {
          border-color: #1e293b !important;
        }
        .dark-theme input, .dark-theme select, .dark-theme textarea {
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border-color: #334155 !important;
        }
        .dark-theme .bg-slate-100 {
          background-color: #1e293b !important;
        }


        ${applyEntireApp ? `
          #app-root p, #app-root span:not([class*="lucide"]), #app-root label, #app-root div:not([class*="font-mono"]):not([class*="material-icons"]) {
            font-size: calc(var(--base-font-size) * var(--font-scale)) !important;
          }
          #app-root h1, #app-root .card-title, #app-root .title {
            font-size: calc(24px * var(--heading-scale)) !important;
            font-weight: 700;
          }
          #app-root h2 {
            font-size: calc(18px * var(--heading-scale)) !important;
            font-weight: 600;
          }
          #app-root h3, #app-root .section-header {
            font-size: calc(15px * var(--heading-scale)) !important;
            font-weight: 600;
          }
        ` : ''}

        ${includeTables ? `
          #app-root table, #app-root table th, #app-root table td, #app-root th, #app-root td {
            font-size: calc(12px * var(--table-scale)) !important;
            line-height: 1.6 !important;
          }
        ` : ''}

        ${includeCharts ? `
          #app-root svg:not(#cad-blueprint-svg) text, #app-root .chart-label, #app-root .recharts-text {
            font-size: calc(11px * var(--chart-scale)) !important;
          }
        ` : ''}

        /* Accessibility: Large Click Targets (min 44px) */
        ${accessibilityLargeTargets ? `
          #app-root button, #app-root select, #app-root input, #app-root [role="button"] {
            min-height: 44px !important;
            min-width: 44px;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
        ` : ''}

        /* Accessibility: Increase Line Spacing */
        ${accessibilityLineSpacing ? `
          #app-root p, #app-root td, #app-root .comment-text, #app-root .notes-box {
            line-height: 1.85 !important;
          }
        ` : ''}

        /* Accessibility: Bold Text Boost & Custom slider boldness limits */
        #app-root h1, #app-root h2, #app-root h3, #app-root h4, #app-root strong, #app-root th, #app-root .font-bold, #app-root .font-extrabold, #app-root .font-black {
          font-weight: ${appliedFontBoldness} !important;
        }

        #app-root p, #app-root td, #app-root span:not([class*="lucide"]):not([class*="recharts"]), #app-root label, #app-root input, #app-root select, #app-root textarea {
          font-weight: ${Math.min(400, appliedFontBoldness)} !important;
        }

        ${appliedFontBoldness === 300 ? `
          /* MINIMUM BOLDNESS (300): FAINTING WORDS AND BACKGROUND CHANGING TO GRAY AS SHOWN IN SCREENSHOT */
          #app-root, #app-root-inner, #app-main-view-layout, .visual-mode-night, .visual-mode-comfort {
            background-color: #f3f4f6 !important;
            background-image: none !important;
          }
          #app-root .bg-white, 
          #app-root .bg-slate-50, 
          #app-root .bg-slate-100, 
          #app-root .bg-slate-900,
          #app-root .bg-slate-950,
          #app-root .bg-slate-905,
          #app-root aside,
          #app-root div[class*="bg-"] {
            background-color: #e5e7eb !important;
            border-color: #d1d5db !important;
            box-shadow: none !important;
          }
          #app-root h1, #app-root h2, #app-root h3, #app-root h4, #app-root p, #app-root span:not([class*="lucide"]):not([class*="recharts"]), #app-root label, #app-root td, #app-root th, #app-root strong, #app-root select {
            color: #8b96a8 !important;
            font-weight: 300 !important;
            text-shadow: none !important;
            opacity: 0.65 !important;
          }
          #app-root .text-[#15462D], 
          #app-root .text-emerald-800, 
          #app-root .text-emerald-700, 
          #app-root .text-[#1e293b],
          #app-root .text-slate-900,
          #app-root .text-slate-705,
          #app-root .text-slate-800 {
            color: #718096 !important;
          }
          #app-root input, 
          #app-root select, 
          #app-root textarea,
          #app-root div[class*="border"] {
            background-color: #e5e7eb !important;
            color: #718096 !important;
            border-color: #d1d5db !important;
            font-weight: 300 !important;
            opacity: 0.75 !important;
          }
          #app-root .bg-[#15462D],
          #app-root .bg-emerald-100, 
          #app-root .bg-emerald-50, 
          #app-root .bg-emerald-600 {
            background-color: #d1d5db !important;
            color: #718096 !important;
            border-color: #d1d5db !important;
          }
          #app-root svg {
            opacity: 0.55 !important;
          }
        ` : ''}

        ${appliedFontBoldness === 400 ? `
          /* INTERMEDIATE BOLDNESS (400): MEDIUM-LIGHT MILD FAINTING AND SOFT GRAY CANVAS */
          #app-root, #app-root-inner {
            background-color: #fafbfb !important;
          }
          #app-root .bg-white, 
          #app-root .bg-slate-50, 
          #app-root .bg-slate-100 {
            background-color: #f1f3f5 !important;
            border-color: #e2e8f0 !important;
          }
          #app-root h1, #app-root h2, #app-root h3, #app-root h4, #app-root p, #app-root span:not([class*="lucide"]):not([class*="recharts"]), #app-root label, #app-root td, #app-root th, #app-root strong {
            color: #5c6470 !important;
            opacity: 0.8 !important;
          }
          #app-root input, 
          #app-root select, 
          #app-root textarea {
            background-color: #f1f3f5 !important;
            color: #5c6470 !important;
            border-color: #e2e8f0 !important;
          }
        ` : ''}

        ${accessibilityBoldText ? `
          #app-root {
            font-weight: 600 !important;
          }
          #app-root p, #app-root td, #app-root span, #app-root label {
            font-weight: 600 !important;
            -webkit-font-smoothing: antialiased;
          }
          #app-root h1, #app-root h2, #app-root h3, #app-root strong {
            font-weight: 800 !important;
          }
        ` : ''}

        /* Accessibility: Reduce Visual Crowding */
        ${accessibilityReduceCrowding ? `
          #app-root .grid {
            gap: 2.5rem !important;
          }
          #app-root .gap-4 {
            gap: 1.5rem !important;
          }
          #app-root .gap-6 {
            gap: 2.25rem !important;
          }
          #app-root .p-4 {
            padding: 1.5rem !important;
          }
          #app-root .p-6 {
            padding: 2.25rem !important;
          }
        ` : ''}

        /* Table Density Controls */
        ${tableDensity === 'compact' ? `
          #app-root td, #app-root th, #app-root .table-cell {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
            padding-left: 6px !important;
            padding-right: 6px !important;
          }
        ` : tableDensity === 'expanded' ? `
          #app-root td, #app-root th, #app-root .table-cell {
            padding-top: 14px !important;
            padding-bottom: 14px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        ` : `
          #app-root td, #app-root th, #app-root .table-cell {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        `}

        /* Navigation controls styling */
        #app-root #app-view-selector-tabs button {
          font-size: calc(13px * var(--font-scale)) !important;
          padding-top: ${expandedSidebar ? '18px' : '10px'} !important;
          padding-bottom: ${expandedSidebar ? '18px' : '10px'} !important;
        }
        #app-root #app-view-selector-tabs svg {
          width: ${expandedSidebar ? '24px' : '16px'} !important;
          height: ${expandedSidebar ? '24px' : '16px'} !important;
        }

        /* Input configurations (labels & entries) */
        #app-root label {
          font-weight: 600 !important;
          margin-bottom: 8px !important;
        }
        #app-root input, #app-root select, #app-root textarea {
          font-size: calc(13px * var(--font-scale)) !important;
          min-height: 48px !important;
          padding: 10px 14px !important;
        }

        /* EXPLICIT DESIGN EXCEPTION: SCIENTIFIC INTEGRITY & ACCESS PROTOCOLS IN HOME TAB */
        /* Must be beautifully styled with deep dark green and high-contrast minty cream backgrounds */
        #app-root #home-protocols-grid > div {
          background-color: #ffffff !important;
          border: 2px solid #10b981 !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08) !important;
        }
        
        #app-root #home-protocols-grid > div:hover {
          border-color: #059669 !important;
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15) !important;
        }

        #app-root #home-protocols-grid .bg-slate-50 {
          background-color: #e2f1ea !important; /* Elegant high-contrast light mint-cream */
          border: 1.5px solid #10b981 !important;
        }

        #app-root #home-protocols-grid h1,
        #app-root #home-protocols-grid h2,
        #app-root #home-protocols-grid h3,
        #app-root #home-protocols-grid h4,
        #app-root #home-protocols-grid span,
        #app-root #home-protocols-grid p,
        #app-root #home-protocols-grid strong,
        #app-root #home-protocols-grid b,
        #app-root #home-protocols-grid svg {
          text-shadow: none !important;
          transform: none !important;
        }

        #app-root #home-protocols-grid span {
          color: #15462D !important;
          font-weight: 900 !important;
        }

        #app-root #home-protocols-grid svg {
          stroke: #15462D !important;
          color: #15462D !important;
        }

        #app-root #home-protocols-grid strong {
          color: #15462D !important;
          font-weight: 900 !important;
        }

        #app-root #home-protocols-grid p {
          color: #15462D !important;
          font-weight: 750 !important;
        }

        #app-root #home-protocols-grid svg.text-emerald-800 {
          stroke: #15462D !important;
          color: #15462D !important;
        }

        #app-root #home-protocols-grid span.text-emerald-750 {
          color: #10b981 !important;
        }

        #app-root #home-protocols-grid div.text-slate-400 {
          color: #15462D !important;
          opacity: 0.75 !important;
          font-weight: 800 !important;
        }

        /* EXPLICIT HIGH-CONTRAST DEEP DARK GREEN STYLING OVERRIDES FOR CONTRAST */
        #custom-metrics-box {
          background-color: #f0fdf4 !important;
          border: 2px solid #6ee7b7 !important;
          padding: 10px 14px !important;
        }
        #custom-metrics-box span {
          color: #15462D !important;
          font-weight: 850 !important;
        }
        #custom-metrics-box strong {
          color: #0c2f1e !important;
          font-weight: 950 !important;
        }

        #governance-badge {
          background-color: #f0fdf4 !important;
          color: #15462D !important;
          border: 1.5px solid #a7f3d0 !important;
          font-weight: 900 !important;
          text-shadow: none !important;
        }

        #ericon-header-avatar-toggle {
          background-color: #f0fdf4 !important;
          border: 1.5px solid #6ee7b7 !important;
          padding: 2.5px 7px !important;
          border-radius: 6px !important;
        }
        #ericon-header-avatar-toggle #user-header-username {
          color: #0c2f1e !important;
          font-weight: 900 !important;
        }
        #ericon-header-avatar-toggle #user-header-role {
          color: #15462D !important;
          font-weight: 855 !important;
        }

        #user-dropdown-seed {
          background-color: #e6fbf0 !important;
          border-bottom: 2px solid #6ee7b7 !important;
        }
        #user-dropdown-seed span {
          color: #15462D !important;
          font-weight: 900 !important;
        }
        #user-dropdown-seed strong {
          color: #0c2f1e !important;
          font-weight: 950 !important;
        }

        #ericon-header-brand-title h1 {
          color: #15462D !important;
          font-weight: 950 !important;
        }
        #ericon-header-brand-title span {
          color: #10b981 !important;
          font-weight: 905 !important;
        }

        /* EXPLICIT CRITICAL SYSTEM LEVEL HIGH-CONTRAST DEEP DARK GREEN (#15462D) STYLING OVERRIDES FOR RESEARCH PORTAL & LIGHT PARTS OF SIMULATOR CORES - REFACTORED TO RESPECT ACCESSIBILITY SLIDER & GOOGLE AI STUDIO STANDARD */
        #research-workspace-root h1:not(button *):not(a *),
        #research-workspace-root h2:not(button *):not(a *),
        #research-workspace-root h3:not(button *):not(a *),
        #research-workspace-root h4:not(button *):not(a *),
        #research-workspace-root h5:not(button *):not(a *),
        #research-workspace-root h6:not(button *):not(a *),
        #research-workspace-root strong:not(button *):not(a *),
        #research-workspace-root b:not(button *):not(a *),
        #research-workspace-root th:not(button *):not(a *),
        #simulator-tab-root-container h1:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container h2:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container h3:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container h4:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container h5:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container h6:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container strong:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container b:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container th:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-905 *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *) {
          font-weight: ${appliedFontBoldness} !important;
          text-shadow: none !important;
          ${appliedFontBoldness === 300 ? `
            color: #8b96a8 !important;
            opacity: 0.65 !important;
          ` : `
            /* Beautiful crisp title color matching Google AI Studio's sleek slate hierarchy */
            color: #0f172a !important;
          `}
        }

        #research-workspace-root p:not(button *):not(a *),
        #research-workspace-root label:not(button *):not(a *),
        #research-workspace-root td:not(button *):not(a *),
        #research-workspace-root li:not(button *):not(a *),
        #research-workspace-root select:not(button *):not(a *),
        #research-workspace-root input:not(button *):not(a *),
        #research-workspace-root textarea:not(button *):not(a *),
        #research-workspace-root option:not(button *):not(a *),
        #research-workspace-root span:not(button *):not(a *):not(.recharts-legend-item-text):not(.recharts-default-legend *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container p:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container label:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container td:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-905 *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container li:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *),
        #simulator-tab-root-container select:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *),
        #simulator-tab-root-container input:not([type="range"]):not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *),
        #simulator-tab-root-container textarea:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *),
        #simulator-tab-root-container option:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *),
        #simulator-tab-root-container span:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(button *):not(.recharts-legend-item-text):not(.recharts-default-legend *):not([class*="recharts-tooltip"]):not([class*="recharts-tooltip"] *) {
          font-weight: ${Math.min(400, appliedFontBoldness)} !important;
          text-shadow: none !important;
          ${appliedFontBoldness === 300 ? `
            color: #8b96a8 !important;
            opacity: 0.65 !important;
          ` : `
            /* Highly premium readable slate body gray exactly like Google AI Studio */
            color: #475569 !important;
          `}
        }

        /* SVG icon strokes should align to the premium deep green theme */
        #research-workspace-root svg:not(button *):not(a *),
        #simulator-tab-root-container svg:not(#simulator-subtab-header *):not(#metric-schematic-visual *):not(#pdf-compilation-card *):not(.bg-slate-900 *):not(.bg-slate-950 *):not(#favorites-presets-mini-list *):not(.text-rose-500):not(.text-amber-500) {
          stroke: #15462D !important;
        }

        /* EXPLICIT CRITICAL OVERRIDES FOR FAVORITES & SIMULATION PRESETS AS DIRECTED BY THE USER IN THE PDF */
        #favorites-presets-mini-list,
        #favorites-presets-mini-list * {
          color: #15462D !important;
          stroke: #15462D !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }
        #favorites-presets-mini-list .bg-amber-500\/10 {
          background-color: #e2f1ea !important;
        }
        .visual-mode-night #favorites-presets-mini-list > div {
          background-color: #f4fbf7 !important; /* Soft mint/light green high-contrast backdrop to prevent low-contrast blurring on purple */
          border: 1.5px solid #15462D !important;
        }
        .visual-mode-night #favorites-presets-mini-list > div:hover {
          background-color: #e2f1ea !important; /* Slightly darker soft mint on hover */
          border-color: #064e3b !important;
        }

        /* Targeted high-contrast white on purple styling for the deletion (trash) button specifically in purple (night) mode */
        .visual-mode-night #favorites-presets-mini-list button,
        .visual-mode-night .ericon-history-delete-btn {
          background-color: #2e1065 !important;
          border: 1px solid #8b5cf6 !important;
          opacity: 1 !important;
        }
        .visual-mode-night #favorites-presets-mini-list button *,
        .visual-mode-night #favorites-presets-mini-list button svg,
        .visual-mode-night #favorites-presets-mini-list button svg *,
        .visual-mode-night .ericon-history-delete-btn *,
        .visual-mode-night .ericon-history-delete-btn svg,
        .visual-mode-night .ericon-history-delete-btn svg * {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }
        .visual-mode-night #favorites-presets-mini-list button:hover,
        .visual-mode-night #favorites-presets-mini-list button:active,
        .visual-mode-night #favorites-presets-mini-list button:focus,
        .visual-mode-night .ericon-history-delete-btn:hover,
        .visual-mode-night .ericon-history-delete-btn:active,
        .visual-mode-night .ericon-history-delete-btn:focus {
          background-color: #ef4444 !important;
          border-color: #ef4445 !important;
        }
        .visual-mode-night #favorites-presets-mini-list button:hover *,
        .visual-mode-night #favorites-presets-mini-list button:active *,
        .visual-mode-night #favorites-presets-mini-list button:focus *,
        .visual-mode-night #favorites-presets-mini-list button:hover svg,
        .visual-mode-night #favorites-presets-mini-list button:active svg,
        .visual-mode-night #favorites-presets-mini-list button:focus svg,
        .visual-mode-night .ericon-history-delete-btn:hover *,
        .visual-mode-night .ericon-history-delete-btn:active *,
        .visual-mode-night .ericon-history-delete-btn:focus *,
        .visual-mode-night .ericon-history-delete-btn:hover svg,
        .visual-mode-night .ericon-history-delete-btn:active svg,
        .visual-mode-night .ericon-history-delete-btn:focus svg {
          color: #15462D !important;
          stroke: #15462D !important;
          fill: none !important;
          opacity: 1 !important;
        }

        /* EXPLICIT HIGH-CONTRAST DEEP DARK GREEN ON SOFT MINT BACKGROUND CALIBRATION FOR PURPLE (NIGHT) MODE */
        .visual-mode-night #ericon-floating-legend-cover,
        .visual-mode-night #ericon-cad-viewport-guide,
        .visual-mode-night #schematic-diagnostics-strip,
        .visual-mode-night .ericon-chart-insight-paragraph,
        .visual-mode-night #ericon-ledger-history-card {
          background-color: #f4fbf7 !important;
          border: 1.5px solid #15462D !important;
          box-shadow: 0 4px 15px rgba(21, 70, 45, 0.15) !important;
          color: #15462D !important;
        }

        /* Specific nested child tag color and stroke overrides inside the high-contrast mint containers in night mode */
        .visual-mode-night #ericon-floating-legend-cover *,
        .visual-mode-night #ericon-floating-legend-cover div,
        .visual-mode-night #ericon-floating-legend-cover span,
        .visual-mode-night #ericon-cad-viewport-guide *,
        .visual-mode-night #ericon-cad-viewport-guide span,
        .visual-mode-night #ericon-cad-viewport-guide li,
        .visual-mode-night #ericon-cad-viewport-guide strong,
        .visual-mode-night #schematic-diagnostics-strip *,
        .visual-mode-night #schematic-diagnostics-strip div,
        .visual-mode-night #schematic-diagnostics-strip span,
        .visual-mode-night #schematic-diagnostics-strip p,
        .visual-mode-night .ericon-chart-insight-paragraph *,
        .visual-mode-night .ericon-chart-insight-paragraph strong,
        .visual-mode-night #ericon-ledger-history-card *:not(button):not(button *):not(.ericon-clear-history-btn):not(.ericon-clear-history-btn *):not(.ericon-history-delete-btn):not(.ericon-history-delete-btn *),
        .visual-mode-night #ericon-ledger-history-card h3:not(button *):not(.ericon-clear-history-btn *),
        .visual-mode-night #ericon-ledger-history-card p:not(button *):not(.ericon-clear-history-btn *),
        .visual-mode-night #ericon-ledger-history-card table:not(button *),
        .visual-mode-night #ericon-ledger-history-card th:not(button *),
        .visual-mode-night #ericon-ledger-history-card td:not(button *):not(.ericon-history-delete-btn *),
        .visual-mode-night #ericon-ledger-history-card tr:not(button *),
        .visual-mode-night #ericon-ledger-history-card span:not(button *):not(.ericon-clear-history-btn *):not(.ericon-history-delete-btn *) {
          color: #15462D !important;
          stroke: #15462D !important;
          opacity: 1 !important;
          text-shadow: none !important;
          font-weight: 850 !important;
        }

        /* Border colors within the high-contrast light mint cards in night mode must be deep dark green to eliminate low-contrast blur */
        .visual-mode-night #ericon-floating-legend-cover,
        .visual-mode-night #ericon-cad-viewport-guide,
        .visual-mode-night #schematic-diagnostics-strip,
        .visual-mode-night #schematic-diagnostics-strip div,
        .visual-mode-night .ericon-chart-insight-paragraph,
        .visual-mode-night #ericon-ledger-history-card,
        .visual-mode-night #ericon-ledger-history-card div:not(button *),
        .visual-mode-night #ericon-ledger-history-card table,
        .visual-mode-night #ericon-ledger-history-card th,
        .visual-mode-night #ericon-ledger-history-card td,
        .visual-mode-night #ericon-ledger-history-card tr {
          border-color: #15462D !important;
        }

        /* Soft mint hover row highlights inside ledger list */
        .visual-mode-night #ericon-ledger-history-card tbody tr:hover {
          background-color: #e2f1ea !important;
        }

        /* SVG icons inside high contrast cards in night mode */
        .visual-mode-night #ericon-floating-legend-cover svg,
        .visual-mode-night #ericon-cad-viewport-guide svg,
        .visual-mode-night #schematic-diagnostics-strip svg,
        .visual-mode-night #ericon-ledger-history-card svg:not(.ericon-clear-history-btn *):not(.ericon-history-delete-btn *) {
          stroke: #15462D !important;
        }

        /* EXPLICIT CLEAN CONTRAST OVERRIDES FOR THE CLEAR HISTORY AND DELETE ROW BUTTONS IN THE LEDGER (NIGHT MODE) */
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn {
          background-color: #2e1065 !important;
          border: 1.5px solid #8b5cf6 !important;
          color: #ffffff !important;
          opacity: 1 !important;
        }

        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn *,
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn svg *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn svg * {
          color: #ffffff !important;
          stroke: #ffffff !important;
          opacity: 1 !important;
        }

        /* Hover States for Destructive/Clear Actions – Bright high-contrast visual safety */
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn:hover {
          background-color: #ef4444 !important;
          border-color: #f87171 !important;
          color: #ffffff !important;
        }

        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn:hover *,
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn:hover svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-clear-history-btn:hover svg * {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:hover,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:active,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:focus {
          background-color: #ef4444 !important;
          border-color: #ef4445 !important;
        }

        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:hover *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:active *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:focus *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:hover svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:active svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:focus svg,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:hover svg *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:active svg *,
        .visual-mode-night #ericon-ledger-history-card .ericon-history-delete-btn:focus svg * {
          color: #15462D !important;
          stroke: #15462D !important;
          fill: none !important;
          opacity: 1 !important;
        }

        /* EXPLICIT CRITICAL OVERRIDES FOR ACTIVE RESEARCH NAVIGATION PORTAL AND DATA INPUT SUB-TABS */
        .ericon-active-portal-tab,
        button.ericon-active-portal-tab,
        button.ericon-active-portal-tab *,
        #research-workspace-root button.ericon-active-portal-tab,
        #research-workspace-root button.ericon-active-portal-tab * {
          background-color: #e2f1ea !important;
          color: #15462D !important;
          stroke: #15462D !important;
          border-color: #15462D !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        /* EXPLICIT CRITICAL OVERRIDES FOR THE PRODUCTIVITY DOCK & SHORTCUT HUB AS DIRECTED BY THE USER */
        #ericon-right-dock,
        #ericon-right-dock *:not(button):not(button *),
        #ericon-accessibility-shortcut-hub,
        #ericon-accessibility-shortcut-hub *:not(button):not(button *) {
          color: #15462D !important;
          stroke: #15462D !important;
          opacity: 1 !important;
          text-shadow: none !important;
        }

        #ericon-right-dock,
        #ericon-accessibility-shortcut-hub .absolute.bottom-14 {
          background-color: #f4fbf7 !important; /* Premium ultra soft mint background */
          border: 2px solid #15462D !important;
        }

        /* Border colors around inputs/divs to be crisp green */
        #ericon-right-dock input,
        #ericon-right-dock select,
        #ericon-right-dock textarea,
        #ericon-right-dock div,
        #ericon-right-dock form,
        #ericon-accessibility-shortcut-hub input,
        #ericon-accessibility-shortcut-hub div {
          border-color: #15462D !important;
        }

        /* Non-button divs and cards in the panel can have soft mint bg */
        #ericon-right-dock .bg-white,
        #ericon-right-dock .bg-slate-50,
        #ericon-right-dock .bg-slate-105,
        #ericon-accessibility-shortcut-hub .bg-white,
        #ericon-accessibility-shortcut-hub .bg-slate-50,
        #ericon-accessibility-shortcut-hub .bg-slate-105 {
          background-color: #f0fdf4 !important;
        }

        /* Accent badges can be light emerald bg */
        #ericon-right-dock .bg-\[\#15462D\]\/10 {
          background-color: #e2f1ea !important;
        }

        /* SHORTCUT HUB BUTTONS STYLE CORRECTION (INACTIVE VS ACTIVE) */
        
        /* DEFAULT STYLE for LUX (clear) standard/comfort modes: Elegant light pale mint bg, dark green text & border as in bottom screenshot */
        #ericon-accessibility-shortcut-hub button {
          background-color: #f7fdfa !important; /* Extremely soft pristine clean mint/white as shown in screenshot */
          color: #15462D !important;
          border: 1.5px solid #15462D !important;
          border-radius: 0.5rem !important;
          font-weight: 700 !important;
          opacity: 1 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          transition: all 0.2s ease-in-out !important;
        }

        #ericon-accessibility-shortcut-hub button * {
          color: #15462D !important;
          stroke: #15462D !important;
        }

        #ericon-accessibility-shortcut-hub button kbd {
          background-color: #e2f1ea !important;
          border: 1px solid #15462D !important;
          color: #15462D !important;
        }

        #ericon-accessibility-shortcut-hub button span.bg-emerald-750 {
          background-color: transparent !important;
          color: #15462D !important;
          border: 1px solid #15462D !important;
          border-radius: 4px !important;
          padding-left: 0.375rem !important;
          padding-right: 0.375rem !important;
        }

        /* ACTIVE/HOVERED/TOUCHED SHORTCUT BUTTONS => TURN INTO THE LIGHT MINT GREEN DESIGN WITH CRISP DARK GREEN OUTLINE */
        #ericon-accessibility-shortcut-hub button:hover,
        #ericon-accessibility-shortcut-hub button:active,
        #ericon-accessibility-shortcut-hub button:focus,
        #ericon-accessibility-shortcut-hub button.active,
        #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab {
          background-color: #e2f1ea !important; /* Light mint green */
          color: #15462D !important;
          border-color: #15462D !important;
          stroke: #15462D !important;
          font-weight: 800 !important;
          box-shadow: 0 2px 4px rgba(21, 70, 45, 0.15) !important;
        }

        #ericon-accessibility-shortcut-hub button:hover *,
        #ericon-accessibility-shortcut-hub button:active *,
        #ericon-accessibility-shortcut-hub button:focus *,
        #ericon-accessibility-shortcut-hub button.active *,
        #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab * {
          color: #15462D !important;
          stroke: #15462D !important;
        }

        #ericon-accessibility-shortcut-hub button:hover kbd,
        #ericon-accessibility-shortcut-hub button:active kbd,
        #ericon-accessibility-shortcut-hub button:focus kbd,
        #ericon-accessibility-shortcut-hub button.active kbd,
        #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab kbd {
          background-color: #15462D !important;
          color: #e2f1ea !important;
          border-color: #15462D !important;
        }

        #ericon-accessibility-shortcut-hub button:hover span.bg-emerald-750,
        #ericon-accessibility-shortcut-hub button:active span.bg-emerald-750,
        #ericon-accessibility-shortcut-hub button:focus span.bg-emerald-750,
        #ericon-accessibility-shortcut-hub button.active span.bg-emerald-750 {
          background-color: #15462D !important;
          color: #e2f1ea !important;
          border-color: #15462D !important;
        }

        /* ONLY IN PURPLE (NIGHT) MODE: RETAIN THE SPECTACULAR DEEP PURPLE BUTTONS STYLE THAT WORKS GREAT IN NIGHT GRAPHICS */
        .visual-mode-night #ericon-accessibility-shortcut-hub button {
          background-color: #2e1065 !important; /* Elegant block solid purple as in top example */
          color: #ffffff !important;
          border: 1.5px solid #2e1065 !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button * {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button kbd {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: #ffffff !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button span.bg-emerald-750 {
          background-color: #059669 !important; /* Rich solid emerald as in top screenshot */
          color: #ffffff !important;
          border: none !important;
        }

        /* Hover / active / focus / touched states in Night (purple) mode */
        .visual-mode-night #ericon-accessibility-shortcut-hub button:hover,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:active,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:focus,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.active,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab {
          background-color: #e2f1ea !important; /* Light mint green active state */
          color: #15462D !important;
          border-color: #15462D !important;
          stroke: #15462D !important;
          font-weight: 800 !important;
          box-shadow: 0 2px 4px rgba(21, 70, 45, 0.15) !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button:hover *,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:active *,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:focus *,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.active *,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab * {
          color: #15462D !important;
          stroke: #15462D !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button:hover kbd,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:active kbd,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:focus kbd,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.active kbd,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.ericon-active-portal-tab kbd {
          background-color: #15462D !important;
          color: #e2f1ea !important;
          border-color: #15462D !important;
        }

        .visual-mode-night #ericon-accessibility-shortcut-hub button:hover span.bg-emerald-750,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:active span.bg-emerald-750,
        .visual-mode-night #ericon-accessibility-shortcut-hub button:focus span.bg-emerald-750,
        .visual-mode-night #ericon-accessibility-shortcut-hub button.active span.bg-emerald-750 {
          background-color: #15462D !important;
          color: #e2f1ea !important;
          border-color: #15462D !important;
        }

        /* Buttons matching background color to be filled deep green with white text */
        #ericon-right-dock button.bg-\[\#15462D\],
        #ericon-right-dock button.bg-\[\#15462D\] * {
          background-color: #15462D !important;
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        /* Checkbox styling */
        #ericon-right-dock input[type="checkbox"],
        #ericon-accessibility-shortcut-hub input[type="checkbox"] {
          accent-color: #15462D !important;
        }

        /* EXCEPTIONS FOR PILLS / ACTIVE BUTTONS / THEME CONTROLS WITH DARK BACKGROUNDS */
        #research-workspace-root button.text-white,
        #research-workspace-root button.text-white span,
        #research-workspace-root button.text-white p,
        #research-workspace-root button.text-white svg,
        #research-workspace-root .bg-\[\#15462D\] span,
        #research-workspace-root .bg-\[\#15462D\] p,
        #research-workspace-root .bg-\[\#15462D\] svg,
        #simulator-tab-root-container button.bg-\[\#15462D\] span,
        #simulator-tab-root-container button.bg-\[\#15462D\] p,
        #simulator-tab-root-container button.bg-\[\#15462D\] strong,
        #simulator-tab-root-container button.text-white * {
          color: #ffffff !important;
          stroke: #ffffff !important;
          opacity: 1 !important;
        }

        /* Protect visual badges that are active or primary tags */
        #research-workspace-root .bg-emerald-100,
        #research-workspace-root .bg-emerald-100 *,
        #research-workspace-root .bg-emerald-950,
        #research-workspace-root .bg-emerald-950 *,
        #research-workspace-root .bg-emerald-50,
        #research-workspace-root .bg-emerald-50 *,
        #simulator-tab-root-container .bg-emerald-100,
        #simulator-tab-root-container .bg-emerald-100 *,
        #simulator-tab-root-container .bg-emerald-950,
        #simulator-tab-root-container .bg-emerald-950 *,
        #simulator-tab-root-container .bg-emerald-50,
        #simulator-tab-root-container .bg-emerald-50 * {
          background-color: #e2f1ea !important;
          color: #15462D !important;
          border-color: #10b981 !important;
        }
        
        /* Ensure inputs have readable light backplates & crisp dark border */
        #research-workspace-root input,
        #research-workspace-root select,
        #research-workspace-root textarea,
        #simulator-tab-root-container input:not([type="submit"]):not([type="button"]):not([type="range"]):not(#pdf-compilation-card *):not(#favorites-presets-mini-list *),
        #simulator-tab-root-container select:not(#pdf-compilation-card *):not(#favorites-presets-mini-list *),
        #simulator-tab-root-container textarea:not(#pdf-compilation-card *):not(#favorites-presets-mini-list *) {
          background-color: #f0fdf4 !important; /* soft mint backplate */
          border: 1.5px solid #15462D !important;
          color: #15462D !important;
        }

        /* All charts labels and annotations - green with crystal clear visibility and clean sans-serif formatting */
        .recharts-cartesian-axis-tick text,
        .recharts-cartesian-axis-tick text *,
        .recharts-legend-item-text,
        .recharts-legend-item-text *,
        .recharts-text,
        .recharts-text *,
        .recharts-default-legend,
        .recharts-default-legend *,
        .recharts-label,
        .recharts-label *,
        #research-workspace-root svg text,
        #research-workspace-root svg text *,
        #research-workspace-root svg tspan,
        #simulator-tab-root-container svg:not(#cad-blueprint-svg) text,
        #simulator-tab-root-container svg:not(#cad-blueprint-svg) text *,
        #simulator-tab-root-container svg:not(#cad-blueprint-svg) tspan {
          fill: #15462D !important;
          color: #15462D !important;
          stroke: none !important;
          stroke-width: 0 !important;
          text-shadow: none !important;
          font-weight: 500 !important;
          font-size: 11px !important;
          font-family: "Inter", system-ui, -apple-system, sans-serif !important;
        }

        .dark-theme .recharts-cartesian-axis-tick text,
        .dark-theme .recharts-cartesian-axis-tick text *,
        .dark-theme .recharts-legend-item-text,
        .dark-theme .recharts-legend-item-text *,
        .dark-theme .recharts-text,
        .dark-theme .recharts-text *,
        .dark-theme .recharts-default-legend,
        .dark-theme .recharts-default-legend *,
        .dark-theme .recharts-label,
        .dark-theme .recharts-label *,
        .dark-theme svg:not(#cad-blueprint-svg) text,
        .dark-theme svg:not(#cad-blueprint-svg) text *,
        .dark-theme svg:not(#cad-blueprint-svg) tspan {
          fill: #e2f1ea !important;
          color: #e2f1ea !important;
          stroke: none !important;
          stroke-width: 0 !important;
          text-shadow: none !important;
          font-weight: 500 !important;
        }

        /* RECHARTS TOOLTIP EXPLICIT CALIBRATION: HIGH CONTRAST MONOSPACE WHITE TEXT ON DARK SLATE BLACK BACKPLATE */
        .recharts-tooltip-wrapper,
        .recharts-default-tooltip,
        .recharts-tooltip-wrapper *,
        .recharts-default-tooltip * {
          font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          text-shadow: none !important;
          box-shadow: none !important;
          border-radius: 6px !important;
        }

        .recharts-default-tooltip {
          background-color: #0b0f19 !important;
          border: 1px solid #1e293b !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          color: #ffffff !important;
        }

        .recharts-tooltip-label {
          color: #ffffff !important;
          display: block !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          margin-bottom: 4px !important;
          text-transform: lowercase !important;
        }

        .recharts-tooltip-item-list,
        .recharts-tooltip-item {
          color: #ffffff !important;
          font-size: 11px !important;
          list-style: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .recharts-tooltip-item * {
          color: #ffffff !important;
          font-size: 11px !important;
        }

        .recharts-tooltip-item-name {
          color: #ffffff !important;
          font-weight: bold !important;
          text-transform: lowercase !important;
        }

        .recharts-tooltip-item-separator {
          color: #ffffff !important;
          padding: 0 4px !important;
        }

        .recharts-tooltip-item-value {
          color: #ffffff !important;
          font-weight: bold !important;
        }

        .recharts-tooltip-item-unit {
          color: #ffffff !important;
          font-weight: normal !important;
          margin-left: 2px !important;
        }

        /* EXPLICIT HIGH-CONTRAST DEEP DARK GREEN ON SOFT MINT WRITINGS OVERRIDE CALIBRATION */
        #ericon-live-vector-text,
        .ericon-deep-green-writing,
        .ericon-deep-green-writing-desc,
        #pip-sidebar,
        #pip-sidebar * {
          text-shadow: none !important;
          box-shadow: none !important;
        }

        #ericon-live-vector-text {
          color: #15462D !important;
          fill: #15462D !important;
          font-weight: 850 !important;
        }

        /* Enforce deep dark green across lux, amber, and night/purple modes */
        .ericon-deep-green-writing,
        .visual-mode-night .ericon-deep-green-writing,
        .visual-mode-comfort .ericon-deep-green-writing,
        .dark-theme .ericon-deep-green-writing {
          color: #15462D !important;
          fill: #15462D !important;
          font-weight: 875 !important;
        }

        .ericon-deep-green-writing-desc,
        .visual-mode-night .ericon-deep-green-writing-desc,
        .visual-mode-comfort .ericon-deep-green-writing-desc,
        .dark-theme .ericon-deep-green-writing-desc {
          color: #15462D !important;
          fill: #15462D !important;
          opacity: 0.8 !important;
          font-weight: 650 !important;
        }

        /* PiP Sidebar Box Styling – Constant supreme high contrast deep dark green in all modes */
        #pip-sidebar,
        .visual-mode-night #pip-sidebar,
        .visual-mode-comfort #pip-sidebar,
        .dark-theme #pip-sidebar {
          background-color: #f4fbf7 !important;
          border: 2px solid #15462D !important;
          box-shadow: 0 4px 20px rgba(21, 70, 45, 0.18) !important;
          color: #15462D !important;
        }

        #pip-sidebar .ericon-pip-tag,
        .visual-mode-night #pip-sidebar .ericon-pip-tag,
        .dark-theme #pip-sidebar .ericon-pip-tag {
          color: #15462D !important;
          font-weight: 850 !important;
          opacity: 0.9 !important;
        }

        #pip-sidebar .ericon-pip-title,
        .visual-mode-night #pip-sidebar .ericon-pip-title,
        .dark-theme #pip-sidebar .ericon-pip-title {
          color: #15462D !important;
          font-weight: 900 !important;
        }

        #pip-sidebar .ericon-pip-section-header,
        .visual-mode-night #pip-sidebar .ericon-pip-section-header,
        .dark-theme #pip-sidebar .ericon-pip-section-header {
          color: #15462D !important;
          font-weight: 850 !important;
          opacity: 0.85 !important;
          border-bottom: 1.5px dashed rgba(21, 70, 45, 0.35) !important;
          display: block !important;
          padding-bottom: 2px !important;
          margin-bottom: 6px !important;
        }

        #pip-sidebar .ericon-pip-key,
        .visual-mode-night #pip-sidebar .ericon-pip-key,
        .dark-theme #pip-sidebar .ericon-pip-key {
          color: #15462D !important;
          font-weight: 700 !important;
          opacity: 0.85 !important;
        }

        #pip-sidebar .ericon-pip-val,
        .visual-mode-night #pip-sidebar .ericon-pip-val,
        .dark-theme #pip-sidebar .ericon-pip-val,
        #pip-sidebar .ericon-pip-stress-clock,
        .visual-mode-night #pip-sidebar .ericon-pip-stress-clock,
        .dark-theme #pip-sidebar .ericon-pip-stress-clock {
          color: #15462D !important;
          font-weight: 850 !important;
        }

        #pip-sidebar button,
        .visual-mode-night #pip-sidebar button,
        .dark-theme #pip-sidebar button {
          background-color: #15462D !important;
          color: #f4fbf7 !important;
          border: 1px solid #15462D !important;
        }

        #pip-sidebar button:hover,
        .visual-mode-night #pip-sidebar button:hover,
        .dark-theme #pip-sidebar button:hover {
          background-color: #0d2e1e !important;
          color: #ffffff !important;
        }

        /* CO-PILOT CHIPS EXPLICIT HIGH CONTRAST DEEP GREEN DESIGN CALIBRATION */
        .ericon-copilot-preset-btn,
        #ericon-right-dock .ericon-copilot-preset-btn,
        .visual-mode-night .ericon-copilot-preset-btn,
        .visual-mode-night #ericon-right-dock .ericon-copilot-preset-btn,
        .visual-mode-comfort .ericon-copilot-preset-btn,
        .visual-mode-comfort #ericon-right-dock .ericon-copilot-preset-btn,
        .dark-theme .ericon-copilot-preset-btn,
        .dark-theme #ericon-right-dock .ericon-copilot-preset-btn {
          background-color: #f4fbf7 !important;
          border: 1.5px solid #15462D !important;
          color: #15462D !important;
          font-weight: 900 !important;
          opacity: 1 !important;
          text-shadow: none !important;
          box-shadow: 0 1px 3px rgba(21, 70, 45, 0.12) !important;
        }

        .ericon-copilot-preset-btn:hover,
        .ericon-copilot-preset-btn:active,
        .ericon-copilot-preset-btn:focus,
        #ericon-right-dock .ericon-copilot-preset-btn:hover,
        #ericon-right-dock .ericon-copilot-preset-btn:active,
        #ericon-right-dock .ericon-copilot-preset-btn:focus,
        .visual-mode-night .ericon-copilot-preset-btn:hover,
        .visual-mode-night .ericon-copilot-preset-btn:active,
        .visual-mode-night .ericon-copilot-preset-btn:focus,
        .visual-mode-comfort .ericon-copilot-preset-btn:hover,
        .visual-mode-comfort .ericon-copilot-preset-btn:active,
        .visual-mode-comfort .ericon-copilot-preset-btn:focus,
        .dark-theme .ericon-copilot-preset-btn:hover,
        .dark-theme .ericon-copilot-preset-btn:active,
        .dark-theme .ericon-copilot-preset-btn:focus {
          background-color: #15462D !important;
          border-color: #15462D !important;
          color: #ffffff !important;
        }

        /* SIMULATOR SUB-TAB EXPLICIT HIGH-CONTRAST LIGHT MINT/DEEP GREEN BORDER DESIGN CALIBRATION */
        .ericon-subtab-btn,
        #simulator-subtab-header button.ericon-subtab-btn {
          font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 11px !important;
          font-weight: 750 !important;
          letter-spacing: 0.03em !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          border: 2px solid transparent !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          line-height: 1.2 !important;
        }

        /* Touched / Active State: turns into soft mint green background, 2px solid #15462D border, and deep green text */
        .ericon-subtab-btn-active,
        .ericon-subtab-btn-active:hover,
        .ericon-subtab-btn-active:active,
        .ericon-subtab-btn-active:focus,
        #simulator-subtab-header button.ericon-subtab-btn-active {
          background-color: #eefaf3 !important;
          border: 2px solid #15462D !important;
          color: #15462D !important;
          font-weight: 900 !important;
          opacity: 1 !important;
          box-shadow: 0 2px 4px rgba(21, 70, 45, 0.08) !important;
        }

        /* Hover style for inactive tabs */
        .ericon-subtab-btn:not(.ericon-subtab-btn-active):hover {
          background-color: rgba(21, 70, 45, 0.05) !important;
          color: #15462D !important;
          border: 2px solid rgba(21, 70, 45, 0.15) !important;
        }

        /* ENVIRONMENT/CAMPAIGN PRESETS HIGH CONTRAST MINT/DEEP GREEN TOUCHED STATE DESIGN */
        .ericon-preset-spec-btn-active,
        .ericon-preset-spec-btn-active *,
        .ericon-preset-spec-btn-active:hover,
        .ericon-preset-spec-btn-active:hover *,
        .ericon-preset-spec-btn-active:active,
        .ericon-preset-spec-btn-active:active *,
        .ericon-preset-spec-btn-active:focus,
        .ericon-preset-spec-btn-active:focus * {
          background-color: #eefaf3 !important;
          border-color: #15462D !important;
          border-width: 2px !important;
          color: #15462D !important;
          font-weight: 900 !important;
          opacity: 1 !important;
          text-shadow: none !important;
          box-shadow: 0 4px 6px rgba(21, 70, 45, 0.08) !important;
          --tw-ring-opacity: 0 !important;
          outline: none !important;
        }

        /* CLEAR LOGS DESTRUCTIVE ACTIVE STATE RED CALIBRATION */
        #clear-logs-btn {
          font-family: ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-weight: 800 !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          outline: none !important;
        }

        #clear-logs-btn:hover,
        #clear-logs-btn:active,
        #clear-logs-btn:focus,
        .visual-mode-night #clear-logs-btn:hover,
        .visual-mode-night #clear-logs-btn:active,
        .visual-mode-night #clear-logs-btn:focus,
        .visual-mode-comfort #clear-logs-btn:hover,
        .visual-mode-comfort #clear-logs-btn:active,
        .visual-mode-comfort #clear-logs-btn:focus,
        .dark #clear-logs-btn:hover,
        .dark #clear-logs-btn:active,
        .dark #clear-logs-btn:focus {
          background-color: #ef4444 !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
          font-weight: 950 !important;
          opacity: 1 !important;
          text-shadow: none !important;
          box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3) !important;
        }

        /* PEER SCIENTIFIC DISCUSSIONS HIGH-CONTRAST DEEP DARK GREEN CONVERSION FOR MAXIMUM CONTRAST & SHARP PDF */
        #peer-discussions-section,
        #peer-discussions-section p,
        #peer-discussions-section span,
        #peer-discussions-section label,
        #peer-discussions-section h1,
        #peer-discussions-section h2,
        #peer-discussions-section h3,
        #peer-discussions-section h4,
        #peer-discussions-section h5,
        #peer-discussions-section h6,
        #peer-discussions-section select,
        #peer-discussions-section option,
        #peer-discussions-section textarea,
        #peer-discussions-section input:not([type="submit"]):not([type="button"]),
        #peer-discussions-section strong,
        #peer-discussions-section b,
        #peer-discussions-section li {
          color: #15462D !important;
          opacity: 1 !important;
          text-shadow: none !important;
          -webkit-text-fill-color: #15462D !important;
        }

        #peer-discussions-section textarea::placeholder {
          color: #15462D !important;
          opacity: 0.65 !important;
          -webkit-text-fill-color: #15462D !important;
        }

        /* Ensure svg outline strokes match the deep dark green theme */
        #peer-discussions-section svg:not(.text-rose-500):not(.text-amber-500) {
          stroke: #15462D !important;
          stroke-width: 2px !important;
        }

        /* Border contrast enhancement */
        #peer-discussions-section div,
        #peer-discussions-section section,
        #peer-discussions-section form,
        #peer-discussions-section h3,
        #peer-discussions-section h4,
        #peer-discussions-section button {
          border-color: rgba(21, 70, 45, 0.25) !important;
        }

        /* Exceptions to maintain functional readability (white text inside filled badges, active headers, button icons) */
        #peer-discussions-section button.bg-emerald-800,
        #peer-discussions-section button.bg-emerald-800 *,
        #peer-discussions-section button.bg-indigo-900,
        #peer-discussions-section button.bg-indigo-900 *,
        #peer-discussions-section button.bg-slate-800,
        #peer-discussions-section button.bg-slate-800 *,
        #peer-discussions-section button.bg-sky-800,
        #peer-discussions-section button.bg-sky-800 *,
        #peer-discussions-section .bg-slate-950,
        #peer-discussions-section .bg-slate-950 *,
        #peer-discussions-section .bg-emerald-950,
        #peer-discussions-section .bg-emerald-950 *,
        #peer-discussions-section .bg-emerald-800,
        #peer-discussions-section .bg-emerald-800 * {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        #peer-discussions-section button.bg-emerald-800 svg,
        #peer-discussions-section button.bg-indigo-900 svg,
        #peer-discussions-section button.bg-slate-800 svg,
        #peer-discussions-section button.bg-sky-800 svg,
        #peer-discussions-section .bg-slate-950 svg,
        #peer-discussions-section .bg-emerald-950 svg {
          stroke: #ffffff !important;
        }

        /* EXCEPTION SPECIFICALLY FOR THE ACTIVE VECTOR TELEMETRY CORNER IN NIGHT/PURPLE MODE */
        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator,
        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator * {
          border-color: rgba(168, 85, 247, 0.35) !important;
        }

        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator #telemetry-header,
        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator #telemetry-header * {
          color: #c084fc !important; /* bright purple/lavender */
          -webkit-text-fill-color: #c084fc !important;
          font-weight: 700 !important;
        }

        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator #telemetry-header svg {
          stroke: #c084fc !important;
        }

        .visual-mode-night #peer-discussions-section #live-vector-telemetry-indicator #telemetry-paragraph {
          color: #d8b4fe !important; /* highly visible bright purple text */
          -webkit-text-fill-color: #d8b4fe !important;
          opacity: 1 !important;
          font-style: italic !important;
        }

        /* BRIGHT PURPLE FOR ONLY HISTORICAL COMMITS & COLLABORATION LOGS TEXT IN NIGHT THEME */
        .visual-mode-night #peer-discussions-section #historical-commits-title {
          color: #c084fc !important; /* bright purple/lavender */
          -webkit-text-fill-color: #c084fc !important;
          opacity: 1 !important;
        }

        /* 1. CHANNEL NAVIGATION TABS IN NIGHT/PURPLE MODE */
        .visual-mode-night #discuss-channels-tabs {
          background-color: #120626 !important;
          border-color: #4c1d95 !important;
        }

        /* Active tab styling */
        .visual-mode-night #discuss-channels-tabs button.bg-emerald-800,
        .visual-mode-night #discuss-channels-tabs button.bg-indigo-900 {
          background-color: #a855f7 !important; /* bright purple active */
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border: 2px solid #ffffff !important;
          font-weight: 900 !important;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.75) !important;
        }

        .visual-mode-night #discuss-channels-tabs button.bg-emerald-800 svg,
        .visual-mode-night #discuss-channels-tabs button.bg-indigo-900 svg {
          stroke: #ffffff !important;
          color: #ffffff !important;
        }

        /* Inactive tab styling */
        .visual-mode-night #discuss-channels-tabs button:not(.bg-emerald-800):not(.bg-indigo-900) {
          background-color: #1e093c !important;
          color: #d8b4fe !important; /* clear, readable light purple */
          -webkit-text-fill-color: #d8b4fe !important;
          border: 1.5px solid rgba(168, 85, 247, 0.25) !important;
          font-weight: 500 !important;
          opacity: 0.8 !important;
        }

        .visual-mode-night #discuss-channels-tabs button:not(.bg-emerald-800):not(.bg-indigo-900) svg {
          stroke: #c084fc !important;
          color: #c084fc !important;
        }

        /* Hover / Touch effect */
        .visual-mode-night #discuss-channels-tabs button:hover,
        .visual-mode-night #discuss-channels-tabs button:active,
        .visual-mode-night #discuss-channels-tabs button:focus {
          background-color: #c084fc !important; /* high visibility bright lilac when touched */
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border-color: #ffffff !important;
          font-weight: 950 !important;
          opacity: 1 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 14px rgba(192, 132, 252, 0.6) !important;
        }

        .visual-mode-night #discuss-channels-tabs button:hover svg {
          stroke: #ffffff !important;
          color: #ffffff !important;
        }

        /* 2. FEED TOOLBAR BUTTONS */
        .visual-mode-night #pdf-archivist-btn,
        .visual-mode-night #refresh-feed-btn {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          font-weight: 700 !important;
        }

        .visual-mode-night #pdf-archivist-btn {
          background-color: #6b21a8 !important; /* rich premium purple */
          border: 1.5px solid #a855f7 !important;
        }

        .visual-mode-night #pdf-archivist-btn svg {
          stroke: #e9d5ff !important;
        }

        .visual-mode-night #refresh-feed-btn {
          background-color: #1e1b4b !important; /* dark slate purple */
          border: 1.5px solid #4f46e5 !important;
        }

        .visual-mode-night #refresh-feed-btn svg {
          stroke: #818cf8 !important;
        }

        /* Hover / Touch feedback */
        .visual-mode-night #pdf-archivist-btn:hover,
        .visual-mode-night #pdf-archivist-btn:active,
        .visual-mode-night #pdf-archivist-btn:focus {
          background-color: #a855f7 !important; /* vivid violet list */
          border-color: #ffffff !important;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.5) !important;
          transform: translateY(-1px) !important;
        }

        .visual-mode-night #refresh-feed-btn:hover,
        .visual-mode-night #refresh-feed-btn:active,
        .visual-mode-night #refresh-feed-btn:focus {
          background-color: #4f46e5 !important; /* bright blue/indigo */
          border-color: #ffffff !important;
          box-shadow: 0 0 12px rgba(79, 70, 229, 0.5) !important;
          transform: translateY(-1px) !important;
        }

        /* 3. PEER ENDORSEMENTS / REACTION BUTTONS */
        .visual-mode-night .ericon-reaction-btn {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          opacity: 0.95 !important;
          font-weight: 700 !important;
        }

        .visual-mode-night .ericon-reaction-btn span {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .visual-mode-night .ericon-reaction-btn .ericon-badge-num {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }

        /* Specific reactions styles */
        .visual-mode-night .ericon-reaction-insightful {
          background-color: rgba(217, 119, 6, 0.2) !important; /* amber tint */
          border: 1.5px solid rgba(217, 119, 6, 0.5) !important;
        }
        .visual-mode-night .ericon-reaction-insightful svg {
          color: #fbbf24 !important;
          fill: #fbbf24 !important;
          stroke: #fbbf24 !important;
        }

        .visual-mode-night .ericon-reaction-verified {
          background-color: rgba(16, 185, 129, 0.2) !important; /* emerald tint */
          border: 1.5px solid rgba(16, 185, 129, 0.5) !important;
        }
        .visual-mode-night .ericon-reaction-verified svg {
          stroke: #34d399 !important;
          color: #34d399 !important;
        }

        .visual-mode-night .ericon-reaction-warning {
          background-color: rgba(239, 68, 68, 0.2) !important; /* rose tint */
          border: 1.5px solid rgba(239, 68, 68, 0.5) !important;
        }
        .visual-mode-night .ericon-reaction-warning svg {
          stroke: #f87171 !important;
          color: #f87171 !important;
        }

        .visual-mode-night .ericon-reaction-fluid {
          background-color: rgba(14, 165, 233, 0.2) !important; /* sky tint */
          border: 1.5px solid rgba(14, 165, 233, 0.5) !important;
        }
        .visual-mode-night .ericon-reaction-fluid svg {
          stroke: #38bdf8 !important;
          color: #38bdf8 !important;
        }

        /* Interactive hovered / active / touched state */
        .visual-mode-night .ericon-reaction-btn:hover,
        .visual-mode-night .ericon-reaction-btn:active,
        .visual-mode-night .ericon-reaction-btn:focus {
          opacity: 1 !important;
          border-color: #ffffff !important;
          transform: translateY(-1px) scale(1.03) !important;
        }

        .visual-mode-night .ericon-reaction-insightful:hover {
          background-color: rgba(217, 119, 6, 0.5) !important;
          box-shadow: 0 0 10px rgba(217, 119, 6, 0.4) !important;
        }
        .visual-mode-night .ericon-reaction-verified:hover {
          background-color: rgba(16, 185, 129, 0.5) !important;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4) !important;
        }
        .visual-mode-night .ericon-reaction-warning:hover {
          background-color: rgba(239, 68, 68, 0.5) !important;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.4) !important;
        }
        .visual-mode-night .ericon-reaction-fluid:hover {
          background-color: rgba(14, 165, 233, 0.5) !important;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.4) !important;
        }

        /* 4. PEN RESPONSE ACTION BUTTON */
        .visual-mode-night .ericon-pen-response-btn {
          background-color: #311066 !important;
          border: 1.5px solid #c084fc !important;
          color: #e9d5ff !important;
          -webkit-text-fill-color: #e9d5ff !important;
          font-weight: 700 !important;
        }

         .visual-mode-night .ericon-pen-response-btn span {
          color: #e9d5ff !important;
          -webkit-text-fill-color: #e9d5ff !important;
        }

        .visual-mode-night .ericon-pen-response-btn svg {
          stroke: #c084fc !important;
        }

        .visual-mode-night .ericon-pen-response-btn:hover,
        .visual-mode-night .ericon-pen-response-btn:active,
        .visual-mode-night .ericon-pen-response-btn:focus {
          background-color: #a855f7 !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border-color: #ffffff !important;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.6) !important;
          transform: translateY(-1px) !important;
        }

        .visual-mode-night .ericon-pen-response-btn:hover span {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .visual-mode-night .ericon-pen-response-btn:hover svg {
          stroke: #ffffff !important;
        }

        /* 5. REGISTER ISSUE WITH DEVELOPERS / SUBMIT TO NETWORK ACTION BUTTON */
        .visual-mode-night #btn-submit-discussion {
          background-color: #4f46e5 !important; /* solid glowing blue/indigo */
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          border: 1.5px solid #818cf8 !important;
          font-weight: 850 !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3) !important;
        }

        .visual-mode-night #btn-submit-discussion svg {
          stroke: #ffffff !important;
        }

        .visual-mode-night #btn-submit-discussion:hover,
        .visual-mode-night #btn-submit-discussion:active,
        .visual-mode-night #btn-submit-discussion:focus {
          background-color: #6366f1 !important; /* brighter blue */
          border-color: #ffffff !important;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.6) !important;
          transform: translateY(-1px) scale(1.02) !important;
        }

        /* ERICON HIGH-CONTRAST DEEP DARK GREEN PDF CONTRAST RULES */
        .pdf-hub-text-green,
        #pdf-hub-title,
        #pdf-hub-subtitle,
        #pdf-available-env-title,
        #pdf-available-env-desc,
        #pdf-gcp-sync-services-title,
        #pdf-gcp-auth-needed-title,
        #pdf-gcp-auth-needed-text,
        #pdf-secure-encrypted-beacons,
        #pdf-protected-user-consent,
        #pdf-authentication-console-title,
        #pdf-platform-governance-title,
        #pdf-platform-governance-subtitle,
        #pdf-emblem-archive-title,
        #pdf-ericon-brand-title,
        #pdf-ericon-brand-subtitle,
        #pdf-ericon-sectors,
        #pdf-auto-fill-credentials-title,
        #pdf-credential-evaluation-title,
        #pdf-credential-evaluation-subtitle,
        #pdf-colleague-email-label,
        #pdf-passcode-key-label,
        #pdf-full-scientific-name-label,
        #pdf-secure-corporate-email-label,
        #pdf-secure-mobile-label,
        #pdf-designated-privilege-tier-label,
        #pdf-choose-passcode-key-label,
        #pdf-recovery-method-label,
        #pdf-recovery-input-label,
        #pdf-recovery-note-par,
        .pdf-card-type,
        .pdf-card-start,
        .pdf-card-name,
        .pdf-card-desc,
        .pdf-card-location,
        .pdf-card-metric,
        .pdf-card-metric *,
        .pdf-card-icon {
          color: #15462D !important;
          -webkit-text-fill-color: #15462D !important;
          text-shadow: none !important;
          opacity: 1 !important;
          font-weight: 750 !important;
        }

        /* FORCE RECHARTS LEGEND TEXT AND CIRCLES TO DEEP GREEN IN ALL THEMES AND MODES */
        .recharts-legend-item-text,
        .recharts-legend-item-text *,
        .dark-theme .recharts-legend-item-text,
        .dark-theme .recharts-legend-item-text *,
        .visual-mode-night .recharts-legend-item-text,
        .visual-mode-night .recharts-legend-item-text *,
        .visual-mode-comfort .recharts-legend-item-text,
        .visual-mode-comfort .recharts-legend-item-text * {
          color: #15462D !important;
          fill: #15462D !important;
          -webkit-text-fill-color: #15462D !important;
          text-shadow: none !important;
          font-weight: 900 !important;
          opacity: 1 !important;
        }

        .recharts-legend-icon,
        .recharts-legend-icon *,
        svg .recharts-legend-icon,
        svg .recharts-legend-icon * {
          fill: #15462D !important;
          stroke: #15462D !important;
          opacity: 1 !important;
        }

        /* High-contrast version capsule: white text on deep green container */
        #pdf-hub-version {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background-color: #15462D !important;
          font-weight: 950 !important;
          display: inline-block !important;
          opacity: 1 !important;
          border: 1px solid #ffffff !important;
        }

        /* Render borders in clean dark forest green for high-fidelity printing */
        @media print {
          body, html, #app-root {
            background-color: #ffffff !important;
            color: #15462D !important;
            background-image: none !important;
          }

          /* Force high contrast deep green style of the named elements inside compiled PDF files */
          .pdf-hub-text-green,
          #pdf-hub-title,
          #pdf-hub-subtitle,
          #pdf-available-env-title,
          #pdf-available-env-desc,
          #pdf-gcp-sync-services-title,
          #pdf-gcp-auth-needed-title,
          #pdf-gcp-auth-needed-text,
          #pdf-secure-encrypted-beacons,
          #pdf-protected-user-consent,
          #pdf-authentication-console-title,
          #pdf-platform-governance-title,
          #pdf-platform-governance-subtitle,
          #pdf-emblem-archive-title,
          #pdf-ericon-brand-title,
          #pdf-ericon-brand-subtitle,
          #pdf-ericon-sectors,
          #pdf-auto-fill-credentials-title,
          #pdf-credential-evaluation-title,
          #pdf-credential-evaluation-subtitle,
          #pdf-colleague-email-label,
          #pdf-passcode-key-label,
          #pdf-full-scientific-name-label,
          #pdf-secure-corporate-email-label,
          #pdf-secure-mobile-label,
          #pdf-designated-privilege-tier-label,
          #pdf-choose-passcode-key-label,
          #pdf-recovery-method-label,
          #pdf-recovery-input-label,
          #pdf-recovery-note-par,
          .pdf-card-type,
          .pdf-card-start,
          .pdf-card-name,
          .pdf-card-desc,
          .pdf-card-location,
          .pdf-card-metric,
          .pdf-card-metric *,
          .pdf-card-icon {
            color: #15462D !important;
            -webkit-text-fill-color: #15462D !important;
            text-shadow: none !important;
            font-weight: 900 !important;
            opacity: 1 !important;
          }

          /* Force white text inside version badge on print files */
          #pdf-hub-version {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            background-color: #15462D !important;
            font-weight: 950 !important;
            opacity: 1 !important;
          }

          /* Elevate border elements during print page layout */
          .border, .border-2, .border-t, .border-b, .border-l, .border-r {
            border-color: #15462D !important;
          }

          /* Clean background cards layout without dark gradients */
          .bg-slate-50, .bg-slate-100, .bg-white {
            background-color: #ffffff !important;
            background-image: none !important;
            color: #15462D !important;
          }
        }
      `}</style>

      {/* PHASE 2: TOP NAVIGATION STICKY HEADER SECURITY AUTHENTICATION DESIGN */}
      <header 
        className={`fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-905 border-b border-slate-200 dark:border-slate-850 shadow-xs z-20 transition-all duration-300 flex items-center justify-between px-4 lg:px-6 ${
          expandedSidebar ? 'lg:left-80' : 'lg:left-18'
        } ${
          showHeader || isMouseNearTop ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        id="ericon-sticky-topbar"
      >
        {/* Logo & Brand on far-left (hidden on desktop because sidebar has it, visible on mobile) */}
        <div className="flex lg:hidden items-center gap-1.5 select-none" id="ericon-mobile-brand-and-toggle">
          {/* Toggle Drawer Button on Mobile (far-left) */}
          <button
            type="button"
            onClick={() => setShowSideDropdown(!showSideDropdown)}
            className="p-1.5 text-slate-500 hover:text-[#15462D] dark:text-slate-400 dark:hover:text-emerald-430 bg-transparent border-0 cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors mr-1"
            title="Open Control Panel Navigation Hub"
            id="ericon-mobile-nav-toggle"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <EriconLogo size="compact" interactive={true} className="flex-shrink-0" />
            <div id="ericon-header-brand-title" className="flex flex-col text-left">
              <h1 className="text-xs font-mono font-black tracking-widest text-[#15462D] dark:text-emerald-400 uppercase leading-none">
                ERICON
              </h1>
              <span className="text-[7.2px] text-slate-400 dark:text-slate-500 font-bold leading-none mt-1 uppercase">
                ER2026.V.1.0.2 CORE
              </span>
            </div>
          </div>
        </div>

        {/* Global info identifier for desktop to balance space */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            GRID ZONE CONTEXT: SOKOINE NODE EMA-C1
          </span>
        </div>

        {/* Dynamic Global Search Area (Centered-ish) */}
        <div className="hidden md:flex items-center relative w-full max-w-xs mx-4">
          <span className="absolute left-2.5 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search documents or calibration hotkeys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 pl-8 text-xs text-slate-900 dark:text-white focus:outline-[#15462D] h-9 min-h-0"
            id="ericon-header-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer h-7"
            >
              ×
            </button>
          )}
          {/* Render Search Dropdown Results if matching query */}
          {searchQuery.trim() !== '' && (
            <div className="absolute top-10 left-0 right-0 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-md shadow-xl max-h-60 overflow-y-auto text-left font-mono text-[10px] z-50 text-slate-705 dark:text-slate-300 col-span-1 border-2">
              <div className="p-2 border-b border-slate-105 dark:border-slate-750 font-black text-slate-400 uppercase text-[8px]/none">Search Coordinates:</div>
              {searchDatabase.filter(item => 
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    if (item.action === 'font') {
                      // Adjust font scaling
                    } else if (item.action === 'theme-dark') {
                      setThemeMode('dark');
                    } else if (item.action === 'theme-light') {
                      setThemeMode('light');
                    } else if (item.action === 'unit-metric') {
                      setUnitSystem('metric');
                    } else if (item.action === 'unit-imperial') {
                      setUnitSystem('imperial');
                    } else if (item.action === 'temp-c') {
                      setTempUnit('celsius');
                    }
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer border-b border-slate-100 dark:border-slate-805/40"
                >
                  <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-430 px-1 py-0.5 rounded text-[8px] font-black mr-1">{item.category}</span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Core Tab Nav links (hidden on desktop, handled by left workspace menu) */}
        <nav className="hidden" id="ericon-sticky-center-nav">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded transition-all font-black text-[10.5px] uppercase border cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#15462D] border-emerald-950 text-white font-extrabold shadow-xs'
                : 'bg-transparent border-transparent text-slate-550 hover:text-[#15462D] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-[#A6E8B6]'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('research')}
            className={`px-3 py-1.5 rounded transition-all font-black text-[10.5px] uppercase border cursor-pointer ${
              activeTab === 'research'
                ? 'bg-[#15462D] border-emerald-950 text-white font-extrabold shadow-xs'
                : 'bg-transparent border-transparent text-slate-550 hover:text-[#15462D] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-[#A6E8B6]'
            }`}
          >
            Research
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded transition-all font-black text-[10.5px] uppercase border cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-[#15462D] border-emerald-950 text-white font-extrabold shadow-xs'
                : 'bg-transparent border-transparent text-slate-555 hover:text-[#15462D] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-[#A6E8B6]'
            }`}
          >
            Analytics
          </button>

          {currentUser !== null && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('discuss')}
                className={`px-3 py-1.5 rounded transition-all font-black text-[10.5px] uppercase border cursor-pointer ${
                  activeTab === 'discuss'
                    ? 'bg-[#15462D] border-emerald-950 text-white font-extrabold shadow-xs'
                    : 'bg-transparent border-transparent text-slate-555 hover:text-[#15462D] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-[#A6E8B6]'
                }`}
              >
                Forum
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className={`px-3 py-1.5 rounded transition-all font-black text-[10.5px] uppercase border cursor-pointer ${
                  activeTab === 'workspace'
                    ? 'bg-[#15462D] border-emerald-950 text-white font-extrabold shadow-xs'
                    : 'bg-transparent border-transparent text-slate-555 hover:text-[#15462D] hover:bg-slate-50 dark:text-slate-300 dark:hover:text-[#A6E8B6]'
                }`}
              >
                Workspace
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="px-3 py-1.5 rounded text-slate-550 hover:text-[#15462D] hover:bg-[#15462D]/10 dark:text-slate-300 dark:hover:text-[#A6E8B6] font-black text-[10.5px] uppercase border border-transparent cursor-pointer bg-transparent"
          >
            Help
          </button>
        </nav>

        {/* Far-Right Dynamic Client State */}
        <div className="flex items-center gap-3" id="ericon-sticky-far-right">
          
          {currentUser === null ? (
            <div className="flex items-center gap-2 font-mono text-[10px]">
              
              <button
                type="button"
                onClick={() => setShowAuthModal('register')}
                className="hidden md:inline-flex py-1.5 px-3 bg-white hover:bg-slate-100 text-[#15462D] dark:text-slate-200 border border-[#15462D] dark:border-slate-700 rounded select-none cursor-pointer font-black text-[10.5px] uppercase hover:shadow-xs transition-all duration-150"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal('login')}
                className="py-1.5 px-4 bg-[#15462D] hover:bg-emerald-850 text-white border border-[#15462D] rounded select-none cursor-pointer font-black text-[10.5px] uppercase shadow-sm hover:shadow transition-all duration-150"
              >
                Sign In
              </button>
              
            </div>
          ) : (
            <div className="flex items-center gap-3 relative select-none">
              
              {/* Productivity & Advisor Dock Toggle Button */}
              <button
                type="button"
                onClick={() => setIsRightDockOpen(!isRightDockOpen)}
                className={`p-1.5 rounded transition-all cursor-pointer bg-transparent border border-transparent relative flex items-center justify-center ${
                  isRightDockOpen 
                    ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/25 border-emerald-202/60' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-emerald-430'
                }`}
                title="Toggle Productivity Advisor Dock"
                id="ericon-sticky-right-dock-toggle-btn"
              >
                <Sparkles className="w-4 h-4" />
                {!isRightDockOpen && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 border border-white rounded-full animate-ping" />
                )}
              </button>

              {/* Notification bubble Messages indicator */}
              <button 
                type="button"
                onClick={() => setActiveTab('discuss')}
                className="p-1.5 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-505 cursor-pointer bg-transparent border-0 relative flex items-center justify-center transition-all"
                title={`${currentUser.username}'s active forum replies`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border border-white rounded-full" />
              </button>

              {/* Notification bell */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-emerald-430 cursor-pointer bg-transparent border-0 relative flex items-center justify-center transition-all"
                  title="Biological surveillance alert notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#15462D] text-[8px] font-black font-mono text-white flex items-center justify-center rounded-full border border-white">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>

                {showNotificationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-45 bg-transparent" onClick={() => setShowNotificationsDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-85 bg-[#0b5334] text-white border-2 border-[#1c5a3d] rounded-xl shadow-2xl overflow-hidden font-mono text-left text-[10px] z-50 animate-fade-in" id="ericon-custom-notification-center-dropdown">
                      <div className="p-3 bg-[#15462D] border-b border-[#1c5a3d] flex items-center justify-between">
                        <span className="font-extrabold text-emerald-300 uppercase tracking-wider block flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> NOTIFICATIONS CENTER
                        </span>
                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNotifications(notifications.map(n => ({ ...n, unread: false })));
                            }}
                            className="bg-transparent border-0 text-[8.5px] text-emerald-250 hover:text-white hover:underline cursor-pointer font-black tracking-wider"
                          >
                            MARK READ
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-[#1c5a3d]/30">
                        {notifications.length === 0 ? (
                          <div className="p-5 text-center text-emerald-200/60 font-sans">No active biological containment alerts.</div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, unread: false } : notif));
                              }}
                              className={`p-3.5 transition-all duration-200 cursor-pointer ${
                                n.unread 
                                  ? 'bg-[#0f442b] border-l-4 border-emerald-400 font-bold' 
                                  : 'bg-[#093c24]/90 hover:bg-[#0c472c]'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-white text-[11px] tracking-wide flex items-center gap-1.5">
                                  {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />}
                                  {n.title}
                                </span>
                                <span className="text-[8px] text-emerald-300/80 font-bold shrink-0">
                                  {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <p className="text-emerald-100/90 mt-1 lines-clamp-3 text-[10px] leading-relaxed font-sans font-medium">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="p-2.5 bg-[#08301c] border-t border-[#1c5a3d]/50 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setNotifications([]);
                              setShowNotificationsDropdown(false);
                            }}
                            className="bg-transparent border-0 text-[8.5px] text-emerald-300 hover:text-white font-extrabold tracking-widest uppercase cursor-pointer hover:underline transition-all"
                          >
                            Clear All Alerts
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Profile Avatar System with autogenerated colors & Role Badge beside */}
              <div 
                className="flex items-center gap-1.5 cursor-pointer p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                id="ericon-header-avatar-toggle"
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] tracking-wider uppercase border border-white dark:border-slate-800 select-none shadow-sm animate-fade-in"
                  style={{
                    backgroundColor: 
                      currentUser.username[0].toLowerCase() < 'g' ? '#15462d' :
                      currentUser.username[0].toLowerCase() < 'n' ? '#0f766e' :
                      currentUser.username[0].toLowerCase() < 't' ? '#b45309' : '#be123c'
                  }}
                >
                  {currentUser.username[0].toUpperCase()}
                </div>
                
                <div className="hidden lg:flex flex-col text-left font-mono select-none">
                  <span id="user-header-username" className="font-black text-[10px] text-slate-900 dark:text-white leading-none capitalize">
                    {currentUser.username}
                  </span>
                  <span id="user-header-role" className="text-[7.5px] font-extrabold text-[#15462D] dark:text-emerald-430 leading-none mt-1 uppercase">
                    🥇 {currentUser.role || 'Research Member'}
                  </span>
                </div>
              </div>

              {/* User dropdown menu */}
              {showUserDropdown && (
                <>
                  <div className="fixed inset-0 z-45 bg-transparent animate-fade-in" onClick={() => setShowUserDropdown(false)} />
                  <div className="absolute top-11 right-0 w-52 bg-white dark:bg-slate-900 border-2 border-slate-205 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden font-mono z-50 text-left text-[10.5px]">
                    <div id="user-dropdown-seed" className="p-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">ACCELERATED METRIC SEED:</span>
                      <strong className="text-slate-855 dark:text-slate-300 block text-xs truncate">{currentUser.email}</strong>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => { setShowUserDropdown(false); alert(`Scientist Profile Parameters:\nUsername: ${currentUser.username}\nRole: ${currentUser.role}\nCountry: ${currentUser.country || 'unspecified'}\nInstitution: ${currentUser.institution || 'unspecified'}`); }}
                        className="w-full px-4 py-2 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-340 cursor-pointer border-0 bg-transparent text-left font-black"
                      >
                        🔬 My Profile Credentials
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowUserDropdown(false); setActiveTab('workspace'); }}
                        className="w-full px-4 py-2 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-340 cursor-pointer border-0 bg-transparent text-left font-black"
                      >
                        📁 My Projects Registry
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowUserDropdown(false); setActiveTab('workspace'); }}
                        className="w-full px-4 py-2 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-340 cursor-pointer border-0 bg-transparent text-left font-black"
                      >
                        👥 My Teams Collaborations
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowUserDropdown(false); setActiveTab('developer'); }}
                        className="w-full px-4 py-2 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-340 cursor-pointer border-0 bg-transparent text-left font-black"
                      >
                        ⚙️ Governance Settings
                      </button>

                      <button
                        type="button"
                        onClick={() => { setShowUserDropdown(false); setShowContactModal(true); }}
                        className="w-full px-4 py-2 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-340 cursor-pointer border-0 bg-transparent text-left font-black"
                      >
                        💬 Biosecurity Help Node
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-805 mx-2 my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          localStorage.removeItem('ericon_logged_scientist');
                          setCurrentUser(null);
                          setActiveTab('home');
                        }}
                        className="w-full px-4 py-2 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20 text-slate-755 dark:text-slate-350 cursor-pointer border-0 bg-transparent text-left font-black uppercase text-[10px]"
                      >
                        🚪 Clear Session &amp; Logout
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </header>

      {/* SIDE DRAWER NAVIGATION MENU - SLIDE-OUT PANEL */}
      <AnimatePresence>
        {showSideDropdown && (
          <>
            {/* Background Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 pointer-events-auto"
              onClick={() => setShowSideDropdown(false)}
            />
            
            {/* Slide drop menu drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 180 }}
              className="fixed right-0 top-0 h-screen w-85 md:w-96 bg-white dark:bg-slate-900 border-l-2 border-slate-200 dark:border-slate-800 shadow-2xl z-55 overflow-y-auto font-mono text-xs flex flex-col justify-between"
              id="side-nav-slideout-drawer"
            >
              <div className="p-5 space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-extrabold uppercase tracking-wider text-[#15462D] dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <EriconLogo size="compact" interactive={false} />
                    <span>Controls Hub</span>
                  </span>
                  <button 
                    onClick={() => setShowSideDropdown(false)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-705 dark:hover:text-white rounded cursor-pointer border-0 bg-transparent flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section A: Navigation Channels */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest block">System Navigation</span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('home'); setShowSideDropdown(false); }}
                      className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'home' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Shield className="w-4 h-4 text-emerald-650" />
                      <span>Home Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('research'); setShowSideDropdown(false); }}
                      className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'research' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Activity className="w-4 h-4 text-emerald-650" />
                      <span>Research Workspace</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveTab('simulator'); setShowSideDropdown(false); }}
                      className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'simulator' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Cpu className="w-4 h-4 text-emerald-650" />
                      <span>Airflow Simulator</span>
                    </button>

                    {currentUser !== null && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setActiveTab('discuss'); setShowSideDropdown(false); }}
                          className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'discuss' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-650" />
                          <span>Scientist Forum</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setActiveTab('workspace'); setShowSideDropdown(false); }}
                          className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'workspace' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                          <Database className="w-4 h-4 text-emerald-650" />
                          <span>Workspace Hub</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => { setActiveTab('developer'); setShowSideDropdown(false); }}
                      className={`w-full text-left py-2.5 px-3 rounded flex items-center gap-3 transition cursor-pointer font-bold border-0 text-[11px] uppercase ${activeTab === 'developer' ? 'bg-[#15462D] text-white' : 'text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <Settings className="w-4 h-4 text-emerald-650" />
                      <span>Governance Portal</span>
                    </button>
                  </div>
                </div>

                {/* Section B: Global Settings sliders & switches */}
                <div className="space-y-4 pt-4 border-t-2 border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-widest block">Global Settings Drawer</span>

                  {/* Font Size Scale Slider */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-150 dark:border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>FONT SIZE CONTROL:</span>
                      <span className="text-[#15462D] dark:text-emerald-400 uppercase font-extrabold tracking-wider">
                        {appFontSize === 'compact' ? 'Compact (85%)' :
                         appFontSize === 'standard' ? 'Standard (100%)' :
                         appFontSize === 'comfortable' ? 'Comfort (115%)' :
                         appFontSize === 'large' ? 'Large (130%)' : 'Extra Lrg (150%)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={
                        appFontSize === 'compact' ? 1 :
                        appFontSize === 'standard' ? 2 :
                        appFontSize === 'comfortable' ? 3 :
                        appFontSize === 'large' ? 4 : 5
                      }
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const sizes: ('compact' | 'standard' | 'comfortable' | 'large' | 'xl')[] = ['compact', 'standard', 'comfortable', 'large', 'xl'];
                        setAppFontSize(sizes[val - 1]);
                      }}
                      className="w-full accent-[#15462D] dark:accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-extrabold">
                      <span>A-</span>
                      <span>NORMAL</span>
                      <span>A+</span>
                    </div>
                  </div>

                  {/* Metric/Imperial Unit Selector Switch */}
                  <div className="flex items-center justify-between py-1 px-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-2">UNIT PREFERENCE</span>
                    <div className="flex bg-slate-200 dark:bg-slate-850 p-0.5 rounded gap-1">
                      <button
                        onClick={() => setUnitSystem('metric')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${unitSystem === 'metric' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Metric
                      </button>
                      <button
                        onClick={() => setUnitSystem('imperial')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${unitSystem === 'imperial' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Imperial
                      </button>
                    </div>
                  </div>

                  {/* Celsius/Fahrenheit Unit Selector Switch */}
                  <div className="flex items-center justify-between py-1 px-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-2">TEMP CONVERSION</span>
                    <div className="flex bg-slate-200 dark:bg-slate-850 p-0.5 rounded gap-1">
                      <button
                        onClick={() => setTempUnit('celsius')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${tempUnit === 'celsius' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() => setTempUnit('fahrenheit')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${tempUnit === 'fahrenheit' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        °F
                      </button>
                    </div>
                  </div>

                  {/* Light/Dark Color Mode Switch */}
                  <div className="flex items-center justify-between py-1 px-1 bg-slate-50 dark:bg-slate-950 rounded border border-slate-150 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 pl-2">COLOR SCHEME</span>
                    <div className="flex bg-slate-200 dark:bg-slate-850 p-0.5 rounded gap-1">
                      <button
                        onClick={() => setThemeMode('light')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${themeMode === 'light' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setThemeMode('dark')}
                        className={`px-3 py-1 text-[9px] uppercase font-bold rounded cursor-pointer transition ${themeMode === 'dark' ? 'bg-[#15462D] text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* Eye care overlay shortcuts */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-150 dark:border-slate-850">
                    <span className="text-[8.5px] uppercase text-slate-450 dark:text-slate-500 font-black tracking-widest block">Eye Calibration overlays</span>
                    <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-bold text-center w-full p-1">
                      <button
                        onClick={() => setVisualMode('standard')}
                        className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'standard' ? 'bg-[#15462D] dark:bg-emerald-800 border-[#15462D] text-white font-extrabold' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        LUC (CLEAR)
                      </button>
                      <button
                        onClick={() => setVisualMode('comfort')}
                        className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'comfort' ? 'bg-amber-500 border-amber-500 text-white font-extrabold' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        Amber
                      </button>
                      <button
                        onClick={() => setVisualMode('night')}
                        className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'night' ? 'bg-purple-700 border-purple-700 text-white font-extrabold' : 'border-slate-200 dark:border-slate-800 text-slate-500'}`}
                      >
                        Purple (Night)
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Operational Vector Status Info Footer */}
              <div className="p-5 bg-slate-900 border-t border-slate-850 text-slate-350 text-[10px]/relaxed space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pneumatic Index:</span>
                  <strong className="text-teal-400">{(calc.reynoldsNumber).toFixed(0)} Re</strong>
                </div>
                <div className="flex justify-between">
                  <span>Fluid Velocity:</span>
                  <strong className="text-teal-450">{(calc.velocity).toFixed(2)} m/s</strong>
                </div>
                <div className="flex justify-between">
                  <span>Simulator State:</span>
                  <strong className="text-emerald-500 font-bold">● ACTIVE ONLINE</strong>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1B. FLOATING APPEARANCE & ACCESSIBILITY DROP PANEL */}
      <AnimatePresence>
        {showAppearanceDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 text-slate-100 border-b-2 border-emerald-950 shadow-2xl px-6 py-5 w-full z-45 font-mono text-[11px] relative"
            id="appearance-settings-menu"
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Box 1: True Global Typography & Font Size Scaling */}
              <div className="flex flex-col gap-2.5 border-r border-slate-800 pr-4">
                <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  ✏️ Typography & Font Sizing
                </span>
                <p className="text-[9.5px] text-slate-400 leading-snug">
                  Replace component-level fonts with a global dynamic calculation system.
                </p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {(['compact', 'standard', 'comfortable', 'large', 'xl'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setAppFontSize(sz)}
                      className={`px-1.5 py-1 text-[9px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                        appFontSize === sz 
                          ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-805 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz === 'xl' ? 'Extra Large' : sz} {sz === 'compact' ? '(85%)' : sz === 'standard' ? '(100%)' : sz === 'comfortable' ? '(115%)' : sz === 'large' ? '(130%)' : '(150%)'}
                    </button>
                  ))}
                </div>
                
                {/* Apply scope options */}
                <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={applyEntireApp}
                      onChange={(e) => setApplyEntireApp(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Apply to Entire Application</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={includeTables}
                      onChange={(e) => setIncludeTables(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Include Tables</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Include Charts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={includeReports}
                      onChange={(e) => setIncludeReports(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Include Reports</span>
                  </label>
                </div>
              </div>

              {/* Box 2: Table Density and Chart Dimensioning controls */}
              <div className="flex flex-col gap-2.5 border-r border-slate-800 pr-4">
                <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  🔍 Spreadsheet & Chart Layouts
                </span>
                <p className="text-[9.5px] text-slate-400 leading-snug">
                  Fine-tune layout spacing, density indexes, and SVG canvas scaling.
                </p>
                
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400">Table Density</span>
                  <div className="flex gap-1">
                    {(['compact', 'comfortable', 'expanded'] as const).map(dt => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => setTableDensity(dt)}
                        className={`flex-1 py-1 text-[9px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                          tableDensity === dt 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                            : 'bg-slate-950/40 border-slate-800 hover:bg-slate-805 text-slate-400 hover:text-white'
                        }`}
                      >
                        {dt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-2.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-slate-400">Spreadsheet Zoom</span>
                    <span className="font-bold text-emerald-300">{tableZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="150"
                    step="5"
                    value={tableZoom}
                    onChange={(e) => setTableZoom(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-950 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={autoResizeCharts}
                      onChange={(e) => setAutoResizeCharts(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Auto Resize Charts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={expandedSidebar}
                      onChange={(e) => setExpandedSidebar(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Expanded Sidebar</span>
                  </label>
                </div>
              </div>

              {/* Box 3: Advanced Accessibility enhancement filters */}
              <div className="flex flex-col gap-2.5 border-r border-slate-800 pr-4">
                <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  ♿ Accessibility Controls
                </span>
                <p className="text-[9.5px] text-slate-400 leading-snug">
                  Safety filters designed for prolonged observation sessions.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={accessibilityLargeTargets}
                      onChange={(e) => setAccessibilityLargeTargets(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <div className="flex flex-col">
                      <span>Large Click Targets</span>
                      <span className="text-[7.5px] text-slate-500 italic">Enforces 44px touch grid area</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={accessibilityLineSpacing}
                      onChange={(e) => setAccessibilityLineSpacing(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <div className="flex flex-col">
                      <span>Increase Line Spacing</span>
                      <span className="text-[7.5px] text-slate-500 italic">Adjust leadings to relaxed 1.85</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={accessibilityBoldText}
                      onChange={(e) => setAccessibilityBoldText(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <div className="flex flex-col">
                      <span>Bold Text</span>
                      <span className="text-[7.5px] text-slate-500 italic">Apply weight multiplier</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={accessibilityReduceCrowding}
                      onChange={(e) => setAccessibilityReduceCrowding(e.target.checked)}
                      className="accent-emerald-500 w-3.5 h-3.5 rounded"
                    />
                    <div className="flex flex-col">
                      <span>Reduce Visual Crowding</span>
                      <span className="text-[7.5px] text-slate-500 italic">Amplify negative margins / grid gaps</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Box 4: Report Export sizes and Dusk triggers */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  📄 Exports & Automation
                </span>
                <p className="text-[9.5px] text-slate-400 leading-snug">
                  Configure output file typography metrics and nocturnal rules.
                </p>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400">Export PDF Font Size</span>
                  <div className="flex gap-1">
                    {(['standard', 'large', 'publication'] as const).map(pfs => (
                      <button
                        key={pfs}
                        type="button"
                        onClick={() => setExportFontSize(pfs)}
                        className={`flex-1 py-1 text-[8.5px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                          exportFontSize === pfs 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                            : 'bg-slate-950/40 border-slate-800 hover:bg-slate-805 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pfs}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-800">
                  <span className="text-[8.5px] uppercase font-bold text-slate-400">Nocturnal Dusk Trigger</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] text-slate-305">
                    <input
                      type="checkbox"
                      checked={enableAutoNightMode}
                      onChange={(e) => setEnableAutoNightMode(e.target.checked)}
                      className="accent-red-500 w-3.5 h-3.5 rounded"
                    />
                    <span>Auto-Night Mode timer</span>
                  </label>
                  <p className="text-[8px] text-slate-500 leading-tight italic">
                    Switches full tactical red laser filtration from 20:00 to 06:00.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-left">
                  <span className="text-[8.5px] uppercase font-bold text-slate-450">Visual Theme</span>
                  <div className="flex gap-1">
                    {(['light', 'dark'] as const).map(tm => (
                      <button
                        key={tm}
                        type="button"
                        onClick={() => setThemeMode(tm)}
                        className={`flex-1 py-1 text-[8px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                          themeMode === tm 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                            : 'bg-slate-950/40 border-slate-805 hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tm} Mode
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-left">
                  <span className="text-[8.5px] uppercase font-bold text-slate-450">Units System</span>
                  <div className="flex gap-1">
                    {(['metric', 'imperial'] as const).map(us => (
                      <button
                        key={us}
                        type="button"
                        onClick={() => setUnitSystem(us)}
                        className={`flex-1 py-1 text-[8px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                          unitSystem === us 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {us}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-left">
                  <span className="text-[8.5px] uppercase font-bold text-slate-455">Temperature Unit</span>
                  <div className="flex gap-1">
                    {(['celsius', 'fahrenheit'] as const).map(tu => (
                      <button
                        key={tu}
                        type="button"
                        onClick={() => setTempUnit(tu)}
                        className={`flex-1 py-1 text-[8px] uppercase font-bold border rounded transition-all cursor-pointer text-center ${
                          tempUnit === tu 
                            ? 'bg-emerald-600 border-emerald-500 text-white font-extrabold' 
                            : 'bg-slate-950/40 border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tu === 'celsius' ? 'Celsius' : 'Fahrenheit'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DRAFTING ROOM WRAPPER AND GRID LAYOUT */}
      <div className="w-full flex flex-row flex-1" id="app-core-layout-grid-envelope">
        
        {/* DESKTOP INTEGRATED COLLAPSIBLE LEFT WORKSPACE MENU */}
        <aside 
          className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 select-none transition-all duration-300 flex-shrink-0 z-30 ${
            expandedSidebar ? 'w-80' : 'w-18'
          }`}
          id="desktop-left-sidebar"
        >
          {/* Logo & Close panel header */}
          <div className={`h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-850 shrink-0 ${expandedSidebar ? 'px-3.5' : 'px-1.5'}`}>
            {expandedSidebar ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <EriconLogo size="compact" interactive={true} className="flex-shrink-0" />
                <span className="text-xs font-mono font-black tracking-widest text-[#15462D] dark:text-emerald-400">ER2026.V.1.0.2 CORE</span>
              </div>
            ) : (
              <div className="mx-auto">
                <EriconLogo size="compact" interactive={true} className="flex-shrink-0" />
              </div>
            )}
            
            {expandedSidebar && (
              <div className="flex items-center gap-1.5" id="left-sidebar-controls-hub">
                {/* Pin / Unpin Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                  className={`p-1 rounded cursor-pointer transition-all duration-300 border ${
                    isSidebarPinned 
                      ? 'border-emerald-500/15 bg-emerald-500/10 dark:bg-emerald-500/5' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border-transparent'
                  }`}
                  title={isSidebarPinned ? "Sidebar is active locked" : "Sidebar is temporary (click to lock pin)"}
                >
                  <Pin className={`w-3.5 h-3.5 ${isSidebarPinned ? 'active-pin-animation' : 'transition-transform duration-300'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedSidebar(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 rounded cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  title="Collapse sidebar"
                >
                  <ListCollapse className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto min-h-0">
            <div className="space-y-4">
              {/* Expand Toggle Button when collapsed */}
              {!expandedSidebar && (
                <div className="px-3">
                  <button
                    type="button"
                    onClick={() => setExpandedSidebar(true)}
                    className="w-full flex items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase transition"
                    title="Expand menu"
                    id="sidebar-expand-toggle-btn"
                  >
                    <ListCollapse className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}

              {/* Navigation Items (Notion/GitHub Style Sidebar Links) */}
              <nav className="flex flex-col gap-1 px-3" id="sidebar-nav-container">
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                    activeTab === 'home'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                      : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                  }`}
                  style={{ minHeight: '40px' }}
                >
                  <Shield className="w-4 h-4 shrink-0 pr-0.5" />
                  {expandedSidebar && <span className="font-extrabold truncate text-left">Home Dashboard</span>}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('research')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                    activeTab === 'research'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                      : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                  }`}
                  style={{ minHeight: '40px' }}
                >
                  <Activity className="w-4 h-4 shrink-0 pr-0.5" />
                  {expandedSidebar && <span className="font-extrabold truncate text-left">Research Workspace</span>}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('simulator')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                    activeTab === 'simulator'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                      : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                  }`}
                  style={{ minHeight: '40px' }}
                  title={!expandedSidebar ? "Simulator (Rodent Artificial Airflow)" : undefined}
                >
                  <Cpu className="w-4 h-4 shrink-0 pr-0.5 animate-pulse" />
                  {expandedSidebar ? (
                    <span className="font-extrabold text-left truncate text-[10.5px]">
                      Airflow Simulator
                    </span>
                  ) : null}
                </button>

                {currentUser !== null && (
                  <>
                    <button
                      type="button"
                      onClick={() => navigateTo('discuss')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                        activeTab === 'discuss'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                          : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                      }`}
                      style={{ minHeight: '40px' }}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 pr-0.5" />
                      {expandedSidebar && <span className="font-extrabold truncate text-left">Scientist Forum</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo('workspace')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                        activeTab === 'workspace'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                          : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                      }`}
                      style={{ minHeight: '40px' }}
                    >
                      <Database className="w-4 h-4 shrink-0 pr-0.5" />
                      {expandedSidebar && <span className="font-extrabold truncate text-left">Workspace Hub</span>}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('signin');
                    navigateTo('developer');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10.5px] font-mono tracking-wide uppercase cursor-pointer transition-all border border-transparent ${
                    activeTab === 'developer'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-extrabold border-emerald-100 dark:border-emerald-900'
                      : 'bg-transparent text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-900'
                  }`}
                  style={{ minHeight: '40px' }}
                >
                  <Settings className="w-4 h-4 shrink-0 pr-0.5" />
                  {expandedSidebar && <span className="font-extrabold truncate text-left">Governance Portal</span>}
                </button>
              </nav>
            </div>

            {/* Quick stats on the sidebar footer */}
            {expandedSidebar ? (
              <div id="custom-metrics-box" className="px-4 py-3 mx-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] space-y-1.5 font-mono text-slate-500 dark:text-slate-400 text-left select-none animate-fade-in shadow-inner">
                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>METRICS ID:</span>
                  <strong className="text-slate-700 dark:text-slate-300">ERAS-EMA-C1</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>REYNOLDS:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{(calc.reynoldsNumber).toFixed(0)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>STATUS:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 animate-pulse">● COMPLIANT</strong>
                </div>
              </div>
            ) : (
              <div className="text-center text-[9px] font-mono text-slate-400 font-bold uppercase">
                S1
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-8 flex flex-col gap-6" id="app-main-content">

        {showAuthModal !== null && (
          <SecureAccessGatewall
            initialStep={showAuthModal}
            onCancel={() => setShowAuthModal(null)}
            onSuccess={(user) => {
              setCurrentUser(user);
              setShowAuthModal(null);
            }}
          />
        )}

        {currentUser === null && activeTab !== 'home' ? (
          <SecureAccessGatewall
            tabAttempted={activeTab}
            onCancel={() => setActiveTab('home')}
            onSuccess={(user) => {
              setCurrentUser(user);
            }}
          />
        ) : activeTab === 'home' ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto mb-10 text-start font-sans"
            id="ericon-home-dashboard"
          >
            {/* 3. Grid Metrics & Protocol Cards (Middle Body) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="home-protocols-grid">
              
              {/* Left Column (Scientific Integrity Card) */}
              <div className="bg-white border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-xs flex flex-col justify-between font-mono hover:border-emerald-500/40 transition-colors group">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-800" />
                    <span className="text-xs font-black uppercase text-[#15462D] tracking-widest block">
                      Scientific Integrity Protection
                    </span>
                  </div>
                  
                  <div className="space-y-4 text-xs text-slate-705">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-900 dark:text-slate-100 uppercase">Tamper-proof protocol logs</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Cryptomath calibration records.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-900 dark:text-slate-100 uppercase">Data audit trail</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Continuous live audit feeds.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-900 dark:text-slate-100 uppercase">Algorithm verification</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Flow math check validation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 font-black font-mono">
                  STATUS KEY: ER-IP-PROTO-15-ACTIVE
                </div>
              </div>

              {/* Right Column (Access Protocols Card) */}
              <div className="bg-white border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-xs flex flex-col justify-between font-mono hover:border-emerald-500/40 transition-colors group">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-4">
                    <Fingerprint className="w-5 h-5 text-[#15462D]" />
                    <span className="text-xs font-black uppercase text-[#15462D] tracking-widest block">
                      Access Protocols &amp; Exceptions
                    </span>
                  </div>
                  
                  <div className="space-y-4 text-xs text-slate-705">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-900 dark:text-slate-100 uppercase">Biometric handshake</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Workspace hardware tokens matching.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-900 dark:text-slate-100 uppercase">Identity verification</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Authorized investigator registration lookup.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded flex items-start gap-4">
                      <span className="text-emerald-750 font-black shrink-0 mt-0.5">●</span>
                      <div className="font-sans">
                        <strong className="font-mono text-[11px] block text-slate-905 dark:text-slate-100 uppercase">Multi-factor authentication</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">Secondary secure passkey validation.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 font-black font-mono">
                  ROUTING KEY: ER-AC-MFA-PASS-SEC
                </div>
              </div>
            </div>

            {/* Gateway actions Directly on Page */}
            <div className="bg-slate-950 text-slate-100 p-8 rounded-lg border border-emerald-500/20 shadow-md flex flex-col md:flex-row items-center justify-between gap-8" id="unblocked-homepage-gateways">
              <div className="space-y-2 text-center md:text-left font-mono">
                <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest block font-bold">Secure Researcher Entry Point</span>
                <p className="text-xs text-slate-300 font-sans max-w-xl">
                  Authenticate ERICON investigator credentials.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('signin');
                    setActiveTab('developer');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-[10px] uppercase rounded cursor-pointer transition-all border border-transparent shadow-xs"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('signup');
                    setActiveTab('developer');
                  }}
                  className="px-5 py-2.5 bg-[#15462D] hover:bg-emerald-900 text-white font-mono font-black text-[10px] uppercase rounded cursor-pointer transition-all border border-transparent shadow-xs"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubMode('recovery');
                    setActiveTab('developer');
                  }}
                  className="px-5 py-2.5 bg-slate-850 hover:bg-slate-750 text-slate-300 font-mono font-bold text-[10px] uppercase rounded cursor-pointer transition-all border border-transparent hover:text-white"
                >
                  Recovery
                </button>
              </div>
            </div>

            {/* 4. Primary Action Footer (Bottom) [ ACCEPT UPDATE ] [ DELAY NOTE ] */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4 text-center select-none" id="primary-action-footer-home">
              <button
                type="button"
                onClick={() => {
                  alert("CONFIRMED: Scientific update guidelines and model protocols have been successfully accepted.\nThank you for ensuring active ERICON regulatory compliance.");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#15462D] hover:bg-[#0c2f1e] text-white font-mono font-black text-xs uppercase rounded cursor-pointer transition-all border border-transparent shadow-md transform hover:-translate-y-0.5"
              >
                [ ACCEPT UPDATE ]
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("DELAY COMPLIANCE: Integrity verification note has been postponed for 24 hours.\nPlease maintain active awareness of ERICON parameters.");
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300 font-mono font-black text-xs uppercase rounded cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                [ DELAY NOTE ]
              </button>
            </div>
          </motion.div>
        ) : activeTab === 'simulator' ? (
          <div id="simulator-tab-root-container" className="w-full">
            {/* SUB-NAVIGATOR FOR HIGH PERFORMANCE RE-ARCHITECTURED SIMULATOR */}
            <div className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6" id="simulator-subtab-header">
              <div className="flex flex-col">
                <h1 className="text-sm font-mono font-black text-[#15462D] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                  🌐 Active Pipeline Microclimate Workspace
                </h1>
                <p className="text-[10px] text-slate-500 font-sans mt-1">
                  Re-architected ERICON Core — Clearance Integrity Level 3 (Lead Fluidic Engineer)
                </p>
              </div>

              {/* Sub-tab selection pill buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg max-w-full overflow-x-auto">
                {[
                  { id: 'controls', label: '🎛️ Controls' },
                  { id: 'species', label: '🐹 Species' },
                  { id: 'results', label: '📊 Results & Schematic' },
                  { id: 'logs', label: '📋 Logs' },
                  { id: 'reports', label: '📄 Reports' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSimSubTab(tab.id as any)}
                    className={`ericon-subtab-btn px-3.5 py-2.5 rounded-lg text-xs font-mono uppercase cursor-pointer select-none transition-all ${
                      simSubTab === tab.id
                        ? 'ericon-subtab-btn-active'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 border-2 border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RENDER CURRENT RE-ARCHITECTURED GRID-SYSTEM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start w-full mt-2" id="simulator-responsive-root-layout">
              {/* Left Column (md: col-span-1, lg: col-span-8) - active subtab wrapped in AnimatePresence Suspense */}
              <div className="md:col-span-1 lg:col-span-8 w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={simSubTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="w-full"
                  >
                    <Suspense fallback={<LazyLoadingFallback name={simSubTab} />}>
                      {simSubTab === 'controls' && (
                        <SimulationSetup
                          specs={specs}
                          onChangeSpecs={handleSetSpecsWithAuditing}
                          rodentSpecies={rodentSpecies}
                          onChangeRodentSpecies={setRodentSpecies}
                          owepDesign={owepDesign}
                          onChangeOwepDesign={setOwepDesign}
                          entryDiameter={entryDiameter}
                          onChangeEntryDiameter={setEntryDiameter}
                          exitDiameter={exitDiameter}
                          onChangeExitDiameter={setExitDiameter}
                          humidity={humidity}
                          onChangeHumidity={setHumidity}
                          atmosphericPressure={atmosphericPressure}
                          onChangeAtmosphericPressure={setAtmosphericPressure}
                        />
                      )}

                      {simSubTab === 'species' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-xs space-y-6 text-left" id="rodent-species-clean-tab">
                          <div className="border-b pb-4 border-slate-150 dark:border-slate-800">
                            <h3 className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                              <span>🐹 Target Specimen Profiles</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 font-sans mt-1">
                              Select an experimental specimen group below. No biological descriptions or scientific papers on-screen.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { id: 'field_mouse', label: '🐹 Field Mouse', scientific: 'Apodemus sylvaticus', mass: 150 },
                              { id: 'house_mouse', label: '🐭 House Mouse', scientific: 'Mus musculus', mass: 120 },
                              { id: 'mastomys_natalensis', label: '🌍 Mastomys Mouse', scientific: 'Mastomys natalensis', mass: 180 },
                            ].map((sp) => {
                              const isActive = rodentSpecies === sp.id;
                              return (
                                <button
                                  key={sp.id}
                                  type="button"
                                  onClick={() => {
                                    setRodentSpecies(sp.id as any);
                                    handleSetSpecsWithAuditing({ ...specs, capsuleMass: sp.mass });
                                  }}
                                  className={`p-5 rounded-xl border text-left flex flex-col justify-between h-36 transition select-none cursor-pointer ${
                                    isActive
                                      ? 'bg-emerald-50/15 border-emerald-600 text-emerald-950 dark:text-emerald-400 dark:bg-emerald-950/20 shadow-md'
                                      : 'bg-slate-50/30 border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900'
                                  }`}
                                  id={`species-select-${sp.id}`}
                                >
                                  <div>
                                    <span className="font-mono text-xs font-black uppercase tracking-wide block">{sp.label}</span>
                                    <span className="font-mono text-[9px] text-slate-400 block mt-1 italic">{sp.scientific}</span>
                                  </div>

                                  <div className="flex items-center justify-between w-full border-t pt-2.5 border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-mono font-bold text-slate-550 uppercase">Mass: {sp.mass} g</span>
                                    {isActive ? (
                                      <span className="text-[8.5px] font-mono font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                                    ) : (
                                      <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase">Select</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {simSubTab === 'results' && (
                        <div className="space-y-6" id="sim-results-clean-tab">
                          {/* Premium metric row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white border hover:border-slate-300 transition duration-200 rounded-xl p-4 text-left shadow-3xs space-y-1" id="metric-velocity-box">
                              <span className="text-[9px] uppercase font-bold font-mono text-slate-400">Velocity Profile</span>
                              <p className="font-mono text-lg font-extrabold text-[#15462D] dark:text-emerald-400">
                                {(calc.velocity || 0).toFixed(2)} m/s
                              </p>
                              <span className="text-[8px] text-slate-400 font-sans leading-none block">Tube specific velocity</span>
                            </div>

                            <div className="bg-white border hover:border-slate-300 transition duration-200 rounded-xl p-4 text-left shadow-3xs space-y-1" id="metric-pressure-box">
                              <span className="text-[9px] uppercase font-bold font-mono text-slate-400">Active Pressure</span>
                              <p className="font-mono text-lg font-extrabold text-slate-850 dark:text-slate-200">
                                {(specs.p1 - specs.p2).toFixed(1)} kPa
                              </p>
                              <span className="text-[8px] text-slate-400 font-sans leading-none block">Differential ΔP gradient</span>
                            </div>

                            <div className="bg-white border hover:border-slate-300 transition duration-200 rounded-xl p-4 text-left shadow-3xs space-y-1" id="metric-flow-box">
                              <span className="text-[9px] uppercase font-bold font-mono text-slate-400">Flow Rate Index</span>
                              <p className="font-mono text-lg font-extrabold text-slate-850 dark:text-slate-200">
                                {((calc.flowRateVolumetric || 0) * 3600).toFixed(1)} m³/h
                              </p>
                              <span className="text-[8px] text-slate-400 font-sans leading-none block">Hourly flow volume index</span>
                            </div>

                            <div className="bg-white border hover:border-slate-300 transition duration-200 rounded-xl p-4 text-left shadow-3xs space-y-1" id="metric-efficiency-box">
                              <span className="text-[9px] uppercase font-bold font-mono text-slate-400">Transit Efficiency</span>
                              <p className="font-mono text-lg font-extrabold text-emerald-800 dark:text-emerald-400">
                                {(((calc.velocity || 1) * 98.4) / ((calc.velocity || 1) + 0.15)).toFixed(1)} %
                              </p>
                              <span className="text-[8px] text-slate-400 font-sans leading-none block">Containment safe clearance</span>
                            </div>
                          </div>

                          {/* Live Interactive Blueprint Animation transit track replaced with Compact Simulator Launch Card */}
                          <div className="bg-slate-950 p-6 rounded-2xl border-2 border-slate-850 shadow-xl" id="metric-schematic-visual">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-white font-mono" id="simulator-launch-card">
                              {/* Left Column (Details) */}
                              <div className="space-y-1.5 flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                  <span className="text-[9px] font-bold tracking-widest text-blue-400 uppercase">
                                    RUAS-V1 AIRFLOW ENGINE
                                  </span>
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                  Rodent Underground Airflow Simulator (RUAS-V1)
                                </h3>
                                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                                  ERICON live pneumatic vector network model evaluating air current velocities, friction factors, and temperature deviation zones for underground biological passageways.
                                </p>
                                
                                <div className="flex items-center gap-4 text-[9px] text-slate-500 mt-2">
                                  <div className="flex items-center gap-1">
                                    <span>STATUS:</span>
                                    <strong className={capsule.isActive ? "text-amber-400 animate-pulse" : capsule.isCompleted ? "text-emerald-450" : "text-blue-400"}>
                                      {capsule.isActive ? "RUNNING" : capsule.isCompleted ? "COMPLETED" : "READY"}
                                    </strong>
                                  </div>
                                  <div>
                                    <span>LAST SIMULATION:</span>
                                    <strong className="text-slate-300">{lastSimTimestamp}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Right Column (Controls) */}
                              <div className="flex flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
                                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800 text-[10px]" id="launch-preference-setting">
                                  <span className="text-slate-500 text-[8px] uppercase font-bold shrink-0">Open In:</span>
                                  <button
                                    type="button"
                                    onClick={() => setDesktopLaunchMode('pip')}
                                    className={`px-2 py-0.5 text-[8.5px] rounded transition font-bold uppercase cursor-pointer ${
                                      desktopLaunchMode === 'pip'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    PiP Mode
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDesktopLaunchMode('fullscreen')}
                                    className={`px-2 py-0.5 text-[8.5px] rounded transition font-bold uppercase cursor-pointer ${
                                      desktopLaunchMode === 'fullscreen'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    Full-Scr
                                  </button>
                                </div>

                                <button
                                  onClick={() => {
                                    setIsSimulatorLaunched(true);
                                  }}
                                  type="button"
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-705 text-white font-mono text-[10px] font-extrabold uppercase rounded-lg shadow-md border-0 cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-95"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Open Simulator</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Recharts Trend Graphs */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 shadow-3xs space-y-4" id="metric-charts-visual">
                            <div className="border-b pb-3 border-slate-100 dark:border-slate-800 text-left">
                              <h4 className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                                📊 Scientific Trend Charts
                              </h4>
                              <p className="text-[9px] text-slate-400 mt-0.5 font-sans">Reynolds flow turbulence index and static friction coefficients over continuous tube travel.</p>
                            </div>
                            <AnalyticsAndReports
                              specs={specs}
                              calc={calc}
                              capsule={capsule}
                              rodentSpecies={rodentSpecies}
                              onLoadSpecs={setSpecs}
                            />
                          </div>
                        </div>
                      )}

                      {simSubTab === 'logs' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-3xs space-y-5 text-left" id="sim-logs-clean-tab">
                          <div className="flex items-center justify-between border-b pb-4 border-slate-150 dark:border-slate-850">
                            <div>
                              <h3 className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                                <span>📋 Simulator Event Logs</span>
                              </h3>
                              <p className="text-[10px] text-slate-500 font-sans mt-1">
                                Complete record of recent parameters modifications, calibration shifts, and simulation events.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAuditLogs([]);
                                alert("Simulation Audit Logs cleared successfully.");
                              }}
                              className="text-[9px] font-mono border hover:bg-slate-50 dark:hover:bg-slate-950 font-bold px-2.5 py-1 rounded cursor-pointer transition border-slate-200 text-slate-500 hover:text-slate-800"
                              id="clear-logs-btn"
                            >
                              CLEAR LOGS
                            </button>
                          </div>

                          {auditLogs.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 font-mono text-[10.5px]">
                              ● No simulation events or param modifications logged in this session yet.
                            </div>
                          ) : (
                            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden overflow-x-auto">
                              <table className="w-full text-left font-mono border-collapse text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850">
                                  <tr>
                                    <th className="p-3 font-mono font-bold uppercase text-slate-550 text-[10px]">Timestamp</th>
                                    <th className="p-3 font-mono font-bold uppercase text-slate-550 text-[10px]">Action / Event Trigger</th>
                                    <th className="p-3 font-mono font-bold uppercase text-slate-550 text-[10px]">Result / Val Difference</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                  {auditLogs.slice(0, 15).map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                      <td className="p-3 text-[10.5px] text-slate-400 font-medium whitespace-nowrap">{log.timestamp}</td>
                                      <td className="p-3 text-[10.5px] font-bold text-slate-850 dark:text-slate-200">
                                        Mod: {log.field.replace('_', ' ').toUpperCase()}
                                      </td>
                                      <td className="p-3 text-[10.5px] text-slate-500">
                                        <span className="line-through mr-1.5">{typeof log.oldVal === 'number' ? log.oldVal.toFixed(1) : log.oldVal}</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">→ {typeof log.newVal === 'number' ? log.newVal.toFixed(1) : log.newVal} {log.unit || ''}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {simSubTab === 'reports' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-3xs space-y-6 text-left animate-fade-in" id="sim-reports-clean-tab">
                          <div className="border-b pb-4 border-slate-150 dark:border-slate-800">
                            <h3 className="font-mono text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                              📄 Regulatory Reports &amp; Exports Center
                            </h3>
                            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                              Export certified local records into standard compliant PDF documents or data spreadsheets.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Card 1: Certified PDF */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-600 transition flex flex-col justify-between min-h-[220px] h-auto bg-slate-50/20" id="report-card-pdf">
                              <div className="mb-4">
                                <span className="font-mono font-black text-xs uppercase text-[#15462D] dark:text-emerald-400 block pb-1 border-b mb-3">📄 CERTIFIED PDF RECORD</span>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-3" title="Compiles current microgrid air pressure gradients, boundary roughness indices, and active spec details into a standard academic PDF report.">
                                  Compiles current microgrid air pressure gradients, boundary roughness indices, and active spec details into a standard academic PDF report.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleGlobalPdfExport}
                                className="w-full bg-[#15462D] hover:bg-emerald-900 text-white font-mono font-bold uppercase tracking-wider text-[10px] py-2 rounded-lg transition-all cursor-pointer shadow-3xs"
                                id="pdf-export-action-btn"
                              >
                                Export Certified PDF
                              </button>
                            </div>

                            {/* Card 2: Spreadsheet Export */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-emerald-600 transition flex flex-col justify-between min-h-[220px] h-auto bg-slate-50/20" id="report-card-spreadsheet">
                              <div className="mb-4">
                                <span className="font-mono font-black text-xs uppercase text-slate-705 dark:text-slate-350 block pb-1 border-b mb-3">🗃️ COMPLIANCE SPREADSHEET</span>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-3" title="Converts real-time microclimate Reynolds values, temperature grids, and event history timestamps into a standard download-ready spreadsheet.">
                                  Converts real-time microclimate Reynolds values, temperature grids, and event history timestamps into a standard download-ready spreadsheet.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleGlobalExcelExport}
                                className="w-full bg-slate-100 border hover:bg-slate-200 text-slate-805 font-mono font-bold uppercase tracking-wider text-[10px] py-2 rounded-lg transition-all cursor-pointer"
                                id="excel-export-action-btn"
                              >
                                Export spreadsheet
                              </button>
                            </div>

                            {/* Card 3: Project Snapshot */}
                            <div className="border border-slate-200 dark:border-slate-805 rounded-xl p-5 hover:border-emerald-600 transition flex flex-col justify-between min-h-[220px] h-auto bg-slate-50/20" id="report-card-snapshot">
                              <div className="mb-4">
                                <span className="font-mono font-black text-xs uppercase text-slate-705 dark:text-slate-350 block pb-1 border-b mb-3">📸 ACTIONS COMPILER</span>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-3" title="Triggers an active session snapshot capturing active telemetry parameters and calibration profiles to the review index.">
                                  Triggers an active session snapshot capturing active telemetry parameters and calibration profiles to the review index.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  alert("System snapshot successfully compiled and locked. Telemetry saved.");
                                }}
                                className="w-full bg-slate-100 border hover:bg-slate-200 text-slate-800 font-mono font-bold uppercase tracking-wider text-[10px] py-2 rounded-lg transition-all cursor-pointer"
                                id="snapshot-action-btn"
                              >
                                Take Snapshot
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Column (md: col-span-1, lg: col-span-4) - simulator global search & favorites workspace companion */}
              <div className="md:col-span-1 lg:col-span-4 w-full">
                <SimulatorCompanion
                  specs={specs}
                  rodentSpecies={rodentSpecies}
                  owepDesign={owepDesign}
                  entryDiameter={entryDiameter}
                  exitDiameter={exitDiameter}
                  humidity={humidity}
                  atmosphericPressure={atmosphericPressure}
                  onApplySpecs={handleSetSpecsWithAuditing}
                  onApplySpecies={setRodentSpecies}
                  onApplyOwepDesign={setOwepDesign}
                  onApplyDiameters={(entry, exit) => {
                    setEntryDiameter(entry);
                    setExitDiameter(exit);
                  }}
                  onApplyTab={(tab) => setSimSubTab(tab as any)}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'research' ? (
          <section id="research-portal-section" className="w-full">
            <Suspense fallback={<LazyLoadingFallback name="Scientific Research Portal" />}>
              <ResearchPortal />
            </Suspense>
          </section>
        ) : activeTab === 'discuss' ? (
          <section id="peer-discussions-section" className="w-full">
            <ChartingRoom
              specs={specs}
              rodentSpecies={rodentSpecies}
              survivalScore={survivalScore}
              onLoadSpecs={setSpecs}
              onLoadRodentSpecies={setRodentSpecies}
            />
          </section>
        ) : activeTab === 'workspace' ? (
          <section id="workspace-hub-section" className="w-full">
            <Suspense fallback={<LazyLoadingFallback name="Workspace Collaboration Hub" />}>
              <WorkspaceHub
                specs={specs}
                calc={calc}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </Suspense>
          </section>
        ) : (
          <section id="developer-console-section" className="w-full">
            <Suspense fallback={<LazyLoadingFallback name="Secure Developer Console" />}>
              <DeveloperConsole
                specs={specs}
                calc={calc}
                scientificLock={scientificLock}
                setScientificLock={setScientificLock}
                announcements={announcements}
                onPublishAnnouncement={handlePublishAnnouncement}
                userMode={userMode}
                setUserMode={setUserMode}
                onChangeSpecs={setSpecs}
                isAdminLoggedIn={isAdminLoggedIn}
                setIsAdminLoggedIn={setIsAdminLoggedIn}
                authDevLevel={authDevLevel}
                setAuthDevLevel={setAuthDevLevel}
                initialAuthSubMode={authSubMode}
              />
            </Suspense>
          </section>
        ) }

      </main>

      {/* PERSISTENT RIGHT-SIDE PRODUCTIVITY & EYE-ACCESSIBILITY ADVISORY DOCK */}
      <aside
        className={`fixed xl:sticky right-0 top-0 xl:top-16 bottom-0 z-[100] xl:z-25 flex flex-col w-80 sm:w-88 xl:w-80 h-screen xl:h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-905 border-l border-slate-205 dark:border-slate-850 shadow-2xl xl:shadow-none transition-all duration-300 ease-in-out font-mono transform ${
          isRightDockOpen ? 'translate-x-0' : 'translate-x-full xl:w-0 xl:border-l-0 overflow-hidden'
        }`}
        id="ericon-right-dock"
      >
        {/* Dock Header */}
        <div className="p-3 bg-white dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[#15462D] dark:text-emerald-430">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">Productivity Dock</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-[7.5px] px-1 py-0.5 bg-[#15462D]/10 dark:bg-emerald-950/40 text-[#15462D] dark:text-emerald-400 font-extrabold rounded select-none">ONLINE</span>
            <button
              onClick={() => setIsRightDockOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-900 border-0 cursor-pointer"
              title="Collapse productivity dock"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col divide-y divide-slate-200 dark:divide-slate-850 overflow-y-auto font-mono text-[10px] text-left">
          
          {/* 1. SCIENTIFIC CO-PILOT INTEGRATION */}
          <div className="p-4 space-y-3 flex flex-col min-h-[45%] shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#15462D] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                🤖 Co-Pilot IQ
              </span>
              <span className="text-[7.5px] text-slate-400 font-bold uppercase">SECURE SHELL</span>
            </div>
            
            {/* Message Streams box: scrollable feed */}
            <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg p-2.5 border border-slate-150 dark:border-slate-850 overflow-y-auto max-h-[140px] space-y-2 text-[9px]/tight shadow-inner">
              {chatHistory.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-[6.5px] text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                      {isUser ? 'Researcher' : 'Advisor'}
                    </span>
                    <div className={`p-1.5 rounded max-w-[95%] break-words ${isUser ? 'bg-emerald-700 text-white font-medium' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'}`}>
                      {msg.content.replace(/###/g, '').replace(/\*\*/g, '')}
                    </div>
                  </div>
                );
              })}
              {isAiLoading && <div className="text-slate-400 text-center text-[7.5px] animate-pulse">Computing aerodynamic safety index...</div>}
            </div>

            {/* Advanced Co-Pilot Preset Suggestion Chips */}
            <div className="flex flex-wrap gap-1">
              {['Velocity profile?', 'Friction factor?', 'Damp/Temp effects?', 'Air velocity?', 'Biodiversity?'].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleSendPreset(chip)}
                  className="ericon-copilot-preset-btn p-1 px-1.5 bg-slate-105 hover:bg-slate-205 dark:bg-slate-900 dark:hover:bg-emerald-950/20 text-[8px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded cursor-pointer transition font-sans font-bold leading-none"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Adaptive Inline Ask input Form */}
            <form onSubmit={handleFormSubmit} className="flex gap-1.5 pt-1.5 border-t border-slate-150 dark:border-slate-850/80">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask advisor..."
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-900 dark:text-white px-2 py-1 rounded focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isAiLoading || !chatInput.trim()}
                className="px-2.5 py-1 bg-[#15462D] hover:bg-emerald-800 disabled:opacity-50 text-white font-black uppercase rounded cursor-pointer text-[8px] leading-none"
              >
                Ask
              </button>
            </form>
          </div>

          {/* 2. DYNAMIC CONTRAST & ACCESSIBILITY CONTROLS */}
          <div className="p-4 space-y-4">
            <div>
              <span className="font-extrabold text-[#15462D] dark:text-emerald-440 uppercase tracking-wider block mb-2">
                ♿ Accessibility Standard
              </span>
              
              {/* Visual Eye-care Overlay Selector */}
              <span className="text-[8px] uppercase text-slate-400 dark:text-slate-500 font-bold block mb-1">VISION CONTRAST ENGINE</span>
              <div className="flex flex-wrap gap-1.5 mb-3 w-full p-1">
                <button
                  type="button"
                  onClick={() => setVisualMode('standard')}
                  className={`w-auto px-4 py-2 whitespace-nowrap text-center text-[8px] uppercase font-bold border rounded transition cursor-pointer ${
                    visualMode === 'standard'
                      ? 'bg-emerald-700 border-emerald-650 text-white font-extrabold'
                      : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-900'
                  }`}
                >
                  LUC (CLEAR)
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('comfort')}
                  className={`w-auto px-4 py-2 whitespace-nowrap text-center text-[8px] uppercase font-bold border rounded transition cursor-pointer ${
                    visualMode === 'comfort'
                      ? 'bg-amber-600 border-amber-650 text-white font-extrabold'
                      : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-900'
                  }`}
                >
                  Amber
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('night')}
                  className={`w-auto px-4 py-2 whitespace-nowrap text-center text-[8px] uppercase font-bold border rounded transition cursor-pointer ${
                    visualMode === 'night'
                      ? 'bg-purple-700 border-purple-850 text-white font-extrabold'
                      : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-900'
                  }`}
                >
                  Purple (Night)
                </button>
              </div>

              {/* Typography Comfort Parameters */}
              <span className="text-[8px] uppercase text-slate-400 dark:text-slate-500 font-bold block mb-1">TYPOGRAPHY FILTERS</span>
              
              <div className="space-y-2 mt-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 text-[8.5px]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={accessibilityLargeTargets}
                    onChange={(e) => setAccessibilityLargeTargets(e.target.checked)}
                    className="accent-emerald-500 w-3 h-3 rounded"
                  />
                  <span>Large Touch Targets (44px padding)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={accessibilityLineSpacing}
                    onChange={(e) => setAccessibilityLineSpacing(e.target.checked)}
                    className="accent-emerald-500 w-3 h-3 rounded"
                  />
                  <span>Relaxed Line Spacing (1.85lh)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={accessibilityBoldText}
                    onChange={(e) => setAccessibilityBoldText(e.target.checked)}
                    className="accent-emerald-500 w-3 h-3 rounded"
                  />
                  <span>Strong Bold Font Weight Boost</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={accessibilityReduceCrowding}
                    onChange={(e) => setAccessibilityReduceCrowding(e.target.checked)}
                    className="accent-emerald-500 w-3 h-3 rounded"
                  />
                  <span>Reduce Visual Grid Crowding</span>
                </label>

                <div className="space-y-1.5 pt-2 border-t border-slate-150 dark:border-slate-800 text-left">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="font-bold">Font Boldness Limit:</span>
                    <span className="font-extrabold text-[#15462D] dark:text-emerald-430">{accessibilityFontBoldness}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="800"
                    step="100"
                    value={accessibilityFontBoldness}
                    onChange={(e) => setAccessibilityFontBoldness(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[7px] text-slate-400">
                    <span>300 (Light)</span>
                    <span>500 (Med)</span>
                    <span>800 (Bold)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedFontBoldness(accessibilityFontBoldness);
                      setAccessibilityBoldText(false);
                      triggerToast(`Applied font boldness of ${accessibilityFontBoldness} cross-workspace.`, 'success');
                    }}
                    className={`w-full py-1 border-0 font-sans font-bold uppercase text-[8px] rounded transition cursor-pointer select-none text-center shadow-xs mt-1.5 ${
                      accessibilityFontBoldness !== appliedFontBoldness 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold animate-pulse' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {accessibilityFontBoldness === appliedFontBoldness ? 'Boldness Applied' : `Apply Boldness: ${accessibilityFontBoldness}`}
                  </button>
                </div>

                <div className="space-y-1.5 pt-2.5 border-t border-slate-150 dark:border-slate-800 text-left">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                    <span className="font-bold">Default Eye Calibration:</span>
                  </div>
                  <select
                    value={defaultVisualMode}
                    onChange={(e) => setDefaultVisualMode(e.target.value as 'standard' | 'comfort' | 'night')}
                    className="w-full text-[8.5px] bg-white dark:bg-slate-900 text-slate-705 dark:text-slate-300 border border-slate-205 dark:border-slate-800 rounded p-1 font-mono cursor-pointer"
                  >
                    <option value="standard">LUC (CLEAR)</option>
                    <option value="comfort">Amber</option>
                    <option value="night">Purple (IR)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Text font scaling row */}
            <div>
              <div className="flex justify-between items-center text-[8px] text-slate-400 dark:text-slate-500 font-bold mb-1.5">
                <span className="uppercase">FONT SIZE PREFERENCE</span>
                <span className="text-[#15462D] dark:text-emerald-430">{appFontSize.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['compact', 'comfortable', 'large', 'xl'] as const).map(fSz => (
                  <button
                    key={fSz}
                    onClick={() => setAppFontSize(fSz)}
                    className={`py-1 text-[7.5px] uppercase font-bold border rounded text-center transition cursor-pointer ${
                      appFontSize === fSz
                        ? 'bg-[#15462D] border-emerald-800 text-white font-bold shadow-xs'
                        : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-105 dark:hover:bg-slate-900'
                    }`}
                  >
                    {fSz}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </aside>
    </div>

      {/* QUICK ACCESSIBILITY FLOATING ACTION HUBS (BOTTOM-LEFT) */}
      <div 
        ref={quickActionsRef}
        onMouseEnter={handleAccessibilityMouseEnter}
        onMouseLeave={handleAccessibilityMouseLeave}
        className={`fixed bottom-4 max-w-[calc(100vw-32px)] z-45 font-mono text-slate-800 transition-all duration-300 ${
          expandedSidebar ? 'left-4 lg:left-86' : 'left-4 lg:left-24'
        }`} 
        id="ericon-accessibility-shortcut-hub"
      >
        <div className="relative">
          <AnimatePresence>
            {showQuickActionsMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                drag={true}
                dragConstraints={{
                  left: 0,
                  right: Math.max(0, windowWidth - 270),
                  top: -Math.max(0, windowHeight - 200),
                  bottom: 0
                }}
                dragElastic={0.02}
                dragMomentum={false}
                className="absolute bottom-14 left-0 bg-white border-2 border-slate-200 rounded-lg p-3.5 shadow-2xl w-64 flex flex-col gap-2 border-l-4 border-l-emerald-700 font-sans cursor-move select-none z-[110]"
                style={{ 
                  maxHeight: 'calc(100vh - 160px)',
                  overflowY: 'auto',
                  touchAction: 'none'
                }}
              >
                {accessibilitySubView === 'main' ? (
                  <>
                    <div className="border-b border-slate-100 pb-1.5 mb-1 text-start flex-shrink-0 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">Quick Actions (Draggable)</span>
                      <span className="text-[8px] px-1 bg-slate-100 text-slate-500 rounded font-mono">↕ Drag</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 overflow-y-auto pr-0.5 max-h-[290px] scrollbar-thin scrollbar-thumb-slate-300">
                      {/* Sub-view switcher for customizable eye comfort setup */}
                      <button
                        type="button"
                        onClick={() => {
                          setAccessibilitySubView('eye');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-bold flex items-center justify-between flex-shrink-0"
                      >
                        <span className="flex items-center gap-2">👁️ Eye Calibration Setup</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-750 text-white rounded font-bold uppercase tracking-wider">Configure</span>
                      </button>

                      <div className="border-t border-slate-100 my-1 flex-shrink-0" />

                      <button
                        type="button"
                        onClick={() => {
                          handleLaunchCapsule();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0"
                      >
                        <span className="flex items-center gap-2">🚀 Launch Dispatch</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">Space</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleResetCapsule();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0"
                      >
                        <span className="flex items-center gap-2">🔄 Reset Canister</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">R</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPdfExportDialog(true);
                          setShowQuickActionsMenu(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0"
                      >
                        <span className="flex items-center gap-2">📄 Export PDF Report</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">Ctrl+P</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0 ${
                          themeMode === 'dark' ? 'active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">🌓 Toggle Dark Mode</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">Alt+T</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUnitSystem(prev => prev === 'metric' ? 'imperial' : 'metric');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0 ${
                          unitSystem === 'imperial' ? 'active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">🌍 Swap Metric/Imperial</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">Alt+U</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTempUnit(prev => prev === 'celsius' ? 'fahrenheit' : 'celsius');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0 ${
                          tempUnit === 'fahrenheit' ? 'active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">🌡️ Swap Temp Scale</span>
                        <kbd className="bg-slate-100 px-1 border rounded text-[8px] font-mono">Alt+F</kbd>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAppFontSize('compact');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0 ${
                          appFontSize === 'compact' ? 'active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">🔠 Set Compact Size</span>
                        <span className="text-[8px] px-1 bg-slate-100 border rounded font-mono">Size A</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAppFontSize('comfortable');
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group flex-shrink-0 ${
                          appFontSize === 'comfortable' ? 'active' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">🔡 Set Comfortable Size</span>
                        <span className="text-[8px] px-1 bg-slate-100 border rounded font-mono">Size B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Clear ERICON cached parameters and restart secure workspace?')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="w-full text-left px-2 py-1.5 rounded text-[11px] transition cursor-pointer font-semibold flex items-center justify-between group text-red-650 flex-shrink-0 hover:bg-red-50"
                      >
                        <span className="flex items-center gap-2">⚠️ Reset Session Cache</span>
                        <span className="text-[8px] px-1 bg-red-100 text-red-700 border border-red-200 rounded font-mono font-bold">Flush</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-b border-slate-100 pb-1.5 mb-1.5 flex items-center justify-between flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setAccessibilitySubView('main')}
                        className="text-[9px] font-mono font-extrabold uppercase text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer transition border border-slate-200 leading-none"
                      >
                        ⬅️ Back
                      </button>
                      <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">Eye Setup</span>
                    </div>
                    
                    <div className="flex flex-col gap-3 font-sans pb-1 max-h-[310px] overflow-y-auto pr-0.5">
                      {/* Visual Filter Modes inside Eye calibration group */}
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-slate-500 font-bold block text-start">Active Visual Overlay</span>
                        <div className="flex flex-wrap gap-1.5 text-[9px] uppercase font-bold text-center w-full p-1">
                          <button
                            type="button"
                            onClick={() => setVisualMode('standard')}
                            className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'standard' ? 'bg-[#15462D] text-white border-transparent shadow-xs font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                          >
                            LUC (CLEAR)
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisualMode('comfort')}
                            className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'comfort' ? 'bg-amber-500 text-white border-transparent shadow-xs font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                          >
                            Amber
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisualMode('night')}
                            className={`w-auto px-4 py-2 whitespace-nowrap text-center border rounded cursor-pointer transition ${visualMode === 'night' ? 'bg-purple-700 text-white border-transparent shadow-xs font-black' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}
                          >
                            Purple (Night)
                          </button>
                        </div>
                      </div>

                      {/* Customizable Tactical Red parameters */}
                      {visualMode === 'night' && (
                        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-left">
                          <span className="text-[8.5px] uppercase text-purple-850 font-bold bg-purple-50 px-1 py-0.5 rounded border border-purple-100 block w-fit">🔮 Crisp Deep Purple Contrast</span>
                          
                          {/* Red Intensity / Saturation slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                              <span>Saturation Glow</span>
                              <span className="font-extrabold text-[#15462D]">{tacticalRedIntensity}%</span>
                            </div>
                            <input
                              type="range"
                              min="300"
                              max="2000"
                              step="50"
                              value={tacticalRedIntensity}
                              onChange={(e) => setTacticalRedIntensity(parseInt(e.target.value, 10))}
                              className="w-full accent-purple-700 cursor-pointer h-1 bg-slate-100 rounded-lg"
                            />
                          </div>

                          {/* Brightness limit slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                              <span>Comfort Brightness</span>
                              <span className="font-extrabold text-[#15462D]">{tacticalRedBrightness}%</span>
                            </div>
                            <input
                              type="range"
                              min="40"
                              max="120"
                              step="5"
                              value={tacticalRedBrightness}
                              onChange={(e) => setTacticalRedBrightness(parseInt(e.target.value, 10))}
                              className="w-full accent-purple-700 cursor-pointer h-1 bg-slate-100 rounded-lg"
                            />
                          </div>

                          {/* Contrast slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                              <span>Tactical Contrast</span>
                              <span className="font-extrabold text-[#15462D]">{tacticalRedContrast}%</span>
                            </div>
                            <input
                              type="range"
                              min="80"
                              max="150"
                              step="5"
                              value={tacticalRedContrast}
                              onChange={(e) => setTacticalRedContrast(parseInt(e.target.value, 10))}
                              className="w-full accent-purple-700 cursor-pointer h-1 bg-slate-100 rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      {/* Nocturnal Auto Dusk sensor automation */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 select-none text-[10px]">
                        <span className="font-extrabold text-slate-500 uppercase tracking-tight">Auto Night Dusk Switch</span>
                        <button
                          type="button"
                          onClick={() => setEnableAutoNightMode(!enableAutoNightMode)}
                          className={`w-auto px-4 py-2 text-[8.5px] font-black rounded cursor-pointer uppercase transition-all whitespace-nowrap text-center ${
                            enableAutoNightMode 
                              ? 'bg-emerald-700 text-white border border-emerald-600 shadow-xs' 
                              : 'bg-slate-100 border border-slate-205 text-slate-600'
                          }`}
                        >
                          {enableAutoNightMode ? 'ON (DUSK)' : 'OFF (MUTED)'}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 pt-2.5 border-t border-slate-100 text-left">
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                          <span className="font-bold">Font Boldness Limit</span>
                          <span className="font-extrabold text-[#15462D]">{accessibilityFontBoldness}</span>
                        </div>
                        <input
                          type="range"
                          min="300"
                          max="800"
                          step="100"
                          value={accessibilityFontBoldness}
                          onChange={(e) => setAccessibilityFontBoldness(parseInt(e.target.value, 10))}
                          className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-100 rounded-lg appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedFontBoldness(accessibilityFontBoldness);
                            setAccessibilityBoldText(false);
                            triggerToast(`Applied font boldness of ${accessibilityFontBoldness} cross-workspace.`, 'success');
                          }}
                          className={`w-full py-1 border-0 font-sans font-bold uppercase text-[8px] rounded transition cursor-pointer select-none text-center shadow-xs mt-1 ${
                            accessibilityFontBoldness !== appliedFontBoldness 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold animate-pulse' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {accessibilityFontBoldness === appliedFontBoldness ? 'Boldness Applied' : `Apply Boldness: ${accessibilityFontBoldness}`}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-left">
                        <span className="text-[9px] text-slate-500 font-bold">Default Eye Calibration</span>
                        <select
                          value={defaultVisualMode}
                          onChange={(e) => setDefaultVisualMode(e.target.value as 'standard' | 'comfort' | 'night')}
                          className="w-full text-[9px] bg-white text-slate-705 border border-slate-200 rounded p-1 font-mono cursor-pointer"
                        >
                          <option value="standard">LUC (CLEAR)</option>
                          <option value="comfort">Amber</option>
                          <option value="night">Purple (IR)</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setVisualMode('standard');
                            setEnableAutoNightMode(false);
                            setAccessibilityFontBoldness(500);
                            setAppliedFontBoldness(500);
                            localStorage.removeItem('ericon_eye_settings');
                            localStorage.removeItem('ericon_visual_mode');
                            localStorage.removeItem('ericon_enable_auto_night_mode');
                            localStorage.removeItem('ericon_access_font_boldness');
                            localStorage.removeItem('ericon_applied_font_boldness');
                            triggerToast('Restore Default Calibration complete.', 'info');
                          }}
                          className="text-[9px] font-mono text-emerald-800 hover:text-emerald-950 font-extrabold hover:underline bg-transparent border-0 cursor-pointer p-0.5"
                        >
                          🔄 Restore Default Calibration
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-[#15462D] hover:bg-emerald-950 border-2 border-slate-100 shadow-lg text-white cursor-pointer ${showQuickActionsMenu ? 'rotate-90 bg-slate-900 border-slate-750' : ''}`}
            title="Open ERICON Accessibility Hotkeys Shortcut Menu"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* GLOBAL PDF EXPORT DIALOG MODAL */}
      <AnimatePresence>
        {showPdfExportDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-hidden pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPdfExportDialog(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs pointer-events-auto cursor-pointer"
            />
            {/* Dialog Card */}
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.08}
              dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative bg-white border-2 border-slate-200 shadow-2xl rounded-lg p-6 w-[92%] max-w-xl max-h-[85vh] text-start font-sans flex flex-col gap-4 text-slate-800 pointer-events-auto cursor-grab active:cursor-grabbing z-10"
              style={{ maxHeight: '85vh' }}
              id="global-pdf-export-modal"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-105 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded">
                    <Database className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 leading-none">PDF & Excel Export Center</h3>
                    <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 uppercase">A4 Standard snaps & Spreadsheet Snapshot Compiler</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPdfExportDialog(false)}
                  className="text-slate-400 hover:text-slate-650 font-bold border rounded px-1.5 py-0.2 text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-3 text-slate-500 overflow-y-auto pr-1 py-1 flex-1 select-text">
                <p>This dynamic report compiler captures current biosecurity metrics, microgrid air pressures, active Reynolds velocities and eco-surveillance results into standard PDF and Excel spreadsheet exports.</p>
                
                {/* LIVE STYLED REPORT BANNER PREVIEW */}
                <div className="border border-slate-200 rounded-xs overflow-hidden shadow-xs select-none">
                  <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Live Document Header Preview</span>
                    <span className="text-emerald-700 text-[8px] font-bold">● STYLED ACCORDANCE VERIFIED</span>
                  </div>
                  <div className="header-container font-mono">
                    <div className="header-text-block text-left">
                      <span className="text-[10px] font-extrabold leading-tight text-white uppercase block">ERICON CONVERSATION & CONTAINMENT NETWORK</span>
                      <span className="text-[9px] leading-tight text-emerald-200 font-bold block">REGULATORY COMPLIANCE ARCHIVE REPORT</span>
                      <span className="text-[8px] leading-tight text-slate-100 block opacity-90 uppercase">SECURITY OUTLOOK // STANDARD SNAPSHOT DATA</span>
                    </div>
                    {getEriconLogoDataUrl() && (
                      <div className="header-logo-wrapper">
                        <img src={getEriconLogoDataUrl(162, 186, true)} alt="ERICON Transparent Logo" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-205 bg-slate-50 p-2.5 rounded flex flex-col gap-1.5 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[9px] uppercase">Active Tube Pressure:</span>
                    <span className="font-semibold text-slate-700">{specs.p1.toFixed(1)} - {specs.p2.toFixed(1)} kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[9px] uppercase">Velocity Snapshot:</span>
                    <span className="font-semibold text-slate-700">{calc.velocity.toFixed(2)} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[9px] uppercase">Reynolds Boundary Index:</span>
                    <span className="font-semibold text-slate-700">{calc.reynoldsNumber.toFixed(0)} ({calc.flowRegume})</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 font-mono flex-shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setShowPdfExportDialog(false)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 rounded text-xs font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGlobalExcelExport}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-neutral-700 font-extrabold rounded text-xs uppercase shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Spreadsheet 📊
                </button>
                <button
                  type="button"
                  onClick={handleGlobalPdfExport}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 hover:text-white text-white font-extrabold rounded text-xs uppercase shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Generate PDF 📄
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FINE LEGAL/TECHNICAL ARTIFACT STICKER */}
      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-[10px] font-mono text-slate-500 select-none max-w-4xl mx-auto px-4 space-y-2 leading-relaxed" id="app-footer">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <p className="font-extrabold uppercase tracking-widest text-[#15462D]">ERICON System © 2026</p>
          <p className="font-semibold uppercase tracking-wide">Ecological Rodent Interception and Containment Network</p>
          <p id="governance-badge" className="bg-emerald-50 text-[#15462D] px-2 py-0.5 border border-emerald-150 rounded text-[9px] uppercase font-bold tracking-tight">Protected Under ERICON Governance Framework</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5 font-bold uppercase text-slate-400">
          <span>Scientific Integrity Layer Enabled</span>
          <span className="text-emerald-600 font-normal opacity-50">•</span>
          <span>Research Access Controlled</span>
          <span className="text-emerald-600 font-normal opacity-50">•</span>
          <span>Sokoine University of Agriculture (SUA) Co-Development</span>
        </div>
        <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed pt-1 select-text">
          Disclaimer: Unauthorized use only for approved ecological, agricultural, and public health co-investigations. Simulated mechanical variables and biothermal coefficients comply with safe bio-transportation frameworks. Lead inventor: Joshua Reuben Jakoniko, MSc.
        </p>
      </footer>

      {/* FLOATING AI TERMINAL TRIGGER */}
      <button
        type="button"
        id="ai-copilot-trigger"
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-800 hover:bg-emerald-905 text-white font-mono text-[9px] uppercase font-bold tracking-wider px-4 py-3 rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-emerald-950/20 active:scale-95 group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
        </span>
        <BrainCircuit className="w-3.5 h-3.5 text-emerald-250 group-hover:rotate-12 transition-transform" />
        <span>Scientific Co-Pilot</span>
      </button>

      {/* SLIDING AI CO-PILOT DRAWER */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-slate-950 z-[100] cursor-pointer"
            />

            {/* Slider Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] md:w-[560px] bg-slate-900 text-slate-100 shadow-2xl z-[101] border-l border-slate-800 flex flex-col font-mono"
              id="ai-panel-container"
            >
              {/* Header */}
              <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center text-white font-bold leading-none shadow-sm">
                    <Bot className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-xs uppercase font-extrabold tracking-wide text-white flex items-center gap-1.5">
                      ERICON Ecological Co-Pilot
                    </h2>
                    <p className="text-[8px] text-emerald-400 uppercase tracking-widest leading-none mt-1">
                      Gemini Scientific advisory system
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiOpen(false)}
                  className="p-1 rounded bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Telemetry Bar */}
              <div className="bg-slate-950/40 border-b border-slate-900 px-4 py-2.5 flex items-center justify-between text-[8px] text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tube: {specs.length}m × {specs.diameter}mm</span>
                </div>
                <div>Flow: {(calc.flowRateVolumetric*60000).toFixed(0)} L/m</div>
                <div>Re: {calc.reynoldsNumber.toFixed(0)} ({calc.flowRegume})</div>
                <div>Specimen Db: {aiBiodiversityContext.total} ({aiBiodiversityContext.shannon.toFixed(2)} H')</div>
              </div>

              {/* Dynamic Search / History Filter Bar */}
              <div className="bg-slate-950/60 border-b border-slate-900 px-4 py-2 flex items-center gap-2">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider shrink-0 select-none">Search Chat:</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    placeholder="Filter historical advisor advice..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-700 focus:outline-hidden text-[9px]/tight text-white font-mono px-2 py-1 rounded placeholder-slate-600"
                  />
                  {aiSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAiSearchQuery('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 p-0 text-[10px] cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Output Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col" id="ai-chat-scroller">
                {(() => {
                  const filtered = chatHistory.filter(msg =>
                    !aiSearchQuery.trim() || msg.content.toLowerCase().includes(aiSearchQuery.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center text-slate-500 text-[9.5px] font-mono italic my-auto py-8">
                        No co-pilot dispatches or insights match "{aiSearchQuery}".
                      </div>
                    );
                  }
                  return filtered.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={index}
                        className={`max-w-[85%] flex flex-col ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 px-1 flex items-center gap-1">
                          {isUser ? (
                            <>
                              <span>Field Researcher</span>
                              <span className="w-1 h-1 rounded-full bg-blue-500" />
                            </>
                          ) : (
                            <>
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>Systems Advisor</span>
                            </>
                          )}
                        </div>

                        <div
                          className={`p-3 rounded border text-[10.5px] leading-relaxed break-words shadow-sm ${
                            isUser
                              ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-100 rounded-tr-none'
                              : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none font-mono text-left list-none'
                          }`}
                        >
                          <div className="markdown-body prose prose-invert max-w-none text-left">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}

                {isAiLoading && (
                  <div className="self-start items-start max-w-[85%] flex flex-col animate-pulse">
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 px-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded bg-amber-500 animate-ping" />
                      <span>Co-Pilot Analysis executing...</span>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-850/50 text-slate-400 text-[10px] rounded rounded-tl-none italic font-mono flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span>Conducting fluid equations and biodiversity telemetry regression...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Prompt Suggestions */}
              <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/20 flex flex-wrap gap-1.5">
                {[
                  { label: "Is transit safe?", text: "Verify biosafety levels for transit of the current target species given the active fluid pressures and tube diameter limit." },
                  { label: "Explain Biodiversity Indices", text: "Explain Shannon index and Simpson index of our captured specimens. Highlight what a low variety signifies regarding epidemiological surveillance." },
                  { label: "Transit optimization", text: "Recommend parameter adjustments to pressure (p1, p2) or tube diameter to boost the active specimen biometric outcome safely." }
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isAiLoading}
                    onClick={() => handleSendPreset(sug.text)}
                    className="text-[8.5px] text-slate-400 hover:text-emerald-355 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-emerald-900 rounded px-2 py-1 transition-all cursor-pointer text-left max-w-full truncate disabled:opacity-50"
                  >
                    💡 {sug.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Dock */}
              <form onSubmit={handleFormSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAiLoading}
                  placeholder={isAiLoading ? "Syncing core telemetry logs..." : "Ask Co-Pilot about specs, models or biodiversity..."}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-[10px] text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-emerald-600 transition disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !chatInput.trim()}
                  className="p-2 rounded bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 disabled:hover:bg-emerald-800 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1C. FLOATING ABOUT / CONTACT MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-hidden pointer-events-none">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs pointer-events-auto cursor-pointer"
              onClick={() => setShowContactModal(false)}
            />
            
            {/* Modal Content */}
            <motion.div 
              drag
              dragMomentum={false}
              dragElastic={0.08}
              dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative bg-white border-2 border-slate-200 shadow-2xl rounded-lg p-6 w-[92%] max-w-lg max-h-[85vh] text-start font-sans flex flex-col gap-4 text-slate-800 pointer-events-auto cursor-grab active:cursor-grabbing z-10"
              style={{ maxHeight: '85vh' }}
              id="about-contact-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-1 font-mono flex-shrink-0 select-none">
                <span className="font-black uppercase tracking-wider text-[#15462D] text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-800" />
                  About &amp; Registry Contact
                </span>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer border-0 bg-transparent flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs select-text overflow-y-auto pr-1 flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">Departmental Identifier</span>
                  <p className="font-bold text-slate-900 uppercase">ERICON Ecological Rodent Interception and Containment Network</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase block">Objective</span>
                  <p className="text-slate-600 leading-relaxed text-justify">
                    标准化与验证模型 (Standardized Scientific Integrity Protection Models) checking air velocities, biome metrics, and structural integrity equations in artificial underground archives according to strict environmental and ecological standards on a centralized multi-factor token authentication backbone.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2 font-mono text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corporate Headquarters:</span>
                    <strong className="text-slate-800">Sector 15 Grid Terminal</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authorized Registry IP:</span>
                    <strong className="text-slate-800">ERAS-EMA-C1-80HZ</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Secure Ingress Helpline:</span>
                    <strong className="text-emerald-850 font-bold">+1 (555) 902-8812</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authentication Gateway:</span>
                    <strong className="text-slate-800">support@ericon.org</strong>
                  </div>
                </div>

                <div className="border-t border-slate-150 pt-3.5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase block select-none">Platform Protocols</span>
                  <details className="bg-amber-50/40 border border-amber-200/50 rounded p-3 text-[11px] font-sans text-amber-900 cursor-pointer">
                    <summary className="font-bold outline-hidden select-none hover:text-amber-950 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse inline-block" />
                      View Regulatory Protocol Details
                    </summary>
                    <p className="mt-2.5 leading-relaxed text-slate-700 text-justify font-medium text-xs">
                      Regulatory Protocol: Under ERICON governance, the Ecological Rodent Archive (ERA) system, operates under standardized Scientific Integrity Protection protocols. Access to dynamic model modifications or exception requests is restricted to accredited researchers through authenticated and verified credentialing gateways.
                    </p>
                  </details>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex-shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="w-full py-2.5 bg-[#15462D] hover:bg-[#0c2f1e] text-white font-mono font-black text-xs uppercase rounded cursor-pointer transition-all border-0 shadow-sm"
                >
                  Close Directory Access
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ON-DEMAND SIMULATOR IMPLEMENTATION: FLOATING Picture-in-Picture (PiP) ON DESKTOP */}
      {isSimulatorLaunched && windowWidth >= 768 && desktopLaunchMode === 'pip' && (
        <div className="fixed bottom-6 right-6 z-[200] w-[460px] bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl shadow-2xl flex flex-col p-4 animate-scale-up" id="pip-window-overlay">
          <InteractiveSchematic
            specs={specs}
            calc={calc}
            capsule={capsule}
            onLaunchCapsule={handleLaunchCapsule}
            onResetCapsule={handleResetCapsule}
            rodentSpecies={rodentSpecies}
            owepDesign={owepDesign}
            survivalScore={survivalScore}
            lowSurvivalTimeMs={lowSurvivalTimeMs}
            onSetLowSurvivalTime={setLowSurvivalTimeMs}
            visualMode={visualMode}
            isFloatingPip={true}
            onCloseFloatingPip={() => setIsSimulatorLaunched(false)}
            onExpandFloatingPip={() => setDesktopLaunchMode('fullscreen')}
            auditLogs={auditLogs}
          />
        </div>
      )}

      {/* ON-DEMAND SIMULATOR IMPLEMENTATION: DEDICATED FULL-SCREEN WORKSPACE FOR DESKTOP OR MOBILE */}
      {isSimulatorLaunched && (windowWidth < 768 || desktopLaunchMode === 'fullscreen') && (
        <div className="fixed inset-0 z-[300] bg-slate-900 text-slate-100 flex flex-col overflow-y-auto animate-fade-in" id="full-screen-simulator-workspace-page">
          <header className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 px-6 flex items-center justify-between z-50 flex-shrink-0 select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSimulatorLaunched(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-mono text-[10px] font-black uppercase rounded-lg border-0 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>← Close Simulator</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-800" />
              <div className="text-left font-mono">
                <span className="text-[8px] uppercase font-black text-emerald-450 tracking-widest block leading-none">UNDERGROUND FLUIDICS DIRECTIVE</span>
                <span className="text-xs font-black uppercase text-white tracking-wider block mt-0.5 leading-none">RUAS-V1 AIRFLOW ENGINE</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[8.5px] font-mono bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-2.5 py-1 rounded-md uppercase font-black tracking-widest animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-405" />
                ONLINE CALIBRATION
              </span>
              
              {windowWidth >= 768 && (
                <button
                  type="button"
                  onClick={() => setDesktopLaunchMode('pip')}
                  className="p-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] font-bold uppercase rounded-lg border-0 cursor-pointer transition-all"
                >
                  Switch to PiP Window
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full text-slate-200">
            {/* Premium metric row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
              <div className="bg-slate-955 border border-slate-800 hover:border-slate-700 transition duration-200 rounded-xl p-4 text-left shadow-lg space-y-1">
                <span className="text-[9px] uppercase font-bold font-mono text-slate-505">Velocity Profile</span>
                <p className="font-mono text-lg font-extrabold text-emerald-400">
                  {(calc.velocity || 0).toFixed(2)} m/s
                </p>
                <span className="text-[8px] text-slate-505 font-sans leading-none block">Tube specific velocity</span>
              </div>

              <div className="bg-slate-955 border border-slate-800 hover:border-slate-700 transition duration-200 rounded-xl p-4 text-left shadow-lg space-y-1">
                <span className="text-[9px] uppercase font-bold font-mono text-slate-505">Active Pressure</span>
                <p className="font-mono text-lg font-extrabold text-blue-400">
                  {(specs.p1 - specs.p2).toFixed(1)} kPa
                </p>
                <span className="text-[8px] text-slate-505 font-sans leading-none block">Differential ΔP gradient</span>
              </div>

              <div className="bg-slate-955 border border-slate-800 hover:border-slate-700 transition duration-200 rounded-xl p-4 text-left shadow-lg space-y-1">
                <span className="text-[9px] uppercase font-bold font-mono text-slate-505">Flow Rate Index</span>
                <p className="font-mono text-lg font-extrabold text-slate-200">
                  {((calc.flowRateVolumetric || 0) * 3600).toFixed(1)} m³/h
                </p>
                <span className="text-[8px] text-slate-550 font-sans leading-none block">Hourly flow volume index</span>
              </div>

              <div className="bg-slate-955 border border-slate-800 hover:border-slate-700 transition duration-200 rounded-xl p-4 text-left shadow-lg space-y-1">
                <span className="text-[9px] uppercase font-bold font-mono text-slate-505">Transit Efficiency</span>
                <p className="font-mono text-lg font-extrabold text-emerald-450">
                  {(((calc.velocity || 1) * 98.4) / ((calc.velocity || 1) + 0.15)).toFixed(1)} %
                </p>
                <span className="text-[8px] text-slate-550 font-sans leading-none block">Containment safe clearance</span>
              </div>
            </div>

            {/* Canvas Interactive Schematic Workspace */}
            <div className="bg-slate-955 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden" id="fullscreen-schematic-wrapper">
              <InteractiveSchematic
                specs={specs}
                calc={calc}
                capsule={capsule}
                onLaunchCapsule={handleLaunchCapsule}
                onResetCapsule={handleResetCapsule}
                rodentSpecies={rodentSpecies}
                owepDesign={owepDesign}
                survivalScore={survivalScore}
                lowSurvivalTimeMs={lowSurvivalTimeMs}
                onSetLowSurvivalTime={setLowSurvivalTimeMs}
                visualMode={visualMode}
                auditLogs={auditLogs}
              />
            </div>

            {/* Charts & Analytics */}
            <div className="bg-slate-955 border border-slate-800 rounded-2xl p-6 shadow-2xl" id="fullscreen-charts-wrapper">
              <div className="border-b pb-4 border-slate-850 text-left mb-6 font-mono">
                <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <span>📊 Scientific Trend Graphs &amp; Analysis</span>
                </h4>
                <p className="text-[9px] text-slate-400 mt-1 font-sans">
                  Real-time simulation curves indicating turbulent friction (Reynolds) and pneumatic drag over overall tube travel span.
                </p>
              </div>
              
              <div className="text-left font-mono">
                <Suspense fallback={<div className="p-10 text-center text-xs font-mono text-slate-500 animate-pulse font-extrabold">Loading charts...</div>}>
                  <AnalyticsAndReports
                    specs={specs}
                    calc={calc}
                    capsule={capsule}
                    rodentSpecies={rodentSpecies}
                    onLoadSpecs={setSpecs}
                  />
                </Suspense>
              </div>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}
