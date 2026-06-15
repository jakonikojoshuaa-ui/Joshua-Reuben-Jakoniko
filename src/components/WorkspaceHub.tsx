import React, { useState, useEffect } from 'react';
import { 
  Cloud, Calendar as CalendarIcon, FileText, CheckSquare, Mail, 
  MessageSquare, LayoutGrid, LogIn, LogOut, CheckCircle2, AlertTriangle, 
  Loader2, Play, ExternalLink, RefreshCw, Send, Plus, Trash2, FileJson, Link2,
  Users, Shield, Lock, Unlock, Eye, EyeOff, Share2, BarChart2, Settings, 
  Bell, Copy, Check, Edit, FileSpreadsheet, PlusCircle, UserPlus, 
  MessageCircle, AlertCircle, Info, Compass, CircleDot
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  googleSignIn, logout, getAccessToken, initAuth 
} from '../lib/workspaceAuth';
import { User } from 'firebase/auth';
import { 
  SystemSpecs, PhysicsCalculations, ProjectWorkspace, ProjectMember, 
  ReviewerLink, DiscussionComment, ProjectDataRecord, ProjectNotification,
  SpecimenRecord
} from '../types';

interface WorkspaceHubProps {
  specs: SystemSpecs;
  calc: PhysicsCalculations;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  notifications: ProjectNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ProjectNotification[]>>;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ 
  specs, 
  calc,
  currentUser,
  setCurrentUser,
  activeTab,
  setActiveTab,
  notifications,
  setNotifications
}) => {
  // Toggle between "Project Workspaces" (Phase 3) & "Google Workspace Integrations" (Phase 2)
  const [hubViewMode, setHubViewMode] = useState<'projects' | 'google_gcp'>('projects');

  // Active Project ID state (null means displaying Project Dashboard Listings grid)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Active sub-tab inside a selected Project Dashboard Workspace
  const [activeProjectSubTab, setActiveProjectSubTab] = useState<'overview' | 'team' | 'data' | 'specimens' | 'analytics' | 'discussions' | 'reviewer' | 'reports'>('overview');

  // Specimen Data Entry Form states
  const [sCaptureDate, setSCaptureDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sCaptureTime, setSCaptureTime] = useState<string>('08:15');
  const [sSiteName, setSSiteName] = useState<string>('');
  const [sFarmId, setSFarmId] = useState<string>('');
  const [sWarehouseId, setSWarehouseId] = useState<string>('');
  const [sResearchTeam, setSResearchTeam] = useState<string>('Team Alpha');
  
  const [sCountry, setSCountry] = useState<string>('Tanzania');
  const [sRegion, setSRegion] = useState<string>('Morogoro');
  const [sDistrict, setSDistrict] = useState<string>('Morogoro Municipal');
  const [sVillage, setSVillage] = useState<string>('');
  const [sGpsLatitude, setSGpsLatitude] = useState<string>('-6.824');
  const [sGpsLongitude, setSGpsLongitude] = useState<string>('37.661');
  const [sAltitude, setSAltitude] = useState<string>('530');
  
  const [sSpecies, setSSpecies] = useState<string>('Mastomys natalensis');
  const [sSex, setSSex] = useState<'Male' | 'Female' | 'Unknown'>('Male');
  const [sAgeClass, setSAgeClass] = useState<'Juvenile' | 'Sub-adult' | 'Adult'>('Adult');
  const [sReproductiveStatus, setSReproductiveStatus] = useState<'Active' | 'Inactive' | 'Pregnant' | 'Lactating'>('Inactive');
  const [sWeight, setSWeight] = useState<string>('45');
  const [sHeadBodyLength, setSHeadBodyLength] = useState<string>('115');
  const [sTailLength, setSTailLength] = useState<string>('110');
  const [sHindFootLength, setSHindFootLength] = useState<string>('22');
  const [sEarLength, setSEarLength] = useState<string>('17');
  
  const [sBodyConditionScore, setSBodyConditionScore] = useState<number>(3);
  const [sExternalParasiteLoad, setSExternalParasiteLoad] = useState<'None' | 'Low' | 'Medium' | 'High'>('None');
  const [sInternalParasiteStatus, setSInternalParasiteStatus] = useState<'Negative' | 'Positive' | 'Untested'>('Untested');
  const [sVisibleInjuries, setSVisibleInjuries] = useState<'None' | 'Mild' | 'Severe'>('None');
  const [sDiseaseNotes, setSDiseaseNotes] = useState<string>('');
  
  const [sSurvival24h, setSSurvival24h] = useState<'Alive' | 'Deceased'>('Alive');
  const [sSurvival1wk, setSSurvival1wk] = useState<'Alive' | 'Deceased' | 'Lost' | 'Recaptured'>('Alive');
  const [sSurvival2wk, setSSurvival2wk] = useState<'Alive' | 'Deceased' | 'Lost' | 'Recaptured'>('Alive');
  const [sSurvival1m, setSSurvival1m] = useState<'Alive' | 'Deceased' | 'Lost' | 'Recaptured'>('Alive');
  const [sSurvival3m, setSSurvival3m] = useState<'Alive' | 'Deceased' | 'Lost' | 'Recaptured'>('Alive');
  
  const [sObserverNotes, setSObserverNotes] = useState<string>('');
  const [sAttachments, setSAttachments] = useState<string>('');
  
  const [sVirusPcr, setSVirusPcr] = useState<'Negative' | 'Positive' | 'Pending'>('Pending');
  const [sPlagueAntibody, setSPlagueAntibody] = useState<'Negative' | 'Positive' | 'Pending'>('Pending');
  const [sLeptospiraPcr, setSLeptospiraPcr] = useState<'Negative' | 'Positive' | 'Pending'>('Pending');
  const [sBacterialCulture, setSBacterialCulture] = useState<string>('No growth');

  // Sub-navigation view inside specimens tab
  const [specimenFormSection, setSpecimenFormSection] = useState<'capture_geo' | 'biological_health' | 'survival_lab'>('capture_geo');
  const [specimenViewSubMode, setSpecimenViewSubMode] = useState<'view' | 'add' | 'charts' | 'audit'>('view');
  
  // Filtering & search
  const [specimenSearchQuery, setSpecimenSearchQuery] = useState<string>('');
  const [specimenFilterSpecies, setSpecimenFilterSpecies] = useState<string>('all');
  const [specimenFilterLabTest, setSpecimenFilterLabTest] = useState<string>('all');
  const [specimenFilterStatus, setSpecimenFilterStatus] = useState<string>('all');

  // Editing tracker
  const [editingSpecimenId, setEditingSpecimenId] = useState<string | null>(null);

  // Dynamic Project Creation modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<number>(1);
  const [newProjName, setNewProjName] = useState<string>('');
  const [newProjType, setNewProjType] = useState<string>('Rodent Biodiversity Study');
  const [newProjDescription, setNewProjDescription] = useState<string>('');
  const [newProjLocation, setNewProjLocation] = useState<string>('');
  const [newProjStartDate, setNewProjStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Role Simulator override (allows checking Administrator, Project Leader, Researcher, and Reviewer constraints in real-time)
  const [roleSimulatorOverride, setRoleSimulatorOverride] = useState<string | null>(null);

  // Team Invite states
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteUsername, setInviteUsername] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'Project Leader' | 'Research Member' | 'Reviewer'>('Research Member');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data Collection Entry Form state
  const [dataEntryDate, setDataEntryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dataEntrySpecies, setDataEntrySpecies] = useState<string>('Mastomys natalensis');
  const [dataEntryCount, setDataEntryCount] = useState<number>(5);
  const [dataEntryLocation, setDataEntryLocation] = useState<string>('');
  const [dataEntryComments, setDataEntryComments] = useState<string>('');

  // Discussion comments states
  const [commentText, setCommentText] = useState<string>('');
  const [showMemberMentions, setShowMemberMentions] = useState<boolean>(false);
  const [attachedFiles, setAttachedFiles] = useState<{name: string, url: string, tempType: 'image' | 'file'}[]>([]);
  const [replyTextMap, setReplyTextMap] = useState<{[commentId: string]: string}>({});
  const [showReplyInputMap, setShowReplyInputMap] = useState<{[commentId: string]: boolean}>({});

  // Reviewer Link states
  const [reviewerAccessType, setReviewerAccessType] = useState<'Dashboard Only' | 'Charts Only' | 'Reports Only' | 'Full Read-Only Access'>('Full Read-Only Access');
  const [reviewerExpiration, setReviewerExpiration] = useState<'7 Days' | '30 Days' | 'Custom'>('30 Days');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Notification sound / toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active user's current effective role in the active project
  const getEffectiveRole = (project: ProjectWorkspace | undefined): 'Administrator' | 'Project Leader' | 'Research Member' | 'Reviewer' => {
    if (roleSimulatorOverride) {
      return roleSimulatorOverride as any;
    }
    if (!currentUser) return 'Reviewer';
    if (currentUser.role === 'Administrator') return 'Administrator';
    if (!project) return 'Reviewer';
    
    // Find member matching username or email
    const member = project.members.find(
      m => m.username.toLowerCase() === currentUser.username.toLowerCase() || 
           m.userId === currentUser.userId
    );
    return member ? member.role : 'Research Member'; // Fallback to researcher
  };

  // Clipboard copy helper with fallback safe alerts
  const handleCopyToClipboard = (text: string, id: string, type: 'link' | 'code') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLinkId(id);
        setTimeout(() => setCopiedLinkId(null), 2500);
      } else {
        setCopiedCodeId(id);
        setTimeout(() => setCopiedCodeId(null), 2500);
      }
      showToast('Copied securely to clipboard!');
    } catch {
      // Fallback
      alert(`SECURE MANUALLY COPY PARCEL:\n\n${text}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerNotification = (title: string, message: string) => {
    const newNotif: ProjectNotification = {
      id: 'n_gen_' + Date.now(),
      title,
      message,
      unread: true,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Initializing Projects State with default High-Fidelity Data
  const [projects, setProjects] = useState<ProjectWorkspace[]>(() => {
    let parsed: ProjectWorkspace[] | null = null;
    try {
      const saved = localStorage.getItem('ericon_collaborative_projects');
      if (saved) parsed = JSON.parse(saved);
    } catch {}

    // Fallback Initial mock projects
    const defaultProjects: ProjectWorkspace[] = [
      {
        id: 'proj-morogoro-2026',
        name: 'ERICON-Morogoro-2026',
        type: 'ERICON Experimental Trial',
        description: 'Main field trials of the ERICON-S pneumatic rodent suppression and monitoring grid.',
        location: 'Morogoro Region, Tanzania',
        startDate: '2026-05-10',
        invitationCode: 'ERICON-7A4K-93HF',
        members: [
          { userId: 'u1', username: 'JoshuaJRJ', role: 'Project Leader', status: 'Active' },
          { userId: 'u2', username: 'AminaResearch', role: 'Research Member', status: 'Active' },
          { userId: 'u3', username: 'JohnEcology', role: 'Research Member', status: 'Active' },
          { userId: 'u4', username: 'Michael', role: 'Reviewer', status: 'Active' }
        ],
        records: [
          { id: 'rec-1', date: '2026-05-28', speciesCaught: 'Mastomys natalensis', count: 18, location: 'Field Sector Alpha', capsuleSpeed: 14.2, darcyFriction: 0.0152, comments: 'Steady pressure maintained at 12 kPa', submittedBy: 'AminaResearch' },
          { id: 'rec-2', date: '2026-05-29', speciesCaught: 'Arvicanthis niloticus', count: 12, location: 'Microgrid EMA-3', capsuleSpeed: 12.8, darcyFriction: 0.0160, comments: 'Calibrations matched normal wall friction grids', submittedBy: 'JohnEcology' },
          { id: 'rec-3', date: '2026-05-30', speciesCaught: 'Mus musculus', count: 25, location: 'Polyamide Tunnel B', capsuleSpeed: 15.1, darcyFriction: 0.0148, comments: 'High vector flow speed observed', submittedBy: 'AminaResearch' }
        ],
        comments: [
          {
            id: 'c1',
            username: 'JoshuaJRJ',
            text: 'Rodent captures increased in EMA-3 after the latest pressure re-routing.',
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
            replies: [
              { id: 'r1', username: 'AminaResearch', text: 'Confirmed. Population spike visible in charts.', timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString() }
            ]
          },
          {
            id: 'c2',
            username: 'Michael',
            text: 'Recommend additional monitoring this week before export.',
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            attachments: [
              { name: 'Morogoro_Surveillance_Calibration.csv', url: '#', tempType: 'file' }
            ],
            replies: []
          }
        ],
        reviewerLinks: [
          { id: 'rev-l1', code: 'REV-8AJ2-4K89', accessType: 'Full Read-Only Access', expiration: '30 Days', expiresAt: '2026-06-30', createdAt: '2026-05-30' }
        ]
      },
      {
        id: 'proj-rodents-survey',
        name: 'Rodent Biodiversity Survey',
        type: 'Rodent Biodiversity Study',
        description: 'Longitudinal capture-mark-recapture bio-containment evaluation study.',
        location: 'Sokoine University Lands',
        startDate: '2026-04-15',
        invitationCode: 'ERICON-2B1G-84PL',
        members: [
          { userId: 'u1', username: 'JoshuaJRJ', role: 'Project Leader', status: 'Active' },
          { userId: 'u2', username: 'AminaResearch', role: 'Research Member', status: 'Active' }
        ],
        records: [
          { id: 'rec-4', date: '2026-05-25', speciesCaught: 'Mastomys natalensis', count: 4, location: 'Field Trait G2', capsuleSpeed: 10.5, darcyFriction: 0.0180, comments: 'Initial traps deployed', submittedBy: 'AminaResearch' },
          { id: 'rec-5', date: '2026-05-26', speciesCaught: 'Rattus rattus', count: 8, location: 'Fallow Sector 12', capsuleSpeed: 11.2, darcyFriction: 0.0175, comments: 'Pest vector activity observed', submittedBy: 'JoshuaJRJ' }
        ],
        comments: [],
        reviewerLinks: []
      },
      {
        id: 'proj-warehouse-protection',
        name: 'Warehouse Protection Study',
        type: 'Warehouse Monitoring',
        description: 'Active deployment of Polyamide-6 pressure tubing grids in industrial food storage facilities.',
        location: 'Central Grain Silos, Dodoma',
        startDate: '2026-05-01',
        invitationCode: 'ERICON-9K3F-41OP',
        members: [
          { userId: 'u1', username: 'JoshuaJRJ', role: 'Project Leader', status: 'Active' },
          { userId: 'u3', username: 'JohnEcology', role: 'Research Member', status: 'Active' }
        ],
        records: [],
        comments: [],
        reviewerLinks: []
      }
    ];

    const actual = parsed && parsed.length > 0 ? parsed : defaultProjects;

    // Standard high-fidelity sample specimen data records
    const sampleSpecimens: SpecimenRecord[] = [
      {
        id: 'spec-01',
        captureDate: '2026-05-28',
        captureTime: '08:15',
        researchProject: 'ERICON-Morogoro-2026',
        siteName: 'Grid-Alpha Central',
        farmId: 'FARM-MOR-04',
        warehouseId: 'N/A',
        researchTeam: 'Team Morogoro East',
        country: 'Tanzania',
        region: 'Morogoro',
        district: 'Morogoro Municipal',
        village: 'Kihonda',
        gpsLatitude: -6.824,
        gpsLongitude: 37.661,
        altitude: 530,
        species: 'Mastomys natalensis',
        sex: 'Female',
        ageClass: 'Adult',
        reproductiveStatus: 'Pregnant',
        weight: 52,
        headBodyLength: 122,
        tailLength: 114,
        hindFootLength: 22,
        earLength: 17,
        bodyConditionScore: 4,
        externalParasiteLoad: 'Low',
        internalParasiteStatus: 'Positive',
        visibleInjuries: 'None',
        diseaseNotes: 'Observation notes check: spleen palpations indicate potential immune response vectors.',
        survival24h: 'Alive',
        survival1wk: 'Alive',
        survival2wk: 'Recaptured',
        survival1m: 'Alive',
        survival3m: 'Alive',
        observerNotes: 'Pre-existing ear tag #EA-2201 noted. Cohort remains fully viable.',
        virusPcr: 'Negative',
        plagueAntibody: 'Negative',
        leptospiraPcr: 'Positive',
        bacterialCulture: 'Proteus species dominant'
      },
      {
        id: 'spec-02',
        captureDate: '2026-05-29',
        captureTime: '09:40',
        researchProject: 'ERICON-Morogoro-2026',
        siteName: 'Terminal EMA-3 Buffer Zone',
        farmId: 'FARM-MOR-09',
        warehouseId: 'N/A',
        researchTeam: 'Team Morogoro East',
        country: 'Tanzania',
        region: 'Morogoro',
        district: 'Morogoro Municipal',
        village: 'Tubuyu',
        gpsLatitude: -6.831,
        gpsLongitude: 37.658,
        altitude: 512,
        species: 'Arvicanthis niloticus',
        sex: 'Male',
        ageClass: 'Adult',
        reproductiveStatus: 'Active',
        weight: 135,
        headBodyLength: 155,
        tailLength: 104,
        hindFootLength: 29,
        earLength: 19,
        bodyConditionScore: 3,
        externalParasiteLoad: 'Medium',
        internalParasiteStatus: 'Negative',
        visibleInjuries: 'None',
        diseaseNotes: 'Ectoparasites harvested for subsequent vector PCR.',
        survival24h: 'Alive',
        survival1wk: 'Alive',
        survival2wk: 'Alive',
        survival1m: 'Deceased',
        survival3m: 'Deceased',
        observerNotes: 'High body condition weight index registered.',
        virusPcr: 'Negative',
        plagueAntibody: 'Negative',
        leptospiraPcr: 'Negative',
        bacterialCulture: 'Negative cultures'
      },
      {
        id: 'spec-03',
        captureDate: '2026-05-30',
        captureTime: '07:30',
        researchProject: 'ERICON-Morogoro-2026',
        siteName: 'Central Grain Silo A',
        farmId: 'N/A',
        warehouseId: 'WH-CENT-02',
        researchTeam: 'Biosecurity Protection Unit',
        country: 'Tanzania',
        region: 'Morogoro',
        district: 'Morogoro Municipal',
        village: 'Kihonda',
        gpsLatitude: -6.819,
        gpsLongitude: 37.665,
        altitude: 520,
        species: 'Rattus rattus',
        sex: 'Male',
        ageClass: 'Sub-adult',
        reproductiveStatus: 'Inactive',
        weight: 120,
        headBodyLength: 140,
        tailLength: 145,
        hindFootLength: 27,
        earLength: 18,
        bodyConditionScore: 2,
        externalParasiteLoad: 'High',
        internalParasiteStatus: 'Untested',
        visibleInjuries: 'Severe',
        diseaseNotes: 'Laceration on anterior back-left limb.',
        survival24h: 'Deceased',
        survival1wk: 'Deceased',
        survival2wk: 'Deceased',
        survival1m: 'Deceased',
        survival3m: 'Deceased',
        observerNotes: 'Containment grid checked at 07:30. Specimen expired.',
        virusPcr: 'Pending',
        plagueAntibody: 'Positive',
        leptospiraPcr: 'Pending',
        bacterialCulture: 'Salmonella genus identified'
      }
    ];

    // Ensure specimens collections are present
    const loadedProjects = actual.map(p => {
      if (!p.specimens || p.specimens.length === 0) {
        if (p.id === 'proj-morogoro-2026') {
          return { ...p, specimens: sampleSpecimens };
        }
        return { ...p, specimens: [] };
      }
      return p;
    });

    localStorage.setItem('ericon_collaborative_projects', JSON.stringify(loadedProjects));
    return loadedProjects;
  });

  useEffect(() => {
    localStorage.setItem('ericon_collaborative_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // ==================== PHASE 3 PROJECT CREATION ====================
  const handleOpenCreateModal = () => {
    setCreateStep(1);
    setNewProjName('');
    setNewProjDescription('');
    setNewProjLocation('');
    setNewProjStartDate(new Date().toISOString().slice(0, 10));
    setShowCreateModal(true);
  };

  const handleNextCreateStep = () => {
    if (createStep === 1 && !newProjName.trim()) {
      alert('Please provide a valid Project Name.');
      return;
    }
    if (createStep < 5) {
      setCreateStep(createStep + 1);
    } else {
      handleFinalizeProjectCreation();
    }
  };

  const handleFinalizeProjectCreation = () => {
    if (!newProjName.trim()) return;

    const codeParts = [
      'ERICON',
      Math.random().toString(36).substring(2, 6).toUpperCase(),
      Math.random().toString(36).substring(2, 6).toUpperCase()
    ];
    const generatedCode = codeParts.join('-');

    const newProject: ProjectWorkspace = {
      id: 'proj-' + Date.now(),
      name: newProjName.trim(),
      type: newProjType,
      description: newProjDescription.trim() || 'A private ERICON research ecosystem workspace.',
      location: newProjLocation.trim() || 'Morogoro calibration center',
      startDate: newProjStartDate,
      invitationCode: generatedCode,
      members: [
        { 
          userId: currentUser?.userId || 'u-host', 
          username: currentUser?.username || 'GuestScientist', 
          role: 'Project Leader', 
          status: 'Active' 
        }
      ],
      records: [],
      specimens: [],
      comments: [
        {
          id: 'init-c-' + Date.now(),
          username: 'System Coordinator',
          text: `Welcome to your brand-new scientific project workspace: "${newProjName}". You are authorized as the Project Leader. Let's record field captures, sync charts, and invite research allies.`,
          timestamp: new Date().toISOString(),
          replies: []
        }
      ],
      reviewerLinks: [],
      isCustom: true
    };

    setProjects(prev => [...prev, newProject]);
    setShowCreateModal(false);
    setActiveProjectId(newProject.id);
    setActiveProjectSubTab('overview');

    triggerNotification(
      '📁 Project Created',
      `Workspace "${newProject.name}" has been initialized under secure protocol.`
    );
    showToast(`Project Workspace "${newProject.name}" built in < 1s!`);
  };

  // ==================== PHASE 3 INVITATION SYSTEM ====================
  const handleInviteByUser = () => {
    if (!activeProject || !inviteUsername.trim()) {
      alert('Please fill in a valid username.');
      return;
    }
    
    // Check if duplicate
    const isDup = activeProject.members.some(
      m => m.username.toLowerCase() === inviteUsername.trim().toLowerCase()
    );
    if (isDup) {
      alert('This scientist is already a member of the project workspace.');
      return;
    }

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        const updatedMembers: ProjectMember[] = [
          ...p.members,
          { 
            userId: 'u_' + Math.random().toString(36).substring(2, 7), 
            username: inviteUsername.trim(), 
            role: inviteRole, 
            status: 'Active' // Instantly active for lightning UX speeds
          }
        ];
        return { ...p, members: updatedMembers };
      }
      return p;
    });

    setProjects(updated);
    setInviteUsername('');
    setShowInviteModal(false);

    triggerNotification(
      '👤 Team Member Invited',
      `User "@${inviteUsername.trim()}" was assigned the role of "${inviteRole}" inside "${activeProject.name}".`
    );
    showToast(`Allied member invited in ≤ 1s.`);
  };

  // ==================== DATA ENTRY SUBMISSIONS ====================
  const handleLogDataRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const speedVal = calc.velocity + (Math.random() * 2 - 1);
    const newRecord: ProjectDataRecord = {
      id: 'rec-' + Date.now(),
      date: dataEntryDate,
      speciesCaught: dataEntrySpecies,
      count: Number(dataEntryCount),
      location: dataEntryLocation.trim() || 'Central EMA sector',
      capsuleSpeed: Number(speedVal.toFixed(2)),
      darcyFriction: Number(calc.frictionFactor.toFixed(4)),
      comments: dataEntryComments.trim() || 'Friction grids and capsule pressure verified.',
      submittedBy: currentUser?.username || 'GuestScientist'
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, records: [newRecord, ...p.records] };
      }
      return p;
    });

    setProjects(updated);
    setDataEntryLocation('');
    setDataEntryComments('');
    showToast('Environmental trap record logged and locked!');
    
    triggerNotification(
      '📊 Data Submitted',
      `New capture of ${newRecord.count} ${newRecord.speciesCaught} uploaded by @${newRecord.submittedBy}.`
    );
  };

  // ==================== DISCUSSION COMPOSE & MENTIONS ====================
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !commentText.trim()) return;

    const newComment: DiscussionComment = {
      id: 'c-' + Date.now(),
      username: currentUser?.username || 'GuestScientist',
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      replies: []
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, comments: [newComment, ...p.comments] };
      }
      return p;
    });

    setProjects(updated);
    setCommentText('');
    setAttachedFiles([]);
    setShowMemberMentions(false);
    showToast('Comment published into the workspace ring!');

    triggerNotification(
      '💬 Comment Added',
      `@${newComment.username} posted a scientific note in "${activeProject.name}".`
    );
  };

  const handlePostReply = (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!activeProject || !text || !text.trim()) return;

    const reply = {
      id: 'r-' + Date.now(),
      username: currentUser?.username || 'GuestScientist',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id === commentId) {
              return { ...c, replies: [...(c.replies || []), reply] };
            }
            return c;
          })
        };
      }
      return p;
    });

    setProjects(updated);
    setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    setShowReplyInputMap(prev => ({ ...prev, [commentId]: false }));
    showToast('Reply locked onto scientific string.');

    triggerNotification(
      '💬 Reply Appended',
      `@${reply.username} replied on discussion thread.`
    );
  };

  // ==================== REVIEWER ACCESS LINKS ====================
  const handleGenerateReviewerLink = () => {
    if (!activeProject) return;

    const idVal = 'rev-' + Math.random().toString(36).substring(2, 7);
    const codeVal = 'REV-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const daysOffset = reviewerExpiration === '7 Days' ? 7 : 30;
    const expDate = new Date(Date.now() + 3600000 * 24 * daysOffset).toISOString().slice(0, 10);

    const newLink: ReviewerLink = {
      id: idVal,
      code: codeVal,
      accessType: reviewerAccessType,
      expiration: reviewerExpiration,
      expiresAt: expDate,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, reviewerLinks: [...p.reviewerLinks, newLink] };
      }
      return p;
    });

    setProjects(updated);
    showToast('Secure reviewer link rendered safely.');

    triggerNotification(
      '🔗 Reviewer Link Accessed',
      `Reviewer share token [${codeVal}] deployed with scope "${reviewerAccessType}".`
    );
  };

  // ==================== PDF & EXCEL REPORTS GENERATION ====================
  const handleTriggerMockExport = (type: 'pdf' | 'excel') => {
    if (!activeProject) return;
    
    // Simulate export loader for 800ms
    showToast(`Assembling scientific data blocks... exporting ${type.toUpperCase()}`);
    setTimeout(() => {
      triggerNotification(
        '📄 Export Completed',
        `Field capture summary for "${activeProject.name}" exported as ${type.toUpperCase()}.`
      );
      alert(`[EXPORT COMPLETED SECURELY]\n\nFile Name: ${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_scientific_report.${type}\nDownload verified with ERICON calibration parameters.\nTotal Records Packets: ${activeProject.records.length}`);
    }, 800);
  };

  // ==================== GOOGLE GCP PHASE 2 COMPATIBILITY WRAPPERS ====================
  // We mirror original google states to prevent breaking Phase 2 OAuth requirements
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'drive' | 'calendar' | 'docs' | 'forms' | 'gmail' | 'chat'>('drive');
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
    body: `ATTENTION COLLEAGUE,\n\nI am dispatching the real-time thermodynamic simulation specs from ERICON-S.\n\nSYSTEM METRICS:\n-------------------------------\nOWEP Inlet Pressure (P1): ${specs.p1} kPa\nTerminal EMA Hub Pressure (P2): ${specs.p2} kPa\nCalculated Differential: ${calc.dp.toFixed(3)} kPa\nAir Flow Velocity: ${calc.velocity.toFixed(2)} m/s\nFlow Regime: ${calc.flowRegume}\nPneumatic Power Input: ${calc.pneumaticPower.toFixed(1)} W\n\nGenerated automatically via Google Workspace API.\nMorogoro Ecology Sector Project.`
  });
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('⚠️ ERICON-S Simulation Dispatch Notification: Flow Rate optimized and stable at normal limits.');

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
        triggerNotification('🔑 Google Auth Saved', 'Google Cloud authorization established successfully.');
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Authentication failed: ${err.message || err}` });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to disconnect Google Workspace?');
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
      console.error(err);
    }
  };

  const fetchDriveFiles = async () => {
    if (!token) return;
    setDriveLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=6&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime%20desc&q=trashed%20%3D%20false', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.files) setDriveFiles(data.files);
    } catch (err) {
      console.error(err);
    } finally {
      setDriveLoading(false);
    }
  };

  const handleUploadSpecsToDrive = async () => {
    if (!token) return;
    setSubmittingAction('drive_upload');
    try {
      const payload = {
        meta: {
          projectName: activeProject?.name || 'ERICON Simulation Data',
          specs,
          calculations: calc,
          exportedAt: new Date().toISOString()
        }
      };
      const fileContent = JSON.stringify(payload, null, 2);
      const boundary = 'foo_bar_boundary';
      const metadata = {
        name: `${activeProject?.name || 'ERICON'}_Simulation_Specs_${Date.now()}.json`,
        mimeType: 'application/json'
      };
      const multipartBody = 
        `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}` +
        `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}\r\n--${boundary}--`;

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
        setOperationMessage({ type: 'success', text: `Uploaded successfully: ${metadata.name}` });
        triggerNotification('📁 Google Drive Sync', 'JSON parameters archived on Drive foldering.');
        fetchDriveFiles();
      }
    } catch (err: any) {
      setOperationMessage({ type: 'error', text: `Upload failed: ${err.message}` });
    } finally {
      setSubmittingAction(null);
    }
  };

  // Compute stats for active project records for charting
  const getAggregatedSpeciesData = () => {
    if (!activeProject || activeProject.records.length === 0) {
      return [
        { name: 'Mastomys', value: 30 },
        { name: 'Arvicanthis', value: 20 },
        { name: 'Mus musculus', value: 15 }
      ];
    }
    const counts: {[species: string]: number} = {};
    activeProject.records.forEach(r => {
      counts[r.speciesCaught] = (counts[r.speciesCaught] || 0) + r.count;
    });
    return Object.keys(counts).map(k => ({
      name: k.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: counts[k]
    }));
  };

  const getTimelineData = () => {
    if (!activeProject || activeProject.records.length === 0) {
      return [
        { date: '05-25', Count: 4 },
        { date: '05-28', Count: 18 },
        { date: '05-29', Count: 12 },
        { date: '05-30', Count: 25 }
      ];
    }
    // group by date
    const dates: {[date: string]: number} = {};
    activeProject.records.forEach(r => {
      const shortD = r.date.substring(5);
      dates[shortD] = (dates[shortD] || 0) + r.count;
    });
    return Object.keys(dates).sort().map(d => ({
      date: d,
      Count: dates[d]
    }));
  };

  // Audit engine helpers
  const getRegistryAnomaliesList = (specList: SpecimenRecord[]) => {
    const list: { id: string; species: string; message: string }[] = [];
    specList.forEach(s => {
      // Geo check
      if (s.gpsLatitude < -7.5 || s.gpsLatitude > -5.9 || s.gpsLongitude < 35.0 || s.gpsLongitude > 38.5) {
        list.push({
          id: s.id,
          species: s.species,
          message: `Coordinates are outside expected Morogoro Regional Grid (Lat -6.0 to -7.5, Lon 35.0 to 38.5). Detected: [${s.gpsLatitude}, ${s.gpsLongitude}].`
        });
      }
      // Male Pregnant check
      if (s.sex === 'Male' && (s.reproductiveStatus === 'Pregnant' || s.reproductiveStatus === 'Lactating')) {
        list.push({
          id: s.id,
          species: s.species,
          message: "Biological Sex / Reproductive status mismatch. Rodent marked Male cannot be Pregnant or Lactating."
        });
      }
      // Weight check
      if (s.weight <= 0 || s.weight > 350) {
        list.push({
          id: s.id,
          species: s.species,
          message: `Extreme Weight metric: ${s.weight}g. Highly abnormal for local Tanzanian multi-mammate vector constraints.`
        });
      }
      // Head-Body vs Tail ratios
      if (s.headBodyLength > 0 && s.tailLength > 0) {
        if (s.species === 'Mastomys natalensis' && Math.abs(s.headBodyLength - s.tailLength) > 40) {
          list.push({
            id: s.id,
            species: s.species,
            message: `Morphometric anomaly: Head-Body (${s.headBodyLength}mm) and Tail (${s.tailLength}mm) length mismatch. These are normally equal within ±15% for Mastomys natalensis.`
          });
        }
      }
      // Inconsistent survival chronology
      if (s.survival24h === 'Deceased' && (s.survival1wk === 'Alive' || s.survival2wk === 'Alive' || s.survival1m === 'Alive' || s.survival3m === 'Alive')) {
        list.push({
          id: s.id,
          species: s.species,
          message: "Survival Monitoring chronological violation. Rodent expired at 24H checkpoint but is marked subsequent Active or Alive."
        });
      }
    });
    return list;
  };

  const hasDbAnomalies = (specList: SpecimenRecord[]) => {
    return getRegistryAnomaliesList(specList).length > 0;
  };

  const getSpecimenValidationWarnings = () => {
    const list: string[] = [];
    if (sSex === 'Male' && (sReproductiveStatus === 'Pregnant' || sReproductiveStatus === 'Lactating')) {
      list.push("⚠️ BIOLOGICAL CONFLICT: Male specimen cannot be marked as Pregnant or Lactating.");
    }
    const w = Number(sWeight);
    if (!sWeight || w <= 0 || w > 350) {
      list.push("⚠️ RANGE ANOMALY: Weight should be a positive value between 1g and 350g under local biosecurity taxonomic models.");
    }
    const hb = Number(sHeadBodyLength);
    const tl = Number(sTailLength);
    if (hb > 0 && tl > 0 && sSpecies === 'Mastomys natalensis' && Math.abs(hb - tl) > 40) {
      list.push(`⚠️ RATIO ANOMALY: Mastomys natalensis normally exhibits closely similar head-body (${hb}mm) and tail (${tl}mm) lengths. Current difference of ${Math.abs(hb - tl)}mm is outside standard distribution.`);
    }
    const ear = Number(sEarLength);
    if (hb > 0 && ear >= hb) {
      list.push("❌ CRITICAL ERROR: Ear length cannot exceed or equal overall Head-Body length (biologically impossible).");
    }
    const hf = Number(sHindFootLength);
    if (hb > 0 && hf >= hb) {
      list.push("❌ CRITICAL ERROR: Hind foot length cannot exceed or equal overall Head-Body length.");
    }
    if (sSurvival24h === 'Deceased' && (sSurvival1wk === 'Alive' || sSurvival2wk === 'Alive' || sSurvival1m === 'Alive' || sSurvival3m === 'Alive')) {
      list.push("❌ CHRONOLOGY CONFLICT: Survival checkpoint order violation. Deceased specimens cannot change to Alive in subsequent checking checkpoints.");
    }
    const lat = Number(sGpsLatitude);
    const lon = Number(sGpsLongitude);
    if (lat < -12.0 || lat > -1.0 || lon < 29.0 || lon > 41.0) {
      list.push("⚠️ LOCATION BOUNDS: Geolocation coordinates fall outside terrestrial borders of East Africa / Tanzania (-1.0 to -12.0 Lat, 29.0 to 41.0 Lon).");
    }
    return list;
  };

  // Render effective role styling & warnings
  const effectiveRole = activeProject ? getEffectiveRole(activeProject) : 'Reviewer';

  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-5 shadow-sm flex flex-col gap-6" id="ericon-collaboration-suite">
      
      {/* GLOBAL TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-emerald-500 text-[#A6E8B6] font-mono text-[10.5px] py-2.5 px-4 rounded shadow-2xl z-55 flex items-center gap-2.5 animate-fade-in uppercase">
          <CircleDot className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BRANDING HUB HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2.5 rounded-md">
            <Users className="w-6 h-6 text-[#15462D]" />
          </div>
          <div>
            <h2 id="pdf-hub-title" className="pdf-hub-text-green text-base font-extrabold text-slate-850 uppercase font-mono tracking-tight flex items-center gap-2">
              ERICON Collaborative Workspace Hub
              <span id="pdf-hub-version" className="pdf-hub-badge-green text-[8px] bg-[#15462D] text-white px-2 py-0.5 rounded-full font-black">ER2026.V.1.0.2 CORE</span>
            </h2>
            <p id="pdf-hub-subtitle" className="pdf-hub-text-green text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Ecological research environments, Scientific DB, Team invitation & Reviewer access gates
            </p>
          </div>
        </div>

        {/* CLOUD VS LOCAL SUB-MODE ACCENTS */}
        <div className="flex bg-slate-50 border border-slate-200 rounded p-1 font-mono text-[9px] font-black uppercase">
          <button
            onClick={() => setHubViewMode('projects')}
            className={`px-3 py-1.5 rounded transition ${hubViewMode === 'projects' ? 'bg-[#15462D] text-white' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            📁 Private Workspaces
          </button>
          <button
            onClick={() => setHubViewMode('google_gcp')}
            className={`px-3 py-1.5 rounded transition ${hubViewMode === 'google_gcp' ? 'bg-emerald-900 text-white' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
          >
            🌐 OAuth Gcp Integrations
          </button>
        </div>
      </div>

      {hubViewMode === 'google_gcp' ? (
        // GOOGLE GCP PLATFORM (Original Phase 2 Integrations)
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in" id="google-gcp-gateway">
          <div className="flex flex-col gap-1.5 pr-4 border-r border-slate-150">
            <span id="pdf-gcp-sync-services-title" className="pdf-hub-text-green text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-1 mb-1 border-b">Gcp Sync Services</span>
            <button
              onClick={() => setActiveWorkspaceTab('drive')}
              className={`p-2.5 rounded font-mono text-[10px] font-bold uppercase transition flex items-center justify-between text-left border ${activeWorkspaceTab === 'drive' ? 'bg-slate-900 text-white border-transparent' : 'bg-transparent text-slate-650 border-transparent hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                1. Google Drive
              </span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('calendar')}
              className={`p-2.5 rounded font-mono text-[10px] font-bold uppercase transition flex items-center justify-between text-left border ${activeWorkspaceTab === 'calendar' ? 'bg-slate-900 text-white border-transparent' : 'bg-transparent text-slate-650 border-transparent hover:bg-slate-50'}`}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                2. Google Calendar
              </span>
            </button>
            
            <div className="mt-8 border-t pt-4">
              <span id="pdf-authentication-console-title" className="pdf-hub-text-green text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Authentication Console</span>
              {needsAuth ? (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full mt-2 px-3 py-2 bg-[#15462D] text-white text-[9.5px] uppercase font-black rounded border cursor-pointer font-mono"
                >
                  {isLoggingIn ? 'Connecting...' : 'Authorize Workspace OAuth'}
                </button>
              ) : (
                <div className="bg-slate-50 border p-2 rounded mt-2">
                  <p className="text-[9px] font-mono font-bold text-emerald-850">● Connected Account</p>
                  <p className="text-[10px] font-bold text-slate-705 truncate mt-0.5">{user?.email}</p>
                  <button onClick={handleLogout} className="text-red-700 font-mono text-[9px] uppercase font-bold hover:underline bg-transparent border-0 mt-2 block cursor-pointer">
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 min-h-[350px] bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
            {needsAuth ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-8 font-mono">
                <Cloud className="w-12 h-12 text-slate-350 mb-3" />
                <h3 id="pdf-gcp-auth-needed-title" className="pdf-hub-text-green text-xs font-bold text-slate-800">OAuth Credentials Needed</h3>
                <p id="pdf-gcp-auth-needed-text" className="pdf-hub-text-green text-[10px] text-slate-500 max-w-sm mt-1 mb-4 leading-normal">
                  To sync parameters with Drive, schedule team synchronizers, or dispatch active alerts, please Authorize Google Account on the left.
                </p>
                <button onClick={handleLogin} className="px-4 py-2 bg-[#15462D] text-white font-mono text-[9px] uppercase font-black tracking-widest rounded cursor-pointer">
                  SIGN IN NOW
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {activeWorkspaceTab === 'drive' ? (
                  <div className="flex flex-col gap-4 w-full font-mono text-[11px]">
                    <div className="border-b pb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                        <Cloud className="w-3.5 h-3.5 text-emerald-850" />
                        Drive Parameters Archiver
                      </h3>
                      <p className="text-[9.5px] text-slate-450 mt-1">
                        Exports real-time thermodynamic simulations as compliant diagnostics files directly to Google Drive.
                      </p>
                    </div>

                    <div className="bg-white border p-3 rounded flex items-center justify-between gap-2.5">
                      <div>
                        <p className="font-bold text-slate-700">Export active telemetry log packet (.json)</p>
                        <p className="text-[8.5px] text-slate-400 mt-0.5">Includes OWEP, Darcy factors, and Reynolds constants.</p>
                      </div>
                      <button
                        onClick={handleUploadSpecsToDrive}
                        disabled={submittingAction === 'drive_upload'}
                        className="py-2 px-3 bg-[#15462D] hover:bg-emerald-850 text-white text-[9px] uppercase font-black rounded border-0 cursor-pointer flex items-center gap-1 bg-emerald-850 disabled:opacity-50"
                      >
                        {submittingAction === 'drive_upload' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileJson className="w-3.5 h-3.5" />}
                        Upload JSON File
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex justify-between items-center bg-slate-100 p-2 rounded">
                        <span className="font-bold text-slate-600 uppercase text-[9px]">Recently Synced Parcels</span>
                        <button onClick={fetchDriveFiles} className="text-[9px] text-[#15462D] font-black underline bg-transparent border-0 cursor-pointer">
                          Reload File List
                        </button>
                      </div>

                      {driveFiles.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 border border-dashed rounded bg-white">
                          No synchronous file maps found. Trigger upload above to register.
                        </div>
                      ) : (
                        <div className="bg-white border divide-y overflow-y-auto max-h-[140px] rounded">
                          {driveFiles.map((file) => (
                            <div key={file.id} className="p-2 flex items-center justify-between hover:bg-slate-50">
                              <div className="truncate max-w-[70%]">
                                <span className="font-bold text-slate-700 block text-[10.5px]">{file.name}</span>
                                <span className="text-[7.5px] text-slate-400 block truncate">ID: {file.id}</span>
                              </div>
                              <a href={file.webViewLink} target="_blank" rel="noreferrer" className="text-[#15462D] text-[9px] underline font-black">
                                VIEW LINK
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // CALENDAR BACKUP COMPATIBILITY VIEW
                  <div className="flex flex-col gap-4 w-full font-mono text-[11px]">
                    <div className="border-b pb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-850" />
                        Google Calendar Workspace Synchronization
                      </h3>
                      <p className="text-[9.5px] text-slate-450 mt-1">
                        Post peer verification calendars on your primary Google account sequence.
                      </p>
                    </div>

                    <div className="bg-white border p-3 rounded flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-[#15462D] uppercase">Sync Event Details</span>
                        <span className="text-[8px] bg-emerald-100 text-[#15462D] px-2 py-0.5 rounded font-black">Ready</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-normal leading-relaxed">
                        Automatic telemetry synchronizer event registered with parameters:
                        <br />• Description: Standard Darcy friction factor ({calc.frictionFactor.toFixed(4)}) is compliant.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t text-[8px] font-mono text-slate-400 flex justify-between items-center">
              <span id="pdf-secure-encrypted-beacons" className="pdf-hub-text-green">SECURE ENCRYPTED BEACONS • GOOGLE INTEGRATION GATE v1.2</span>
              <span id="pdf-protected-user-consent" className="pdf-hub-text-green font-bold">PROTECTED USER CONSENT VIA FIREBASE ADMIN</span>
            </div>
          </div>
        </div>
      ) : (
        // ==================== COHESIVE PROJECTS & RBAC WORKSPACES (Phase 3) ====================
        <div className="flex flex-col gap-6 animate-fade-in" id="project-workspaces-dashboard">
          
          {activeProjectId === null ? (
            // PROJECT SELECTION DASHBOARD (LISTINGS VIEW)
            <div className="flex flex-col gap-6" id="projects-index">
              <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-start">
                  <Compass className="w-5 h-5 text-[#15462D] animate-spin-slow" />
                  <div>
                    <h3 id="pdf-available-env-title" className="pdf-hub-text-green font-mono font-extrabold text-[#15462D] text-xs uppercase">Available Scientific Environments</h3>
                    <p id="pdf-available-env-desc" className="pdf-hub-text-green text-[9.5px] text-slate-450 leading-none mt-1">Select and jump into a private container database or create one in under 60 seconds.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="py-2.5 px-4 bg-[#15462D] hover:bg-emerald-950 text-white font-mono font-black text-[10px] uppercase border-0 rounded cursor-pointer transition flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  + Create Project Workspace
                </button>
              </div>

              {/* SEARCH FILTER BAR */}
              <div className="flex items-center gap-2 border-2 border-slate-200 rounded p-2 bg-white">
                <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="FILTER WORKSPACES BY NAME OR TYPE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 font-mono text-[10px] font-bold text-slate-800 outline-none uppercase"
                />
              </div>

              {/* PROJECT WORKSPACE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="workspaces-grid">
                {projects
                  .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => {
                    const recordCount = p.records.length;
                    const memberCount = p.members.length;
                    return (
                      <div 
                        key={p.id}
                        className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-lg overflow-hidden transition-all duration-200 shadow-xs flex flex-col justify-between"
                      >
                        <div className="p-4 flex flex-col gap-2.5">
                          {/* Workspace Tag and Type */}
                          <div className="flex items-center justify-between">
                            <span className="pdf-card-type text-[8px] bg-slate-100 text-slate-600 font-mono font-bold uppercase py-0.5 px-2 rounded">
                              {p.type}
                            </span>
                            <span className="pdf-card-start text-[7.5px] font-mono text-slate-400 font-extrabold">
                              START: {p.startDate}
                            </span>
                          </div>

                          <h4 className="pdf-card-name text-sm font-extrabold text-slate-800 font-sans tracking-tight leading-snug">
                            {p.name}
                          </h4>

                          <p className="pdf-card-desc text-[10px] text-slate-500 font-sans leading-relaxed line-clamp-2">
                            {p.description}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <Compass className="pdf-card-icon w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="pdf-card-location text-[9px] font-mono font-bold text-slate-450 truncate">
                              {p.location || 'Morogoro Experimental Base'}
                            </span>
                          </div>
                        </div>

                        {/* Metrics bar and Jump Button */}
                        <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 font-mono text-[8.5px] text-slate-500">
                            <span className="pdf-card-metric flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <strong>{memberCount}</strong> Researchers
                            </span>
                            <span className="pdf-card-metric flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <strong>{recordCount}</strong> Records
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveProjectId(p.id);
                              setActiveProjectSubTab('overview');
                            }}
                            className="py-1 px-3 bg-emerald-800 text-white hover:bg-emerald-950 font-mono text-[9px] font-black uppercase rounded cursor-pointer transition flex items-center gap-1 border-0"
                          >
                            Enter Workspace
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            // ==================== WORKSPACE WORKBENCH INTERACTIVE DASHBOARD ====================
            <div className="flex flex-col gap-6 animate-fade-in" id="project-workbench">
              
              {/* TOP RETRACT NAVIGATION BAR */}
              <div className="flex items-center justify-between gap-4 bg-slate-900 text-white rounded-lg p-3.5 shadow-sm font-mono text-[10.5px]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setActiveProjectId(null);
                      setRoleSimulatorOverride(null);
                    }}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border-0 rounded cursor-pointer transition uppercase font-black text-[9px]"
                  >
                    ← Exit Workspace
                  </button>
                  <span className="text-slate-400 font-extrabold font-serif">/</span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-black text-[#A6E8B6] tracking-wider uppercase">{activeProject?.name}</span>
                    <span className="text-[8px] text-slate-400 mt-0.5">{activeProject?.type}</span>
                  </div>
                </div>

                {/* ROLE SIMULATOR OVERRIDE CONTROL ROW */}
                <div className="flex items-center gap-2.5 bg-slate-850 p-1 rounded border border-slate-750">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase hidden lg:inline-block">🧪 Simulate Role:</span>
                  <select
                    value={roleSimulatorOverride || getEffectiveRole(activeProject)}
                    onChange={(e) => {
                      setRoleSimulatorOverride(e.target.value);
                      showToast(`Role simulator switched: ${e.target.value}`);
                    }}
                    className="bg-slate-900 border-0 text-white rounded font-mono text-[9px] font-bold p-1 select-none focus:outline-none cursor-pointer uppercase text-emerald-350"
                  >
                    <option value="Administrator">1. Administrator (FULL SYSTEM)</option>
                    <option value="Project Leader">2. Project Leader (OWNER)</option>
                    <option value="Research Member">3. Research Member (FIELD)</option>
                    <option value="Reviewer">4. Reviewer (READ-ONLY)</option>
                  </select>
                </div>
              </div>

              {/* SYSTEM ACCESS BANNER INDICATOR */}
              <div className="bg-emerald-50 border-2 border-emerald-250/55 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-emerald-800 shrink-0" />
                  <div className="text-start leading-none">
                    <span>Active Member Scope: </span>
                    <strong className="text-emerald-800 font-extrabold uppercase">
                      {effectiveRole} {roleSimulatorOverride && ' (SIMULATOR FORCED)'}
                    </strong>
                    <div className="text-[8.5px] text-slate-450 mt-1 uppercase">
                      {effectiveRole === 'Administrator' && '✓ Global controls, raw database exports, full edit scopes.'}
                      {effectiveRole === 'Project Leader' && '✓ Details editor, member invites, revoke link, mock simulator.'}
                      {effectiveRole === 'Research Member' && '✓ Trap data logging, spec inputs, discussions, core analytics.'}
                      {effectiveRole === 'Reviewer' && '✗ Strict Read-Only limits. Data submission and link overrides locked.'}
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-[#15462D] text-white rounded-md flex items-center gap-1.5 select-none font-bold text-[9px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  REYNOLDS: <span className="font-extrabold">{(calc.reynoldsNumber).toFixed(0)}</span>
                </div>
              </div>

              {/* SECONDARY SIDE-DRAWER DASHBOARD NAVIGATION LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SUB MENU NAVIGATION BUTTONS (3 COLS) */}
                <div className="lg:col-span-3 flex flex-col gap-1 rounded bg-slate-50 border border-slate-205 p-2 text-left">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest pl-2 pb-1.5 border-b mb-1">Workspace Sections</span>
                  <button
                    onClick={() => setActiveProjectSubTab('overview')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'overview' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    📊 Workspace Overview
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('team')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'team' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    👥 Team Members
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('data')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'data' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    📋 Trap Data Entry
                  </button>
                  <button
                    onClick={() => {
                      setActiveProjectSubTab('specimens');
                      setEditingSpecimenId(null);
                    }}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition flex items-center justify-between ${activeProjectSubTab === 'specimens' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    <span>🔬 Specimens DB</span>
                    <span className="text-[7.5px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 py-0.5 px-1.5 rounded-full uppercase scale-90 text-[8px]">Active</span>
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('analytics')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition flex justify-between items-center ${activeProjectSubTab === 'analytics' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    📈 Private Charts
                    <Lock className="w-3 h-3 opacity-60" />
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('discussions')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'discussions' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    💬 Collaborative Chat
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('reviewer')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'reviewer' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    🔗 Reviewer Links
                  </button>
                  <button
                    onClick={() => setActiveProjectSubTab('reports')}
                    className={`py-2 px-3 rounded font-mono text-[10px] uppercase font-bold text-left transition ${activeProjectSubTab === 'reports' ? 'bg-[#15462D] text-white' : 'bg-transparent text-slate-650 hover:bg-slate-150'}`}
                  >
                    📄 Scientific Reports
                  </button>
                </div>

                {/* SUB TAB RENDER DETAILS (9 COLS) */}
                <div className="lg:col-span-9 bg-white border border-slate-205 rounded-xl p-5 min-h-[400px] flex flex-col justify-between">
                  
                  {/* OVERVIEW SUB-TAB */}
                  {activeProjectSubTab === 'overview' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in">
                      <div className="border-b pb-2 flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-[#15462D] uppercase font-mono">Overview & Environment</h3>
                          <p className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Physical telemetry statistics matching Morogoro grids</p>
                        </div>
                        <div className="flex gap-2">
                          {effectiveRole === 'Administrator' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this Workspace? All data captures will be wiped.')) {
                                  setProjects(projects.filter(p => p.id !== activeProject.id));
                                  setActiveProjectId(null);
                                  showToast('Workspace deleted.');
                                }
                              }}
                              className="px-3 py-1 bg-red-50 text-red-750 font-mono text-[9px] uppercase font-bold border border-red-200 rounded cursor-pointer"
                            >
                              Delete Workspace
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border p-3.5 rounded flex flex-col gap-2 font-mono text-[10px]">
                          <span className="font-black text-[#15462D] uppercase border-b pb-1">Workspace Specifications</span>
                          <p className="leading-relaxed">
                            <strong>Project ID:</strong> <span className="text-slate-500">{activeProject.id}</span>
                            <br /><strong>Type Scope:</strong> <span className="text-slate-500">{activeProject.type}</span>
                            <br /><strong>Location Coordinate:</strong> <span className="text-slate-500">{activeProject.location || 'Sokoine Extension Labs'}</span>
                            <br /><strong>Created Baseline:</strong> <span className="text-slate-500">{activeProject.startDate}</span>
                            <br /><strong>Invitation Code:</strong> <span className="font-bold text-emerald-800">{activeProject.invitationCode}</span>
                          </p>
                        </div>

                        <div className="bg-slate-50 border p-3.5 rounded flex flex-col gap-2 font-mono text-[10px]">
                          <span className="font-black text-[#15462D] uppercase border-b pb-1">Pneumatic Vector Settings</span>
                          <p className="leading-relaxed">
                            <strong>Inlet Pressure (P1):</strong> <span className="text-slate-500">{specs.p1} kPa</span>
                            <br /><strong>Darcy Factor f:</strong> <span className="text-slate-500">{calc.frictionFactor.toFixed(4)}</span>
                            <br /><strong>Speed (Max Canister):</strong> <span className="text-slate-500">{calc.maxCapsuleVelocity.toFixed(2)} m/s</span>
                            <br /><strong>Viscosity:</strong> <span className="text-slate-500">{calc.viscosity.toExponential(3)} Pa·s</span>
                            <br /><strong>Status Stamp:</strong> <span className="text-emerald-700 font-extrabold">● SECURE COMPLIANT</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#15462D]/5 border border-emerald-800/10 rounded-lg p-4 font-mono text-[10px] mt-2">
                        <strong className="text-emerald-950 uppercase tracking-wide block">Environment Description Note:</strong>
                        <p className="text-slate-700 leading-relaxed font-sans font-medium mt-1">
                          {activeProject.description}
                        </p>
                      </div>

                      <div className="bg-slate-50 border rounded-lg p-4 font-mono text-[10px]">
                        <strong className="text-slate-600 block uppercase">Project Metric Summaries</strong>
                        <div className="grid grid-cols-3 gap-2.5 mt-2 text-center text-slate-800">
                          <div className="bg-white border p-2 rounded">
                            <span className="text-slate-400 block text-[8px] uppercase">Researchers</span>
                            <span className="text-base font-black text-[#15462D]">{activeProject.members.length}</span>
                          </div>
                          <div className="bg-white border p-2 rounded">
                            <span className="text-slate-400 block text-[8px] uppercase">Trap Logs</span>
                            <span className="text-base font-black text-[#15462D]">{activeProject.records.length}</span>
                          </div>
                          <div className="bg-white border p-2 rounded">
                            <span className="text-slate-400 block text-[8px] uppercase">Active Reviewers</span>
                            <span className="text-base font-black text-[#15462D]">{activeProject.reviewerLinks.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEAM TAB AND MEMBER INVITATION SYSTEM */}
                  {activeProjectSubTab === 'team' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2 flex justify-between items-center flex-wrap gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-[#15462D] uppercase">Team Management Grid</h3>
                          <p className="text-[9px] text-slate-400 uppercase mt-0.5">Invite field members, set permissions, and manage reviewer credentials</p>
                        </div>
                        
                        {(effectiveRole === 'Administrator' || effectiveRole === 'Project Leader') && (
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="bg-[#15462D] hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-black tracking-widest py-2 px-3 rounded cursor-pointer border-0 flex items-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            + Invite Member
                          </button>
                        )}
                      </div>

                      {/* INVITATION SPEC INSTRUMENTS (OPTION B & C) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border p-3.5 rounded-lg">
                        <div>
                          <span className="text-[8.5px] font-black text-slate-400 block uppercase">Option B: Copy Secure Invitation Link</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              readOnly
                              value={`${window.location.origin}/join/project-${activeProject.id}`}
                              className="w-full text-[9px] bg-white border font-bold p-1 rounded"
                            />
                            <button
                              onClick={() => handleCopyToClipboard(`${window.location.origin}/join/project-${activeProject.id}`, activeProject.id, 'link')}
                              className="py-1 px-3 bg-emerald-800 text-white hover:bg-emerald-950 text-[9px] uppercase font-mono font-black shrink-0 border-0 cursor-pointer rounded"
                            >
                              {copiedLinkId === activeProject.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[8.5px] font-black text-slate-400 block uppercase">Option C: Invitation Code Stamp</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input
                              type="text"
                              readOnly
                              value={activeProject.invitationCode}
                              className="w-full text-[9px] bg-white border font-mono font-bold text-center text-emerald-850 p-1 rounded"
                            />
                            <button
                              onClick={() => handleCopyToClipboard(activeProject.invitationCode, activeProject.invitationCode, 'code')}
                              className="py-1 px-3 bg-emerald-800 text-white hover:bg-emerald-950 text-[9px] uppercase font-mono font-black shrink-0 border-0 cursor-pointer rounded"
                            >
                              {copiedCodeId === activeProject.invitationCode ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* TEAM GALAXY TABLE */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-1">Assigned Researchers Portal</span>
                        <div className="border rounded bg-white divide-y">
                          {activeProject.members.map((m) => (
                            <div key={m.userId} className="p-3 flex justify-between items-center hover:bg-slate-50">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 font-black text-white bg-slate-800 rounded-full flex items-center justify-center uppercase text-[10px]">
                                  {m.username[0]}
                                </div>
                                <div className="text-left">
                                  <span className="font-extrabold text-slate-800 block text-[11px]">@{m.username}</span>
                                  <span className="text-[7.5px] font-mono font-black text-slate-400 uppercase tracking-widest">{m.userId}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-mono leading-none tracking-wider text-white font-extrabold uppercase py-1 px-3.5 rounded-full ${
                                  m.role === 'Administrator' ? 'bg-red-800' :
                                  m.role === 'Project Leader' ? 'bg-[#15462D]' :
                                  m.role === 'Research Member' ? 'bg-emerald-900' : 'bg-slate-600'
                                }`}>
                                  {m.role}
                                </span>

                                {(effectiveRole === 'Administrator' || effectiveRole === 'Project Leader') && m.username !== currentUser?.username && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Revoke permission and remove scientist @${m.username} from this workspace?`)) {
                                        setProjects(projects.map(p => {
                                          if (p.id === activeProject.id) {
                                            return { ...p, members: p.members.filter(mem => mem.userId !== m.userId) };
                                          }
                                          return p;
                                        }));
                                        showToast(`Revoked @${m.username}.`);
                                      }
                                    }}
                                    className="p-1 px-1.5 text-xs text-red-650 font-bold hover:bg-red-50 rounded bg-transparent border-0 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DATA ENTRY PORTAL */}
                  {activeProjectSubTab === 'data' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2">
                        <h3 className="text-base font-extrabold text-[#15462D] uppercase flex items-center gap-1">
                          <Compass className="w-5 h-5 text-emerald-800 animate-pulse" />
                          KoboToolbox-Style Field Specimen Recorder
                        </h3>
                        <p className="text-[9.5px] text-slate-450 mt-1">Submit captures directly to the project ledger database.</p>
                      </div>

                      {effectiveRole === 'Reviewer' ? (
                        <div className="p-12 text-center border-2 border-dashed bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-500">
                          <Lock className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="font-extrabold text-slate-805 block uppercase">Data Entry Locked</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium mt-1 uppercase max-w-sm">You are logged in under Reviewer read-only parameters. Submitting captures is locked.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleLogDataRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-lg">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[8.5px] uppercase font-bold text-slate-600">Species Caught *</label>
                              <select
                                value={dataEntrySpecies}
                                onChange={(e) => setDataEntrySpecies(e.target.value)}
                                className="w-full text-xs font-bold bg-white border p-2 rounded"
                              >
                                <option value="Mastomys natalensis">Mastomys natalensis (Multimammate Mouse)</option>
                                <option value="Rattus rattus">Rattus rattus (Black Rat)</option>
                                <option value="Arvicanthis niloticus">Arvicanthis niloticus (Nile Rat)</option>
                                <option value="Mus musculus">Mus musculus (House Mouse)</option>
                                <option value="Other">Other Species</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <label className="text-[8.5px] uppercase font-bold text-slate-600">Specimen Count *</label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={dataEntryCount}
                                onChange={(e) => setDataEntryCount(Number(e.target.value))}
                                className="w-full text-xs font-bold bg-white border p-2 rounded"
                              />
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <label className="text-[8.5px] uppercase font-bold text-slate-600">Study Location *</label>
                              <input
                                type="text"
                                required
                                value={dataEntryLocation}
                                onChange={(e) => setDataEntryLocation(e.target.value)}
                                placeholder="E.G. Sector G4, Tunnel Segment A"
                                className="w-full text-xs font-bold bg-white border p-2 rounded uppercase"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col justify-between gap-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8.5px] uppercase font-bold text-slate-600">Start / Observation Date</label>
                                <input
                                  type="date"
                                  value={dataEntryDate}
                                  onChange={(e) => setDataEntryDate(e.target.value)}
                                  className="w-full text-xs bg-white border p-2 rounded"
                                />
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8.5px] uppercase font-bold text-slate-600">Comments / Specimen Biometrics</label>
                                <textarea
                                  value={dataEntryComments}
                                  onChange={(e) => setDataEntryComments(e.target.value)}
                                  placeholder="E.G. Nominal weights ~25g; Kinematic capsule speed stable."
                                  className="w-full text-xs bg-white border p-2 rounded h-20 placeholder-slate-400 resize-none font-sans"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 bg-[#15462D] hover:bg-emerald-950 text-white font-mono uppercase font-black tracking-widest text-[10px] rounded cursor-pointer transition shadow-sm border-0"
                            >
                              ✓ Submit DB Record Log
                            </button>
                          </div>
                        </form>
                      )}

                      {/* DATA TABLE LEDGER */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-1">Private Ledger Raw Records</span>
                        {activeProject.records.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 border text-slate-450 text-[10px]">
                            No registered specimens captured inside this workspace. Fill in details above.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border rounded divide-y max-h-60">
                            <table className="w-full font-mono text-[9.5px] text-left">
                              <thead className="bg-slate-150 text-slate-700 uppercase font-black">
                                <tr>
                                  <th className="p-2 border-r">Date</th>
                                  <th className="p-2 border-r">Taxonomy</th>
                                  <th className="p-2 border-r text-center">Count</th>
                                  <th className="p-2 border-r">Location</th>
                                  <th className="p-2 border-r text-center">Velocity</th>
                                  <th className="p-2 border-r">Comments</th>
                                  <th className="p-2">By</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y font-mono">
                                {activeProject.records.map((r) => (
                                  <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="p-2 border-r whitespace-nowrap">{r.date}</td>
                                    <td className="p-2 border-r font-sans font-bold italic text-slate-800">{r.speciesCaught}</td>
                                    <td className="p-2 border-r text-center font-black text-[#15462D]">{r.count}</td>
                                    <td className="p-2 border-r truncate max-w-[80px] uppercase font-bold">{r.location}</td>
                                    <td className="p-2 border-r text-center font-bold text-slate-700">{r.capsuleSpeed} m/s</td>
                                    <td className="p-2 border-r truncate max-w-[120px] font-sans font-medium text-slate-500" title={r.comments}>{r.comments}</td>
                                    <td className="p-2 font-bold text-[#15462D]">@{r.submittedBy}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PRIVATE ANALYTICS SUB-TAB */}
                  {activeProjectSubTab === 'analytics' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-extrabold text-red-850 uppercase flex items-center gap-1.5">
                            <Lock className="w-5 h-5 text-red-800 animate-pulse" />
                            Private Analytics Grid Panel
                          </h3>
                          <p className="text-[9.5px] text-slate-450 mt-1">
                            Authorized access verified. Displaying raw telemetry, specimen curves and farm outcomes.
                          </p>
                        </div>
                        <span className="text-[8px] bg-red-100 text-red-800 font-extrabold py-0.5 px-2.5 rounded-full uppercase tracking-wider">
                          🔒 Internal Scope
                        </span>
                      </div>

                      {/* PRIVATE PLOTS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border p-3.5 rounded-lg flex flex-col gap-2 text-center">
                          <span className="text-[8.5px] font-black text-slate-450 uppercase block mb-1">Rodent Capture Specimen Density (Recharts)</span>
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getAggregatedSpeciesData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{fontSize: 7}} />
                                <YAxis tick={{fontSize: 7}} />
                                <Tooltip contentStyle={{fontSize: 8}} />
                                <Bar dataKey="value" fill="#15462D" radius={[2, 2, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="bg-slate-50 border p-3.5 rounded-lg flex flex-col gap-2 text-center">
                          <span className="text-[8.5px] font-black text-slate-450 uppercase block mb-1">Longitudinal Capture Timeline (Recharts)</span>
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getTimelineData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{fontSize: 7}} />
                                <YAxis tick={{fontSize: 7}} />
                                <Tooltip contentStyle={{fontSize: 8}} />
                                <Line type="monotone" dataKey="Count" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 5 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#15462D]/5 border p-3 rounded-lg flex items-center gap-3">
                        <Info className="w-5 h-5 text-emerald-800 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-800">SCIENTIFIC CALIBRATION RATIO:</p>
                          <p className="text-[9px] text-slate-500 font-sans leading-relaxed mt-0.5">
                            Differential pressure vectors (P1: {specs.p1} kPa, P2: {specs.p2} kPa) achieve steady kinematic capsule friction ratios matching standard transport margins of the Polyamide-6 tunnel linings.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DISCUSSION SCREEN */}
                  {activeProjectSubTab === 'discussions' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-extrabold text-[#15462D] uppercase flex items-center gap-1">
                            <MessageSquare className="w-5 h-5 text-emerald-800" />
                            Peer Collaboration &amp; Mentions Ring
                          </h3>
                          <p className="text-[9.5px] text-slate-450 mt-1">Real-time-like workspace discussion. Type '@' to list team members.</p>
                        </div>
                      </div>

                      {/* POST NEW COMMENT FORM */}
                      {effectiveRole === 'Reviewer' ? (
                        <div className="p-6 text-center border-2 border-dashed bg-slate-50 rounded-lg flex flex-col items-center justify-center text-slate-500">
                          <Lock className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="font-extrabold text-slate-805 block uppercase">Chat Interdicted</span>
                          <span className="text-[10px] text-slate-400 font-sans font-medium mt-1 uppercase max-w-sm">Reviewer role limits posting comments. Read-only channel view live.</span>
                        </div>
                      ) : (
                        <form onSubmit={handlePostComment} className="flex flex-col gap-2 bg-slate-50 border p-3 rounded-lg relative">
                          <div className="relative">
                            <textarea
                              value={commentText}
                              onChange={(e) => {
                                setCommentText(e.target.value);
                                if (e.target.value.endsWith('@')) {
                                  setShowMemberMentions(true);
                                } else if (!e.target.value.includes('@')) {
                                  setShowMemberMentions(false);
                                }
                              }}
                              placeholder="Type scientific note. Mention team members using '@' (e.g. @AminaResearch)..."
                              className="w-full text-xs bg-white border p-2 rounded h-20 placeholder-slate-450 font-sans resize-none font-medium text-slate-700 outline-none"
                            />

                            {/* Mentions dropdown list */}
                            {showMemberMentions && (
                              <div className="absolute left-2 bottom-2 bg-slate-900 text-white rounded shadow-2xl border-2 border-slate-700 p-1 w-48 z-40">
                                <span className="text-[7.5px] text-emerald-430 font-black block p-1 border-b tracking-wider uppercase">Project Members:</span>
                                {activeProject.members.map(m => (
                                  <button
                                    key={m.userId}
                                    type="button"
                                    onClick={() => {
                                      const stripped = commentText.slice(0, -1); // remove trailing @
                                      setCommentText(stripped + `@` + m.username + ` `);
                                      setShowMemberMentions(false);
                                      showToast(`Mention added: @${m.username}`);
                                    }}
                                    className="w-full text-left font-mono text-[9.5px] p-1 font-bold hover:bg-slate-800 rounded bg-transparent border-0 cursor-pointer text-white block uppercase"
                                  >
                                    @{m.username} ({m.role})
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {/* Mock Attachment tools */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAttachedFiles([{ name: 'Calib_vector_2026.png', url: '#', tempType: 'image' }]);
                                  showToast('Mock image attached.');
                                }}
                                className="px-2 py-1 bg-white hover:bg-slate-205 border text-[9px] font-black uppercase text-slate-500 rounded cursor-pointer"
                              >
                                Attach image
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAttachedFiles([{ name: 'surveillance_log_morogoro.csv', url: '#', tempType: 'file' }]);
                                  showToast('Mock file attached.');
                                }}
                                className="px-2 py-1 bg-white hover:bg-slate-205 border text-[9px] font-black uppercase text-slate-500 rounded cursor-pointer"
                              >
                                Attach raw file
                              </button>
                              {attachedFiles.length > 0 && (
                                <span className="text-[8.5px] text-[#15462D] font-extrabold flex items-center gap-1">
                                  📎 {attachedFiles[0].name}
                                </span>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="py-1.5 px-4 bg-[#15462D] hover:bg-emerald-950 text-white font-mono uppercase font-black tracking-widest text-[10px] rounded cursor-pointer border-0"
                            >
                              Publish Note
                            </button>
                          </div>
                        </form>
                      )}

                      {/* REVIEWS DISCUSSIONS MESSAGES LIST */}
                      <div className="flex flex-col gap-4 max-h-80 overflow-y-auto mt-2">
                        {activeProject.comments.map((c) => (
                          <div key={c.id} className="border-l-4 border-[#15462D]/60 pl-3 py-1 flex flex-col gap-1.5 text-left bg-slate-50/50 p-2.5 rounded-r">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-slate-850 text-xs">@{c.username}</span>
                              <span className="text-[8px] text-slate-400 font-mono">{new Date(c.timestamp).toLocaleString()}</span>
                            </div>

                            <p className="text-slate-650 font-sans font-medium text-[11px] leading-relaxed break-anywhere">
                              {c.text}
                            </p>

                            {/* Media Files */}
                            {c.attachments && (
                              <div className="flex items-center gap-1.5 bg-white border p-1.5 rounded self-start mt-1">
                                <span className="text-[9px] font-mono font-bold text-slate-750">📎 {c.attachments[0].name}</span>
                                <span className="text-[7.5px] text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded uppercase font-black">{c.attachments[0].tempType || 'file'}</span>
                              </div>
                            )}

                            {/* Threaded replies */}
                            {c.replies && c.replies.length > 0 && (
                              <div className="ml-4 mt-2 border-l border-slate-200 pl-3 flex flex-col gap-2 bg-white/60 p-2 rounded">
                                {c.replies.map((reply) => (
                                  <div key={reply.id} className="text-left">
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-700 text-[10px]">@{reply.username}</span>
                                      <span className="text-[7.5px] text-slate-400 font-mono">{new Date(reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-slate-600 font-sans text-[10.5px] leading-tight font-medium mt-0.5 break-anywhere">
                                      {reply.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply compose input toggles */}
                            {effectiveRole !== 'Reviewer' && (
                              <div className="mt-1 flex flex-col gap-1.5 ml-4 text-left">
                                {showReplyInputMap[c.id] ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Reply on this scientific thread..."
                                      value={replyTextMap[c.id] || ''}
                                      onChange={(e) => setReplyTextMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                                      className="w-full text-[10px] bg-white border p-1 rounded font-sans"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handlePostReply(c.id)}
                                      className="py-1 px-3 bg-emerald-900 hover:bg-emerald-950 text-white font-mono text-[9px] uppercase font-black rounded border-0 cursor-pointer"
                                    >
                                      Send
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowReplyInputMap(prev => ({ ...prev, [c.id]: false }))}
                                      className="text-slate-400 hover:text-slate-700 font-bold font-mono text-[9px] uppercase"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowReplyInputMap(prev => ({ ...prev, [c.id]: true }))}
                                    className="text-[9px] text-[#15462D] font-black uppercase hover:underline text-left cursor-pointer bg-transparent border-0 self-start mt-1"
                                  >
                                    ↳ Threaded Reply
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REVIEWER GUEST TRANS-LINKS GENERATION */}
                  {activeProjectSubTab === 'reviewer' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2">
                        <h3 className="text-base font-extrabold text-[#15462D] uppercase flex items-center gap-1.5">
                          <Link2 className="w-5 h-5 text-emerald-800" />
                          Reviewer Access Token Generator
                        </h3>
                        <p className="text-[9.5px] text-slate-450 mt-1">
                          Generate secure linkages tailored for external journals, directors, or donor verifiers.
                        </p>
                      </div>

                      {(effectiveRole === 'Administrator' || effectiveRole === 'Project Leader') ? (
                        <div className="bg-slate-50 border p-4 rounded-lg flex flex-col gap-3">
                          <span className="text-[9.5px] font-black uppercase text-slate-400">Configure Reviewer Link Scope</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[8.5px] uppercase font-bold text-slate-650">Reviewer Access Settings</label>
                              <select
                                value={reviewerAccessType}
                                onChange={(e) => setReviewerAccessType(e.target.value as any)}
                                className="bg-white border p-2 text-xs font-bold rounded"
                              >
                                <option value="Dashboard Only">Dashboard Only</option>
                                <option value="Charts Only">Charts Only</option>
                                <option value="Reports Only">Reports Only</option>
                                <option value="Full Read-Only Access">Full Read-Only Access</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <label className="text-[8.5px] uppercase font-bold text-slate-650">Expiration Interval</label>
                              <select
                                value={reviewerExpiration}
                                onChange={(e) => setReviewerExpiration(e.target.value as any)}
                                className="bg-white border p-2 text-xs font-bold rounded"
                              >
                                <option value="7 Days">7 Days Expiry</option>
                                <option value="30 Days">30 Days Expiry</option>
                                <option value="Custom">Custom Infinite Duration</option>
                              </select>
                            </div>
                          </div>

                          <button
                            onClick={handleGenerateReviewerLink}
                            className="bg-[#15462D] hover:bg-emerald-950 text-white font-mono text-[10px] uppercase font-black py-2.5 tracking-wider rounded cursor-pointer border-0 mt-2.5"
                          >
                            ✓ Render Secure Share Token
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-100 text-slate-500 rounded uppercase text-[10px] font-extrabold text-center border">
                          ⚠️ Only Administrator or Project Leaders are authorized to deploy Reviewer-Link tokens.
                        </div>
                      )}

                      {/* ACTIVE REVIEWER TOKEN LIST */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-1">Active Reviewer Share Seals</span>
                        {activeProject.reviewerLinks.length === 0 ? (
                          <div className="p-8 text-center text-[10px] text-slate-400 bg-slate-50 border rounded">
                            No Reviewer Links configured. Deploy one above to authorize guest audits.
                          </div>
                        ) : (
                          <div className="border rounded bg-white divide-y">
                            {activeProject.reviewerLinks.map((l) => (
                              <div key={l.id} className="p-3 flex justify-between items-center hover:bg-slate-50 flex-wrap gap-2.5 text-[10.5px]">
                                <div className="text-left flex flex-col gap-0.5">
                                  <strong className="text-slate-800 flex items-center gap-1.5 font-black uppercase tracking-wider">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    {l.code}
                                  </strong>
                                  <span className="text-[8px] text-slate-400">CREATED: {l.createdAt} • EXPR: {l.expiresAt}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[8.5px] bg-slate-100 text-slate-700 font-extrabold uppercase py-1 px-3.5 rounded-full border">
                                    🔭 {l.accessType}
                                  </span>

                                  <button
                                    onClick={() => handleCopyToClipboard(`${window.location.origin}/join/project-${activeProject.id}?reviewerCode=${l.code}`, l.id, 'link')}
                                    className="p-1 px-2 border hover:bg-slate-100 text-slate-650 font-black rounded cursor-pointer text-[9.5px]"
                                  >
                                    {copiedLinkId === l.id ? 'Copied' : 'Copy Link'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      // Simulate joining as reviewer instantly
                                      setRoleSimulatorOverride('Reviewer');
                                      setActiveProjectSubTab('overview');
                                      showToast(`Joined instantly as read-only audit Guest Reviewer.`);
                                    }}
                                    className="p-1 px-2 bg-[#15462D]/10 text-[#15462D] font-mono hover:bg-[#15462D]/15 font-black rounded cursor-pointer text-[9.5px] border-0"
                                    title="Simulate entering project with this guest token scope"
                                  >
                                    Test Guest View
                                  </button>

                                  {(effectiveRole === 'Administrator' || effectiveRole === 'Project Leader') && (
                                    <button
                                      onClick={() => {
                                        setProjects(projects.map(p => {
                                          if (p.id === activeProject.id) {
                                            return { ...p, reviewerLinks: p.reviewerLinks.filter(rv => rv.id !== l.id) };
                                          }
                                          return p;
                                        }));
                                        showToast('Revoked token.');
                                      }}
                                      className="p-1 text-red-650 hover:bg-red-50 rounded bg-transparent border-0 cursor-pointer"
                                    >
                                      Revoke
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* REPORT SECTION */}
                  {activeProjectSubTab === 'reports' && activeProject && (
                    <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]">
                      <div className="border-b pb-2">
                        <h3 className="text-base font-extrabold text-[#15462D] uppercase">Scientific Reports &amp; Exports Ledger</h3>
                        <p className="text-[9.5px] text-slate-450 mt-1">Compose scientific research summary records matching v2026 mandates.</p>
                      </div>

                      <p className="text-slate-650 leading-relaxed font-sans font-medium">
                        Standard scientific reports include species density counts, microclimate parameters, Darcy friction timelines, flow regimes, and Reynolds constants.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                          <div>
                            <span className="font-extrabold text-[#15462D] block uppercase">Export Scientific PDF Record</span>
                            <span className="text-[9px] text-slate-450 block font-sans font-medium leading-relaxed mt-1">Generates a diagnostic document signed with secure system calib numbers. Perfect for donors or regulators.</span>
                          </div>
                          
                          <button
                            onClick={() => handleTriggerMockExport('pdf')}
                            className="bg-emerald-900 text-white hover:bg-emerald-950 font-mono text-[9px] uppercase font-black tracking-widest py-2 px-4 rounded border-0 cursor-pointer"
                          >
                            Export PDF summary
                          </button>
                        </div>

                        <div className="bg-slate-50 border p-4 rounded-lg flex flex-col justify-between items-start gap-4">
                          <div>
                            <span className="font-extrabold text-[#15462D] block uppercase">Export Spreadsheet Excel Grid</span>
                            <span className="text-[9px] text-slate-450 block font-sans font-medium leading-relaxed mt-1">Extracts raw tables containing date of catch, geolocation, and species density matrices.</span>
                          </div>

                          <button
                            onClick={() => handleTriggerMockExport('excel')}
                            className="bg-emerald-900 text-white hover:bg-emerald-950 font-mono text-[9px] uppercase font-black tracking-widest py-2 px-4 rounded border-0 cursor-pointer"
                          >
                            Export Excel Worksheet
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPECIMENS DATABASE SECTION */}
                  {activeProjectSubTab === 'specimens' && activeProject && (() => {
                    const sampleSpecList = activeProject.specimens || [];
                    
                    // Filter specimens
                    const filteredSpecimens = sampleSpecList.filter(spec => {
                      // search match
                      const query = specimenSearchQuery.toLowerCase().trim();
                      const matchSearch = !query || 
                        spec.id.toLowerCase().includes(query) ||
                        spec.village.toLowerCase().includes(query) ||
                        spec.siteName.toLowerCase().includes(query) ||
                        spec.district.toLowerCase().includes(query) ||
                        spec.researchTeam.toLowerCase().includes(query) ||
                        spec.observerNotes.toLowerCase().includes(query);
                        
                      // species match
                      const matchSpecies = specimenFilterSpecies === 'all' || spec.species === specimenFilterSpecies;
                      
                      // lab test match
                      let matchLab = true;
                      if (specimenFilterLabTest === 'virus-positive') matchLab = spec.virusPcr === 'Positive';
                      else if (specimenFilterLabTest === 'plague-positive') matchLab = spec.plagueAntibody === 'Positive';
                      else if (specimenFilterLabTest === 'leptospira-positive') matchLab = spec.leptospiraPcr === 'Positive';
                      else if (specimenFilterLabTest === 'any-pathogen') {
                        matchLab = spec.virusPcr === 'Positive' || spec.plagueAntibody === 'Positive' || spec.leptospiraPcr === 'Positive';
                      }
                      
                      // status match
                      let matchStatus = true;
                      if (specimenFilterStatus === 'survived-all') {
                        matchStatus = spec.survival24h === 'Alive' && spec.survival1wk === 'Alive' && spec.survival2wk === 'Alive' && spec.survival1m === 'Alive' && spec.survival3m === 'Alive';
                      } else if (specimenFilterStatus === 'died-24h') {
                        matchStatus = spec.survival24h === 'Deceased';
                      } else if (specimenFilterStatus === 'lost-monitoring') {
                        matchStatus = spec.survival1wk === 'Lost' || spec.survival2wk === 'Lost' || spec.survival1m === 'Lost' || spec.survival3m === 'Lost';
                      }
                      
                      return matchSearch && matchSpecies && matchLab && matchStatus;
                    });

                    // Stats helper calculations
                    const totalSpecCount = sampleSpecList.length;
                    const maleCount = sampleSpecList.filter(s => s.sex === 'Male').length;
                    const femaleCount = sampleSpecList.filter(s => s.sex === 'Female').length;
                    const pcrPositiveCount = sampleSpecList.filter(s => s.virusPcr === 'Positive' || s.plagueAntibody === 'Positive' || s.leptospiraPcr === 'Positive').length;
                    const pathogenRatePct = totalSpecCount > 0 ? ((pcrPositiveCount / totalSpecCount) * 100).toFixed(1) : '0';
                    const deathCount24h = sampleSpecList.filter(s => s.survival24h === 'Deceased').length;
                    const mortalityRate24hPct = totalSpecCount > 0 ? ((deathCount24h / totalSpecCount) * 100).toFixed(1) : '0';

                    // Pathogen counts for charts
                    const virusPosTotal = sampleSpecList.filter(s => s.virusPcr === 'Positive').length;
                    const plaguePosTotal = sampleSpecList.filter(s => s.plagueAntibody === 'Positive').length;
                    const leptoPosTotal = sampleSpecList.filter(s => s.leptospiraPcr === 'Positive').length;
                    
                    const pathogenChartData = [
                      { name: 'Lassa Virus PCR', Positive: virusPosTotal, Negative: totalSpecCount - virusPosTotal },
                      { name: 'Plague Antibody', Positive: plaguePosTotal, Negative: totalSpecCount - plaguePosTotal },
                      { name: 'Leptospira PCR', Positive: leptoPosTotal, Negative: totalSpecCount - leptoPosTotal }
                    ];

                    // Survival Over Time data
                    // Calculate cohort counts
                    const surv0 = totalSpecCount;
                    const surv24h = sampleSpecList.filter(s => s.survival24h === 'Alive').length;
                    const surv1wk = sampleSpecList.filter(s => s.survival1wk === 'Alive' || s.survival1wk === 'Recaptured').length;
                    const surv2wk = sampleSpecList.filter(s => s.survival2wk === 'Alive' || s.survival2wk === 'Recaptured').length;
                    const surv1m = sampleSpecList.filter(s => s.survival1m === 'Alive' || s.survival1m === 'Recaptured').length;
                    const surv3m = sampleSpecList.filter(s => s.survival3m === 'Alive' || s.survival3m === 'Recaptured').length;

                    const survivalLineData = [
                      { period: 'Baseline (0h)', Surviving_Rodents: surv0 },
                      { period: 'Post-Capture (24h)', Surviving_Rodents: surv24h },
                      { period: '1 Week Check', Surviving_Rodents: surv1wk },
                      { period: '2 Weeks Check', Surviving_Rodents: surv2wk },
                      { period: '1 Month Check', Surviving_Rodents: surv1m },
                      { period: '3 Months Check', Surviving_Rodents: surv3m }
                    ];

                    // Weight range data calculation
                    const weightGroupData = [
                      { name: 'Juvenile Group (< 35g)', count: sampleSpecList.filter(s => s.weight > 0 && s.weight < 35).length },
                      { name: 'Sub-adult Group (35-75g)', count: sampleSpecList.filter(s => s.weight >= 35 && s.weight < 75).length },
                      { name: 'Adult Group (75-115g)', count: sampleSpecList.filter(s => s.weight >= 75 && s.weight < 115).length },
                      { name: 'Apex Group (> 115g)', count: sampleSpecList.filter(s => s.weight >= 115).length }
                    ];

                    // Real-time warning verification logic
                    const curWarnings = getSpecimenValidationWarnings();

                    // CSV exporter
                    const handleExportSpecimensCSV = () => {
                      if (filteredSpecimens.length === 0) {
                        alert("No specimen records to export under current filters.");
                        return;
                      }
                      
                      const headers = [
                        "id", "captureDate", "captureTime", "researchProject", "siteName", "farmId", "warehouseId", "researchTeam",
                        "country", "region", "district", "village", "gpsLatitude", "gpsLongitude", "altitude",
                        "species", "sex", "ageClass", "reproductiveStatus", "weight_g", "headBodyLength_mm", "tailLength_mm", "hindFootLength_mm", "earLength_mm",
                        "bodyConditionScore", "externalParasiteLoad", "internalParasiteStatus", "visibleInjuries", "diseaseNotes",
                        "survival24h", "survival1wk", "survival2wk", "survival1m", "survival3m",
                        "virusPcr", "plagueAntibody", "leptospiraPcr", "bacterialCulture", "observerNotes"
                      ];
                      
                      const rows = filteredSpecimens.map(s => [
                        s.id, s.captureDate, s.captureTime, s.researchProject, s.siteName, s.farmId, s.warehouseId, s.researchTeam,
                        s.country, s.region, s.district, s.village, s.gpsLatitude, s.gpsLongitude, s.altitude,
                        s.species, s.sex, s.ageClass, s.reproductiveStatus, s.weight, s.headBodyLength, s.tailLength, s.hindFootLength, s.earLength,
                        s.bodyConditionScore, s.externalParasiteLoad, s.internalParasiteStatus, s.visibleInjuries, `"${(s.diseaseNotes || '').replace(/"/g, '""')}"`,
                        s.survival24h, s.survival1wk, s.survival2wk, s.survival1m, s.survival3m,
                        s.virusPcr, s.plagueAntibody, s.leptospiraPcr, s.bacterialCulture, `"${(s.observerNotes || '').replace(/"/g, '""')}"`
                      ]);
                      
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                      
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `ERICON_SpecimenDatabase_${activeProject.name}_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast("CSV exported successfully.");
                    };

                    // Bulk ingestion simulator
                    const handleTriggerSimulatedBulkIngest = () => {
                      const baseId = Date.now();
                      const bulkRows: SpecimenRecord[] = [
                        {
                          id: `spec-bulk-${baseId}-1`,
                          captureDate: new Date().toISOString().slice(0, 10),
                          captureTime: '06:30',
                          researchProject: activeProject.name,
                          siteName: 'Grid-Kappa Protection Segment',
                          farmId: 'FARM-MOR-11',
                          warehouseId: 'N/A',
                          researchTeam: 'Biosecurity Protection Unit',
                          country: 'Tanzania',
                          region: 'Morogoro',
                          district: 'Morogoro Municipal',
                          village: 'Msolwa',
                          gpsLatitude: -6.829,
                          gpsLongitude: 37.669,
                          altitude: 535,
                          species: 'Mastomys natalensis',
                          sex: 'Male',
                          ageClass: 'Adult',
                          reproductiveStatus: 'Active',
                          weight: 48,
                          headBodyLength: 114,
                          tailLength: 118,
                          hindFootLength: 21,
                          earLength: 16,
                          bodyConditionScore: 3,
                          externalParasiteLoad: 'None',
                          internalParasiteStatus: 'Negative',
                          visibleInjuries: 'None',
                          diseaseNotes: 'Bulk Ingested raw row check.',
                          survival24h: 'Alive',
                          survival1wk: 'Alive',
                          survival2wk: 'Alive',
                          survival1m: 'Alive',
                          survival3m: 'Alive',
                          observerNotes: 'Pneumatic tunnel interception specimen.',
                          virusPcr: 'Negative',
                          plagueAntibody: 'Negative',
                          leptospiraPcr: 'Negative',
                          bacterialCulture: 'No growth',
                        },
                        {
                          id: `spec-bulk-${baseId}-2`,
                          captureDate: new Date().toISOString().slice(0, 10),
                          captureTime: '06:45',
                          researchProject: activeProject.name,
                          siteName: 'Dodoma Cargo Depot C',
                          farmId: 'N/A',
                          warehouseId: 'WH-DODM-04',
                          researchTeam: 'Central Grain Patrol',
                          country: 'Tanzania',
                          region: 'Dodoma',
                          district: 'Dodoma Municipal',
                          village: 'Chidachi',
                          gpsLatitude: -6.172,
                          gpsLongitude: 35.748,
                          altitude: 1120,
                          species: 'Rattus rattus',
                          sex: 'Female',
                          ageClass: 'Sub-adult',
                          reproductiveStatus: 'Inactive',
                          weight: 115,
                          headBodyLength: 138,
                          tailLength: 142,
                          hindFootLength: 26,
                          earLength: 18,
                          bodyConditionScore: 4,
                          externalParasiteLoad: 'Medium',
                          internalParasiteStatus: 'Untested',
                          visibleInjuries: 'None',
                          diseaseNotes: 'Healthy cohort in silos.',
                          survival24h: 'Alive',
                          survival1wk: 'Alive',
                          survival2wk: 'Alive',
                          survival1m: 'Alive',
                          survival3m: 'Alive',
                          observerNotes: 'Active food scavenger vectors captured.',
                          virusPcr: 'Negative',
                          plagueAntibody: 'Negative',
                          leptospiraPcr: 'Negative',
                          bacterialCulture: 'Proteus growth negative'
                        },
                        {
                          id: `spec-bulk-${baseId}-3`,
                          captureDate: new Date().toISOString().slice(0, 10),
                          captureTime: '07:15',
                          researchProject: activeProject.name,
                          siteName: 'Grid-Alpha Central',
                          farmId: 'FARM-MOR-04',
                          researchTeam: 'Team Morogoro East',
                          warehouseId: 'N/A',
                          country: 'Tanzania',
                          region: 'Morogoro',
                          district: 'Morogoro Municipal',
                          village: 'Kihonda',
                          gpsLatitude: -6.823,
                          gpsLongitude: 37.660,
                          altitude: 532,
                          species: 'Mastomys natalensis',
                          sex: 'Female',
                          ageClass: 'Adult',
                          reproductiveStatus: 'Pregnant',
                          weight: 59,
                          headBodyLength: 125,
                          tailLength: 121,
                          hindFootLength: 23,
                          earLength: 18,
                          bodyConditionScore: 5,
                          externalParasiteLoad: 'Low',
                          internalParasiteStatus: 'Positive',
                          visibleInjuries: 'Mild',
                          diseaseNotes: 'Earmarked with tagging #EA-108',
                          survival24h: 'Alive',
                          survival1wk: 'Alive',
                          survival2wk: 'Recaptured',
                          survival1m: 'Alive',
                          survival3m: 'Alive',
                          observerNotes: 'High fat deposits.',
                          virusPcr: 'Positive',
                          plagueAntibody: 'Negative',
                          leptospiraPcr: 'Positive',
                          bacterialCulture: 'Leptospira interrogans PCR positive'
                        }
                      ];

                      const updated = projects.map(p => {
                        if (p.id === activeProject.id) {
                          return {
                            ...p,
                            specimens: [...bulkRows, ...(p.specimens || [])]
                          };
                        }
                        return p;
                      });
                      
                      setProjects(updated);
                      showToast("📥 Successfully bulk-ingested 3 research-grade specimens!");
                      triggerNotification(
                        '📥 Bulk Ingestion Active',
                        `Imported 3 external records matching v2026 ecological research standards.`
                      );
                    };

                    // Action: Save custom specimen (Add or Update)
                    const onSaveSpecimenForm = (e: React.FormEvent) => {
                      e.preventDefault();
                      
                      // Check for strict validation errors
                      const warnings = getSpecimenValidationWarnings();
                      const severeErrors = warnings.filter(w => w.includes("must be") || w.includes("cannot have") || w.includes("cannot be") || w.includes("CRITICAL ERROR"));
                      if (severeErrors.length > 0) {
                        alert(`❌ SCIENTIFIC VALIDATION FAILURES:\n\n${severeErrors.join('\n')}\n\nPlease correct values before savings.`);
                        return;
                      }

                      if (editingSpecimenId) {
                        // Editing existing record
                        const updatedSpecsList = sampleSpecList.map(s => {
                          if (s.id === editingSpecimenId) {
                            return {
                              ...s,
                              captureDate: sCaptureDate,
                              captureTime: sCaptureTime,
                              siteName: sSiteName || 'Main Research Site',
                              farmId: sFarmId || 'N/A',
                              warehouseId: sWarehouseId || 'N/A',
                              researchTeam: sResearchTeam || 'Field team alpha',
                              country: sCountry,
                              region: sRegion,
                              district: sDistrict,
                              village: sVillage || 'Default vil',
                              gpsLatitude: Number(sGpsLatitude) || 0,
                              gpsLongitude: Number(sGpsLongitude) || 0,
                              altitude: Number(sAltitude) || 0,
                              species: sSpecies,
                              sex: sSex,
                              ageClass: sAgeClass,
                              reproductiveStatus: sReproductiveStatus,
                              weight: Number(sWeight) || 0,
                              headBodyLength: Number(sHeadBodyLength) || 0,
                              tailLength: Number(sTailLength) || 0,
                              hindFootLength: Number(sHindFootLength) || 0,
                              earLength: Number(sEarLength) || 45,
                              bodyConditionScore: Number(sBodyConditionScore),
                              externalParasiteLoad: sExternalParasiteLoad,
                              internalParasiteStatus: sInternalParasiteStatus,
                              visibleInjuries: sVisibleInjuries,
                              diseaseNotes: sDiseaseNotes || 'None',
                              survival24h: sSurvival24h,
                              survival1wk: sSurvival1wk,
                              survival2wk: sSurvival2wk,
                              survival1m: sSurvival1m,
                              survival3m: sSurvival3m,
                              observerNotes: sObserverNotes || 'None',
                              attachments: sAttachments || '',
                              virusPcr: sVirusPcr,
                              plagueAntibody: sPlagueAntibody,
                              leptospiraPcr: sLeptospiraPcr,
                              bacterialCulture: sBacterialCulture || 'No growth'
                            };
                          }
                          return s;
                        });

                        setProjects(projects.map(p => {
                          if (p.id === activeProject.id) {
                            return { ...p, specimens: updatedSpecsList };
                          }
                          return p;
                        }));

                        setEditingSpecimenId(null);
                        setSpecimenViewSubMode('view');
                        showToast(`✓ Updated Specimen database successfully!`);
                        
                        // Clear input fields
                        setSSiteName(''); setSFarmId(''); setSWarehouseId(''); setSVillage(''); setSDiseaseNotes(''); setSObserverNotes(''); setSAttachments('');
                      } else {
                        // Registering new record
                        const newSpec: SpecimenRecord = {
                          id: 'spec-' + Date.now(),
                          captureDate: sCaptureDate,
                          captureTime: sCaptureTime,
                          researchProject: activeProject.name,
                          siteName: sSiteName || 'Main Research Site',
                          farmId: sFarmId || 'N/A',
                          warehouseId: sWarehouseId || 'N/A',
                          researchTeam: sResearchTeam || 'Field Team Alpha',
                          country: sCountry,
                          region: sRegion,
                          district: sDistrict,
                          village: sVillage || 'Field site',
                          gpsLatitude: Number(sGpsLatitude) || -6.82,
                          gpsLongitude: Number(sGpsLongitude) || 37.66,
                          altitude: Number(sAltitude) || 526,
                          species: sSpecies,
                          sex: sSex,
                          ageClass: sAgeClass,
                          reproductiveStatus: sReproductiveStatus,
                          weight: Number(sWeight) || 0,
                          headBodyLength: Number(sHeadBodyLength) || 0,
                          tailLength: Number(sTailLength) || 0,
                          hindFootLength: Number(sHindFootLength) || 0,
                          earLength: Number(sEarLength) || 12,
                          bodyConditionScore: Number(sBodyConditionScore),
                          externalParasiteLoad: sExternalParasiteLoad,
                          internalParasiteStatus: sInternalParasiteStatus,
                          visibleInjuries: sVisibleInjuries,
                          diseaseNotes: sDiseaseNotes || 'None',
                          survival24h: sSurvival24h,
                          survival1wk: sSurvival1wk,
                          survival2wk: sSurvival2wk,
                          survival1m: sSurvival1m,
                          survival3m: sSurvival3m,
                          observerNotes: sObserverNotes || 'None',
                          attachments: sAttachments || '',
                          virusPcr: sVirusPcr,
                          plagueAntibody: sPlagueAntibody,
                          leptospiraPcr: sLeptospiraPcr,
                          bacterialCulture: sBacterialCulture || 'No growth'
                        };

                        setProjects(projects.map(p => {
                          if (p.id === activeProject.id) {
                            return {
                              ...p,
                              specimens: [newSpec, ...(p.specimens || [])]
                            };
                          }
                          return p;
                        }));

                        setSpecimenViewSubMode('view');
                        showToast(`✓ Successfully logged Specimen #${newSpec.id.slice(-5)}!`);
                        
                        // Clear inputs
                        setSSiteName(''); setSFarmId(''); setSWarehouseId(''); setSVillage(''); setSDiseaseNotes(''); setSObserverNotes(''); setSAttachments('');
                      }
                    };

                    const handleStartEditSpecimen = (s: SpecimenRecord) => {
                      setEditingSpecimenId(s.id);
                      setSCaptureDate(s.captureDate);
                      setSCaptureTime(s.captureTime);
                      setSSiteName(s.siteName);
                      setSFarmId(s.farmId);
                      setSWarehouseId(s.warehouseId);
                      setSResearchTeam(s.researchTeam);
                      setSCountry(s.country);
                      setSRegion(s.region);
                      setSDistrict(s.district);
                      setSVillage(s.village);
                      setSGpsLatitude(String(s.gpsLatitude));
                      setSGpsLongitude(String(s.gpsLongitude));
                      setSAltitude(String(s.altitude));
                      setSSpecies(s.species);
                      setSSex(s.sex);
                      setSAgeClass(s.ageClass);
                      setSReproductiveStatus(s.reproductiveStatus);
                      setSWeight(String(s.weight));
                      setSHeadBodyLength(String(s.headBodyLength));
                      setSTailLength(String(s.tailLength));
                      setSHindFootLength(String(s.hindFootLength));
                      setSEarLength(String(s.earLength));
                      setSBodyConditionScore(s.bodyConditionScore);
                      setSExternalParasiteLoad(s.externalParasiteLoad);
                      setSInternalParasiteStatus(s.internalParasiteStatus);
                      setSVisibleInjuries(s.visibleInjuries);
                      setSDiseaseNotes(s.diseaseNotes);
                      setSSurvival24h(s.survival24h);
                      setSSurvival1wk(s.survival1wk);
                      setSSurvival2wk(s.survival2wk);
                      setSSurvival1m(s.survival1m);
                      setSSurvival3m(s.survival3m);
                      setSObserverNotes(s.observerNotes);
                      setSAttachments(s.attachments || '');
                      setSVirusPcr(s.virusPcr);
                      setSPlagueAntibody(s.plagueAntibody);
                      setSLeptospiraPcr(s.leptospiraPcr);
                      setSBacterialCulture(s.bacterialCulture);

                      setSpecimenViewSubMode('add');
                    };

                    const handleDeleteSpecimen = (id: string) => {
                      if (confirm("Are you sure you want to delete this rodent specimen record? This is irreversible.")) {
                        const updatedSpecsList = sampleSpecList.filter(s => s.id !== id);
                        setProjects(projects.map(p => {
                          if (p.id === activeProject.id) {
                            return { ...p, specimens: updatedSpecsList };
                          }
                          return p;
                        }));
                        showToast("Specimen record eradicated from database.");
                      }
                    };

                    return (
                      <div className="flex flex-col gap-4 text-start animate-fade-in w-full font-mono text-[11px]" id="specimens-registry-workspace">
                        <div className="border-b pb-2 flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h3 className="text-base font-extrabold text-[#15462D] uppercase flex items-center gap-1.5">
                              <Compass className="w-5 h-5 text-emerald-800 animate-pulse" />
                              Specimen Research Registry &amp; Diagnostics Database
                            </h3>
                            <p className="text-[9.5px] text-slate-455 mt-1">Configure individual specimens, capture geo-parameters, biological biometrics and survival analytics.</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] bg-[#15462D]/10 text-[#15462D] py-1 px-2.5 rounded font-bold uppercase tracking-wider">
                              DB v2026 STANDARD
                            </span>
                          </div>
                        </div>

                        {/* WORKSPACE LEVEL STATE SUMMARY METRICS */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="bg-slate-50 border p-2.5 rounded flex flex-col gap-0.5 justify-center">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Total Registry Captures</span>
                            <span className="text-base font-extrabold text-[#15462D]">{totalSpecCount} Specimens</span>
                          </div>
                          <div className="bg-slate-50 border p-2.5 rounded flex flex-col gap-0.5 justify-center">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Taxon Sexual Ratio (M/F)</span>
                            <span className="text-base font-extrabold text-slate-700">{maleCount}♂ / {femaleCount}♀</span>
                          </div>
                          <div className="bg-slate-50 border p-2.5 rounded flex flex-col gap-0.5 justify-center">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">Pathogen Prevalence</span>
                            <span className="text-base font-extrabold text-amber-700">{pathogenRatePct}% Positive</span>
                          </div>
                          <div className="bg-slate-50 border p-2.5 rounded flex flex-col gap-0.5 justify-center">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">24H Trap Mortality</span>
                            <span className="text-base font-extrabold text-[#15462D]">{mortalityRate24hPct}% Mortality</span>
                          </div>
                        </div>

                        {/* SPECIMENS INNER NAVIGATION MENU */}
                        <div className="flex border-b text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1 gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => { setSpecimenViewSubMode('view'); setEditingSpecimenId(null); }}
                            className={`py-1.5 px-3 border-b-2 font-mono transition ${specimenViewSubMode === 'view' ? 'border-[#15462D] text-[#15462D] font-extrabold' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                          >
                            📋 Spreadsheet Ledger [{filteredSpecimens.length}]
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpecimenViewSubMode('add')}
                            className={`py-1.5 px-3 border-b-2 font-mono transition ${specimenViewSubMode === 'add' ? 'border-[#15462D] text-[#15462D] font-extrabold' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                          >
                            {editingSpecimenId ? '✏️ Edit Specimen Entry' : '➕ Register Specimen'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpecimenViewSubMode('charts')}
                            className={`py-1.5 px-3 border-b-2 font-mono transition ${specimenViewSubMode === 'charts' ? 'border-[#15462D] text-[#15462D] font-extrabold' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                          >
                            📊 Diagnostic Analytics
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpecimenViewSubMode('audit')}
                            className={`py-1.5 px-3 border-b-2 font-mono transition flex items-center gap-1 ${specimenViewSubMode === 'audit' ? 'border-[#15462D] text-[#15462D] font-extrabold' : 'border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                          >
                            🔒 Quality Audit Log
                            {hasDbAnomalies(sampleSpecList) && <span className="w-1.5 h-1.5 rounded-full bg-red-650 inline-block animate-ping"></span>}
                          </button>
                        </div>

                        {/* SPECIMENS SUB PANELS */}
                        {specimenViewSubMode === 'view' && (
                          <div className="flex flex-col gap-3 animate-fade-in w-full">
                            {/* MULTI VARIABLE FILTER SHELF */}
                            <div className="bg-slate-50 border p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase font-bold text-slate-500">Live Search Matches</label>
                                <input
                                  type="text"
                                  placeholder="Search village, team, tag..."
                                  value={specimenSearchQuery}
                                  onChange={(e) => setSpecimenSearchQuery(e.target.value)}
                                  className="w-full text-[10px] font-bold bg-white border p-1.5 rounded uppercase"
                                />
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase font-bold text-slate-500">Species Taxonomy</label>
                                <select
                                  value={specimenFilterSpecies}
                                  onChange={(e) => setSpecimenFilterSpecies(e.target.value)}
                                  className="w-full text-[10px] font-bold bg-white border p-1 rounded font-mono"
                                >
                                  <option value="all">All Species</option>
                                  <option value="Mastomys natalensis">Mastomys natalensis</option>
                                  <option value="Rattus rattus">Rattus rattus</option>
                                  <option value="Arvicanthis niloticus">Arvicanthis niloticus</option>
                                  <option value="Mus musculus">Mus musculus</option>
                                  <option value="Other">Other Species</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase font-bold text-slate-500">Lab Pathology Filter</label>
                                <select
                                  value={specimenFilterLabTest}
                                  onChange={(e) => setSpecimenFilterLabTest(e.target.value)}
                                  className="w-full text-[10px] bg-white border p-1 rounded font-bold font-mono"
                                >
                                  <option value="all">All Laboratory States</option>
                                  <option value="virus-positive">Lassa Virus PCR Positive (+)</option>
                                  <option value="plague-positive">Plague Antibody Positive (+)</option>
                                  <option value="leptospira-positive">Leptospira PCR Positive (+)</option>
                                  <option value="any-pathogen">Any Active Pathogens (+)</option>
                                </select>
                              </div>

                              <div className="flex flex-col gap-0.5">
                                <label className="text-[8px] uppercase font-bold text-slate-500">Survival Checking Cohort</label>
                                <select
                                  value={specimenFilterStatus}
                                  onChange={(e) => setSpecimenFilterStatus(e.target.value)}
                                  className="w-full text-[10px] bg-white border p-1 rounded font-bold font-mono"
                                >
                                  <option value="all">All Outcomes</option>
                                  <option value="survived-all">Survived 3M Cycle</option>
                                  <option value="died-24h">Died Inside 24H</option>
                                  <option value="lost-monitoring">Lost Surveillance</option>
                                </select>
                              </div>
                            </div>

                            {/* TABLE REGISTER LIST */}
                            {filteredSpecimens.length === 0 ? (
                              <div className="p-12 text-center border bg-slate-50 text-slate-450 rounded-lg">
                                No logged specimens matched your filter criteria. Try adjusting or register a fresh specimen above.
                              </div>
                            ) : (
                              <div className="overflow-x-auto border rounded-lg max-h-[350px] w-full">
                                <table className="w-full text-left font-mono text-[9px] min-w-[2000px] border-collapse relative">
                                  <thead className="bg-[#15462D]/10 text-emerald-900 uppercase font-black sticky top-0 bg-white z-10 border-b">
                                    <tr className="divide-x divide-slate-200">
                                      <th className="p-2 sticky left-0 bg-slate-50 z-25 min-w-[100px] shadow-sm">Record ID</th>
                                      <th className="p-2 min-w-[90px]">Captured</th>
                                      <th className="p-2 min-w-[150px]">Geographics (Village / Site)</th>
                                      <th className="p-2 min-w-[100px] text-center">GPS coordinates</th>
                                      <th className="p-2 min-w-[150px]">Species Taxonomy</th>
                                      <th className="p-2 min-w-[80px]">Sex / Age</th>
                                      <th className="p-2 min-w-[180px] text-center bg-amber-50/20">Adult Biometrics Length (g / mm)</th>
                                      <th className="p-2 min-w-[120px] text-center font-bold">Body Condition</th>
                                      <th className="p-2 min-w-[180px]">Parasitology Loads</th>
                                      <th className="p-2 min-w-[180px] bg-emerald-50/25">Diagnostics Status (PCR)</th>
                                      <th className="p-2 min-w-[150px] text-center">Survival Progression</th>
                                      <th className="p-2 min-w-[120px]">Research Team</th>
                                      <th className="p-2 min-w-[155px]">Field Observer Notes</th>
                                      <th className="p-2 sticky right-0 bg-slate-100 z-20 text-center min-w-[120px]">Actions / Modify</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredSpecimens.map(s => {
                                      const isPathogenPos = s.virusPcr === 'Positive' || s.plagueAntibody === 'Positive' || s.leptospiraPcr === 'Positive';
                                      return (
                                        <tr key={s.id} className={`hover:bg-slate-50 divide-x divide-slate-100 uppercase ${isPathogenPos ? 'bg-red-500/5' : ''}`}>
                                          <td className="p-2 font-bold text-[#15462D] sticky left-0 bg-white hover:bg-slate-50 z-24 border-r shadow-xs">{s.id.slice(-8)}</td>
                                          <td className="p-2 font-medium text-slate-650">{s.captureDate} {s.captureTime}</td>
                                          <td className="p-2 font-bold text-slate-800">{s.village || 'N/A'}, {s.siteName}</td>
                                          <td className="p-2 text-center text-slate-500 font-mono text-[8.5px] font-bold">Lat: {s.gpsLatitude} / Lon: {s.gpsLongitude} / Alt: {s.altitude}m</td>
                                          <td className="p-2 italic text-[#15462D] font-sans font-extrabold normal-case">{s.species}</td>
                                          <td className="p-2 text-slate-700 font-bold">{s.sex} / {s.ageClass}</td>
                                          <td className="p-2 text-center bg-amber-50/5 font-bold">
                                            Wt: <span className="text-[#15462D]">{s.weight}g</span> | HB: {s.headBodyLength}mm | T: {s.tailLength}mm | HF: {s.hindFootLength}mm | E: {s.earLength}mm
                                          </td>
                                          <td className="p-2 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${
                                              s.bodyConditionScore === 5 ? 'bg-emerald-100 text-emerald-800' :
                                              s.bodyConditionScore >= 3 ? 'bg-slate-100 text-slate-700' : 'bg-red-105 text-red-800'
                                            }`}>BCS: {s.bodyConditionScore}/5</span>
                                          </td>
                                          <td className="p-2 text-slate-600">Ext: {s.externalParasiteLoad} | Int: {s.internalParasiteStatus}</td>
                                          <td className="p-2 bg-emerald-50/10">
                                            <div className="flex gap-1.5 flex-wrap">
                                              <span className={`px-1 py-0.5 rounded text-[7.5px] font-extrabold ${s.virusPcr === 'Positive' ? 'bg-red-205 text-red-900 border border-red-300 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>LASSA: {s.virusPcr}</span>
                                              <span className={`px-1 py-0.5 rounded text-[7.5px] font-extrabold ${s.plagueAntibody === 'Positive' ? 'bg-red-205 text-red-900 border border-red-300 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>PLAGUE: {s.plagueAntibody}</span>
                                              <span className={`px-1 py-0.5 rounded text-[7.5px] font-extrabold ${s.leptospiraPcr === 'Positive' ? 'bg-red-205 text-red-900 border border-red-300 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>LEPTO: {s.leptospiraPcr}</span>
                                            </div>
                                          </td>
                                          <td className="p-2 text-center font-bold">
                                            <span className="text-slate-400 font-black">24H:</span> <span className={s.survival24h === 'Alive' ? 'text-[#15462D]' : 'text-slate-405'}>{s.survival24h}</span>{" → "}
                                            <span className="text-slate-400 font-black pl-1">3M:</span> <span className={s.survival3m === 'Alive' ? 'text-[#15462D]' : 'text-slate-405'}>{s.survival3m}</span>
                                          </td>
                                          <td className="p-2 font-bold text-[#15462D] truncate max-w-[120px]">{s.researchTeam}</td>
                                          <td className="p-2 max-w-[150px] truncate font-sans text-slate-500 font-medium lowercase" title={s.observerNotes}>{s.observerNotes}</td>
                                          <td className="p-2 text-center sticky right-0 bg-slate-50 border-l shadow-xs flex items-center justify-center gap-1.5">
                                            {effectiveRole === 'Reviewer' ? (
                                              <span className="text-[7.5px] font-extrabold text-slate-400 flex items-center gap-0.5 uppercase"><Lock className="w-2.5 h-2.5 inline" /> Lock</span>
                                            ) : (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => handleStartEditSpecimen(s)}
                                                  className="bg-transparent text-emerald-800 hover:bg-emerald-50 py-1 px-2 border border-emerald-800/10 rounded cursor-pointer text-[8px] font-black uppercase font-mono transition"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteSpecimen(s.id)}
                                                  className="bg-transparent text-red-650 hover:bg-red-50 py-1 px-2 border border-red-200 rounded cursor-pointer text-[8px] font-black uppercase font-mono transition"
                                                >
                                                  Wipe
                                                </button>
                                              </>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* WORKSPACE OPERATIONS STRIP BAR */}
                            <div className="flex justify-between items-center bg-slate-50 border p-3 rounded-lg flex-wrap gap-2">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleExportSpecimensCSV}
                                  className="py-1.5 px-3 bg-[#15462D] text-white hover:bg-[#0c2f1d] shrink-0 font-bold tracking-wider font-mono text-[9px] uppercase border-0 rounded cursor-pointer flex items-center gap-1.5 shadow-xs"
                                >
                                  <FileSpreadsheet className="w-4 h-4" />
                                  Export Filtered CSV
                                </button>
                                
                                {effectiveRole !== 'Reviewer' && (
                                  <button
                                    type="button"
                                    onClick={handleTriggerSimulatedBulkIngest}
                                    className="py-1.5 px-3 bg-white text-[#15462D] hover:bg-emerald-50 border border-[#15462D]/25 font-bold tracking-wider font-mono text-[9px] uppercase rounded cursor-pointer flex items-center gap-1.5"
                                  >
                                    <PlusCircle className="w-4 h-4 text-[#15462D]" />
                                    Simulate CSV Ingest
                                  </button>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-400 font-sans font-medium uppercase text-align-right">Processed inside isolated Local Browser sandbox. All GCP telemetry synced.</span>
                            </div>
                          </div>
                        )}

                        {specimenViewSubMode === 'add' && (() => {
                          const isReviewMode = effectiveRole === 'Reviewer';
                          return (
                            <form onSubmit={onSaveSpecimenForm} className="bg-slate-50 border p-5 rounded-lg text-start flex flex-col gap-4 animate-fade-in relative z-10 w-full">
                              {isReviewMode ? (
                                <div className="absolute inset-0 bg-slate-900/[0.04] backdrop-blur-[0.5px] flex items-center justify-center p-4 z-40 rounded-lg">
                                  <div className="bg-white p-6 border-4 border-slate-200 shadow-xl max-w-sm text-center rounded-lg flex flex-col items-center">
                                    <Lock className="w-8 h-8 text-slate-400 mb-2 animate-bounce" />
                                    <span className="font-extrabold text-slate-805 block uppercase text-sm">Write Isolation Engaged</span>
                                    <p className="text-[10px] text-slate-500 font-sans leading-relaxed mt-1 uppercase">Reviewer mode limits adding or revising individual specimen captures. Form access restricted.</p>
                                  </div>
                                </div>
                              ) : null}

                              {/* STYLED FORM STEP BAR CATEGORIES */}
                              <div className="grid grid-cols-3 border border-slate-205 bg-white divide-x text-center rounded overflow-hidden select-none text-[8.5px] font-black uppercase tracking-wider text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => setSpecimenFormSection('capture_geo')}
                                  className={`py-2 px-1 ${specimenFormSection === 'capture_geo' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50'}`}
                                >
                                  1. Capture &amp; Geospatial Info
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSpecimenFormSection('biological_health')}
                                  className={`py-2 px-1 ${specimenFormSection === 'biological_health' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50'}`}
                                >
                                  2. Biological &amp; Health Specs
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSpecimenFormSection('survival_lab')}
                                  className={`py-2 px-1 ${specimenFormSection === 'survival_lab' ? 'bg-[#15462D] text-white' : 'hover:bg-slate-50'}`}
                                >
                                  3. Survival &amp; Lab Diagnostic
                                </button>
                              </div>

                              {/* STEP SECTION 1: TEMPORAL & GEOGRAPHICAL DATA INPUT */}
                              {specimenFormSection === 'capture_geo' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Capturing Metadata &amp; Scheduling</span>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Capture Date *</label>
                                        <input type="date" required value={sCaptureDate} onChange={(e) => setSCaptureDate(e.target.value)} className="w-full text-xs bg-white border p-1 rounded" />
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Capture Time *</label>
                                        <input type="text" required placeholder="HH:MM" value={sCaptureTime} onChange={(e) => setSCaptureTime(e.target.value)} className="w-full text-xs font-bold bg-white border p-1 rounded font-mono" />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-605">Site Name / Catch Segment *</label>
                                      <input type="text" required placeholder="E.G. Sector G4 Alpha" value={sSiteName} onChange={(e) => setSSiteName(e.target.value)} className="w-full text-xs font-bold bg-white border p-1 rounded uppercase font-mono" />
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Farm ID Reference</label>
                                        <input type="text" placeholder="E.G. FARM-TZ-01" value={sFarmId} onChange={(e) => setSFarmId(e.target.value)} className="w-full text-xs bg-white border p-1 rounded uppercase font-bold font-mono" />
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Warehouse ID</label>
                                        <input type="text" placeholder="E.G. WH-CENT-02" value={sWarehouseId} onChange={(e) => setSWarehouseId(e.target.value)} className="w-full text-xs bg-white border p-1 rounded uppercase font-bold font-mono" />
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-605">Research Team / Investigator *</label>
                                      <input type="text" required placeholder="E.G. Morogoro Unit G" value={sResearchTeam} onChange={(e) => setSResearchTeam(e.target.value)} className="w-full text-xs font-bold bg-white border p-1 rounded uppercase font-mono" />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Geospatial Spatial Locators</span>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Country</label>
                                        <input type="text" value={sCountry} onChange={(e) => setSCountry(e.target.value)} className="w-full text-xs bg-white border p-1 rounded font-bold font-mono text-[10px]" />
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Region</label>
                                        <input type="text" value={sRegion} onChange={(e) => setSRegion(e.target.value)} className="w-full text-xs bg-white border p-1 rounded font-bold font-mono text-[10px]" />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">District Reference</label>
                                        <input type="text" value={sDistrict} onChange={(e) => setSDistrict(e.target.value)} className="w-full text-xs bg-white border p-1 rounded font-bold font-mono text-[10px]" />
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Village Location</label>
                                        <input type="text" placeholder="E.G. Kihonda" value={sVillage} onChange={(e) => setSVillage(e.target.value)} className="w-full text-xs bg-white border p-1 rounded font-bold uppercase font-mono text-[10px]" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">GPS Latitude</label>
                                        <input type="text" placeholder="-6.820" value={sGpsLatitude} onChange={(e) => setSGpsLatitude(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">GPS Longitude</label>
                                        <input type="text" placeholder="37.660" value={sGpsLongitude} onChange={(e) => setSGpsLongitude(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Altitude (m)</label>
                                        <input type="text" placeholder="525" value={sAltitude} onChange={(e) => setSAltitude(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded font-mono" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* STEP SECTION 2: BIOLOGICAL ASSESSMENT & MORPHOMETRIC RATIOS */}
                              {specimenFormSection === 'biological_health' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Biology &amp; Taxonomy Identification</span>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-605">Species Taxonomy *</label>
                                      <select value={sSpecies} onChange={(e) => setSSpecies(e.target.value)} className="w-full text-xs font-bold bg-white border p-1 rounded font-sans font-extrabold text-[#15462D]">
                                        <option value="Mastomys natalensis">Mastomys natalensis (Multimammate Mouse)</option>
                                        <option value="Rattus rattus">Rattus rattus (Roof/Black Rat)</option>
                                        <option value="Arvicanthis niloticus">Arvicanthis niloticus (Nile Grass Rat)</option>
                                        <option value="Mus musculus">Mus musculus (House Mouse)</option>
                                        <option value="Other">Other Rodent Species</option>
                                      </select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Biological Sex</label>
                                        <select value={sSex} onChange={(e) => setSSex(e.target.value as any)} className="w-full text-[10px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                          <option value="Unknown">Unknown</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Age Class</label>
                                        <select value={sAgeClass} onChange={(e) => setSAgeClass(e.target.value as any)} className="w-full text-[10px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Adult">Adult</option>
                                          <option value="Sub-adult">Sub-adult</option>
                                          <option value="Juvenile">Juvenile</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-650">Reproduction Status</label>
                                        <select value={sReproductiveStatus} onChange={(e) => setSReproductiveStatus(e.target.value as any)} className="w-full text-[10px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Inactive">Non-active</option>
                                          <option value="Active">Active (Scrot/Perf)</option>
                                          <option value="Pregnant">Pregnant</option>
                                          <option value="Lactating">Lactating</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-1.5 mt-0.5">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Weight (g)</label>
                                        <input type="text" value={sWeight} onChange={(e) => setSWeight(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded text-center font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">H-Body (mm)</label>
                                        <input type="text" value={sHeadBodyLength} onChange={(e) => setSHeadBodyLength(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded text-center font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Tail (mm)</label>
                                        <input type="text" value={sTailLength} onChange={(e) => setSTailLength(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded text-center font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Hind Foot</label>
                                        <input type="text" value={sHindFootLength} onChange={(e) => setSHindFootLength(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded text-center font-mono" />
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Ear Size</label>
                                        <input type="text" value={sEarLength} onChange={(e) => setSEarLength(e.target.value)} className="w-full text-[10px] font-bold bg-white border p-1 rounded text-center font-mono" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Zoonotic Health &amp; Parasitology</span>
                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5 font-bold">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Body Condition Score (1-5)</label>
                                        <select value={sBodyConditionScore} onChange={(e) => setSBodyConditionScore(Number(e.target.value))} className="w-full text-xs bg-white border p-1.5 rounded font-mono font-bold">
                                          <option value="5">5 - Well Obese Premium</option>
                                          <option value="4">4 - High Fat Content</option>
                                          <option value="3">3 - Normal Stable Shape</option>
                                          <option value="2">2 - Thin / Minor Hunger</option>
                                          <option value="1">1 - Emaciated Poor State</option>
                                        </select>
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5 font-bold">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">External Tick/Flea Load</label>
                                        <select value={sExternalParasiteLoad} onChange={(e) => setSExternalParasiteLoad(e.target.value as any)} className="w-full text-xs bg-white border p-1.5 rounded font-mono font-bold">
                                          <option value="None">None Detected</option>
                                          <option value="Low">Low Load</option>
                                          <option value="Medium">Medium Load</option>
                                          <option value="High">High Parasite Load</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <div className="flex-1 flex flex-col gap-0.5 font-bold">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Internal Parasite Status</label>
                                        <select value={sInternalParasiteStatus} onChange={(e) => setSInternalParasiteStatus(e.target.value as any)} className="w-full text-xs bg-white border p-1.5 rounded font-mono font-bold">
                                          <option value="Untested">Untested</option>
                                          <option value="Negative">Negative / Normal</option>
                                          <option value="Positive">Positive / Helminths</option>
                                        </select>
                                      </div>
                                      <div className="flex-1 flex flex-col gap-0.5 font-bold">
                                        <label className="text-[8px] uppercase font-bold text-slate-605">Visible Physical Injury</label>
                                        <select value={sVisibleInjuries} onChange={(e) => setSVisibleInjuries(e.target.value as any)} className="w-full text-xs bg-white border p-1.5 rounded font-mono font-bold">
                                          <option value="None">None</option>
                                          <option value="Mild">Mild Scraping / Scars</option>
                                          <option value="Severe">Severe Tail/Somatic Injury</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-650">Disease / Clinical Physical Mark Notes</label>
                                      <input type="text" placeholder="E.G. Tail lesions, spleen size index ~12mm" value={sDiseaseNotes} onChange={(e) => setSDiseaseNotes(e.target.value)} className="w-full text-xs bg-white border p-1 rounded placeholder-slate-400 font-mono" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* STEP SECTION 3: LAB DIAGNOSTICS & SURVIVAL COHORTS */}
                              {specimenFormSection === 'survival_lab' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Survival Monitoring Checkpoints</span>
                                    <div className="grid grid-cols-3 gap-1.5">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7.5px] uppercase font-bold text-slate-650">24H status</label>
                                        <select value={sSurvival24h} onChange={(e) => setSSurvival24h(e.target.value as any)} className="w-full text-[9px] bg-white border p-1.5 rounded font-bold font-mono">
                                          <option value="Alive">Alive</option>
                                          <option value="Deceased">Deceased</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7.5px] uppercase font-bold text-slate-650">1W status</label>
                                        <select value={sSurvival1wk} onChange={(e) => setSSurvival1wk(e.target.value as any)} className="w-full text-[9px] bg-white border p-1.5 rounded font-bold font-mono">
                                          <option value="Alive">Alive</option>
                                          <option value="Deceased">Deceased</option>
                                          <option value="Lost">Lost</option>
                                          <option value="Recaptured">Recaptured</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7.5px] uppercase font-bold text-slate-650">2W status</label>
                                        <select value={sSurvival2wk} onChange={(e) => setSSurvival2wk(e.target.value as any)} className="w-full text-[9px] bg-white border p-1.5 rounded font-bold font-mono">
                                          <option value="Alive">Alive</option>
                                          <option value="Deceased">Deceased</option>
                                          <option value="Lost">Lost</option>
                                          <option value="Recaptured">Recaptured</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-0.5">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7.5px] uppercase font-bold text-slate-650">1 Month Status</label>
                                        <select value={sSurvival1m} onChange={(e) => setSSurvival1m(e.target.value as any)} className="w-full text-[9px] bg-white border p-1.5 rounded font-bold font-mono">
                                          <option value="Alive">Alive</option>
                                          <option value="Deceased">Deceased</option>
                                          <option value="Lost">Lost</option>
                                          <option value="Recaptured">Recaptured</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7.5px] uppercase font-bold text-slate-650">3 Months Status</label>
                                        <select value={sSurvival3m} onChange={(e) => setSSurvival3m(e.target.value as any)} className="w-full text-[9px] bg-white border p-1.5 rounded font-bold font-mono">
                                          <option value="Alive">Alive</option>
                                          <option value="Deceased">Deceased</option>
                                          <option value="Lost">Lost</option>
                                          <option value="Recaptured">Recaptured</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-650">Observer / Trap Handler Comments</label>
                                      <textarea placeholder="Observer notes..." value={sObserverNotes} onChange={(e) => setSObserverNotes(e.target.value)} className="w-full text-xs bg-white border p-1.5 rounded h-14 resize-none font-sans" />
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 border-b pb-0.5">Laboratory Diagnostic Results (Pathogens)</span>
                                    <div className="grid grid-cols-3 gap-1.5 animate-fade-in">
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7px] uppercase font-black text-slate-655">Lassa PCR</label>
                                        <select value={sVirusPcr} onChange={(e) => setSVirusPcr(e.target.value as any)} className="w-full text-[9px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Pending">Pending</option>
                                          <option value="Negative">Negative</option>
                                          <option value="Positive">Positive</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5">
                                        <label className="text-[7px] uppercase font-black text-slate-655">Plague Antibody</label>
                                        <select value={sPlagueAntibody} onChange={(e) => setSPlagueAntibody(e.target.value as any)} className="w-full text-[9px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Pending">Pending</option>
                                          <option value="Negative">Negative</option>
                                          <option value="Positive">Positive</option>
                                        </select>
                                      </div>
                                      <div className="flex flex-col gap-0.5 font-bold">
                                        <label className="text-[7px] uppercase font-black text-slate-655">Lepto PCR</label>
                                        <select value={sLeptospiraPcr} onChange={(e) => setSLeptospiraPcr(e.target.value as any)} className="w-full text-[9px] bg-white border p-1 rounded font-bold font-mono">
                                          <option value="Pending">Pending</option>
                                          <option value="Negative">Negative</option>
                                          <option value="Positive">Positive</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-650">Plated Bacterial Culture Dominancy</label>
                                      <input type="text" placeholder="E.G. no bacterial culture found or Salmonella growth" value={sBacterialCulture} onChange={(e) => setSBacterialCulture(e.target.value)} className="w-full text-xs bg-white border p-1.5 rounded font-mono text-[10px]" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                      <label className="text-[8px] uppercase font-bold text-slate-655">External Attachment Hyperlink Reference</label>
                                      <input type="text" placeholder="E.G. https://storage.google.co/bucket/spec-im-01.jpg" value={sAttachments} onChange={(e) => setSAttachments(e.target.value)} className="w-full text-xs bg-white border p-1.5 rounded font-sans text-[10px]" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* REAL-TIME SCIENTIFIC INTEGRITY ERROR FEEDBACK ENGINE */}
                              {curWarnings.length > 0 && (
                                <div className="bg-amber-100/70 border-l-4 border-amber-600 p-3 rounded-md flex flex-col gap-1 text-[10px] animate-pulse">
                                  <div className="flex items-center gap-1.5 text-amber-900 font-extrabold uppercase">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 animate-bounce" />
                                    Scientific Data Quality Verification warnings
                                  </div>
                                  <ul className="list-disc leading-relaxed text-amber-805 font-sans font-bold pl-4 gap-0.5 flex flex-col">
                                    {curWarnings.map((w, i) => (
                                      <li key={i}>{w}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* ACTIONS PANEL */}
                              <div className="flex gap-2">
                                {editingSpecimenId ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => { setEditingSpecimenId(null); setSpecimenViewSubMode('view'); }}
                                      className="py-2.5 px-4 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold uppercase rounded cursor-pointer transition border-0 font-mono tracking-widest text-[9px]"
                                    >
                                      ✕ Cancel Editing
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black uppercase rounded cursor-pointer transition shadow-xs border-0 font-mono tracking-widest text-[9px]"
                                    >
                                      ✓ Update Entry #{editingSpecimenId.slice(-6)}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="submit"
                                    className="w-full py-2.5 bg-[#15462D] hover:bg-emerald-950 text-white font-mono uppercase font-black tracking-widest text-[10px] rounded cursor-pointer transition shadow-md border-0"
                                  >
                                    ✓ Authenticate &amp; Register Specimen
                                  </button>
                                )}
                              </div>
                            </form>
                          );
                        })()}

                        {specimenViewSubMode === 'charts' && (
                          <div className="flex flex-col gap-4 text-center animate-fade-in w-full">
                            <span className="text-[10px] font-black uppercase text-slate-400 border-b pb-1 text-left block">Scientific diagnostic charts grid (Active Specimens)</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* DIAGNOSTIC PATHOGENS POSITIVITY CHANGER */}
                              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col gap-2">
                                <span className="text-[9px] font-bold text-slate-455 uppercase block mb-1">Pathogen Surveillance PCR Positivity Index</span>
                                <div className="h-48 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={pathogenChartData}>
                                      <CartesianGrid strokeDasharray="3 3 animate-pulse" />
                                      <XAxis dataKey="name" tick={{fontSize: 7.5, fill: '#64748b'}} />
                                      <YAxis tick={{fontSize: 7.5, fill: '#64748b'}} />
                                      <Tooltip contentStyle={{fontSize: 8}} />
                                      <Legend wrapperStyle={{fontSize: 8.5}} />
                                      <Bar dataKey="Positive" fill="#ef4444" radius={[2, 2, 0, 0]} name="Pathogen Detected (+)" />
                                      <Bar dataKey="Negative" fill="#15462D" radius={[2, 2, 0, 0]} name="Pathogen Safe (-)" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <p className="text-[8px] text-slate-455 mt-1 font-sans font-medium uppercase">Active vectors mapping. High Positive Leptospira rates are normal in multi-mammate field rodents.</p>
                              </div>

                              {/* DIAGNOSTIC SURVIVAL CURVE */}
                              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col gap-2">
                                <span className="text-[9px] font-bold text-slate-455 uppercase block mb-1">Cohort Kaplan-Meier Survival Progression (%)</span>
                                <div className="h-48 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={survivalLineData}>
                                      <defs>
                                        <linearGradient id="survivalGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="period" tick={{fontSize: 7.5, fill: '#64748b'}} />
                                      <YAxis tick={{fontSize: 7.5, fill: '#64748b'}} />
                                      <Tooltip contentStyle={{fontSize: 8}} />
                                      <Area type="monotone" dataKey="Surviving_Rodents" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#survivalGrad)" name="Surviving Cohort Count" />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <p className="text-[8px] text-slate-455 mt-1 font-sans font-medium uppercase">Visual survival progression matching capture cohort. Censored cases represent field losses.</p>
                              </div>

                              {/* BIOMETRICS ANALYSIS */}
                              <div className="bg-slate-50 border p-4 rounded-xl flex flex-col gap-2 col-span-1 md:col-span-2 text-center">
                                <span className="text-[9px] font-bold text-slate-455 uppercase block mb-1">Biological population size threshold groupings</span>
                                <div className="h-44 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weightGroupData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{fontSize: 7.5}} />
                                      <YAxis tick={{fontSize: 7.5}} />
                                      <Tooltip contentStyle={{fontSize: 8}} />
                                      <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} name="Specimens Count" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <p className="text-[8px] text-slate-455 mt-1 font-sans font-medium uppercase">Separating captured rodents into weight bins highlights maturity peaks and seasonal influx cohorts.</p>
                              </div>

                            </div>
                          </div>
                        )}

                        {specimenViewSubMode === 'audit' && (
                          <div className="flex flex-col gap-3 text-start animate-fade-in bg-slate-50 border p-4 rounded-xl border-dashed w-full">
                            <div className="border-b pb-1.5 flex justify-between items-center">
                              <span className="font-extrabold text-slate-705 text-xs uppercase block tracking-wider">🔒 Database relational auditing &amp; Biohazard warnings</span>
                              <span className="text-[8px] bg-red-105 text-red-800 py-0.5 px-2 rounded font-black">ISO Compliant</span>
                            </div>

                            <p className="text-slate-510 font-sans leading-relaxed text-[10px] uppercase font-bold">
                              The scientific audit engine checks records against geospatial limits (Morogoro limits: Lat -6.0 to -7.3, Lon 35.0 to 38.5), biological body ratio standards, and cohort timeline sequencing consistency.
                            </p>

                            <div className="flex flex-col gap-2 mt-1 w-full">
                              {/* SCAN RECORDS */}
                              {(() => {
                                const anomalies = getRegistryAnomaliesList(sampleSpecList);
                                if (anomalies.length === 0) {
                                  return (
                                    <div className="p-8 text-center bg-white border rounded border-emerald-300 text-emerald-805 text-[10px] font-bold">
                                      ✓ CONGRATULATIONS! Specimen database contains zero relational data violations. Validated conformant.
                                    </div>
                                  );
                                }
                                return (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    <span className="text-[8px] font-black text-red-650 uppercase">🚨 RELATIONAL VIOLATIONS DETECTED [{anomalies.length}]</span>
                                    <div className="flex flex-col gap-1 divide-y max-h-52 overflow-y-auto bg-white border p-2.5 rounded w-full">
                                      {anomalies.map((anom, idx) => (
                                        <div key={idx} className="py-2 flex items-start gap-2 text-[9.5px]">
                                          <span className="text-red-650 font-black shrink-0">[Violation #{idx + 1}]</span>
                                          <div className="flex flex-col gap-0.5">
                                            <span className="font-sans font-bold text-slate-805">{anom.message}</span>
                                            <span className="text-[7.5px] text-slate-400">Specimen Target ID: #{anom.id.slice(-8)} ({anom.species})</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* BIOHAZARD HIGHLIGHT */}
                              <div className="bg-red-500/5 border border-red-300/35 p-3 rounded-lg flex flex-col gap-1.5 mt-2 w-full">
                                <span className="text-[8.5px] font-black text-red-655 uppercase tracking-widest block font-sans">☣️ ACTIVE HIGH PATHOGEN ZOONOTIC WARNING MONITOR</span>
                                <div className="flex flex-col gap-1">
                                  {sampleSpecList.filter(s => s.virusPcr === 'Positive' || s.plagueAntibody === 'Positive').map((s) => (
                                    <div key={s.id} className="text-[8.5px] flex justify-between items-center bg-white/70 px-2 py-1 rounded border border-red-105">
                                      <span>Rodent #{s.id.slice(-6)} ({s.species}) caught in <strong>{s.village || 'N/A'}</strong>-BCS: {s.bodyConditionScore}</span>
                                      <span className="text-red-750 font-black bg-red-150 py-0.5 px-2 rounded-full scale-90">LASSA/PLAGUE POSITIVE (+)</span>
                                    </div>
                                  ))}
                                  {sampleSpecList.filter(s => s.virusPcr === 'Positive' || s.plagueAntibody === 'Positive').length === 0 && (
                                    <span className="text-[9px] font-sans text-slate-455 italic">Zero active plague or lassa carriers flagged in active records.</span>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== CREATE PROJECT WORKSPACE STEP MODAL ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-left">
          <div className="bg-white rounded-xl shadow-2xl border-4 border-slate-205 max-w-md w-full overflow-hidden flex flex-col" id="create-project-multiitem-wizard">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="font-extrabold text-[#15462D] text-xs uppercase tracking-wider block">📁 Create Research Project Workspace</span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold bg-transparent border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Steps tracker indicator */}
            <div className="flex bg-slate-100 text-[8.5px] font-black text-slate-500 uppercase divide-x text-center border-b">
              {['Name/Type', 'Metadata', 'Location', 'Timeline', 'Finalize'].map((s, idx) => (
                <div 
                  key={s} 
                  className={`flex-1 py-1 px-0.5 ${createStep === idx + 1 ? 'bg-[#15462D] text-white' : ''}`}
                >
                  {idx + 1}. {s}
                </div>
              ))}
            </div>

            {/* Modal Content depending on active sequence step */}
            <div className="p-5 flex-1 flex flex-col gap-3.5 min-h-[220px]">
              
              {createStep === 1 && (
                <div className="flex flex-col gap-3 animate-fade-in text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8.5px] uppercase font-black text-slate-650">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MOROGORO-RODENTS-2026"
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border p-2 rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8.5px] uppercase font-black text-slate-650">Project Type *</label>
                    <select
                      value={newProjType}
                      onChange={(e) => setNewProjType(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border p-2 rounded"
                    >
                      <option value="Rodent Biodiversity Study">Rodent Biodiversity Study</option>
                      <option value="Crop Damage Assessment">Crop Damage Assessment</option>
                      <option value="ERICON Experimental Trial">ERICON Experimental Trial</option>
                      <option value="Warehouse Monitoring">Warehouse Monitoring</option>
                      <option value="Eco-Parasitology Survey">Eco-Parasitology Survey</option>
                      <option value="Custom Project">Custom Project</option>
                    </select>
                  </div>
                </div>
              )}

              {createStep === 2 && (
                <div className="flex flex-col gap-1.5 animate-fade-in text-[11px]">
                  <label className="text-[8.5px] uppercase font-black text-slate-650">Project Description (Optional)</label>
                  <textarea
                    placeholder="Provide overview details e.g. evaluation parameters of the polyamide friction factors."
                    value={newProjDescription}
                    onChange={(e) => setNewProjDescription(e.target.value)}
                    className="w-full text-xs bg-slate-50 border p-2 rounded h-24 font-sans resize-none font-medium text-slate-705"
                  />
                </div>
              )}

              {createStep === 3 && (
                <div className="flex flex-col gap-1.5 animate-fade-in text-[11px]">
                  <label className="text-[8.5px] uppercase font-black text-slate-650">Study Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sokoine Extension Lands, Sector B"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border p-2 rounded uppercase"
                  />
                  <span className="text-[8.5px] text-slate-400 font-medium font-sans">Geographical coordinate limits can be changed down inside settings.</span>
                </div>
              )}

              {createStep === 4 && (
                <div className="flex flex-col gap-1.5 animate-fade-in text-[11px]">
                  <label className="text-[8.5px] uppercase font-black text-slate-650">Start / Installation Date</label>
                  <input
                    type="date"
                    value={newProjStartDate}
                    onChange={(e) => setNewProjStartDate(e.target.value)}
                    className="w-full text-xs font-bold font-mono bg-slate-50 border p-2 rounded"
                  />
                </div>
              )}

              {createStep === 5 && (
                <div className="flex flex-col gap-2 animate-fade-in text-[11px] text-center my-auto">
                  <span className="text-[#15462D] font-extrabold text-sm block">✓ ALL CHECKS PASS</span>
                  <p className="text-[9.5px] text-slate-500 font-sans max-w-sm mx-auto leading-relaxed uppercase">
                    You are ready to initialize Workspace: <strong>"{newProjName}"</strong>.
                    The ERICON environment will automatically compile Project ID, team databases, and a collaborative discussion ring.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-3 bg-slate-50 border-t flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  if (createStep > 1) setCreateStep(createStep - 1);
                }}
                disabled={createStep === 1}
                className="py-1.5 px-4 bg-white hover:bg-slate-100 text-slate-650 font-mono text-[9.5px] uppercase font-black border rounded cursor-pointer disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNextCreateStep}
                className="py-1.5 px-4 bg-[#15462D] hover:bg-[#15462D]/90 text-white font-mono text-[9.5px] uppercase font-black rounded border-0 cursor-pointer"
              >
                {createStep === 5 ? 'Create Workspace' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TEAM MEMBER INVITATIONS MODAL ==================== */}
      {showInviteModal && activeProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-mono text-left">
          <div className="bg-white rounded-xl shadow-2xl border-4 border-slate-205 max-w-sm w-full overflow-hidden flex flex-col" id="invite-member-wizard">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="font-extrabold text-[#15462D] text-xs uppercase tracking-wider block">👤 Invite Scientist Colleague</span>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold bg-transparent border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5 text-[11px]">
              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] uppercase font-black text-slate-650">Option A: Invite by Username *</label>
                <input
                  type="text"
                  placeholder="e.g. AminaResearch, JohnEcology"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border p-2 rounded"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[8.5px] uppercase font-black text-slate-650 font-mono">Select Assigned Perm Level</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border p-2 rounded"
                >
                  <option value="Project Leader">Project Leader (Manager)</option>
                  <option value="Research Member">Research Member (Field Ecologist)</option>
                  <option value="Reviewer">Reviewer (Read-Only Access)</option>
                </select>
              </div>

              <div className="mt-2 text-[8.5px] text-slate-450 leading-relaxed uppercase">
                The invitation uses immediate verified handshake channels. They will immediately show up as an Active teammate in the system.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="py-1 px-3 bg-white hover:bg-slate-100 text-slate-650 text-[9px] uppercase font-bold border rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteByUser}
                className="py-1 px-4 bg-[#15462D] hover:bg-emerald-950 text-white text-[9px] uppercase font-black rounded border-0 cursor-pointer"
              >
                ✓ Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
