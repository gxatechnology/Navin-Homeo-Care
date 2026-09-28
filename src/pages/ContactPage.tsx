import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { AppointmentForm } from '../components/AppointmentForm';
import { Link } from '../context/RouterContext';
import {
  MapPin,
  Phone,
  Clock,
  Compass,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Sparkles,
  Info,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Contact &amp; Location</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Contact &amp; Visit Us in Alambagh
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            Get in touch with Navin Homeo Care to schedule an appointment or ask for directions. Dr. Navin Maurya welcomes patients from across Lucknow and surrounding regions.
          </p>
        </div>
      </section>

      {/* Main Details and Map Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Contact Cards and Directions Info */}
            <div className="lg:col-span-6 space-y-6">
              {/* Primary Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Clinic Information</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 mb-6">
                  {CLINIC_CONFIG.name}
                </h2>

                <div className="space-y-6">
                  {/* Doctor */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <span className="font-bold text-sm">Dr</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Consulting Physician</span>
                      <p className="text-base font-bold text-slate-900">{CLINIC_CONFIG.doctor.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{CLINIC_CONFIG.doctor.qualificationNote}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone Consultation &amp; Enquiries</span>
                      <p className="text-base font-bold text-slate-900">
                        <a href={`tel:${CLINIC_CONFIG.phoneRaw}`} className="hover:text-blue-700 hover:underline">
                          {CLINIC_CONFIG.phone}
                        </a>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Direct reception desk for appointment slots</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">WhatsApp Messages</span>
                      <p className="text-base font-bold text-slate-900">
                        <a
                          href={CLINIC_CONFIG.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-emerald-700 hover:underline"
                        >
                          +91 73183 06699
                        </a>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Send message for quick slot booking or clinic location</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Physical Address</span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug mt-0.5">
                        {CLINIC_CONFIG.address.full}
                      </p>
                    </div>
                  </div>

                  {/* Timings */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="w-full">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">OPD Timings</span>
                      <div className="mt-2 space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="font-medium text-slate-900">Monday – Thursday</span>
                          <span className="font-semibold text-emerald-700">10:00 AM – 8:00 PM</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="font-medium text-slate-900">Friday – Saturday</span>
                          <span className="font-semibold text-rose-600">Closed / Off</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="font-medium text-slate-900">Sunday</span>
                          <span className="font-semibold text-emerald-700">10:00 AM – 2:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Action buttons */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    Call Clinic
                  </a>
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
                  >
                    <Compass className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Landmark Guidance Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Landmarks &amp; Directions</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-4">
                  How to Reach Navin Homeo Care
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      label: 'Pakri Ka Pul (500 Meters):',
                      desc: 'Proceed 500 meters along Azad Nagar Road towards the clinic.',
                    },
                    {
                      label: 'Opposite Singh Medical Store:',
                      desc: 'Our clinic storefront is clearly visible right across Singh Medical Store on Azad Nagar Road.',
                    },
                    {
                      label: 'Near Zoom Optical:',
                      desc: 'Located adjacent to Zoom Optical with a prominent blue & green bilingual signboard.',
                    },
                    {
                      label: 'Parking & Entry:',
                      desc: 'Street two-wheeler and four-wheeler parking available with convenient ground floor patient entrance.',
                    },
                  ].map((lm, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold text-slate-900">{lm.label}</span>{' '}
                        <span className="text-slate-600">{lm.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Interactive Map & Appointment Booking */}
            <div className="lg:col-span-6 space-y-6">
              {/* Map embed */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Google Maps Location &bull; 26.8046683, 80.911486
                    </span>
                  </div>
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Open Full Map <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative aspect-16/10 w-full bg-slate-100">
                  <iframe
                    title="Navin Homeo Care Location Map"
                    src={`https://www.google.com/maps?q=${CLINIC_CONFIG.coordinates.lat},${CLINIC_CONFIG.coordinates.lng}&hl=en&z=16&output=embed`}
                    className="w-full h-full border-0"
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                  <span>Alambagh, Lucknow &bull; Pakri Ka Pul (500m)</span>
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-900 hover:text-blue-700"
                  >
                    Get GPS Directions &rarr;
                  </a>
                </div>
              </div>

              {/* Consultation Booking Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Online Slot Request</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Book an In-Clinic Consultation</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submit your request and our reception team will confirm your preferred timing.
                  </p>
                </div>

                <AppointmentForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
