import React from 'react';
import { TreatmentData } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Heart,
  Wind,
  Stethoscope,
  Smile,
  Zap,
} from 'lucide-react';

interface Props {
  treatment: TreatmentData;
}

const getTreatmentIcon = (slug: string) => {
  switch (slug) {
    case 'skin-and-hair':
      return <Sparkles className="w-5 h-5 text-[#006e2d]" />;
    case 'allergy-and-respiratory':
      return <Wind className="w-5 h-5 text-[#006e2d]" />;
    case 'digestive-health':
      return <Activity className="w-5 h-5 text-[#006e2d]" />;
    case 'joint-and-musculoskeletal':
      return <Zap className="w-5 h-5 text-[#006e2d]" />;
    case 'womens-health':
      return <Heart className="w-5 h-5 text-[#006e2d]" />;
    case 'child-health':
      return <Smile className="w-5 h-5 text-[#006e2d]" />;
    case 'chronic-health':
      return <Stethoscope className="w-5 h-5 text-[#006e2d]" />;
    case 'general-consultation':
    default:
      return <Shield className="w-5 h-5 text-[#006e2d]" />;
  }
};

export const TreatmentCard: React.FC<Props> = ({ treatment }) => {
  // Maximum 3 common-condition tags
  const tags = (treatment.commonConcerns || treatment.frequentlyEvaluated || []).slice(0, 3);

  return (
    <article className="group bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3">
        {/* Simple Category Title with Medical Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            {getTreatmentIcon(treatment.slug)}
          </div>
          <h3 className="text-lg font-bold text-[#001428] group-hover:text-[#006e2d] transition-colors leading-snug">
            {treatment.title}
          </h3>
        </div>

        {/* One Short Sentence Describing Common Concerns */}
        <p className="text-sm text-slate-600 leading-relaxed pt-1">
          {treatment.shortDesc}
        </p>

        {/* Maximum 3 Common-Condition Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
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
      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
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
