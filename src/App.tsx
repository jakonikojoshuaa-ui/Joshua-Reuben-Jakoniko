/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { InteractiveSchematic } from './components/InteractiveSchematic';
import { ControlPanel } from './components/ControlPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ChartsPanel } from './components/ChartsPanel';
import { SpecsDocumentation } from './components/SpecsDocumentation';
import { ResearchPortal } from './components/ResearchPortal';
import { ChartingRoom } from './components/ChartingRoom';
import { AuditLog, AuditRecord } from './components/AuditLog';
import { SystemSpecs, CapsuleSimulation, RodentSpecies } from './types';
import { calculatePhysics, calculateSurvivalScore } from './utils/physics';
import { 
  Wind, ShieldAlert, Cpu, Layers3, Activity, ListCollapse, 
  Eye, Sparkles, Moon, Terminal, Send, BrainCircuit, Bot, X, HelpCircle, MessageSquare, Sliders, Check, Settings
} from 'lucide-react';

export default function App() {
  // Rodent species selector
  const [rodentSpecies, setRodentSpecies] = useState<RodentSpecies>('field_mouse');
  
  // OWEP Inlet Design option: flap_door (counterweighted flap), flex_finger (radial tapered fingers)
  const [owepDesign, setOwepDesign] = useState<'flap_door' | 'flex_finger'>('flap_door');

  // Navigation: "simulator", "research" or "discuss" (forum discussion)
  const [activeTab, setActiveTab] = useState<'simulator' | 'research' | 'discuss'>('simulator');

  // Eyecare & Tactical Field Visual Overlay Options
  const [visualMode, setVisualMode] = useState<'standard' | 'comfort' | 'night'>('standard');

  // Real-time Collaborative Audit Log States
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_simulator_audit_logs_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Theme auto night switch state (Nocturnal automation)
  const [enableAutoNightMode, setEnableAutoNightMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ericon_enable_auto_night_mode');
      return stored ? stored === 'true' : true;
    } catch {
      return true;
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
      return stored === 'true';
    } catch {
      return false;
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

  useEffect(() => {
    localStorage.setItem('ericon_auto_resize_charts', String(autoResizeCharts));
  }, [autoResizeCharts]);

  useEffect(() => {
    localStorage.setItem('ericon_expanded_sidebar', String(expandedSidebar));
  }, [expandedSidebar]);

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
    const checkNocturnalSwitch = () => {
      if (!enableAutoNightMode) return;
      const currentHour = new Date().getHours();
      // After 8:00 PM is >= 20
      if (currentHour >= 20 || currentHour < 6) {
        setVisualMode((prev) => {
          if (prev !== 'night') {
            console.log("🌙 ERICON NOCTURNAL AUTOMATION: Switched theme to nocturnal red (Tactical Red) based on local time (>8:00 PM).");
            return 'night';
          }
          return prev;
        });
      }
    };
    checkNocturnalSwitch();
    const timer = setInterval(checkNocturnalSwitch, 5000); // Check every 5 seconds
    return () => clearInterval(timer);
  }, [enableAutoNightMode]);

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
  const [specs, setSpecs] = useState<SystemSpecs>({
    p1: 105, // OWEP Inlet Pressure (kPa) - closer to atmospheric for rodent survival!
    p2: 95,  // Terminal EMA Hub Vacuum pressure (kPa) - gentle ventilation gradient!
    length: 30, // 30 meters
    diameter: 90, // 90 mm Tube diameter
    roughness: 0.0015, // Polyamide-6 roughness (mm)
    temperature: 22, // 22 °C ambient (ideal thermoneutral zone)
    capsuleMass: 250, // 250 grams Empty Capsule Cylinder
    capsuleFriction: 0.08, // Nylon-6 dry contact friction
    capsuleClearance: 0.98, // Clearance seal ratio
  });

  // Audit parameter modifications inside ControlPanel
  const handleSetSpecsWithAuditing = (updater: SystemSpecs | ((prev: SystemSpecs) => SystemSpecs)) => {
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

  return (
    <div 
      className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-100 select-none pb-12 relative transition-all duration-300 ${
        visualMode === 'comfort' ? 'eye-comfort-mode' : visualMode === 'night' ? 'night-vision-mode' : ''
      }`} 
      id="app-root"
      style={{ backgroundImage: 'radial-gradient(#e2e8f0 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }}
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
          #app-root svg text, #app-root .chart-label, #app-root .recharts-text {
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

        /* Accessibility: Bold Text Boost */
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
      `}</style>
      
      {/* 1. PROFESSIONAL CAD HEADER */}
      <header className="bg-white border-b-2 border-slate-200 px-6 py-4 w-full sticky top-0 z-50 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-800 text-white font-mono font-bold rounded-sm flex items-center justify-center text-md shadow-sm border border-emerald-900">
              ER
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-lg font-mono font-extrabold tracking-tight text-emerald-900 uppercase leading-none">
                ERICON Ecological Rodent Interception Network
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest leading-none mt-1.5 uppercase">
                ERAS Tunnel Integration Mechanics // ERICON Ecological Guidelines
              </p>
            </div>
          </div>

          {/* Quick Real-Time Status Rails */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono" id="header-status-rails">
            {/* Visual HUD Controls */}
            <div className="flex bg-slate-50 border-2 border-slate-200 p-0.5 rounded-sm font-mono text-[9px] font-bold uppercase shadow-inner items-center gap-0.5" id="visual-hud-filter-panel">
              <button
                type="button"
                onClick={() => setVisualMode('standard')}
                title="Standard clear daylight (UV normal lux)"
                className={`py-1 px-2 rounded-xs transition-all cursor-pointer flex items-center gap-1 ${visualMode === 'standard' ? 'bg-white text-emerald-950 border border-slate-300 shadow-xs animate-fadeIn' : 'text-slate-500 hover:text-slate-850'}`}
              >
                <Eye className="w-3 h-3 text-slate-550" />
                <span>Standard</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('comfort')}
                title="Eye comfort warm filtration (Amber spectrum)"
                className={`py-1 px-2 rounded-xs transition-all cursor-pointer flex items-center gap-1 ${visualMode === 'comfort' ? 'bg-white text-emerald-950 border border-slate-300 shadow-xs animate-fadeIn' : 'text-slate-500 hover:text-slate-850'}`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Comfort</span>
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('night')}
                title="Nocturnal safe red tactical goggle mode"
                className={`py-1 px-2 rounded-xs transition-all cursor-pointer flex items-center gap-1 ${visualMode === 'night' ? 'bg-red-800 text-white border border-red-950 shadow-xs font-black animate-pulse' : 'text-slate-500 hover:text-slate-850'}`}
              >
                <Moon className="w-3 h-3 text-red-650" />
                <span>Tactical Red</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-300 mx-1" />

              <button
                type="button"
                onClick={() => setShowAppearanceDropdown(!showAppearanceDropdown)}
                title="Open scale system zoom, fonts, and night timer configurations"
                className={`py-1 px-1.5 rounded-xs transition-all cursor-pointer flex items-center gap-1 ${showAppearanceDropdown ? 'bg-emerald-900 text-white border border-emerald-950 shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'}`}
              >
                <Sliders className="w-3 h-3" />
                <span>Custom Specs</span>
              </button>
            </div>

            <div className="px-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-sm flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-slate-400 font-bold">REYNOLDS:</span>
              <span className="font-bold text-slate-800">{(calc.reynoldsNumber).toFixed(0)}</span>
            </div>
            
            <div className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-sm flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Safe Ventilation:</span>
              <span className="text-xs font-bold font-mono text-emerald-600">● LIVE MONITORING</span>
            </div>
          </div>

        </div>
      </header>

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
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DRAFTING ROOM WRAPPER AND GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8 flex-1 w-full flex flex-col gap-6" id="app-main-content">
        
        {/* DUAL MODE CONTROL PANEL SELECTOR */}
        <div className="bg-white border-2 border-slate-200 rounded-sm p-1.5 flex flex-col lg:flex-row gap-2 w-full font-mono text-[11px] shadow-xs" id="app-view-selector-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 py-3 px-4 font-extrabold uppercase flex items-center justify-center gap-2.5 transition-all rounded px-2 select-none cursor-pointer border ${
              activeTab === 'simulator'
                ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Engineering Transit & Fluid Dynamics Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('research')}
            className={`flex-1 py-3 px-4 font-extrabold uppercase flex items-center justify-center gap-2.5 transition-all rounded px-2 select-none cursor-pointer border ${
              activeTab === 'research'
                ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Students & Researchers Portal (Field Database & Statistics)
          </button>
          <button
            type="button"
            id="btn-tab-discuss"
            onClick={() => setActiveTab('discuss')}
            className={`flex-1 py-3 px-4 font-extrabold uppercase flex items-center justify-center gap-2.5 transition-all rounded px-2 select-none cursor-pointer border ${
              activeTab === 'discuss'
                ? 'bg-emerald-900 border-emerald-950 text-white shadow-sm'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Peer Charting Room (Scientist Forum)
          </button>
        </div>

        {activeTab === 'simulator' ? (
          <>
            {/* TOP ROW: INTERACTIVE VECTOR BLUEPRINT BLOCK */}
            <section id="system-schematic-section" className="w-full">
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
              />
            </section>

            {/* MID ROW GRID: CONSOLES & ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="middle-dashboard-row">
              
              {/* LEFT 4 COLS: PARAMETER MANAGER */}
              <section className="lg:col-span-4 flex flex-col gap-6" id="left-sidebar-controls">
                <ControlPanel
                  specs={specs}
                  onChangeSpecs={handleSetSpecsWithAuditing}
                  rodentSpecies={rodentSpecies}
                  onChangeRodentSpecies={setRodentSpecies}
                  owepDesign={owepDesign}
                  onChangeOwepDesign={setOwepDesign}
                />
                
                {/* real-time audit log console */}
                <AuditLog auditLogs={auditLogs} onClearLogs={() => setAuditLogs([])} />
              </section>

              {/* RIGHT 8 COLS: DIAGNOSTICS & CHARTS TABS */}
              <section className="lg:col-span-8 flex flex-col gap-6" id="right-dashboard-panels">
                
                {/* Real-time Math & Statistics */}
                <AnalyticsPanel
                  specs={specs}
                  calc={calc}
                  capsule={capsule}
                  rodentSpecies={rodentSpecies}
                  owepDesign={owepDesign}
                />

                {/* Dynamic Graphical Profiles */}
                <ChartsPanel
                  specs={specs}
                  calc={calc}
                />

              </section>
            </div>

            {/* BOTTOM ROW: SPECIFICATIONS AND CONCEPT RENDER */}
            <section id="specs-and-citations-section" className="w-full">
              <SpecsDocumentation
                specs={specs}
                calc={calc}
                rodentSpecies={rodentSpecies}
                owepDesign={owepDesign}
                onChangeOwepDesign={setOwepDesign}
              />
            </section>
          </>
        ) : activeTab === 'research' ? (
          <section id="research-portal-section" className="w-full">
            <ResearchPortal />
          </section>
        ) : (
          <section id="peer-discussions-section" className="w-full">
            <ChartingRoom
              specs={specs}
              rodentSpecies={rodentSpecies}
              survivalScore={survivalScore}
              onLoadSpecs={setSpecs}
              onLoadRodentSpecies={setRodentSpecies}
            />
          </section>
        )}

      </main>

      {/* FINE LEGAL/TECHNICAL ARTIFACT STICKER */}
      <footer className="mt-12 text-center text-[10px] font-mono text-slate-400 select-none max-w-xl mx-auto px-4 leading-normal" id="app-footer">
        <p>© 2026 ERICON Geological Interception Consortium. This application simulates the ecological air movement equations and rodent survival tolerances inside the central 'Polyamide-6' ERAS transit tunnel network. Parameters are monitored at 80Hz for rodent-safe ecological aggregation and monitoring.</p>
        <p className="mt-1.5 opacity-60">OWEP-EMA-V1 SYSTEM DEMARCATION CORE • ACCREDITED DESIGN BLUEPRINT</p>
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

    </div>
  );
}
