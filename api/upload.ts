import type { IncomingMessage, ServerResponse } from 'http';
import { uploadProductImage, StorageConfigurationError } from '../lib/server/storage';
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

  if (!isServerRequestAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication session token required to upload images.',
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

    const { dataUrl, fileName, base64 } = body || {};
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
}
