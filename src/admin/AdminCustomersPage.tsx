import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, CustomerSummary } from '../services/adminDataService';
import { useRouter } from '../context/RouterContext';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Clock,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { navigate } = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const reloadCustomers = () => {
    setCustomers(adminDataService.getCustomers());
  };

  useEffect(() => {
    reloadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  const getWhatsAppLink = (cust: CustomerSummary) => {
    const cleanPhone = cust.phone.replace(/\D/g, '').slice(-10);
    const message = `Namaste ${cust.fullName}, this is Navin Homeo Care & Research Center. How may we assist you today?`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AdminLayout
      activeTab="customers"
      pageTitle="Customer & Patient Directory"
      pageSubtitle="Aggregated profiles across clinic appointments and shop orders with strict patient privacy separation"
    >
      <div className="space-y-6">
        {/* Privacy Assurance Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Patient Privacy Protocol:</strong> Detailed medical notes, symptoms, and diagnoses are strictly confined to the protected Appointments module.
            </span>
          </div>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap cursor-pointer"
          >
            Appointments Module &rarr;
          </button>
        </div>

        {/* Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Phone, or Email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredCustomers.length}</strong> unique customer profiles
          </div>
        </div>

        {/* Section 4: Customer Table with Required Fields */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4 text-center">Appointments</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4">Total Purchase Value</th>
                  <th className="py-3.5 px-4">Last Appointment</th>
                  <th className="py-3.5 px-4">Last Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cust.fullName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        <a href={`tel:${cust.phone}`} className="hover:text-emerald-700">
                          {cust.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{cust.email || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold">
                          {cust.totalAppointments}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 font-bold">
                          {cust.totalOrders}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{cust.totalPurchaseValue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {cust.lastAppointmentDate || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {cust.lastOrderDate || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          View History
                        </button>
                        <a
                          href={getWhatsAppLink(cust)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded inline-block bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold"
                          title="WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= CUSTOMER HISTORY MODAL ================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-[#001428] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold">{selectedCustomer.id}</span>
                <h3 className="text-lg font-bold mt-1">{selectedCustomer.fullName}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Phone: {selectedCustomer.phone} {selectedCustomer.email && `• ${selectedCustomer.email}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Quick Communication */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer</span>
                </a>
                <a
                  href={getWhatsAppLink(selectedCustomer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>

              {/* Total Metrics Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointments</span>
                  <span className="text-lg font-bold text-slate-800">{selectedCustomer.totalAppointments}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Orders</span>
                  <span className="text-lg font-bold text-slate-800">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Total Purchases</span>
                  <span className="text-lg font-bold text-emerald-800">
                    ₹{selectedCustomer.totalPurchaseValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Section 4: Privacy-Compliant Appointments List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Appointment History ({selectedCustomer.appointments.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Clinical notes kept private</span>
                </div>

                {selectedCustomer.appointments.length === 0 ? (
                  <p className="text-slate-400 italic">No appointments recorded for this profile.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.appointments.map((a) => (
                      <div
                        key={a.bookingReference}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 font-mono text-[11px]">{a.bookingReference}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Slot: {a.preferredDate} ({a.preferredTime})
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                            {a.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCustomer(null);
                              navigate(`/admin/appointments/${a.bookingReference}`);
                            }}
                            className="block text-[10px] text-emerald-700 hover:underline mt-1 font-semibold cursor-pointer"
                          >
                            Open in Appointments &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Store Purchase History ({selectedCustomer.orders.length})</span>
                </h4>
                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-slate-400 italic">No store orders placed by this customer.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 font-mono">{o.id}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Date: {new Date(o.createdAt).toLocaleDateString('en-IN')} • {o.itemCount} unit(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-800 block text-xs">₹{o.total}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold">
                            {o.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
