-- ========================================================================
-- NAVIN HOMEO CARE - ENTERPRISE PRODUCT & INVENTORY DATABASE SCHEMA
-- Compatible with PostgreSQL, Supabase, Neon, AWS Aurora RDS
-- Generated for Production Hardening Pass (2026)
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(128),
    brand VARCHAR(128) DEFAULT 'Navin Homeo Care',
    manufacturer VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    subcategory VARCHAR(64),
    product_type VARCHAR(64) DEFAULT 'Cream',
    potency VARCHAR(32) DEFAULT 'N/A',
    pack_size VARCHAR(64) NOT NULL,
    unit VARCHAR(32),
    barcode VARCHAR(64),
    
    -- Pricing & Taxes
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10, 2),
    discount_percentage INT DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 5.00,
    tax_inclusive BOOLEAN DEFAULT true,
    
    -- Content & Medical Details (strictly admin / packaging verified)
    composition TEXT,
    ingredients TEXT,
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    indications TEXT,
    directions TEXT,
    dosage TEXT,
    usage_instructions TEXT,
    precautions TEXT,
    contraindications TEXT,
    warnings TEXT,
    storage_info TEXT,
    storage_instructions TEXT,
    important_info TEXT,
    
    -- Stock & Thresholds
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT DEFAULT 5,
    reorder_level INT DEFAULT 10,
    maximum_stock INT DEFAULT 100,
    stock_status VARCHAR(32) NOT NULL DEFAULT 'in_stock', -- in_stock | low_stock | out_of_stock
    
    -- Batch Details
    batch_number VARCHAR(64),
    manufacturing_date DATE,
    expiry_date DATE,
    supplier VARCHAR(255),
    
    -- Shipping & Logistics
    weight VARCHAR(64),
    dimensions VARCHAR(64),
    shipping_eligibility VARCHAR(255) DEFAULT 'Eligible for all-India courier dispatch.',
    cod_allowed BOOLEAN DEFAULT true,
    min_order_quantity INT DEFAULT 1,
    max_order_quantity INT DEFAULT 10,
    
    -- Visibility & Flags
    prescription_required BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    show_on_shop BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    archived BOOLEAN DEFAULT false,
    
    -- SEO Metadata
    seo_title VARCHAR(255),
    meta_description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Ratings & Metadata
    rating NUMERIC(3, 2) DEFAULT 4.80,
    reviews_count INT DEFAULT 1,
    details JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    alt_text VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCT INGREDIENTS TABLE (Structured Botanical Composition)
CREATE TABLE IF NOT EXISTS product_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    potency VARCHAR(32),
    percentage VARCHAR(32),
    purpose VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT BATCHES TABLE (Multi-batch tracking)
CREATE TABLE IF NOT EXISTS product_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    batch_number VARCHAR(64) NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    quantity INT NOT NULL DEFAULT 0,
    cost_price NUMERIC(10, 2),
    supplier VARCHAR(255),
    received_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVENTORY AUDIT LOGS TABLE (STRICTLY APPEND-ONLY)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    change_amount INT NOT NULL,
    change_reason VARCHAR(64) NOT NULL,
    note TEXT,
    admin_account VARCHAR(255) NOT NULL DEFAULT 'navin@navinhomeocare.com',
    ip_address VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_active_archived ON products(active, archived, show_on_shop);
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_timestamp ON inventory_logs(timestamp DESC);

-- TRIGGER TO PREVENT INVENTORY LOG MUTATION (APPEND-ONLY ENFORCEMENT)
CREATE OR REPLACE FUNCTION enforce_immutable_inventory_logs()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Inventory audit logs are immutable and cannot be updated or deleted.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_inventory_logs ON inventory_logs;
CREATE TRIGGER trg_immutable_inventory_logs
BEFORE UPDATE OR DELETE ON inventory_logs
FOR EACH ROW EXECUTE FUNCTION enforce_immutable_inventory_logs();
