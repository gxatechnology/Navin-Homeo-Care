import React, { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { CLINIC_CONFIG } from '../config/clinicData';
import {
  findOrder,
  getStoredOrders,
  ORDER_STATUS_LABELS,
  getWhatsAppOrderLink,
  Order,
  OrderStatus,
} from '../services/orderService';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Printer,
  ChevronRight,
  AlertCircle,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const OrderLookupPage: React.FC = () => {
  const { navigate } = useRouter();

  const [orderIdQuery, setOrderIdQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stored recent orders in this browser
  const storedOrders = getStoredOrders();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdQuery.trim()) {
      setErrorMessage('Please enter your Order ID (e.g. NHC-ORD-9281)');
      return;
    }

    setErrorMessage('');
    setHasSearched(true);
    const result = findOrder(orderIdQuery.trim(), phoneQuery.trim());
    setSearchedOrder(result);
  };

  const handleSelectRecentOrder = (order: Order) => {
    setSearchedOrder(order);
    setOrderIdQuery(order.id);
    setPhoneQuery(order.customer.phone);
    setHasSearched(true);
    setErrorMessage('');
  };

  const renderStatusTimeline = (currentStatus: OrderStatus) => {
    const statuses: OrderStatus[] = [
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
    ];
    const currentStep = ORDER_STATUS_LABELS[currentStatus]?.step || 1;

    return (
      <div className="py-6">
        <div className="relative flex items-center justify-between">
          {/* Progress bar background line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 z-0" />
          {/* Active progress bar */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#006e2d] transition-all duration-500 z-0"
            style={{
              width: `${((currentStep - 1) / (statuses.length - 1)) * 100}%`,
            }}
          />

          {statuses.map((st, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum <= currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={st} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-[#006e2d] text-white shadow-xs'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 text-center max-w-[65px] sm:max-w-[80px] leading-tight ${
                    isCompleted ? 'text-[#001428]' : 'text-slate-400'
                  } ${isCurrent ? 'font-bold text-[#006e2d]' : ''}`}
                >
                  {ORDER_STATUS_LABELS[st].label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            <Link to="/shop" className="hover:text-white transition-colors">
              Shop
            </Link>
            <span>/</span>
            <span>Track Order</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            Track Your Product Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Enter your Order ID (from your confirmation receipt or SMS/WhatsApp) to view live fulfillment and delivery updates.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Lookup Input Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
            <h2 className="text-base font-bold text-[#001428] mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#006e2d]" />
              <span>Lookup Order Details</span>
            </h2>

            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NHC-ORD-9281"
                  value={orderIdQuery}
                  onChange={(e) => setOrderIdQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d] bg-slate-50 uppercase"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 07318306699"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#006e2d] bg-slate-50"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px]"
                >
                  <Search className="w-4 h-4" />
                  <span>Track</span>
                </button>
              </div>
            </form>

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Search Result Display */}
          {hasSearched && (
            <div>
              {searchedOrder ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                  {/* Status Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Order Status
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl sm:text-2xl font-black text-[#001428]">
                          {searchedOrder.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            ORDER_STATUS_LABELS[searchedOrder.status]?.color ||
                            'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[searchedOrder.status]?.label || searchedOrder.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Placed on {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} &bull; {searchedOrder.estimatedDelivery}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppOrderLink(searchedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Help</span>
                      </a>
                      <button
                        onClick={() => window.print()}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Print Order Receipt"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Status Progress */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Fulfillment Progress
                    </h3>
                    {renderStatusTimeline(searchedOrder.status)}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mt-2">
                      <strong className="text-slate-800">Current Phase:</strong>{' '}
                      {ORDER_STATUS_LABELS[searchedOrder.status]?.desc}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Ordered Products ({searchedOrder.items.length})
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/40">
                      {searchedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 flex items-center justify-between text-xs gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover bg-white shrink-0 border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              <span className="text-[11px] text-slate-500">
                                Quantity: {item.quantity} &bull; Unit: ₹{item.price}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Delivery Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Delivery Address */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#006e2d]" />
                        <span>Shipping Address</span>
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        <strong className="text-slate-900">{searchedOrder.customer.fullName}</strong>
                        <br />
                        {searchedOrder.address.addressLine1}
                        {searchedOrder.address.addressLine2 && `, ${searchedOrder.address.addressLine2}`}
                        {searchedOrder.address.landmark && ` (Near ${searchedOrder.address.landmark})`}
                        <br />
                        {searchedOrder.address.city}, {searchedOrder.address.state} – {searchedOrder.address.pincode}
                        <br />
                        Phone: {searchedOrder.customer.phone}
                      </p>
                    </div>

                    {/* Financial Summary */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#006e2d]" />
                        <span>Payment Breakdown</span>
                      </span>
                      <div className="flex justify-between text-slate-600">
                        <span>Payment Method:</span>
                        <span className="font-semibold text-slate-900">
                          {searchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span className="font-semibold text-slate-900">₹{searchedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping Fee:</span>
                        <span className="font-semibold text-slate-900">
                          {searchedOrder.shippingFee === 0 ? 'FREE' : `₹${searchedOrder.shippingFee}`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-black text-[#001428]">
                        <span>Total:</span>
                        <span>₹{searchedOrder.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center shadow-2xs">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    No Order Found for "{orderIdQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Please ensure the Order ID is entered accurately (e.g. NHC-ORD-9281) or check the phone number.
                  </p>
                  <a
                    href={`tel:${CLINIC_CONFIG.phoneClean}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#006e2d]" />
                    <span>Call Order Support Desk: {CLINIC_CONFIG.phone}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Stored Recent Orders In Device */}
          {storedOrders.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
              <h3 className="text-sm font-bold text-[#001428] mb-3 flex items-center justify-between">
                <span>Recent Orders On This Device ({storedOrders.length})</span>
                <span className="text-xs text-slate-400 font-normal">Click to view details</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {storedOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectRecentOrder(ord)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#001428]">
                          {ord.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ORDER_STATUS_LABELS[ord.status]?.color ||
                            'text-emerald-700 bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[ord.status]?.label || ord.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {ord.items.length} item{ord.items.length !== 1 ? 's' : ''} &bull; Total: ₹{ord.total} &bull; {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
