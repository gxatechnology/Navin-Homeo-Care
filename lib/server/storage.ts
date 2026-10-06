import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StorageUploadResult {
  url: string;
  key: string;
  sizeBytes: number;
  mimeType: string;
  provider: 'cloudinary' | 'supabase' | 's3' | 'local_dev';
}

export class StorageConfigurationError extends Error {
  constructor(message?: string) {
    super(
      message ||
        'StorageConfigurationError: Production environment requires persistent object storage (Cloudinary, Supabase Storage, or AWS S3/R2). Ephemeral local filesystem uploads are prohibited in production.'
    );
    this.name = 'StorageConfigurationError';
  }
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.ENV === 'production'
  );
}

export function getStorageProvider(): 'cloudinary' | 'supabase' | 's3' | 'local_dev' | 'none' {
  if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
    return 'cloudinary';
  }
  if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
    return 'supabase';
  }
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
    return 's3';
  }
  if (!isProductionEnvironment()) {
    return 'local_dev';
  }
  return 'none';
}

export async function uploadProductImage(
  content: string, // Base64 or DataURL
  originalFileName?: string
): Promise<StorageUploadResult> {
  if (!content || typeof content !== 'string') {
    throw new Error('No image payload provided.');
  }

  // Parse MIME type & buffer
  const matches = content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer: Buffer;
  let mimeType = 'image/jpeg';

  if (matches && matches.length === 3) {
    mimeType = matches[1].toLowerCase();
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(content, 'base64');
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}. Allowed formats: JPG, PNG, WEBP, GIF.`);
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image exceeds 5MB size limit.');
  }

  const ext = mimeType.split('/')[1] || 'jpg';
  const cleanName = (originalFileName ? path.basename(originalFileName, path.extname(originalFileName)) : 'prod')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);

  const uniqueKey = `products/${cleanName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const provider = getStorageProvider();

  // 1. Cloudinary Integration
  if (provider === 'cloudinary') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || (process.env.CLOUDINARY_URL ? process.env.CLOUDINARY_URL.split('@')[1] : '');
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureStr = `folder=nhc_products&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const formData = new URLSearchParams();
      formData.append('file', `data:${mimeType};base64,${buffer.toString('base64')}`);
      formData.append('timestamp', String(timestamp));
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      formData.append('folder', 'nhc_products');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudinary upload failed: ${errText}`);
      }

      const data: any = await res.json();
      return {
        url: data.secure_url || data.url,
        key: data.public_id,
        sizeBytes: buffer.length,
        mimeType,
        provider: 'cloudinary',
      };
    }
  }

  // 2. Supabase Storage Integration
  if (provider === 'supabase') {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    const bucket = process.env.STORAGE_BUCKET || 'products';

    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${uniqueKey}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        'Content-Type': mimeType,
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase storage upload failed: ${errText}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniqueKey}`;
    return {
      url: publicUrl,
      key: uniqueKey,
      sizeBytes: buffer.length,
      mimeType,
      provider: 'supabase',
    };
  }

  // 3. Local Development Filesystem Storage (ONLY in development)
  if (provider === 'local_dev') {
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = path.basename(uniqueKey);
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    return {
      url: `/uploads/${filename}`,
      key: filename,
      sizeBytes: buffer.length,
      mimeType,
      provider: 'local_dev',
    };
  }

  // 4. Production without configured storage
  throw new StorageConfigurationError(
    'StorageConfigurationError: Direct image upload is disabled in production because persistent storage credentials (CLOUDINARY_URL or SUPABASE_URL + STORAGE_BUCKET) are not configured. Please configure an object storage provider in environment settings or paste image URLs directly.'
  );
}
