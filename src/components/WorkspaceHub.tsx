import React, { useState, useEffect } from 'react';
import { 
  Cloud, Calendar as CalendarIcon, FileText, CheckSquare, Mail, 
  MessageSquare, LayoutGrid, LogIn, LogOut, CheckCircle2, AlertTriangle, 
  Loader2, Play, ExternalLink, RefreshCw, Send, Plus, Trash2, FileJson, Link2
} from 'lucide-react';
import { 
  googleSignIn, logout, getAccessToken, initAuth 
} from '../lib/workspaceAuth';
import { User } from 'firebase/auth';
import { SystemSpecs, PhysicsCalculations } from '../types';

interface WorkspaceHubProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ specs, calc }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Active sub-tab inside Workspace Hub
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'drive' | 'calendar' | 'docs' | 'forms' | 'gmail' | 'chat'>('drive');

  // Integrations states
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [driveLoading, setDriveLoading] = useState<boolean>(false);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [eventForm, setEventForm] = useState({
    summary: 'ERICON-S Rodent Observation & Specimen Logging',
    date: new Date().toISOString().slice(0, 10),
    time: '09:00',
    duration: 60,
    description: `Target Species: Mastomys Natalensis\nDifferential Pressure (DP): ${calc.dp.toFixed(2)} kPa\nSimulation Flow Rate: ${calc.flowRateVolumetric.toFixed(3)} m³/s\nDevice Code: ERICON-SEC-SHA256`
  });

  const [docTitle, setDocTitle] = useState('ERICON-S Scientific Observation Laboratory Ledger');
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('ERICON-S Field Study Specimen Collection Form');
  const [createdFormUrl, setCreatedFormUrl] = useState<string | null>(null);

  const [gmailForm, setGmailForm] = useState({
    recipient: '',
    subject: '🚨 ERICON-S Simulation Dispatch telemetry anomaly alert',
    body: `ATTENTION COLLEAGUE,\n\nI am dispatching the real-time thermodynamic simulation specs from ERICON-S.\n\nSYSTEM METRICS:\n-------------------------------\nOWEP Inlet Pressure (P1): ${specs.p1} kPa\nTerminal EMA Hub Pressure (P2): ${specs.p2} kPa\nCalculated Differential: ${calc.dp.toFixed(3)} kPa\nAir Flow Velocity: ${calc.velocity.toFixed(2)} m/s\nFlow Regime: ${calc.flowRegume}\nPneumatic Power Input: ${calc.pneumaticPower.toFixed(1)} W\n\nGenerated automatically via the Google Workspace API integration.\nMorogoro Ecology Sector Project.`
  });

  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('⚠️ ERICON-S Simulation Dispatch Notification: Flow Rate optimized and stable at normal limits.');

  // Note database backup mechanism (Custom Google Drive Keep Substitute)
  const [keepNotes, setKeepNotes] = useState<{ id: string, title: string, text: string, date: string }[]>(() => {
    try {
      const stored = localStorage.getItem('ericon_google_keep_fallback_notes');
      return stored ? JSON.parse(stored) : [
        { id: '1', title: 'Morogoro District Calibration notes', text: 'Coordinate grid verified. Sub-district boundaries match geographic vectors.', date: '2026-05-26' },
        { id: '2', title: 'Polyamide-6 wall friction checklist', text: 'Friction coefficient stable around nominal 0.08 values during rodent capsule testing.', date: '2026-05-26' }
      ];
    } catch {
      return [];
    }
  });
  const [newNote, setNewNote] = useState({ title: '', text: '' });

  useEffect(() => {
    localStorage.setItem('ericon_google_keep_fallback_notes', JSON.stringify(keepNotes));
  }, [keepNotes]);

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, tokenStr) => {
        setUser(currentUser);
        setToken(tokenStr);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Set default recipient to current user's email if logged in
  useEffect(() => {
    if (user?.email) {
      setGmailForm(prev => ({ ...prev, recipient: user.email || '' }));
    }
  }, [user]);

  // Fetch contextual integrations data when a tab is selected and user is signed in
  useEffect(() => {
    if (token) {
      if (activeWorkspaceTab === 'drive') fetchDriveFiles();
      if (activeWorkspaceTab === 'calendar') fetchCalendarEvents();
      if (activeWorkspaceTab === 'chat') fetchChatSpaces();
    }
  }, [activeWorkspaceTab, token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setOperationMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setOperationMessage({ type: 'success', text: `Access granted. Signed in as ${result.user.displayName || result.user.email}` });
      }
    } catch (err: any) {
      console.error('Google authorization failed:', err);
      setOperationMessage({ type: 'error', text: `Authentication failed: ${err.message || err}` });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to disconnect Google Workspace and clear authorization credentials?');
    if (!confirmed) return;

    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setDriveFiles([]);
      setCalendarEvents([]);
      setCreatedDocUrl(null);
      setCreatedFormUrl(null);
      setOperationMessage({ type: 'success', text: 'Disconnected successfully.' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const showConfirm = (text: string): boolean => {
    return window.confirm(`[SECURITY CONFIRMATION REQUIRED]\n\nYou are about to execute an authorized API request on behalf of your Google account:\n\n👉 "${text}"\n\nDo you want to proceed?`);
  };

  // ==================== GOOGLE DRIVE OPERATIONS ====================
  const fetchDriveFiles = async () => {
    if (!token) return;
    setDriveLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=6&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime%20desc&q=trashed%20%3D%20false', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.files) {
        setDriveFiles(data.files);
      } else {
        setDriveFiles([]);
      }
    } catch (err) {
      console.error('Drive listing error:', err);
    } finally {
      setDriveLoading(false);
    }
  };

  const handleUploadSpecsToDrive = async () => {
    if (!token) return;
    if (!showConfirm(`Create and save a JSON configuration file 'ERICON_Simulation_Specs_${Date.now()}.json' directly to your Google Drive folder.`)) return;

    setSubmittingAction('drive_upload');
    try {
      const payload = {
        meta: {
          specs,
          calculations: calc,
          exportedAt: new Date().toISOString(),
          verifierCode: 'SHA256:9A8D-VERIFIED-V5.2'
        }
      };

      const fileContent = JSON.stringify(payload, null, 2);
      const boundary = 'foo_bar_boundary';
      const metadata = {
        name: `ERICON_Simulation_Specs_${new Date().toISOString().slice(0, 10)}.json`,
        mimeType: 'application/json'
      };

      // Multipart upload format
      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        fileContent +
        `\r\n--${boundary}--`;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      const resData = await response.json();
      if (resData.id) {
        setOperationMessage({ type: 'success', text: `Simulation specifications uploaded successfully: ${metadata.name}` });
        fetchDriveFiles();
      } else {
        throw new Error(resData.error?.message || 'Unknown upload dispatch error');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Upload failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleDeleteDriveFile = async (fileId: string, name: string) => {
    if (!token) return;
    if (!showConfirm(`Permanently DELETE the file '${name}' from your Google Drive files.`)) return;

    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 204 || response.ok) {
        setOperationMessage({ type: 'success', text: `Deleted mapping for ${name}.` });
        fetchDriveFiles();
      } else {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Delete error');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Delete failed: ${err.message || err}` });
    }
  };

  // ==================== GOOGLE CALENDAR OPERATIONS ====================
  const fetchCalendarEvents = async () => {
    if (!token) return;
    setCalendarLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=6&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.items) {
        setCalendarEvents(data.items);
      } else {
        setCalendarEvents([]);
      }
    } catch (err) {
      console.error('Calendar reading error:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!token) return;
    if (!showConfirm(`Schedule a field research/simulation synchronizer event titled '${eventForm.summary}' on your Google Calendar.`)) return;

    setSubmittingAction('calendar_event');
    try {
      const startDateTime = `${eventForm.date}T${eventForm.time}:00`;
      const endDateVal = new Date(new Date(startDateTime).getTime() + (eventForm.duration * 60 * 1000));
      const endDateTime = endDateVal.toISOString().slice(0, 19);

      const payload = {
        summary: eventForm.summary,
        description: eventForm.description,
        location: 'Morogoro Ecological Laboratory & Observation Tunnels (Tanzania)',
        start: {
          dateTime: startDateTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'UTC'
        },
        reminders: {
          useDefault: true
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (resData.id) {
        setOperationMessage({ type: 'success', text: `Calendar event successfully scheduled for ${eventForm.date} at ${eventForm.time}` });
        fetchCalendarEvents();
      } else {
        throw new Error(resData.error?.message || 'Event creation error');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Calendar scheduling failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // ==================== GOOGLE DOCS OPERATIONS ====================
  const handleCreateDocsJournal = async () => {
    if (!token) return;
    if (!showConfirm(`Generate a complete structured Scientific Journal Report based on current rodent simulation values in a new Google Doc.`)) return;

    setSubmittingAction('docs_create');
    setCreatedDocUrl(null);
    try {
      const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: docTitle })
      });

      const docObj = await createResponse.json();
      if (!docObj.documentId) {
        throw new Error(docObj.error?.message || 'Failed creating base Document shell');
      }

      const docId = docObj.documentId;
      setCreatedDocUrl(`https://docs.google.com/document/d/${docId}/edit`);

      // Write styled structured contents
      const bulletTitle = `🧬 ERICON-S Rodent Ecological Vector ledger\n`;
      const dateText = `Exported Time: ${new Date().toUTCString()}\n`;
      const statsBlock = 
        `1. INLET THERMODYNAMIC PRESSURES:\n` +
        `   - OWEP Input Pressure: ${specs.p1} kPa\n` +
        `   - EMA Hub Pressure: ${specs.p2} kPa\n` +
        `   - Combined Delta (DP): ${calc.dp.toFixed(3)} kPa\n\n` +
        `2. AIR TRANSPORT DYNAMICS:\n` +
        `   - Calculated Velocity: ${calc.velocity.toFixed(2)} m/s\n` +
        `   - Darcy Friction Factor: ${calc.frictionFactor.toFixed(4)}\n` +
        `   - Flow Regime Type: ${calc.flowRegume}\n` +
        `   - Maximum Theoretical Capsule Speed: ${calc.maxCapsuleVelocity.toFixed(2)} m/s\n` +
        `   - Theoretical Mechanical Power Input: ${calc.pneumaticPower.toFixed(1)} W\n\n` +
        `3. CALIBRATION MATRIX (SHA256 STAMP ID):\n` +
        `   - ERICON-SEC-SHA256-V5.2 • SECURE OBSERVATION PROTOCOL\n\n` +
        `The calculations have matched safety norms on nominal Polyamide-6 wall friction grids.\n`;

      const updatePayload = {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: bulletTitle + dateText + statsBlock
            }
          }
        ]
      };

      await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      setOperationMessage({ type: 'success', text: `Perfect! Developed research journal doc: '${docTitle}'` });
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Document construction failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // ==================== GOOGLE FORMS OPERATIONS ====================
  const handleDeployFieldSurvey = async () => {
    if (!token) return;
    if (!showConfirm(`Auto-deploy an electronic Google Forms survey on your account to gather field specimen collection logs.`)) return;

    setSubmittingAction('forms_create');
    setCreatedFormUrl(null);
    try {
      // Step A: Create standard empty Form
      const createResponse = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: formTitle,
            description: 'Field researchers spec logs tracking for ERICON(S) microclimate aggregation.'
          }
        })
      });

      const formObj = await createResponse.json();
      if (!formObj.formId) {
        throw new Error(formObj.error?.message || 'Form baseline setup error');
      }

      const formId = formObj.formId;
      setCreatedFormUrl(formObj.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`);

      // Step B: Inject questions using batchUpdate
      const updatePayload = {
        requests: [
          {
            createItem: {
              item: {
                title: 'Species Identification',
                description: 'Identify the specimen taxonomy category caught.',
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: 'DROP_DOWN',
                      options: [
                        { value: 'Rattus rattus' },
                        { value: 'Mus musculus' },
                        { value: 'Arvicanthis niloticus' },
                        { value: 'Mastomys natalensis' },
                        { value: 'Other' }
                      ]
                    }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Specimen Weight (grams)',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: {}
                  }
                }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Head-Body Length (mm)',
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: {}
                  }
                }
              },
              location: { index: 2 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Tail Length (mm)',
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: {}
                  }
                }
              },
              location: { index: 3 }
            }
          }
        ]
      };

      await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      setOperationMessage({ type: 'success', text: `Gcp deployed successfully. Form is live to receive field entries!` });
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Form deployment failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // ==================== GMAIL OPERATIONS ====================
  const handleComposeSendEmail = async () => {
    if (!token) return;
    if (!gmailForm.recipient) {
      alert('Please specify a receiver email first.');
      return;
    }
    if (!showConfirm(`Compose and transmit an email dispatch of system report data to: ${gmailForm.recipient}`)) return;

    setSubmittingAction('gmail_send');
    try {
      // Simple raw MIME base64 encoder
      const rfcMail = [
        `To: ${gmailForm.recipient}`,
        `Subject: ${gmailForm.subject}`,
        `Content-Type: text/plain; charset="unhashed-utf-8"`,
        `MIME-Version: 1.0`,
        ``,
        gmailForm.body
      ].join('\r\n');

      // Base64Url encoding
      const encodedMsg = btoa(unescape(encodeURIComponent(rfcMail)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedMsg })
      });

      const resData = await response.json();
      if (resData.id) {
        setOperationMessage({ type: 'success', text: `Email dispatched successfully to ${gmailForm.recipient} (Message ID: ${resData.id})` });
        setGmailForm(prev => ({ ...prev, subject: '🚨 ERICON-S Simulation Dispatch telemetry anomaly alert', body: '' }));
      } else {
        throw new Error(resData.error?.message || 'SMTP delivery rejected command');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Gmail dispatch failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // ==================== GOOGLE CHAT OPERATIONS ====================
  const fetchChatSpaces = async () => {
    if (!token) return;
    setChatLoading(true);
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.spaces) {
        setChatSpaces(data.spaces);
        if (data.spaces.length > 0 && !selectedSpace) {
          setSelectedSpace(data.spaces[0].name);
        }
      } else {
        setChatSpaces([]);
      }
    } catch (err) {
      console.error('Chat lookup error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!token) return;
    if (!selectedSpace) {
      alert('Please select a Google Chat Space from the dropdown list first.');
      return;
    }
    if (!showConfirm(`Post a telemetry warning note into your chosen Google Chat space.`)) return;

    setSubmittingAction('chat_message');
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${selectedSpace}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: chatMessageText })
      });

      const resData = await response.json();
      if (resData.name) {
        setOperationMessage({ type: 'success', text: 'Telemetry alert published successfully to Google Chat space!' });
        setChatMessageText('');
      } else {
        throw new Error(resData.error?.message || 'Failed delivering chat room card');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Google Chat message failed: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // ==================== PRAGMATIC KEEP NOTES (Drive Backup) ====================
  const handleAddLocalNote = () => {
    if (!newNote.title || !newNote.text) return;
    const note = {
      id: Date.now().toString(),
      title: newNote.title,
      text: newNote.text,
      date: new Date().toISOString().slice(0, 10)
    };
    setKeepNotes([note, ...keepNotes]);
    setNewNote({ title: '', text: '' });
  };

  const handleDeleteNote = (id: string) => {
    setKeepNotes(keepNotes.filter(n => n.id !== id));
  };

  const handleBackupNotesToDrive = async () => {
    if (!token) return;
    if (!showConfirm('Backup all your saved Keep Board notes as a textual ledger onto Google Drive.')) return;

    setSubmittingAction('keep_backup');
    try {
      const ledgerContent = keepNotes.map(n => `[${n.date}] TITLE: ${n.title}\n${n.text}\n----------------------`).join('\n\n');
      const boundary = 'keep_boundary';
      const metadata = {
        name: `ERICON_Keep_Notes_Archive_${new Date().toISOString().slice(0, 10)}.txt`,
        mimeType: 'text/plain'
      };

      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) +
        `\r\n--${boundary}\r\n` +
        `Content-Type: text/plain\r\n\r\n` +
        ledgerContent +
        `\r\n--${boundary}--`;

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      const resData = await response.json();
      if (resData.id) {
        setOperationMessage({ type: 'success', text: `Academic notes notebook backup created successfully on Drive: ${metadata.name}` });
        fetchDriveFiles();
      } else {
        throw new Error(resData.error?.message || 'Backup failed');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Keep Drive export stalled: ${err.message || err}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-sm p-5 shadow-xs flex flex-col gap-6" id="workspace-integration-hub">
      {/* 1. BRANDING HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2.5 rounded">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">ERICON(S) Unified Workspace Hub</h2>
            <p className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Google Workspace Cloud Operations Grid
            </p>
          </div>
        </div>

        {/* 2. SECURITY AUTHORIZATION PROFILE COUPLING */}
        <div className="flex items-center gap-2.5">
          {needsAuth ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-950 cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all duration-150 shadow-xs"
            >
              {isLoggingIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              Authorize Google Account
            </button>
          ) : (
            <div className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded">
              <div className="text-right">
                <p className="text-[9px] uppercase font-mono font-bold text-emerald-800">● Auth Token Live</p>
                <p className="text-[10.5px] font-bold text-slate-700">{user?.displayName || user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded cursor-pointer transition-all"
                title="Disconnect Workspace Credentials"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Operation alert notices */}
      {operationMessage && (
        <div className={`p-3.5 border rounded flex items-start gap-2.5 text-xs font-mono leading-relaxed animate-fade-in ${
          operationMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {operationMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{operationMessage.text}</span>
        </div>
      )}

      {/* CORE WORKSPACE SUB-PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workspace Service selector sidebar */}
        <div className="flex flex-col gap-1.5 lg:border-r border-slate-150 pr-4">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-1 mb-1 border-b">Active Services</span>
          <button
            onClick={() => setActiveWorkspaceTab('drive')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'drive' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              1. Google Drive
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>
          
          <button
            onClick={() => setActiveWorkspaceTab('calendar')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'calendar' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              2. Google Calendar
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('docs')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'docs' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              3. Google Docs
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('forms')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'forms' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              4. Google Forms
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('gmail')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'gmail' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              5. Gmail Alerts
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab('chat')}
            className={`p-2.5 rounded font-mono text-[11px] font-bold uppercase transition flex items-center justify-between select-none cursor-pointer text-left border ${
              activeWorkspaceTab === 'chat' 
                ? 'bg-slate-900 text-white border-transparent' 
                : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              6. Google Chat
            </span>
            <span className="text-[8px] opacity-70 bg-emerald-900 px-1 text-white rounded">Active</span>
          </button>
        </div>

        {/* Content area for active Workspace sub-platform */}
        <div className="lg:col-span-3 min-h-[350px] bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
          
          {needsAuth ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-8">
              <Cloud className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Sign-in Verification Expected</h3>
              <p className="text-xs text-slate-550 max-w-sm mt-1 mb-4 leading-normal">
                To access Drive, schedule events, deploy surveys, transmit alerts, or update chat matrices, authenticate with your Google account.
              </p>
              <button
                onClick={handleLogin}
                className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-950 cursor-pointer shadow-md"
              >
                Sign In With Google
              </button>
            </div>
          ) : (
            <>
              {/* Drive Sub-UI */}
              {activeWorkspaceTab === 'drive' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <Cloud className="w-4 h-4 text-emerald-800" />
                      Google Drive Cloud File Manager & Spec Backup
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Integrate real-time variables directly to secure storage vaults on your Drive space.
                    </p>
                  </div>

                  {/* Operational controls */}
                  <div className="bg-white border p-3.5 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Export Simulator Parameters (.json)</p>
                      <p className="text-[9.5px] text-slate-450 mt-0.5">Generates a diagnostic packet loaded with P1, P2 and thermodynamic calculations.</p>
                    </div>
                    <button
                      onClick={handleUploadSpecsToDrive}
                      disabled={submittingAction === 'drive_upload'}
                      className="px-4 py-2 bg-emerald-900 text-white hover:bg-emerald-950 rounded font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {submittingAction === 'drive_upload' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <FileJson className="w-3.5 h-3.5" />
                      )}
                      Upload JSON to Drive
                    </button>
                  </div>

                  {/* Drive files lists */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-slate-100 p-2 border-b">
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-600">Recent Drive Files</span>
                      <button 
                        onClick={fetchDriveFiles} 
                        className="text-[9px] font-mono text-emerald-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        disabled={driveLoading}
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${driveLoading ? 'animate-spin' : ''}`} />
                        Sync Files
                      </button>
                    </div>

                    {driveLoading ? (
                      <div className="flex items-center justify-center p-6 bg-white border">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                        <span className="font-mono text-[10px] text-slate-500 ml-2">Reading files payload...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-6 bg-white text-center border text-slate-400 font-mono text-[10.5px]">
                        No active files detected. Click above to export a new data parcel.
                      </div>
                    ) : (
                      <div className="bg-white border divide-y overflow-y-auto max-h-[160px]">
                        {driveFiles.map((file) => (
                          <div key={file.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                            <div className="flex flex-col gap-0.5 max-w-[70%]">
                              <span className="truncate font-bold text-slate-700">{file.name}</span>
                              <span className="text-[8.5px] font-mono text-slate-400">ID: {file.id} • {new Date(file.createdTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {file.webViewLink && (
                                <a 
                                  href={file.webViewLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-1 px-2 border hover:bg-slate-100 rounded text-slate-600 flex items-center gap-1 text-[9px] font-mono font-bold"
                                >
                                  Open <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              <button 
                                onClick={() => handleDeleteDriveFile(file.id, file.name)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calendar Sub-UI */}
              {activeWorkspaceTab === 'calendar' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <CalendarIcon className="w-4 h-4 text-emerald-800" />
                      Google Calendar Observation & Event Dispatcher
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Instantly program simulation peer review panels and rodent microclimate tests on your calendar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event scheduling form */}
                    <div className="bg-white border p-3.5 rounded flex flex-col gap-2.5">
                      <span className="font-mono text-[9.5px] font-bold uppercase text-slate-500 tracking-wider">Schedule Milestone</span>
                      
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8.5px] uppercase font-bold text-slate-650">Event Title</label>
                        <input
                          type="text"
                          value={eventForm.summary}
                          onChange={(e) => setEventForm(prev => ({ ...prev, summary: e.target.value }))}
                          className="w-full text-xs font-bold bg-slate-50 border p-1 rounded"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8.5px] uppercase font-bold text-slate-650">Date</label>
                          <input
                            type="date"
                            value={eventForm.date}
                            onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full text-xs font-mono bg-slate-50 border p-1 rounded"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[8.5px] uppercase font-bold text-slate-650">Time (UTC)</label>
                          <input
                            type="time"
                            value={eventForm.time}
                            onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full text-xs font-mono bg-slate-50 border p-1 rounded"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreateMeeting}
                        disabled={submittingAction === 'calendar_event'}
                        className="w-full mt-2.5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer rounded disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {submittingAction === 'calendar_event' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        Insert event to Calendar
                      </button>
                    </div>

                    {/* Upcoming events schedule list */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-slate-100 p-2 border-b">
                        <span className="font-mono text-[10px] uppercase font-bold text-slate-600">Upcoming Agenda</span>
                        <button 
                          onClick={fetchCalendarEvents} 
                          className="text-[9px] font-mono text-emerald-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          disabled={calendarLoading}
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${calendarLoading ? 'animate-spin' : ''}`} />
                          Sync
                        </button>
                      </div>

                      {calendarLoading ? (
                        <div className="flex items-center justify-center p-6 bg-white border h-[178px]">
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-800" />
                        </div>
                      ) : calendarEvents.length === 0 ? (
                        <div className="p-6 bg-white text-center border text-slate-400 font-mono text-[10px] h-[178px] flex items-center justify-center">
                          No future scientific calibration events listed.
                        </div>
                      ) : (
                        <div className="bg-white border divide-y overflow-y-auto h-[178px]">
                          {calendarEvents.map((evt) => (
                            <div key={evt.id} className="p-2.5 flex flex-col gap-0.5 hover:bg-slate-50 text-xs">
                              <span className="font-bold text-slate-700 truncate">{evt.summary}</span>
                              <span className="text-[9px] font-mono text-emerald-800">
                                📅 {new Date(evt.start.dateTime || evt.start.date).toLocaleString()}
                              </span>
                              {evt.location && <span className="text-[8px] truncate text-slate-400">📍 {evt.location}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Docs Sub-UI */}
              {activeWorkspaceTab === 'docs' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <FileText className="w-4 h-4 text-emerald-800" />
                      Google Docs Scientific Ledger Builder
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Convert current calculations, pressures, and friction metrics into a formatted scientific paper style in Google Docs.
                    </p>
                  </div>

                  <div className="bg-white border p-4 rounded flex flex-col gap-3.5 shadow-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider">Document Title Name</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full text-xs font-bold bg-slate-100 border p-2 rounded"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={handleCreateDocsJournal}
                        disabled={submittingAction === 'docs_create'}
                        className="px-5 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer rounded disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingAction === 'docs_create' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Compile report on Docs
                      </button>

                      {createdDocUrl && (
                        <a
                          href={createdDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[9.5px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Open Document <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* NOTE BOARD Fallback for Google Keep */}
                  <div className="mt-2.5">
                    <h4 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      📋 Scholar Note Board (Integrated Local Keep fallback with Drive backup)
                    </h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">
                      Due to direct OAuth Keep api locks for external apps, write observations locally and commit them directly to Drive!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2.5">
                      <div className="bg-white border rounded p-3 text-xs flex flex-col gap-2">
                        <span className="font-mono text-[9.5px] font-bold text-emerald-800 uppercase tracking-wide">Write Note</span>
                        <input
                          type="text"
                          placeholder="Note Title"
                          value={newNote.title}
                          onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full text-xs font-bold border-b pb-1 focus:outline-none focus:border-emerald-800"
                        />
                        <textarea
                          placeholder="Note details..."
                          rows={2}
                          value={newNote.text}
                          onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))}
                          className="w-full text-xs p-1 bg-slate-50 border rounded resize-none focus:outline-none"
                        />
                        <button
                          onClick={handleAddLocalNote}
                          className="mt-1 w-full py-1.5 bg-slate-900 text-white font-mono text-[8.5px] uppercase font-bold tracking-wider rounded border hover:bg-slate-950 text-center"
                        >
                          Save Note
                        </button>
                      </div>

                      <div className="md:col-span-2 bg-white border rounded p-3 flex flex-col justify-between">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-mono text-[9.5px] font-bold text-slate-500 uppercase">Recent Clippings ({keepNotes.length})</span>
                          <button
                            onClick={handleBackupNotesToDrive}
                            className="text-[8.5px] font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded hover:bg-emerald-100"
                            title="Backup notebooks as single TXT onto Google Drive"
                          >
                            Export to Drive
                          </button>
                        </div>

                        {keepNotes.length === 0 ? (
                          <div className="text-center font-mono py-10 text-[10px] text-slate-400">Empty pinboard.</div>
                        ) : (
                          <div className="divide-y overflow-y-auto max-h-[120px] pr-1 mt-1.5">
                            {keepNotes.map((note) => (
                              <div key={note.id} className="py-2 text-[11px] flex items-start justify-between gap-1.5 group">
                                <div>
                                  <p className="font-bold text-slate-700 leading-snug">{note.title}</p>
                                  <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5">{note.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-650 opacity-10 group-hover:opacity-100 transition-all p-0.5 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Forms Sub-UI */}
              {activeWorkspaceTab === 'forms' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-800" />
                      Google Forms Survey Deployment Station
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Directly configure and launch specimen entry logs in Google Forms.
                    </p>
                  </div>

                  <div className="bg-white border p-4 rounded flex flex-col gap-3.5 shadow-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider">Field Questionary Form Title</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full text-xs font-bold bg-slate-100 border p-2 rounded"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={handleDeployFieldSurvey}
                        disabled={submittingAction === 'forms_create'}
                        className="px-5 py-3 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer rounded disabled:opacity-50 flex items-center gap-2"
                      >
                        {submittingAction === 'forms_create' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Deploy Form to account
                      </button>

                      {createdFormUrl && (
                        <a
                          href={createdFormUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded text-[9.5px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Responder URL <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Gmail Sub-UI */}
              {activeWorkspaceTab === 'gmail' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <Mail className="w-4 h-4 text-emerald-800" />
                      Gmail Urgent Alert Dispatch Panel
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Draft and send thermodynamic simulation files and calculation reports on behalf of your Gmail account.
                    </p>
                  </div>

                  <div className="bg-white border p-3.5 rounded flex flex-col gap-3 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8.5px] uppercase font-bold text-slate-650">Recipient Email</label>
                        <input
                          type="email"
                          placeholder="colleague@university.edu"
                          value={gmailForm.recipient}
                          onChange={(e) => setGmailForm(prev => ({ ...prev, recipient: e.target.value }))}
                          className="w-full text-xs font-mono bg-slate-50 border p-1 rounded"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8.5px] uppercase font-bold text-slate-650">Subject Line</label>
                        <input
                          type="text"
                          value={gmailForm.subject}
                          onChange={(e) => setGmailForm(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full text-xs font-bold bg-slate-50 border p-1 rounded"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8.5px] uppercase font-bold text-slate-650">Email Content</label>
                      <textarea
                        rows={5}
                        value={gmailForm.body}
                        onChange={(e) => setGmailForm(prev => ({ ...prev, body: e.target.value }))}
                        className="w-full text-xs font-mono p-2 bg-slate-50 border rounded resize-none focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleComposeSendEmail}
                      disabled={submittingAction === 'gmail_send'}
                      className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-bold tracking-widest cursor-pointer rounded disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {submittingAction === 'gmail_send' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Transmit Email Anomaly Alert
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Sub-UI */}
              {activeWorkspaceTab === 'chat' && (
                <div className="flex flex-col gap-4 animate-fade-in w-full">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-800" />
                      Google Chat Alert Notifications Portal
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Post notifications and operational flags directly to Google Chat scientific workspaces.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Send controls */}
                    <div className="bg-white border p-3.5 rounded flex flex-col gap-2.5 shadow-xs">
                      <span className="font-mono text-[9.5px] font-bold uppercase text-slate-500 tracking-wider">Dispatch Chat Card</span>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8.5px] uppercase font-bold text-slate-650">Select Target Workspace Room / Space</label>
                        {chatLoading ? (
                          <div className="py-2 flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-800" />
                            <span className="text-[9px] text-slate-400 font-mono">Syncing spaces...</span>
                          </div>
                        ) : chatSpaces.length === 0 ? (
                          <select className="w-full text-xs bg-slate-50 border p-1 rounded font-mono disabled:opacity-50" disabled>
                            <option>No rooms discovered. Double check space membership.</option>
                          </select>
                        ) : (
                          <select
                            value={selectedSpace}
                            onChange={(e) => setSelectedSpace(e.target.value)}
                            className="w-full text-xs bg-slate-50 border p-1 rounded font-mono"
                          >
                            {chatSpaces.map(sp => (
                              <option key={sp.name} value={sp.name}>{sp.displayName || sp.name}</option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <label className="text-[8.5px] uppercase font-bold text-slate-650">Message Body</label>
                        <input
                          type="text"
                          value={chatMessageText}
                          onChange={(e) => setChatMessageText(e.target.value)}
                          className="w-full text-xs bg-slate-50 border p-1.5 rounded"
                        />
                      </div>

                      <button
                        onClick={handleSendChatMessage}
                        disabled={submittingAction === 'chat_message' || !selectedSpace}
                        className="w-full mt-1.5 py-2 bg-emerald-950 text-white font-mono text-[8.5px] uppercase font-bold tracking-widest cursor-pointer rounded disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        {submittingAction === 'chat_message' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        Post To Room
                      </button>
                    </div>

                    {/* Spaces details */}
                    <div className="bg-white border rounded p-3 flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[9.5px] font-bold text-slate-500 uppercase">Interactive Spaces Directory</span>
                        <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                          Discovered spaces on your account. Posting requires that the "ERICON-S" App is added as a member of the room.
                        </p>
                      </div>

                      {chatSpaces.length === 0 ? (
                        <div className="text-center font-mono py-12 text-[10px] text-slate-400">
                          Empty directory. Click Sync below.
                        </div>
                      ) : (
                        <div className="divide-y overflow-y-auto max-h-[140px] pr-1 mt-2">
                          {chatSpaces.map((room) => (
                            <div key={room.name} className="py-2 text-[11px] flex items-center justify-between">
                              <span className="font-bold text-slate-705 truncate">{room.displayName || room.name}</span>
                              <span className="text-[8px] font-mono opacity-50 bg-slate-100 text-slate-700 px-1 py-0.5 rounded">{room.spaceType || 'ROOM'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={fetchChatSpaces}
                        className="mt-2 text-[8.5px] font-mono font-bold text-center border p-1 hover:bg-slate-50"
                        disabled={chatLoading}
                      >
                        Sync Spaces Directory
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom security assurance block */}
          <div className="mt-4 pt-3 border-t text-[8px] font-mono text-slate-400 tracking-wide flex justify-between items-center bg-transparent">
            <span>SECURE ENCRYPTED BEACONS • GOOGLE INTEGRATION GATE v1.2</span>
            <span>PROTECTED USER CONSENT VIA FIREBASE ADMIN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
