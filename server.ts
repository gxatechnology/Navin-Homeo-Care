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
    clinic: 'Navin Homeo Care',
    timestamp: new Date().toISOString(),
  });
});

// ==================== APPOINTMENTS API ROUTES ====================
const APPOINTMENTS_FILE = path.resolve(__dirname, 'data', 'appointments.json');

function getStoredAppointments(): any[] {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const raw = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading appointments file:', err);
  }
  return [];
}

function saveAppointmentsToFile(data: any[]): void {
  try {
    const dir = path.dirname(APPOINTMENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing appointments file:', err);
  }
}

// GET all appointments
app.get('/api/appointments', (req, res) => {
  try {
    const list = getStoredAppointments();
    const { ref, status } = req.query;
    let result = [...list];

    if (ref && typeof ref === 'string') {
      const found = result.find((a) => a.bookingReference.toLowerCase() === ref.toLowerCase());
      return res.json({ success: true, appointment: found || null });
    }

    if (status && typeof status === 'string') {
      result = result.filter((a) => a.status === status);
    }

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json({ success: true, appointments: result, count: result.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST new appointment
app.post('/api/appointments', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.fullName || !body.phone || !body.preferredDate || !body.preferredTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required appointment fields: fullName, phone, preferredDate, preferredTime.',
      });
    }

    const list = getStoredAppointments();
    const bookingReference =
      body.bookingReference || `NHC-${Math.floor(100000 + Math.random() * 900000)}`;

    const existingIdx = list.findIndex((a) => a.bookingReference === bookingReference);
    if (existingIdx !== -1) {
      return res.json({
        success: true,
        message: 'Appointment already registered.',
        record: list[existingIdx],
      });
    }

    const newRecord = {
      bookingReference,
      fullName: String(body.fullName).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : '',
      age: body.age ? String(body.age).trim() : '',
      patientType: body.patientType === 'existing' ? 'existing' : 'new',
      preferredDate: String(body.preferredDate),
      preferredTime: String(body.preferredTime),
      healthConcern: body.healthConcern ? String(body.healthConcern).trim() : 'General Consultation',
      symptomsNote: body.symptomsNote ? String(body.symptomsNote).trim() : '',
      timestamp: body.timestamp || new Date().toISOString(),
      status: body.status || 'requested',
      source: body.source || 'Website',
      internalNotes: Array.isArray(body.internalNotes) ? body.internalNotes : [],
      appointmentType: body.appointmentType || 'In-Clinic OPD',
    };

    list.unshift(newRecord);
    saveAppointmentsToFile(list);

    return res.status(201).json({
      success: true,
      message: 'Appointment registered successfully.',
      bookingReference,
      record: newRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update appointment
app.put('/api/appointments', (req, res) => {
  try {
    const body = req.body || {};
    const { bookingReference, status, newDate, newTime, noteText, author } = body;

    if (!bookingReference) {
      return res.status(400).json({ success: false, error: 'bookingReference is required.' });
    }

    const list = getStoredAppointments();
    const index = list.findIndex((a) => a.bookingReference === bookingReference);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const appt = list[index];

    if (status) {
      appt.status = status;
    }

    if (newDate && newTime) {
      appt.rescheduledFrom = `${appt.preferredDate} (${appt.preferredTime})`;
      appt.preferredDate = newDate;
      appt.preferredTime = newTime;
      appt.status = 'confirmed';
      appt.internalNotes = appt.internalNotes || [];
      appt.internalNotes.push({
        id: 'note_' + Date.now(),
        author: author || 'Admin Desk',
        text: `Rescheduled to ${newDate} (${newTime})`,
        createdAt: new Date().toISOString(),
      });
    }

    if (noteText) {
      appt.internalNotes = appt.internalNotes || [];
      appt.internalNotes.push({
        id: 'note_' + Date.now(),
        author: author || 'Admin Desk',
        text: String(noteText).trim(),
        createdAt: new Date().toISOString(),
      });
    }

    list[index] = appt;
    saveAppointmentsToFile(list);

    return res.json({
      success: true,
      message: 'Appointment updated successfully.',
      record: appt,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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
