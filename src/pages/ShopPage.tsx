import React, { useState, useMemo, useEffect } from 'react';
import { getActiveProducts, ProductItem, PRODUCT_CATEGORIES, isProductExpired } from '../config/productsData';
import { adminDataService } from '../services/adminDataService';
import { Link, useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingCart,
  Check,
  Star,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  Zap,
  Info,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { navigate } = useRouter();
  const { addToCart } = useCart();

  const [productsList, setProductsList] = useState<ProductItem[]>(getActiveProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-200' | '200-350' | 'above-350'>('all');
  const [stockOnly, setStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Cross-device live data synchronization
  useEffect(() => {
    let isMounted = true;
    const loadLiveProducts = async () => {
      try {
        const res = await fetch('/api/products?publicOnly=true');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products) && isMounted) {
            setProductsList(data.products);
          }
        }
      } catch {
        // use initial fallback
      }
    };

    loadLiveProducts();

    const handleUpdate = (e: any) => {
      if (isMounted) {
        setProductsList(getActiveProducts());
      }
    };
    window.addEventListener('nhc_products_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('nhc_products_updated', handleUpdate);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => {
      setToastNotice(null);
    }, 2800);
  };

  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProductExpired(product.expiryDate)) {
      showToast('This product batch has expired and is unavailable.', 'warn');
      return;
    }
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock.', 'warn');
      return;
    }
    const res = addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        stockQuantity: product.stockQuantity,
      },
      1
    );
    if (res.success) {
      showToast(`Added "${product.name}" to cart.`, 'success');
    } else {
      showToast(res.message || 'Unable to add to cart.', 'warn');
    }
  };

  const handleBuyNow = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProductExpired(product.expiryDate)) {
      showToast('This product batch has expired and is unavailable.', 'warn');
      return;
    }
    if (product.stockQuantity <= 0) {
      showToast('This item is currently out of stock.', 'warn');
      return;
    }
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        stockQuantity: product.stockQuantity,
      },
      1
    );
    navigate('/checkout');
  };

  const filteredProducts = useMemo(() => {
    return productsList
      .filter((item) => item.active !== false)
      .filter((item) => {
        // Category filter
        const matchesCategory =
          selectedCategory === 'all' || item.category === selectedCategory;

      // Search query (name, shortDesc, category, ingredients)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.shortDesc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.ingredients.toLowerCase().includes(q);

      // Price filter
      let matchesPrice = true;
      if (priceFilter === 'under-200') matchesPrice = item.price < 200;
      else if (priceFilter === '200-350') matchesPrice = item.price >= 200 && item.price <= 350;
      else if (priceFilter === 'above-350') matchesPrice = item.price > 350;

      // Stock filter
      const matchesStock = !stockOnly || item.stockQuantity > 0;

      return matchesCategory && matchesSearch && matchesPrice && matchesStock;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      // featured
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [selectedCategory, searchQuery, priceFilter, stockOnly, sortBy]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceFilter('all');
    setStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Toast Notice */}
      {toastNotice && (
        <div
          role="status"
          className={`fixed bottom-20 right-4 sm:right-8 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-sm ${
            toastNotice.type === 'warn'
              ? 'bg-amber-900 text-amber-50 border-amber-700'
              : 'bg-[#001428] text-white border-slate-700'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              toastNotice.type === 'warn'
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {toastNotice.type === 'warn' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold leading-tight">{toastNotice.message}</p>
          </div>
          {toastNotice.type === 'success' && (
            <button
              onClick={() => navigate('/cart')}
              className="ml-1 px-2.5 py-1 bg-white text-[#001428] rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer shrink-0"
            >
              Cart
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Health &amp; Wellness Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
            Health &amp; Wellness Store
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Order natural botanical skincare, scalp oils, and supportive wellness formulations directly from Navin Homeo Care, Lucknow.
          </p>
        </div>
      </section>

      {/* Controls & Filter Bar */}
      <section className="sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Top Row: Categories Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#001428] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Bottom Row: Search, Price Brackets, Stock Filter, Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Price Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium mr-1 hidden md:inline">Price:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'under-200', label: '< ₹200' },
                { id: '200-350', label: '₹200–₹350' },
                { id: 'above-350', label: '> ₹350' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriceFilter(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    priceFilter === p.id
                      ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Stock Availability Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stockOnly}
                onChange={(e) => setStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-[#006e2d]"
              />
              <span className="whitespace-nowrap font-medium">In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Grid */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Active Filter Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-6 pb-2 border-b border-slate-200/60">
            <span>
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> product
              {filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
            </span>
            {(selectedCategory !== 'all' ||
              searchQuery ||
              priceFilter !== 'all' ||
              stockOnly ||
              sortBy !== 'featured') && (
              <button
                onClick={resetAllFilters}
                className="text-[#006e2d] hover:underline font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 max-w-lg mx-auto shadow-2xs">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-slate-800 text-lg font-bold mb-1">
                No matching products found
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
                We could not find any products matching your active filters. Try searching with general terms or resetting your criteria.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#001428] text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Grid: 4 columns on large screens, 2 on tablets, 1 on small mobile */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isExpired = isProductExpired(product.expiryDate);
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
                const discountAmount = product.mrp - product.price;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/shop/${product.slug}`)}
                    className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
                  >
                    <div>
                      {/* Image Area */}
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                          }}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            isOutOfStock || isExpired ? 'opacity-60 grayscale-50' : ''
                          }`}
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          {isExpired ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-700 text-white shadow-2xs">
                              Batch Expired
                            </span>
                          ) : isOutOfStock ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs">
                              Only {product.stockQuantity} left
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-[#006e2d] shadow-2xs backdrop-blur-xs">
                              In Stock
                            </span>
                          )}

                          {product.discountPercentage > 0 && !isOutOfStock && !isExpired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                              {product.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        {/* Prescription Warning Badge if applicable */}
                        {product.prescriptionRequired && (
                          <div className="absolute bottom-2 left-2 right-2 bg-[#001428]/90 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 font-medium">
                            <Info className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Consultation may be required</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 sm:p-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#006e2d] uppercase tracking-wider truncate">
                            {product.category}
                          </span>
                          <span className="text-slate-400 text-[10px]">{product.packSize}</span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors leading-snug line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.shortDesc}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="flex text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {product.rating}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({product.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Price & Action Buttons */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-slate-100/80 mt-2">
                      <div className="flex items-baseline gap-2 mb-3 pt-3">
                        <span className="text-base font-extrabold text-[#001428]">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            MRP ₹{product.mrp}
                          </span>
                        )}
                        {discountAmount > 0 && (
                          <span className="text-[11px] text-emerald-700 font-semibold ml-auto">
                            Save ₹{discountAmount}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Add to Cart & Buy Now */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={isOutOfStock || isExpired}
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`w-full py-2 px-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                            isOutOfStock || isExpired
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-white hover:bg-emerald-50 text-[#006e2d] border border-[#006e2d] cursor-pointer shadow-2xs'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isExpired ? 'Expired' : 'Add'}</span>
                        </button>

                        <button
                          disabled={isOutOfStock || isExpired}
                          onClick={(e) => handleBuyNow(product, e)}
                          className={`w-full py-2 px-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                            isOutOfStock || isExpired
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-[#006e2d] hover:bg-[#005320] text-white shadow-2xs cursor-pointer'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Buy Now</span>
                        </button>
                      </div>

                      {/* View Details Link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shop/${product.slug}`);
                        }}
                        className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-[#001428] pt-2 transition-colors cursor-pointer"
                      >
                        View Full Details &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ethical Disclaimer Banner */}
          <div className="mt-14 bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start gap-4 text-slate-600 text-xs sm:text-sm shadow-2xs">
            <ShieldCheck className="w-6 h-6 text-[#006e2d] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#001428] block text-sm">
                Product Quality Assurance &amp; Health Notice
              </span>
              <p className="leading-relaxed">
                Health supplements, topical emollients, and wellness products available in our shop are formulated for general comfort and nutritional wellness. They are not intended to replace qualified medical consultation or clinical assessment. For diagnosis or management of specific health conditions, please book a personal consultation with Dr. Navin Maurya at Navin Homeo Care.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
