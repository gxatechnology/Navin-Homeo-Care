export type ProductCategory =
  | 'General Wellness'
  | 'Personal Care'
  | 'Hair & Skin Care'
  | 'Digestive Wellness'
  | 'Women’s Wellness'
  | 'Child Wellness'
  | 'Other Products';

export type ProductType =
  | 'Dilution'
  | 'Mother Tincture'
  | 'Trituration Tablets'
  | 'Biochemic'
  | 'Drops'
  | 'Syrup'
  | 'Cream'
  | 'Ointment'
  | 'Gel'
  | 'Oil'
  | 'Specialty Combo'
  | 'Other';

export interface StructuredIngredient {
  name: string;
  potency?: string;
  percentage?: string;
  purpose?: string;
}

export interface ProductBatch {
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate?: string;
  quantity?: number;
  costPrice?: number;
  receivedDate?: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortName?: string;
  brand?: string;
  manufacturer: string;
  category: ProductCategory;
  subcategory?: string;
  productType?: string;
  potency?: string;
  packSize: string;
  unit?: string;
  barcode?: string;
  image: string;
  images: string[];
  mrp: number;
  price: number; // Selling Price
  costPrice?: number; // Cost Price for profit margin calculation
  discountPercentage: number;
  taxPercent?: number;
  taxInclusive?: boolean;
  composition?: string;
  ingredients: string;
  structuredIngredients?: StructuredIngredient[];
  shortDesc: string;
  fullDesc: string;
  highlights?: string[];
  indications?: string;
  directions?: string;
  dosage?: string;
  usageInstructions?: string;
  precautions?: string;
  contraindications?: string;
  warnings?: string;
  storageInfo: string;
  storageInstructions?: string;
  countryOfOrigin?: string;
  stockQuantity: number;
  minimumStock?: number;
  reorderLevel?: number;
  maximumStock?: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  batches?: ProductBatch[];
  supplier?: string;
  weight?: string;
  dimensions?: string;
  shippingEligibility: string;
  codAllowed?: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  prescriptionRequired: boolean;
  featured: boolean;
  showOnShop?: boolean;
  active?: boolean;
  archived?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  tags?: string[];
  rating: number;
  reviewsCount: number;
  details: string[];
  importantInfo: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PRODUCT_CATEGORIES: { id: string; label: ProductCategory | 'All Products' }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'General Wellness', label: 'General Wellness' },
  { id: 'Personal Care', label: 'Personal Care' },
  { id: 'Hair & Skin Care', label: 'Hair & Skin Care' },
  { id: 'Digestive Wellness', label: 'Digestive Wellness' },
  { id: 'Women’s Wellness', label: 'Women’s Wellness' },
  { id: 'Child Wellness', label: 'Child Wellness' },
  { id: 'Other Products', label: 'Other Products' },
];

export const PRODUCT_TYPES: { id: string; label: string }[] = [
  { id: 'Cream', label: 'Cream / Topical Emulsion' },
  { id: 'Gel', label: 'Gel / Cooling Gel' },
  { id: 'Ointment', label: 'Ointment / Salve' },
  { id: 'Oil', label: 'Oil / Herbal Massage Oil' },
  { id: 'Drops', label: 'Oral Drops / Concentrated Solution' },
  { id: 'Syrup', label: 'Herbal Syrup / Elixir' },
  { id: 'Dilution', label: 'Homeopathic Dilution' },
  { id: 'Mother Tincture', label: 'Mother Tincture (Q)' },
  { id: 'Trituration Tablets', label: 'Trituration Tablets' },
  { id: 'Biochemic', label: 'Biochemic Tissue Salt' },
  { id: 'Specialty Combo', label: 'Specialty Formulation' },
  { id: 'Other', label: 'Other Form' },
];

export const COMMON_POTENCIES: string[] = [
  'N/A',
  'Q (Mother Tincture)',
  '3X',
  '6X',
  '12X',
  '30X',
  '6CH',
  '30CH',
  '200CH',
  '1M',
  '10M',
  '50M',
  'CM',
  '0/1 (LM)',
  '0/3 (LM)',
  '0/6 (LM)',
];

/**
 * Checks if a product has passed its expiration date.
 */
export function isProductExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  try {
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return false;
    // Set to end of expiry day
    exp.setHours(23, 59, 59, 999);
    return exp.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Checks if a product will expire within a certain number of days (default 90 days).
 */
export function isProductExpiringSoon(expiryDate?: string, daysThreshold = 90): boolean {
  if (!expiryDate) return false;
  try {
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return false;
    const now = Date.now();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    return exp.getTime() >= now && exp.getTime() <= now + thresholdMs;
  } catch {
    return false;
  }
}

/**
 * Determines real-time stock status from quantity and safety threshold.
 */
export function getProductStockStatus(
  quantity: number,
  lowStockThreshold = 10
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: 'prod-01',
    sku: 'NHC-SKU-001',
    slug: 'natural-calendula-soothing-cream',
    name: 'Natural Calendula Soothing Skin Cream',
    shortName: 'Calendula Cream',
    brand: 'Navin Homeo Care',
    manufacturer: 'Standardized Ayurvedic & Herbal Formulations, Certified GMP Facility, Lucknow OPD Distribution.',
    category: 'Hair & Skin Care',
    subcategory: 'Moisturizers & Creams',
    productType: 'Cream',
    packSize: '50 g Tube',
    unit: 'g',
    barcode: '890123400101',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-2e11893c5d64?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 320,
    price: 280,
    costPrice: 170,
    discountPercentage: 12,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Calendula Officinalis Extract 10% v/w in purified emollient base (Aqua, Cetostearyl Alcohol, Glycerin).',
    ingredients: 'Calendula Officinalis Extract 10% v/w in purified emollient base.',
    structuredIngredients: [{ name: 'Calendula Officinalis Ext.', percentage: '10% v/w' }],
    shortDesc: 'Gentle plant-derived Calendula moisturizing cream formulated for dry, weather-chapped, or sensitive skin.',
    fullDesc: 'A mild daily topical cream prepared with botanical Calendula extracts designed to moisturize and protect delicate skin barriers without harsh artificial perfumes or abrasive additives.',
    highlights: [
      'Suitable for daily face and body moisture replenishment',
      'Formulated for sensitive skin prone to seasonal dryness',
      'Non-greasy, fast-absorbing botanical base',
      'Free from parabens, synthetic colors, and heavy fragrance',
    ],
    indications: 'Skin dryness, seasonal chapping, mild skin irritation, and hydration support.',
    directions: 'Cleanse skin with lukewarm water. Gently smooth a pea-sized amount onto the affected dry area twice daily or as advised during clinic consultation.',
    dosage: 'Apply thin layer twice daily.',
    precautions: 'For external topical application only. Do not apply directly to open, bleeding lacerations. If irritation develops, discontinue use.',
    storageInfo: 'Store in a cool, dry place away from direct sunlight. Keep tube tightly closed after each use.',
    storageInstructions: 'Store below 30°C in a dry place.',
    countryOfOrigin: 'India',
    stockQuantity: 24,
    minimumStock: 5,
    reorderLevel: 10,
    maximumStock: 100,
    stockStatus: 'in_stock',
    batchNumber: 'CAL-2026-B1',
    manufacturingDate: '2026-01-15',
    expiryDate: '2028-01-15',
    supplier: 'Standardized Formulations Ltd.',
    weight: '70 g',
    dimensions: '14 x 4 x 3 cm',
    shippingEligibility: 'Eligible for all-India courier dispatch and local Lucknow pickup.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    prescriptionRequired: false,
    featured: true,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Natural Calendula Skin Cream | Navin Homeo Care',
    metaDescription: 'Gentle Calendula soothing cream for dry and sensitive skin. Available at Navin Homeo Care Alambagh Lucknow.',
    tags: ['calendula', 'skin care', 'moisturizer', 'dry skin', 'cream'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.8,
    reviewsCount: 18,
    details: [
      'Suitable for daily face and body moisture replenishment',
      'Formulated for sensitive skin prone to seasonal dryness',
      'Non-greasy, fast-absorbing botanical base',
      'Free from parabens, synthetic colors, and heavy fragrance',
    ],
    importantInfo: 'For external topical application only. Do not apply directly to open, bleeding lacerations.',
  },
  {
    id: 'prod-02',
    sku: 'NHC-SKU-002',
    slug: 'herbal-scalp-nourishing-oil',
    name: 'Herbal Scalp & Hair Nourishing Oil',
    shortName: 'Arnica Hair Oil',
    brand: 'Navin Homeo Care',
    manufacturer: 'Herbal Wellness Laboratories (GMP Certified). Packaged for Navin Homeo Care.',
    category: 'Hair & Skin Care',
    subcategory: 'Hair Care',
    productType: 'Drops',
    packSize: '200 ml Bottle',
    unit: 'ml',
    barcode: '890123400102',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 450,
    price: 390,
    costPrice: 240,
    discountPercentage: 13,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Arnica Montana extract, Pilocarpus (Jaborandi) extract, Brahmi extract in Cold Pressed Coconut and Sesame Oil base.',
    ingredients: 'Arnica Montana extract, Pilocarpus (Jaborandi) extract, Brahmi extract in Sesame/Coconut Oil base.',
    structuredIngredients: [
      { name: 'Arnica Montana', potency: 'Q' },
      { name: 'Pilocarpus Jaborandi', potency: 'Q' },
      { name: 'Bacopa Monnieri (Brahmi)', potency: 'Q' },
    ],
    shortDesc: 'Cold-pressed sesame and coconut base enriched with Arnica and Jaborandi extracts to nourish scalp roots.',
    fullDesc: 'Formulated with trusted botanical herb extracts to soothe an itchy, dry scalp and support healthy hair texture through restorative massage therapy.',
    highlights: [
      'Nourishes dry scalp and helps maintain root hydration',
      'Supports healthy hair shine and smooth texture',
      'Blended with cold-pressed natural base oils',
      'Free from mineral oil, silicones, and synthetic chemical fragrance',
    ],
    indications: 'Scalp dryness, root nourishment, hair texture maintenance, and relaxation.',
    directions: 'Massage 5–10 ml gently into scalp using fingertips in circular motions before bedtime or 1 hour prior to washing hair.',
    dosage: '5–10 ml applied 2–3 times a week.',
    precautions: 'For external scalp massage use only. Avoid contact with eyes. Keep out of reach of children.',
    storageInfo: 'Store below 30°C in a dry place. Protect from direct heat.',
    storageInstructions: 'Protect from direct heat and sunlight.',
    countryOfOrigin: 'India',
    stockQuantity: 18,
    minimumStock: 5,
    reorderLevel: 8,
    maximumStock: 60,
    stockStatus: 'in_stock',
    batchNumber: 'OIL-2026-A4',
    manufacturingDate: '2026-02-10',
    expiryDate: '2028-02-10',
    supplier: 'Herbal Wellness Laboratories',
    weight: '240 g',
    dimensions: '16 x 5 x 5 cm',
    shippingEligibility: 'Secure protective leak-proof packaging. Dispatched nationwide.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 6,
    prescriptionRequired: false,
    featured: true,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Arnica Scalp & Hair Nourishing Oil | Navin Homeo Care',
    metaDescription: 'Herbal scalp and hair oil with Arnica and Jaborandi from Navin Homeo Care Lucknow.',
    tags: ['arnica', 'hair oil', 'jaborandi', 'scalp care', 'hair care'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.9,
    reviewsCount: 24,
    details: [
      'Nourishes dry scalp and helps maintain root hydration',
      'Supports healthy hair shine and smooth texture',
      'Blended with cold-pressed natural base oils',
      'Free from mineral oil, silicones, and synthetic chemical fragrance',
    ],
    importantInfo: 'For external scalp massage use only. Avoid contact with eyes.',
  },
  {
    id: 'prod-03',
    sku: 'NHC-SKU-003',
    slug: 'arnica-active-joint-comfort-gel',
    name: 'Arnica Active Joint & Muscle Comfort Gel',
    shortName: 'Arnica Joint Gel',
    brand: 'Navin Homeo Care',
    manufacturer: 'Clinical Care Phytochemicals, Lucknow.',
    category: 'Personal Care',
    subcategory: 'Joint & Muscle Care',
    productType: 'Ointment',
    packSize: '75 g Tube',
    unit: 'g',
    barcode: '890123400103',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 350,
    price: 299,
    costPrice: 180,
    discountPercentage: 15,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Arnica Montana Extract 10% v/w, Gaultheria (Wintergreen) Oil 2% v/w in water-soluble Carbomer gel base.',
    ingredients: 'Arnica Montana Extract 10% v/w, Gaultheria Oil 2% v/w.',
    structuredIngredients: [
      { name: 'Arnica Montana', potency: 'Q', percentage: '10% v/w' },
      { name: 'Gaultheria Procumbens', percentage: '2% v/w' },
    ],
    shortDesc: 'Fast-absorbing cooling gel formulated with Arnica Montana for tired joints, neck stiffness, and muscle fatigue.',
    fullDesc: 'Provides soothing topical relief after strenuous exercise, prolonged standing, or seasonal joint stiffness with a non-sticky cooling effect.',
    highlights: [
      'Quick absorption without leaving oily residues on clothes',
      'Gentle cooling sensation on overworked muscles and knees',
      'Ideal for active adults, athletes, and elderly family members',
      'Convenient squeeze flip-cap tube for easy targeted application',
    ],
    indications: 'Joint stiffness, muscle fatigue, neck stiffness, and post-activity comfort.',
    directions: 'Apply a thin film over the affected joint or muscular area. Massage lightly until absorbed. Use 2–3 times daily.',
    dosage: 'Apply 2-3 times daily as required.',
    precautions: 'Do not apply on broken skin or near mucous membranes. Wash hands thoroughly after application.',
    storageInfo: 'Keep tightly capped in a dry place away from heat. Do not freeze.',
    storageInstructions: 'Store in a cool dry place.',
    countryOfOrigin: 'India',
    stockQuantity: 6,
    minimumStock: 5,
    reorderLevel: 10,
    maximumStock: 50,
    stockStatus: 'low_stock',
    batchNumber: 'ARN-2026-C2',
    manufacturingDate: '2026-03-01',
    expiryDate: '2028-03-01',
    supplier: 'Clinical Care Phytochemicals',
    weight: '95 g',
    dimensions: '15 x 4 x 3 cm',
    shippingEligibility: 'Dispatched within 24 hours of order confirmation.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 5,
    prescriptionRequired: false,
    featured: true,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Arnica Joint & Muscle Comfort Gel | Navin Homeo Care',
    metaDescription: 'Fast acting Arnica cooling gel for joint and muscle fatigue from Navin Homeo Care Lucknow.',
    tags: ['arnica', 'joint gel', 'muscle comfort', 'pain relief', 'gel'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.7,
    reviewsCount: 16,
    details: [
      'Quick absorption without leaving oily residues on clothes',
      'Gentle cooling sensation on overworked muscles and knees',
      'Ideal for active adults, athletes, and elderly family members',
      'Convenient squeeze flip-cap tube for easy targeted application',
    ],
    importantInfo: 'Do not apply on broken skin or near mucous membranes.',
  },
  {
    id: 'prod-04',
    sku: 'NHC-SKU-004',
    slug: 'digestive-herbal-soothing-drops',
    name: 'Digestive Herbal Soothing Drops',
    shortName: 'Digestive Drops',
    brand: 'Navin Homeo Care',
    manufacturer: 'Navin Homeo Care Quality Standards OPD Unit, Lucknow.',
    category: 'Digestive Wellness',
    subcategory: 'Digestive Care',
    productType: 'Drops',
    packSize: '30 ml Dropper Bottle',
    unit: 'ml',
    barcode: '890123400104',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 260,
    price: 225,
    costPrice: 130,
    discountPercentage: 13,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Carbo Vegetabilis 6X, Lycopodium Clavatum 6X, Zingiber Officinale Q in purified aqueous-alcohol base.',
    ingredients: 'Carbo Veg 6X, Lycopodium 6X, Zingiber Officinale Q.',
    structuredIngredients: [
      { name: 'Carbo Vegetabilis', potency: '6X' },
      { name: 'Lycopodium Clavatum', potency: '6X' },
      { name: 'Zingiber Officinale', potency: 'Q' },
    ],
    shortDesc: 'Supportive herbal digestive oral drops formulated to assist in relieving post-meal heaviness and mild indigestion.',
    fullDesc: 'A traditional gentle formulation designed to support balanced digestive function after heavy, irregular, or oily meals.',
    highlights: [
      'Helps ease post-meal abdominal fullness and mild bloating',
      'Non-habit forming botanical formulation',
      'Convenient calibrated dropper bottle for precise home use',
      'Suitable for adults and elderly family members',
    ],
    indications: 'Post-meal fullness, bloating, occasional indigestion, and gastric comfort.',
    directions: 'Take 10–15 drops in 1/4 cup of lukewarm water 20 minutes after meals, or as advised by your physician.',
    dosage: '10–15 drops twice daily after meals.',
    precautions: 'Do not exceed recommended dosage without clinical guidance. If severe abdominal pain or vomiting persists, seek immediate medical evaluation.',
    storageInfo: 'Store in a cool, dry place. Keep cap securely tightened. Keep away from strong aromatic substances (camphor, menthol).',
    storageInstructions: 'Keep away from strong aromatic items.',
    countryOfOrigin: 'India',
    stockQuantity: 14,
    minimumStock: 4,
    reorderLevel: 8,
    maximumStock: 40,
    stockStatus: 'in_stock',
    batchNumber: 'DIG-2026-D1',
    manufacturingDate: '2026-02-20',
    expiryDate: '2029-02-20',
    supplier: 'Navin Homeo Care OPD Unit',
    weight: '75 g',
    dimensions: '10 x 3.5 x 3.5 cm',
    shippingEligibility: 'Eligible for all-India courier shipping and clinic pickup.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 6,
    prescriptionRequired: false,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Digestive Herbal Soothing Drops | Navin Homeo Care',
    metaDescription: 'Herbal digestive drops for post meal bloating and heaviness from Navin Homeo Care Lucknow.',
    tags: ['digestive drops', 'carbo veg', 'lycopodium', 'bloating', 'acidity'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.6,
    reviewsCount: 11,
    details: [
      'Helps ease post-meal abdominal fullness and mild bloating',
      'Non-habit forming botanical formulation',
      'Convenient calibrated dropper bottle for precise home use',
      'Suitable for adults and elderly family members',
    ],
    importantInfo: 'Dietary/homeopathic support. If severe abdominal pain or vomiting persists, seek immediate medical consultation.',
  },
  {
    id: 'prod-05',
    sku: 'NHC-SKU-005',
    slug: 'pure-aloe-vera-hydrating-gel',
    name: 'Pure Aloe Vera & Vitamin E Hydrating Gel',
    shortName: 'Aloe Vera Gel',
    brand: 'Navin Homeo Care',
    manufacturer: 'Ayush Certified Organic Cosmeceuticals, Lucknow OPD Stock.',
    category: 'Hair & Skin Care',
    subcategory: 'Moisturizers & Creams',
    productType: 'Gel',
    packSize: '150 g Jar',
    unit: 'g',
    barcode: '890123400105',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 290,
    price: 240,
    costPrice: 140,
    discountPercentage: 17,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Pure Aloe Barbadensis Leaf Juice 95% v/w, Tocopheryl Acetate (Vitamin E) 0.5% w/w in gel matrix.',
    ingredients: 'Aloe Barbadensis 95% v/w, Vitamin E 0.5% w/w.',
    structuredIngredients: [
      { name: 'Aloe Barbadensis Leaf Juice', percentage: '95% v/w' },
      { name: 'Tocopheryl Acetate (Vitamin E)', percentage: '0.5% w/w' },
    ],
    shortDesc: 'Cooling, soothing organic Aloe Vera gel enriched with Vitamin E to calm sun-exposed or dry sensitive skin.',
    fullDesc: 'A multi-purpose soothing gel formulated for daily post-sun skin recovery, minor skin redness, and oil-free face hydration.',
    highlights: [
      '95% pure Aloe Barbadensis leaf extract with added Vitamin E',
      'Lightweight, non-sticky cooling texture',
      'Soothes sun-stressed or irritated skin after outdoor exposure',
      'Multi-purpose use for face hydration and scalp cooling',
    ],
    indications: 'Sunburn comfort, dry skin hydration, minor skin irritation, and after-shave soothing.',
    directions: 'Apply liberally to face, neck, arms, or scalp as required. Allow to absorb naturally without washing off.',
    dosage: 'Apply as needed throughout the day.',
    precautions: 'For external topical application only. Perform a small patch test before first use.',
    storageInfo: 'Store in a cool place below 25°C. Keep jar closed tightly to avoid drying out.',
    storageInstructions: 'Store below 25°C.',
    countryOfOrigin: 'India',
    stockQuantity: 22,
    minimumStock: 5,
    reorderLevel: 10,
    maximumStock: 80,
    stockStatus: 'in_stock',
    batchNumber: 'ALO-2026-E1',
    manufacturingDate: '2026-03-01',
    expiryDate: '2028-03-01',
    supplier: 'Ayush Certified Organic Cosmeceuticals',
    weight: '180 g',
    dimensions: '8 x 8 x 6 cm',
    shippingEligibility: 'Available for standard shipping nationwide.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 8,
    prescriptionRequired: false,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Pure Aloe Vera & Vitamin E Gel | Navin Homeo Care',
    metaDescription: 'Pure soothing Aloe Vera hydrating gel with Vitamin E from Navin Homeo Care Lucknow.',
    tags: ['aloe vera', 'vitamin e', 'skin hydration', 'sunburn', 'gel'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.8,
    reviewsCount: 14,
    details: [
      '95% pure Aloe Barbadensis leaf extract with added Vitamin E',
      'Lightweight, non-sticky cooling texture',
      'Soothes sun-stressed or irritated skin after outdoor exposure',
      'Multi-purpose use for face hydration and scalp cooling',
    ],
    importantInfo: 'For external cosmetic and wellness hydration only.',
  },
  {
    id: 'prod-06',
    sku: 'NHC-SKU-006',
    slug: 'tulsi-vasaka-cough-support-syrup',
    name: 'Herbal Tulsi & Vasaka Soothing Throat Syrup',
    shortName: 'Tulsi Cough Syrup',
    brand: 'Navin Homeo Care',
    manufacturer: 'Ayush Standardized Herbal Laboratory, Lucknow.',
    category: 'General Wellness',
    subcategory: 'Respiratory Care',
    productType: 'Syrup',
    packSize: '100 ml Bottle',
    unit: 'ml',
    barcode: '890123400106',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 180,
    price: 155,
    costPrice: 90,
    discountPercentage: 14,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Ocimum Sanctum (Tulsi) ext., Adhatoda Vasica (Vasaka) ext., Glycyrrhiza Glabra (Yashtimadhu) in natural honey-syrup base.',
    ingredients: 'Tulsi ext., Vasaka ext., Yashtimadhu in natural honey syrup base.',
    structuredIngredients: [
      { name: 'Ocimum Sanctum (Tulsi)', potency: 'Q' },
      { name: 'Adhatoda Vasica (Vasaka)', potency: 'Q' },
      { name: 'Glycyrrhiza Glabra (Yashtimadhu)', potency: 'Q' },
    ],
    shortDesc: 'Traditional botanical throat syrup prepared with Holy Basil (Tulsi), Vasaka, and pure honey for throat comfort.',
    fullDesc: 'A non-sedating botanical herbal syrup formulated to soothe raw, irritated throat linings caused by pollution, seasonal changes, or speaking fatigue.',
    highlights: [
      'Formulated with revered respiratory herbs Tulsi and Vasaka',
      'Non-drowsy formulation suitable for daytime use',
      'Pleasant taste naturally sweetened with botanical honey base',
      'Free from codeine, alcohol, and artificial coloring',
    ],
    indications: 'Throat irritation, seasonal throat tickle, vocal strain, and chest congestion comfort.',
    directions: 'Adults: 1–2 teaspoonfuls (5–10 ml) 2–3 times daily with lukewarm water. Children (above 5 years): 1/2–1 teaspoonful under adult supervision.',
    dosage: '5-10 ml 2-3 times daily.',
    precautions: 'If cough persists for more than 7 days with fever or breathing difficulty, consult Dr. Navin or your primary healthcare provider.',
    storageInfo: 'Store in a cool dry place. Shake well before use.',
    storageInstructions: 'Shake well before use. Store below 25°C.',
    countryOfOrigin: 'India',
    stockQuantity: 15,
    minimumStock: 4,
    reorderLevel: 8,
    maximumStock: 50,
    stockStatus: 'in_stock',
    batchNumber: 'TUL-2026-F1',
    manufacturingDate: '2026-02-15',
    expiryDate: '2028-02-15',
    supplier: 'Ayush Standardized Herbal Laboratory',
    weight: '140 g',
    dimensions: '12 x 4.5 x 4.5 cm',
    shippingEligibility: 'Shipped nationwide with leak-resistant protective seal.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 6,
    prescriptionRequired: false,
    featured: true,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Tulsi & Vasaka Soothing Throat Syrup | Navin Homeo Care',
    metaDescription: 'Herbal non-drowsy Tulsi and Vasaka throat syrup from Navin Homeo Care Lucknow.',
    tags: ['tulsi syrup', 'vasaka', 'cough syrup', 'throat soothing', 'honey'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.9,
    reviewsCount: 22,
    details: [
      'Formulated with revered respiratory herbs Tulsi and Vasaka',
      'Non-drowsy formulation suitable for daytime use',
      'Pleasant taste naturally sweetened with botanical honey base',
      'Free from codeine, alcohol, and artificial coloring',
    ],
    importantInfo: 'Herbal wellness formulation. If cough or fever persists, clinical evaluation is advised.',
  },
  {
    id: 'prod-07',
    sku: 'NHC-SKU-007',
    slug: 'baby-calming-herbal-massage-oil',
    name: 'Gentle Calming Baby Herbal Massage Oil',
    shortName: 'Baby Massage Oil',
    brand: 'Navin Homeo Care',
    manufacturer: 'Navin Homeo Care Certified Pediatric Range, Lucknow OPD.',
    category: 'Child Wellness',
    subcategory: 'Baby Care',
    productType: 'Oil',
    packSize: '100 ml Bottle',
    unit: 'ml',
    barcode: '890123400107',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 380,
    price: 330,
    costPrice: 200,
    discountPercentage: 13,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Sweet Almond Oil (Prunus Amygdalus Dulcis), Olive Oil (Olea Europaea), Chamomilla Extract in cold-pressed sesame base.',
    ingredients: 'Sweet Almond Oil, Olive Oil, Chamomilla Extract in cold-pressed Sesame base.',
    structuredIngredients: [
      { name: 'Prunus Amygdalus Dulcis (Almond Oil)', percentage: '40% v/v' },
      { name: 'Olea Europaea (Olive Oil)', percentage: '30% v/v' },
      { name: 'Chamomilla Recutita Ext.', potency: 'Q' },
    ],
    shortDesc: 'Ultra-mild sweet almond and chamomile massage oil specially crafted for delicate infant skin nourishment.',
    fullDesc: 'A light, dermatologically mild botanical blend formulated to hydrate, protect, and support healthy skin tone during daily infant massage rituals.',
    highlights: [
      'Rich in cold-pressed Sweet Almond and Virgin Olive oils',
      'Hypoallergenic botanical formulation for delicate skin',
      'Absorbs gently without heavy greasy residue',
      'Free from mineral oils, phthalates, parabens, and strong fragrances',
    ],
    indications: 'Infant daily skin nourishment, gentle body massage, and dryness prevention.',
    directions: 'Warm a small amount of oil between your palms. Gently massage baby’s limbs, chest, and back with light, upward strokes before bath time.',
    dosage: 'Apply 5-10 ml once daily before bath.',
    precautions: 'For external body massage only. Avoid applying directly near baby’s eyes, nose, or broken skin.',
    storageInfo: 'Store at room temperature away from direct sunlight.',
    storageInstructions: 'Store below 30°C.',
    countryOfOrigin: 'India',
    stockQuantity: 11,
    minimumStock: 3,
    reorderLevel: 6,
    maximumStock: 30,
    stockStatus: 'in_stock',
    batchNumber: 'BAB-2026-G1',
    manufacturingDate: '2026-03-10',
    expiryDate: '2028-03-10',
    supplier: 'Navin Homeo Care Pediatric Range',
    weight: '135 g',
    dimensions: '13 x 4 x 4 cm',
    shippingEligibility: 'Packaged in leak-safe baby-safe bottle. Dispatched nationwide.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 4,
    prescriptionRequired: false,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Gentle Baby Herbal Massage Oil | Navin Homeo Care',
    metaDescription: 'Hypoallergenic almond and chamomile baby massage oil from Navin Homeo Care Lucknow.',
    tags: ['baby oil', 'almond oil', 'chamomile', 'child wellness', 'massage oil'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.9,
    reviewsCount: 15,
    details: [
      'Rich in cold-pressed Sweet Almond and Virgin Olive oils',
      'Hypoallergenic botanical formulation for delicate skin',
      'Absorbs gently without heavy greasy residue',
      'Free from mineral oils, phthalates, parabens, and strong fragrances',
    ],
    importantInfo: 'For external body massage only. Avoid eyes, nostrils, and broken skin.',
  },
  {
    id: 'prod-08',
    sku: 'NHC-SKU-008',
    slug: 'wintergreen-eucalyptus-relief-balm',
    name: 'Wintergreen & Eucalyptus Herbal Relief Balm',
    shortName: 'Relief Balm',
    brand: 'Navin Homeo Care',
    manufacturer: 'Herbal Phyto Labs, Ayush Certified, Lucknow.',
    category: 'Personal Care',
    subcategory: 'Joint & Muscle Care',
    productType: 'Ointment',
    packSize: '30 g Jar',
    unit: 'g',
    barcode: '890123400108',
    image: 'https://images.unsplash.com/photo-1556228722-d0b5d0c64883?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228722-d0b5d0c64883?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 190,
    price: 160,
    costPrice: 95,
    discountPercentage: 16,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Gaultheria Fragrantissima (Wintergreen Oil) 8% w/w, Eucalyptus Globulus Oil 5% w/w, Mentha Piperita (Menthol) 3% w/w in Beeswax-Petrolatum base.',
    ingredients: 'Wintergreen Oil 8%, Eucalyptus Oil 5%, Menthol 3% in Beeswax base.',
    structuredIngredients: [
      { name: 'Gaultheria Fragrantissima Oil', percentage: '8% w/w' },
      { name: 'Eucalyptus Globulus Oil', percentage: '5% w/w' },
      { name: 'Mentha Piperita (Menthol)', percentage: '3% w/w' },
    ],
    shortDesc: 'Aromatic therapeutic balm with wintergreen and eucalyptus for comforting massage on temples, neck, and chest.',
    fullDesc: 'A warming botanical balm designed for comforting application during winter chills, sinus congestion pressure, or forehead heaviness.',
    highlights: [
      'Potent blend of pure essential oils (Wintergreen & Eucalyptus)',
      'Provides a comforting warming sensation to ease head and neck tension',
      'Compact travel-friendly tin for purse or pocket',
      'Crafted in a beeswax base without harsh chemicals',
    ],
    indications: 'Head tension, temple comfort, seasonal nasal stuffiness, and neck heaviness.',
    directions: 'Rub a tiny amount gently on temples, forehead, back of neck, or chest. Inhale deeply.',
    dosage: 'Apply a small pinch 2-3 times daily as needed.',
    precautions: 'Do not apply directly inside nostrils or on broken skin. Avoid eye contact. Not suitable for infants under 2 years.',
    storageInfo: 'Store below 25°C in a dry place. Keep tin lid tightly shut.',
    storageInstructions: 'Store below 25°C.',
    countryOfOrigin: 'India',
    stockQuantity: 4,
    minimumStock: 5,
    reorderLevel: 8,
    maximumStock: 40,
    stockStatus: 'low_stock',
    batchNumber: 'BAL-2026-H1',
    manufacturingDate: '2026-01-20',
    expiryDate: '2028-01-20',
    supplier: 'Herbal Phyto Labs',
    weight: '45 g',
    dimensions: '5 x 5 x 2.5 cm',
    shippingEligibility: 'Available for nationwide shipping.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 8,
    prescriptionRequired: false,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Wintergreen & Eucalyptus Relief Balm | Navin Homeo Care',
    metaDescription: 'Aromatic herbal balm with wintergreen and eucalyptus from Navin Homeo Care Lucknow.',
    tags: ['relief balm', 'wintergreen', 'eucalyptus', 'headache', 'tension'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.7,
    reviewsCount: 13,
    details: [
      'Potent blend of pure essential oils (Wintergreen & Eucalyptus)',
      'Provides a comforting warming sensation to ease head and neck tension',
      'Compact travel-friendly tin for purse or pocket',
      'Crafted in a beeswax base without harsh chemicals',
    ],
    importantInfo: 'Do not apply inside nostrils or around eyes.',
  },
  {
    id: 'prod-09',
    sku: 'NHC-SKU-009',
    slug: 'womens-herbal-supportive-health-tonic',
    name: 'Women’s Herbal Supportive Health Tonic',
    shortName: 'Women’s Health Tonic',
    brand: 'Navin Homeo Care',
    manufacturer: 'GMP Certified Ayush Unit, Lucknow OPD Distribution.',
    category: 'Women’s Wellness',
    subcategory: 'Women Care',
    productType: 'Syrup',
    packSize: '200 ml Bottle',
    unit: 'ml',
    barcode: '890123400109',
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 360,
    price: 310,
    costPrice: 190,
    discountPercentage: 14,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Saraca Asoca (Ashoka) ext. Q, Symplocos Racemosa (Lodhra) ext. Q, Asparagus Racemosus (Shatavari) ext. Q in flavored syrup vehicle.',
    ingredients: 'Saraca Asoca ext., Symplocos Racemosa (Lodhra) ext., Asparagus Racemosus (Shatavari) in natural base.',
    structuredIngredients: [
      { name: 'Saraca Asoca (Ashoka)', potency: 'Q' },
      { name: 'Symplocos Racemosa (Lodhra)', potency: 'Q' },
      { name: 'Asparagus Racemosus (Shatavari)', potency: 'Q' },
    ],
    shortDesc: 'Supportive botanical tonic formulated with classical Ashoka and Shatavari herbs to promote vitality and wellness in women.',
    fullDesc: 'A traditional restorative herbal blend designed to support female vitality, physiological balance, and overall stamina throughout changing seasons.',
    highlights: [
      'Prepared with classical herbal ingredients (Ashoka, Lodhra, Shatavari)',
      'Free from synthetic hormones and habit-forming substances',
      'Gentle supportive nutritional tonic for adult women',
      'Packaged in food-grade amber bottle to preserve botanical potency',
    ],
    indications: 'General female wellness support, vitality, nutritional stamina, and routine balance.',
    directions: 'Take 10 ml (2 teaspoonfuls) twice daily with equal quantity of lukewarm water after meals, or as advised by your physician.',
    dosage: '10 ml twice daily after meals.',
    precautions: 'Dietary/herbal supplement. Consultation is recommended. Not recommended during pregnancy without prior doctor consultation.',
    storageInfo: 'Keep in a cool, dry place. Keep cap tightly closed after use.',
    storageInstructions: 'Store below 25°C.',
    countryOfOrigin: 'India',
    stockQuantity: 10,
    minimumStock: 3,
    reorderLevel: 6,
    maximumStock: 35,
    stockStatus: 'in_stock',
    batchNumber: 'WOM-2026-I1',
    manufacturingDate: '2026-02-01',
    expiryDate: '2028-02-01',
    supplier: 'GMP Certified Ayush Unit',
    weight: '260 g',
    dimensions: '16 x 5 x 5 cm',
    shippingEligibility: 'Eligible for all-India courier shipping.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 4,
    prescriptionRequired: true,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Women’s Herbal Health Tonic | Navin Homeo Care',
    metaDescription: 'Traditional Ashoka and Shatavari wellness tonic for women from Navin Homeo Care Lucknow.',
    tags: ['womens health', 'ashoka', 'shatavari', 'lodhra', 'vitality tonic'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.9,
    reviewsCount: 9,
    details: [
      'Prepared with classical herbal ingredients (Ashoka, Lodhra, Shatavari)',
      'Free from synthetic hormones and habit-forming substances',
      'Gentle supportive nutritional tonic for adult women',
      'Packaged in food-grade amber bottle to preserve botanical potency',
    ],
    importantInfo: 'Dietary supplement. Consultation may be required before purchase. Not recommended during pregnancy without prior doctor consultation.',
  },
  {
    id: 'prod-10',
    sku: 'NHC-SKU-010',
    slug: 'berberis-aquifolium-complexion-drops',
    name: 'Berberis Aquifolium Clear Complexion Drops',
    shortName: 'Berberis Drops',
    brand: 'Navin Homeo Care',
    manufacturer: 'Standard Wellness Formulations, Lucknow OPD Distribution.',
    category: 'Hair & Skin Care',
    subcategory: 'Complexion & Acne Care',
    productType: 'Mother Tincture',
    potency: 'Q',
    packSize: '30 ml Dropper Bottle',
    unit: 'ml',
    barcode: '890123400110',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 270,
    price: 230,
    costPrice: 135,
    discountPercentage: 15,
    taxPercent: 5,
    taxInclusive: true,
    composition: 'Berberis Aquifolium Mother Tincture Q (HPI) in 60% v/v extra neutral alcohol base.',
    ingredients: 'Berberis Aquifolium Q in purified dispensing base.',
    structuredIngredients: [{ name: 'Berberis Aquifolium', potency: 'Q' }],
    shortDesc: 'Authentic Berberis Aquifolium botanical drops known in traditional homeopathic literature for complexion clarity support.',
    fullDesc: 'A classical homeopathic botanical solution utilized to support healthy facial skin, natural skin barrier clarity, and reduce tendency for superficial blemishes.',
    highlights: [
      'Authentic Berberis Aquifolium Mother Tincture (Q)',
      'Prepared according to Homoeopathic Pharmacopoeia of India (HPI) standards',
      'Supports natural skin radiance and clarity',
      'Calibrated glass dropper for accurate dispensing',
    ],
    indications: 'Skin blemish support, complexion clarity, mild acneic skin balance.',
    directions: 'Take 10–15 drops in 1/4 cup of fresh water twice daily after food, or as directed by Dr. Navin.',
    dosage: '10–15 drops twice daily.',
    precautions: 'Contains alcohol. Keep away from direct sunlight and heat. If irritation occurs, consult physician.',
    storageInfo: 'Store in a cool dry place away from direct sunlight.',
    storageInstructions: 'Store in a cool, dark place.',
    countryOfOrigin: 'India',
    stockQuantity: 16,
    minimumStock: 4,
    reorderLevel: 8,
    maximumStock: 45,
    stockStatus: 'in_stock',
    batchNumber: 'BER-2026-J1',
    manufacturingDate: '2026-03-01',
    expiryDate: '2029-03-01',
    supplier: 'Standard Wellness Formulations',
    weight: '75 g',
    dimensions: '10 x 3.5 x 3.5 cm',
    shippingEligibility: 'Shipped with tamper-evident seal across India.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 6,
    prescriptionRequired: false,
    featured: true,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: 'Berberis Aquifolium Complexion Drops | Navin Homeo Care',
    metaDescription: 'Berberis Aquifolium Mother Tincture Q for complexion support from Navin Homeo Care Lucknow.',
    tags: ['berberis aquifolium', 'mother tincture', 'skin complexion', 'acne care', 'drops'],
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z',
    rating: 4.9,
    reviewsCount: 20,
    details: [
      'Authentic Berberis Aquifolium Mother Tincture (Q)',
      'Prepared according to Homoeopathic Pharmacopoeia of India (HPI) standards',
      'Supports natural skin radiance and clarity',
      'Calibrated glass dropper for accurate dispensing',
    ],
    importantInfo: 'Homeopathic medicine. For specific conditions, please consult Dr. Navin Maurya.',
  },
];

/**
 * Returns active, unarchived, and published products for the public shop.
 */
export const getActiveProducts = (): ProductItem[] => {
  let list = PRODUCTS_DATA;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('navin_homeo_admin_products');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {
      // fallback to initial PRODUCTS_DATA
    }
  }

  // Filter out inactive, archived, or hidden products
  return list.filter((p) => {
    if (p.archived === true) return false;
    if (p.active === false) return false;
    if (p.showOnShop === false) return false;
    return true;
  });
};
