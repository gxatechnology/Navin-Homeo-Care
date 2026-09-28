import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter } from '../context/RouterContext';
import {
  adminDataService,
  AdminAppointment,
  AppointmentSource,
} from '../services/adminDataService';
import { Order } from '../services/orderService';
import { ProductItem, ProductCategory, PRODUCT_CATEGORIES } from '../config/productsData';
import {
  Calendar,
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Plus,
  ArrowRight,
  FileText,
  AlertCircle,
  Tag,
  Percent,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [revenueRange, setRevenueRange] = useState<'7d' | '30d' | '3m'>('30d');

  // Quick Action Modals
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState('');
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Stock Added');

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('HEALTH10');
  const [couponDiscount, setCouponDiscount] = useState('10%');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [apptForm, setApptForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM - 11:30 AM',
    patientType: 'new' as 'new' | 'existing',
    healthConcern: '',
    source: 'Admin Entry' as AppointmentSource,
    symptomsNote: '',
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
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
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setAppointments(adminDataService.getAppointments());
    };
    window.addEventListener('nhc_appointments_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nhc_appointments_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setAppointments(adminDataService.getAppointments());
    setOrders(adminDataService.getOrders());
    setProducts(adminDataService.getProducts());

    adminDataService.fetchAppointmentsFromApi().then((fresh) => {
      if (fresh) setAppointments(fresh);
    });
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const kpis = useMemo(() => adminDataService.getDashboardKPIs(), [appointments, orders, products]);

  // Valid non-cancelled orders for accurate revenue
  const validOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled' && (o.status as any) !== 'refunded');
  }, [orders]);

  // Upcoming appointments (today & future)
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.preferredDate >= todayStr && a.status !== 'cancelled')
      .sort((a, b) => a.preferredDate.localeCompare(b.preferredDate))
      .slice(0, 5);
  }, [appointments, todayStr]);

  // Latest orders
  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // 1. Revenue Chart
  const revenueChartData = useMemo(() => {
    const days = revenueRange === '7d' ? 7 : revenueRange === '30d' ? 30 : 90;
    const buckets: { label: string; date: string; amount: number }[] = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: days > 30 ? 'narrow' : 'short',
      });
      buckets.push({ label, date: dStr, amount: 0 });
    }

    validOrders.forEach((o) => {
      const orderDate = o.createdAt.split('T')[0];
      const match = buckets.find((b) => b.date === orderDate);
      if (match) {
        match.amount += o.total;
      }
    });

    if (days >= 30) {
      const step = days === 30 ? 3 : 7;
      const grouped: { label: string; amount: number }[] = [];
      for (let i = 0; i < buckets.length; i += step) {
        const slice = buckets.slice(i, i + step);
        const sum = slice.reduce((acc, curr) => acc + curr.amount, 0);
        grouped.push({ label: slice[0].label, amount: sum });
      }
      return grouped;
    }

    return buckets.map((b) => ({ label: b.label, amount: b.amount }));
  }, [validOrders, revenueRange]);

  const maxRevenue = useMemo(() => {
    return Math.max(...revenueChartData.map((d) => d.amount), 500);
  }, [revenueChartData]);

  // 2. Orders Volume Chart
  const ordersVolumeData = useMemo(() => {
    const days = 7;
    const now = new Date();
    const buckets: { label: string; date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      buckets.push({ label, date: dStr, count: 0 });
    }

    orders.forEach((o) => {
      const dStr = o.createdAt.split('T')[0];
      const match = buckets.find((b) => b.date === dStr);
      if (match) {
        match.count += 1;
      }
    });

    return buckets;
  }, [orders]);

  const maxOrders = useMemo(() => {
    return Math.max(...ordersVolumeData.map((d) => d.count), 4);
  }, [ordersVolumeData]);

  // 3. Appointment Trends
  const appointmentTrendsData = useMemo(() => {
    const days = 7;
    const now = new Date();
    const buckets: { label: string; date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      buckets.push({ label, date: dStr, count: 0 });
    }

    appointments.forEach((a) => {
      const match = buckets.find((b) => b.date === a.preferredDate);
      if (match) {
        match.count += 1;
      }
    });

    return buckets;
  }, [appointments]);

  const maxAppointments = useMemo(() => {
    return Math.max(...appointmentTrendsData.map((d) => d.count), 4);
  }, [appointmentTrendsData]);

  // 4. Top Selling Products
  const topSellingProducts = useMemo(() => {
    const map = new Map<string, { product: string; units: number; revenue: number; image: string }>();

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!map.has(item.id)) {
          map.set(item.id, {
            product: item.name,
            units: 0,
            revenue: 0,
            image: item.image,
          });
        }
        const record = map.get(item.id)!;
        record.units += item.quantity;
        record.revenue += item.price * item.quantity;
      });
    });

    const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
    if (list.length === 0) {
      return products.slice(0, 4).map((p) => ({
        product: p.name,
        units: 0,
        revenue: 0,
        image: p.image,
      }));
    }
    return list.slice(0, 4);
  }, [validOrders, products]);

  // Handle Quick Stock Update
  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockProduct) return;
    adminDataService.updateProductStock(selectedStockProduct, Number(newStockQty), stockReason);
    loadData();
    setShowStockModal(false);
  };

  // Handle Quick Appointment Create
  const handleSaveAppt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptForm.fullName.trim() || !apptForm.phone.trim()) return;

    adminDataService.createAppointment({
      fullName: apptForm.fullName,
      phone: apptForm.phone,
      email: apptForm.email,
      preferredDate: apptForm.date,
      preferredTime: apptForm.time,
      patientType: apptForm.patientType,
      healthConcern: apptForm.healthConcern || 'General Health Consultation',
      source: apptForm.source,
      status: 'confirmed',
      symptomsNote: apptForm.symptomsNote,
    });

    loadData();
    setShowAppointmentModal(false);
    setApptForm({
      fullName: '',
      phone: '',
      email: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM - 11:30 AM',
      patientType: 'new',
      healthConcern: '',
      source: 'Admin Entry',
      symptomsNote: '',
    });
  };

  // Handle Quick Order Create
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (!orderForm.customerName.trim()) {
      setOrderError('Customer name is required.');
      return;
    }
    if (!orderForm.phone.trim() || orderForm.phone.replace(/\D/g, '').length < 10) {
      setOrderError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!orderForm.productId) {
      setOrderError('Please select a product.');
      return;
    }

    const res = adminDataService.createManualOrder({
      customer: {
        fullName: orderForm.customerName,
        phone: orderForm.phone,
        email: orderForm.email,
      },
      address: {
        addressLine1: orderForm.addressLine1 || 'Direct Shop Counter Pickup',
        city: orderForm.city,
        state: orderForm.state,
        pincode: orderForm.pincode,
      },
      items: [{ productId: orderForm.productId, quantity: Number(orderForm.quantity) || 1 }],
      source: orderForm.source,
      notes: orderForm.notes,
      paymentMethod: 'cod',
    });

    if (!res.success) {
      setOrderError(res.error || 'Failed to create order.');
      return;
    }

    loadData();
    setShowOrderModal(false);
    setOrderForm({
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
  };

  return (
    <AdminLayout
      activeTab="dashboard"
      pageTitle="Clinical & Store Overview"
      pageSubtitle={`Real-time operations for ${todayStr} • Navin Homeo Care`}
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* ================= SECTION 16: ABOVE THE FOLD PRIORITY CARDS ================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Today's Critical Operations</span>
            </h3>
            <span className="text-[11px] text-slate-500">Live Clinical & Store Metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Today's Appointments */}
            <div
              onClick={() => navigate('/admin/calendar')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">Today's Appointments</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpis.appointmentsToday}</div>
              <p className="text-[11px] text-blue-600 font-medium mt-1">Scheduled for OPD today</p>
            </div>

            {/* 2. Pending Appointment Requests */}
            <div
              onClick={() => navigate('/admin/appointments')}
              className={`p-4 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
                kpis.pendingAppointments > 0
                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">Pending Requests</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-900">{kpis.pendingAppointments}</div>
              <p className="text-[11px] text-amber-700 font-medium mt-1">Require confirmation</p>
            </div>

            {/* 3. Today's Orders */}
            <div
              onClick={() => navigate('/admin/orders')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">Today's Orders</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpis.ordersToday}</div>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">Orders placed today</p>
            </div>

            {/* 4. Today's Net Revenue */}
            <div
              onClick={() => navigate('/admin/reports')}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">Today's Net Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                ₹{kpis.todayRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Excludes cancelled orders</p>
            </div>

            {/* 5. Low Stock Alerts */}
            <div
              onClick={() => navigate('/admin/products')}
              className={`p-4 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
                kpis.lowStockProducts > 0
                  ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold text-slate-600">Low Stock Alerts</span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    kpis.lowStockProducts > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">{kpis.lowStockProducts}</div>
              <p className="text-[11px] text-red-600 font-medium mt-1">Items &le; safety threshold</p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 6: DASHBOARD QUICK ACTIONS ================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Actions
            </h4>
            <span className="text-[11px] text-slate-400">One-click administrative workflows</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Add Product */}
            <button
              onClick={() => navigate('/admin/products')}
              className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Add Product</span>
                <span className="text-[10px] text-slate-400">Catalog item</span>
              </div>
            </button>

            {/* 2. View Today's Appointments */}
            <button
              onClick={() => navigate('/admin/calendar')}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Today's Appts</span>
                <span className="text-[10px] text-slate-400">OPD calendar</span>
              </div>
            </button>

            {/* 3. View New Orders */}
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">View Orders</span>
                <span className="text-[10px] text-slate-400">Fulfillment queue</span>
              </div>
            </button>

            {/* 4. Update Stock */}
            <button
              onClick={() => setShowStockModal(true)}
              className="p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Update Stock</span>
                <span className="text-[10px] text-slate-400">Inventory adjustment</span>
              </div>
            </button>

            {/* 5. Add Coupon */}
            <button
              onClick={() => setShowCouponModal(true)}
              className="p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Add Coupon</span>
                <span className="text-[10px] text-slate-400">Promo discount</span>
              </div>
            </button>

            {/* 6. Open Reports */}
            <button
              onClick={() => navigate('/admin/reports')}
              className="p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Open Reports</span>
                <span className="text-[10px] text-slate-400">Export & analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* ================= SECTION 16: SECOND SECTION: UPCOMING APPOINTMENTS & LATEST ORDERS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Consultations */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Upcoming Consultations</span>
                </h4>
                <button
                  onClick={() => navigate('/admin/calendar')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Calendar ({appointments.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {upcomingAppointments.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No upcoming consultations scheduled.
                  </p>
                ) : (
                  upcomingAppointments.map((a) => (
                    <div
                      key={a.bookingReference}
                      onClick={() => navigate(`/admin/appointments/${a.bookingReference}`)}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{a.fullName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {a.preferredDate} ({a.preferredTime}) • {a.source || 'Website'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            a.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : a.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{a.bookingReference}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Latest Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Latest Shop Orders</span>
                </h4>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Orders ({orders.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {latestOrders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No orders logged yet.</p>
                ) : (
                  latestOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{o.customer.fullName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {o.items.length} item{o.items.length === 1 ? '' : 's'} • {o.source || 'Website Shop'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">₹{o.total}</p>
                        <span className="inline-block mt-0.5 text-[10px] text-emerald-600 font-semibold uppercase">
                          {o.paymentMethod.toUpperCase()} • {o.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 16: THIRD SECTION: REVENUE, ORDERS, APPOINTMENT TRENDS, TOP PRODUCTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Revenue Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Revenue Chart</h4>
                <p className="text-xs text-slate-500 mt-0.5">Calculated strictly from non-cancelled orders</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
                {(['7d', '30d', '3m'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRevenueRange(r)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      revenueRange === r
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-6">
              <div className="h-40 flex items-end gap-2 sm:gap-3 justify-between px-2">
                {revenueChartData.map((d, i) => {
                  const heightPercent =
                    maxRevenue > 0 ? Math.max(10, Math.round((d.amount / maxRevenue) * 100)) : 10;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                        ₹{d.amount}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                          d.amount > 0 ? 'bg-emerald-600 group-hover:bg-emerald-500' : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 truncate max-w-[34px]">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Lifetime Net Revenue:</span>
              <span className="font-bold text-slate-900">₹{kpis.lifetimeStoreRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* 2. Orders Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Orders Chart (Last 7 Days)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Daily volume of placed orders</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {kpis.ordersThisMonth} this month
              </span>
            </div>

            <div className="py-6">
              <div className="h-40 flex items-end gap-3 justify-between px-2">
                {ordersVolumeData.map((d, i) => {
                  const heightPercent =
                    maxOrders > 0 ? Math.max(12, Math.round((d.count / maxOrders) * 100)) : 12;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {d.count}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                          d.count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Orders to date:</span>
              <span className="font-bold text-slate-900">{kpis.totalOrders}</span>
            </div>
          </div>

          {/* 3. Appointment Trends */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Appointment Trends (7 Days)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Patient consultations by scheduled day</p>
              </div>
              <button
                onClick={() => navigate('/admin/calendar')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="py-6">
              <div className="h-40 flex items-end gap-3 justify-between px-2">
                {appointmentTrendsData.map((d, i) => {
                  const heightPercent =
                    maxAppointments > 0
                      ? Math.max(12, Math.round((d.count / maxAppointments) * 100))
                      : 12;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {d.count}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-t-lg transition-all ${
                          d.count > 0 ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>This Month's Appts:</span>
              <span className="font-bold text-slate-900">{kpis.appointmentsThisMonth}</span>
            </div>
          </div>

          {/* 4. Top Selling Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Top Selling Products</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Ranked by actual sales revenue</p>
                </div>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Inventory</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 py-1">
                {topSellingProducts.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.product}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.product}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {p.units} unit{p.units === 1 ? '' : 's'} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">₹{p.revenue}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">#{idx + 1} Best Seller</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Units Sold:</span>
              <span className="font-bold text-slate-900">{kpis.productsSold} units</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= QUICK ACTION MODAL: UPDATE STOCK ================= */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStock}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Quick Stock Adjustment</h3>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={selectedStockProduct}
                  onChange={(e) => {
                    setSelectedStockProduct(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) setNewStockQty(prod.stockQuantity);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  New Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Stock Added">Stock Added (Restock)</option>
                  <option value="Manual Adjustment">Manual Adjustment (Physical Audit)</option>
                  <option value="Order">Order Fulfillment</option>
                  <option value="Cancellation">Order Cancellation</option>
                  <option value="Return">Customer Return</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs"
              >
                Update Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= QUICK ACTION MODAL: ADD COUPON ================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add / Configure Coupon Code</h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {couponSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold text-sm">Coupon "{couponCode}" Active!</p>
                <p className="text-[11px] text-emerald-700">
                  Customers can now apply this coupon code during online shop checkout.
                </p>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10, CLINIC50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Discount Amount or Percentage *
                  </label>
                  <input
                    type="text"
                    value={couponDiscount}
                    onChange={(e) => setCouponDiscount(e.target.value)}
                    placeholder="e.g. 10% or ₹50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponSuccess(true)}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs"
                  >
                    Save Coupon
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= QUICK ACTION MODAL: ADD APPOINTMENT ================= */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveAppt}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Add Manual Appointment</h3>
              <button
                type="button"
                onClick={() => setShowAppointmentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Patient Name"
                  value={apptForm.fullName}
                  onChange={(e) => setApptForm({ ...apptForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={apptForm.phone}
                  onChange={(e) => setApptForm({ ...apptForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={apptForm.date}
                  onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Time Slot *</label>
                <select
                  value={apptForm.time}
                  onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning OPD)</option>
                  <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM (Morning OPD)</option>
                  <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM (Evening OPD)</option>
                  <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM (Evening OPD)</option>
                  <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM (Evening OPD)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Patient Type</label>
                <select
                  value={apptForm.patientType}
                  onChange={(e) =>
                    setApptForm({ ...apptForm, patientType: e.target.value as 'new' | 'existing' })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="new">New Patient</option>
                  <option value="existing">Existing Patient</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Source *</label>
                <select
                  value={apptForm.source}
                  onChange={(e) =>
                    setApptForm({ ...apptForm, source: e.target.value as AppointmentSource })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Admin Entry">Admin Entry</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Health Concern *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skin Allergy, Back Pain, Sinusitis"
                  value={apptForm.healthConcern}
                  onChange={(e) => setApptForm({ ...apptForm, healthConcern: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Internal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Staff note..."
                  value={apptForm.symptomsNote}
                  onChange={(e) => setApptForm({ ...apptForm, symptomsNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAppointmentModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= QUICK ACTION MODAL: ADD ORDER ================= */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveOrder}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Create Manual Order</h3>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {orderError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Select Product *
                </label>
                <select
                  required
                  value={orderForm.productId}
                  onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                      {p.name} (₹{p.price} | Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={orderForm.quantity}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Order Source *</label>
                <select
                  value={orderForm.source}
                  onChange={(e) => setOrderForm({ ...orderForm, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Admin-created Order">Admin-created Order</option>
                  <option value="Phone">Phone Order</option>
                  <option value="WhatsApp">WhatsApp Order</option>
                  <option value="Walk-in">Walk-in Counter</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={orderForm.city}
                  onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Address Line
                </label>
                <input
                  type="text"
                  placeholder="Street / Area / Counter Delivery"
                  value={orderForm.addressLine1}
                  onChange={(e) => setOrderForm({ ...orderForm, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};
