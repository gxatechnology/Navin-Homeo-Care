import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { adminDataService, ClinicSettings } from '../services/adminDataService';
import { adminAuthService, DEFAULT_ADMIN_EMAIL } from '../services/adminAuthService';
import { auditLogService, AuditLogEntry } from '../services/auditLogService';
import {
  Settings,
  Clock,
  IndianRupee,
  Truck,
  Bell,
  Phone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Calendar,
  ShoppingBag,
  History,
  MapPin,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings>(adminDataService.getSettings());
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setSettings(adminDataService.getSettings());
    setAuditLogs(auditLogService.getLogs());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminDataService.saveSettings(settings);
    setSaveSuccessNotice(true);
    setAuditLogs(auditLogService.getLogs());
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await adminAuthService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Administrator master password successfully updated! Please use your new password next time.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setAuditLogs(auditLogService.getLogs());
      } else {
        setPasswordError(res.error || 'Failed to change password.');
      }
    } catch {
      setPasswordError('An unexpected error occurred while updating password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout
      activeTab="settings"
      pageTitle="Clinic & Store Settings"
      pageSubtitle="Configure clinic details, appointment slots, store rules, master security, and view audit activity logs"
    >
      <div className="space-y-8 max-w-5xl">
        {saveSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Clinic and store configuration settings successfully updated!
            </span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* SECTION 11.1: Clinic Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">1. Clinic General Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={settings.doctorName}
                  onChange={(e) => setSettings({ ...settings, doctorName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Google Maps Link</label>
                <input
                  type="url"
                  value={settings.googleMapsLink}
                  onChange={(e) => setSettings({ ...settings, googleMapsLink: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-full">
                <label className="block font-semibold text-slate-700 mb-1">Physical Clinic Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="col-span-full">
                <label className="block font-semibold text-slate-700 mb-1">Clinic Timings</label>
                <input
                  type="text"
                  value={settings.clinicTimings}
                  onChange={(e) => setSettings({ ...settings, clinicTimings: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 11.2: Appointment Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">2. Appointment Settings</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.appointmentAvailability}
                  onChange={(e) => setSettings({ ...settings, appointmentAvailability: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700">Online Booking Active</span>
              </label>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Timings</label>
                <input
                  type="text"
                  value={settings.consultationTimings}
                  onChange={(e) => setSettings({ ...settings, consultationTimings: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Consultation Fees - Only show if explicitly configured */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showConsultationFees}
                    onChange={(e) => setSettings({ ...settings, showConsultationFees: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Display Consultation Fees Publicly (Disabled by default)
                  </span>
                </label>

                {settings.showConsultationFees && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">In-Clinic Consultation Fee (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.clinicFee ?? 300}
                        onChange={(e) => setSettings({ ...settings, clinicFee: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Online Consultation Fee (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={settings.onlineFee ?? 400}
                        onChange={(e) => setSettings({ ...settings, onlineFee: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 11.3: Shop Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">3. Shop & Fulfillment Settings</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min={1}
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order ID Prefix</label>
                <input
                  type="text"
                  value={settings.orderPrefix}
                  onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.codAvailable}
                    onChange={(e) => setSettings({ ...settings, codAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Cash on Delivery (COD) Enabled</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.onlinePaymentAvailable}
                    onChange={(e) => setSettings({ ...settings, onlinePaymentAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Online Payment Gateway Enabled</span>
                </label>
              </div>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Website Header Notice Banner</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.announcementActive}
                  onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700">Notice Banner Enabled</span>
              </label>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">Notice Banner Message</label>
              <textarea
                rows={2}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        {/* SECTION 14: AUDIT ACTIVITY LOG */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Admin Activity & Audit Log</h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Total Log Entries: <strong className="text-slate-800">{auditLogs.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {auditLogs.length === 0 ? (
              <p className="py-4 text-center text-slate-400 italic">No activity logged yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    {log.details && <p className="text-[11px] text-slate-600 mt-0.5">{log.details}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[10px] text-slate-400 block">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">{log.adminAccount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Administrator Security & Master Password */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Administrator Security & Master Password</h3>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Designated Administrator Account:</span>
              <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{DEFAULT_ADMIN_EMAIL}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
              Super Admin Active
            </span>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Master Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password (Min 8 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{passwordLoading ? 'Updating Password...' : 'Change Master Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
