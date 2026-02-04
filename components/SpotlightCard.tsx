import React, { useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '' }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const { resolvedTheme } = useTheme();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative rounded-2xl border border-brand-primary/10 dark:border-brand-accent/10 bg-brand-offwhite dark:bg-brand-dark/40 overflow-hidden shadow-xl transition-all duration-300 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${resolvedTheme === 'dark' ? 'rgba(198, 219, 104, 0.1)' : 'rgba(15, 50, 44, 0.05)'}, transparent 40%)`
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};