import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../context/RouterContext';
import { adminAuthService, AdminUser } from '../services/adminAuthService';
import {
  adminDataService,
  AdminNotification,
  NotificationType,
  AdminAppointment,
  CustomerSummary,
} from '../services/adminDataService';
import { Order } from '../services/orderService';
import { ProductItem } from '../config/productsData';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  FileBarChart2,
  Check,
  CheckCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab:
    | 'dashboard'
    | 'calendar'
    | 'appointments'
    | 'orders'
    | 'reports'
    | 'products'
    | 'customers'
    | 'enquiries'
    | 'reviews'
    | 'settings';
  pageTitle: string;
  pageSubtitle?: string;
  headerAction?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  pageTitle,
  pageSubtitle,
  headerAction,
}) => {
  const { navigate } = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Data cache for search
  const [searchAppointments, setSearchAppointments] = useState<AdminAppointment[]>([]);
  const [searchOrders, setSearchOrders] = useState<Order[]>([]);
  const [searchProducts, setSearchProducts] = useState<ProductItem[]>([]);
  const [searchCustomers, setSearchCustomers] = useState<CustomerSummary[]>([]);

  // Badge counts
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    // Check authentication
    if (!adminAuthService.isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    setUser(adminAuthService.getCurrentUser());
    refreshNotifications();
    loadSearchData();
  }, [navigate]);

  const refreshNotifications = () => {
    try {
      const notifs = adminDataService.getNotifications();
      setNotifications(notifs);

      const appts = adminDataService.getAppointments();
      setPendingAppointmentsCount(appts.filter((a) => a.status === 'requested').length);

      const orders = adminDataService.getOrders();
      setNewOrdersCount(
        orders.filter((o) => o.status === 'confirmed' || (o.status as any) === 'placed').length
      );

      const prods = adminDataService.getProducts();
      const threshold = adminDataService.getSettings().lowStockThreshold || 10;
      setLowStockCount(prods.filter((p) => p.stockQuantity <= threshold).length);
    } catch {
      // ignore
    }
  };

  const loadSearchData = () => {
    try {
      setSearchAppointments(adminDataService.getAppointments());
      setSearchOrders(adminDataService.getOrders());
      setSearchProducts(adminDataService.getProducts());
      setSearchCustomers(adminDataService.getCustomers());
    } catch {
      // ignore
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login');
  };

  const handleMarkNotificationRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    adminDataService.markNotificationRead(id);
    refreshNotifications();
  };

  const handleMarkAllRead = () => {
    adminDataService.markAllNotificationsRead();
    refreshNotifications();
  };

  const handleOpenNotification = (notif: AdminNotification) => {
    adminDataService.markNotificationRead(notif.id);
    refreshNotifications();
    setNotificationsOpen(false);
    navigate(notif.targetPath);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Search Results filtering
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return null;

    const matchedAppts = searchAppointments.filter(
      (a) =>
        a.bookingReference.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.phone.includes(q)
    ).slice(0, 4);

    const matchedOrders = searchOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
    ).slice(0, 4);

    const matchedProducts = searchProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedCustomers = searchCustomers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q)
    ).slice(0, 4);

    const totalCount =
      matchedAppts.length +
      matchedOrders.length +
      matchedProducts.length +
      matchedCustomers.length;

    return {
      totalCount,
      appointments: matchedAppts,
      orders: matchedOrders,
      products: matchedProducts,
      customers: matchedCustomers,
    };
  }, [searchQuery, searchAppointments, searchOrders, searchProducts, searchCustomers]);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      badge: null,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
      path: '/admin/calendar',
      badge: null,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar,
      path: '/admin/appointments',
      badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'orders',
      label: 'Shop Orders',
      icon: ShoppingBag,
      path: '/admin/orders',
      badge: newOrdersCount > 0 ? newOrdersCount : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: FileBarChart2,
      path: '/admin/reports',
      badge: null,
    },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Package,
      path: '/admin/products',
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'customers',
      label: 'Patients & Customers',
      icon: Users,
      path: '/admin/customers',
      badge: null,
    },
    {
      id: 'enquiries',
      label: 'OPD Enquiries',
      icon: MessageSquare,
      path: '/admin/enquiries',
      badge: null,
    },
    {
      id: 'reviews',
      label: 'Reviews & Content',
      icon: Star,
      path: '/admin/reviews',
      badge: null,
    },
    {
      id: 'settings',
      label: 'Clinic Settings',
      icon: Settings,
      path: '/admin/settings',
      badge: null,
    },
  ];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'appointment_cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'order_cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'out_of_stock':
        return <Package className="w-4 h-4 text-red-600" />;
      case 'refund_processed':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-800 selection:bg-emerald-200">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#001428] text-white shrink-0 border-r border-slate-800 shadow-xl">
        {/* Brand / Clinic Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md shrink-0 border border-emerald-500/20">
              <img
                src="/admin-logo.png"
                alt="Navin Homeo Care Admin Logo"
                className="w-full h-full object-contain p-0.5"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-snug">
                Navin Homeo Care
              </h1>
              <p className="text-[11px] font-medium text-emerald-400 tracking-wider uppercase">
                Admin Control Center
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Dr. Navin Maurya Clinic OPD</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Clinic & Store Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#001020]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-700">
              AD
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email || 'navin@navinhomeocare.com'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
              title="Open public website"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Public Site</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-200 text-[11px] font-medium transition-colors cursor-pointer border border-red-900/30"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <header className="lg:hidden bg-[#001428] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 border border-emerald-500/20">
            <img
              src="/admin-logo.png"
              alt="Navin Homeo Care Admin Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <span className="text-sm font-bold block leading-none">Navin Homeo Care</span>
            <span className="text-[10px] text-emerald-400 font-medium">Admin Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-white cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-72 bg-[#001428] text-white h-full flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-sm">Admin Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-300"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Live Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-900/60 text-xs font-medium text-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Bar with Global Search & Notification Center */}
        <div className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200 shadow-xs gap-6">
          <div className="shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
              <span>Admin Portal</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-medium capitalize">{activeTab}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h2>
            {pageSubtitle && <p className="text-xs text-slate-500 mt-0.5">{pageSubtitle}</p>}
          </div>

          {/* ================= SECTION 13: GLOBAL ADMIN SEARCH ================= */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Appointment ID, Order ID, Patient, Phone, SKU..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Global Search Results Dropdown */}
            {searchFocused && searchResults && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-y-auto p-3 text-xs divide-y divide-slate-100">
                <div className="pb-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
                  <span>Found {searchResults.totalCount} results</span>
                  <span className="text-slate-400">Click to open record</span>
                </div>

                {searchResults.totalCount === 0 && (
                  <p className="py-6 text-center text-slate-400">
                    No matching records found for "{searchQuery}".
                  </p>
                )}

                {/* Appointments Match */}
                {searchResults.appointments.length > 0 && (
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider px-2 block">
                      Appointments
                    </span>
                    {searchResults.appointments.map((a) => (
                      <div
                        key={a.bookingReference}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate(`/admin/appointments/${a.bookingReference}`);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{a.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {a.bookingReference} • {a.phone} • {a.preferredDate}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orders Match */}
                {searchResults.orders.length > 0 && (
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider px-2 block">
                      Shop Orders
                    </span>
                    {searchResults.orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate(`/admin/orders/${o.id}`);
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{o.customer.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {o.id} • {o.customer.phone} • ₹{o.total}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase">
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products Match */}
                {searchResults.products.length > 0 && (
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider px-2 block">
                      Products & SKU
                    </span>
                    {searchResults.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate('/admin/products');
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">₹{p.price}</span>
                          <span className="text-[10px] text-slate-500">
                            {p.stockQuantity} in stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customers Match */}
                {searchResults.customers.length > 0 && (
                  <div className="py-2 space-y-1">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider px-2 block">
                      Patients / Customers
                    </span>
                    {searchResults.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSearchFocused(false);
                          setSearchQuery('');
                          navigate('/admin/customers');
                        }}
                        className="p-2 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{c.fullName}</p>
                          <p className="text-[11px] text-slate-500">{c.phone}</p>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {c.totalOrders} orders • {c.totalAppointments} appts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {headerAction}

            {/* Quick Link to Clinic Site */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Live Website</span>
            </button>

            {/* ================= SECTION 5: NOTIFICATION CENTER ================= */}
            <div className="relative">
              <button
                onClick={() => {
                  refreshNotifications();
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Notification Center"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 text-xs divide-y divide-slate-100">
                  <div className="flex items-center justify-between pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="py-2 max-h-80 overflow-y-auto space-y-1.5 divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-slate-400">No notifications.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleOpenNotification(notif)}
                          className={`p-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                            notif.read ? 'hover:bg-slate-50 opacity-80' : 'bg-emerald-50/40 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-white shadow-2xs border border-slate-100 shrink-0 mt-0.5">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-900 text-xs truncate">
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkNotificationRead(notif.id, e)}
                                  className="text-[10px] text-emerald-600 hover:text-emerald-800 font-semibold"
                                  title="Mark as read"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(notif.timestamp).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2.5 text-center">
                    <span className="text-[10px] text-slate-400">
                      Notifications track appointments, shop orders, stock changes, and cancellations.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Administrator Status Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                DR
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-800 block leading-tight">Admin Desk</span>
                <span className="text-[10px] text-slate-400">Dr. Navin Maurya Clinic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>

        {/* In-App Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Sign Out of Admin Portal?</h3>
              <p className="text-slate-600 leading-relaxed">
                Are you sure you want to end your administrator session? You will be redirected to the admin login page.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
