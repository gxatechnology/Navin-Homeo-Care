import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../context/RouterContext';
import { CLINIC_CONFIG } from '../config/clinicData';
import {
  saveOrder,
  generateOrderId,
  getWhatsAppOrderLink,
  Order,
} from '../services/orderService';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Truck,
  Phone,
  Info,
  Copy,
  Printer,
  MessageCircle,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartMrpTotal,
    cartDiscount,
    shippingFee,
    grandTotal,
    clearCart,
  } = useCart();
  const { navigate } = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226005',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_pending'>('cod');
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty. Please add products before checking out.');
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!formData.addressLine1.trim()) {
      setErrorMsg('Please enter your street address (House/Flat No., Building).');
      return;
    }

    if (!formData.city.trim() || !formData.pincode.trim()) {
      setErrorMsg('Please enter City and PIN Code.');
      return;
    }

    if (paymentMethod === 'online_pending') {
      setErrorMsg('Online payment gateway is pending integration. Please select Cash on Delivery.');
      return;
    }

    setErrorMsg('');

    // Generate Order
    const newOrder: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      items: [...cart],
      customer: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      },
      address: {
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        landmark: formData.landmark.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },
      notes: formData.notes.trim() || undefined,
      paymentMethod: 'cod',
      paymentStatus: 'pending_on_delivery',
      subtotal: cartSubtotal,
      shippingFee,
      discount: cartDiscount,
      total: grandTotal,
      status: 'confirmed',
      estimatedDelivery: '2–4 business days (OPD Dispatch)',
    };

    saveOrder(newOrder);
    setCompletedOrder(newOrder);
    clearCart();
  };

  const handleCopyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // ORDER CONFIRMATION SCREEN
  if (completedOrder) {
    const whatsappLink = getWhatsAppOrderLink(completedOrder);

    return (
      <div className="bg-slate-50 min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm print:border-none print:shadow-none">
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006e2d] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">
              Order Confirmed &bull; Cash on Delivery
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001428] mt-1 mb-2">
              Thank You, {completedOrder.customer.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
              Your order has been recorded at Navin Homeo Care shop. Our team will prepare your package and contact you before dispatch.
            </p>
          </div>

          {/* Order ID Banner */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[11px] font-bold text-[#006e2d] uppercase tracking-wider block">
                Your Order Tracking ID
              </span>
              <span className="font-mono text-lg font-black text-[#001428]">
                {completedOrder.id}
              </span>
            </div>
            <button
              onClick={handleCopyOrderId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-slate-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#006e2d]" />
              <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Order Item Summary */}
          <div className="mb-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ordered Items ({completedOrder.items.length})
            </h2>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
              {completedOrder.items.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {/* Delivery Address */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#006e2d]" />
                <span>Delivery Address</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                {completedOrder.address.addressLine1}
                {completedOrder.address.addressLine2 && `, ${completedOrder.address.addressLine2}`}
                {completedOrder.address.landmark && ` (Near ${completedOrder.address.landmark})`}
                <br />
                {completedOrder.address.city}, {completedOrder.address.state} – {completedOrder.address.pincode}
                <br />
                <span className="font-semibold text-slate-800">Phone: {completedOrder.customer.phone}</span>
              </p>
            </div>

            {/* Order Payment Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#006e2d]" />
                <span>Payment &amp; Delivery</span>
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{completedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-semibold text-slate-800">
                  {completedOrder.shippingFee === 0 ? 'FREE' : `₹${completedOrder.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-black text-[#001428]">
                <span>Total Due on Delivery:</span>
                <span>₹{completedOrder.total}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Order Support</span>
              </a>

              <button
                onClick={() => window.print()}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print / Save Receipt</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/track-order')}
                className="py-3 px-4 rounded-xl bg-[#001428] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Track Order Status
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Return to Shop Catalog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM SCREEN
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-white transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span>Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Delivery &amp; Order Checkout
          </h1>
        </div>
      </section>

      {/* Main Checkout Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {cart.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-2xs">
              <p className="text-slate-600 text-sm mb-4">No items currently in your checkout cart.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006e2d] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Customer Information */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-base font-bold text-[#001428] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#001428] text-white text-xs flex items-center justify-center font-bold">
                      1
                    </span>
                    Customer Contact Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 09876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com (For order updates)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Address */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-base font-bold text-[#001428] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#001428] text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address Line 1 (House No., Building, Street) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Flat 302, Green Avenue, Azad Nagar"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Address Line 2 (Area, Colony, Sector)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Pakri Ka Pul / Alambagh"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Behind Metro Station"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Order Notes */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-base font-bold text-[#001428] mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#001428] text-white text-xs flex items-center justify-center font-bold">
                      3
                    </span>
                    Special Instructions / Order Notes (Optional)
                  </h2>
                  <textarea
                    rows={2}
                    placeholder="e.g. Call before delivery, prefer morning delivery, etc."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d]"
                  />
                </div>

                {/* 4. Payment Method */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                  <h2 className="text-base font-bold text-[#001428] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#001428] text-white text-xs flex items-center justify-center font-bold">
                      4
                    </span>
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Option 1: Cash on Delivery */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-[#006e2d] bg-emerald-50/40 ring-2 ring-emerald-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 text-[#006e2d] accent-[#006e2d] w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#001428]">
                            Cash on Delivery (COD) / Pay on Delivery
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Pay in cash or scan UPI QR with our courier delivery executive at your doorstep upon receiving your package.
                        </p>
                      </div>
                    </label>

                    {/* Option 2: Online Payment Placeholder */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'online_pending'
                          ? 'border-blue-400 bg-blue-50/40'
                          : 'border-slate-200 bg-slate-50/60 opacity-80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online_pending"
                        checked={paymentMethod === 'online_pending'}
                        onChange={() => setPaymentMethod('online_pending')}
                        className="mt-0.5 text-blue-600 accent-blue-600 w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-700">
                            Online Payment (Card / Netbanking / UPI Gateway)
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                            Integration Pending
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Automated online payment gateway integration will be configured soon. Please select <strong>Cash on Delivery</strong> to complete your order now.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Submit */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs space-y-5 sticky top-24">
                  <h2 className="text-base font-bold text-[#001428]">Order Summary</h2>

                  {/* Items List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                          />
                          <div className="truncate max-w-[150px]">
                            <span className="font-semibold text-slate-900 block truncate">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Qty: {item.quantity} × ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                    </div>

                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Shop Savings</span>
                        <span className="font-bold">-₹{cartDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-slate-900">
                        {shippingFee === 0 ? (
                          <span className="text-[#006e2d] font-bold">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-slate-100">
                      <span>Total Due</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm Order (Cash on Delivery)</span>
                  </button>

                  <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                    <Lock className="w-3.5 h-3.5 text-[#006e2d]" />
                    <span>No online card info needed &bull; Pay on Delivery</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
