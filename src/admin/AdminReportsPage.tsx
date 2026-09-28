import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter } from '../context/RouterContext';
import {
  adminDataService,
  AdminAppointment,
  InventoryLogEntry,
  CustomerSummary,
} from '../services/adminDataService';
import { Order } from '../services/orderService';
import { ProductItem } from '../config/productsData';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Filter,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

type ReportTab =
  | 'appointments'
  | 'orders'
  | 'revenue'
  | 'products_sold'
  | 'inventory'
  | 'customers';

type DateFilter =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'custom';

export const AdminReportsPage: React.FC = () => {
  const { navigate } = useRouter();

  const [activeReport, setActiveReport] = useState<ReportTab>('revenue');
  const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogEntry[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(adminDataService.getAppointments());
    setOrders(adminDataService.getOrders());
    setProducts(adminDataService.getProducts());
    setInventoryLogs(adminDataService.getInventoryLogs());
    setCustomers(adminDataService.getCustomers());
  };

  // Helper date boundaries
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (dateFilter === 'today') {
      return { start: todayStr, end: todayStr, label: 'Today' };
    }
    if (dateFilter === 'yesterday') {
      const y = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      return { start: y, end: y, label: 'Yesterday' };
    }
    if (dateFilter === '7d') {
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      return { start: d7, end: todayStr, label: 'Last 7 Days' };
    }
    if (dateFilter === '30d') {
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
      return { start: d30, end: todayStr, label: 'Last 30 Days' };
    }
    if (dateFilter === 'this_month') {
      const startOfMonth = `${todayStr.substring(0, 7)}-01`;
      return { start: startOfMonth, end: todayStr, label: 'This Month' };
    }
    if (dateFilter === 'last_month') {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfLast = prevMonth.toISOString().split('T')[0];
      const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { start: startOfLast, end: endOfLast, label: 'Last Month' };
    }
    if (dateFilter === 'custom') {
      return {
        start: customStart || todayStr,
        end: customEnd || todayStr,
        label: `Custom (${customStart || 'Start'} to ${customEnd || 'End'})`,
      };
    }
    return { start: '1970-01-01', end: todayStr, label: 'All Time' };
  }, [dateFilter, customStart, customEnd]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = a.preferredDate;
      return d >= dateRangeBounds.start && d <= dateRangeBounds.end;
    });
  }, [appointments, dateRangeBounds]);

  // Filtered Orders (all status including cancelled for order audit, but revenue excludes cancelled)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const d = o.createdAt.split('T')[0];
      return d >= dateRangeBounds.start && d <= dateRangeBounds.end;
    });
  }, [orders, dateRangeBounds]);

  // Revenue Breakdown strictly calculated from non-cancelled orders
  const revenueBreakdown = useMemo(() => {
    return adminDataService.getRevenueBreakdown(
      orders,
      dateFilter,
      dateRangeBounds.start,
      dateRangeBounds.end
    );
  }, [orders, dateFilter, dateRangeBounds]);

  // Customer Analytics (Safe: Zero sensitive medical details)
  const customerAnalytics = useMemo(() => {
    return adminDataService.getCustomerAnalytics(
      dateFilter,
      dateRangeBounds.start,
      dateRangeBounds.end
    );
  }, [dateFilter, dateRangeBounds]);

  // Products Sold Breakdown
  const productsSoldBreakdown = useMemo(() => {
    // Only from non-cancelled, non-refunded orders
    const validOrders = filteredOrders.filter(
      (o) => o.status !== 'cancelled' && (o.status as any) !== 'refunded'
    );
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        unitsSold: number;
        revenue: number;
        costPrice?: number;
      }
    >();

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!map.has(item.id)) {
          const productRef = products.find((p) => p.id === item.id);
          map.set(item.id, {
            id: item.id,
            name: item.name,
            category: item.category,
            unitsSold: 0,
            revenue: 0,
            costPrice: productRef?.costPrice,
          });
        }
        const record = map.get(item.id)!;
        record.unitsSold += item.quantity;
        record.revenue += item.price * item.quantity;
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, products]);

  // Inventory Report
  const inventoryReport = useMemo(() => {
    const settings = adminDataService.getSettings();
    const threshold = settings.lowStockThreshold || 10;

    return products.map((p) => {
      // Find units sold from valid orders in period
      const validOrders = filteredOrders.filter((o) => o.status !== 'cancelled');
      const unitsSold = validOrders.reduce((sum, o) => {
        const item = o.items.find((it) => it.id === p.id);
        return sum + (item ? item.quantity : 0);
      }, 0);

      // Profit calculations if costPrice available
      const grossProfit = p.costPrice ? p.price - p.costPrice : null;
      const profitMargin =
        p.costPrice && p.price > 0
          ? Number((((p.price - p.costPrice) / p.price) * 100).toFixed(1))
          : null;

      return {
        ...p,
        unitsSoldInPeriod: unitsSold,
        lowStockThreshold: threshold,
        isLowStock: p.stockQuantity <= threshold,
        isOutOfStock: p.stockQuantity === 0,
        grossProfit,
        profitMargin,
      };
    });
  }, [products, filteredOrders]);

  // Export functions (CSV, Excel-compatible, and Print-friendly)
  const handleExportCSV = () => {
    let csvContent = '';
    const filename = `NHC_Report_${activeReport}_${dateRangeBounds.start}_to_${dateRangeBounds.end}.csv`;

    if (activeReport === 'appointments') {
      csvContent = 'Booking Reference,Patient Name,Phone,Date,Time,Patient Type,Status,Source\n';
      filteredAppointments.forEach((a) => {
        csvContent += `"${a.bookingReference}","${a.fullName}","${a.phone}","${a.preferredDate}","${a.preferredTime}","${a.patientType}","${a.status}","${a.source || 'Website'}"\n`;
      });
    } else if (activeReport === 'orders') {
      csvContent = 'Order ID,Date,Customer Name,Phone,City,Items Count,Subtotal,Discount,Shipping,Total,Status,Source\n';
      filteredOrders.forEach((o) => {
        csvContent += `"${o.id}","${o.createdAt.split('T')[0]}","${o.customer.fullName}","${o.customer.phone}","${o.address.city}",${o.items.length},${o.subtotal},${o.discount},${o.shippingFee},${o.total},"${o.status}","${o.source || 'Website Shop'}"\n`;
      });
    } else if (activeReport === 'revenue') {
      csvContent = 'Metric,Value (INR)\n';
      csvContent += `"Gross Sales",${revenueBreakdown.grossSales}\n`;
      csvContent += `"Discounts",${revenueBreakdown.discounts}\n`;
      csvContent += `"Shipping Fees",${revenueBreakdown.shipping}\n`;
      csvContent += `"Refunds",${revenueBreakdown.refunds}\n`;
      csvContent += `"Net Revenue",${revenueBreakdown.netRevenue}\n`;
      csvContent += `"Today's Revenue",${revenueBreakdown.todayRevenue}\n`;
      csvContent += `"Weekly Revenue",${revenueBreakdown.weeklyRevenue}\n`;
      csvContent += `"Monthly Revenue",${revenueBreakdown.monthlyRevenue}\n`;
      csvContent += `"Lifetime Net Revenue",${revenueBreakdown.lifetimeNetRevenue}\n`;
    } else if (activeReport === 'products_sold') {
      csvContent = 'Product ID,Product Name,Category,Units Sold,Total Revenue (INR),Cost Price,Gross Profit\n';
      productsSoldBreakdown.forEach((p) => {
        const profit = p.costPrice ? p.revenue - p.costPrice * p.unitsSold : 'N/A';
        csvContent += `"${p.id}","${p.name}","${p.category}",${p.unitsSold},${p.revenue},"${p.costPrice || 'N/A'}","${profit}"\n`;
      });
    } else if (activeReport === 'inventory') {
      csvContent = 'SKU,Product Name,Category,Current Stock,Safety Threshold,Selling Price,Cost Price,Units Sold in Period,Stock Status\n';
      inventoryReport.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}","${p.category}",${p.stockQuantity},${p.lowStockThreshold},${p.price},"${p.costPrice || 'N/A'}",${p.unitsSoldInPeriod},"${p.stockStatus}"\n`;
      });
    } else if (activeReport === 'customers') {
      csvContent = 'Customer ID,Customer Name,Phone,Total Orders,Total Appointments,Lifetime Purchase Value (INR),Last Order Date\n';
      customers.forEach((c) => {
        csvContent += `"${c.id}","${c.fullName}","${c.phone}",${c.totalOrders},${c.totalAppointments},${c.totalPurchaseValue},"${c.lastOrderDate || 'None'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Excel-compatible file with UTF-8 Byte Order Mark (BOM)
    let csvContent = '\uFEFF';
    const filename = `NHC_Excel_${activeReport}_${dateRangeBounds.start}_to_${dateRangeBounds.end}.csv`;

    if (activeReport === 'appointments') {
      csvContent += 'Booking Ref\tPatient Name\tPhone\tDate\tTime\tType\tStatus\tSource\n';
      filteredAppointments.forEach((a) => {
        csvContent += `${a.bookingReference}\t${a.fullName}\t${a.phone}\t${a.preferredDate}\t${a.preferredTime}\t${a.patientType}\t${a.status}\t${a.source || 'Website'}\n`;
      });
    } else if (activeReport === 'orders') {
      csvContent += 'Order ID\tDate\tCustomer\tPhone\tCity\tSubtotal\tDiscount\tShipping\tTotal\tStatus\tSource\n';
      filteredOrders.forEach((o) => {
        csvContent += `${o.id}\t${o.createdAt.split('T')[0]}\t${o.customer.fullName}\t${o.customer.phone}\t${o.address.city}\t${o.subtotal}\t${o.discount}\t${o.shippingFee}\t${o.total}\t${o.status}\t${o.source || 'Website Shop'}\n`;
      });
    } else if (activeReport === 'revenue') {
      csvContent += 'Metric\tAmount (INR)\n';
      csvContent += `Gross Sales\t${revenueBreakdown.grossSales}\n`;
      csvContent += `Discounts\t${revenueBreakdown.discounts}\n`;
      csvContent += `Shipping\t${revenueBreakdown.shipping}\n`;
      csvContent += `Refunds\t${revenueBreakdown.refunds}\n`;
      csvContent += `Net Revenue\t${revenueBreakdown.netRevenue}\n`;
      csvContent += `Today's Revenue\t${revenueBreakdown.todayRevenue}\n`;
      csvContent += `Weekly Revenue\t${revenueBreakdown.weeklyRevenue}\n`;
      csvContent += `Monthly Revenue\t${revenueBreakdown.monthlyRevenue}\n`;
      csvContent += `Lifetime Net Revenue\t${revenueBreakdown.lifetimeNetRevenue}\n`;
    } else if (activeReport === 'products_sold') {
      csvContent += 'SKU/ID\tProduct Name\tCategory\tUnits Sold\tRevenue (INR)\n';
      productsSoldBreakdown.forEach((p) => {
        csvContent += `${p.id}\t${p.name}\t${p.category}\t${p.unitsSold}\t${p.revenue}\n`;
      });
    } else if (activeReport === 'inventory') {
      csvContent += 'SKU\tProduct Name\tCategory\tCurrent Stock\tUnits Sold in Period\tPrice\tStock Status\n';
      inventoryReport.forEach((p) => {
        csvContent += `${p.sku}\t${p.name}\t${p.category}\t${p.stockQuantity}\t${p.unitsSoldInPeriod}\t${p.price}\t${p.stockStatus}\n`;
      });
    } else if (activeReport === 'customers') {
      csvContent += 'Customer ID\tFull Name\tPhone\tTotal Orders\tTotal Value (INR)\n';
      customers.forEach((c) => {
        csvContent += `${c.id}\t${c.fullName}\t${c.phone}\t${c.totalOrders}\t${c.totalPurchaseValue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout
      activeTab="reports"
      pageTitle="Clinical & Store Reports"
      pageSubtitle="Comprehensive analytics for Appointments, Orders, Revenue, Inventory, and Customer metrics"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Export</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
            title="Download Excel Compatible File"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Excel File</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ================= FILTER & DATE CONTROLS ================= */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Report Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
              {[
                { id: 'revenue', label: 'Revenue & Sales', icon: IndianRupee },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'orders', label: 'Shop Orders', icon: ShoppingBag },
                { id: 'products_sold', label: 'Products Sold', icon: Package },
                { id: 'inventory', label: 'Inventory & Stock', icon: TrendingUp },
                { id: 'customers', label: 'Customer Analytics', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeReport === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveReport(tab.id as ReportTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Date Preset Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setDateFilter(preset.id as DateFilter)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    dateFilter === preset.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'custom' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700">Custom Date Range:</span>
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 font-medium">From:</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 font-medium">To:</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Data filtered automatically as dates are chosen.
              </span>
            </div>
          )}
        </div>

        {/* ================= REPORT CONTENT ================= */}

        {/* 1. REVENUE REPORT */}
        {activeReport === 'revenue' && (
          <div className="space-y-6">
            {/* Top Revenue KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Gross Sales</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  ₹{revenueBreakdown.grossSales.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Item subtotals</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Discounts</span>
                <span className="text-2xl font-bold text-amber-700 mt-1 block">
                  -₹{revenueBreakdown.discounts.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Applied coupons / promos</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Shipping Collected</span>
                <span className="text-2xl font-bold text-blue-700 mt-1 block">
                  +₹{revenueBreakdown.shipping.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Courier fees</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Refunds Deducted</span>
                <span className="text-2xl font-bold text-red-600 mt-1 block">
                  -₹{revenueBreakdown.refunds.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Cancelled & returned orders</p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[11px] text-emerald-800 font-bold block">Net Revenue</span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">
                  ₹{revenueBreakdown.netRevenue.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-emerald-700 mt-1">In selected period</p>
              </div>
            </div>

            {/* Time-Based Revenue Comparison Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Time-Period Revenue Overview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Today's Revenue</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">
                    ₹{revenueBreakdown.todayRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Weekly Revenue (7d)</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1">
                    ₹{revenueBreakdown.weeklyRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Revenue</span>
                  <span className="text-lg font-bold text-emerald-700 block mt-1">
                    ₹{revenueBreakdown.monthlyRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Lifetime Net Revenue</span>
                  <span className="text-lg font-bold text-purple-700 block mt-1">
                    ₹{revenueBreakdown.lifetimeNetRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  All revenue calculations strictly exclude cancelled orders and accurately deduct refunds.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* 2. APPOINTMENTS REPORT */}
        {activeReport === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Appointments Report ({filteredAppointments.length} records)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Filter: {dateRangeBounds.label}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Booking Ref</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Consultation Date & Time</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        No appointments found in this date range.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a) => (
                      <tr key={a.bookingReference} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          {a.bookingReference}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{a.fullName}</td>
                        <td className="px-4 py-3 text-slate-600">{a.phone}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {a.preferredDate} ({a.preferredTime})
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-600">{a.patientType}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {a.source || 'Website'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              a.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : a.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ORDERS REPORT */}
        {activeReport === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Shop Orders Report ({filteredOrders.length} records)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Filter: {dateRangeBounds.label}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">City & State</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        No orders recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{o.id}</td>
                        <td className="px-4 py-3 text-slate-600">{o.createdAt.split('T')[0]}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{o.customer.fullName}</p>
                          <p className="text-[10px] text-slate-400">{o.customer.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {o.address.city}, {o.address.state}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {o.items.reduce((sum, item) => sum + item.quantity, 0)} units
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {o.source || 'Website Shop'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">₹{o.total}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : o.status === 'refunded'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PRODUCTS SOLD REPORT */}
        {activeReport === 'products_sold' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                Products Sold Breakdown ({productsSoldBreakdown.length} items)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated units and gross sales volume for verified non-cancelled orders.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Units Sold</th>
                    <th className="px-4 py-3">Cost Price</th>
                    <th className="px-4 py-3">Gross Sales</th>
                    <th className="px-4 py-3 text-right">Gross Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsSoldBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        No product sales recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    productsSoldBreakdown.map((p) => {
                      const profit = p.costPrice ? p.revenue - p.costPrice * p.unitsSold : null;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                          <td className="px-4 py-3 text-slate-600">{p.category}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {p.unitsSold} units
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {p.costPrice ? `₹${p.costPrice}` : '—'}
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-700">₹{p.revenue}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">
                            {profit !== null ? `₹${profit}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. INVENTORY REPORT */}
        {activeReport === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Product Stock & Inventory Health
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time stock quantities, safety alerts, units sold, and optional profit margins.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3">Current Stock</th>
                      <th className="px-4 py-3">Threshold</th>
                      <th className="px-4 py-3">Selling Price</th>
                      <th className="px-4 py-3">Cost Price</th>
                      <th className="px-4 py-3">Margin %</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryReport.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{p.name}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {p.stockQuantity} units
                        </td>
                        <td className="px-4 py-3 text-slate-500">{p.lowStockThreshold} units</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">₹{p.price}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {p.costPrice ? `₹${p.costPrice}` : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          {p.profitMargin !== null ? `${p.profitMargin}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.isOutOfStock
                                ? 'bg-red-100 text-red-700'
                                : p.isLowStock
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {p.isOutOfStock ? 'Out of Stock' : p.isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Change History Log */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">Recent Inventory History Log</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail of stock additions, adjustments, customer orders, and returns.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Change (+/-)</th>
                      <th className="px-4 py-3">Stock Before &rarr; After</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3 text-right">Admin Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{log.productName}</td>
                        <td className="px-4 py-3 font-bold">
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
                        <td className="px-4 py-3 text-slate-600">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                            {log.changeReason}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{log.adminAccount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. CUSTOMER ANALYTICS REPORT */}
        {activeReport === 'customers' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Total Customers</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {customerAnalytics.totalCustomers}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">New Customers</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block">
                  {customerAnalytics.newCustomers}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Returning Patients</span>
                <span className="text-2xl font-bold text-purple-600 mt-1 block">
                  {customerAnalytics.returningCustomers}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Repeat Buyers</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                  {customerAnalytics.repeatBuyers}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">&ge; 2 completed orders</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Avg. Order Value</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  ₹{customerAnalytics.averageOrderValue}
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] text-slate-500 font-semibold block">Orders / Customer</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {customerAnalytics.ordersPerCustomer}
                </span>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">
                  Customer & Patient Directory ({customers.length} records)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privacy-preserving customer summary. Excludes private medical symptoms, concerns, or notes.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Customer ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Total Orders</th>
                      <th className="px-4 py-3">Total Appointments</th>
                      <th className="px-4 py-3">Lifetime Value</th>
                      <th className="px-4 py-3 text-right">Last Interaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-slate-500">{c.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{c.fullName}</td>
                        <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">
                          {c.totalOrders} order{c.totalOrders === 1 ? '' : 's'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {c.totalAppointments} appt{c.totalAppointments === 1 ? '' : 's'}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          ₹{c.totalPurchaseValue}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">
                          {c.lastOrderDate || c.lastAppointmentDate || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
