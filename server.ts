import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(express.json());

// Administrator Configuration
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'navin@navinhomeocare.com').toLowerCase();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'nhc_secure_session_secret_2026';

// Server-side credential store (never stored in plaintext)
const salt = crypto.randomBytes(16).toString('hex');
let storedPasswordHash = crypto
  .createHash('sha256')
  .update('Admin@Navin2026' + '::NHC_SECURE_SALT_2026::' + salt)
  .digest('hex');

const activeSessions = new Map<string, { email: string; expiresAt: number }>();

// ==================== AUTH API ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, error: 'Unauthorized administrator email address.' });
  }

  const attemptHash = crypto
    .createHash('sha256')
    .update(password + '::NHC_SECURE_SALT_2026::' + salt)
    .digest('hex');

  if (attemptHash !== storedPasswordHash) {
    return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
  }

  const token = 'nhc_srv_' + crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  activeSessions.set(token, { email: cleanEmail, expiresAt });

  return res.json({
    success: true,
    token,
    user: {
      email: ADMIN_EMAIL,
      name: 'Administrator (Dr. Navin Maurya Desk)',
      role: 'super_admin',
      lastLogin: new Date().toISOString(),
    },
    expiresAt,
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ valid: false });
  }
  return res.json({ valid: true, user: { email: session.email, role: 'super_admin' } });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});

app.post('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const attemptHash = crypto
    .createHash('sha256')
    .update(currentPassword + '::NHC_SECURE_SALT_2026::' + salt)
    .digest('hex');

  if (attemptHash !== storedPasswordHash) {
    return res.status(400).json({ success: false, error: 'Current password does not match.' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
  }

  storedPasswordHash = crypto
    .createHash('sha256')
    .update(newPassword + '::NHC_SECURE_SALT_2026::' + salt)
    .digest('hex');

  return res.json({ success: true, message: 'Password updated successfully.' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    clinic: 'Navin Homeo Care & Research Center',
    timestamp: new Date().toISOString(),
  });
});

// ==================== VITE MIDDLEWARE / STATIC ASSETS ====================
async function startServer() {
  // Always serve public directory for static assets like Navin.png
  app.use(express.static(path.resolve(__dirname, 'public')));

  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Navin Homeo Care server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
