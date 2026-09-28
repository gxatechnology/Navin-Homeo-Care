export type ProductCategory =
  | 'General Wellness'
  | 'Personal Care'
  | 'Hair & Skin Care'
  | 'Digestive Wellness'
  | 'Women’s Wellness'
  | 'Child Wellness'
  | 'Other Products';

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  shortDesc: string;
  fullDesc: string;
  image: string;
  images: string[];
  mrp: number;
  price: number; // Selling Price
  costPrice?: number; // Optional Cost Price for profit margin calculation
  discountPercentage: number;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  sku: string;
  packSize: string;
  manufacturer: string;
  ingredients: string;
  usageInstructions: string;
  storageInfo: string;
  shippingEligibility: string;
  prescriptionRequired: boolean;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  details: string[];
  importantInfo: string;
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

export const getActiveProducts = (): ProductItem[] => {
  if (typeof window === 'undefined') return PRODUCTS_DATA;
  try {
    const raw = localStorage.getItem('navin_homeo_admin_products');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return PRODUCTS_DATA;
};

export const PRODUCTS_DATA: ProductItem[] = [
  {
    id: 'prod-01',
    slug: 'natural-calendula-soothing-cream',
    name: 'Natural Calendula Soothing Skin Cream',
    category: 'Hair & Skin Care',
    shortDesc:
      'Gentle plant-derived Calendula moisturizing cream formulated for dry, weather-chapped, or sensitive skin.',
    fullDesc:
      'A mild daily topical cream prepared with botanical Calendula extracts designed to moisturize and protect delicate skin barriers without harsh artificial perfumes or abrasive additives.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-2e11893c5d64?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 320,
    price: 280,
    discountPercentage: 12,
    stockQuantity: 24,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-001',
    packSize: '50 g Tube',
    manufacturer: 'Standardized Ayurvedic & Herbal Formulations, Certified GMP Facility, Lucknow OPD Distribution.',
    ingredients: 'Calendula Officinalis Extract 10% v/w in purified emollient base (Aqua, Cetostearyl Alcohol, Glycerin).',
    usageInstructions: 'Cleanse skin with lukewarm water. Gently smooth a pea-sized amount onto the affected dry area twice daily or as advised during clinic consultation.',
    storageInfo: 'Store in a cool, dry place away from direct sunlight. Keep tube tightly closed after each use.',
    shippingEligibility: 'Eligible for all-India courier dispatch and local Lucknow pickup.',
    prescriptionRequired: false,
    featured: true,
    rating: 4.8,
    reviewsCount: 18,
    details: [
      'Suitable for daily face and body moisture replenishment',
      'Formulated for sensitive skin prone to seasonal dryness',
      'Non-greasy, fast-absorbing botanical base',
      'Free from parabens, synthetic colors, and heavy fragrance',
    ],
    importantInfo: 'For external topical application only. Do not apply directly to open, bleeding lacerations. If irritation develops, discontinue use and consult a physician.',
  },
  {
    id: 'prod-02',
    slug: 'herbal-scalp-nourishing-oil',
    name: 'Herbal Scalp & Hair Nourishing Oil',
    category: 'Hair & Skin Care',
    shortDesc:
      'Cold-pressed sesame and coconut base enriched with Arnica and Jaborandi extracts to nourish scalp roots.',
    fullDesc:
      'Formulated with trusted botanical herb extracts to soothe an itchy, dry scalp and support healthy hair texture through restorative massage therapy.',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 450,
    price: 390,
    discountPercentage: 13,
    stockQuantity: 18,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-002',
    packSize: '200 ml Bottle',
    manufacturer: 'Herbal Wellness Laboratories (GMP Certified). Packaged for Navin Homeo Care & Research Center.',
    ingredients: 'Arnica Montana extract, Pilocarpus (Jaborandi) extract, Brahmi extract in Cold Pressed Coconut and Sesame Oil base.',
    usageInstructions: 'Massage 5–10 ml gently into scalp using fingertips in circular motions before bedtime or 1 hour prior to washing hair.',
    storageInfo: 'Store below 30°C in a dry place. Protect from direct heat. Natural oils may cloud slightly in winter.',
    shippingEligibility: 'Secure protective leak-proof packaging. Dispatched nationwide.',
    prescriptionRequired: false,
    featured: true,
    rating: 4.9,
    reviewsCount: 24,
    details: [
      'Nourishes dry scalp and helps maintain root hydration',
      'Supports healthy hair shine and smooth texture',
      'Blended with cold-pressed natural base oils',
      'Free from mineral oil, silicones, and synthetic chemical fragrance',
    ],
    importantInfo: 'For external scalp massage use only. Avoid contact with eyes. Keep out of reach of children.',
  },
  {
    id: 'prod-03',
    slug: 'arnica-active-joint-comfort-gel',
    name: 'Arnica Active Joint & Muscle Comfort Gel',
    category: 'Personal Care',
    shortDesc:
      'Fast-absorbing cooling gel formulated with Arnica Montana for tired joints, neck stiffness, and muscle fatigue.',
    fullDesc:
      'Provides soothing topical relief after strenuous exercise, prolonged standing, or seasonal joint stiffness with a non-sticky cooling effect.',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 350,
    price: 299,
    discountPercentage: 15,
    stockQuantity: 6,
    stockStatus: 'low_stock',
    sku: 'NHC-SKU-003',
    packSize: '75 g Tube',
    manufacturer: 'Clinical Care Phytochemicals, Lucknow.',
    ingredients: 'Arnica Montana Extract 10% v/w, Gaultheria (Wintergreen) Oil 2% v/w in water-soluble Carbomer gel base.',
    usageInstructions: 'Apply a thin film over the affected joint or muscular area. Massage lightly until absorbed. Use 2–3 times daily.',
    storageInfo: 'Keep tightly capped in a dry place away from heat. Do not freeze.',
    shippingEligibility: 'Dispatched within 24 hours of order confirmation.',
    prescriptionRequired: false,
    featured: true,
    rating: 4.7,
    reviewsCount: 16,
    details: [
      'Quick absorption without leaving oily residues on clothes',
      'Gentle cooling sensation on overworked muscles and knees',
      'Ideal for active adults, athletes, and elderly family members',
      'Convenient squeeze flip-cap tube for easy targeted application',
    ],
    importantInfo: 'Do not apply on broken skin or near mucous membranes. Wash hands thoroughly after application.',
  },
  {
    id: 'prod-04',
    slug: 'digestive-herbal-soothing-drops',
    name: 'Digestive Herbal Soothing Drops',
    category: 'Digestive Wellness',
    shortDesc:
      'Gentle carminative liquid drops containing ginger, fennel, and mint extracts to support digestive comfort.',
    fullDesc:
      'A traditional herbal supplement blend formulated to soothe occasional bloating, feeling of heaviness after rich meals, and mild digestive discomfort.',
    image:
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 260,
    price: 220,
    discountPercentage: 15,
    stockQuantity: 14,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-004',
    packSize: '30 ml Dropper Bottle',
    manufacturer: 'Good Manufacturing Practice (GMP) Accredited Herbal Facility, Uttar Pradesh.',
    ingredients: 'Zingiber Officinale (Ginger) ext., Foeniculum Vulgare (Fennel) ext., Mentha Piperita (Peppermint) ext. in aqueous vegetable glycerin base.',
    usageInstructions: 'Mix 10–15 drops in half a cup of lukewarm water after meals or when feeling digestive heaviness.',
    storageInfo: 'Store upright in a cool place. Shake well before use. Keep bottle closed tightly.',
    shippingEligibility: 'Carefully packed in leak-proof packaging. Delivered across India.',
    prescriptionRequired: false,
    featured: false,
    rating: 4.9,
    reviewsCount: 21,
    details: [
      'Supports healthy digestion and relieves post-meal heaviness',
      'Mild natural taste from fennel seed and peppermint',
      'No added refined sugars or chemical coloring agents',
      'Accurate glass dropper bottle for customized serving',
    ],
    importantInfo: 'Food supplement. Not intended to replace standard medical therapy for acute gastrointestinal illness.',
  },
  {
    id: 'prod-05',
    slug: 'pure-aloe-vera-hydrating-gel',
    name: 'Pure Aloe Vera & Vitamin E Hydrating Gel',
    category: 'Hair & Skin Care',
    shortDesc:
      'Multi-purpose soothing gel with 98% pure Aloe Vera extract and Vitamin E for sunburn, dry patches, and skin hydration.',
    fullDesc:
      'Lightweight soothing moisture that calms irritated skin, cools heat rash, and restores comfortable hydration without greasiness.',
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 240,
    price: 199,
    discountPercentage: 17,
    stockQuantity: 22,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-005',
    packSize: '150 g Jar',
    manufacturer: 'Pure Botanical Laboratories, Alambagh Pharmacy partner.',
    ingredients: 'Aloe Barbadensis Leaf Juice (98%), Tocopheryl Acetate (Vitamin E), Aqua, Carbomer, Phenoxyethanol.',
    usageInstructions: 'Apply liberally onto clean skin whenever extra hydration or cooling comfort is needed.',
    storageInfo: 'Store in a cool dry place. Can be refrigerated for an enhanced cooling effect.',
    shippingEligibility: 'Standard dispatch within 24 hours.',
    prescriptionRequired: false,
    featured: false,
    rating: 4.8,
    reviewsCount: 15,
    details: [
      'Ultra-clean hydration for all skin types',
      'Cools skin after sun exposure and environmental stress',
      'Non-comedogenic, alcohol-free formula',
      'Can be used on face, hands, and body',
    ],
    importantInfo: 'For external use only. Perform a patch test before first use if prone to botanical allergies.',
  },
  {
    id: 'prod-06',
    slug: 'herbal-tulsi-vasaka-soothing-syrup',
    name: 'Herbal Tulsi & Vasaka Soothing Throat Syrup',
    category: 'General Wellness',
    shortDesc:
      'Traditional soothing syrup with Tulsi (Holy Basil), Vasaka, and pure honey for mild throat tickle and comfort.',
    fullDesc:
      'Supports upper respiratory comfort during winter weather and seasonal shifts with gentle demulcent herbs and natural honey.',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 220,
    price: 185,
    discountPercentage: 16,
    stockQuantity: 15,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-006',
    packSize: '100 ml Bottle',
    manufacturer: 'Ayush Approved Manufacturing Unit, Lucknow, UP.',
    ingredients: 'Ocimum Sanctum (Tulsi) ext. 200mg, Adhatoda Vasica (Vasaka) ext. 200mg, Glycyrrhiza Glabra (Yashtimadhu) 150mg in Honey base.',
    usageInstructions: 'Adults: 1–2 teaspoons with warm water 2–3 times daily. Children (above 5 yrs): 1/2 to 1 teaspoon.',
    storageInfo: 'Store at room temperature. Do not refrigerate. Shake well before opening.',
    shippingEligibility: 'Safe courier packaging across all districts of Uttar Pradesh.',
    prescriptionRequired: false,
    featured: false,
    rating: 4.9,
    reviewsCount: 19,
    details: [
      'Demulcent action coats and eases dry throat scratchiness',
      'Prepared with pure raw forest honey base',
      'Non-drowsy daytime formula',
      'Suitable for adults and children above 5 years',
    ],
    importantInfo: 'Contains natural honey; not recommended for infants under 1 year of age.',
  },
  {
    id: 'prod-07',
    slug: 'gentle-calming-baby-massage-oil',
    name: 'Gentle Calming Baby Herbal Massage Oil',
    category: 'Child Wellness',
    shortDesc:
      'Ultra-mild almond and olive oil blend for daily infant massage, promoting skin softness and relaxed sleep.',
    fullDesc:
      'Specially formulated for delicate skin. Enriched with sweet almond oil, cold-pressed olive oil, and gentle chamomile extract to support healthy skin elasticity.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 380,
    price: 330,
    discountPercentage: 13,
    stockQuantity: 11,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-007',
    packSize: '100 ml Bottle',
    manufacturer: 'CarePharma Herbal Essentials, Lucknow.',
    ingredients: 'Sweet Almond Oil (Prunus Amygdalus), Extra Virgin Olive Oil, Chamomile extract, Vitamin E.',
    usageInstructions: 'Warm a few drops between palms and gently massage over baby’s body before bath or at bedtime.',
    storageInfo: 'Keep away from heat and direct sunlight. Keep cap tightly closed.',
    shippingEligibility: 'Dispatched directly from Navin Homeo Care shop inventory.',
    prescriptionRequired: false,
    featured: false,
    rating: 5.0,
    reviewsCount: 12,
    details: [
      'Hypoallergenic and pediatrician tested',
      'Free from artificial perfumes, parabens, and phthalates',
      'Supports healthy skin barrier hydration',
      'Easy glide texture for soothing daily infant massage',
    ],
    importantInfo: 'For external application only. Discontinue if any redness or sensitivity appears.',
  },
  {
    id: 'prod-08',
    slug: 'wintergreen-eucalyptus-relief-balm',
    name: 'Wintergreen & Eucalyptus Herbal Relief Balm',
    category: 'Personal Care',
    shortDesc:
      'Aromatic topical soothing balm for temporary forehead tension, temple massage, and neck comfort.',
    fullDesc:
      'Combines cooling menthol, camphor, and eucalyptus oils with wintergreen in a natural beeswax base to provide comforting warmth and aromatic relaxation.',
    image:
      'https://images.unsplash.com/photo-1608248597359-2e11893c5d64?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248597359-2e11893c5d64?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 180,
    price: 150,
    discountPercentage: 17,
    stockQuantity: 4,
    stockStatus: 'low_stock',
    sku: 'NHC-SKU-008',
    packSize: '25 g Tin',
    manufacturer: 'AyurMedic Products, Alambagh Pharmacy partner.',
    ingredients: 'Wintergreen Oil 15%, Menthol 8%, Camphor 5%, Eucalyptus Oil 5% in natural beeswax and coconut base.',
    usageInstructions: 'Apply a small dab gently onto forehead, temples, or back of neck. Avoid eyes and broken skin.',
    storageInfo: 'Store in a cool dry place below 25°C. Avoid direct sunlight.',
    shippingEligibility: 'Fast doorstep delivery via India Post and local couriers.',
    prescriptionRequired: false,
    featured: false,
    rating: 4.8,
    reviewsCount: 14,
    details: [
      'Comforting soothing rub for tense temple and forehead areas',
      'Pleasant aromatic herbal aroma',
      'Compact travel-friendly tin',
      '100% vegetarian wax formulation',
    ],
    importantInfo: 'External application only. Do not apply inside nostrils or on children under 3 years.',
  },
  {
    id: 'prod-09',
    slug: 'womens-vitality-botanical-tonic',
    name: 'Women’s Herbal Supportive Health Tonic',
    category: 'Women’s Wellness',
    shortDesc:
      'Traditional Ashoka, Lodhra, and Shatavari herbal health formulation designed to support daily stamina and vitality.',
    fullDesc:
      'A gentle supportive herbal dietary preparation crafted according to classical pharmacopoeial traditions. Prepared to offer general nutritional and tonic support for women.',
    image:
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 360,
    price: 310,
    discountPercentage: 14,
    stockQuantity: 10,
    stockStatus: 'in_stock',
    sku: 'NHC-SKU-009',
    packSize: '200 ml Bottle',
    manufacturer: 'GMP Certified Ayush Unit, Lucknow.',
    ingredients: 'Saraca Asoca ext., Symplocos Racemosa (Lodhra) ext., Asparagus Racemosus (Shatavari) in natural base.',
    usageInstructions: 'Take 10 ml twice daily with equal quantity of water after meals or as advised by your physician.',
    storageInfo: 'Keep in a cool, dry place. Keep cap tightly closed after use.',
    shippingEligibility: 'Eligible for all-India courier shipping.',
    prescriptionRequired: true,
    featured: false,
    rating: 4.9,
    reviewsCount: 9,
    details: [
      'Prepared with classical herbal ingredients',
      'Free from synthetic hormones and habit-forming substances',
      'Gentle supportive nutritional tonic',
      'Packaged in food-grade amber bottle',
    ],
    importantInfo: 'Dietary supplement. Consultation may be required before purchase. Not recommended during pregnancy without prior doctor consultation.',
  },
  {
    id: 'prod-10',
    slug: 'product-placeholder-a',
    name: 'Product A (Safe Placeholder)',
    category: 'Other Products',
    shortDesc:
      'Wellness Product placeholder. Specifications and product details to be added.',
    fullDesc:
      'Safe editable placeholder product. Detailed ingredients, specifications, and packaging information can be updated in admin product management.',
    image:
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    ],
    mrp: 150,
    price: 120,
    discountPercentage: 20,
    stockQuantity: 0,
    stockStatus: 'out_of_stock',
    sku: 'NHC-SKU-010',
    packSize: 'Standard Pack (Details to be added)',
    manufacturer: 'Standard Wellness Formulations, Lucknow.',
    ingredients: 'Details to be added upon official supply verification.',
    usageInstructions: 'As directed by physician or manufacturer packaging.',
    storageInfo: 'Store in a cool dry place.',
    shippingEligibility: 'Standard courier delivery.',
    prescriptionRequired: false,
    featured: false,
    rating: 4.5,
    reviewsCount: 3,
    details: [
      'Safe generic placeholder record',
      'No unverified cure claims',
      'Inventory tracked in local store database',
    ],
    importantInfo: 'Consultation may be required before purchase if specialized formulation.',
  },
];
