import React, { useState } from 'react';
import { FAQS_DATA, CLINIC_CONFIG } from '../config/clinicData';
import { FaqAccordion } from '../components/FaqAccordion';
import { Link } from '../context/RouterContext';
import {
  HelpCircle,
  Search,
  Phone,
  MessageCircle,
  Calendar,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'booking', label: 'Appointments & Booking' },
    { id: 'consultation', label: 'Consultation & Visit' },
    { id: 'treatment', label: 'Homeopathic Principles' },
    { id: 'location', label: 'Location & Timing' },
  ];

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCat =
      activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            Patient Questions &amp; Answers
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
            Find answers to commonly asked questions about booking appointments, consultation expectations, clinic timings, and constitutional homeopathic care with Dr. Navin Maurya.
          </p>
        </div>
      </section>

      {/* Main FAQ Container */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Search bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm mb-6 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm text-slate-800 bg-transparent focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion Component */}
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
              <p className="text-slate-500 text-sm mb-4">
                No matching answers found for "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-900 text-white"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <FaqAccordion items={filteredFaqs} defaultOpenIndex={0} />
            </div>
          )}

          {/* Ask Directly Card */}
          <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Have a question not listed here?</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Our clinic reception team at Alambagh is available to guide you regarding appointment timings, directions, or doctor availability.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0 w-full sm:w-auto">
              <a
                href={`tel:${CLINIC_CONFIG.phoneRaw}`}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Desk
              </a>
              <a
                href={CLINIC_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
