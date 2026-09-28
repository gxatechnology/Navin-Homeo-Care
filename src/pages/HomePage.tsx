import React, { useState } from 'react';
import {
  CLINIC_CONFIG,
  TREATMENTS_DATA,
  GALLERY_ITEMS,
  REVIEWS_DATA,
  FAQS_DATA,
} from '../config/clinicData';
import { PRODUCTS_DATA } from '../config/productsData';
import { Link, useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { TreatmentCard } from '../components/TreatmentCard';
import { ReviewCard } from '../components/ReviewCard';
import { FaqAccordion } from '../components/FaqAccordion';
import { EnquiryForm } from '../components/EnquiryForm';
import { LightboxModal } from '../components/LightboxModal';
import {
  Calendar,
  Phone,
  Compass,
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Building,
  UserCheck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ShoppingCart,
  Package,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { addToCart } = useCart();

  // Lightbox state for gallery preview
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<{
    imageUrl: string;
    title: string;
    description: string;
    badge?: string;
  } | null>(null);

  // Quick Add toast notification
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      mrp: product.mrp,
      image: product.image,
      stockQuantity: product.stockQuantity || 20,
    });
    setAddedNotice(product.name);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Toast Notice */}
      {addedNotice && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-50 bg-[#001428] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">{addedNotice} added to cart</span>
          <button
            onClick={() => navigate('/cart')}
            className="ml-2 px-2.5 py-1 bg-white text-[#001428] rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            View
          </button>
        </div>
      )}

      {/* ====================================================
          SECTION 1 — HERO (Clean, Premium, Zero Overlap)
         ==================================================== */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f3ff] via-[#f9f9ff] to-white pt-8 pb-14 lg:py-16 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Rating & Trust Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-2xs border border-slate-200/80 text-xs font-semibold text-slate-800">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-[#001428]">{CLINIC_CONFIG.rating}</span>
                  <span className="text-slate-500">({CLINIC_CONFIG.reviewsCount} Google Reviews)</span>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#006e2d] border border-emerald-200/70 px-3 py-1.5 rounded-full text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006e2d]" />
                  <span>Personalized Consultation</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#001428] tracking-tight leading-[1.15]">
                Personalized Homeopathic Care in Lucknow
              </h1>

              {/* Concise Supporting Text */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Consult <strong className="text-slate-900 font-bold">Dr. Navin Maurya</strong> at{' '}
                <strong className="text-slate-900 font-bold">{CLINIC_CONFIG.name}</strong> for
                personalized homeopathic consultation in Alambagh, Lucknow. Thorough case assessment and supportive care for chronic and recurrent health concerns.
              </p>

              {/* 3 Concise Trust Cards Only (Per Section D) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <UserCheck className="w-5 h-5 text-[#006e2d] shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#001428]">Personalized</span>
                    <span className="text-[11px] text-slate-500">Consultation</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <MapPin className="w-5 h-5 text-[#006e2d] shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#001428]">Convenient Alambagh</span>
                    <span className="text-[11px] text-slate-500">Location (500m Pakri Pul)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <Clock className="w-5 h-5 text-[#006e2d] shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#001428]">Follow-up</span>
                    <span className="text-[11px] text-slate-500">Support</span>
                  </div>
                </div>
              </div>

              {/* CTAs: Primary, Secondary, Text link */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/appointment"
                  className="inline-flex items-center justify-center gap-2 bg-[#006e2d] hover:bg-[#005320] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow transition-all"
                >
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span>Book Appointment</span>
                </Link>

                <a
                  href={CLINIC_CONFIG.telLink}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#001428] hover:bg-slate-50 border border-slate-300 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all"
                >
                  <Phone className="w-4 h-4 text-[#006e2d]" />
                  <span>Call Clinic</span>
                </a>

                <a
                  href={CLINIC_CONFIG.googleDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-slate-700 hover:text-[#006e2d] text-xs font-bold uppercase tracking-wider px-3 py-3 transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#006e2d]" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Right: Easily Replaceable Doctor Image Area (No Clutter Badges, Real Clinic Photo) */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white p-3 rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
                <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={CLINIC_CONFIG.images.doctorDesk}
                    alt="Dr. Navin Maurya at Navin Homeo Care, Alambagh, Lucknow"
                    className="w-full h-full object-cover object-[center_18%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001428]/80 via-transparent to-transparent" />

                  {/* Clean, Non-Fictional Doctor Card */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xs border border-white/60 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#001428]">{CLINIC_CONFIG.doctorName}</h3>
                      <p className="text-[11px] text-[#006e2d] font-semibold">{CLINIC_CONFIG.doctorTitle}</p>
                      <p className="text-[10px] text-slate-500">Navin Homeo Care &amp; Research Center</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase block">Alambagh OPD</span>
                      <span className="text-xs font-bold text-slate-800">Mon – Sat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 2 — TRUST BAR
         ==================================================== */}
      <section className="w-full bg-white py-5 border-b border-slate-200/60 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-[#001428]">
                  Personalized Consultation
                </span>
                <span className="text-[11px] text-slate-500">One-on-One Evaluation</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-[#001428]">
                  Individual Case Assessment
                </span>
                <span className="text-[11px] text-slate-500">Detailed Symptom History</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-[#001428]">
                  Follow-up Support
                </span>
                <span className="text-[11px] text-slate-500">Regular Progress Reviews</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-[#001428]">
                  Convenient Location
                </span>
                <span className="text-[11px] text-slate-500">Alambagh, Azad Nagar Road</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 3 — ABOUT DR. NAVIN MAURYA (Clean & Verified)
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-slate-50" id="about-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              MEET YOUR DOCTOR
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#001428] tracking-tight">
              Meet Dr. Navin Maurya
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Compassionate clinical listening and patient-centered constitutional homeopathic care.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Doctor Photo & Editable Qualifications */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
                <div className="rounded-xl overflow-hidden aspect-4/3 bg-slate-100">
                  <img
                    src={CLINIC_CONFIG.images.doctorDesk}
                    alt="Dr. Navin Maurya in consultation cabin"
                    className="w-full h-full object-cover object-[center_20%]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[#001428]">Dr. Navin Maurya</span>
                    <span className="text-xs font-bold text-[#006e2d] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Homeopathic Physician
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Navin Homeo Care &amp; Research Center, Alambagh, Lucknow
                  </p>
                </div>
              </div>

              {/* Dedicated Editable Qualifications Block (Per Section E) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Qualifications &amp; Credentials
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {CLINIC_CONFIG.doctorQualifications}
                </p>
              </div>
            </div>

            {/* Doctor Introduction & Philosophy */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="space-y-3">
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                  At Navin Homeo Care &amp; Research Center, <strong className="text-[#001428]">Dr. Navin Maurya</strong> provides personalized homeopathic consultation centered on detailed patient listening and constitutional case evaluation.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We believe every individual presents unique physiological, lifestyle, and environmental factors. Our patient-centered philosophy emphasizes gentle, individualized assessment rather than rushed consultation, supporting long-term health and wellbeing.
                </p>
              </div>

              {/* Consultation Philosophy Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#001428] text-white flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <span className="text-xs font-bold text-[#001428]">Individual Case History</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Careful exploration of symptom timeline, family history, and physical traits.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#006e2d] text-white flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <span className="text-xs font-bold text-[#001428]">Personalized Care</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Thoughtful selection of remedies and lifestyle guidance tailored to your needs.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#001428] text-white flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <span className="text-xs font-bold text-[#001428]">Follow-up Reviews</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Dedicated review sessions to monitor health progress and adjust care.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-[#001428] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>Learn More About Doctor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/appointment"
                  className="inline-flex items-center gap-2 text-[#006e2d] hover:text-[#005320] text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 4 — CONDITIONS WE CONSULT FOR (8 Concise Categories)
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-white border-y border-slate-200/60" id="treatments-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              CONSULTATION AREAS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#001428] tracking-tight">
              Conditions We Consult For
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Simple, personalized homeopathic care for acute and recurring health concerns.
            </p>
          </div>

          {/* Concise 8 Cards Grid: 3 cols desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TREATMENTS_DATA.map((t) => (
              <TreatmentCard key={t.slug} treatment={t} />
            ))}
          </div>

          {/* Footer link to all treatments */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/treatments"
              className="inline-flex items-center gap-2 bg-[#001428] hover:bg-[#006e2d] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
            >
              <span>Explore All Consultation Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 5 — WHY CHOOSE US
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-slate-50" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              OUR CARE STANDARDS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#001428] tracking-tight">
              Why Patients Consult Navin Homeo Care
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Committed to ethical care, unhurried listening, and responsible medical practice.
            </p>
          </div>

          {/* 6 Elegant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Personalized Consultation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored individual assessment centered on your unique symptom presentation and health history.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Individual Case Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review of past medical investigations, dietary habits, family tendencies, and lifestyle factors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Patient-Friendly Approach</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unhurried dialogue in Hindi and English with transparent explanations of expected timelines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Comfortable Clinic Environment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean, quiet consultation room, comfortable patient waiting lounge, and organized remedy storage counter.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Convenient Alambagh Location</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centrally located near Pakri Ka Pul (500m) on Azad Nagar Road with straightforward public transit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#001428]">Follow-up Support</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated progress review sessions to monitor health response and adjust care systematically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 6 — FEATURED PRODUCTS / SHOP PREVIEW (Section Q)
          (Max 4 products, does not turn homepage into marketplace)
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-white border-b border-slate-200/60" id="featured-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2 inline-block">
                HEALTH &amp; WELLNESS SHOP
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001428] tracking-tight">
                Health &amp; Wellness Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Natural supportive formulations available from Navin Homeo Care &amp; Research Center.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006e2d] hover:text-[#005320] shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Featured Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS_DATA.slice(0, 4).map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/shop/${product.slug}`)}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div>
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-[#006e2d] shadow-2xs">
                      Shop
                    </span>
                  </div>

                  <div className="p-4 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#006e2d] uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base font-extrabold text-[#001428]">
                      ₹{product.price}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shop/${product.slug}`);
                      }}
                      className="w-full py-1.5 px-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                    >
                      View Product
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full py-1.5 px-2 text-xs font-bold text-white bg-[#006e2d] hover:bg-[#005320] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 7 — CLINIC GALLERY PREVIEW (Real Images)
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-slate-50 border-b border-slate-200/60" id="gallery-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              REAL CLINIC TOUR
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#001428] tracking-tight">
              Inside Navin Homeo Care &amp; Research Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Actual photographs of our consultation cabin, reception lounge, and clinic facilities in Alambagh.
            </p>
          </div>

          {/* Real Clinic Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryItem(item)}
                className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded text-[11px] font-bold text-[#001428] shadow-2xs">
                    {item.categoryLabel}
                  </span>
                </div>
                <div className="p-3.5 flex flex-col">
                  <h4 className="text-sm font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-[#001428] hover:bg-[#006e2d] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all"
            >
              <span>View Full Clinic Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 8 — GOOGLE REVIEWS (Section J Verified Source Requirement)
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-white border-b border-slate-200/60" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Rating Summary Card */}
            <div className="lg:col-span-4 bg-slate-50 p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
              <div>
                <span className="text-xs font-bold text-[#006e2d] uppercase tracking-wider block mb-1">
                  PATIENT FEEDBACK
                </span>
                <h2 className="text-2xl font-bold text-[#001428] tracking-tight">
                  Google Patient Rating
                </h2>
              </div>

              {/* 4.9 Score Badge */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col items-center text-center gap-1.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-extrabold text-[#001428] leading-none">4.9</span>
                  <div className="flex flex-col items-start">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-600">Out of 5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Based on 34 Verified Google Reviews</p>
              </div>

              {/* CTAs: View All Reviews & View on Google (Per Section J) */}
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  to="/reviews"
                  className="w-full py-3 px-4 rounded-xl bg-[#001428] hover:bg-[#006e2d] text-white text-xs font-bold uppercase tracking-wider text-center transition-colors shadow-2xs"
                >
                  View All Reviews
                </Link>
                <a
                  href={CLINIC_CONFIG.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold uppercase tracking-wider text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View on Google</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
                </a>
              </div>
            </div>

            {/* Right Review Cards (Strictly formatted with verified notice per Section J) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {REVIEWS_DATA.slice(0, 4).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 9 — FAQ PREVIEW
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-slate-50 border-b border-slate-200/60" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              PATIENT QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001428] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Common questions about consultation booking, OPD timings, and appointments.
            </p>
          </div>

          <FaqAccordion items={FAQS_DATA.slice(0, 5)} defaultOpenIndex={0} />

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006e2d] hover:underline"
            >
              <span>View all frequently asked questions</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 10 — APPOINTMENT CTA BANNER
         ==================================================== */}
      <section className="w-full py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#001428] text-white rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  CLINICAL CONSULTATION
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Looking for a Homeopathic Consultation in Lucknow?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Book an in-person appointment with Dr. Navin Maurya at Navin Homeo Care &amp; Research Center in Alambagh, Lucknow.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to="/appointment"
                  className="inline-flex items-center justify-center gap-2 bg-[#006e2d] hover:bg-[#005320] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all text-center"
                >
                  <Calendar className="w-4 h-4 text-emerald-300" />
                  <span>Book Appointment</span>
                </Link>

                <a
                  href={CLINIC_CONFIG.telLink}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#001428] hover:bg-slate-100 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all text-center"
                >
                  <Phone className="w-4 h-4 text-[#006e2d]" />
                  <span>Call {CLINIC_CONFIG.phone}</span>
                </a>

                <a
                  href={CLINIC_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 11 — CONTACT / MAP / ENQUIRY FORM
         ==================================================== */}
      <section className="w-full py-14 lg:py-20 bg-slate-50 border-t border-slate-200/60" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#006e2d] uppercase tracking-widest bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full mb-2">
              VISIT OUR CENTER
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#001428] tracking-tight">
              Visit Our Clinic &amp; Book Your Slot
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Schedule an in-person consultation during our OPD hours in Alambagh, Lucknow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Contact Info, Hours & Map */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
                <div>
                  <h3 className="text-base font-bold text-[#001428]">{CLINIC_CONFIG.name}</h3>
                  <p className="text-xs text-[#006e2d] font-semibold mt-0.5">
                    {CLINIC_CONFIG.doctorName} &bull; {CLINIC_CONFIG.doctorTitle}
                  </p>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Clinic Address</span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {CLINIC_CONFIG.address.fullFormatted}
                    </p>
                  </div>
                </div>

                {/* Direct Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006e2d] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Phone Appointment</span>
                    <p className="text-xs font-bold text-[#006e2d] mt-0.5">
                      <a href={CLINIC_CONFIG.telLink} className="hover:underline">
                        {CLINIC_CONFIG.phone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* OPD Hours */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#001428] mb-1">
                    <Clock className="w-4 h-4 text-[#006e2d]" />
                    <span>Clinic OPD Timings</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monday – Saturday:</span>
                    <span className="font-semibold text-slate-900">10:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-semibold text-slate-900">10:00 AM – 2:00 PM</span>
                  </div>
                </div>

                {/* Map Preview */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={CLINIC_CONFIG.images.mapPreview}
                    alt="Alambagh Pakri Ka Pul Google Maps Location"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#001428]/60 flex flex-col items-center justify-center text-center p-3">
                    <MapPin className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-white">Alambagh, Lucknow</span>
                    <span className="text-[11px] text-slate-200">500m from Pakri Ka Pul</span>
                    <a
                      href={CLINIC_CONFIG.googleDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 bg-white text-[#001428] px-3 py-1 rounded-lg text-xs font-bold shadow hover:bg-slate-50 transition-colors"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-[#006e2d]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Fast Consultation Request Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-bold text-[#001428]">Request an Appointment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit your details and our reception desk will contact you to confirm timing.
                </p>
              </div>

              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedGalleryItem && (
        <LightboxModal
          isOpen={!!selectedGalleryItem}
          onClose={() => setSelectedGalleryItem(null)}
          imageUrl={selectedGalleryItem.imageUrl}
          title={selectedGalleryItem.title}
          description={selectedGalleryItem.description}
          badge={selectedGalleryItem.badge}
        />
      )}
    </div>
  );
};
