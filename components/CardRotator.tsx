import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { CardItem } from '../types';
import { AnimatedButton } from './AnimatedButton';
import { useLanguage } from '../contexts/LanguageContext';

interface CardRotatorProps {
  items: CardItem[];
}

export const CardRotator: React.FC<CardRotatorProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { dir, language, t } = useLanguage();

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlaying(false);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[600px] flex items-center justify-center">
      
      {/* Navigation Buttons */}
      <button 
        onClick={dir === 'ltr' ? prev : next}
        className="absolute left-4 z-20 p-4 rounded-full bg-white/50 dark:bg-neutral-900/50 hover:bg-white/80 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 backdrop-blur-md transition-all active:scale-95 shadow-lg"
      >
        <ChevronLeft className={`w-6 h-6 text-neutral-900 dark:text-white ${dir === 'rtl' ? 'rotate-180' : ''}`} />
      </button>

      <button 
        onClick={dir === 'ltr' ? next : prev}
        className="absolute right-4 z-20 p-4 rounded-full bg-white/50 dark:bg-neutral-900/50 hover:bg-white/80 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 backdrop-blur-md transition-all active:scale-95 shadow-lg"
      >
        <ChevronRight className={`w-6 h-6 text-neutral-900 dark:text-white ${dir === 'rtl' ? 'rotate-180' : ''}`} />
      </button>

      {/* Cards Container */}
      <div className="relative w-full h-full flex items-center justify-center perspective-1000">
        {items.map((item, index) => {
          let state = 'hidden';
          if (index === activeIndex) state = 'center';
          else if (index === (activeIndex + 1) % items.length) state = 'right';
          else if (index === (activeIndex - 1 + items.length) % items.length) state = 'left';

          const getTransform = (s: string) => {
             switch(s) {
                 case 'center': return 'scale-100 opacity-100 translate-x-0 rotate-0 grayscale-0 z-10 shadow-2xl';
                 // Keep visual left/right consistent regardless of direction
                 case 'left': return 'scale-90 opacity-40 -translate-x-[60%] -rotate-6 grayscale z-0';
                 case 'right': return 'scale-90 opacity-40 translate-x-[60%] rotate-6 grayscale z-0';
                 default: return 'scale-75 opacity-0 translate-y-10 z-[-1]';
             }
          }

          const currentStateClass = getTransform(state);

          return (
            <div
              key={item.id + language}
              className={`absolute w-[60%] aspect-[4/3] rounded-2xl p-6 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-end overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 ${currentStateClass}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 transform transition-all duration-500 delay-100">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-neutral-300 mb-6 max-w-md">{item.description}</p>
                <div className={`${state === 'center' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                  <AnimatedButton>
                    {dir === 'rtl' ? (
                        <div className="flex items-center gap-2">
                           <ArrowLeft className="w-4 h-4" />
                           <span>{t('showcase.button')}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>{t('showcase.button')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    )}
                  </AnimatedButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveIndex(idx); setIsAutoPlaying(false); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'w-8 bg-white' : 'bg-neutral-400 hover:bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};