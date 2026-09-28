import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService } from '../services/adminDataService';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '../services/orderService';
import { CLINIC_CONFIG } from '../config/clinicData';
import {
  ShoppingBag,
  Search,
  Filter,
  Check,
  X,
  Package,
  Truck,
  IndianRupee,
  Phone,
  Printer,
  ChevronRight,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  RotateCcw,
} from 'lucide-react';

export const AdminOrdersPage: React.FC<{ initialSelectedId?: string }> = ({ initialSelectedId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending_on_delivery'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Manual Order Creation Modal State
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [orderCreateForm, setOrderCreateForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226005',
    productId: '',
    quantity: 1,
    source: 'Admin-created Order',
    notes: '',
  });
  const [createOrderError, setCreateOrderError] = useState('');

  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Invoice / Packing Slip Modal
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Courier Update Form State
  const [courierName, setCourierName] = useState('Local Lucknow Courier');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierNotice, setCourierNotice] = useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<boolean>(false);

  const reloadData = () => {
    const list = adminDataService.getOrders();
    setOrders(list);
    if (initialSelectedId) {
      const match = list.find((o) => o.id === initialSelectedId);
      if (match) setSelectedOrder(match);
    }
  };

  useEffect(() => {
    reloadData();
  }, [initialSelectedId]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order.id.toLowerCase().includes(q);
        const nameMatch = order.customer.fullName.toLowerCase().includes(q);
        const phoneMatch = order.customer.phone.includes(q);
        if (!idMatch && !nameMatch && !phoneMatch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (order.status !== statusFilter) return false;
      }

      // Payment filter
      if (paymentFilter !== 'all') {
        if (order.paymentStatus !== paymentFilter) return false;
      }

      // Source filter
      if (sourceFilter !== 'all') {
        const orderSource = order.source || 'Website Shop';
        if (orderSource !== sourceFilter) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, sourceFilter]);

  // Actions
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    adminDataService.updateOrderStatus(orderId, newStatus);
    reloadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: 'pending_on_delivery' | 'paid') => {
    adminDataService.updateOrderPaymentStatus(orderId, newStatus);
    reloadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newStatus } : null));
    }
  };

  const handleSaveCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const updated = adminDataService.updateOrderCourier(selectedOrder.id, courierName, trackingNumber);
    if (updated) {
      setSelectedOrder({ ...selectedOrder, ...(updated as any) });
      reloadData();
      setCourierNotice('Courier details saved successfully!');
      setTimeout(() => setCourierNotice(null), 3000);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    adminDataService.updateOrderStatus(orderId, 'cancelled');
    reloadData();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    }
  };

  const getWhatsAppOrderLink = (order: Order) => {
    const cleanPhone = order.customer.phone.replace(/\D/g, '').slice(-10);
    const message = `Namaste ${order.customer.fullName}, this is Navin Homeo Care regarding your Order ${order.id} (Status: ${order.status.toUpperCase()}, Total: ₹${order.total}). Your parcel is being prepared. Tracking assistance is available here.`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const clinicSettings = adminDataService.getSettings();

  return (
    <AdminLayout
      activeTab="orders"
      pageTitle="Shop Orders & Order Fulfillment"
      pageSubtitle="Track COD & online orders, dispatch courier packages, update payment status, and print invoices"
    >
      <div className="space-y-6">
        {/* ================= CONTROLS & SEARCH ================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID (e.g. NHC-ORD-9281), Customer Name, or Mobile..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Payment Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending_on_delivery">Pending on COD</option>
              </select>
            </div>
          </div>

          {/* Section 9: 9 Standard Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {(
              [
                { id: 'all', label: 'All Orders' },
                { id: 'placed', label: 'Order Placed' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'processing', label: 'Processing' },
                { id: 'packed', label: 'Packed' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'out_for_delivery', label: 'Out for Delivery' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'cancelled', label: 'Cancelled' },
                { id: 'refunded', label: 'Refunded' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= ORDER TABLE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items / Qty</th>
                  <th className="py-3.5 px-4">Subtotal</th>
                  <th className="py-3.5 px-4">Shipping</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No matching order records found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{order.customer.fullName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{order.customer.phone}</td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold">{order.items.length} item(s)</span>
                          <span className="text-[10px] text-slate-400 block">Qty: {totalQty}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">₹{order.subtotal}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {order.shippingFee === 0 ? (
                            <span className="text-emerald-600 font-semibold">Free</span>
                          ) : (
                            `₹${order.shippingFee}`
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹{order.total}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {order.paymentMethod.toUpperCase()} •{' '}
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending COD'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="placed">Order Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            title="View Full Order Details"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setInvoiceModalOrder(order)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer"
                            title="Print Product Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
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

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-[#001428] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-mono font-bold">{selectedOrder.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 uppercase">
                    {selectedOrder.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1">Order Fulfillment Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Quick Actions (Print & WhatsApp) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setInvoiceModalOrder(selectedOrder)}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice / Slip</span>
                </button>
                <a
                  href={getWhatsAppOrderLink(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Updates</span>
                </a>
              </div>

              {/* Status Switcher & Payment Status */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Order Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="placed">Order Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Payment Status:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'paid')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        selectedOrder.paymentStatus === 'paid'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'pending_on_delivery')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        selectedOrder.paymentStatus === 'pending_on_delivery'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}
                    >
                      Pending COD
                    </button>
                  </div>
                </div>
              </div>

              {/* Courier Fulfillment Section */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-700" />
                    <span>Courier & Dispatch Tracking (Optional)</span>
                  </h4>
                  {(selectedOrder as any).trackingNumber && (
                    <span className="font-mono text-[10px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-bold">
                      {(selectedOrder as any).trackingNumber}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveCourier} className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Courier Partner
                      </label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="e.g. Delhivery, Blue Dart, DTDC, Local Delivery"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        AWB / Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. LKO-TRK-78921"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                  {courierNotice && (
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{courierNotice}</span>
                    </div>
                  )}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer text-xs"
                    >
                      Save Courier Information
                    </button>
                  </div>
                </form>
              </div>

              {/* Items Purchased List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1">
                  Ordered Products ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ₹{item.price} &times; {item.quantity} unit{item.quantity === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t">
                    <span>Total Amount</span>
                    <span className="text-emerald-700">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Address */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1">Delivery Destination</h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-700">
                  <p className="font-bold text-slate-900">{selectedOrder.customer.fullName}</p>
                  <p className="font-mono text-slate-600">Phone: {selectedOrder.customer.phone}</p>
                  {selectedOrder.customer.email && <p>Email: {selectedOrder.customer.email}</p>}
                  <div className="pt-1 text-slate-600 leading-relaxed">
                    <p>{selectedOrder.address.addressLine1}</p>
                    {selectedOrder.address.addressLine2 && <p>{selectedOrder.address.addressLine2}</p>}
                    {selectedOrder.address.landmark && <p>Landmark: {selectedOrder.address.landmark}</p>}
                    <p>
                      {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                    </p>
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px]">
                      <strong>Customer Order Note:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Cancel Button */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="pt-2 border-t">
                  {confirmCancelOrder ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                      <p className="text-red-900 font-semibold text-xs">
                        Are you sure you want to cancel Order {selectedOrder.id}?
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmCancelOrder(false)}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium cursor-pointer"
                        >
                          No, Keep Order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleCancelOrder(selectedOrder.id);
                            setConfirmCancelOrder(false);
                          }}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                        >
                          Yes, Cancel Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmCancelOrder(true)}
                      className="w-full py-2 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 transition-colors cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: INVOICE / PACKING SLIP MODAL ================= */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-[#001428] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Product Invoice & Packing Slip</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setInvoiceModalOrder(null)}
                  className="text-slate-300 hover:text-white text-base font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Invoice Area - Conforms strictly to Section 3:
                - Navin Homeo Care
                - Order ID
                - Customer Details
                - Product Details
                - Quantity
                - Price
                - Shipping
                - Discount
                - Total
                - Payment Method
                - Clean Product Invoice conforming strictly to Section 3 (no unverified claims or seals)
            */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans">
              {/* Clinic Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#001428] tracking-tight">
                    NAVIN HOMEO CARE
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Health & Wellness Products • Clinic: Alambagh, Lucknow
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                    Shop No. 4, Ground Floor, Near Phoenix United Mall, Kanpur Road, Alambagh, Lucknow - 226005
                    <br />
                    Helpline: {CLINIC_CONFIG.phone} • Email: {clinicSettings.email}
                  </p>
                  {/* Optional verified fields only if configured */}
                  {clinicSettings.gstNumber && (
                    <p className="text-[10px] text-slate-500 mt-0.5">GSTIN: {clinicSettings.gstNumber}</p>
                  )}
                  {clinicSettings.drugLicenseNumber && (
                    <p className="text-[10px] text-slate-500 mt-0.5">License: {clinicSettings.drugLicenseNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded bg-slate-100 font-mono font-bold text-sm text-slate-900 border">
                    PRODUCT INVOICE
                  </span>
                  <p className="font-mono text-xs text-slate-600 mt-1">Order ID: {invoiceModalOrder.id}</p>
                  <p className="text-[11px] text-slate-500">
                    Date: {new Date(invoiceModalOrder.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Customer Details & Delivery Address
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{invoiceModalOrder.customer.fullName}</p>
                  <p className="font-mono text-slate-700 mt-0.5">{invoiceModalOrder.customer.phone}</p>
                  <div className="text-slate-600 mt-1 leading-relaxed">
                    <p>{invoiceModalOrder.address.addressLine1}</p>
                    {invoiceModalOrder.address.addressLine2 && <p>{invoiceModalOrder.address.addressLine2}</p>}
                    {invoiceModalOrder.address.landmark && <p>Landmark: {invoiceModalOrder.address.landmark}</p>}
                    <p className="font-semibold text-slate-800">
                      {invoiceModalOrder.address.city}, {invoiceModalOrder.address.state} -{' '}
                      {invoiceModalOrder.address.pincode}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Payment Particulars
                  </span>
                  <p>
                    <strong className="text-slate-700">Payment Method:</strong>{' '}
                    <span className="font-bold uppercase text-slate-900">{invoiceModalOrder.paymentMethod}</span>
                  </p>
                  <p>
                    <strong className="text-slate-700">Payment Status:</strong>{' '}
                    <span className="font-bold text-emerald-800 uppercase">
                      {invoiceModalOrder.paymentStatus.replace('_', ' ')}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-700">Fulfillment Status:</strong>{' '}
                    <span className="font-bold text-blue-800 uppercase">{invoiceModalOrder.status.replace('_', ' ')}</span>
                  </p>
                  <p>
                    <strong className="text-slate-700">Estimated Delivery:</strong>{' '}
                    <span>{invoiceModalOrder.estimatedDelivery}</span>
                  </p>
                </div>
              </div>

              {/* Product Details Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px] font-bold uppercase text-slate-700">
                    <th className="py-2">Product Details</th>
                    <th className="py-2 text-center">Unit Price</th>
                    <th className="py-2 text-center">Quantity</th>
                    <th className="py-2 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoiceModalOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] text-slate-500">Category: {item.category}</p>
                      </td>
                      <td className="py-2.5 text-center">₹{item.price}</td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        ₹{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-300">
                    <td colSpan={3} className="py-2 text-right font-semibold text-slate-600">
                      Subtotal:
                    </td>
                    <td className="py-2 text-right font-bold text-slate-800">₹{invoiceModalOrder.subtotal}</td>
                  </tr>
                  {invoiceModalOrder.discount > 0 && (
                    <tr>
                      <td colSpan={3} className="py-1 text-right font-semibold text-emerald-700">
                        Discount:
                      </td>
                      <td className="py-1 text-right font-bold text-emerald-700">-₹{invoiceModalOrder.discount}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="py-1 text-right font-semibold text-slate-600">
                      Shipping:
                    </td>
                    <td className="py-1 text-right font-bold text-slate-800">
                      {invoiceModalOrder.shippingFee === 0 ? 'FREE' : `₹${invoiceModalOrder.shippingFee}`}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 text-sm">
                    <td colSpan={3} className="py-2 text-right font-black text-slate-900">
                      Total:
                    </td>
                    <td className="py-2 text-right font-black text-emerald-800">₹{invoiceModalOrder.total}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures & Notes (Zero unverified claims) */}
              <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Important Information:</p>
                  <p>1. Store products in a cool, dry location away from direct sunlight.</p>
                  <p>2. For order inquiries or customer assistance, contact: {CLINIC_CONFIG.phone}.</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1" />
                  <p className="font-bold text-slate-800">Order Fulfillment</p>
                  <p className="text-[10px]">Navin Homeo Care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
