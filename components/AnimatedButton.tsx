import React from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', onClick, variant = 'primary' }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-full px-10 py-4 text-base font-bold transition-all active:scale-95 ${className} ${
        variant === 'primary' ? 'text-brand-offwhite' : 'text-brand-primary dark:text-brand-accent'
      }`}
    >
      {/* Moving border gradient */}
      <span className="absolute inset-[-2px] rounded-full overflow-hidden">
        <span className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#C6DB68_0%,#0F322C_50%,#C6DB68_100%)] animate-[spin_4s_linear_infinite] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      
      {/* Background Mask */}
      <span className={`absolute inset-[1px] rounded-full transition-colors duration-300 ${
        variant === 'primary' 
          ? 'bg-brand-primary group-hover:bg-brand-secondary' 
          : 'bg-brand-offwhite dark:bg-brand-dark'
      }`} />
      
      {/* Content */}
      <span className="relative flex items-center gap-2 z-10">
        {children}
      </span>
      
      {/* Glow */}
      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-brand-accent/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};