import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  description: string;
  badge?: string;
}

export const LightboxModal: React.FC<Props> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description,
  badge,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#001428]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#f0f3ff]/60">
          <div className="flex items-center gap-3">
            {badge && (
              <span className="text-xs font-bold text-[#006e2d] bg-[#7cf994]/30 px-2.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            <h4 className="text-base sm:text-lg font-bold text-[#001428] truncate">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close image modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Image Box */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-900 flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
