import React, { useState } from 'react';
import { getActiveProducts } from '../config/productsData';
import { Link, useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Check,
  Star,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Info,
  Package,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  slug: string;
}

export const ProductDetailPage: React.FC<Props> = ({ slug }) => {
  const { navigate } = useRouter();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'composition' | 'shipping'>('overview');
  const [toastNotice, setToastNotice] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  const product = getActiveProducts().find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <Package className="w-12 h-12 text-slate-300 mb-3" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6 text-sm">
          The requested health &amp; wellness product record does not exist or has been moved.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001428] text-white font-medium text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const discountAmount = product.mrp - product.price;

  const showToast = (message: string, type: 'success' | 'warn' = 'success') => {
    setToastNotice({ message, type });
    setTimeout(() => setToastNotice(null), 2800);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'warn');
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
      quantity
    );
    if (res.success) {
      showToast(`Added ${quantity} × "${product.name}" to cart.`, 'success');
    } else {
      showToast(res.message || 'Unable to add requested quantity.', 'warn');
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast('This product is currently out of stock.', 'warn');
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
      quantity
    );
    navigate('/checkout');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Toast Notification */}
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

      {/* Breadcrumb Navigation */}
      <section className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-slate-900 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-slate-500">{product.category}</span>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </div>
      </section>

      {/* Main Product Layout */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Gallery & Thumbnails */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Main Large Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs">
                  <img
                    src={images[selectedImageIndex] || product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${
                      isOutOfStock ? 'opacity-70 grayscale-50' : ''
                    }`}
                  />

                  {/* Stock Status Badge */}
                  <span
                    className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-2xs backdrop-blur-xs ${
                      isOutOfStock
                        ? 'bg-rose-600 text-white'
                        : isLowStock
                        ? 'bg-amber-600 text-white'
                        : 'bg-white/95 text-[#006e2d]'
                    }`}
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : isLowStock
                      ? `Low Stock (${product.stockQuantity} remaining)`
                      : `In Stock (${product.stockQuantity} units available)`}
                  </span>

                  {product.discountPercentage > 0 && (
                    <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="flex items-center gap-3">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedImageIndex === idx
                            ? 'border-[#006e2d] ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Title, Pricing, Actions, Stock */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">
                      {product.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">{product.packSize}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] leading-tight mb-2">
                    {product.name}
                  </h1>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {product.rating} / 5.0
                    </span>
                    <span className="text-xs text-slate-400">
                      ({product.reviewsCount} customer &amp; clinic reviews)
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-3xl font-black text-[#001428]">
                    ₹{product.price}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP ₹{product.mrp}
                    </span>
                  )}
                  {discountAmount > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      Save ₹{discountAmount} ({product.discountPercentage}% Off)
                    </span>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">Inclusive of all taxes</span>
                </div>

                {/* Short Overview Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.shortDesc}
                </p>

                {/* Prescription Required Notice if applicable */}
                {product.prescriptionRequired && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">
                        Consultation may be required before purchase.
                      </strong>
                      <span>
                        This supportive formulation is dispensed under clinic guidance. If in doubt, Dr. Navin Maurya is available for consultation.
                      </span>
                    </div>
                  </div>
                )}

                {/* Key Bullet Features */}
                <div className="space-y-2 pt-1">
                  {product.details.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-[#006e2d] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Quantity and Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                  {!isOutOfStock ? (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-700">Quantity:</span>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 cursor-pointer min-w-[36px]"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-4 text-xs font-extrabold text-slate-900">
                          {quantity}
                        </span>
                        <button
                          disabled={quantity >= product.stockQuantity}
                          onClick={() =>
                            setQuantity((q) => Math.min(product.stockQuantity, q + 1))
                          }
                          className={`px-3 py-1.5 text-sm font-bold min-w-[36px] ${
                            quantity >= product.stockQuantity
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                          }`}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">
                        Item Subtotal: <strong className="text-slate-900">₹{product.price * quantity}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold">
                      This item is temporarily out of stock in our store inventory. Please check back soon or call the clinic desk.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                      className={`py-3.5 px-6 rounded-xl border-2 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                        isOutOfStock
                          ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                          : 'border-[#006e2d] text-[#006e2d] hover:bg-emerald-50 cursor-pointer'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className={`py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 ${
                        isOutOfStock
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-[#006e2d] hover:bg-[#005320] text-white cursor-pointer'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                  </div>
                </div>

                {/* Assurance Badges */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#006e2d]" />
                    <span className="font-semibold text-slate-800">Clinic Verified</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#006e2d]" />
                    <span className="font-semibold text-slate-800">Dispatched from OPD</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 flex flex-col items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-[#006e2d]" />
                    <span className="font-semibold text-slate-800">Counter Pickup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Specifications & Tabs */}
            <div className="mt-14 pt-8 border-t border-slate-200">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 mb-6 scrollbar-none">
                {[
                  { id: 'overview', label: 'Product Overview & Details' },
                  { id: 'usage', label: 'How to Use & Storage' },
                  { id: 'composition', label: 'Ingredients & Composition' },
                  { id: 'shipping', label: 'Manufacturer & Shipping' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#001428] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="text-slate-700 text-sm leading-relaxed max-w-4xl space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#001428] mb-2">
                        Product Overview
                      </h3>
                      <p className="leading-relaxed">{product.fullDesc}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#001428] mb-2">
                        Key Product Highlights
                      </h4>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'usage' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#001428] mb-2">
                        Usage Instructions
                      </h3>
                      <p className="leading-relaxed">{product.usageInstructions}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#001428] mb-1">
                        Storage Guidelines
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600">{product.storageInfo}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs">
                      <strong className="block mb-1 font-bold text-amber-900">
                        Important Safety Information:
                      </strong>
                      <p>{product.importantInfo}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'composition' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#001428] mb-2">
                        Ingredients &amp; Composition
                      </h3>
                      <div className="font-mono text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed">
                        {product.ingredients}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Formulated in compliance with standard Good Manufacturing Practices (GMP) and standardized herbal &amp; homeopathic pharmacopoeial guidelines. Free from fabricated medicinal claims.
                    </p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-[#001428] mb-1">
                        Manufacturer Information
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">{product.manufacturer}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#001428] mb-1">
                        Shipping &amp; Delivery Information
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {product.shippingEligibility} Standard courier dispatch takes 2–4 business days across Uttar Pradesh. Local in-clinic counter collection is also available at Alambagh, Lucknow.
                      </p>
                    </div>
                    <div className="pt-2 text-xs text-slate-500">
                      Need help? Review our{' '}
                      <Link to="/shipping-policy" className="text-[#006e2d] font-bold underline">
                        Shipping Policy
                      </Link>{' '}
                      or{' '}
                      <Link to="/refund-policy" className="text-[#006e2d] font-bold underline">
                        Return &amp; Refund Policy
                      </Link>
                      .
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
