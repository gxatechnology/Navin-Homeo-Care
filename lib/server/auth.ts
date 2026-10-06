import crypto from 'crypto';
import type { IncomingMessage } from 'http';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'navin@navinhomeocare.com').toLowerCase();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'nhc_secure_prod_session_secret_2026';

// Server-side active token store
interface SessionData {
  email: string;
  expiresAt: number;
}

const activeServerSessions = new Map<string, SessionData>();

export function isServerRequestAuthenticated(req: IncomingMessage): boolean {
  const authHeader = req.headers['authorization'];
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  // Check active server sessions
  const session = activeServerSessions.get(token);
  if (session) {
    if (Date.now() <= session.expiresAt) {
      return true;
    }
    activeServerSessions.delete(token);
    return false;
  }

  // Stateless cryptographic token verification (HMAC signature)
  try {
    const parts = token.split('.');
    if (parts.length === 3 && parts[0] === 'nhc') {
      const payloadBase64 = parts[1];
      const signature = parts[2];

      const expectedSignature = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(`nhc.${payloadBase64}`)
        .digest('hex');

      if (signature === expectedSignature) {
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
        if (payload.exp && Date.now() <= payload.exp && payload.email?.toLowerCase() === ADMIN_EMAIL) {
          return true;
        }
      }
    }
  } catch {
    // ignore
  }

  // In development mode only, recognize development tokens
  if (process.env.NODE_ENV !== 'production' && token.startsWith('nhc_tok_')) {
    return true;
  }

  return false;
}

export function createAdminSessionToken(email: string, durationMs: number = 2 * 60 * 60 * 1000): string {
  const exp = Date.now() + durationMs;
  const payload = {
    email: email.toLowerCase(),
    role: 'super_admin',
    exp,
    iat: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`nhc.${payloadBase64}`)
    .digest('hex');

  const token = `nhc.${payloadBase64}.${signature}`;
  activeServerSessions.set(token, { email: email.toLowerCase(), expiresAt: exp });

  return token;
}
