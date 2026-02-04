import React from 'react';
import { useInView } from '../hooks/useInView';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  dir?: 'ltr' | 'rtl';
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className = '', delay = 0, dir = 'ltr' }) => {
  const { ref, isInView } = useInView({ threshold: 0.5 });
  const isRtl = dir === 'rtl';

  return (
    <h2 ref={ref} className={`flex flex-wrap gap-[0.3em] ${className}`} aria-label={text} dir={dir}>
      {text.split(" ").map((word, wordIndex) => (
        // Added pb-4 to prevent cutting off Arabic diacritics/dots below the baseline
        <span key={wordIndex} className="inline-block overflow-hidden pb-6 -mb-4 pt-2 -mt-2 px-1 -mx-1">
          <span className="inline-block whitespace-nowrap">
            {isRtl ? (
              <span
                className={`inline-block transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.4,1)] will-change-transform ${
                  isInView 
                    ? 'translate-y-0 opacity-100 blur-0 scale-100' 
                    : 'translate-y-[140%] opacity-0 blur-lg scale-110'
                }`}
                style={{
                  // Increased delay multiplier from 80 to 220 for RTL to match the visual duration of LTR char-by-char reveal
                  transitionDelay: `${delay + wordIndex * 220}ms`
                }}
              >
                {word}
              </span>
            ) : (
              word.split("").map((char, charIndex) => (
                <span
                  key={charIndex}
                  className={`inline-block transition-all duration-1000 ease-[cubic-bezier(0.2,1,0.4,1)] will-change-transform ${
                    isInView 
                      ? 'translate-y-0 opacity-100 blur-0 scale-100' 
                      : 'translate-y-[140%] opacity-0 blur-lg scale-110'
                  }`}
                  style={{
                    transitionDelay: `${delay + wordIndex * 80 + charIndex * 30}ms`
                  }}
                >
                  {char}
                </span>
              ))
            )}
          </span>
        </span>
      ))}
    </h2>
  );
};