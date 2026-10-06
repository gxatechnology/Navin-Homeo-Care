import type { IncomingMessage, ServerResponse } from 'http';
import { serverProductRepository, DatabaseConfigurationError } from '../lib/server/productRepository';
import { isServerRequestAuthenticated } from '../lib/server/auth';

export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[]>;
  body: any;
};

export type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Strict Production Database Check
  try {
    serverProductRepository.assertDatabaseConfigured();
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
  }

  // Inventory logs are confidential clinic records and require admin authentication
  if (!isServerRequestAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication session token required to view inventory logs.',
    });
  }

  const query = req.query || {};

  if (req.method === 'GET') {
    try {
      const { productId, reason } = query;
      const logs = await serverProductRepository.getInventoryLogs({
        productId: typeof productId === 'string' ? productId : undefined,
        reason: typeof reason === 'string' ? reason : undefined,
      });

      return res.status(200).json({ success: true, logs, count: logs.length });
    } catch (err: any) {
      if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
        return res.status(503).json({ success: false, error: err.message });
      }
      return res.status(500).json({ success: false, error: err.message || 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
