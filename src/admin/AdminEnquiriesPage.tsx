import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, AdminEnquiry, EnquiryStatus } from '../services/adminDataService';
import {
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [activeEnquiry, setActiveEnquiry] = useState<AdminEnquiry | null>(null);
  const [responseText, setResponseText] = useState('');

  const reloadEnquiries = () => {
    setEnquiries(adminDataService.getEnquiries());
  };

  useEffect(() => {
    reloadEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = e.name.toLowerCase().includes(q);
        const phoneMatch = e.phone.includes(q);
        const concernMatch = e.concern.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !concernMatch) return false;
      }

      if (statusFilter !== 'all' && e.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [enquiries, searchQuery, statusFilter]);

  const handleUpdateStatus = (id: string, status: EnquiryStatus, response?: string) => {
    adminDataService.updateEnquiryStatus(id, status, response);
    reloadEnquiries();
    if (activeEnquiry && activeEnquiry.id === id) {
      setActiveEnquiry((prev) => (prev ? { ...prev, status, adminResponse: response || prev.adminResponse } : null));
    }
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEnquiry || !responseText.trim()) return;
    handleUpdateStatus(activeEnquiry.id, 'contacted', responseText);
    setResponseText('');
  };

  const getWhatsAppLink = (enq: AdminEnquiry) => {
    const cleanPhone = enq.phone.replace(/\D/g, '').slice(-10);
    const message = `Namaste ${enq.name}, this is Navin Homeo Care & Research Center following up on your consultation enquiry regarding "${enq.concern}". Dr. Navin Maurya's clinical desk is here to assist.`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AdminLayout
      activeTab="enquiries"
      pageTitle="OPD Consultation Enquiries"
      pageSubtitle="Incoming patient questions from website contact forms and quick OPD queries"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Phone, or Concern..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Queries' },
                { id: 'new', label: 'New / Uncontacted' },
                { id: 'contacted', label: 'In Progress' },
                { id: 'resolved', label: 'Resolved' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Enquiries Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Enquiry ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Health Concern / Message</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No matching enquiry messages found.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{enq.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{enq.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <a href={`tel:${enq.phone}`} className="hover:text-emerald-700">
                          {enq.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-slate-800">{enq.concern}</p>
                        {enq.message && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{enq.message}</p>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(enq.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            enq.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : enq.status === 'contacted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveEnquiry(enq);
                            setResponseText(enq.adminResponse || '');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Review
                        </button>
                        <a
                          href={getWhatsAppLink(enq)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded inline-block bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold"
                          title="WhatsApp Response"
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

      {/* Enquiry Detail Drawer */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 bg-[#001428] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold">{activeEnquiry.id}</span>
                <h3 className="text-lg font-bold mt-1">{activeEnquiry.name}</h3>
                <p className="text-xs text-slate-300">Phone: {activeEnquiry.phone}</p>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${activeEnquiry.phone}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Inquirer</span>
                </a>
                <a
                  href={getWhatsAppLink(activeEnquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquirer</span>
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Inquiry Message</span>
                <h4 className="font-bold text-slate-900 text-sm">{activeEnquiry.concern}</h4>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {activeEnquiry.message || 'No additional note provided.'}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Received on {new Date(activeEnquiry.timestamp).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Status Updater */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Enquiry Status:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(activeEnquiry.id, 'new')}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        activeEnquiry.status === 'new' ? 'bg-amber-600 text-white' : 'bg-white border'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeEnquiry.id, 'contacted')}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        activeEnquiry.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-white border'
                      }`}
                    >
                      Contacted
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeEnquiry.id, 'resolved')}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        activeEnquiry.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-white border'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff Response / Action Notes */}
              <form onSubmit={handleSaveResponse} className="space-y-2">
                <label className="block font-bold text-slate-800">Clinic Staff Response / Follow-up Note</label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Record call outcome, appointment scheduled, or medicine dispatched..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    Save & Mark Contacted
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
