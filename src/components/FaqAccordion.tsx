import React, { useState } from 'react';
import { FaqItem } from '../config/clinicData';
import { ChevronDown } from 'lucide-react';

interface Props {
  items: FaqItem[];
  defaultOpenIndex?: number;
}

export const FaqAccordion: React.FC<Props> = ({ items, defaultOpenIndex = 0 }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(defaultOpenIndex);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-3 w-full" role="region" aria-label="Frequently Asked Questions">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className={`border rounded-xl transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-slate-300 shadow-sm'
                : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-semibold text-sm sm:text-base text-[#001428] hover:text-[#006e2d] transition-colors cursor-pointer"
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <div
                className={`w-7 h-7 rounded-full bg-[#f0f3ff] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-[#006e2d]/10 text-[#006e2d]' : 'text-slate-500'
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
