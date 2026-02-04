
import React, { useRef, useState, useEffect } from 'react';
import { BookOpen, Home, Sparkles, User, Scale, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  user?: { name: string; role: string } | null;
  onLogout?: () => void;
  onOpenWorkspace?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenWorkspace }) => {
  const navRef = useRef<HTMLElement>(null);
  const { t, dir } = useLanguage();
  const { resolvedTheme } = useTheme();
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Home');

  const navItems = [
    { name: t('nav.home'), id: 'Home', icon: Home },
    { name: t('nav.features'), id: 'Features', icon: Sparkles },
    { name: t('nav.blog'), id: 'Blog', icon: BookOpen },
  ];

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 50);
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <header className={`fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[200%] opacity-0'}`}>
      <nav 
        ref={navRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className="pointer-events-auto group relative flex items-center h-[88px] rounded-full p-[2px] shadow-2xl bg-transparent"
      >
        <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-[-100%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,#0F322C_0%,#C6DB68_25%,#0E5A4A_50%,#C6DB68_75%,#0F322C_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="absolute inset-[1.5px] rounded-full bg-brand-dark/60 backdrop-blur-xl overflow-hidden transition-colors duration-500">
            <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-500 rounded-full z-0"
                style={{
                    opacity,
                    background: `radial-gradient(120px circle at ${position.x}px ${position.y}px, rgba(198, 219, 104, 0.15), transparent 50%)`,
                }}
            />
        </div>

        <div className="relative z-10 flex items-center justify-between w-full h-full gap-6 px-8">
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center gap-3 cursor-pointer select-none">
                <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center text-brand-accent">
                    <Scale size={24} />
                </div>
                <span className="text-3xl font-black tracking-tighter text-brand-accent transition-colors duration-300 font-changa">
                    رقيب
                </span>
              </a>
            </div>

            <div className="w-[1px] h-10 bg-brand-accent/10 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const isHovered = hoveredTab === item.id;
                const showText = isActive || isHovered;

                return (
                  <button
                    key={item.id}
                    onMouseEnter={() => setHoveredTab(item.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center justify-center rounded-full transition-all duration-500 h-14 px-6
                      ${isActive 
                        ? 'bg-brand-accent text-brand-primary shadow-lg' 
                        : 'text-brand-accent/60 hover:bg-brand-accent/5'
                      }`}
                    aria-label={item.name}
                  >
                    <item.icon size={20} className="relative z-10" />
                    <AnimatePresence>
                      {showText && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="whitespace-nowrap font-bold text-base overflow-hidden relative z-10 mr-2"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            <div className="w-[1px] h-10 bg-brand-accent/10 hidden sm:block"></div>

            <div className="flex items-center gap-4">
                {user && (
                   <button 
                    onClick={onOpenWorkspace}
                    className="flex items-center gap-2 bg-brand-accent text-brand-primary px-5 h-12 rounded-full font-black text-sm hover:scale-105 transition-all shadow-lg"
                   >
                     <ShieldCheck size={18} />
                     <span className="hidden sm:inline">{t('nav.smart_verify')}</span>
                   </button>
                )}
                
                {user ? (
                  <div className="flex items-center gap-4 bg-brand-accent/10 px-4 py-2 rounded-full border border-brand-accent/20">
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-black text-brand-accent">{user.name}</p>
                      <p className="text-[10px] text-brand-offwhite/50">{user.role}</p>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="w-10 h-10 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center transition-all hover:bg-brand-accent hover:text-brand-primary"
                      title={t('nav.logout')}
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button className="w-12 h-12 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center transition-all shadow-md">
                    <User size={20} />
                  </button>
                )}
            </div>
        </div>
      </nav>
    </header>
  );
};
