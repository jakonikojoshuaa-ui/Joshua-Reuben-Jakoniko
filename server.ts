import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

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

    // Generate output
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...formatHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.75,
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

const DB_FILE = path.join(process.cwd(), 'db_forum.json');

// In-memory data tables mirrored to disk
let users: any[] = [];
let comments: any[] = [];

// Seed default accounts and comments if not present
function loadCollaborationDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      users = parsed.users || [];
      comments = (parsed.comments || []).map((c: any) => ({
        ...c,
        reactions: c.reactions || { insightful: 0, verified: 0, alert: 0, fluid: 0 }
      }));
    } else {
      // Seed pre-verified active scientific personnel
      users = [
        {
          username: 'sjenkins',
          email: 's.jenkins@ericon.org',
          role: 'Senior Epidemiologist',
          institution: 'ERICON Ecological Group',
          passwordHash: 'simple_hash_123456',
          createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
        },
        {
          username: 'mvance',
          email: 'm.vance@reynolds.tech',
          role: 'Fluid Dynamics Specialist',
          institution: 'Reynolds Biotechnical',
          passwordHash: 'simple_hash_123456',
          createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString()
        }
      ];

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
          reactions: { insightful: 1, verified: 0, alert: 2, fluid: 4 },
          replies: []
        }
      ];
      saveCollaborationDB();
    }
  } catch (err) {
    console.error('[DATABASE INITIALIZATION EXCEPTION] Reverting to defaults', err);
  }
}

function saveCollaborationDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users, comments }, null, 2), 'utf8');
  } catch (err) {
    console.error('[DATABASE WRITE FAULT]', err);
  }
}

// Instantiate storage mirror
loadCollaborationDB();

// A. USER REGISTRATION
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, role, institution } = req.body;
  if (!username || !email || !password || !role || !institution) {
    return res.status(400).json({ error: 'All parameters (username, email, password, role, institution) are strictly required' });
  }

  const normalizedUser = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = users.some(u => u.username.toLowerCase() === normalizedUser || u.email.toLowerCase() === normalizedEmail);
  if (userExists) {
    return res.status(400).json({ error: 'Username or Email is already registered inside ERICON directories' });
  }

  const newUser = {
    username: username.trim(),
    email: email.trim(),
    role: role.trim(),
    institution: institution.trim(),
    passwordHash: 'simple_hash_' + password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveCollaborationDB();

  res.json({
    success: true,
    user: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      institution: newUser.institution
    }
  });
});

// B. USER SIGN-IN / LOGIN
app.post('/api/auth/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Please submit credentials' });
  }

  const query = usernameOrEmail.trim().toLowerCase();
  const matchedUser = users.find(u => 
    (u.username.toLowerCase() === query || u.email.toLowerCase() === query) &&
    (u.passwordHash === 'simple_hash_' + password || u.passwordHash === 'sha256_mock_hash' || u.passwordHash === 'sha255_mock_hash')
  );

  if (!matchedUser) {
    return res.status(401).json({ error: 'The provided credentials do not match parameters inside the ERICON staff directory' });
  }

  res.json({
    success: true,
    user: {
      username: matchedUser.username,
      email: matchedUser.email,
      role: matchedUser.role,
      institution: matchedUser.institution
    }
  });
});

// C. RETRIEVE SCHOLARLY FORUM THREAD INDEX
app.get('/api/forum/comments', (req, res) => {
  res.json({ comments });
});

// D. POST TO SCHOLARLY FORUM WITH GRAPH ATTACHMENT
app.post('/api/forum/comments', (req, res) => {
  const { author, authorRole, authorInstitution, content, chartState } = req.body;
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
