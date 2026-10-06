import React, { useState } from 'react';
import { getConditionMedia } from '../config/conditionImages';

interface Props {
  slug: string;
  title?: string;
  customImage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConditionIllustration: React.FC<Props> = ({
  slug,
  title,
  customImage,
  className = '',
  size = 'md',
}) => {
  const media = getConditionMedia(slug);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = customImage || media.imageUrl;
  const FallbackIcon = media.fallbackIcon;

  // Responsive dimension classes
  const sizeClasses = {
    sm: 'w-11 h-11 min-w-[44px]',
    md: 'w-[54px] h-[54px] min-w-[54px] sm:w-[66px] sm:h-[66px] sm:min-w-[66px]',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 min-w-[64px] sm:min-w-[80px]',
  }[size];

  const imgSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-[42px] h-[42px] sm:w-[52px] sm:h-[52px]',
    lg: 'w-12 h-12 sm:w-16 sm:h-16',
  }[size];

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-9 h-9',
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${media.containerBg} border ${media.borderColor} p-1.5 sm:p-2 shadow-2xs group-hover:scale-105 group-hover:shadow-xs group-hover:border-emerald-300/80 transition-all duration-300 shrink-0 overflow-hidden ${sizeClasses} ${className}`}
      title={title || media.title}
    >
      {!hasError ? (
        <>
          {/* Subtle loading pulse until image ready */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-emerald-100/40 animate-pulse rounded-2xl" />
          )}
          <img
            src={imageSrc}
            alt={media.altText}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              setHasError(true);
              setIsLoaded(true);
            }}
            className={`${imgSizeClasses} object-contain select-none transition-transform duration-300 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        /* Graceful Fallback if image path fails */
        <div className="flex items-center justify-center text-[#006e2d]">
          <FallbackIcon className={iconSizeClasses} />
        </div>
      )}
    </div>
  );
};
