import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Simple array to log actions
const actionLogs: string[] = [];
function logAction(message: string) {
  const logStr = `[${new Date().toISOString()}] ${message}`;
  actionLogs.unshift(logStr);
  console.log('[ACTION LOG]:', logStr);
}

// Locked accounts, IP rate limits and reset tokens structures
const failedLoginAttempts: Record<string, { count: number; lockedUntil: number }> = {};
const ipFailedLoginAttempts: Record<string, { count: number; lockedUntil: number }> = {};
const activeResetTokens: Record<string, { email: string; expiresAt: number }> = {};
const registrationOTPs: Record<string, { otp: string; expiresAt: number }> = {};
const apiRateLimits: Record<string, { requests: number; windowStart: number }> = {};

// PRODUCTION HTTPS ENFORCEMENT MIDDLEWARE
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const isAiStudio = host.includes('europe-west2.run.app') || host.includes('localhost') || host.includes('3000');
  
  if (!isAiStudio && process.env.NODE_ENV === 'production') {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }
  next();
});

app.use(express.json({ limit: '5mb' }));

// Lazy initializer for GoogleGenAI SDK to prevent app crashing if key is not configured at launch
let aiClientInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined in Settings or .env file');
    }
    aiClientInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClientInstance;
}

// 1. HEALTH ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1.1 LOGO PROXY ENDPOINT
app.get('/api/ericon-logo', async (req, res) => {
  try {
    const googleId = '1yMBnZMQQwm1AcsWehQmlQtL_OoFDB7aC';
    const driveUrl = `https://drive.google.com/thumbnail?id=${googleId}&sz=w1000`;
    
    const response = await fetch(driveUrl);
    if (!response.ok) {
      throw new Error(`Google Drive thumbnail fetch responded with status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || 'image/png';
    const arrayBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('[SERVER LOGO PROXY ERROR]:', error);
    res.status(500).send('Network error or Google Drive access blocked');
  }
});

// 2. GEMINI SPECIES ADVISOR & PHYSICS RETROFIT CONTEXT
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, currentSpecs, physicsSummary, biodiversitySummary, rodentSpecies, themeActive } = req.body;
    
    // Validate message
    if (!message) {
      return res.status(400).json({ error: 'Message query parameter is empty' });
    }

    const ai = getGeminiClient();

    // Construct an exhaustive technical/biological backdrop for the prompt
    const systemInstruction = `You are a Senior Ecological Systems Advisor and Chief Fluid Dynamics Vet for the ERICON Ecological Rodent Interception Network. 
The system is an advanced wildlife-safe transit framework delivering specimens via the "ERAS Polyamide-6 tunnel" utilizing gentle pneumatic pressure differentials.

Current System Parameters:
- Transport Tube Specs: Long ${currentSpecs?.length || 30}m, diameter ${currentSpecs?.diameter || 90}mm, absolute wall roughness ${currentSpecs?.roughness || 0.0015}mm, ventilation temperature ${currentSpecs?.temperature || 22}°C.
- Current Physics Telemetry:
  * Differential Pressure (dp): ${physicsSummary?.dp?.toFixed(2) || 'N/A'} kPa
  * Volumetric Flow: ${(physicsSummary?.flowRateVolumetric * 60000)?.toFixed(1) || 'N/A'} L/min
  * Flow Reynolds Number (Re): ${physicsSummary?.reynoldsNumber?.toFixed(0) || 'N/A'}
  * Flow Regime: ${physicsSummary?.flowRegume || 'N/A'}
  * Maximum Capsule steady-state travel speed: ${physicsSummary?.maxCapsuleVelocity?.toFixed(2) || 'N/A'} m/s
- Dynamic Target Species: ${rodentSpecies || 'field_mouse'}
- active Visual overlay mode: ${themeActive || 'standard'}

Field Biological Database Context (Local Specimen Statistics):
- Active Specimens Count: ${biodiversitySummary?.total || 0}
- Biodiversity Indices:
  * Shannon Entropy (H'): ${biodiversitySummary?.shannon?.toFixed(4) || '0.0000'}
  * Simpson Index (1 - D): ${biodiversitySummary?.simpson?.toFixed(4) || '0.0000'}
  * General Habitat State: ${biodiversitySummary?.status || 'Moderate Diversity'}

Primary Rodent Species and Safe limits for ERAS tunnel transit:
- Field Mouse / House Mouse: Safe speed < 2.5 m/s, fatal threshold 8.0 m/s
- Mastomys natalensis: Safe speed < 3.0 m/s, fatal threshold 9.0 m/s, thermophilic preference (24-32°C).
- Arvicanthis niloticus: Safe speed < 3.5 m/s, fatal threshold 10.0 m/s.
- Rattus rattus / Roof Rat: Safe speed < 4.0 m/s, fatal threshold 11.0 m/s.

Guidelines for your scientific responses:
1. Speak in a sophisticated, authoritative, yet friendly and clear ecological-scientific persona.
2. Incorporate the telemetry variables seamlessly. If a user asks a question about general physics or species, connect it back to the active Reynolds number, flow rate, or Shannon biodiversity index.
3. Keep answers highly professional, scientific, concise, and structured in clean markdown. Incorporate technical terms like "scotopic conservation values" if they ask about Night Vision.
4. Do NOT larp or fabricate simulated terminal logs or container secrets. Focus strictly on real physical/ecological science.`;

    // Process messaging history for chat
    const formatHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content || msg.text || '' }]
    }));

    // Generate output with active Search Grounding for real-time ecological and epidemiological checks
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...formatHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.75,
        tools: [
          {
            googleSearch: {} // Active Google Search Grounding integration for live eco information
          }
        ]
      },
    });

    const reply = response.text || "The ERICON AI core experienced a telemetry parsing exception. Please query again.";
    return res.json({ reply });

  } catch (error: any) {
    console.error('Gemini Interaction Failed:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal AI Core server fault',
      reconnectHelp: 'Make sure your GEMINI_API_KEY is saved securely inside "Settings > Secrets" inside the build portal dashboard.'
    });
  }
});

// ==========================================
// 4. CREDENTIAL RECONSTRUCTION & COLLABORATION DATABASE
// ==========================================

const DB_FILE = path.join(process.cwd(), 'db_forum.json');// In-memory data tables mirrored to disk
let users: any[] = [];
let comments: any[] = [];
let projects: any[] = [];
let userProjects: any[] = [];
let auditLogs: any[] = [];

// Helper to push security audit records representation
function addAuditLog(type: string, description: string, email: string = 'system@ericon.org', ip: string = '127.0.0.1') {
  const newLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    type,
    description,
    email,
    action: description,
    ip
  };
  auditLogs.unshift(newLog);
  if (auditLogs.length > 200) auditLogs.pop();
  saveCollaborationDB();
}

// Seed default accounts and comments if not present
const USERS_FILE = path.join(process.cwd(), 'users.json');

function saveUsersToDisk() {
  const payload = {
    users,
    auditLogs
  };
  fs.writeFile(USERS_FILE, JSON.stringify(payload, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('[USERS ASYNC SAVE FAULT]', err);
    } else {
      console.log('[USERS ASYNC SAVE SUCCESSFUL]');
    }
  });
}

function loadCollaborationDB() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      try {
        const fileContent = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          users = parsed;
          auditLogs = [];
        } else {
          users = parsed.users || [];
          auditLogs = parsed.auditLogs || [];
        }
        console.log(`[USER PERSISTENCE] Loaded ${users.length} users and ${auditLogs.length} audit logs successfully from users.json`);
      } catch (e) {
        console.error('[USER PERSISTENCE LOAD EXCEPTION]', e);
      }
    }

    // 1. HARDCODE ADMIN CREDENTIALS: In 'users.json' permanently seed the Admin account
    let adminUser = users.find((u: any) => u.username === 'joshuajakoniko' || u.email === 'jakonikojoshuaa@gmail.com');
    if (!adminUser) {
      adminUser = {
        username: 'joshuajakoniko',
        email: 'jakonikojoshuaa@gmail.com',
        role: 'Admin',
        institution: 'ERICON Chief Administrator',
        country: 'United States',
        profession: 'Chief Security Officer',
        classification: 'Supreme Administrator',
        researchInterests: 'Biosecurity, threat assessment, OTP protocols',
        orcid_id: '0000-0002-1825-0097',
        profileImage: '',
        passwordHash: bcrypt.hashSync('123456', 10),
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };
      users.push(adminUser);
    } else {
      adminUser.username = 'joshuajakoniko';
      adminUser.email = 'jakonikojoshuaa@gmail.com';
      adminUser.role = 'Admin';
    }
    // Remove any legacy duplicate matching
    users = users.filter((u: any) => !(u.username === 'joshua_jakoniko' && u.email === 'jakonikojoshuaa@gmail.com'));
    saveUsersToDisk();

    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (!users || users.length === 0) {
        users = parsed.users || [];
      }
      comments = (parsed.comments || []).map((c: any) => ({
        ...c,
        reactions: c.reactions || { insightful: 0, verified: 0, alert: 0, fluid: 0 }
      }));
      projects = parsed.projects || [];
      userProjects = parsed.userProjects || [];
      if (!auditLogs || auditLogs.length === 0) {
        auditLogs = parsed.auditLogs || [];
      }
    } else {
      // Seed pre-verified active scientific personnel
      if (!users || users.length <= 1) { // 1 is just the admin we added above
        users = [
          {
            username: 'joshuajakoniko',
            email: 'jakonikojoshuaa@gmail.com',
            role: 'Admin',
            institution: 'ERICON Chief Administrator',
            country: 'United States',
            profession: 'Chief Security Officer',
            classification: 'Supreme Administrator',
            researchInterests: 'Biosecurity, threat assessment, OTP protocols',
            orcid_id: '0000-0002-1825-0097',
            profileImage: '',
            passwordHash: bcrypt.hashSync('123456', 10),
            isEmailVerified: true,
            createdAt: new Date().toISOString()
          },
          {
            username: 'sjenkins',
            email: 's.jenkins@ericon.org',
            role: 'Senior Epidemiologist',
            institution: 'ERICON Ecological Group',
            passwordHash: bcrypt.hashSync('123456', 10),
            createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
            isEmailVerified: true
          },
          {
            username: 'mvance',
            email: 'm.vance@reynolds.tech',
            role: 'Fluid Dynamics Specialist',
            institution: 'Reynolds Biotechnical',
            passwordHash: bcrypt.hashSync('123456', 10),
            createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
            isEmailVerified: true
          }
        ];
        try {
          fs.writeFileSync(USERS_FILE, JSON.stringify({ users, auditLogs }, null, 2), 'utf8');
        } catch (e) {
          console.error('Error seeding users.json file', e);
        }
      }

      // Seed high-utility scientific threads with realistic active charts
      comments = [
        {
          id: 'comment-1',
          author: 'Dr. Sarah Jenkins',
          authorRole: 'Senior Epidemiologist',
          authorInstitution: 'ERICON Ecological Group',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          content: 'I noticed increased respiratory stress when transporting Mastomys natalensis through Vector Hub Alpha under elevated ambient temperatures. When operating at 34°C, dehydration risk climbs sharply, bringing the Survival Score down. I proposed retrofitting the ventilation heat exchanger to maintain the tube closer to their thermoneutral sweet spot (24°C–32°C). Keep temps inside this range!',
          chartState: {
            specs: { p1: 105, p2: 98, length: 30, diameter: 90, roughness: 0.0015, temperature: 34, capsuleMass: 120, capsuleFriction: 0.08, capsuleClearance: 0.98 },
            rodentSpecies: 'mastomys_natalensis',
            survivalScore: 68
          },
          reactions: { insightful: 3, verified: 2, alert: 0, fluid: 1 },
          replies: [
            {
              id: 'reply-1-1',
              author: 'Prof. Marcus Vance',
              authorRole: 'Fluid Dynamics Specialist',
              authorInstitution: 'Reynolds Biotechnical',
              timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
              content: 'Excellent observation, Sarah. From the fluid dynamics side, lowering the temp slightly (e.g. to 25°C) also improves air density, which stabilizes the velocity vectors.'
            }
          ]
        },
        {
          id: 'comment-2',
          author: 'Prof. Marcus Vance',
          authorRole: 'Fluid Dynamics Specialist',
          authorInstitution: 'Reynolds Biotechnical',
          timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          content: 'Be careful when modifying pressures! If the differential pressure drops too low, say by reducing P1 under 95 kPa with P2 at 92 kPa, the volumetric flow Q drops below 5.0 L/min, which fails the minimum Air Change Rate (ACH) requirement of 18 changes per hour for rodents. Keep the flow laminar but maintain an active vacuum!',
          chartState: {
            specs: { p1: 94, p2: 92, length: 30, diameter: 90, roughness: 0.0015, temperature: 22, capsuleMass: 120, capsuleFriction: 0.08, capsuleClearance: 0.98 },
            rodentSpecies: 'field_mouse',
            survivalScore: 41
          },
          reactions: { insightful: 2, verified: 3, alert: 1, fluid: 2 },
          replies: []
        }
      ];

      // Seed default research projects
      projects = [
        {
          id: 'proj-1',
          name: 'Morogoro Active Surveillance Project',
          code: 'ERICON-7K92-FH44',
          creator: 'sjenkins',
          description: 'Surveillance of rodent vectors (Mastomys natalensis) in residential and agricultural areas of the Morogoro district.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'proj-2',
          name: 'Pneumatic Vector Dynamics Lab',
          code: 'ERICON-AA78-PT52',
          creator: 'mvance',
          description: 'Testing of polyamide-6 pipelines for high-speed fluid velocity testing and safe translocation.',
          createdAt: new Date().toISOString()
        }
      ];

      userProjects = [
        { username: 'sjenkins', projectId: 'proj-1', role: 'Team Leader', joinedAt: new Date().toISOString() },
        { username: 'mvance', projectId: 'proj-2', role: 'Team Leader', joinedAt: new Date().toISOString() },
        { username: 'sjenkins', projectId: 'proj-2', role: 'Research Member', joinedAt: new Date().toISOString() }
      ];

      auditLogs = [
        { id: 'log-1', timestamp: new Date().toISOString(), type: 'SECURITY', description: 'System database initialized and seed scientists registered.' }
      ];

      saveCollaborationDB();
    }
  } catch (err) {
    console.error('[DATABASE INITIALIZATION EXCEPTION] Reverting to defaults', err);
  }
}

function saveCollaborationDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users, comments, projects, userProjects, auditLogs }, null, 2), 'utf8');
    saveUsersToDisk();
  } catch (err) {
    console.error('[DATABASE WRITE FAULT]', err);
  }
}


// Instantiate storage mirror
loadCollaborationDB();

// Simple rate limiting middleware definition
const checkRateLimit = (req: any, res: any, next: any) => {
  const ip = req.ip || 'global';
  const now = Date.now();
  if (!apiRateLimits[ip]) {
    apiRateLimits[ip] = { requests: 1, windowStart: now };
    return next();
  }
  const data = apiRateLimits[ip];
  if (now - data.windowStart > 60000) {
    data.requests = 1;
    data.windowStart = now;
    return next();
  }
  data.requests++;
  if (data.requests > 40) {
    return res.status(429).json({ error: 'Too many authentication attempts. Please cool down for 60 seconds.' });
  }
  next();
};

// A. USER REGISTRATION
app.post('/api/auth/register', checkRateLimit, (req, res) => {
  const { username, email, password, role, institution, country, profession, classification, researchInterests, orcid_id, profileImage } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, Email and Password are required fields.' });
  }

  const normalizedUser = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = users.some(u => u.username.toLowerCase() === normalizedUser || u.email.toLowerCase() === normalizedEmail);
  if (userExists) {
    return res.status(400).json({ error: 'Username or Email is already registered inside ERICON directories' });
  }

  const defaultRole = role ? role.trim() : 'Research Member';
  const defaultInstitution = institution ? institution.trim() : 'Unassigned Institution';

  const newUser = {
    username: username.trim(),
    email: email.trim(),
    role: defaultRole,
    institution: defaultInstitution,
    country: (country || 'Tanzania').trim(),
    profession: (profession || 'Ecological Scientist').trim(),
    classification: (classification || 'Expert').trim(),
    researchInterests: (researchInterests || 'Pneumatic vectors, epidemiology').trim(),
    orcid_id: (orcid_id || '').trim(),
    profileImage: profileImage || '',
    passwordHash: bcrypt.hashSync(password, 10),
    isEmailVerified: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveCollaborationDB();
  addAuditLog('SECURITY', `New staff scientist registration initialized: ${newUser.username} (${newUser.email}). Verification pending.`);
  logAction(`${newUser.username} registered`);

  res.json({
    success: true,
    user: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      institution: newUser.institution,
      country: newUser.country,
      profession: newUser.profession,
      classification: newUser.classification,
      researchInterests: newUser.researchInterests,
      orcid_id: newUser.orcid_id,
      profileImage: newUser.profileImage,
      isEmailVerified: newUser.isEmailVerified
    }
  });
});

// B. USER SIGN-IN / LOGIN
app.post('/api/auth/login', checkRateLimit, (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Please submit credentials' });
  }

  // Get Client IP for lockout
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  
  // Check IP lockout first (15 minutes limit)
  const ipLockout = ipFailedLoginAttempts[clientIp];
  if (ipLockout && ipLockout.count >= 5 && ipLockout.lockedUntil > Date.now()) {
    const remainingMin = Math.ceil((ipLockout.lockedUntil - Date.now()) / (1000 * 60));
    return res.status(423).json({ error: `Too many failed login attempts from this IP. Locked out for security. Try again in: ${remainingMin} minute(s).` });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  const lockout = failedLoginAttempts[query];
  
  if (lockout && lockout.count >= 5 && lockout.lockedUntil > Date.now()) {
    const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000);
    return res.status(423).json({ error: `Account temporarily locked out due to multiple failed verification attempts. Try again in: ${remaining} seconds.` });
  }

  const matchedUser = users.find(u => 
    u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  if (!matchedUser) {
    // Increment failed login for IP
    if (!ipFailedLoginAttempts[clientIp]) {
      ipFailedLoginAttempts[clientIp] = { count: 1, lockedUntil: 0 };
    } else {
      ipFailedLoginAttempts[clientIp].count++;
    }
    if (ipFailedLoginAttempts[clientIp].count >= 5) {
      ipFailedLoginAttempts[clientIp].lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
    }
    return res.status(401).json({ error: 'The provided credentials do not match parameters inside the ERICON staff directory' });
  }

  // Support bcrypt comparison or seed mock passwords
  let isValid = false;
  if (matchedUser.passwordHash.startsWith('$2a$') || matchedUser.passwordHash.startsWith('$2b$')) {
    isValid = bcrypt.compareSync(password, matchedUser.passwordHash);
  } else {
    isValid = (
      matchedUser.passwordHash === 'simple_hash_' + password || 
      matchedUser.passwordHash === password ||
      matchedUser.passwordHash === 'sha256_mock_hash'
    );
    // Upgrade legacy coordinate in place
    if (isValid) {
      matchedUser.passwordHash = bcrypt.hashSync(password, 10);
      saveCollaborationDB();
    }
  }

  if (!isValid) {
    // Increment failed login for IP
    if (!ipFailedLoginAttempts[clientIp]) {
      ipFailedLoginAttempts[clientIp] = { count: 1, lockedUntil: 0 };
    } else {
      ipFailedLoginAttempts[clientIp].count++;
    }
    if (ipFailedLoginAttempts[clientIp].count >= 5) {
      ipFailedLoginAttempts[clientIp].lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
      logAction(`IP ${clientIp} locked out after 5 blockages`);
    }

    if (!failedLoginAttempts[query]) {
      failedLoginAttempts[query] = { count: 1, lockedUntil: 0 };
    } else {
      failedLoginAttempts[query].count++;
    }

    if (failedLoginAttempts[query].count >= 5) {
      failedLoginAttempts[query].lockedUntil = Date.now() + 15000; // 15 seconds penalty
      addAuditLog('SECURITY', `Access blockage penalty triggered for identifier: ${query} (5 failed logins).`);
      return res.status(423).json({ error: 'Account temporarily locked out due to repeated login errors. Penalty countdown triggered: 15s.' });
    }

    addAuditLog('SECURITY', `Failed security clearance for: ${query}. (Failed coordinate: ${failedLoginAttempts[query].count}/5).`);
    return res.status(401).json({ error: `The provided credentials do not match parameters inside the ERICON staff directory. Remaining attempts: ${5 - failedLoginAttempts[query].count}` });
  }

  // Clear failed metrics on success
  if (failedLoginAttempts[query]) {
    failedLoginAttempts[query].count = 0;
  }
  if (ipFailedLoginAttempts[clientIp]) {
    ipFailedLoginAttempts[clientIp].count = 0;
  }

  addAuditLog('SECURITY', `Security clearance granted for: ${matchedUser.username}. Logged in.`);
  logAction(`${matchedUser.username} logged in`);

  res.json({
    success: true,
    user: {
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role,
      institution: matchedUser.institution,
      country: matchedUser.country || 'Tanzania',
      profession: matchedUser.profession || 'Ecological Scientist',
      classification: matchedUser.classification || 'Expert',
      researchInterests: matchedUser.researchInterests || 'Pneumatic vectors',
      orcid_id: matchedUser.orcid_id || '',
      profileImage: matchedUser.profileImage || '',
      isEmailVerified: matchedUser.isEmailVerified !== false
    }
  });
});

// --- TWO-STEP OTP AUTHENTICATION ENDPOINTS ---
const activeOTPs: Record<string, { otp: string; expiresAt: number; email: string }> = {};

app.post('/api/auth/check-account', (req, res) => {
  const { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ error: 'Username or Email is required' });
  }
  const query = usernameOrEmail.trim().toLowerCase();
  const matchedUser = users.find(u => 
    u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );
  if (matchedUser) {
    return res.json({ exists: true, email: matchedUser.email, username: matchedUser.username });
  } else {
    return res.json({ exists: false });
  }
});

app.post('/api/auth/request-otp', async (req, res) => {
  const { usernameOrEmail } = req.body;
  if (!usernameOrEmail) {
    return res.status(400).json({ error: 'Username or Email is required' });
  }
  const query = usernameOrEmail.trim().toLowerCase();
  const matchedUser = users.find(u => 
    u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );
  if (!matchedUser) {
    return res.status(404).json({ error: 'Scientist account not found inside ERICON directories' });
  }

  // Generate a random 6-digit cryptographic OTP token with 5 minutes expiration
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  activeOTPs[query] = { otp, expiresAt, email: matchedUser.email };

  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  addAuditLog('SECURITY', `Two-step security OTP token requested. Dispatching authorization coordinates.`, matchedUser.email, clientIp);
  logAction(`OTP code ${otp} generated for user: ${matchedUser.username}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  let sentViaResend = false;

  if (resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'ERICON Gatewall <onboarding@resend.dev>',
          to: 'jakonikojoshuaa@gmail.com', // Explicit requested OTP target
          subject: '🔑 ERICON Biosecurity One-Time-Password (OTP)',
          html: `
            <div style="font-family: monospace; padding: 20px; background-color: #0b1510; color: #d0f0d0; border-radius: 8px; border: 1px solid #1a3a22;">
              <h2 style="color: #4ade80; border-bottom: 1px solid #15462d; padding-bottom: 8px;">SECURITY ACCESS CLEARANCE GATEWALL</h2>
              <p>Attention Chief Administrator / Staff Scientist,</p>
              <p>A multi-factor biosecurity credential request has been dispatched. Use the unique 6-digit cryptographic token below to verify identity:</p>
              <div style="background-color: #11281a; color: #10b981; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0; border-radius: 4px; letter-spacing: 5px; border: 1px solid #059669;">
                ${otp}
              </div>
              <p style="font-size: 11px; color: #829a8a;">This biosecurity token expires strictly in 5 minutes.</p>
              <p style="font-size: 11px; color: #829a8a;">Originating IP: ${clientIp}</p>
            </div>
          `
        })
      });
      if (emailResponse.ok) {
        sentViaResend = true;
        console.log(`[RESEND API OTP DELIVERED] Code ${otp} to jakonikojoshuaa@gmail.com`);
      } else {
        const errorText = await emailResponse.text();
        console.error('[RESEND API OTP DISPATCH FAULT]', errorText);
      }
    } catch (err) {
      console.error('[RESEND API CATASTROPHIC DISPATCH FAULT]', err);
    }
  }

  // Backup logs and print to server console for Sandbox Fallback (Requirement 3)
  console.log(`\n========================================\n[SECURITY HANDSHAKE OTP ACTIVATED]\nUser email: ${matchedUser.email}\nRecipient: jakonikojoshuaa@gmail.com\nSecure Code: ${otp}\nExpires at: ${new Date(expiresAt).toLocaleTimeString()}\n========================================\n`);

  res.json({
    success: true,
    email: matchedUser.email,
    sandbox: !sentViaResend,
    otp: !sentViaResend ? otp : undefined
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { usernameOrEmail, otp } = req.body;
  if (!usernameOrEmail || !otp) {
    return res.status(400).json({ error: 'Username/Email and secure OTP are required coordinates' });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  const cached = activeOTPs[query];

  if (!cached) {
    return res.status(401).json({ error: 'No active security OTP request found for this session.' });
  }

  if (Date.now() > cached.expiresAt) {
    delete activeOTPs[query];
    return res.status(401).json({ error: 'The biosecurity OTP has expired (5-minute security limit exceeded).' });
  }

  if (cached.otp !== otp.trim()) {
    return res.status(401).json({ error: 'Security OTP verification rejected. Invalid code sequence.' });
  }

  // Clear OTP token from memory once verified successfully
  delete activeOTPs[query];

  const matchedUser = users.find(u => 
    u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  if (!matchedUser) {
    return res.status(404).json({ error: 'Scientist account mapping lost during verification sequence.' });
  }

  // Clear other temporary locks on successful login
  if (failedLoginAttempts[query]) failedLoginAttempts[query].count = 0;
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  if (ipFailedLoginAttempts[clientIp]) ipFailedLoginAttempts[clientIp].count = 0;

  addAuditLog('SECURITY', `Biosecurity OTP verified successfully. Granted main access.`, matchedUser.email, clientIp);
  logAction(`${matchedUser.username} authenticated successfully via OTP.`);

  res.json({
    success: true,
    user: {
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role,
      institution: matchedUser.institution,
      country: matchedUser.country || 'Tanzania',
      profession: matchedUser.profession || 'Ecological Scientist',
      classification: matchedUser.classification || 'Expert',
      researchInterests: matchedUser.researchInterests || 'Pneumatic vectors',
      orcid_id: matchedUser.orcid_id || '',
      profileImage: matchedUser.profileImage || '',
      isEmailVerified: true
    }
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  const requesterEmail = req.headers['x-user-email'] as string;
  if (!requesterEmail) {
    return res.status(401).json({ error: 'Please submit user email authorization' });
  }
  const requesterUser = users.find(u => u.email.toLowerCase() === requesterEmail.trim().toLowerCase());
  if (!requesterUser || requesterUser.role !== 'Admin') {
    return res.status(403).json({ error: 'Access restricted to ERICON Administrators only.' });
  }
  res.json({ success: true, logs: auditLogs });
});

// C. EMAIL ADDRESS VERIFICATION RESPONSE
app.post('/api/auth/verify-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email parameter required.' });
  const matchedUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!matchedUser) {
    return res.status(404).json({ error: 'Scientist account not found with this email coordinates' });
  }
  matchedUser.isEmailVerified = true;
  saveCollaborationDB();
  addAuditLog('SECURITY', `Email credentials verified successfully for user: ${matchedUser.username}`);
  res.json({ success: true, user: { username: matchedUser.username, email: matchedUser.email, isEmailVerified: true } });
});

// D. SCIENTIFIC INTERACTION UPDATES DESIGN
app.post('/api/auth/update-profile', (req, res) => {
  const { username, country, institution, profession, classification, researchInterests, orcid_id, profileImage, role } = req.body;
  if (!username) return res.status(400).json({ error: 'Username coordinates required' });
  const matchedUser = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!matchedUser) {
    return res.status(404).json({ error: 'Associated user database index not retrieved' });
  }
  if (country !== undefined) matchedUser.country = country.trim();
  if (institution !== undefined) matchedUser.institution = institution.trim();
  if (profession !== undefined) matchedUser.profession = profession.trim();
  if (classification !== undefined) matchedUser.classification = classification.trim();
  if (researchInterests !== undefined) matchedUser.researchInterests = researchInterests.trim();
  if (orcid_id !== undefined) matchedUser.orcid_id = orcid_id.trim();
  if (profileImage !== undefined) matchedUser.profileImage = profileImage;
  if (role !== undefined) matchedUser.role = role.trim();

  saveCollaborationDB();
  addAuditLog('SECURITY', `Profile credentials updated for: ${matchedUser.username}`);
  res.json({
    success: true,
    user: {
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role,
      institution: matchedUser.institution,
      country: matchedUser.country,
      profession: matchedUser.profession,
      classification: matchedUser.classification,
      researchInterests: matchedUser.researchInterests,
      orcid_id: matchedUser.orcid_id,
      profileImage: matchedUser.profileImage,
      isEmailVerified: matchedUser.isEmailVerified !== false
    }
  });
});

// E. PASSWORDS RECOVERY SYSTEMS
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Please enter a valid email address.' });
  const query = email.trim().toLowerCase();
  const matchedUser = users.find(u => u.email.toLowerCase() === query);
  if (!matchedUser) {
    return res.status(404).json({ error: 'This email address does not exist in our database.' });
  }

  // Generate clean 6-digit numeric OTP token
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  activeResetTokens[token] = { email: matchedUser.email, expiresAt: Date.now() + 5 * 60 * 1000 };

  addAuditLog('SECURITY', `Password recovery OTP requested for: ${matchedUser.username}`);
  console.log("\n========================================\n[PASSWORD RESET OTP DISPATCHED]\nRecipient:", matchedUser.email, "\nCode:", token, "\n========================================\n");
  logAction(`Password recovery OTP generated for ${matchedUser.username}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  let sentViaResend = false;

  if (resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'ERICON Gatewall <onboarding@resend.dev>',
          to: 'jakonikojoshuaa@gmail.com', // Override target per workspace integration
          subject: '🔑 ERICON Password Reset OTP Code',
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #121824; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; font-weight: 700; margin-bottom: 16px; font-size: 20px;">Reset Your Password</h2>
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">You requested a password reset. Use the 6-digit recovery OTP code below to complete the setup:</p>
              <div style="background-color: #1e293b; color: #10b981; font-size: 32px; font-weight: bold; text-align: center; padding: 16px; margin: 24px 0; border-radius: 8px; letter-spacing: 6px; border: 1px solid #334155;">
                ${token}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This OTP verification code will expire in 5 minutes.</p>
            </div>
          `
        })
      });
      if (emailResponse.ok) {
        sentViaResend = true;
      }
    } catch (err) {
      console.error('[RESEND PASSWORD RESET FAULT]', err);
    }
  }

  res.json({
    success: true,
    sandbox: !sentViaResend,
    token,
    simulatedEmailInboxPayload: {
      recipient: matchedUser.email,
      subject: '🔑 ERICON Password Reset OTP Code',
      body: `Your secure 6-digit password recovery code is: ${token}. This token expires in 5 minutes.`
    }
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  const record = activeResetTokens[token];
  if (!record) {
    return res.status(400).json({ error: 'Verification token is invalid or has expired.' });
  }
  if (record.expiresAt < Date.now()) {
    delete activeResetTokens[token];
    return res.status(400).json({ error: 'Verification token has expired.' });
  }

  const matchedUser = users.find(u => u.email.toLowerCase() === record.email.toLowerCase());
  if (!matchedUser) {
    return res.status(404).json({ error: 'Associated user account not found.' });
  }

  matchedUser.passwordHash = bcrypt.hashSync(newPassword, 10);
  delete activeResetTokens[token];
  saveCollaborationDB();

  addAuditLog('SECURITY', `Password upgraded successfully via secure recovery code for user: ${matchedUser.username}`);

  res.json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.'
  });
});

// F. PROGRESSIVE REGISTRATION SYSTEM ENDPOINTS
app.post('/api/auth/register-send-otp', checkRateLimit, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
  if (emailExists) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  registrationOTPs[normalizedEmail] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  console.log("\n========================================\n[REGISTRATION OTP DISPATCHED]\nEmail:", normalizedEmail, "\nCode:", otp, "\n========================================\n");
  logAction(`Registration OTP generated for ${normalizedEmail}`);

  const resendApiKey = process.env.RESEND_API_KEY;
  let sentViaResend = false;

  if (resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'ERICON Gatewall <onboarding@resend.dev>',
          to: 'jakonikojoshuaa@gmail.com', // Override target per workspace integration
          subject: '🔑 ERICON Registration Verification Code',
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; background-color: #121824; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; font-weight: 700; margin-bottom: 16px; font-size: 20px;">Verify Your Email Address</h2>
              <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5;">Thank you for registering. Use the 6-digit OTP verification code below to verify your email:</p>
              <div style="background-color: #1e293b; color: #10b981; font-size: 32px; font-weight: bold; text-align: center; padding: 16px; margin: 24px 0; border-radius: 8px; letter-spacing: 6px; border: 1px solid #334155;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This OTP verification code will expire in 5 minutes.</p>
            </div>
          `
        })
      });
      if (emailResponse.ok) {
        sentViaResend = true;
      }
    } catch (err) {
      console.error('[RESEND REGISTRATION OTP FAULT]', err);
    }
  }

  res.json({
    success: true,
    sandbox: !sentViaResend,
    otp: !sentViaResend ? otp : undefined,
    simulatedEmailInboxPayload: {
      recipient: email,
      subject: '🔑 ERICON Registration Verification Code',
      body: `Your secure 6-digit email verification code is: ${otp}. This code expires in 5 minutes.`
    }
  });
});

app.post('/api/auth/register-verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const record = registrationOTPs[normalizedEmail];
  if (!record) {
    return res.status(400).json({ error: 'No active OTP request found or expired.' });
  }
  if (record.expiresAt < Date.now()) {
    delete registrationOTPs[normalizedEmail];
    return res.status(400).json({ error: 'OTP code has expired.' });
  }
  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
  }

  // Successfully verified, we can keep the OTP active for finalizing or clear it
  // Let's clear it and return success
  delete registrationOTPs[normalizedEmail];
  res.json({ success: true });
});

app.post('/api/auth/register-finalize', checkRateLimit, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required fields.' });
  }
  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
  if (emailExists) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }

  const baseUsername = normalizedEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  const username = baseUsername || `user_${Math.floor(Date.now() / 100000)}`;

  const newUser = {
    username,
    email: normalizedEmail,
    role: 'Research Member',
    institution: 'ERICON Ecological Group',
    country: 'Tanzania',
    profession: 'Ecological Scientist',
    classification: 'Expert',
    researchInterests: 'Pneumatic vectors, epidemiology',
    orcid_id: '',
    profileImage: '',
    passwordHash: bcrypt.hashSync(password, 10),
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveCollaborationDB();
  addAuditLog('SECURITY', `New scientist registration finalized: ${newUser.username} (${newUser.email})`);
  logAction(`${newUser.username} registered`);

  res.json({
    success: true,
    user: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      institution: newUser.institution,
      country: newUser.country,
      profession: newUser.profession,
      classification: newUser.classification,
      researchInterests: newUser.researchInterests,
      orcid_id: newUser.orcid_id,
      profileImage: newUser.profileImage,
      isEmailVerified: newUser.isEmailVerified
    }
  });
});

// F. COLLABORATIVE ACTIONS DELEGATORS
app.post('/api/projects/create', (req, res) => {
  const { name, description, creator } = req.body;
  if (!name || !creator) {
    return res.status(400).json({ error: 'Project name and creator coordinates are required' });
  }
  const code = 'ERICON-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const id = 'proj-' + Date.now();
  const newProject = {
    id,
    name: name.trim(),
    description: (description || '').trim(),
    code,
    creator: creator.trim(),
    createdAt: new Date().toISOString()
  };
  projects.push(newProject);
  userProjects.push({
    username: creator.trim(),
    projectId: id,
    role: 'Team Leader',
    joinedAt: new Date().toISOString()
  });
  saveCollaborationDB();
  addAuditLog('COLLABORATION', `New collaborative project created: "${newProject.name}" [Code: ${newProject.code}] by: ${creator}`);
  logAction(`Project Created: ${newProject.name} by ${creator}`);
  res.json({ success: true, project: newProject });
});

app.post('/api/projects/accept-invite', (req, res) => {
  const { inviteCodeOrLink, username } = req.body;
  if (!inviteCodeOrLink || !username) {
    return res.status(400).json({ error: 'Invitation link/code and username are required' });
  }
  const cleanInput = inviteCodeOrLink.trim();
  let cleanCode = cleanInput;
  if (cleanInput.includes('code=')) {
    cleanCode = cleanInput.split('code=')[1].split('&')[0];
  } else if (cleanInput.includes('/invite/')) {
    cleanCode = cleanInput.split('/invite/')[1].split('?')[0];
  }

  const targetProject = projects.find(p => p.code.toUpperCase() === cleanCode.toUpperCase() || p.id === cleanCode);
  if (!targetProject) {
    return res.status(404).json({ error: 'The provided invite code or secure link was not found in active registries' });
  }

  const alreadyJoined = userProjects.some(up => up.username.toLowerCase() === username.trim().toLowerCase() && up.projectId === targetProject.id);
  if (alreadyJoined) {
    return res.status(400).json({ error: `You are already registered inside: "${targetProject.name}"` });
  }

  userProjects.push({
    username: username.trim(),
    projectId: targetProject.id,
    role: 'Research Member',
    joinedAt: new Date().toISOString()
  });
  saveCollaborationDB();
  addAuditLog('COLLABORATION', `User "${username}" aligned with research project: "${targetProject.name}" via code "${cleanCode}".`);
  logAction(`User ${username} joined project "${targetProject.name}"`);

  res.json({ success: true, project: targetProject });
});

app.get('/api/projects/user-projects', (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Missing username parameter' });
  const j = userProjects.filter(up => up.username.toLowerCase() === (username as string).trim().toLowerCase());
  const list = j.map(item => {
    const p = projects.find(x => x.id === item.projectId);
    return p ? { ...p, memberRole: item.role, joinedAt: item.joinedAt } : null;
  }).filter(Boolean);

  res.json({ success: true, projects: list });
});

app.get('/api/projects/all-projects', (req, res) => {
  res.json({ success: true, projects });
});

app.get('/api/projects/audit-logs', (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

app.get('/api/action-logs', (req, res) => {
  res.json({ success: true, logs: actionLogs });
});

// C. RETRIEVE SCHOLARLY FORUM THREAD INDEX
app.get('/api/forum/comments', (req, res) => {
  const { channel } = req.query;
  if (channel) {
    // If a channel is specified, filter comments by it. Non-tagged comments default to "research".
    const filteredComments = comments.filter(c => {
      const msgChannel = c.channel || 'research';
      return msgChannel === channel;
    });
    return res.json({ comments: filteredComments });
  }
  res.json({ comments });
});

// D. POST TO SCHOLARLY FORUM WITH GRAPH ATTACHMENT
app.post('/api/forum/comments', (req, res) => {
  const { author, authorRole, authorInstitution, content, chartState, channel } = req.body;
  if (!author || !content || !content.trim()) {
    return res.status(400).json({ error: 'Scholarly posts must contain an author and a valid content body' });
  }

  const newComment = {
    id: 'comment-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    author: author.trim(),
    authorRole: (authorRole || 'Field Researcher').trim(),
    authorInstitution: (authorInstitution || 'ERICON Eco-Framework').trim(),
    timestamp: new Date().toISOString(),
    content: content.trim(),
    channel: channel || 'research', // Default back to research channel if undefined
    chartState: chartState || null,
    reactions: { insightful: 0, verified: 0, alert: 0, fluid: 0 },
    replies: []
  };

  comments.unshift(newComment); // Newest discussions appear at the top
  saveCollaborationDB();

  res.json({ success: true, comment: newComment });
});

// E. POST FEEDBACK RESPONSE / REPLY TO COMMENT THREAD
app.post('/api/forum/comments/:id/reply', (req, res) => {
  const { id } = req.params;
  const { author, authorRole, authorInstitution, content } = req.body;

  if (!author || !content || !content.trim()) {
    return res.status(400).json({ error: 'Scientific peer responses require an author name and discussion body' });
  }

  const matchedIndex = comments.findIndex(c => c.id === id);
  if (matchedIndex === -1) {
    return res.status(404).json({ error: 'The targeted dialogue thread could not be retrieved from disk representation' });
  }

  const newReply = {
    id: 'reply-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    author: author.trim(),
    authorRole: (authorRole || 'Field Researcher').trim(),
    authorInstitution: (authorInstitution || 'ERICON Eco-Framework').trim(),
    timestamp: new Date().toISOString(),
    content: content.trim()
  };

  comments[matchedIndex].replies.push(newReply);
  saveCollaborationDB();

  res.json({ success: true, reply: newReply, parentComment: comments[matchedIndex] });
});

// E2. UPVOTE / ADD REACTION TO THREAD
app.post('/api/forum/comments/:id/react', (req, res) => {
  const { id } = req.params;
  const { reactionType } = req.body;

  if (!reactionType) {
    return res.status(400).json({ error: 'reactionType is strictly required' });
  }

  const matchedIndex = comments.findIndex(c => c.id === id);
  if (matchedIndex === -1) {
    return res.status(404).json({ error: 'The dialogue thread requested for upvote was not found' });
  }

  if (!comments[matchedIndex].reactions) {
    comments[matchedIndex].reactions = { insightful: 0, verified: 0, alert: 0, fluid: 0 };
  }

  // Increment reaction counter
  comments[matchedIndex].reactions[reactionType] = (comments[matchedIndex].reactions[reactionType] || 0) + 1;
  saveCollaborationDB();

  res.json({ success: true, reactions: comments[matchedIndex].reactions });
});

// 3. VITE MIDDLEWARE BOOTSTRAPPER (DEVELOPMENT VS STANDALONE PRODUCTION)
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // Hook up Vite HMR pipeline after raw APIs
    app.use(vite.middlewares);
    console.log('Vite development server middleware loaded.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static client handler enabled.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ERICON FULL-STACK SERVER] Running and hosting on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
