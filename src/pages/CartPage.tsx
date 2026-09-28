import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../context/RouterContext';
import {
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Package,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartMrpTotal,
    cartDiscount,
    shippingFee,
    shippingThreshold,
    grandTotal,
    cartCount,
  } = useCart();
  const { navigate } = useRouter();

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const handleUpdateQty = (id: string, delta: number) => {
    const res = updateQuantity(id, delta);
    if (!res.success && res.message) {
      setWarningMsg(res.message);
      setTimeout(() => setWarningMsg(null), 3000);
    }
  };

  const amountNeededForFreeShipping = Math.max(0, shippingThreshold - cartSubtotal);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Toast / Warning Banner */}
      {warningMsg && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 bg-amber-900 text-amber-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-700 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-sm">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-bold leading-tight">{warningMsg}</p>
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span>Shopping Cart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Shopping Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})
          </h1>
        </div>
      </section>

      {/* Main Cart Content */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Your cart is currently empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Explore our shop's range of natural skincare, scalp care oils, and supportive wellness formulations.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all"
              >
                <span>Browse Shop Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs divide-y divide-slate-100">
                  {cart.map((item) => {
                    const isLowStock =
                      item.stockQuantity > 0 && item.stockQuantity <= 5;
                    const isMaxStockReached = item.quantity >= item.stockQuantity;

                    return (
                      <div
                        key={item.id}
                        className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Product Thumbnail & Details */}
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                          />
                          <div>
                            <span className="text-[11px] font-bold text-[#006e2d] uppercase">
                              {item.category}
                            </span>
                            <h3
                              onClick={() => navigate(`/shop/${item.slug}`)}
                              className="text-sm sm:text-base font-bold text-[#001428] hover:text-[#006e2d] cursor-pointer transition-colors leading-snug"
                            >
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span>
                                Price: <strong className="text-slate-900">₹{item.price}</strong>
                              </span>
                              {item.mrp > item.price && (
                                <span className="text-slate-400 line-through">
                                  MRP ₹{item.mrp}
                                </span>
                              )}
                            </div>

                            {/* Low Stock Indicator */}
                            {isLowStock && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Only {item.stockQuantity} units in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls, Total, and Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer min-w-[32px] min-h-[32px]"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-extrabold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              disabled={isMaxStockReached}
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className={`px-2.5 py-1 text-xs font-bold min-w-[32px] min-h-[32px] ${
                                isMaxStockReached
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                              }`}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Item Total */}
                          <div className="text-right min-w-[80px]">
                            <span className="text-sm font-black text-[#001428]">
                              ₹{item.price * item.quantity}
                            </span>
                            {item.mrp > item.price && (
                              <div className="text-[10px] text-emerald-600 font-semibold">
                                Saved ₹{(item.mrp - item.price) * item.quantity}
                              </div>
                            )}
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-actions Row: Continue Shopping & Clear Cart */}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#001428]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </Link>

                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Clear All Cart Items
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-5 sticky top-24">
                  <h2 className="text-base font-bold text-[#001428]">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-600 pb-4 border-b border-slate-100">
                    <div className="flex justify-between">
                      <span>Items MRP Total</span>
                      <span className="font-semibold text-slate-500">₹{cartMrpTotal}</span>
                    </div>

                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Shop Savings</span>
                        <span className="font-bold">-₹{cartDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Cart Subtotal</span>
                      <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Shipping &amp; Delivery</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {shippingFee === 0 ? (
                          <span className="text-[#006e2d] font-bold">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Free Shipping Progress / Callout */}
                  {shippingFee > 0 ? (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-100 leading-relaxed">
                      Add <strong>₹{amountNeededForFreeShipping}</strong> more to qualify for{' '}
                      <strong>FREE Shipping</strong> (free on orders above ₹{shippingThreshold})!
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-medium">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Congratulations! You qualify for FREE Shipping.</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-bold text-[#001428]">Total Amount</span>
                    <span className="text-2xl font-black text-[#001428]">
                      ₹{grandTotal}
                    </span>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006e2d]" />
                    <span>Cash on Delivery &bull; Safe Product Packaging</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
