import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  users: any[];
  tasks: any[];
  submissions: any[];
  hallOfFame: any[];
  withdrawals: any[];
}

const INITIAL_TASKS = [
  {
    id: 'blog-1',
    type: 'blog',
    title: 'Monetizing High-Value Tech & Copywriting Skills in East Africa',
    description:
      'Explore proven strategies for local freelancers to charge competitive rates on global remote work platforms, manage client deliverables, and receive payments seamlessly.',
    reward: 100,
    readingTimeMinutes: 4,
    blogOutline: [
      'Identifying high-income digital service niches in Kenya',
      'Pitching international clients with verifiable work samples',
      'Optimizing local remittance and mobile money workflows',
      'Building long-term retainer agreements with startups',
    ],
  },
  {
    id: 'blog-2',
    type: 'blog',
    title: 'Digital Content Marketing & Viral Distribution Blueprint',
    description:
      'Learn how African content creators and e-commerce entrepreneurs leverage TikTok, WhatsApp Channels, and search algorithms to drive consistent traffic and sales.',
    reward: 100,
    readingTimeMinutes: 5,
    blogOutline: [
      'Hook formulas that stop endless social media scrolling',
      'Repurposing one research blog into 5 micro-assets',
      'Harnessing localized community trust for peer-to-peer marketing',
    ],
  },
  {
    id: 'blog-3',
    type: 'blog',
    title: 'Financial Independence: Strategic Micro-Savings & M-Pesa Cashflows',
    description:
      'A practical guide on how young earners can channel daily freelance earnings into disciplined digital liquidity funds, SACCO dividends, and money market growth.',
    reward: 100,
    readingTimeMinutes: 4,
    blogOutline: [
      'Separating operational working capital from discretionary spend',
      'Automated daily savings using mobile banking buckets',
      'Shielding freelance earnings from inflation through sound assets',
    ],
  },
  {
    id: 'academic-1',
    type: 'academic',
    title: 'Open Academic & Research Blog Submission',
    description:
      'Write an original, well-structured academic blog or analytical essay on any topic of your choice. If approved by the admin, you will get paid KSh 100!',
    reward: 100,
  },
  {
    id: 'trans-1',
    type: 'translation',
    title: 'Translation Task #1 (English to Kiswahili)',
    description: 'Translate this financial inclusion paragraph into natural, fluent Kiswahili.',
    reward: 5,
    sourceLanguage: 'English',
    targetLanguage: 'Kiswahili',
    sourceText:
      'The rapid expansion of mobile banking has empowered millions of micro-entrepreneurs across East Africa with immediate access to working capital and savings products.',
  },
  {
    id: 'trans-2',
    type: 'translation',
    title: 'Translation Task #2 (Kiswahili to English)',
    description: 'Translate this community enterprise statement into accurate, professional English.',
    reward: 5,
    sourceLanguage: 'Kiswahili',
    targetLanguage: 'English',
    sourceText:
      'Vijana wengi sasa wanatumia mtandao kujifunza ujuzi wa kidijitali, kupata wateja wapya, na kuboresha maisha ya jamii zao bila kutegemea ajira za kawaida.',
  },
  {
    id: 'trans-3',
    type: 'translation',
    title: 'Translation Task #3 (French to English)',
    description: 'Translate this trade bulletin excerpt from French into clear English.',
    reward: 5,
    sourceLanguage: 'French',
    targetLanguage: 'English',
    sourceText:
      "L'intégration des plateformes de paiement électronique accélère les échanges commerciaux régionaux et réduit significativement les coûts de transaction pour les petites entreprises.",
  },
  {
    id: 'trans-4',
    type: 'translation',
    title: 'Translation Task #4 (English to Kiswahili)',
    description: 'Translate this technology literacy guidance into idiomatic Kiswahili.',
    reward: 5,
    sourceLanguage: 'English',
    targetLanguage: 'Kiswahili',
    sourceText:
      'Transparent reporting and honest customer communication are the primary pillars of enduring commercial trust in digital platforms.',
  },
  {
    id: 'trans-5',
    type: 'translation',
    title: 'Translation Task #5 (Spanish to English)',
    description: 'Translate this remote work testimonial from Spanish into English.',
    reward: 5,
    sourceLanguage: 'Spanish',
    targetLanguage: 'English',
    sourceText:
      'La flexibilidad del trabajo digital permite a los jóvenes colaborar con organizaciones globales mientras contribuyen activamente a la economía de sus comunidades locales.',
  },
  {
    id: 'trivia-1',
    type: 'trivia',
    title: 'Trivia Question #1: National Heritage',
    description: 'Answer this history and geography question correctly to earn your reward.',
    reward: 5,
    question: 'In which year did Kenya gain full national independence (Madaraka / Jamhuri)?',
    options: ['1958', '1963', '1970', '1982'],
  },
  {
    id: 'trivia-2',
    type: 'trivia',
    title: 'Trivia Question #2: Currency & Commerce',
    description: 'Answer this economic trivia accurately.',
    reward: 5,
    question: 'What is the full official ISO currency code and common symbol for the Kenyan Shilling?',
    options: ['KES / KSh', 'KYS / Sh', 'EA-KES / Ks', 'KNC / K-Coin'],
  },
  {
    id: 'trivia-3',
    type: 'trivia',
    title: 'Trivia Question #3: Web Security',
    description: 'Test your internet security knowledge.',
    reward: 5,
    question: 'In modern secure web protocols, what does the "S" in HTTPS officially represent?',
    options: ['Simple', 'Speed', 'Secure', 'Server'],
  },
];

const INITIAL_USERS = [
  {
    id: 'user-001',
    username: 'felix_omondi',
    fullName: 'Felix Omondi',
    phone: '0712345678',
    password: 'password123',
    role: 'user',
    isActivated: true,
    activationStatus: 'approved',
    mpesaCode: 'SDF4902KLO',
    activationSubmittedAt: '2026-10-20T08:15:00Z',
    availableBalance: 850,
    totalEarnings: 2600,
    registeredAt: '2026-10-20T08:00:00Z',
    referralBonusEarned: 600,
  },
  {
    id: 'user-002',
    username: 'mary_wanjiku',
    fullName: 'Mary Wanjiku Kamau',
    phone: '0722998877',
    password: 'password123',
    role: 'user',
    isActivated: true,
    activationStatus: 'approved',
    mpesaCode: 'QK891048XA',
    activationSubmittedAt: '2026-10-21T10:30:00Z',
    availableBalance: 400,
    totalEarnings: 1500,
    referrerUsername: 'felix_omondi',
    registeredAt: '2026-10-21T10:00:00Z',
    referralBonusEarned: 300,
  },
  {
    id: 'user-003',
    username: 'samuel_kiprono',
    fullName: 'Samuel Kiprono',
    phone: '0708554433',
    password: 'password123',
    role: 'user',
    isActivated: false,
    activationStatus: 'pending',
    mpesaCode: 'TG992810PL',
    activationSubmittedAt: '2026-10-24T14:20:00Z',
    availableBalance: 0,
    totalEarnings: 0,
    referrerUsername: 'felix_omondi',
    registeredAt: '2026-10-24T14:10:00Z',
  },
];

const INITIAL_HALL_OF_FAME = [
  {
    id: 'hof-1',
    userName: 'Mary Wanjiku Kamau',
    userPhone: '0722***877',
    amountCredited: 100,
    achievementTitle: 'Academic Essay: Scaling Agritech Logistics in Central Kenya',
    congratsMessage:
      'Congratulations to Mary Wanjiku (0722***877) for having her academic blog approved! Awarded KSh 100.',
    date: '2026-10-23',
    category: 'academic',
  },
  {
    id: 'hof-2',
    userName: 'Felix Omondi',
    userPhone: '0712***678',
    amountCredited: 100,
    achievementTitle: 'Blog Review: Freelance Economy Mastery in Nairobi',
    congratsMessage:
      'Congratulations to Felix Omondi (0712***678) on his approved featured blog review! Credited KSh 100.',
    date: '2026-10-22',
    category: 'blog',
  },
];

function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DBStructure = {
        users: INITIAL_USERS,
        tasks: INITIAL_TASKS,
        submissions: [],
        hallOfFame: INITIAL_HALL_OF_FAME,
        withdrawals: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      users: INITIAL_USERS,
      tasks: INITIAL_TASKS,
      submissions: [],
      hallOfFame: INITIAL_HALL_OF_FAME,
      withdrawals: [],
    };
  }
}

function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. API: Get all users (shared across all devices)
  app.get('/api/users', (req, res) => {
    const db = readDB();
    res.json({ success: true, users: db.users });
  });

  // 2. API: Register user (supports referral bonus allocation)
  app.post('/api/register', (req, res) => {
    const { username, fullName, phone, password, referrerUsername } = req.body;
    if (!username || !fullName || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const db = readDB();

    if (db.users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username is already registered. Please choose another or log in.',
      });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username: cleanUsername,
      fullName: fullName.trim(),
      phone: phone.trim(),
      password,
      role: 'user',
      isActivated: false,
      activationStatus: 'none',
      availableBalance: 0,
      totalEarnings: 0,
      referrerUsername: referrerUsername ? referrerUsername.trim().toLowerCase() : undefined,
      registeredAt: new Date().toISOString(),
      referralBonusEarned: 0,
    };

    // Credit referrer with KSh 300 if applicable
    if (newUser.referrerUsername) {
      const refIdx = db.users.findIndex(
        (u) => u.username.toLowerCase() === newUser.referrerUsername!.toLowerCase()
      );
      if (refIdx !== -1) {
        db.users[refIdx].availableBalance = (db.users[refIdx].availableBalance || 0) + 300;
        db.users[refIdx].referralBonusEarned = (db.users[refIdx].referralBonusEarned || 0) + 300;
      }
    }

    db.users.push(newUser);
    writeDB(db);

    console.log(`[MegaQash DB] Registered new user: @${newUser.username} (${newUser.phone})`);
    return res.json({ success: true, user: newUser });
  });

  // 3. API: Login user
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === (username || '').trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    return res.json({ success: true, user });
  });

  // 4. API: Submit M-Pesa activation code
  app.post('/api/activate', (req, res) => {
    const { userId, mpesaCode } = req.body;
    const db = readDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);

    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.users[userIdx].mpesaCode = (mpesaCode || '').trim().toUpperCase();
    db.users[userIdx].activationStatus = 'pending';
    db.users[userIdx].activationSubmittedAt = new Date().toISOString();
    writeDB(db);

    return res.json({
      success: true,
      message: 'M-Pesa code submitted successfully! Your account activation is now pending Admin approval.',
      user: db.users[userIdx],
    });
  });

  // 5. API: Admin activate ANY user (with optional different payer phone)
  app.post('/api/admin/activate', (req, res) => {
    const { userId, payerPhone, customCode } = req.body;
    const db = readDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);

    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.users[userIdx].isActivated = true;
    db.users[userIdx].activationStatus = 'approved';
    if (customCode) {
      db.users[userIdx].mpesaCode = customCode.trim().toUpperCase();
    } else if (!db.users[userIdx].mpesaCode) {
      db.users[userIdx].mpesaCode = 'ADMIN_APPROVED';
    }
    if (payerPhone) {
      db.users[userIdx].payerPhone = payerPhone.trim();
    }

    writeDB(db);

    return res.json({
      success: true,
      message: `Account for ${db.users[userIdx].username} (${db.users[userIdx].phone}${
        payerPhone ? ` / Payer Phone: ${payerPhone}` : ''
      }) activated successfully!`,
      user: db.users[userIdx],
    });
  });

  // 6. API: Admin deactivate user
  app.post('/api/admin/deactivate', (req, res) => {
    const { userId } = req.body;
    const db = readDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);

    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    db.users[userIdx].isActivated = false;
    db.users[userIdx].activationStatus = 'rejected';
    writeDB(db);

    return res.json({
      success: true,
      message: `Account for ${db.users[userIdx].username} deactivated.`,
      user: db.users[userIdx],
    });
  });

  // 7. API: Admin adjust balance
  app.post('/api/admin/adjust-balance', (req, res) => {
    const { userId, amountChange, reason } = req.body;
    const db = readDB();
    const userIdx = db.users.findIndex((u) => u.id === userId);

    if (userIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const current = db.users[userIdx].availableBalance || 0;
    const updated = Math.max(0, current + Number(amountChange));
    db.users[userIdx].availableBalance = updated;
    writeDB(db);

    return res.json({
      success: true,
      message: `Adjusted balance of ${db.users[userIdx].username} by KSh ${
        amountChange > 0 ? '+' : ''
      }${amountChange} (${reason}). New balance: KSh ${updated}`,
      newBalance: updated,
    });
  });

  // 8. API: Tasks
  app.get('/api/tasks', (req, res) => {
    const db = readDB();
    res.json({ success: true, tasks: db.tasks });
  });

  app.post('/api/tasks', (req, res) => {
    const newTask = req.body;
    const db = readDB();
    db.tasks.push(newTask);
    writeDB(db);
    res.json({ success: true, tasks: db.tasks });
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    writeDB(db);
    res.json({ success: true, tasks: db.tasks });
  });

  // 9. API: Submissions
  app.get('/api/submissions', (req, res) => {
    const db = readDB();
    res.json({ success: true, submissions: db.submissions });
  });

  app.post('/api/submissions', (req, res) => {
    const newSub = req.body;
    const db = readDB();

    const existingPending = db.submissions.find(
      (s) => s.taskId === newSub.taskId && s.userId === newSub.userId && s.status === 'pending'
    );
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending submission for this task.',
      });
    }

    db.submissions.unshift(newSub);
    writeDB(db);
    res.json({ success: true, submission: newSub });
  });

  app.post('/api/admin/submissions/review', (req, res) => {
    const { submissionId, approved, adminFeedback } = req.body;
    const db = readDB();
    const subIdx = db.submissions.findIndex((s) => s.id === submissionId);

    if (subIdx === -1) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const sub = db.submissions[subIdx];
    sub.status = approved ? 'approved' : 'rejected';
    sub.adminFeedback = adminFeedback;

    if (approved) {
      const uIdx = db.users.findIndex((u) => u.id === sub.userId);
      if (uIdx !== -1) {
        db.users[uIdx].availableBalance = (db.users[uIdx].availableBalance || 0) + sub.rewardAmount;
      }
    }

    writeDB(db);
    res.json({
      success: true,
      message: approved
        ? `Submission approved! KSh ${sub.rewardAmount} credited to ${sub.username}.`
        : `Submission rejected for ${sub.username}.`,
    });
  });

  // 10. API: Hall of Fame
  app.get('/api/hall-of-fame', (req, res) => {
    const db = readDB();
    res.json({ success: true, hallOfFame: db.hallOfFame });
  });

  app.post('/api/admin/hall-of-fame', (req, res) => {
    const entry = req.body;
    const db = readDB();
    db.hallOfFame.unshift(entry);
    writeDB(db);
    res.json({ success: true, hallOfFame: db.hallOfFame });
  });

  app.delete('/api/admin/hall-of-fame/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.hallOfFame = db.hallOfFame.filter((h) => h.id !== id);
    writeDB(db);
    res.json({ success: true, hallOfFame: db.hallOfFame });
  });

  // 11. API: Withdrawals
  app.get('/api/withdrawals', (req, res) => {
    const db = readDB();
    res.json({ success: true, withdrawals: db.withdrawals });
  });

  app.post('/api/withdrawals', (req, res) => {
    const { userId, username, phone, amount } = req.body;
    const db = readDB();
    const uIdx = db.users.findIndex((u) => u.id === userId);

    if (uIdx === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = db.users[uIdx];
    if ((user.availableBalance || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available balance: KSh ${user.availableBalance}`,
      });
    }

    user.availableBalance -= amount;
    user.totalEarnings = (user.totalEarnings || 0) + amount;

    const newWd = {
      id: `wd-${Date.now()}`,
      userId,
      username,
      phone,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    db.withdrawals.unshift(newWd);
    writeDB(db);

    res.json({ success: true, withdrawal: newWd, user });
  });

  app.post('/api/admin/withdrawals/review', (req, res) => {
    const { withdrawalId, approved } = req.body;
    const db = readDB();
    const wdIdx = db.withdrawals.findIndex((w) => w.id === withdrawalId);

    if (wdIdx === -1) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    }

    const wd = db.withdrawals[wdIdx];
    wd.status = approved ? 'approved' : 'rejected';

    if (!approved) {
      const uIdx = db.users.findIndex((u) => u.id === wd.userId);
      if (uIdx !== -1) {
        db.users[uIdx].availableBalance = (db.users[uIdx].availableBalance || 0) + wd.amount;
        db.users[uIdx].totalEarnings = Math.max(0, (db.users[uIdx].totalEarnings || 0) - wd.amount);
      }
    }

    writeDB(db);
    res.json({
      success: true,
      message: approved
        ? `Withdrawal of KSh ${wd.amount} marked as Paid!`
        : `Withdrawal rejected and refunded.`,
    });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MegaQash Technologies Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
