import React from 'react';
import { TreatmentData } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import { ConditionIllustration } from './ConditionIllustration';
import { ArrowRight } from 'lucide-react';

interface Props {
  treatment: TreatmentData;
}

export const TreatmentCard: React.FC<Props> = ({ treatment }) => {
  // Maximum 3 common-condition tags
  const tags = (treatment.commonConcerns || treatment.frequentlyEvaluated || []).slice(0, 3);

  return (
    <article className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3.5">
        {/* Category Title with Medical Condition Illustration */}
        <div className="flex items-center gap-3.5">
          <ConditionIllustration
            slug={treatment.slug}
            title={treatment.title}
            customImage={treatment.image || treatment.illustration}
            size="md"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#006e2d] uppercase tracking-wider">
              {treatment.categoryLabel || 'Consultation'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors leading-snug">
              {treatment.title}
            </h3>
          </div>
        </div>

        {/* One Short Sentence Describing Common Concerns */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
          {treatment.shortDesc}
        </p>

        {/* Maximum 3 Common-Condition Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View Details Button */}
      <div className="pt-4 mt-4 sm:pt-5 sm:mt-5 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/treatments/${treatment.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006e2d] hover:text-[#005320] group-hover:translate-x-0.5 transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
};
