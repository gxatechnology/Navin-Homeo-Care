import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, AdminAppointment, AppointmentStatus } from '../services/adminDataService';
import { CLINIC_CONFIG } from '../config/clinicData';
import {
  Calendar,
  Search,
  Filter,
  Check,
  X,
  Clock,
  Phone,
  MessageCircle,
  FileText,
  UserCheck,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  User,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC<{ initialSelectedId?: string }> = ({ initialSelectedId }) => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Selected Appointment for Detail Modal
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<AdminAppointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:30 AM - 11:30 AM');

  // Internal Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Admin Desk');
  const [confirmCancelTarget, setConfirmCancelTarget] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reloadData = async (showSpinner: boolean = false) => {
    if (showSpinner) setIsRefreshing(true);
    // 1. Immediate local render for instant UI
    const list = adminDataService.getAppointments();
    setAppointments(list);
    if (initialSelectedId) {
      const match = list.find((a) => a.bookingReference === initialSelectedId);
      if (match) setSelectedAppointment(match);
    }

    // 2. Fetch fresh records from shared API/backend
    try {
      const fresh = await adminDataService.fetchAppointmentsFromApi();
      if (fresh && fresh.length > 0) {
        setAppointments(fresh);
        if (initialSelectedId) {
          const match = fresh.find((a) => a.bookingReference === initialSelectedId);
          if (match) setSelectedAppointment(match);
        }
      }
    } catch (err) {
      console.warn('Live appointment refresh error:', err);
    } finally {
      if (showSpinner) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    reloadData();

    // Listen for local/tab synchronization events
    const handleUpdate = () => {
      const list = adminDataService.getAppointments();
      setAppointments(list);
    };

    window.addEventListener('nhc_appointments_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Periodic live polling (every 10 seconds) for new patient bookings
    const interval = setInterval(() => {
      adminDataService.fetchAppointmentsFromApi().then((fresh) => {
        if (fresh) setAppointments(fresh);
      });
    }, 10000);

    return () => {
      window.removeEventListener('nhc_appointments_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [initialSelectedId]);

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = appt.bookingReference.toLowerCase().includes(q);
        const nameMatch = appt.fullName.toLowerCase().includes(q);
        const phoneMatch = appt.phone.includes(q);
        if (!idMatch && !nameMatch && !phoneMatch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        if (appt.preferredDate !== todayStr) return false;
      } else if (dateFilter === 'tomorrow') {
        if (appt.preferredDate !== tomorrowStr) return false;
      } else if (dateFilter === 'this_week') {
        const apptDate = new Date(appt.preferredDate).getTime();
        const now = new Date().getTime();
        const diffDays = Math.abs(apptDate - now) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) return false;
      } else if (dateFilter === 'this_month') {
        if (!appt.preferredDate.startsWith(todayStr.substring(0, 7))) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && appt.preferredDate < customStartDate) return false;
        if (customEndDate && appt.preferredDate > customEndDate) return false;
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, dateFilter, todayStr, tomorrowStr, customStartDate, customEndDate]);

  // Section 6: Analytics & Conversion Funnel
  const analytics = useMemo(() => {
    const totalRequests = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const noShow = appointments.filter((a) => a.status === 'no_show').length;

    // Conversion rate: Booked -> Confirmed -> Completed
    const conversionRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0;
    const confirmationRate = totalRequests > 0 ? Math.round(((confirmed + completed) / totalRequests) * 100) : 0;

    return {
      totalRequests,
      confirmed,
      completed,
      cancelled,
      noShow,
      conversionRate,
      confirmationRate,
    };
  }, [appointments]);

  // Actions
  const handleUpdateStatus = (bookingRef: string, status: AppointmentStatus) => {
    adminDataService.updateAppointmentStatus(bookingRef, status);
    reloadData();
    if (selectedAppointment && selectedAppointment.bookingReference === bookingRef) {
      setSelectedAppointment((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleOpenReschedule = (appt: AdminAppointment) => {
    setRescheduleTarget(appt);
    setNewDate(appt.preferredDate);
    setNewTime(appt.preferredTime);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleTarget || !newDate) return;
    adminDataService.rescheduleAppointment(rescheduleTarget.bookingReference, newDate, newTime);
    setRescheduleModalOpen(false);
    reloadData();
    if (selectedAppointment && selectedAppointment.bookingReference === rescheduleTarget.bookingReference) {
      setSelectedAppointment((prev) =>
        prev
          ? {
              ...prev,
              preferredDate: newDate,
              preferredTime: newTime,
              status: 'confirmed',
            }
          : null
      );
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newNoteText.trim()) return;
    const updated = adminDataService.addAppointmentNote(
      selectedAppointment.bookingReference,
      newNoteText,
      noteAuthor
    );
    if (updated) {
      setSelectedAppointment(updated);
      setNewNoteText('');
      reloadData();
    }
  };

  // WhatsApp Link generator
  const getWhatsAppLink = (appt: AdminAppointment) => {
    const cleanPhone = appt.phone.replace(/\D/g, '').slice(-10);
    const message = `Namaste ${appt.fullName}, this is Navin Homeo Care regarding your appointment request (Ref: ${appt.bookingReference}) with Dr. Navin Maurya on ${appt.preferredDate} (${appt.preferredTime}). Please let us know if you have any questions.`;
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AdminLayout
      activeTab="appointments"
      pageTitle="Clinical Appointment Management"
      pageSubtitle="Search, confirm OPD time slots, manage patient history, and track conversion rates"
    >
      <div className="space-y-6">
        {/* ================= SECTION 6: CONVERSION FUNNEL & ANALYTICS BANNER ================= */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Appointment Conversion Funnel & OPD Attendance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conversion Pipeline: Booked &rarr; Confirmed &rarr; Completed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                {analytics.conversionRate}% Completed Care Rate
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-semibold block">Total Requests</span>
              <span className="text-xl font-bold text-slate-800">{analytics.totalRequests}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] text-blue-700 font-semibold block">Confirmed</span>
              <span className="text-xl font-bold text-blue-900">{analytics.confirmed}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-700 font-semibold block">Completed</span>
              <span className="text-xl font-bold text-emerald-900">{analytics.completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] text-amber-700 font-semibold block">Action Pending</span>
              <span className="text-xl font-bold text-amber-900">
                {appointments.filter((a) => a.status === 'requested').length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-semibold block">Cancelled</span>
              <span className="text-xl font-bold text-slate-700">{analytics.cancelled}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
              <span className="text-[11px] text-red-700 font-semibold block">No-Shows</span>
              <span className="text-xl font-bold text-red-900">{analytics.noShow}</span>
            </div>
          </div>
        </div>

        {/* ================= CONTROLS & FILTERS ================= */}
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
                placeholder="Search by Patient Name, Phone, or Booking ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Date Quick Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(
                [
                  { id: 'all', label: 'All Dates' },
                  { id: 'today', label: 'Today' },
                  { id: 'tomorrow', label: 'Tomorrow' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'custom', label: 'Custom Range' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    dateFilter === f.id
                      ? 'bg-[#001428] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={() => reloadData(true)}
                disabled={isRefreshing}
                title="Refresh Live Appointments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {(
              [
                { id: 'all', label: 'All Statuses' },
                { id: 'requested', label: 'Requested' },
                { id: 'confirmed', label: 'Confirmed' },
                { id: 'completed', label: 'Completed' },
                { id: 'cancelled', label: 'Cancelled' },
                { id: 'no_show', label: 'No Show' },
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

        {/* ================= SECTION 4: SEARCHABLE DATA TABLE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Appointment ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Mobile / Contact</th>
                  <th className="py-3.5 px-4">Preferred Slot</th>
                  <th className="py-3.5 px-4">Health Concern</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No matching appointment records found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => {
                    const isToday = appt.preferredDate === todayStr;
                    return (
                      <tr
                        key={appt.bookingReference}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isToday ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {appt.bookingReference}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{appt.fullName}</p>
                          {appt.age && <p className="text-[10px] text-slate-400">Age: {appt.age} yrs</p>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <a href={`tel:${appt.phone}`} className="hover:text-emerald-700 font-mono">
                            {appt.phone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{appt.preferredDate}</p>
                          <p className="text-[10px] text-slate-500">{appt.preferredTime}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate" title={appt.healthConcern}>
                          {appt.healthConcern}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              appt.patientType === 'new'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {appt.patientType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              appt.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : appt.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : appt.status === 'requested'
                                ? 'bg-amber-100 text-amber-800'
                                : appt.status === 'cancelled'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {appt.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                          >
                            Details
                          </button>
                          {appt.status === 'requested' && (
                            <button
                              onClick={() => handleUpdateStatus(appt.bookingReference, 'confirmed')}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                              title="Confirm appointment"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(appt.bookingReference, 'completed')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                              title="Mark consultation completed"
                            >
                              Complete
                            </button>
                          )}
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

      {/* ================= SECTION 5: APPOINTMENT DETAILS MODAL / DRAWER ================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-[#001428] text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-mono">
                    {selectedAppointment.bookingReference}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 uppercase">
                    {selectedAppointment.patientType} Patient
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-1">{selectedAppointment.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Quick Communication Actions (Call & WhatsApp) */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${selectedAppointment.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Patient</span>
                </a>
                <a
                  href={getWhatsAppLink(selectedAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Patient</span>
                </a>
              </div>

              {/* Status & Reschedule Management */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Appointment Status:</span>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedAppointment.bookingReference, e.target.value as AppointmentStatus)
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <p className="text-slate-500 text-[11px]">Scheduled Slot:</p>
                    <p className="font-bold text-slate-800">
                      {selectedAppointment.preferredDate} ({selectedAppointment.preferredTime})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReschedule(selectedAppointment)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                    >
                      Reschedule
                    </button>
                    {selectedAppointment.status !== 'cancelled' && (
                      confirmCancelTarget === selectedAppointment.bookingReference ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleUpdateStatus(selectedAppointment.bookingReference, 'cancelled');
                              setConfirmCancelTarget(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            onClick={() => setConfirmCancelTarget(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-medium cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelTarget(selectedAppointment.bookingReference)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 font-semibold text-red-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Patient Profile & Concern Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1">Patient Consultation Details</h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact Number</span>
                    <span className="font-semibold text-slate-800">{selectedAppointment.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Email Address</span>
                    <span className="text-slate-800">{selectedAppointment.email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Age</span>
                    <span className="text-slate-800">{selectedAppointment.age || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Booking Timestamp</span>
                    <span className="text-slate-800">
                      {new Date(selectedAppointment.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Primary Health Concern</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedAppointment.healthConcern}</p>
                </div>

                {selectedAppointment.symptomsNote && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-amber-900">
                    <span className="text-[10px] font-bold uppercase block text-amber-800 mb-1">
                      Patient Symptoms Note
                    </span>
                    <p className="leading-relaxed">{selectedAppointment.symptomsNote}</p>
                  </div>
                )}
              </div>

              {/* Internal Staff Notes (Not visible to patient) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Internal Appointment Notes</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Strictly Private • Not Visible to Patient</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedAppointment.internalNotes.length === 0 ? (
                    <p className="text-slate-400 italic">No internal notes added yet.</p>
                  ) : (
                    selectedAppointment.internalNotes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold text-slate-700">{note.author}</span>
                          <span>{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Internal Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add internal note (e.g. called patient, advised previous reports, token assigned)..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold cursor-pointer"
                    >
                      Save Internal Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= RESCHEDULE MODAL ================= */}
      {rescheduleModalOpen && rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Reschedule Appointment</h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <p className="text-slate-600">
              Patient: <strong className="text-slate-900">{rescheduleTarget.fullName}</strong> (
              {rescheduleTarget.bookingReference})
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Consultation Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning OPD)</option>
                <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM (Morning OPD)</option>
                <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM (Evening OPD)</option>
                <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM (Evening OPD)</option>
                <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM (Evening OPD)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRescheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
