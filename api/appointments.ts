import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[]>;
  body: any;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
};

export interface InternalAppointmentNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AdminAppointment {
  bookingReference: string;
  fullName: string;
  phone: string;
  email?: string;
  age?: string;
  patientType: 'new' | 'existing';
  preferredDate: string;
  preferredTime: string;
  healthConcern: string;
  symptomsNote?: string;
  timestamp: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  internalNotes: InternalAppointmentNote[];
  rescheduledFrom?: string;
  source?: string;
  appointmentType?: string;
}

// In-memory cache for serverless warm instances
let inMemoryAppointments: AdminAppointment[] | null = null;

const DATA_FILE_PATH = path.resolve(process.cwd(), 'data', 'appointments.json');
const TMP_FILE_PATH = '/tmp/appointments.json';

function getLocalDataPath(): string {
  if (fs.existsSync(DATA_FILE_PATH)) {
    return DATA_FILE_PATH;
  }
  if (fs.existsSync(TMP_FILE_PATH)) {
    return TMP_FILE_PATH;
  }
  return DATA_FILE_PATH;
}

function loadAppointmentsFromFile(): AdminAppointment[] {
  try {
    const filePath = getLocalDataPath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading appointments file:', err);
  }
  return [];
}

function saveAppointmentsToFile(data: AdminAppointment[]): void {
  try {
    // Try writing to data/ first if writable
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    try {
      // In serverless read-only environments, write to /tmp
      fs.writeFileSync(TMP_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist to /tmp:', e);
    }
  }
}

async function getStoredAppointments(): Promise<AdminAppointment[]> {
  if (!inMemoryAppointments || inMemoryAppointments.length === 0) {
    inMemoryAppointments = loadAppointmentsFromFile();
  }
  return inMemoryAppointments;
}

async function persistAppointments(data: AdminAppointment[]): Promise<void> {
  inMemoryAppointments = data;
  saveAppointmentsToFile(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const list = await getStoredAppointments();

    // GET: Retrieve all appointments
    if (req.method === 'GET') {
      const { ref, status } = req.query;
      let result = [...list];

      if (ref && typeof ref === 'string') {
        const found = result.find((a) => a.bookingReference.toLowerCase() === ref.toLowerCase());
        return res.status(200).json({ success: true, appointment: found || null });
      }

      if (status && typeof status === 'string') {
        result = result.filter((a) => a.status === status);
      }

      // Sort newest first
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return res.status(200).json({ success: true, appointments: result, count: result.length });
    }

    // POST: Create a new appointment (from public form or admin panel)
    if (req.method === 'POST') {
      const body = req.body || {};

      if (!body.fullName || !body.phone || !body.preferredDate || !body.preferredTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required appointment fields: fullName, phone, preferredDate, preferredTime.',
        });
      }

      const bookingReference =
        body.bookingReference || `NHC-${Math.floor(100000 + Math.random() * 900000)}`;

      // Check if already exists to prevent duplicate on retry
      const existingIdx = list.findIndex((a) => a.bookingReference === bookingReference);
      if (existingIdx !== -1) {
        return res.status(200).json({
          success: true,
          message: 'Appointment already registered.',
          record: list[existingIdx],
        });
      }

      const newRecord: AdminAppointment = {
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
      await persistAppointments(list);

      return res.status(201).json({
        success: true,
        message: 'Appointment registered successfully.',
        bookingReference,
        record: newRecord,
      });
    }

    // PUT: Update an appointment (status, rescheduling, or notes)
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || {};
      const { bookingReference, status, newDate, newTime, noteText, author } = body;

      if (!bookingReference) {
        return res.status(400).json({ success: false, error: 'bookingReference is required.' });
      }

      const index = list.findIndex((a) => a.bookingReference === bookingReference);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Appointment not found.' });
      }

      const appt = list[index];

      // Update status if provided
      if (status) {
        appt.status = status;
      }

      // Reschedule if provided
      if (newDate && newTime) {
        appt.rescheduledFrom = `${appt.preferredDate} (${appt.preferredTime})`;
        appt.preferredDate = newDate;
        appt.preferredTime = newTime;
        appt.status = 'confirmed';
        appt.internalNotes.push({
          id: 'note_' + Date.now(),
          author: author || 'Admin Desk',
          text: `Rescheduled to ${newDate} (${newTime})`,
          createdAt: new Date().toISOString(),
        });
      }

      // Add note if provided
      if (noteText) {
        appt.internalNotes.push({
          id: 'note_' + Date.now(),
          author: author || 'Admin Desk',
          text: String(noteText).trim(),
          createdAt: new Date().toISOString(),
        });
      }

      list[index] = appt;
      await persistAppointments(list);

      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully.',
        record: appt,
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  } catch (error: any) {
    console.error('API Error in /api/appointments:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Internal Server Error' });
  }
}
