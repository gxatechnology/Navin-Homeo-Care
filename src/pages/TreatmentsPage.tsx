import React, { useState } from 'react';
import { TREATMENTS_DATA } from '../config/clinicData';
import { TreatmentCard } from '../components/TreatmentCard';
import { Link } from '../context/RouterContext';
import {
  Calendar,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Info,
} from 'lucide-react';

export const TreatmentsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'skin-hair', label: 'Skin & Hair' },
    { id: 'respiratory', label: 'Allergy & Breathing' },
    { id: 'digestive', label: 'Digestive Problems' },
    { id: 'musculoskeletal', label: 'Joint & Back Pain' },
    { id: 'women-child', label: 'Women & Child Health' },
    { id: 'chronic', label: 'Chronic Health' },
    { id: 'general', label: 'General Health' },
  ];

  const filteredTreatments = TREATMENTS_DATA.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const concerns = item.commonConcerns || item.frequentlyEvaluated || [];
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concerns.some((c: string) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Conditions &amp; Treatments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Conditions We Consult For
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Personalized homeopathic consultation tailored to your individual health journey in Alambagh, Lucknow.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#001428] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search health concerns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* Main Grid: 3 cards desktop, 2 tablet, 1 mobile */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredTreatments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <p className="text-slate-500 text-sm mb-4">
                No matching consultation areas found for "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#001428] text-white cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTreatments.map((treatment) => (
                <TreatmentCard key={treatment.slug} treatment={treatment} />
              ))}
            </div>
          )}

          {/* Consultation Process Steps */}
          <div className="mt-14 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-2xs">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006e2d]">
                CONSULTATION PROTOCOL
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#001428] mt-1">
                The Consultation Journey at Navin Homeo Care
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                A structured 4-step approach to understand your health history and provide supportive constitutional guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Comprehensive Intake',
                  desc: 'Discussion of symptoms, past medical history, hereditary factors, and emotional wellness.',
                },
                {
                  step: '02',
                  title: 'Case Assessment',
                  desc: 'Careful homeopathic case analysis correlating symptoms with materia medica profiles.',
                },
                {
                  step: '03',
                  title: 'Personalized Care',
                  desc: 'Providing constitutional remedies with clear usage and dosage guidelines.',
                },
                {
                  step: '04',
                  title: 'Monitored Follow-Up',
                  desc: 'Scheduled progress evaluations to observe constitutional response and adapt care as you improve.',
                },
              ].map((item, idx) => (
                <div key={idx} className="relative p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-2xl font-black text-blue-900/20 block mb-2">{item.step}</span>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ethical Disclaimer */}
          <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-5 flex items-start gap-3.5 text-slate-700">
            <Info className="w-5 h-5 text-[#006e2d] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-[#001428] block mb-0.5">Medical Responsibility &amp; Realistic Expectations:</span>
              Homeopathic consultations support your health and wellbeing. Treatment response varies per individual constitution and case history. We strictly refrain from making misleading claims such as 100% cure, permanent guarantees, or instant remedies.
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 bg-gradient-to-r from-[#001428] to-blue-950 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">Unsure which category suits your symptoms?</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Reach out to our Alambagh clinic team directly. We are happy to guide you on appointment slots.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/appointment"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                Book Consultation
              </Link>
              <a
                href="tel:07318306699"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all backdrop-blur-xs"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                Call 073183 06699
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
