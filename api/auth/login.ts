import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { createAdminSessionToken } from '../../lib/server/auth';

export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[]>;
  body: any;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'navin@navinhomeocare.com').toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'Navin123@$';

function verifyPassword(attempt: string): boolean {
  if (!attempt) return false;
  if (ADMIN_PASSWORD_HASH) {
    const hash = crypto.createHash('sha256').update(attempt).digest('hex');
    return hash === ADMIN_PASSWORD_HASH;
  }
  // Environment or initial password match
  return attempt === INITIAL_ADMIN_PASSWORD;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { email, password } = body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (cleanEmail !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
  }

  if (!verifyPassword(password)) {
    return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
  }

  const token = createAdminSessionToken(cleanEmail);
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000;

  return res.status(200).json({
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
}
