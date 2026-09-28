import React, { useState } from 'react';
import {
  AppointmentBookingPayload,
  submitAppointmentRequest,
  SubmissionResponse,
} from '../services/appointmentService';
import { CLINIC_CONFIG, TREATMENTS_DATA } from '../config/clinicData';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  User,
} from 'lucide-react';

interface Props {
  initialConcern?: string;
  onSuccess?: (res: SubmissionResponse) => void;
}

export const AppointmentForm: React.FC<Props> = ({ initialConcern, onSuccess }) => {
  const [formData, setFormData] = useState<AppointmentBookingPayload>({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    patientType: 'new',
    preferredDate: '',
    preferredTime: '',
    healthConcern: initialConcern || 'Skin-Related Concerns',
    symptomsNote: '',
    consentAgreed: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<SubmissionResponse | null>(null);

  // Set minimum booking date to today
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await submitAppointmentRequest(formData);
      setSuccessResponse(response);
      if (onSuccess) onSuccess(response);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to submit appointment request. Please try again or call the clinic.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessResponse(null);
    setErrorMsg(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      age: '',
      patientType: 'new',
      preferredDate: '',
      preferredTime: '',
      healthConcern: 'Skin-Related Concerns',
      symptomsNote: '',
      consentAgreed: true,
    });
  };

  if (successResponse) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-md flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006e2d] flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold text-[#006e2d] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          Request Registered
        </span>

        <h3 className="text-2xl font-bold text-[#001428] mb-2">
          Thank you, {formData.fullName}!
        </h3>

        <p className="text-base text-slate-700 max-w-lg leading-relaxed mb-4">
          {successResponse.message}
        </p>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl w-full max-w-md text-left text-xs sm:text-sm text-slate-600 mb-6 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Booking Reference:</span>
            <span className="font-mono font-bold text-[#001428]">
              {successResponse.bookingReference}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Requested Date &amp; Slot:</span>
            <span className="font-bold text-[#001428]">
              {formData.preferredDate} ({formData.preferredTime})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Phone:</span>
            <span className="font-bold text-[#001428]">{formData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Consultation Concern:</span>
            <span className="font-bold text-[#001428]">{formData.healthConcern}</span>
          </div>
        </div>

        {/* Quick action buttons on success */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          <a
            href={CLINIC_CONFIG.telLink}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f0f3ff] text-[#001428] px-4 py-2.5 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all"
          >
            <Phone className="w-4 h-4 text-[#006e2d]" />
            <span>Call Clinic</span>
          </a>
          <a
            href={CLINIC_CONFIG.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#006e2d] hover:bg-[#005320] text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            <MessageCircle className="w-4 h-4 text-[#7cf994]" />
            <span>WhatsApp</span>
          </a>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
        >
          Submit another appointment request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,41,66,0.04)] flex flex-col gap-5"
    >
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#001428]">
          Request an OPD Appointment
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Fill in your details and our reception desk will contact you to confirm available slots.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: Name and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-bold text-[#001428]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Chandra"
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-bold text-[#001428]">
            Phone Number (+91) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit mobile number"
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Optional Email and Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-700">
            Email Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. name@example.com"
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="age" className="text-xs font-bold text-slate-700">
            Patient Age / Gender <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="age"
            type="text"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="e.g. 34, Male / Female"
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
          />
        </div>
      </div>

      {/* Row 3: Patient Type Segmented Control */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-[#001428]">Patient Status</label>
        <div className="grid grid-cols-2 gap-2 bg-[#f0f3ff] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, patientType: 'new' })}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              formData.patientType === 'new'
                ? 'bg-white text-[#001428] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Patient (First Visit)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, patientType: 'existing' })}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              formData.patientType === 'existing'
                ? 'bg-white text-[#001428] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Existing Patient (Follow-up)
          </button>
        </div>
      </div>

      {/* Row 4: Preferred Date and Time Slot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferredDate" className="text-xs font-bold text-[#001428]">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="preferredDate"
              type="date"
              min={todayStr}
              required
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferredTime" className="text-xs font-bold text-[#001428]">
            Preferred Time Slot <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="preferredTime"
              required
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
            >
              <option value="" disabled>
                Select OPD Slot
              </option>
              <option value="Morning OPD (Mon–Thu: 10:00 AM – 1:30 PM)">
                Morning OPD (Mon – Thu: 10:00 AM – 1:30 PM)
              </option>
              <option value="Evening OPD (Mon–Thu: 5:00 PM – 8:30 PM)">
                Evening OPD (Mon – Thu: 5:00 PM – 8:30 PM)
              </option>
              <option value="Sunday Morning (10:00 AM – 2:00 PM)">
                Sunday Morning (10:00 AM – 2:00 PM)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Row 5: Health Concern Specialty */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="healthConcern" className="text-xs font-bold text-[#001428]">
          Primary Health Concern / Clinical Area
        </label>
        <select
          id="healthConcern"
          value={formData.healthConcern}
          onChange={(e) => setFormData({ ...formData, healthConcern: e.target.value })}
          className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
        >
          {TREATMENTS_DATA.map((t) => (
            <option key={t.slug} value={t.title}>
              {t.title}
            </option>
          ))}
          <option value="General & Preventive Consultation">
            General &amp; Preventive Consultation
          </option>
          <option value="Other Health Concern">Other Specific Health Concern</option>
        </select>
      </div>

      {/* Row 6: Symptoms / Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="symptomsNote" className="text-xs font-bold text-slate-700">
          Brief Description of Condition / Symptoms{' '}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="symptomsNote"
          rows={3}
          value={formData.symptomsNote}
          onChange={(e) => setFormData({ ...formData, symptomsNote: e.target.value })}
          placeholder="Mention how long you have experienced these symptoms or any previous treatments..."
          className="w-full p-3 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
        />
      </div>

      {/* Row 7: Consent Checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="consentAgreed"
          type="checkbox"
          required
          checked={formData.consentAgreed}
          onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
          className="w-4 h-4 text-[#006e2d] rounded border-slate-300 focus:ring-[#006e2d] mt-0.5"
        />
        <label htmlFor="consentAgreed" className="text-xs text-slate-600 leading-normal">
          I agree to be contacted via phone or WhatsApp regarding my appointment request. All
          health information is kept strictly confidential.
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#006e2d] hover:bg-[#005320] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Request...</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5 text-[#7cf994]" />
              <span>Request Appointment</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
          <Shield className="w-3.5 h-3.5 text-[#006e2d]" />
          <span>No automatic confirmation. The clinic verifies token slots directly.</span>
        </div>
      </div>
    </form>
  );
};
