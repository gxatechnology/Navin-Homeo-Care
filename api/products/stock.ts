import type { IncomingMessage, ServerResponse } from 'http';
import { serverProductRepository, DatabaseConfigurationError } from '../../lib/server/productRepository';
import { isServerRequestAuthenticated } from '../../lib/server/auth';

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

  // Strict Production Database Check
  try {
    serverProductRepository.assertDatabaseConfigured();
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
  }

  if (!isServerRequestAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication session token required.',
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { productId, newStock, changeReason, note, adminAccount } = body || {};
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

    return res.status(200).json({
      success: true,
      message: 'Stock adjusted atomically in database.',
      product: result.product,
      log: result.log,
    });
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message || 'Stock adjustment failed.' });
  }
}
