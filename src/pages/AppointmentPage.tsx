import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { AppointmentForm } from '../components/AppointmentForm';
import { Link } from '../context/RouterContext';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Stethoscope,
  Info,
} from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Book Appointment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Schedule Your Consultation
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            Reserve your consultation slot with Dr. Navin Maurya at Navin Homeo Care &amp; Research Center in Alambagh, Lucknow. Thorough case-taking and constitutional evaluation for your health needs.
          </p>
        </div>
      </section>

      {/* Main Form and Guidelines */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: What to Expect & Preparation */}
          <div className="lg:col-span-5 space-y-6">
            {/* Consultation Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Consultation Protocol</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-4">
                What to Prepare Before Your Visit
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                To help Dr. Navin Maurya understand your individual constitutional profile thoroughly, please keep the following details accessible:
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Past Investigation Records',
                    desc: 'Bring any recent blood tests, sonography, X-rays, allergy panels, or relevant diagnostic reports.',
                  },
                  {
                    title: 'Current Prescriptions List',
                    desc: 'A complete list of ongoing conventional or allopathic medications. We never advise abruptly stopping essential medicines.',
                  },
                  {
                    title: 'Symptom Timeline',
                    desc: 'Note down when symptoms began, what aggravates or relieves discomfort, and any family history of chronic illness.',
                  },
                  {
                    title: 'Sufficient Time for Evaluation',
                    desc: 'An initial homeopathic intake takes approximately 25 to 45 minutes for comprehensive case-taking.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Clinic Visiting Hours
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Monday – Saturday:</span>
                  <span className="font-semibold text-emerald-400">10:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sunday:</span>
                  <span className="font-semibold text-emerald-400">10:00 AM – 2:00 PM</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400 mb-3">
                  Prefer direct phone booking or have an urgent query?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call 073183 06699
                  </a>
                  <a
                    href={CLINIC_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Location guidance */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Clinic Location</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {CLINIC_CONFIG.address.full}
                  </p>
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    Get GPS Directions &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Full Booking Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Online Registration</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Book In-Person Appointment</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Fill out the form below. Our reception desk will review slot availability and confirm your booking.
                </p>
              </div>

              <AppointmentForm />

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Note: Appointment requests are subject to clinic opening schedule. For same-day emergency queries or rapid confirmation, please call our clinic front desk directly.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
