import fs from 'fs';
import path from 'path';
import { ProductItem, PRODUCTS_DATA, getProductStockStatus } from '../../src/config/productsData';
import { InventoryLogEntry } from '../../src/services/adminDataService';
import { getDatabasePool, withTransaction, query } from './db';

export class DatabaseConfigurationError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'DatabaseConfigurationError: Production environment requires a persistent database (PostgreSQL/Supabase). Missing DATABASE_URL in environment configuration. Local JSON, /tmp, or ephemeral storage is strictly forbidden in production.'
    );
    this.name = 'DatabaseConfigurationError';
  }
}

const PRODUCTS_FILE_PATH = path.resolve(process.cwd(), 'data', 'products.json');
const INVENTORY_LOGS_FILE_PATH = path.resolve(process.cwd(), 'data', 'inventory-logs.json');

// In-memory cache for development mode
let inMemoryProductsCache: ProductItem[] | null = null;
let inMemoryLogsCache: InventoryLogEntry[] | null = null;

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.ENV === 'production'
  );
}

export function isDatabaseConfigured(): boolean {
  const pool = getDatabasePool();
  return pool !== null;
}

export function assertDatabaseConfigured(): void {
  if (isProductionEnvironment() && !isDatabaseConfigured()) {
    throw new DatabaseConfigurationError(
      'DatabaseConfigurationError: Production environment requires a persistent database (PostgreSQL/Supabase). Missing DATABASE_URL in production environment variables. Ephemeral/JSON fallback is strictly prohibited in production mode.'
    );
  }
}

// Map PostgreSQL row to TypeScript ProductItem
function mapDbRowToProduct(row: any, images: string[] = [], ingredients: any[] = []): ProductItem {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name || undefined,
    brand: row.brand || 'Navin Homeo Care',
    manufacturer: row.manufacturer,
    category: row.category,
    subcategory: row.subcategory || undefined,
    productType: row.product_type || 'Cream',
    potency: row.potency || 'N/A',
    packSize: row.pack_size,
    unit: row.unit || undefined,
    barcode: row.barcode || undefined,
    image: images[0] || row.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: images.length > 0 ? images : [row.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    mrp: Number(row.mrp) || 0,
    price: Number(row.price) || 0,
    costPrice: row.cost_price ? Number(row.cost_price) : undefined,
    discountPercentage: Number(row.discount_percentage) || 0,
    taxPercent: row.tax_percent ? Number(row.tax_percent) : 5,
    taxInclusive: row.tax_inclusive !== false,
    composition: row.composition || undefined,
    ingredients: row.ingredients || '',
    structuredIngredients: ingredients.length > 0 ? ingredients : undefined,
    shortDesc: row.short_desc || '',
    fullDesc: row.full_desc || '',
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    indications: row.indications || undefined,
    directions: row.directions || undefined,
    dosage: row.dosage || undefined,
    usageInstructions: row.usage_instructions || undefined,
    precautions: row.precautions || undefined,
    contraindications: row.contraindications || undefined,
    warnings: row.warnings || undefined,
    storageInfo: row.storage_info || 'Store in a cool, dry place away from direct sunlight.',
    storageInstructions: row.storage_instructions || undefined,
    importantInfo: row.important_info || 'For clinical guidance, consult Dr. Navin Maurya.',
    countryOfOrigin: row.country_of_origin || 'India',
    stockQuantity: Number(row.stock_quantity) || 0,
    minimumStock: row.minimum_stock ? Number(row.minimum_stock) : 5,
    reorderLevel: row.reorder_level ? Number(row.reorder_level) : 10,
    maximumStock: row.maximum_stock ? Number(row.maximum_stock) : 100,
    stockStatus: row.stock_status || getProductStockStatus(Number(row.stock_quantity)),
    batchNumber: row.batch_number || undefined,
    manufacturingDate: row.manufacturing_date ? new Date(row.manufacturing_date).toISOString().split('T')[0] : undefined,
    expiryDate: row.expiry_date ? new Date(row.expiry_date).toISOString().split('T')[0] : undefined,
    supplier: row.supplier || undefined,
    weight: row.weight || undefined,
    dimensions: row.dimensions || undefined,
    shippingEligibility: row.shipping_eligibility || 'Eligible for all-India courier dispatch.',
    codAllowed: row.cod_allowed !== false,
    minOrderQuantity: row.min_order_quantity ? Number(row.min_order_quantity) : 1,
    maxOrderQuantity: row.max_order_quantity ? Number(row.max_order_quantity) : 10,
    prescriptionRequired: Boolean(row.prescription_required),
    featured: Boolean(row.featured),
    showOnShop: row.show_on_shop !== false,
    active: row.active !== false,
    archived: Boolean(row.archived),
    seoTitle: row.seo_title || undefined,
    metaDescription: row.meta_description || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    rating: Number(row.rating) || 4.8,
    reviewsCount: Number(row.reviews_count) || 1,
    details: Array.isArray(row.details) ? row.details : [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

// Development JSON File Helpers
function readJsonFile<T>(primaryPath: string, defaultData: T[]): T[] {
  try {
    if (fs.existsSync(primaryPath)) {
      const raw = fs.readFileSync(primaryPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error reading file from ${primaryPath}:`, err);
  }
  return defaultData;
}

function writeJsonFile<T>(primaryPath: string, data: T[]): void {
  try {
    const dir = path.dirname(primaryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(primaryPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Could not write to path ${primaryPath}:`, err);
  }
}

export const serverProductRepository = {
  isProductionEnvironment,
  isDatabaseConfigured,
  assertDatabaseConfigured,

  // 1. GET ALL PRODUCTS
  async getAllProducts(options: {
    publicOnly?: boolean;
    category?: string;
    stockStatus?: string;
    search?: string;
    active?: boolean;
    archived?: boolean;
  } = {}): Promise<ProductItem[]> {
    assertDatabaseConfigured();

    if (isDatabaseConfigured()) {
      let sql = `
        SELECT p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('url', pi.image_url, 'order', pi.display_order, 'is_primary', pi.is_primary))
            FILTER (WHERE pi.image_url IS NOT NULL),
            '[]'
          ) as image_records
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (options.publicOnly) {
        sql += ` AND p.archived = false AND p.active = true AND p.show_on_shop = true`;
      } else {
        if (options.archived !== undefined) {
          params.push(options.archived);
          sql += ` AND p.archived = $${params.length}`;
        }
        if (options.active !== undefined) {
          params.push(options.active);
          sql += ` AND p.active = $${params.length}`;
        }
      }

      if (options.category && options.category !== 'all') {
        params.push(options.category);
        sql += ` AND p.category = $${params.length}`;
      }

      if (options.stockStatus && options.stockStatus !== 'all') {
        params.push(options.stockStatus);
        sql += ` AND p.stock_status = $${params.length}`;
      }

      if (options.search && options.search.trim() !== '') {
        params.push(`%${options.search.toLowerCase().trim()}%`);
        sql += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.sku) LIKE $${params.length} OR LOWER(p.category) LIKE $${params.length} OR LOWER(COALESCE(p.ingredients, '')) LIKE $${params.length})`;
      }

      sql += ` GROUP BY p.id ORDER BY p.created_at DESC`;

      const res = await query(sql, params);
      return res.rows.map((row) => {
        const images = Array.isArray(row.image_records)
          ? row.image_records.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)).map((r: any) => r.url)
          : [];
        return mapDbRowToProduct(row, images);
      });
    }

    // Development Fallback
    if (!inMemoryProductsCache || inMemoryProductsCache.length === 0) {
      inMemoryProductsCache = readJsonFile<ProductItem>(PRODUCTS_FILE_PATH, PRODUCTS_DATA);
    }
    let list = [...inMemoryProductsCache];

    if (options.publicOnly) {
      list = list.filter((p) => p.archived !== true && p.active !== false && p.showOnShop !== false);
    }
    if (options.archived !== undefined) {
      list = list.filter((p) => (p.archived === true) === options.archived);
    }
    if (options.active !== undefined) {
      list = list.filter((p) => (p.active !== false) === options.active);
    }
    if (options.category && options.category !== 'all') {
      list = list.filter((p) => p.category === options.category);
    }
    if (options.stockStatus && options.stockStatus !== 'all') {
      list = list.filter((p) => p.stockStatus === options.stockStatus);
    }
    if (options.search && options.search.trim() !== '') {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.ingredients?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  // 2. GET PRODUCT BY ID
  async getProductById(idOrSlug: string, publicOnly = false): Promise<ProductItem | null> {
    assertDatabaseConfigured();

    if (isDatabaseConfigured()) {
      let sql = `
        SELECT p.*,
          COALESCE(
            json_agg(DISTINCT jsonb_build_object('url', pi.image_url, 'order', pi.display_order, 'is_primary', pi.is_primary))
            FILTER (WHERE pi.image_url IS NOT NULL),
            '[]'
          ) as image_records
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE (p.id = $1 OR p.slug = $1)
      `;
      if (publicOnly) {
        sql += ` AND p.archived = false AND p.active = true AND p.show_on_shop = true`;
      }
      sql += ` GROUP BY p.id LIMIT 1`;

      const res = await query(sql, [idOrSlug]);
      if (res.rows.length === 0) return null;

      const row = res.rows[0];
      const images = Array.isArray(row.image_records)
        ? row.image_records.sort((a: any, b: any) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)).map((r: any) => r.url)
        : [];
      return mapDbRowToProduct(row, images);
    }

    const list = await this.getAllProducts({ publicOnly });
    return list.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  // 3. CREATE PRODUCT (ATOMIC TRANSACTION)
  async createProduct(product: ProductItem): Promise<ProductItem> {
    assertDatabaseConfigured();

    const id = product.id || `prod-${Date.now()}`;
    const slug =
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const stock = Math.max(0, Number(product.stockQuantity) || 0);
    const stockStatus = getProductStockStatus(stock);

    if (isDatabaseConfigured()) {
      return withTransaction(async (client) => {
        const insertSql = `
          INSERT INTO products (
            id, sku, slug, name, short_name, brand, manufacturer, category, subcategory,
            product_type, potency, pack_size, unit, barcode, mrp, price, cost_price,
            discount_percentage, tax_percent, tax_inclusive, composition, ingredients,
            short_desc, full_desc, highlights, indications, directions, dosage,
            usage_instructions, precautions, contraindications, warnings, storage_info,
            storage_instructions, important_info, country_of_origin, stock_quantity,
            minimum_stock, reorder_level, maximum_stock, stock_status, batch_number,
            manufacturing_date, expiry_date, supplier, weight, dimensions,
            shipping_eligibility, cod_allowed, min_order_quantity, max_order_quantity,
            prescription_required, featured, show_on_shop, active, archived,
            seo_title, meta_description, tags, rating, reviews_count, details
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
            $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
            $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62
          ) RETURNING *;
        `;

        const values = [
          id, product.sku || `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`, slug,
          product.name, product.shortName || null, product.brand || 'Navin Homeo Care',
          product.manufacturer || 'Navin Homeo Care Lab', product.category, product.subcategory || null,
          product.productType || 'Cream', product.potency || 'N/A', product.packSize || 'Standard',
          product.unit || null, product.barcode || null, product.mrp || product.price, product.price,
          product.costPrice || null, product.discountPercentage || 0, product.taxPercent || 5,
          product.taxInclusive !== false, product.composition || null, product.ingredients || '',
          product.shortDesc || '', product.fullDesc || '', JSON.stringify(product.highlights || []),
          product.indications || null, product.directions || null, product.dosage || null,
          product.usageInstructions || null, product.precautions || null, product.contraindications || null,
          product.warnings || null, product.storageInfo || 'Store in a cool dry place.',
          product.storageInstructions || null, product.importantInfo || '', product.countryOfOrigin || 'India',
          stock, product.minimumStock || 5, product.reorderLevel || 10, product.maximumStock || 100,
          stockStatus, product.batchNumber || null, product.manufacturingDate || null,
          product.expiryDate || null, product.supplier || null, product.weight || null,
          product.dimensions || null, product.shippingEligibility || 'Standard courier dispatch.',
          product.codAllowed !== false, product.minOrderQuantity || 1, product.maxOrderQuantity || 10,
          Boolean(product.prescriptionRequired), Boolean(product.featured), product.showOnShop !== false,
          product.active !== false, Boolean(product.archived), product.seoTitle || null,
          product.metaDescription || null, JSON.stringify(product.tags || []),
          product.rating || 4.8, product.reviewsCount || 1, JSON.stringify(product.details || []),
        ];

        const prodRes = await client.query(insertSql, values);

        // Insert gallery images
        const imagesToInsert = product.images && product.images.length > 0 ? product.images : [product.image];
        for (let i = 0; i < imagesToInsert.length; i++) {
          if (imagesToInsert[i]) {
            await client.query(
              `INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ($1, $2, $3, $4)`,
              [id, imagesToInsert[i], i === 0, i]
            );
          }
        }

        // Insert initial stock audit log if stock > 0
        if (stock > 0) {
          await client.query(
            `INSERT INTO inventory_logs (id, product_id, product_name, previous_stock, new_stock, change_amount, change_reason, note, admin_account)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              id, product.name, 0, stock, stock, 'Initial Stock', 'Created with initial stock', 'navin@navinhomeocare.com',
            ]
          );
        }

        return mapDbRowToProduct(prodRes.rows[0], imagesToInsert);
      });
    }

    // Development fallback
    const list = await this.getAllProducts();
    const newRecord: ProductItem = {
      ...product,
      id,
      slug,
      stockQuantity: stock,
      stockStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    inMemoryProductsCache = list;
    writeJsonFile(PRODUCTS_FILE_PATH, list);
    return newRecord;
  },

  // 4. ATOMIC STOCK ADJUSTMENT (TRANSACTION PROTECTED)
  async adjustStock(
    productId: string,
    newStock: number,
    reason: string,
    note?: string,
    adminAccount = 'navin@navinhomeocare.com'
  ): Promise<{ product: ProductItem; log: InventoryLogEntry } | null> {
    assertDatabaseConfigured();

    const clampedStock = Math.max(0, Number(newStock));
    const stockStatus = getProductStockStatus(clampedStock);

    if (isDatabaseConfigured()) {
      return withTransaction(async (client) => {
        // Lock product row for update to prevent concurrent race condition
        const selRes = await client.query(`SELECT * FROM products WHERE id = $1 FOR UPDATE`, [productId]);
        if (selRes.rows.length === 0) return null;

        const row = selRes.rows[0];
        const prevStock = Number(row.stock_quantity);
        const changeAmount = clampedStock - prevStock;

        // Update product stock atomically
        const updRes = await client.query(
          `UPDATE products SET stock_quantity = $1, stock_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
          [clampedStock, stockStatus, productId]
        );

        // Record immutable inventory audit log
        const logId = `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await client.query(
          `INSERT INTO inventory_logs (id, product_id, product_name, previous_stock, new_stock, change_amount, change_reason, note, admin_account)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [logId, productId, row.name, prevStock, clampedStock, changeAmount, reason, note || '', adminAccount]
        );

        const newLog: InventoryLogEntry = {
          id: logId,
          productId,
          productName: row.name,
          previousStock: prevStock,
          newStock: clampedStock,
          changeAmount,
          changeReason: reason,
          note: note || '',
          timestamp: new Date().toISOString(),
          adminAccount,
        };

        return { product: mapDbRowToProduct(updRes.rows[0]), log: newLog };
      });
    }

    // Development fallback
    const list = await this.getAllProducts();
    const index = list.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const prod = list[index];
    const prevStock = prod.stockQuantity;
    prod.stockQuantity = clampedStock;
    prod.stockStatus = stockStatus;
    prod.updatedAt = new Date().toISOString();

    list[index] = prod;
    inMemoryProductsCache = list;
    writeJsonFile(PRODUCTS_FILE_PATH, list);

    const newLog: InventoryLogEntry = {
      id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      productId: prod.id,
      productName: prod.name,
      previousStock: prevStock,
      newStock: clampedStock,
      changeAmount: clampedStock - prevStock,
      changeReason: reason,
      note: note || '',
      timestamp: new Date().toISOString(),
      adminAccount,
    };

    const logs = await this.getInventoryLogs();
    logs.unshift(newLog);
    inMemoryLogsCache = logs.slice(0, 300);
    writeJsonFile(INVENTORY_LOGS_FILE_PATH, inMemoryLogsCache);

    return { product: prod, log: newLog };
  },

  // 5. UPDATE PRODUCT
  async updateProduct(id: string, patch: Partial<ProductItem>): Promise<ProductItem | null> {
    assertDatabaseConfigured();

    if (isDatabaseConfigured()) {
      return withTransaction(async (client) => {
        const selRes = await client.query(`SELECT * FROM products WHERE id = $1 FOR UPDATE`, [id]);
        if (selRes.rows.length === 0) return null;

        const old = selRes.rows[0];
        const stock = patch.stockQuantity !== undefined ? Math.max(0, Number(patch.stockQuantity)) : Number(old.stock_quantity);
        const stockStatus = patch.stockStatus || getProductStockStatus(stock);

        const updateSql = `
          UPDATE products SET
            name = COALESCE($1, name),
            price = COALESCE($2, price),
            mrp = COALESCE($3, mrp),
            cost_price = $4,
            category = COALESCE($5, category),
            manufacturer = COALESCE($6, manufacturer),
            pack_size = COALESCE($7, pack_size),
            stock_quantity = $8,
            stock_status = $9,
            active = COALESCE($10, active),
            show_on_shop = COALESCE($11, show_on_shop),
            archived = COALESCE($12, archived),
            short_desc = COALESCE($13, short_desc),
            full_desc = COALESCE($14, full_desc),
            updated_at = NOW()
          WHERE id = $15
          RETURNING *;
        `;

        const updRes = await client.query(updateSql, [
          patch.name || null,
          patch.price !== undefined ? patch.price : null,
          patch.mrp !== undefined ? patch.mrp : null,
          patch.costPrice !== undefined ? patch.costPrice : old.cost_price,
          patch.category || null,
          patch.manufacturer || null,
          patch.packSize || null,
          stock,
          stockStatus,
          patch.active !== undefined ? patch.active : null,
          patch.showOnShop !== undefined ? patch.showOnShop : null,
          patch.archived !== undefined ? patch.archived : null,
          patch.shortDesc || null,
          patch.fullDesc || null,
          id,
        ]);

        // If primary image updated
        if (patch.image) {
          await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
          const imgs = patch.images && patch.images.length > 0 ? patch.images : [patch.image];
          for (let i = 0; i < imgs.length; i++) {
            await client.query(
              `INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES ($1, $2, $3, $4)`,
              [id, imgs[i], i === 0, i]
            );
          }
        }

        return mapDbRowToProduct(updRes.rows[0]);
      });
    }

    // Development fallback
    const list = await this.getAllProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const old = list[index];
    const stock = patch.stockQuantity !== undefined ? Number(patch.stockQuantity) : old.stockQuantity;
    const stockStatus = patch.stockStatus || getProductStockStatus(stock);

    const updated: ProductItem = {
      ...old,
      ...patch,
      id: old.id,
      stockQuantity: stock,
      stockStatus,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    inMemoryProductsCache = list;
    writeJsonFile(PRODUCTS_FILE_PATH, list);
    return updated;
  },

  // 6. DELETE PRODUCT
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    assertDatabaseConfigured();

    if (isDatabaseConfigured()) {
      return withTransaction(async (client) => {
        // Check for order constraints
        const orderCheck = await client.query(
          `SELECT COUNT(*) FROM inventory_logs WHERE product_id = $1 AND change_reason = 'Order'`,
          [id]
        );
        if (parseInt(orderCheck.rows[0].count, 10) > 0) {
          return {
            success: false,
            error: 'This product has existing customer order records and cannot be permanently deleted. Archive it instead.',
          };
        }

        await client.query(`DELETE FROM products WHERE id = $1`, [id]);
        return { success: true };
      });
    }

    const list = await this.getAllProducts();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, error: 'Product not found.' };

    list.splice(index, 1);
    inMemoryProductsCache = list;
    writeJsonFile(PRODUCTS_FILE_PATH, list);
    return { success: true };
  },

  // 7. GET INVENTORY LOGS
  async getInventoryLogs(options: { productId?: string; reason?: string } = {}): Promise<InventoryLogEntry[]> {
    assertDatabaseConfigured();

    if (isDatabaseConfigured()) {
      let sql = `SELECT * FROM inventory_logs WHERE 1=1`;
      const params: any[] = [];

      if (options.productId) {
        params.push(options.productId);
        sql += ` AND product_id = $${params.length}`;
      }
      if (options.reason && options.reason !== 'all') {
        params.push(options.reason);
        sql += ` AND change_reason = $${params.length}`;
      }

      sql += ` ORDER BY timestamp DESC LIMIT 300`;
      const res = await query(sql, params);

      return res.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        previousStock: Number(row.previous_stock),
        newStock: Number(row.new_stock),
        changeAmount: Number(row.change_amount),
        changeReason: row.change_reason,
        note: row.note || '',
        timestamp: new Date(row.timestamp).toISOString(),
        adminAccount: row.admin_account,
      }));
    }

    if (!inMemoryLogsCache || inMemoryLogsCache.length === 0) {
      inMemoryLogsCache = readJsonFile<InventoryLogEntry>(INVENTORY_LOGS_FILE_PATH, []);
    }
    let result = [...inMemoryLogsCache];
    if (options.productId) {
      result = result.filter((l) => l.productId === options.productId);
    }
    if (options.reason && options.reason !== 'all') {
      result = result.filter((l) => l.changeReason === options.reason);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
};
