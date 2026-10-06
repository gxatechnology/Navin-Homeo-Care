import React from 'react';
import { TREATMENTS_DATA, CLINIC_CONFIG } from '../config/clinicData';
import { Link, useRouter } from '../context/RouterContext';
import { AppointmentForm } from '../components/AppointmentForm';
import { ConditionIllustration } from '../components/ConditionIllustration';
import {
  Calendar,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface Props {
  slug: string;
}

export const TreatmentDetailPage: React.FC<Props> = ({ slug }) => {
  const { navigate } = useRouter();

  const treatment = TREATMENTS_DATA.find((t) => t.slug === slug);

  if (!treatment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Consultation Area Not Found</h2>
        <p className="text-slate-500 mb-6">The treatment consultation page you requested does not exist.</p>
        <Link
          to="/treatments"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Treatments
        </Link>
      </div>
    );
  }

  // Find related treatments
  const relatedTreatments = TREATMENTS_DATA.filter((t) => t.slug !== slug).slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/treatments" className="hover:text-white transition-colors">Treatments</Link>
            <span>/</span>
            <span className="text-slate-300 truncate max-w-xs">{treatment.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <ConditionIllustration
                slug={treatment.slug}
                title={treatment.title}
                customImage={treatment.image || treatment.illustration}
                size="lg"
                className="bg-white/10 border-white/20 shadow-lg"
              />
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {treatment.categoryLabel}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
                  {treatment.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {treatment.shortDesc}
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-bold block mb-1">
                Consulting Physician
              </span>
              <h3 className="text-lg font-bold text-white mb-1">{CLINIC_CONFIG.doctor.name}</h3>
              <p className="text-xs text-slate-300 mb-4">
                Personalized consultation and patient-centered care at Navin Homeo Care, Alambagh, Lucknow.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call {CLINIC_CONFIG.phone}
                </a>
                <a
                  href={CLINIC_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  WhatsApp Enquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Details column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-700" />
                Understanding the Homeopathic Approach
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {treatment.fullOverview}
              </p>
            </div>

            {/* Common Concerns Treated */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Common Concerns Presented at the Clinic
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Patients visit our Alambagh clinic for comprehensive consultation across varied presentations, including:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(treatment.frequentlyEvaluated || treatment.commonConcerns || []).map((concern: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{concern}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Methodology */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Individual Assessment Protocol
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {treatment.clinicalApproach || treatment.assessmentMethod}
              </p>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-blue-950 block mb-0.5">Appointment Recommendation:</span>
                  Initial consultations generally take 25–45 minutes for comprehensive case-taking. We recommend bringing all past blood reports, imaging, and prescription records.
                </div>
              </div>
            </div>

            {/* Who It Helps */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Who Can Benefit from this Consultation?
              </h3>
              <ul className="space-y-3">
                {(treatment.whatToExpect || treatment.whoItHelps || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-2 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specific FAQs for this condition */}
            {treatment.faqs && treatment.faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-700" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {treatment.faqs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{faq.question}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ethical Clinical Responsibility Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-900">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed text-amber-950">
                <span className="font-semibold block mb-0.5">Medical Care Transparency:</span>
                Dr. Navin Maurya provides individualized homeopathic care based on classic principles. We do not promise magical cures, instant results, or 100% guarantees. In complex systemic diseases, homeopathic therapy works as safe supportive care alongside your routine medical monitoring.
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Form & Clinic Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-md">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Quick Appointment</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Book Your Consultation</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct appointment request for {treatment.title} with Dr. Navin Maurya.
                  </p>
                </div>

                <AppointmentForm initialConcern={treatment.title} />
              </div>

              {/* Clinic Location snippet */}
              <div className="mt-6 bg-slate-900 text-white rounded-2xl p-6">
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-2">Clinic Location</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Near Pakri Ka Pul (500 m), Azad Nagar Road, near Zoom Optical, opposite Singh Medical Store, Alambagh, Lucknow.
                </p>
                <div className="flex gap-2">
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                  >
                    View on Google Maps
                  </a>
                  <a
                    href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 transition-colors"
                  >
                    Call Clinic
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Consultation Areas */}
        <div className="max-w-7xl mx-auto mt-16 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Explore Other Consultation Areas</h3>
              <p className="text-xs text-slate-500">Personalized constitutional homeopathy for your family</p>
            </div>
            <Link
              to="/treatments"
              className="text-xs font-bold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View All Categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTreatments.map((item) => (
              <div
                key={item.slug}
                onClick={() => navigate(`/treatments/${item.slug}`)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <ConditionIllustration
                      slug={item.slug}
                      title={item.title}
                      customImage={item.image || item.illustration}
                      size="sm"
                    />
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 block">
                        {item.categoryLabel}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.shortDesc}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
