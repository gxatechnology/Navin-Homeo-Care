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

function sanitizePublicProduct(prod: any): any {
  if (!prod) return prod;
  const { costPrice, supplier, ...safeProduct } = prod;
  return safeProduct;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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

  // Strict Production Database Check:
  try {
    serverProductRepository.assertDatabaseConfigured();
  } catch (err: any) {
    if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
      return res.status(503).json({
        success: false,
        error: err.message,
      });
    }
  }

  const isAdmin = isServerRequestAuthenticated(req);

  // Parse Body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const query = req.query || {};

  // GET /api/products
  if (req.method === 'GET') {
    try {
      const { id, category, search, stockStatus, active, archived, publicOnly } = query;

      if (id && typeof id === 'string') {
        const found = await serverProductRepository.getProductById(id, !isAdmin || publicOnly === 'true');
        if (!found) {
          return res.status(404).json({ success: false, error: 'Product not found or unavailable.' });
        }
        const safeFound = !isAdmin ? sanitizePublicProduct(found) : found;
        return res.status(200).json({ success: true, product: safeFound });
      }

      const products = await serverProductRepository.getAllProducts({
        publicOnly: !isAdmin || publicOnly === 'true',
        category: typeof category === 'string' ? category : undefined,
        stockStatus: typeof stockStatus === 'string' ? stockStatus : undefined,
        search: typeof search === 'string' ? search : undefined,
        active: isAdmin && active !== undefined ? active === 'true' : undefined,
        archived: isAdmin && archived !== undefined ? archived === 'true' : undefined,
      });

      const sanitizedList = !isAdmin || publicOnly === 'true' ? products.map(sanitizePublicProduct) : products;
      return res.status(200).json({ success: true, products: sanitizedList, count: sanitizedList.length });
    } catch (err: any) {
      if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
        return res.status(503).json({ success: false, error: err.message });
      }
      return res.status(500).json({ success: false, error: err.message || 'Internal error' });
    }
  }

  // All Write Endpoints require authenticated admin access
  if (!isAdmin) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin authentication session token required.',
    });
  }

  // POST /api/products (Create product)
  if (req.method === 'POST') {
    try {
      if (!body || !body.name || body.price === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Product name and price are required.',
        });
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
      return res.status(500).json({ success: false, error: err.message || 'Database error' });
    }
  }

  // PUT /api/products (Update product)
  if (req.method === 'PUT') {
    try {
      const id = body?.id || (typeof query.id === 'string' ? query.id : null);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product id is required for update.' });
      }

      const updated = await serverProductRepository.updateProduct(id, body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully in database.',
        product: updated,
      });
    } catch (err: any) {
      if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
        return res.status(503).json({ success: false, error: err.message });
      }
      return res.status(500).json({ success: false, error: err.message || 'Database error' });
    }
  }

  // DELETE /api/products (Delete product)
  if (req.method === 'DELETE') {
    try {
      const id = (body && body.id) || (typeof query.id === 'string' ? query.id : null);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Product id is required.' });
      }

      const result = await serverProductRepository.deleteProduct(id);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully from database.',
      });
    } catch (err: any) {
      if (err instanceof DatabaseConfigurationError || err.name === 'DatabaseConfigurationError') {
        return res.status(503).json({ success: false, error: err.message });
      }
      return res.status(500).json({ success: false, error: err.message || 'Database error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
