import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  className?: string;
  speed?: 'slow' | 'fast';
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  children, 
  direction = 'left', 
  className = '',
  speed = 'slow'
}) => {
  return (
    <div className={`relative flex overflow-hidden user-select-none gap-8 ${className}`}>
      {/* Alpha Masks - Adaptive to theme via Tailwind classes */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-black to-transparent z-10 pointer-events-none transition-colors duration-500"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-black to-transparent z-10 pointer-events-none transition-colors duration-500"></div>

      <div className={`flex shrink-0 gap-8 min-w-full justify-around ${
        direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
      } ${speed === 'slow' ? 'duration-[40s]' : 'duration-[20s]'}`}>
        {children}
      </div>
      <div className={`flex shrink-0 gap-8 min-w-full justify-around ${
        direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse'
      } ${speed === 'slow' ? 'duration-[40s]' : 'duration-[20s]'}`}>
        {children}
      </div>
    </div>
  );
};