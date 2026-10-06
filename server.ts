import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { serverProductRepository, DatabaseConfigurationError } from './lib/server/productRepository';
import { uploadProductImage, StorageConfigurationError } from './lib/server/storage';
import { isServerRequestAuthenticated, createAdminSessionToken } from './lib/server/auth';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Administrator Configuration
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'navin@navinhomeocare.com').toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'Navin123@$';

// Verify Password
function verifyAdminPassword(attempt: string): boolean {
  if (!attempt) return false;
  if (ADMIN_PASSWORD_HASH) {
    const hash = crypto.createHash('sha256').update(attempt).digest('hex');
    return hash === ADMIN_PASSWORD_HASH;
  }
  return attempt === INITIAL_ADMIN_PASSWORD;
}

// Authentication middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (isServerRequestAuthenticated(req)) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Admin authentication session token required.',
  });
}

// Production Database check middleware
function requireDatabaseInProduction(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    serverProductRepository.assertDatabaseConfigured();
    next();
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({
        success: false,
        error: err.message,
      });
    }
    next();
  }
}

// ==================== AUTH API ROUTES ====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
  }

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
  }

  const token = createAdminSessionToken(cleanEmail);
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

  return res.json({
    success: true,
    token,
    user: {
      email: ADMIN_EMAIL,
      name: 'Dr. Navin Maurya (Chief Administrator)',
      role: 'super_admin',
      lastLogin: new Date().toISOString(),
    },
    expiresAt,
  });
});

app.get('/api/auth/verify', (req, res) => {
  if (isServerRequestAuthenticated(req)) {
    return res.json({ valid: true, user: { email: ADMIN_EMAIL, role: 'super_admin' } });
  }
  return res.status(401).json({ valid: false });
});

app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    clinic: 'Navin Homeo Care',
    database: serverProductRepository.isDatabaseConfigured() ? 'postgresql_connected' : 'local_development_mode',
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

// ==================== PRODUCTS & INVENTORY API ROUTES ====================
function sanitizePublicProduct(prod: any): any {
  if (!prod) return prod;
  const { costPrice, supplier, ...safeProduct } = prod;
  return safeProduct;
}

// GET /api/products
app.get('/api/products', requireDatabaseInProduction, async (req, res) => {
  try {
    const isAdmin = isServerRequestAuthenticated(req);
    const { category, search, stockStatus, active, archived, publicOnly } = req.query;

    const products = await serverProductRepository.getAllProducts({
      publicOnly: !isAdmin || publicOnly === 'true',
      category: typeof category === 'string' ? category : undefined,
      stockStatus: typeof stockStatus === 'string' ? stockStatus : undefined,
      search: typeof search === 'string' ? search : undefined,
      active: isAdmin && active !== undefined ? active === 'true' : undefined,
      archived: isAdmin && archived !== undefined ? archived === 'true' : undefined,
    });

    const sanitized = !isAdmin || publicOnly === 'true' ? products.map(sanitizePublicProduct) : products;
    return res.json({ success: true, products: sanitized, count: sanitized.length });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', requireDatabaseInProduction, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = isServerRequestAuthenticated(req);
    const found = await serverProductRepository.getProductById(id, !isAdmin);

    if (!found) {
      return res.status(404).json({ success: false, error: 'Product not found or unavailable.' });
    }

    const payload = !isAdmin ? sanitizePublicProduct(found) : found;
    return res.json({ success: true, product: payload });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (Requires Admin Auth)
app.post('/api/products', requireDatabaseInProduction, requireAdminAuth, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || body.price === undefined) {
      return res.status(400).json({ success: false, error: 'Product name and price are required.' });
    }

    const newProduct = await serverProductRepository.createProduct(body);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully in database.',
      product: newProduct,
    });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (Requires Admin Auth)
app.put('/api/products/:id', requireDatabaseInProduction, requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const updated = await serverProductRepository.updateProduct(id, body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully in database.',
      product: updated,
    });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id (Requires Admin Auth)
app.delete('/api/products/:id', requireDatabaseInProduction, requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await serverProductRepository.deleteProduct(id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully from database.',
    });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/stock (Adjust stock atomically in database)
app.post('/api/products/stock', requireDatabaseInProduction, requireAdminAuth, async (req, res) => {
  try {
    const { productId, newStock, changeReason, note, adminAccount } = req.body || {};
    if (!productId || newStock === undefined) {
      return res.status(400).json({ success: false, error: 'productId and newStock are required.' });
    }

    const result = await serverProductRepository.adjustStock(
      productId,
      Number(newStock),
      changeReason || 'Manual Adjustment',
      note,
      adminAccount || 'navin@navinhomeocare.com'
    );

    if (!result) {
      return res.status(404).json({ success: false, error: 'Product not found in database.' });
    }

    return res.json({
      success: true,
      message: 'Stock adjusted atomically in database.',
      product: result.product,
      log: result.log,
    });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/inventory-logs & GET /api/inventory-logs
const handleGetInventoryLogs = async (req: express.Request, res: express.Response) => {
  try {
    const { productId, reason } = req.query;
    const logs = await serverProductRepository.getInventoryLogs({
      productId: typeof productId === 'string' ? productId : undefined,
      reason: typeof reason === 'string' ? reason : undefined,
    });
    return res.json({ success: true, logs, count: logs.length });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.get('/api/products/inventory-logs', requireDatabaseInProduction, requireAdminAuth, handleGetInventoryLogs);
app.get('/api/inventory-logs', requireDatabaseInProduction, requireAdminAuth, handleGetInventoryLogs);

// POST /api/upload (Direct Image Upload via Storage Provider)
app.post('/api/upload', requireAdminAuth, async (req, res) => {
  try {
    const { dataUrl, fileName, base64 } = req.body || {};
    const content = dataUrl || base64;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'No valid image data provided.' });
    }

    const result = await uploadProductImage(content, fileName);

    return res.status(201).json({
      success: true,
      url: result.url,
      key: result.key,
      sizeBytes: result.sizeBytes,
      provider: result.provider,
      message: 'Product image uploaded successfully.',
    });
  } catch (err: any) {
    if (err instanceof StorageConfigurationError || err.name === 'StorageConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message || 'Image upload failed.' });
  }
});

// ==================== VITE MIDDLEWARE / STATIC ASSETS ====================
async function startServer() {
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
