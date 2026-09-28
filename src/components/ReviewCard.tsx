import React from 'react';
import { ReviewItem } from '../config/clinicData';
import { Star } from 'lucide-react';

interface Props {
  review: ReviewItem;
}

export const ReviewCard: React.FC<Props> = ({ review }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,41,66,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#006e2d] bg-[#f0f3ff] px-2 py-0.5 rounded-full">
            {review.date || 'Verified Patient'}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed italic mt-1">
          &ldquo;{review.text}&rdquo;
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0f2942] text-white font-bold flex items-center justify-center text-xs shrink-0">
          {review.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#001428]">{review.author}</span>
          <span className="text-xs text-slate-500">{review.location}</span>
        </div>
      </div>
    </div>
  );
};
