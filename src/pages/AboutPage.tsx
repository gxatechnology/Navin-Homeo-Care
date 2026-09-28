import React from 'react';
import { CLINIC_CONFIG, GALLERY_ITEMS } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import {
  Calendar,
  Phone,
  Compass,
  CheckCircle2,
  FileText,
  Activity,
  Clock,
  MapPin,
  Stethoscope,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>About Doctor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Meet Dr. Navin Maurya
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Leading <span className="text-white font-medium">Navin Homeo Care</span> in Alambagh, Lucknow with a dedicated, patient-centered approach to constitutional homeopathic consultation.
          </p>
        </div>
      </section>

      {/* Main Doctor Bio Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Doctor Profile Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  <img
                    src={CLINIC_CONFIG.doctor.image}
                    alt={CLINIC_CONFIG.doctor.name}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-600 text-white mb-1.5 sm:mb-2 shadow-2xs">
                      <Stethoscope className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      Homeopathic Physician
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold">{CLINIC_CONFIG.doctor.name}</h2>
                    <p className="text-[11px] sm:text-xs text-slate-200">
                      {CLINIC_CONFIG.name}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Dedicated Editable Qualifications Block (Per Section H & E) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">
                      Qualifications &amp; Clinical Credentials
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {CLINIC_CONFIG.doctor.qualificationNote}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block italic">
                      (Formal registration records and degree verifications on file at clinic)
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#006e2d] shrink-0" />
                      <span>Alambagh, Lucknow, Uttar Pradesh</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#006e2d] shrink-0" />
                      <span>Mon – Thu: 10:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#006e2d] shrink-0" />
                      <a href={CLINIC_CONFIG.telLink} className="hover:underline font-bold text-slate-900">
                        {CLINIC_CONFIG.phone}
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2.5">
                    <Link
                      to="/appointment"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                    >
                      <Calendar className="w-4 h-4 text-emerald-300" />
                      <span>Book Consultation</span>
                    </Link>
                    <a
                      href={CLINIC_CONFIG.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      <Compass className="w-4 h-4 text-blue-700" />
                      <span>Navigate to Clinic</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Detailed Professional Philosophy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">
                  Clinical Philosophy
                </span>
                <h3 className="text-2xl font-bold text-[#001428] mt-1 mb-4">
                  Individualized Patient Assessment &amp; Thoughtful Care
                </h3>
                <div className="text-slate-600 space-y-4 text-xs sm:text-sm leading-relaxed">
                  <p>
                    At <strong className="text-slate-900 font-bold">Navin Homeo Care</strong>, we believe effective homeopathic management begins with attentive listening. Every individual exhibits unique physical, physiological, and emotional responses to environmental triggers and underlying stressors.
                  </p>
                  <p>
                    Under the clinical direction of <strong className="text-slate-900 font-bold">Dr. Navin Maurya</strong>, consultation sessions are conducted in an unhurried, comfortable atmosphere. Rather than offering one-size-fits-all suggestions, Dr. Maurya carefully evaluates past medical records, lifestyle factors, hereditary tendencies, and current symptomatology.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-[#001428] font-bold text-xs sm:text-sm mb-1">
                      <FileText className="w-4 h-4 text-[#006e2d]" />
                      <span>Detailed History Taking</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Comprehensive evaluation of physical symptoms, chronological disease progression, and previous treatments.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-2 text-[#001428] font-bold text-xs sm:text-sm mb-1">
                      <Activity className="w-4 h-4 text-[#006e2d]" />
                      <span>In-Clinic Vitals &amp; Checkup</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Routine blood pressure and pulse examinations to maintain clinical vigilance alongside constitutional evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Consultation Standards */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">
                  Standards of Practice
                </span>
                <h3 className="text-xl font-bold text-[#001428] mt-1 mb-4">
                  Our Ethical Commitments to Patients
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Transparent, Evidence-Informed Guidance',
                      desc: 'We never promote unrealistic claims or guarantee instant results. Every treatment plan is discussed with transparent timelines and realistic management expectations.',
                    },
                    {
                      title: 'Patient Safety & Non-Interference',
                      desc: 'We respect your existing ongoing conventional medications and never ask patients to discontinue essential emergency or prescription drugs without specialist advice.',
                    },
                    {
                      title: 'Dedicated Follow-Up Reviews',
                      desc: 'Homeopathic treatment response is closely monitored through scheduled follow-ups, adjusting constitutional remedies as your health stabilizes.',
                    },
                    {
                      title: 'Clean, Hygienic Environment',
                      desc: 'Our Alambagh center maintains high standards of hygiene, comfortable waiting space, and an organized product counter.',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility Highlights */}
              <div className="bg-[#001428] text-white rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Clinic Infrastructure</span>
                    <h3 className="text-lg sm:text-xl font-bold mt-1">Visiting Navin Homeo Care</h3>
                  </div>
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    View Clinic Photos &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GALLERY_ITEMS.slice(0, 3).map((item) => (
                    <div key={item.id} className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-800">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-medium text-slate-200 line-clamp-1">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Responsibility Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-amber-950">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="block mb-0.5">Important Note on Healthcare Choices:</strong>
            Homeopathic consultations at Navin Homeo Care are aimed at constitutional support and personalized wellbeing. Patients experiencing severe acute medical emergencies or critical illness should promptly report to nearest hospital emergency departments.
          </div>
        </div>
      </section>
    </div>
  );
};
