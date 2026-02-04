import React from 'react';
import { useInView } from '../hooks/useInView';
import { useTheme } from '../contexts/ThemeContext';

export const BackgroundGrid: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { resolvedTheme } = useTheme();

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none z-0">
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isInView ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `
            linear-gradient(to right, ${resolvedTheme === 'dark' ? 'rgba(198, 219, 104, 0.08)' : 'rgba(15, 50, 44, 0.08)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${resolvedTheme === 'dark' ? 'rgba(198, 219, 104, 0.08)' : 'rgba(15, 50, 44, 0.08)'} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)'
        }}
      />
    </div>
  );
};