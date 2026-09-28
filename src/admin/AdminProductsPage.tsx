import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, InventoryLogEntry, InventoryChangeReason } from '../services/adminDataService';
import { ProductItem, PRODUCT_CATEGORIES, ProductCategory } from '../config/productsData';
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
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Modal State for Add / Edit
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<{ id: string; name: string } | null>(null);

  // Inventory History Modal State
  const [inventoryHistoryOpen, setInventoryHistoryOpen] = useState(false);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogEntry[]>([]);
  const [historyReasonFilter, setHistoryReasonFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    name: '',
    slug: '',
    category: 'General Wellness',
    shortDesc: '',
    fullDesc: '',
    image: '',
    mrp: 300,
    price: 250,
    costPrice: undefined,
    discountPercentage: 16,
    stockQuantity: 20,
    sku: 'NHC-SKU-',
    packSize: '100ml / 60 Tablets',
    manufacturer: 'Navin Homeo Care',
    ingredients: '',
    usageInstructions: '',
    storageInfo: 'Store in a cool, dry place away from direct sunlight.',
    shippingEligibility: 'Available for Standard Shipping',
    prescriptionRequired: false,
    featured: false,
  });

  const reloadProducts = () => {
    setProducts(adminDataService.getProducts());
    setInventoryLogs(adminDataService.getInventoryLogs());
  };

  useEffect(() => {
    reloadProducts();
  }, []);

  // Total stock across all products
  const totalStock = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockQuantity, 0);
  }, [products]);

  // Total units sold across valid non-cancelled orders
  const totalUnitsSold = useMemo(() => {
    const validOrders = adminDataService
      .getOrders()
      .filter((o) => o.status !== 'cancelled' && (o.status as any) !== 'refunded');
    return validOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
      0
    );
  }, []);

  const lowStockThreshold = useMemo(() => {
    return adminDataService.getSettings().lowStockThreshold || 10;
  }, []);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity <= lowStockThreshold && p.stockQuantity > 0).length;
  }, [products, lowStockThreshold]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stockQuantity === 0).length;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = prod.name.toLowerCase().includes(q);
        const skuMatch = prod.sku?.toLowerCase().includes(q);
        const catMatch = prod.category.toLowerCase().includes(q);
        if (!nameMatch && !skuMatch && !catMatch) return false;
      }

      if (categoryFilter !== 'all' && prod.category !== categoryFilter) {
        return false;
      }

      if (stockFilter !== 'all' && prod.stockStatus !== stockFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Filtered Inventory Logs for History Modal
  const filteredInventoryLogs = useMemo(() => {
    if (historyReasonFilter === 'all') return inventoryLogs;
    return inventoryLogs.filter((log) => log.changeReason === historyReasonFilter);
  }, [inventoryLogs, historyReasonFilter]);

  // Quick Stock Adjustment
  const handleStockAdjust = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stockQuantity + delta);
    adminDataService.updateProductStock(
      productId,
      newStock,
      delta > 0 ? 'Stock Added' : 'Manual Adjustment'
    );
    reloadProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: '',
      slug: '',
      category: 'General Wellness',
      shortDesc: '',
      fullDesc: '',
      image:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      mrp: 300,
      price: 250,
      costPrice: undefined,
      discountPercentage: 16,
      stockQuantity: 25,
      sku: `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      packSize: '100ml / 60 Tablets',
      manufacturer: 'Navin Homeo Care',
      ingredients: '',
      usageInstructions: '',
      storageInfo: 'Store in a cool, dry place away from direct sunlight.',
      shippingEligibility: 'Available for Standard Shipping',
      prescriptionRequired: false,
      featured: false,
      rating: 4.8,
      reviewsCount: 1,
      details: ['Quality assured health & wellness product'],
      importantInfo: '',
    });
    setProductModalOpen(true);
  };

  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({ ...prod });
    setProductModalOpen(true);
  };

  const handleDelete = (productId: string, name: string) => {
    setDeleteConfirmProduct({ id: productId, name });
  };

  const confirmDeleteProduct = () => {
    if (deleteConfirmProduct) {
      adminDataService.deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
      reloadProducts();
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name || !formData.price) {
      setFormError('Please fill out product name and selling price.');
      return;
    }

    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const stock = Number(formData.stockQuantity) || 0;
    const threshold = lowStockThreshold;
    const stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' =
      stock === 0 ? 'out_of_stock' : stock <= threshold ? 'low_stock' : 'in_stock';

    const fullProduct: ProductItem = {
      id: editingProduct ? editingProduct.id : formData.id || `prod-${Date.now()}`,
      slug,
      name: formData.name || 'Unnamed Product',
      category: (formData.category as ProductCategory) || 'General Wellness',
      shortDesc: formData.shortDesc || '',
      fullDesc: formData.fullDesc || '',
      image: formData.image || '',
      images: formData.images || [formData.image || ''],
      mrp: Number(formData.mrp) || Number(formData.price) || 0,
      price: Number(formData.price) || 0,
      costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
      discountPercentage:
        formData.mrp && formData.mrp > formData.price!
          ? Math.round(((formData.mrp - formData.price!) / formData.mrp) * 100)
          : 0,
      stockQuantity: stock,
      stockStatus,
      sku: formData.sku || `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      packSize: formData.packSize || 'Standard Pack',
      manufacturer: formData.manufacturer || 'Navin Homeo Care',
      ingredients: formData.ingredients || '',
      usageInstructions: formData.usageInstructions || '',
      storageInfo: formData.storageInfo || 'Store in a cool, dry place.',
      shippingEligibility: formData.shippingEligibility || 'Available',
      prescriptionRequired: !!formData.prescriptionRequired,
      featured: !!formData.featured,
      rating: formData.rating || 4.8,
      reviewsCount: formData.reviewsCount || 1,
      details: formData.details || ['Standard wellness formulation'],
      importantInfo: formData.importantInfo || '',
    };

    adminDataService.saveOrUpdateProduct(fullProduct);
    setProductModalOpen(false);
    reloadProducts();
  };

  return (
    <AdminLayout
      activeTab="products"
      pageTitle="Product Inventory & Stock Management"
      pageSubtitle="Manage store catalog, safety thresholds, units sold, and profit margins"
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
        {/* ================= SECTION 7: INVENTORY DASHBOARD SUMMARY KPIS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Current Stock</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalStock} units</span>
            <p className="text-[10px] text-slate-400 mt-1">Across {products.length} products</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Units Sold</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {totalUnitsSold} units
            </span>
            <p className="text-[10px] text-emerald-600 mt-1">Verified orders</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block">Low Stock Threshold</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              &le; {lowStockThreshold} units
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Trigger level for restock alerts</p>
          </div>

          <div
            onClick={() => setStockFilter('low_stock')}
            className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Low Stock Items</span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">{lowStockCount}</span>
            <p className="text-[10px] text-amber-700 mt-1">Require restocking soon</p>
          </div>

          <div
            onClick={() => setStockFilter('out_of_stock')}
            className={`p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              outOfStockCount > 0 ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200/80'
            }`}
          >
            <span className="text-[11px] text-slate-500 font-semibold block">Out of Stock</span>
            <span className="text-2xl font-bold text-red-600 mt-1 block">{outOfStockCount}</span>
            <p className="text-[10px] text-red-600 mt-1">0 units remaining</p>
          </div>
        </div>

        {/* Low Stock Warning Banner if applicable */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  {lowStockCount + outOfStockCount} Product(s) Require Inventory Attention
                </p>
                <p className="text-amber-800 mt-0.5">
                  {outOfStockCount > 0 ? `${outOfStockCount} product is completely out of stock. ` : ''}
                  {lowStockCount > 0
                    ? `${lowStockCount} item(s) are below safety threshold of ${lowStockThreshold} units.`
                    : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setInventoryHistoryOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold cursor-pointer shrink-0"
            >
              View Recent Stock Logs
            </button>
          </div>
        )}

        {/* Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by Name, SKU, or Category..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {(
              [
                { id: 'all', label: 'All Inventory' },
                { id: 'in_stock', label: `In Stock (>${lowStockThreshold})` },
                { id: 'low_stock', label: `Low Stock (1-${lowStockThreshold})` },
                { id: 'out_of_stock', label: 'Out of Stock (0)' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStockFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

        {/* Product Table with Profit-Ready Fields (Cost Price, Gross Profit, Profit Margin) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Cost Price</th>
                  <th className="py-3.5 px-4">Gross Profit</th>
                  <th className="py-3.5 px-4">Margin %</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No matching products found in product inventory.
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

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-11 h-11 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-xs">
                                {prod.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{prod.packSize}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{prod.category}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{prod.sku}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">₹{prod.price}</p>
                          {prod.mrp > prod.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{prod.mrp}
                            </span>
                          )}
                        </td>
                        {/* Section 8: Cost Price, Profit, Margin */}
                        <td className="py-3 px-4 text-slate-600">
                          {hasCost ? `₹${prod.costPrice}` : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          {grossProfit !== null ? (
                            <span
                              className={`font-semibold ${
                                grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              ₹{grossProfit}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {profitMargin !== null ? (
                            <span
                              className={`font-semibold ${
                                Number(profitMargin) >= 0 ? 'text-emerald-700' : 'text-red-600'
                              }`}
                            >
                              {profitMargin}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStockAdjust(prod.id, -1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                              title="Decrease Stock (-1)"
                            >
                              -
                            </button>
                            <span className="font-bold text-slate-900 w-8 text-center">
                              {prod.stockQuantity}
                            </span>
                            <button
                              onClick={() => handleStockAdjust(prod.id, 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                              title="Increase Stock (+1)"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              prod.stockStatus === 'in_stock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prod.stockStatus === 'low_stock'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prod.stockStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
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

      {/* ================= INVENTORY HISTORY LOG MODAL (Section 7) ================= */}
      {inventoryHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 text-xs flex flex-col max-h-[85vh] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Inventory History Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete audit trail tracking Product, Change, Reason, Date, and Admin.
                </p>
              </div>
              <button
                onClick={() => setInventoryHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter by Reason */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Filter by Reason:</span>
              {[
                { id: 'all', label: 'All Reasons' },
                { id: 'Stock Added', label: 'Stock Added' },
                { id: 'Manual Adjustment', label: 'Manual Adjustment' },
                { id: 'Order', label: 'Order' },
                { id: 'Cancellation', label: 'Cancellation' },
                { id: 'Return', label: 'Return' },
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

            {/* Log Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3">Stock (Before &rarr; After)</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3 text-right">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No inventory log entries found.
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
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {log.productName}
                        </td>
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
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {log.changeReason}
                          </span>
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
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 text-xs flex flex-col max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Edit Product Record' : 'Add New Product Record'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Natural Herbal Supportive Cream"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price ?? ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Cost Price (Optional - Section 8) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cost Price (₹, Optional)
                  </label>
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
                    placeholder="Optional acquisition cost"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Used to calculate Gross Profit & Margin %. Do not invent cost prices.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.mrp ?? ''}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stockQuantity ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={formData.packSize || ''}
                    onChange={(e) => setFormData({ ...formData, packSize: e.target.value })}
                    placeholder="e.g. 100ml / 60 Tablets"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Image URL</label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    value={formData.shortDesc || ''}
                    onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                    placeholder="Brief description for shop listings..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Navin Homeo Care"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Information</label>
                  <input
                    type="text"
                    value={formData.storageInfo || ''}
                    onChange={(e) => setFormData({ ...formData, storageInfo: e.target.value })}
                    placeholder="Store in a cool dry place away from direct sunlight."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Verified Manufacturer Information */}
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Manufacturer Data (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Only supply composition, instructions, or consultation notices if verified packaging information is provided.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Composition / Ingredients
                      </label>
                      <input
                        type="text"
                        value={formData.ingredients || ''}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        placeholder="Leave blank if not provided"
                        className="w-full p-2 bg-white rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Usage Instructions
                      </label>
                      <input
                        type="text"
                        value={formData.usageInstructions || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, usageInstructions: e.target.value })
                        }
                        placeholder="Leave blank if not provided"
                        className="w-full p-2 bg-white rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-700">Feature in Store</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.prescriptionRequired}
                      onChange={(e) =>
                        setFormData({ ...formData, prescriptionRequired: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-700">Display Consultation Notice</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Remove Product from Inventory?</h3>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deleteConfirmProduct.name}</strong>? This action will remove the item from the catalog and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
