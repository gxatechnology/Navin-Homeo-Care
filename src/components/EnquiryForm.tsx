import React, { useState } from 'react';
import { submitAppointmentRequest, SubmissionResponse } from '../services/appointmentService';
import { TREATMENTS_DATA } from '../config/clinicData';
import { Send, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export const EnquiryForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [concern, setConcern] = useState('General Consultation');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<SubmissionResponse | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await submitAppointmentRequest({
        fullName,
        phone,
        preferredDate,
        preferredTime,
        healthConcern: concern,
        symptomsNote: notes,
        patientType: 'new',
        consentAgreed: true,
      });
      setSuccessResponse(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to submit request. Please try again or call the clinic.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successResponse) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center flex flex-col items-center gap-3">
        <CheckCircle2 className="w-10 h-10 text-[#006e2d]" />
        <h4 className="text-lg font-bold text-[#001428]">Appointment Request Received!</h4>
        <p className="text-sm text-slate-700 leading-relaxed max-w-md">
          {successResponse.message}
        </p>
        <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-3 py-1 rounded-md border border-emerald-200">
          Ref: {successResponse.bookingReference}
        </span>
        <button
          onClick={() => {
            setSuccessResponse(null);
            setFullName('');
            setPhone('');
            setPreferredDate('');
            setPreferredTime('');
            setNotes('');
          }}
          className="mt-2 text-xs font-bold text-[#006e2d] hover:underline cursor-pointer"
        >
          Book another slot
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="enquiryName" className="text-xs font-bold text-[#001428]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="enquiryName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ramesh Chandra"
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1">
          <label htmlFor="enquiryPhone" className="text-xs font-bold text-[#001428]">
            Phone Number (+91) <span className="text-red-500">*</span>
          </label>
          <input
            id="enquiryPhone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="enquiryDate" className="text-xs font-bold text-[#001428]">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            id="enquiryDate"
            type="date"
            min={todayStr}
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
          />
        </div>

        {/* Time Slot */}
        <div className="flex flex-col gap-1">
          <label htmlFor="enquiryTime" className="text-xs font-bold text-[#001428]">
            Preferred Time Slot <span className="text-red-500">*</span>
          </label>
          <select
            id="enquiryTime"
            required
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
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

      {/* Concern Specialty */}
      <div className="flex flex-col gap-1">
        <label htmlFor="enquiryConcern" className="text-xs font-bold text-[#001428]">
          Consultation Concern / Specialty
        </label>
        <select
          id="enquiryConcern"
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
        >
          <option value="General Consultation">
            General / Preventive Homeopathic Consultation
          </option>
          {TREATMENTS_DATA.map((t) => (
            <option key={t.slug} value={t.title}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Brief Notes */}
      <div className="flex flex-col gap-1">
        <label htmlFor="enquiryNotes" className="text-xs font-bold text-slate-700">
          Brief Symptoms Note <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="enquiryNotes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Please describe how long you have had this condition or any relevant prior treatments..."
          className="w-full p-3 rounded-lg bg-[#f0f3ff]/60 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#006e2d] focus:ring-2 focus:ring-[#006e2d]/20 transition-all"
        />
      </div>

      {/* Form Action */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#006e2d] hover:bg-[#005320] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#7cf994]" />
              <span>Request Appointment Now</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-1">
          <Lock className="w-3.5 h-3.5 text-[#006e2d]" />
          <span>Your health details are strictly confidential. We never share patient information.</span>
        </div>
      </div>
    </form>
  );
};
