import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { useRouter } from '../context/RouterContext';
import {
  adminDataService,
  AdminAppointment,
  AppointmentStatus,
  AppointmentSource,
} from '../services/adminDataService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  AlertCircle,
  X,
  FileText,
  Filter,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const AdminCalendarPage: React.FC = () => {
  const { navigate } = useRouter();
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');

  // Selected appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Internal note input
  const [newNote, setNewNote] = useState('');

  // Manual appointment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
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
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadAppointments();

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

  const loadAppointments = () => {
    setAppointments(adminDataService.getAppointments());
    adminDataService.fetchAppointmentsFromApi().then((fresh) => {
      if (fresh) setAppointments(fresh);
    });
  };

  // Helper date navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const currentDateStr = useMemo(() => {
    return currentDate.toISOString().split('T')[0];
  }, [currentDate]);

  // Status color badge helper
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-500',
        };
      case 'no_show':
        return {
          label: 'No Show',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: 'Requested',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
    }
  };

  // Actions on appointment
  const handleUpdateStatus = (ref: string, newStatus: AppointmentStatus) => {
    adminDataService.updateAppointmentStatus(ref, newStatus);
    loadAppointments();
    if (selectedAppointment && selectedAppointment.bookingReference === ref) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  const handleConfirmReschedule = () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return;
    const updated = adminDataService.rescheduleAppointment(
      selectedAppointment.bookingReference,
      rescheduleDate,
      rescheduleTime
    );
    loadAppointments();
    if (updated) {
      setSelectedAppointment(updated);
    }
    setIsRescheduling(false);
  };

  const handleAddNote = () => {
    if (!selectedAppointment || !newNote.trim()) return;
    const updated = adminDataService.addAppointmentNote(
      selectedAppointment.bookingReference,
      newNote.trim(),
      'Dr. Navin Maurya Desk'
    );
    loadAppointments();
    if (updated) {
      setSelectedAppointment(updated);
    }
    setNewNote('');
  };

  // Manual appointment submission
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!createForm.fullName.trim()) {
      setCreateError('Patient name is required.');
      return;
    }
    if (!createForm.phone.trim() || createForm.phone.replace(/\D/g, '').length < 10) {
      setCreateError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!createForm.healthConcern.trim()) {
      setCreateError('Please specify consultation reason or concern.');
      return;
    }

    const created = adminDataService.createAppointment({
      fullName: createForm.fullName,
      phone: createForm.phone,
      email: createForm.email,
      preferredDate: createForm.date,
      preferredTime: createForm.time,
      patientType: createForm.patientType,
      healthConcern: createForm.healthConcern,
      source: createForm.source,
      status: 'confirmed',
      symptomsNote: createForm.symptomsNote,
    });

    loadAppointments();
    setShowCreateModal(false);
    setSelectedAppointment(created);
    setCreateForm({
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

  // ---------------- Day View Calculations ----------------
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.preferredDate === currentDateStr)
      .sort((a, b) => a.preferredTime.localeCompare(b.preferredTime));
  }, [appointments, currentDateStr]);

  // ---------------- Week View Calculations ----------------
  const weekDays = useMemo(() => {
    const days: { date: Date; dateStr: string; label: string; isToday: boolean }[] = [];
    const current = new Date(currentDate);
    const dayOfWeek = current.getDay(); // 0 is Sunday
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const todayLocal = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        isToday: dStr === todayLocal,
      });
    }
    return days;
  }, [currentDate]);

  // ---------------- Month View Calculations ----------------
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayLocal = new Date().toISOString().split('T')[0];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum);
      const dStr = d.toISOString().split('T')[0];
      days.push({ dateStr: dStr, dayNum, isCurrentMonth: false, isToday: dStr === todayLocal });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({ dateStr: dStr, dayNum: i, isCurrentMonth: true, isToday: dStr === todayLocal });
    }

    // Next month padding to fill grid to 35 or 42
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dStr = d.toISOString().split('T')[0];
      days.push({ dateStr: dStr, dayNum: i, isCurrentMonth: false, isToday: dStr === todayLocal });
    }

    return days;
  }, [currentDate]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>();
    appointments.forEach((a) => {
      const list = map.get(a.preferredDate) || [];
      list.push(a);
      map.set(a.preferredDate, list);
    });
    return map;
  }, [appointments]);

  return (
    <AdminLayout
      activeTab="calendar"
      pageTitle="Appointment Calendar"
      pageSubtitle="Schedule, confirm, reschedule, and track clinic OPD consultations"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/appointments')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <span>List View</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Appointment</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Calendar Control Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-slate-900 capitalize">
              {viewMode === 'day'
                ? currentDate.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : currentDate.toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
            </h3>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-center">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>

        {/* ================= CALENDAR VIEWS ================= */}

        {/* 1. MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-2.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
              {monthDays.map((day, idx) => {
                const dayAppts = appointmentsByDate.get(day.dateStr) || [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] p-2 flex flex-col transition-colors ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                    } ${day.isToday ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/20' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          day.isToday ? 'bg-emerald-600 text-white' : 'text-slate-700'
                        }`}
                      >
                        {day.dayNum}
                      </span>
                      {dayAppts.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dayAppts.length}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px]">
                      {dayAppts.map((a) => {
                        const badge = getStatusBadge(a.status);
                        return (
                          <div
                            key={a.bookingReference}
                            onClick={() => setSelectedAppointment(a)}
                            className={`px-1.5 py-1 rounded text-[11px] font-medium border truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1.5 shadow-2xs ${badge.bg}`}
                            title={`${a.preferredTime} - ${a.fullName} (${a.healthConcern})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                            <span className="truncate font-semibold">{a.fullName}</span>
                            <span className="text-[9px] opacity-75 shrink-0 ml-auto">
                              {a.preferredTime.split(' - ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center divide-x divide-slate-200">
              {weekDays.map((d) => (
                <div key={d.dateStr} className={`py-3 ${d.isToday ? 'bg-emerald-50/50' : ''}`}>
                  <span className="text-xs font-bold block text-slate-800">{d.label}</span>
                  <span className="text-[11px] text-slate-400">
                    {(appointmentsByDate.get(d.dateStr) || []).length} appts
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[460px]">
              {weekDays.map((d) => {
                const dayAppts = (appointmentsByDate.get(d.dateStr) || []).sort((a, b) =>
                  a.preferredTime.localeCompare(b.preferredTime)
                );
                return (
                  <div
                    key={d.dateStr}
                    className={`p-2 space-y-2 ${d.isToday ? 'bg-emerald-50/15' : 'bg-white'}`}
                  >
                    {dayAppts.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 py-10">
                        No Slots
                      </div>
                    ) : (
                      dayAppts.map((a) => {
                        const badge = getStatusBadge(a.status);
                        return (
                          <div
                            key={a.bookingReference}
                            onClick={() => setSelectedAppointment(a)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer hover:shadow-md transition-all ${badge.bg}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold truncate">{a.fullName}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${badge.bg}`}
                              >
                                {a.status}
                              </span>
                            </div>
                            <p className="text-[11px] flex items-center gap-1 opacity-80">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{a.preferredTime}</span>
                            </p>
                            <p className="text-[10px] truncate mt-1 opacity-70">
                              {a.healthConcern}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DAY VIEW */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  OPD Schedule for {currentDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dayAppointments.length} consultation{dayAppointments.length === 1 ? '' : 's'} scheduled
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateForm((prev) => ({ ...prev, date: currentDateStr }));
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>

            {dayAppointments.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No appointments scheduled for this date</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click 'Book Slot' to schedule an appointment for this day.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayAppointments.map((a) => {
                  const badge = getStatusBadge(a.status);
                  return (
                    <div
                      key={a.bookingReference}
                      onClick={() => setSelectedAppointment(a)}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-slate-300 transition-all ${badge.bg}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{a.fullName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg}`}
                          >
                            {a.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {a.bookingReference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="font-semibold flex items-center gap-1 text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            {a.preferredTime}
                          </span>
                          <span>•</span>
                          <span>{a.healthConcern}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Phone: {a.phone} • Patient Type: <span className="capitalize">{a.patientType}</span> • Source: {a.source || 'Website'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= APPOINTMENT DETAILS MODAL ================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase tracking-wider block">
                  {selectedAppointment.bookingReference}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAppointment.fullName}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsRescheduling(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                  getStatusBadge(selectedAppointment.status).bg
                }`}
              >
                {selectedAppointment.status}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Source: {selectedAppointment.source || 'Website'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                Type: {selectedAppointment.patientType === 'new' ? 'New Patient' : 'Existing Patient'}
              </span>
            </div>

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Date & Time</span>
                <p className="font-bold text-slate-800 text-xs">
                  {selectedAppointment.preferredDate} ({selectedAppointment.preferredTime})
                </p>
                {selectedAppointment.rescheduledFrom && (
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Rescheduled from: {selectedAppointment.rescheduledFrom}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Phone Number</span>
                <p className="font-bold text-slate-800 text-xs">{selectedAppointment.phone}</p>
                {selectedAppointment.email && (
                  <p className="text-[11px] text-slate-500 truncate">{selectedAppointment.email}</p>
                )}
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium block">Health Concern</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5">
                  {selectedAppointment.healthConcern}
                </p>
                {selectedAppointment.symptomsNote && (
                  <p className="text-slate-600 text-[11px] mt-1 italic">
                    "{selectedAppointment.symptomsNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Status Change Buttons: Confirm, Reschedule, Complete, Cancel */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Status Actions
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.bookingReference, 'confirmed')}
                  disabled={selectedAppointment.status === 'confirmed'}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    selectedAppointment.status === 'confirmed'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Confirm</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRescheduling(!isRescheduling);
                    setRescheduleDate(selectedAppointment.preferredDate);
                    setRescheduleTime(selectedAppointment.preferredTime);
                  }}
                  className="py-2 px-2.5 rounded-xl font-bold text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.bookingReference, 'completed')}
                  disabled={selectedAppointment.status === 'completed'}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    selectedAppointment.status === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedAppointment.bookingReference, 'cancelled')}
                  disabled={selectedAppointment.status === 'cancelled'}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    selectedAppointment.status === 'cancelled'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Inline Reschedule Form */}
            {isRescheduling && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-xs">Reschedule Consultation Slot</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">New Slot</label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                      <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM</option>
                      <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM</option>
                      <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-200 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReschedule}
                    className="px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Save Rescheduled Slot
                  </button>
                </div>
              </div>
            )}

            {/* Internal Doctor / Reception Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Internal Appointment Notes
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {selectedAppointment.internalNotes.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No internal notes added yet.</p>
                ) : (
                  selectedAppointment.internalNotes.map((note) => (
                    <div key={note.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-600">{note.author}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-800">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add note for clinic OPD staff..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MANUAL APPOINTMENT CREATION MODAL ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateAppointment}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Appointment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct appointment entry by clinic reception / Dr. Navin Desk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {createError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mobile Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 09415012345"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Patient Type
                </label>
                <select
                  value={createForm.patientType}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, patientType: e.target.value as 'new' | 'existing' })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="new">New Patient (First Visit)</option>
                  <option value="existing">Existing Patient (Follow-up)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Time Slot *</label>
                <select
                  value={createForm.time}
                  onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning OPD)</option>
                  <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM (Morning OPD)</option>
                  <option value="12:30 PM - 01:30 PM">12:30 PM - 01:30 PM (Morning OPD)</option>
                  <option value="05:30 PM - 06:30 PM">05:30 PM - 06:30 PM (Evening OPD)</option>
                  <option value="06:30 PM - 07:30 PM">06:30 PM - 07:30 PM (Evening OPD)</option>
                  <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM (Evening OPD)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Appointment Source *
                </label>
                <select
                  value={createForm.source}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, source: e.target.value as AppointmentSource })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="Phone">Phone Call to Reception</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Walk-in">Direct Walk-in Patient</option>
                  <option value="Admin Entry">Admin Desk / Direct Doctor Entry</option>
                  <option value="Website">Website Form</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Health Concern / Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chronic Joint Pain, Skin Allergy, Digestive Consultation"
                  value={createForm.healthConcern}
                  onChange={(e) => setCreateForm({ ...createForm, healthConcern: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Internal Staff Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Previous case file #42, advised to bring laboratory reports"
                  value={createForm.symptomsNote}
                  onChange={(e) => setCreateForm({ ...createForm, symptomsNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-xs"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};
