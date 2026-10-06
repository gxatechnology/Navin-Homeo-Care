import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  adminDataService,
  InventoryLogEntry,
  InventoryChangeReason,
} from '../services/adminDataService';
import { adminAuthService } from '../services/adminAuthService';
import {
  ProductItem,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  COMMON_POTENCIES,
  ProductCategory,
  StructuredIngredient,
  isProductExpired,
  isProductExpiringSoon,
  getProductStockStatus,
} from '../config/productsData';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Star,
  X,
  Eye,
  ArrowUpDown,
  RefreshCw,
  FileCheck,
  TrendingUp,
  History,
  Clock,
  Layers,
  Copy,
  Archive,
  ArchiveRestore,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Tag,
  Truck,
  Image as ImageIcon,
  FlaskConical,
  Upload,
} from 'lucide-react';

type ProductFormTab =
  | 'basic'
  | 'images'
  | 'pricing'
  | 'composition'
  | 'descriptions'
  | 'usage'
  | 'inventory'
  | 'shipping_seo';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<
    'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'archived'
  >('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'inactive' | 'shop_visible' | 'shop_hidden'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock_asc' | 'stock_desc' | 'price_asc' | 'price_desc' | 'expiry_soonest'>('name');

  // Add / Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<ProductFormTab>('basic');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [stockAdjustMode, setStockAdjustMode] = useState<'add' | 'deduct' | 'set'>('add');
  const [stockAdjustAmount, setStockAdjustAmount] = useState<number>(10);
  const [stockAdjustReason, setStockAdjustReason] = useState<InventoryChangeReason>('Purchase / New Batch Restock');
  const [stockAdjustNote, setStockAdjustNote] = useState<string>('');

  // Preview Modal
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);

  // Delete & Archive Confirmation
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<{ id: string; name: string } | null>(null);
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);
  const [archiveConfirmProduct, setArchiveConfirmProduct] = useState<{ id: string; name: string; archived: boolean } | null>(null);

  // Inventory History Modal
  const [inventoryHistoryOpen, setInventoryHistoryOpen] = useState(false);
  const [historyReasonFilter, setHistoryReasonFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // Form State
  const initialFormState: Partial<ProductItem> = {
    id: '',
    sku: '',
    slug: '',
    name: '',
    shortName: '',
    brand: 'Navin Homeo Care',
    manufacturer: 'Navin Homeo Care Quality Standards OPD Unit, Lucknow.',
    category: 'General Wellness',
    subcategory: '',
    productType: 'Cream',
    potency: 'N/A',
    packSize: '50 g Tube',
    unit: 'g',
    barcode: '',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    mrp: 300,
    price: 260,
    costPrice: 160,
    discountPercentage: 13,
    taxPercent: 5,
    taxInclusive: true,
    composition: '',
    ingredients: '',
    structuredIngredients: [{ name: '', potency: '', percentage: '', purpose: '' }],
    shortDesc: '',
    fullDesc: '',
    highlights: ['Quality assured homeopathic wellness formulation'],
    indications: '',
    directions: '',
    dosage: '',
    usageInstructions: '',
    precautions: 'For external use or as directed by Dr. Navin Maurya.',
    contraindications: '',
    warnings: '',
    storageInfo: 'Store in a cool, dry place away from direct sunlight.',
    storageInstructions: 'Store below 30°C in a dry place.',
    countryOfOrigin: 'India',
    stockQuantity: 20,
    minimumStock: 5,
    reorderLevel: 10,
    maximumStock: 100,
    stockStatus: 'in_stock',
    batchNumber: `NHC-${new Date().getFullYear()}-A1`,
    manufacturingDate: new Date().toISOString().split('T')[0].substring(0, 7) + '-01',
    expiryDate: new Date(Date.now() + 86400000 * 365 * 2).toISOString().split('T')[0],
    supplier: 'Standard Ayush Laboratories',
    weight: '100 g',
    dimensions: '12 x 4 x 4 cm',
    shippingEligibility: 'Eligible for all-India courier dispatch and clinic pickup.',
    codAllowed: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 10,
    prescriptionRequired: false,
    featured: false,
    showOnShop: true,
    active: true,
    archived: false,
    seoTitle: '',
    metaDescription: '',
    tags: [],
    rating: 4.8,
    reviewsCount: 1,
    details: ['Quality assured homeopathic wellness product'],
    importantInfo: 'Homeopathic formulation. Consult Dr. Navin Maurya for specialized guidance.',
  };

  const [formData, setFormData] = useState<Partial<ProductItem>>(initialFormState);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const session = adminAuthService.getSession();
        const token = session?.token || '';
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            dataUrl: base64Data,
            fileName: file.name,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            const uploadedUrl = data.url;
            setFormData((prev) => {
              const currentImages = prev.images || [];
              const updatedImages = prev.image ? [...currentImages, uploadedUrl] : [uploadedUrl, ...currentImages];
              return {
                ...prev,
                image: prev.image || uploadedUrl,
                images: Array.from(new Set(updatedImages)),
              };
            });
            setIsUploadingImage(false);
            return;
          }
        }
        // Fallback: assign dataUrl directly
        setFormData((prev) => ({
          ...prev,
          image: prev.image || base64Data,
          images: Array.from(new Set([...(prev.images || []), base64Data])),
        }));
      } catch {
        setFormData((prev) => ({
          ...prev,
          image: prev.image || base64Data,
          images: Array.from(new Set([...(prev.images || []), base64Data])),
        }));
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      const prods = await adminDataService.fetchProductsFromApi();
      setProducts(prods);
      const logs = await adminDataService.fetchInventoryLogsFromApi();
      setInventoryLogs(logs);
    } catch {
      setProducts(adminDataService.getProducts());
      setInventoryLogs(adminDataService.getInventoryLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Summary KPIs
  const lowStockThreshold = useMemo(() => {
    return adminDataService.getSettings().lowStockThreshold || 10;
  }, []);

  const totalStock = useMemo(() => {
    return products
      .filter((p) => p.archived !== true)
      .reduce((sum, p) => sum + p.stockQuantity, 0);
  }, [products]);

  const totalValuation = useMemo(() => {
    return products
      .filter((p) => p.archived !== true)
      .reduce((sum, p) => sum + (p.costPrice || p.price) * p.stockQuantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => p.archived !== true && p.stockQuantity <= lowStockThreshold && p.stockQuantity > 0
    ).length;
  }, [products, lowStockThreshold]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.archived !== true && p.stockQuantity === 0).length;
  }, [products]);

  const expiringSoonCount = useMemo(() => {
    return products.filter(
      (p) => p.archived !== true && p.expiryDate && isProductExpiringSoon(p.expiryDate, 90) && !isProductExpired(p.expiryDate)
    ).length;
  }, [products]);

  const expiredCount = useMemo(() => {
    return products.filter((p) => p.archived !== true && isProductExpired(p.expiryDate)).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = prod.name?.toLowerCase().includes(q);
          const skuMatch = prod.sku?.toLowerCase().includes(q);
          const catMatch = prod.category?.toLowerCase().includes(q);
          const mfgMatch = prod.manufacturer?.toLowerCase().includes(q);
          const batchMatch = prod.batchNumber?.toLowerCase().includes(q);
          const ingMatch = prod.ingredients?.toLowerCase().includes(q);
          if (!nameMatch && !skuMatch && !catMatch && !mfgMatch && !batchMatch && !ingMatch) return false;
        }

        // Category
        if (categoryFilter !== 'all' && prod.category !== categoryFilter) {
          return false;
        }

        // Stock & Expiry filter
        if (stockFilter === 'archived') {
          if (prod.archived !== true) return false;
        } else {
          // If not looking specifically for archived, ignore archived products
          if (prod.archived === true) return false;

          if (stockFilter === 'in_stock') {
            if (prod.stockQuantity <= lowStockThreshold) return false;
          } else if (stockFilter === 'low_stock') {
            if (prod.stockQuantity <= 0 || prod.stockQuantity > lowStockThreshold) return false;
          } else if (stockFilter === 'out_of_stock') {
            if (prod.stockQuantity !== 0) return false;
          } else if (stockFilter === 'expiring_soon') {
            if (!isProductExpiringSoon(prod.expiryDate, 90) || isProductExpired(prod.expiryDate)) return false;
          } else if (stockFilter === 'expired') {
            if (!isProductExpired(prod.expiryDate)) return false;
          }
        }

        // Visibility filter
        if (visibilityFilter === 'active' && prod.active === false) return false;
        if (visibilityFilter === 'inactive' && prod.active !== false) return false;
        if (visibilityFilter === 'shop_visible' && prod.showOnShop === false) return false;
        if (visibilityFilter === 'shop_hidden' && prod.showOnShop !== false) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stock_asc') return a.stockQuantity - b.stockQuantity;
        if (sortBy === 'stock_desc') return b.stockQuantity - a.stockQuantity;
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'expiry_soonest') {
          const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : 9999999999999;
          const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : 9999999999999;
          return expA - expB;
        }
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery, categoryFilter, stockFilter, visibilityFilter, sortBy, lowStockThreshold]);

  // Inventory logs for history modal
  const filteredInventoryLogs = useMemo(() => {
    return inventoryLogs.filter((log) => {
      if (historyReasonFilter !== 'all' && log.changeReason !== historyReasonFilter) {
        return false;
      }
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase().trim();
        const nameMatch = log.productName?.toLowerCase().includes(q);
        const reasonMatch = log.changeReason?.toLowerCase().includes(q);
        const noteMatch = log.note?.toLowerCase().includes(q);
        if (!nameMatch && !reasonMatch && !noteMatch) return false;
      }
      return true;
    });
  }, [inventoryLogs, historyReasonFilter, historySearchQuery]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    const newSku = `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...initialFormState,
      id: `prod-${Date.now().toString().slice(-4)}`,
      sku: newSku,
    });
    setActiveFormTab('basic');
    setFormError(null);
    setFormSuccess(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      structuredIngredients:
        prod.structuredIngredients && prod.structuredIngredients.length > 0
          ? prod.structuredIngredients
          : [{ name: prod.ingredients || '', potency: prod.potency || 'Q', percentage: '', purpose: '' }],
      highlights: prod.highlights && prod.highlights.length > 0 ? prod.highlights : ['Standard quality formulation'],
      details: prod.details && prod.details.length > 0 ? prod.details : ['Standard quality wellness product'],
    });
    setActiveFormTab('basic');
    setFormError(null);
    setFormSuccess(null);
    setProductModalOpen(true);
  };

  const handleDuplicate = (prod: ProductItem) => {
    const dup = adminDataService.duplicateProduct(prod.id);
    if (dup) {
      reloadData();
    }
  };

  const handleOpenStockAdjust = (prod: ProductItem) => {
    setStockModalProduct(prod);
    setStockAdjustMode('add');
    setStockAdjustAmount(10);
    setStockAdjustReason('Purchase / New Batch Restock');
    setStockAdjustNote('');
  };

  const handleConfirmStockAdjust = () => {
    if (!stockModalProduct) return;
    let newTotal = stockModalProduct.stockQuantity;
    if (stockAdjustMode === 'add') {
      newTotal += Math.max(0, stockAdjustAmount);
    } else if (stockAdjustMode === 'deduct') {
      newTotal = Math.max(0, newTotal - Math.max(0, stockAdjustAmount));
    } else {
      newTotal = Math.max(0, stockAdjustAmount);
    }

    adminDataService.adjustStock(
      stockModalProduct.id,
      newTotal,
      stockAdjustReason,
      stockAdjustNote || undefined
    );
    setStockModalProduct(null);
    reloadData();
  };

  const handleQuickStepStock = (prod: ProductItem, delta: number) => {
    const newStock = Math.max(0, prod.stockQuantity + delta);
    adminDataService.adjustStock(
      prod.id,
      newStock,
      delta > 0 ? 'Stock Added' : 'Manual Adjustment',
      'Quick step adjust in products table'
    );
    reloadData();
  };

  const handleToggleStatus = (prod: ProductItem, field: 'active' | 'showOnShop' | 'featured') => {
    adminDataService.toggleProductStatus(prod.id, field);
    reloadData();
  };

  const handleOpenDelete = (prod: ProductItem) => {
    setDeleteBlockedReason(null);
    setDeleteConfirmProduct({ id: prod.id, name: prod.name });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmProduct) return;
    const res = adminDataService.deleteProduct(deleteConfirmProduct.id);
    if (res.success) {
      setDeleteConfirmProduct(null);
      reloadData();
    } else {
      setDeleteBlockedReason(res.error || 'Cannot delete product.');
    }
  };

  const handleOpenArchive = (prod: ProductItem) => {
    setArchiveConfirmProduct({
      id: prod.id,
      name: prod.name,
      archived: !prod.archived,
    });
  };

  const handleConfirmArchive = () => {
    if (!archiveConfirmProduct) return;
    adminDataService.archiveProduct(archiveConfirmProduct.id, archiveConfirmProduct.archived);
    setArchiveConfirmProduct(null);
    reloadData();
  };

  const handleGenerateSku = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `NHC-SKU-${random}` }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name?.trim()) {
      setFormError('Please provide a Product Name.');
      setActiveFormTab('basic');
      return;
    }

    if (formData.price === undefined || formData.price < 0) {
      setFormError('Please enter a valid Selling Price.');
      setActiveFormTab('pricing');
      return;
    }

    const mrp = Number(formData.mrp) || Number(formData.price) || 0;
    const price = Number(formData.price) || 0;
    const costPrice = formData.costPrice ? Number(formData.costPrice) : undefined;
    const discountPercentage = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const stockQuantity = Number(formData.stockQuantity) || 0;
    const stockStatus = getProductStockStatus(stockQuantity, lowStockThreshold);

    const slug =
      formData.slug?.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Format structured ingredients and clean empty entries
    const cleanIngredients = (formData.structuredIngredients || []).filter(
      (si) => si.name && si.name.trim() !== ''
    );

    const cleanHighlights = (formData.highlights || []).filter((h) => h && h.trim() !== '');

    const savedProduct: ProductItem = {
      id: editingProduct ? editingProduct.id : formData.id || `prod-${Date.now()}`,
      sku: formData.sku?.trim() || `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      slug,
      name: formData.name.trim(),
      shortName: formData.shortName?.trim() || undefined,
      brand: formData.brand?.trim() || 'Navin Homeo Care',
      manufacturer: formData.manufacturer?.trim() || 'Navin Homeo Care OPD Distribution',
      category: (formData.category as ProductCategory) || 'General Wellness',
      subcategory: formData.subcategory?.trim() || undefined,
      productType: formData.productType || 'Cream',
      potency: formData.potency || 'N/A',
      packSize: formData.packSize?.trim() || 'Standard Pack',
      unit: formData.unit?.trim() || undefined,
      barcode: formData.barcode?.trim() || undefined,
      image:
        formData.image?.trim() ||
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      images:
        formData.images && formData.images.length > 0
          ? formData.images.filter((img) => img.trim() !== '')
          : [formData.image || ''],
      mrp,
      price,
      costPrice,
      discountPercentage,
      taxPercent: formData.taxPercent !== undefined ? Number(formData.taxPercent) : 5,
      taxInclusive: formData.taxInclusive !== undefined ? formData.taxInclusive : true,
      composition: formData.composition?.trim() || undefined,
      ingredients:
        formData.ingredients?.trim() ||
        cleanIngredients.map((i) => `${i.name} ${i.potency || i.percentage || ''}`).join(', ') ||
        'Verified homeopathic ingredients',
      structuredIngredients: cleanIngredients.length > 0 ? cleanIngredients : undefined,
      shortDesc: formData.shortDesc?.trim() || `${formData.name} for daily wellness support.`,
      fullDesc:
        formData.fullDesc?.trim() ||
        `${formData.name} is formulated under strict quality guidelines for health & wellness support.`,
      highlights: cleanHighlights.length > 0 ? cleanHighlights : ['Quality assured homeopathic wellness formulation'],
      indications: formData.indications?.trim() || undefined,
      directions: formData.directions?.trim() || undefined,
      dosage: formData.dosage?.trim() || undefined,
      usageInstructions:
        formData.usageInstructions?.trim() ||
        formData.directions?.trim() ||
        'As directed by Dr. Navin Maurya or printed on product packaging.',
      precautions: formData.precautions?.trim() || undefined,
      contraindications: formData.contraindications?.trim() || undefined,
      warnings: formData.warnings?.trim() || undefined,
      storageInfo: formData.storageInfo?.trim() || 'Store in a cool, dry place away from direct sunlight.',
      storageInstructions: formData.storageInstructions?.trim() || undefined,
      countryOfOrigin: formData.countryOfOrigin?.trim() || 'India',
      stockQuantity,
      minimumStock: Number(formData.minimumStock) || 5,
      reorderLevel: Number(formData.reorderLevel) || lowStockThreshold,
      maximumStock: Number(formData.maximumStock) || 100,
      stockStatus,
      batchNumber: formData.batchNumber?.trim() || undefined,
      manufacturingDate: formData.manufacturingDate?.trim() || undefined,
      expiryDate: formData.expiryDate?.trim() || undefined,
      supplier: formData.supplier?.trim() || undefined,
      weight: formData.weight?.trim() || undefined,
      dimensions: formData.dimensions?.trim() || undefined,
      shippingEligibility: formData.shippingEligibility?.trim() || 'Eligible for all-India courier dispatch.',
      codAllowed: formData.codAllowed !== undefined ? formData.codAllowed : true,
      minOrderQuantity: Number(formData.minOrderQuantity) || 1,
      maxOrderQuantity: Number(formData.maxOrderQuantity) || 10,
      prescriptionRequired: !!formData.prescriptionRequired,
      featured: !!formData.featured,
      showOnShop: formData.showOnShop !== undefined ? formData.showOnShop : true,
      active: formData.active !== undefined ? formData.active : true,
      archived: !!formData.archived,
      seoTitle: formData.seoTitle?.trim() || `${formData.name} | Navin Homeo Care`,
      metaDescription:
        formData.metaDescription?.trim() ||
        `${formData.name} available at Navin Homeo Care, Alambagh, Lucknow.`,
      tags: formData.tags || [],
      rating: formData.rating || 4.8,
      reviewsCount: formData.reviewsCount || 1,
      details: formData.details || ['Quality assured homeopathic formulation'],
      importantInfo:
        formData.importantInfo?.trim() ||
        'Homeopathic medicine. For personalized health consultation, contact Dr. Navin Maurya.',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminDataService.saveOrUpdateProduct(savedProduct);
    setProductModalOpen(false);
    reloadData();
  };

  return (
    <AdminLayout
      activeTab="products"
      pageTitle="Homeopathy Products & Inventory Management"
      pageSubtitle="Full catalog control, batch expiry tracking, verified formulations & stock audit trails"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInventoryHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Stock History Log</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ================= SUMMARY KPIS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Stock</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalStock} units</span>
            <p className="text-[10px] text-slate-400 mt-0.5">Across {products.length} products</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Inventory Value</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              ₹{totalValuation.toLocaleString('en-IN')}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Cost &amp; stock basis</p>
          </div>

          <div
            onClick={() => setStockFilter('low_stock')}
            className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Low Stock</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">{lowStockCount} items</span>
            <p className="text-[10px] text-amber-700 mt-0.5">&le; {lowStockThreshold} units threshold</p>
          </div>

          <div
            onClick={() => setStockFilter('out_of_stock')}
            className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              outOfStockCount > 0 ? 'bg-red-50/70 border-red-200 hover:bg-red-100/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Out of Stock</span>
            <span className="text-xl font-bold text-red-600 mt-0.5 block">{outOfStockCount} items</span>
            <p className="text-[10px] text-red-600 mt-0.5">0 units available</p>
          </div>

          <div
            onClick={() => setStockFilter('expiring_soon')}
            className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              expiringSoonCount > 0 ? 'bg-orange-50/70 border-orange-200 hover:bg-orange-100/60' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Expiring Soon</span>
            <span className="text-xl font-bold text-orange-700 mt-0.5 block">{expiringSoonCount} items</span>
            <p className="text-[10px] text-orange-700 mt-0.5">Within 90 days</p>
          </div>

          <div
            onClick={() => setStockFilter('expired')}
            className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              expiredCount > 0 ? 'bg-rose-50/80 border-rose-300 hover:bg-rose-100' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Expired Batches</span>
            <span className="text-xl font-bold text-rose-700 mt-0.5 block">{expiredCount} items</span>
            <p className="text-[10px] text-rose-700 mt-0.5">Unsafe / Discontinued</p>
          </div>
        </div>

        {/* ================= ALERTS BANNER ================= */}
        {(lowStockCount > 0 || outOfStockCount > 0 || expiringSoonCount > 0 || expiredCount > 0) && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  Catalog Notice: {lowStockCount + outOfStockCount + expiringSoonCount + expiredCount} Action(s) Detected
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  {outOfStockCount > 0 && `${outOfStockCount} out of stock. `}
                  {lowStockCount > 0 && `${lowStockCount} low stock. `}
                  {expiringSoonCount > 0 && `${expiringSoonCount} expiring within 90 days. `}
                  {expiredCount > 0 && `${expiredCount} expired and disabled in store. `}
                </p>
              </div>
            </div>
            <button
              onClick={() => setStockFilter('all')}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ================= CONTROLS & SEARCH ================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by Name, SKU, Batch #, Category, Potency, Ingredients..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Visibility:</span>
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Visibility</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="shop_visible">Show on Public Shop</option>
                  <option value="shop_hidden">Hidden from Shop</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="name">Name (A–Z)</option>
                  <option value="stock_desc">Stock: High to Low</option>
                  <option value="stock_asc">Stock: Low to High</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="expiry_soonest">Expiry: Soonest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Status Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            {(
              [
                { id: 'all', label: 'All Catalog' },
                { id: 'in_stock', label: `In Stock (>${lowStockThreshold})` },
                { id: 'low_stock', label: `Low Stock (${lowStockCount})` },
                { id: 'out_of_stock', label: `Out of Stock (${outOfStockCount})` },
                { id: 'expiring_soon', label: `Expiring Soon (${expiringSoonCount})` },
                { id: 'expired', label: `Expired (${expiredCount})` },
                { id: 'archived', label: 'Archived' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStockFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  stockFilter === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= PRODUCTS TABLE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-3.5">Product &amp; Formulation</th>
                  <th className="py-3.5 px-3">Category &amp; Form</th>
                  <th className="py-3.5 px-3">SKU &amp; Batch</th>
                  <th className="py-3.5 px-3">Selling Price</th>
                  <th className="py-3.5 px-3">Cost &amp; Profit</th>
                  <th className="py-3.5 px-3 text-center">Stock Quantity</th>
                  <th className="py-3.5 px-3">Expiry Date</th>
                  <th className="py-3.5 px-3 text-center">Visibility</th>
                  <th className="py-3.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No products match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const hasCost = prod.costPrice && prod.costPrice > 0;
                    const grossProfit = hasCost ? prod.price - prod.costPrice! : null;
                    const profitMargin =
                      hasCost && prod.price > 0
                        ? (((prod.price - prod.costPrice!) / prod.price) * 100).toFixed(1)
                        : null;

                    const expired = isProductExpired(prod.expiryDate);
                    const expiringSoon = isProductExpiringSoon(prod.expiryDate, 90) && !expired;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product info */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                                }}
                                className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200"
                              />
                              {prod.featured && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                                  ★
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-slate-900 truncate" title={prod.name}>
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span>{prod.packSize}</span>
                                {prod.potency && prod.potency !== 'N/A' && (
                                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 font-semibold rounded">
                                    {prod.potency}
                                  </span>
                                )}
                                {prod.prescriptionRequired && (
                                  <span className="px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-medium">
                                    Rx Note
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Form */}
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800">{prod.category}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{prod.productType || 'Formulation'}</p>
                        </td>

                        {/* SKU & Batch */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          <div>{prod.sku}</div>
                          {prod.batchNumber && (
                            <div className="text-[10px] text-slate-400 mt-0.5">Lot: {prod.batchNumber}</div>
                          )}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">₹{prod.price}</p>
                          {prod.mrp > prod.price && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-slate-400 line-through">₹{prod.mrp}</span>
                              <span className="text-emerald-600 font-semibold">({prod.discountPercentage}% OFF)</span>
                            </div>
                          )}
                        </td>

                        {/* Cost & Margin */}
                        <td className="py-3 px-3">
                          {hasCost ? (
                            <div>
                              <p className="text-slate-600 font-medium">Cost: ₹{prod.costPrice}</p>
                              <p
                                className={`text-[10px] font-semibold mt-0.5 ${
                                  grossProfit !== null && grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                                }`}
                              >
                                Margin: {profitMargin}% (₹{grossProfit})
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Stock Quantity */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickStepStock(prod, -1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer text-xs"
                              title="Deduct 1 unit"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleOpenStockAdjust(prod)}
                              className="px-2 py-0.5 rounded font-bold text-slate-900 hover:bg-slate-100 cursor-pointer min-w-8 text-center"
                              title="Click to adjust stock with audit reason"
                            >
                              {prod.stockQuantity}
                            </button>
                            <button
                              onClick={() => handleQuickStepStock(prod, 1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer text-xs"
                              title="Add 1 unit"
                            >
                              +
                            </button>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                prod.stockStatus === 'in_stock'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.stockStatus === 'low_stock'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {prod.stockStatus.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3 px-3">
                          {prod.expiryDate ? (
                            <div>
                              <p className="text-slate-700 font-medium">{prod.expiryDate}</p>
                              {expired ? (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold text-[9px] uppercase">
                                  Expired
                                </span>
                              ) : expiringSoon ? (
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold text-[9px] uppercase">
                                  Expiring Soon
                                </span>
                              ) : (
                                <span className="inline-block mt-0.5 text-emerald-600 text-[10px] font-medium">
                                  Valid
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No date set</span>
                          )}
                        </td>

                        {/* Visibility toggles */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => handleToggleStatus(prod, 'active')}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${
                                prod.active !== false
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="Toggle Active Status"
                            >
                              {prod.active !== false ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(prod, 'showOnShop')}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${
                                prod.showOnShop !== false
                                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title="Toggle Public Shop Visibility"
                            >
                              {prod.showOnShop !== false ? 'In Shop' : 'Hidden'}
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewProduct(prod)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="Preview Public Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenArchive(prod)}
                            className={`p-1.5 rounded cursor-pointer ${
                              prod.archived
                                ? 'hover:bg-amber-100 text-amber-600'
                                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                            }`}
                            title={prod.archived ? 'Restore from Archive' : 'Archive Product'}
                          >
                            {prod.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleOpenDelete(prod)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= MODAL: ADD / EDIT PRODUCT (TABBED FORM) ================= */}
      {/* ========================================================================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 text-xs flex flex-col max-h-[92vh] space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  {editingProduct ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Homeopathy Product Record'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure official packaging, botanical composition, inventory thresholds &amp; clinical guidelines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step / Tab Navigation Bar */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
              {(
                [
                  { id: 'basic', label: '1. Basic Info', icon: Info },
                  { id: 'images', label: '2. Media', icon: ImageIcon },
                  { id: 'pricing', label: '3. Pricing & Tax', icon: IndianRupee },
                  { id: 'composition', label: '4. Composition', icon: FlaskConical },
                  { id: 'descriptions', label: '5. Descriptions', icon: FileText },
                  { id: 'usage', label: '6. Usage & Safety', icon: ShieldAlert },
                  { id: 'inventory', label: '7. Inventory & Batch', icon: Package },
                  { id: 'shipping_seo', label: '8. Shipping & SEO', icon: Truck },
                ] as const
              ).map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Tabbed Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* ===== TAB 1: BASIC INFO ===== */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Product Official Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Natural Calendula Soothing Skin Cream"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Short Name / Display Title</label>
                      <input
                        type="text"
                        value={formData.shortName || ''}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        placeholder="e.g. Calendula Cream"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        SKU / Item Code *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.sku || ''}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. NHC-SKU-001"
                          className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSku}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-[11px] cursor-pointer"
                        >
                          Auto Generate
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Primary Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as ProductCategory })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
                      >
                        {PRODUCT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subcategory (Optional)</label>
                      <input
                        type="text"
                        value={formData.subcategory || ''}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        placeholder="e.g. Moisturizers & Creams"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Product Formulation / Type</label>
                      <select
                        value={formData.productType || 'Cream'}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-white text-slate-800"
                      >
                        {PRODUCT_TYPES.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Potency / Scale (If Applicable)</label>
                      <select
                        value={formData.potency || 'N/A'}
                        onChange={(e) => setFormData({ ...formData, potency: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-white text-slate-800"
                      >
                        {COMMON_POTENCIES.map((pot) => (
                          <option key={pot} value={pot}>
                            {pot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Pack Size / Net Volume *</label>
                      <input
                        type="text"
                        required
                        value={formData.packSize || ''}
                        onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                        placeholder="e.g. 50 g Tube, 200 ml Bottle, 60 Tablets"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Manufacturer / Ayush Unit *</label>
                      <input
                        type="text"
                        required
                        value={formData.manufacturer || ''}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="e.g. Standard GMP Certified Facility, Lucknow OPD"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Country of Origin</label>
                      <input
                        type="text"
                        value={formData.countryOfOrigin || 'India'}
                        onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Barcode / EAN (Optional)</label>
                      <input
                        type="text"
                        value={formData.barcode || ''}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="e.g. 890123400101"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 2: MEDIA & IMAGES ===== */}
              {activeFormTab === 'images' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3.5">
                      {/* Direct Device Upload Box */}
                      <div className="p-3.5 bg-emerald-50/60 border border-dashed border-emerald-300 rounded-xl">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-semibold text-emerald-900 flex items-center gap-1.5 text-xs">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Upload Image from Device</span>
                          </label>
                          <span className="text-[10px] text-emerald-700 font-medium">Max 5MB (JPG, PNG, WEBP)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2.5">
                          Upload high-resolution clinical bottle or box packaging photograph directly.
                        </p>
                        <div className="flex items-center gap-2">
                          <label className={`flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs transition-colors ${
                            isUploadingImage ? 'opacity-60 pointer-events-none' : ''
                          }`}>
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingImage ? 'Uploading Image...' : 'Choose Image File'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={handleFileUpload}
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                          </label>
                          {uploadError && (
                            <span className="text-[11px] text-red-600 font-medium">{uploadError}</span>
                          )}
                        </div>
                      </div>

                      {/* Primary Image URL input */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Primary Product Image URL *</label>
                        <input
                          type="url"
                          required
                          value={formData.image || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                              ...formData,
                              image: val,
                              images: formData.images && formData.images.length > 0 ? [val, ...formData.images.slice(1)] : [val],
                            });
                          }}
                          placeholder="https://images.unsplash.com/... or /uploads/..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          The main image displayed on product cards, search results, and public shop.
                        </p>
                      </div>

                      {/* Additional gallery URLs */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Additional Gallery Images</label>
                        {(formData.images || []).slice(1).map((imgUrl, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="url"
                              value={imgUrl}
                              onChange={(e) => {
                                const newImages = [...(formData.images || [])];
                                newImages[idx + 1] = e.target.value;
                                setFormData({ ...formData, images: newImages });
                              }}
                              placeholder={`Gallery Image #${idx + 2} URL`}
                              className="flex-1 p-2 rounded-lg border border-slate-300 font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // Set as primary
                                const targetUrl = (formData.images || [])[idx + 1];
                                const remaining = (formData.images || []).filter((_, i) => i !== idx + 1);
                                setFormData({
                                  ...formData,
                                  image: targetUrl,
                                  images: [targetUrl, ...remaining],
                                });
                              }}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-[10px] font-semibold cursor-pointer whitespace-nowrap"
                              title="Make this the Primary product image"
                            >
                              Set Primary
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = (formData.images || []).filter((_, i) => i !== idx + 1);
                                setFormData({ ...formData, images: newImages });
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="Remove image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {(formData.images || []).length < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                images: [...(formData.images || [formData.image || '']), ''],
                              });
                            }}
                            className="mt-1 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Another Gallery Image URL</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Preview Box & Gallery Thumbnails */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-between text-center">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Primary Image Live Preview</span>
                        </span>
                        <div className="w-48 h-48 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs relative">
                          <img
                            src={formData.image || ''}
                            alt="Preview"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-emerald-600/90 text-white rounded text-[9px] font-bold">
                            Primary
                          </span>
                        </div>
                      </div>

                      {/* Gallery Thumbnails List */}
                      {formData.images && formData.images.filter(Boolean).length > 1 && (
                        <div className="w-full mt-3 pt-3 border-t border-slate-200">
                          <p className="text-[10px] font-semibold text-slate-500 mb-1.5 text-left">
                            All Attached Gallery Photos ({formData.images.filter(Boolean).length})
                          </p>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {formData.images.filter(Boolean).map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  // Clicking thumbnail promotes to primary
                                  const remaining = (formData.images || []).filter((u) => u !== img);
                                  setFormData({
                                    ...formData,
                                    image: img,
                                    images: [img, ...remaining],
                                  });
                                }}
                                className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 cursor-pointer transition-all ${
                                  formData.image === img
                                    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 opacity-70 hover:opacity-100'
                                }`}
                                title="Click to set as primary"
                              >
                                <img
                                  src={img}
                                  alt={`Thumb ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 mt-2">
                        Automatic fallback placeholder applied if image fails to load.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 3: PRICING & TAX ===== */}
              {activeFormTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.mrp ?? ''}
                        onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.price ?? ''}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-sm font-bold text-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹, Optional)</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.costPrice ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            costPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Clinic acquisition cost"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tax / GST Rate (%)</label>
                      <select
                        value={formData.taxPercent !== undefined ? formData.taxPercent : 5}
                        onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value={0}>0% (Exempt / Nil)</option>
                        <option value={5}>5% (Standard Medicines / Ayush)</option>
                        <option value={12}>12% (Wellness / Personal Care)</option>
                        <option value={18}>18% (Cosmetics / Toiletries)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.taxInclusive !== false}
                          onChange={(e) => setFormData({ ...formData, taxInclusive: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold text-slate-700">
                          Selling Price is Inclusive of GST / All Taxes
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Calculated Profit Margin Preview Cards */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Discount Percentage</span>
                      <span className="text-base font-bold text-slate-800 mt-0.5 block">
                        {formData.mrp && formData.price && formData.mrp > formData.price
                          ? `${Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}%`
                          : '0%'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Gross Profit Per Unit</span>
                      <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                        {formData.costPrice && formData.price
                          ? `₹${formData.price - formData.costPrice}`
                          : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Gross Margin %</span>
                      <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                        {formData.costPrice && formData.price && formData.price > 0
                          ? `${(((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1)}%`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 4: COMPOSITION & MEDICAL DETAILS ===== */}
              {activeFormTab === 'composition' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Composition Summary (Packaging text)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.composition || ''}
                      onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                      placeholder="e.g. Calendula Officinalis Ext. 10% v/w in purified emollient base (Aqua, Cetostearyl Alcohol, Glycerin)."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Dynamic structured ingredients table */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">Key Botanical &amp; Active Ingredients</h4>
                        <p className="text-[11px] text-slate-500">
                          Structured list of active homeopathic components
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            structuredIngredients: [
                              ...(formData.structuredIngredients || []),
                              { name: '', potency: '', percentage: '', purpose: '' },
                            ],
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Ingredient</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.structuredIngredients || []).map((ing, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Ingredient name (e.g. Arnica Montana)"
                            value={ing.name}
                            onChange={(e) => {
                              const list = [...(formData.structuredIngredients || [])];
                              list[idx] = { ...list[idx], name: e.target.value };
                              setFormData({ ...formData, structuredIngredients: list });
                            }}
                            className="col-span-5 p-2 bg-white rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            placeholder="Potency (e.g. Q / 30CH)"
                            value={ing.potency || ''}
                            onChange={(e) => {
                              const list = [...(formData.structuredIngredients || [])];
                              list[idx] = { ...list[idx], potency: e.target.value };
                              setFormData({ ...formData, structuredIngredients: list });
                            }}
                            className="col-span-3 p-2 bg-white rounded-lg border border-slate-300"
                          />
                          <input
                            type="text"
                            placeholder="% or Ratio (e.g. 10% v/w)"
                            value={ing.percentage || ''}
                            onChange={(e) => {
                              const list = [...(formData.structuredIngredients || [])];
                              list[idx] = { ...list[idx], percentage: e.target.value };
                              setFormData({ ...formData, structuredIngredients: list });
                            }}
                            className="col-span-3 p-2 bg-white rounded-lg border border-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = (formData.structuredIngredients || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, structuredIngredients: list });
                            }}
                            className="col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-lg flex justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Important Medical &amp; Clinical Safety Notice
                    </label>
                    <input
                      type="text"
                      value={formData.importantInfo || ''}
                      onChange={(e) => setFormData({ ...formData, importantInfo: e.target.value })}
                      placeholder="e.g. For external topical application only. If irritation occurs, discontinue use and consult Dr. Navin Maurya."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.prescriptionRequired}
                        onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="font-semibold text-slate-700">
                        Require Consultation Notice for specialized formulation
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* ===== TAB 5: DESCRIPTIONS & HIGHLIGHTS ===== */}
              {activeFormTab === 'descriptions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Short Description (Catalog Summary) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.shortDesc || ''}
                      onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                      placeholder="One to two sentences summarizing the product's primary wellness benefits..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Full Detailed Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.fullDesc || ''}
                      onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                      placeholder="Comprehensive information about the formulation, benefits, and botanical character..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Bullet Highlights */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">Key Feature Highlights</h4>
                        <p className="text-[11px] text-slate-500">Bullet points displayed on product detail page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            highlights: [...(formData.highlights || []), ''],
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(formData.highlights || []).map((hl, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Free from synthetic colors and heavy parabens"
                            value={hl}
                            onChange={(e) => {
                              const list = [...(formData.highlights || [])];
                              list[idx] = e.target.value;
                              setFormData({ ...formData, highlights: list });
                            }}
                            className="flex-1 p-2 bg-white rounded-lg border border-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = (formData.highlights || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, highlights: list });
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 6: USAGE & SAFETY ===== */}
              {activeFormTab === 'usage' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Primary Indications &amp; Wellness Support
                      </label>
                      <input
                        type="text"
                        value={formData.indications || ''}
                        onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                        placeholder="e.g. Skin dryness, joint stiffness, seasonal throat soothing"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Directions for Use / Dosage Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={formData.usageInstructions || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, usageInstructions: e.target.value, directions: e.target.value })
                        }
                        placeholder="e.g. Take 10–15 drops in 1/4 cup of lukewarm water twice daily after meals."
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Precautions</label>
                      <textarea
                        rows={2}
                        value={formData.precautions || ''}
                        onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                        placeholder="e.g. For external topical application only. Avoid contact with eyes."
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Storage Information</label>
                      <textarea
                        rows={2}
                        value={formData.storageInfo || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, storageInfo: e.target.value, storageInstructions: e.target.value })
                        }
                        placeholder="Store in a cool, dry place away from direct heat and sunlight."
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 7: INVENTORY & BATCHES ===== */}
              {activeFormTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Current Stock Quantity *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.stockQuantity ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Reorder / Low Stock Level</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.reorderLevel ?? lowStockThreshold}
                        onChange={(e) =>
                          setFormData({ ...formData, reorderLevel: Number(e.target.value) })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Batch Number / Lot No</label>
                      <input
                        type="text"
                        value={formData.batchNumber || ''}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                        placeholder="e.g. CAL-2026-B1"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Manufacturing Date</label>
                      <input
                        type="date"
                        value={formData.manufacturingDate || ''}
                        onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate || ''}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                      <input
                        type="text"
                        value={formData.supplier || ''}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        placeholder="e.g. Standard Formulations Ltd."
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 8: SHIPPING & SEO ===== */}
              {activeFormTab === 'shipping_seo' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Weight (with packaging)</label>
                      <input
                        type="text"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="e.g. 150 g"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Package Dimensions</label>
                      <input
                        type="text"
                        value={formData.dimensions || ''}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        placeholder="e.g. 14 x 4 x 4 cm"
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Min Order Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.minOrderQuantity || 1}
                        onChange={(e) => setFormData({ ...formData, minOrderQuantity: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Max Order Quantity Per Order</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.maxOrderQuantity || 10}
                        onChange={(e) => setFormData({ ...formData, maxOrderQuantity: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">SEO Meta Title</label>
                      <input
                        type="text"
                        value={formData.seoTitle || ''}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="e.g. Natural Calendula Skin Cream | Navin Homeo Care"
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">SEO Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.metaDescription || ''}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="Short description shown in search engine snippets..."
                        className="w-full p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.active !== false}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold text-slate-700">Active in Catalog</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showOnShop !== false}
                          onChange={(e) => setFormData({ ...formData, showOnShop: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold text-slate-700">Show on Public Shop</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold text-slate-700">Feature Product</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.codAllowed !== false}
                          onChange={(e) => setFormData({ ...formData, codAllowed: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600"
                        />
                        <span className="font-semibold text-slate-700">Allow Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    {editingProduct ? 'Save Product Changes' : 'Create Product Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: DEDICATED STOCK ADJUSTMENT ===================== */}
      {/* ========================================================================= */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Adjust Inventory Stock</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{stockModalProduct.name}</p>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Current Stock</span>
                <span className="text-lg font-bold text-slate-900">{stockModalProduct.stockQuantity} units</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">SKU / Item</span>
                <span className="font-mono text-slate-700 font-bold">{stockModalProduct.sku}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustMode('add')}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                      stockAdjustMode === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    + Add Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustMode('deduct')}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                      stockAdjustMode === 'deduct'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    - Deduct Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustMode('set')}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-colors ${
                      stockAdjustMode === 'set'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    = Set Exact Total
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {stockAdjustMode === 'set' ? 'New Total Stock Count' : 'Units to Adjust'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={stockAdjustAmount}
                  onChange={(e) => setStockAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason *</label>
                <select
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700"
                >
                  <option value="Purchase / New Batch Restock">Purchase / New Batch Restock</option>
                  <option value="Sale / Clinic Dispense">Sale / Clinic Dispense</option>
                  <option value="Inventory Count Correction">Inventory Count Correction</option>
                  <option value="Damaged / Broken">Damaged / Broken</option>
                  <option value="Expired Stock Write-off">Expired Stock Write-off</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Doctor Sample / Demo">Doctor Sample / Demo</option>
                  <option value="Manual Adjustment">Manual Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Note / Reference (Optional)</label>
                <input
                  type="text"
                  value={stockAdjustNote}
                  onChange={(e) => setStockAdjustNote(e.target.value)}
                  placeholder="e.g. Invoice #PO-9912 or Batch Recount"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStockAdjust}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-xs"
              >
                Apply &amp; Log Stock Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: PRODUCT CARD PUBLIC PREVIEW ==================== */}
      {/* ========================================================================= */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                Public Website Card Preview
              </span>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Card Rendering */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={previewProduct.image}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
                {previewProduct.mrp > previewProduct.price && (
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {previewProduct.discountPercentage}% OFF
                  </span>
                )}
                {isProductExpired(previewProduct.expiryDate) && (
                  <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Batch Expired
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{previewProduct.category}</span>
                  <span className="font-semibold text-slate-700">{previewProduct.packSize}</span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {previewProduct.name}
                </h4>

                <p className="text-slate-500 text-[11px] line-clamp-2">{previewProduct.shortDesc}</p>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-bold text-slate-900">₹{previewProduct.price}</span>
                  {previewProduct.mrp > previewProduct.price && (
                    <span className="text-xs text-slate-400 line-through">₹{previewProduct.mrp}</span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-[#001428] text-white font-bold text-center text-xs opacity-90 cursor-not-allowed"
                  >
                    {previewProduct.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Cart (Store View)'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: INVENTORY HISTORY LOG ========================== */}
      {/* ========================================================================= */}
      {inventoryHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 text-xs flex flex-col max-h-[88vh] space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Inventory Stock History &amp; Audit Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete immutable ledger of stock additions, clinical dispenses, corrections, write-offs &amp; returns.
                </p>
              </div>
              <button
                onClick={() => setInventoryHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product or note..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Reason:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Purchase / New Batch Restock', label: 'Restock' },
                  { id: 'Order', label: 'Orders' },
                  { id: 'Inventory Count Correction', label: 'Correction' },
                  { id: 'Expired Stock Write-off', label: 'Expired' },
                  { id: 'Manual Adjustment', label: 'Manual' },
                ].map((rf) => (
                  <button
                    key={rf.id}
                    onClick={() => setHistoryReasonFilter(rf.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                      historyReasonFilter === rf.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3">Stock Flow</th>
                    <th className="py-2.5 px-3">Reason &amp; Note</th>
                    <th className="py-2.5 px-3 text-right">Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No inventory log entries match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{log.productName}</td>
                        <td className="py-2.5 px-3 font-bold">
                          <span
                            className={
                              log.changeAmount > 0
                                ? 'text-emerald-600'
                                : log.changeAmount < 0
                                ? 'text-red-600'
                                : 'text-slate-500'
                            }
                          >
                            {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px] inline-block">
                            {log.changeReason}
                          </span>
                          {log.note && <span className="text-[10px] text-slate-400 block mt-0.5">{log.note}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[10px]">
                          {log.adminAccount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInventoryHistoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: DELETE PRODUCT ================================= */}
      {/* ========================================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Delete Product Record?</h3>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deleteConfirmProduct.name}</strong>?
            </p>

            {deleteBlockedReason && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Cannot Delete (Order History Dependency)</span>
                </p>
                {deleteBlockedReason}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              {deleteBlockedReason ? (
                <button
                  type="button"
                  onClick={() => {
                    adminDataService.archiveProduct(deleteConfirmProduct.id, true);
                    setDeleteConfirmProduct(null);
                    reloadData();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer"
                >
                  Archive Instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Permanent Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ================= MODAL: ARCHIVE PRODUCT =============================== */}
      {/* ========================================================================= */}
      {archiveConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {archiveConfirmProduct.archived ? 'Archive Product?' : 'Restore Product?'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {archiveConfirmProduct.archived
                ? `Archiving "${archiveConfirmProduct.name}" will hide it from active tables and public store while preserving past order audit records.`
                : `Restoring "${archiveConfirmProduct.name}" will return it to active catalog tables.`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArchiveConfirmProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                {archiveConfirmProduct.archived ? 'Confirm Archive' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
