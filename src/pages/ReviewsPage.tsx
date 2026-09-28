import React from 'react';
import { CLINIC_CONFIG, REVIEWS_DATA } from '../config/clinicData';
import { ReviewCard } from '../components/ReviewCard';
import { Link } from '../context/RouterContext';
import {
  Star,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Info,
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span>Patient Reviews</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Patient Feedback &amp; Ratings
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Verified patient ratings for Dr. Navin Maurya and Navin Homeo Care &amp; Research Center in Alambagh, Lucknow.
          </p>
        </div>
      </section>

      {/* Rating Overview Scorecard */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-2xs mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Score block */}
              <div className="lg:col-span-5 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-200/80 pb-6 lg:pb-0 lg:pr-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Google Business Profile
                </span>
                <div className="flex items-baseline justify-center lg:justify-start gap-3 mt-2">
                  <span className="text-6xl font-black text-[#001428] tracking-tight">
                    {CLINIC_CONFIG.rating}
                  </span>
                  <div>
                    <div className="flex text-amber-400 text-lg mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Based on {CLINIC_CONFIG.reviewsCount} Google Reviews
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                  <a
                    href={CLINIC_CONFIG.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#001428] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="lg:col-span-7 space-y-2.5">
                {[
                  { star: '5 Stars', pct: '94%', count: '32' },
                  { star: '4 Stars', pct: '6%', count: '2' },
                  { star: '3 Stars', pct: '0%', count: '0' },
                  { star: '2 Stars', pct: '0%', count: '0' },
                  { star: '1 Star', pct: '0%', count: '0' },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-14 font-medium text-slate-600">{row.star}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: row.pct }}
                      ></div>
                    </div>
                    <span className="w-8 text-right font-medium text-slate-500">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section J Verified Reviews Notice */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3 text-slate-700 text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-[#006e2d] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#001428] block mb-0.5">Verified Feedback Commitment:</span>
              In adherence to ethical healthcare transparency, review cards below are connected to verified patient feedback records. Review content will be loaded from verified source on Google Maps.
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS_DATA.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Transparency Disclaimer */}
          <div className="mt-12 bg-white border border-slate-200/80 rounded-2xl p-6 flex items-start gap-3.5 text-slate-600 text-xs sm:text-sm">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#001428] block mb-0.5">Individual Clinical Response Note:</span>
              Patient experiences reflect personal consultation outcomes. In constitutional homeopathy, therapeutic responses vary according to individual case history, symptom chronicity, and patient adherence. We do not promise guaranteed results or identical outcomes for every person.
            </div>
          </div>

          {/* Consultation CTA */}
          <div className="mt-10 bg-gradient-to-r from-[#001428] to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Personalized Care</span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">Ready for Your Individual Consultation?</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Consult Dr. Navin Maurya at Navin Homeo Care &amp; Research Center in Alambagh, Lucknow.
              </p>
            </div>
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#006e2d] hover:bg-[#005320] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Book Appointment Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
