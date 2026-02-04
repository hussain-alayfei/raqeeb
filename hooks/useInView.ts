import { useEffect, useState, useRef } from 'react';

export const useInView = (options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px' }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Once in view, we can stop observing if we only want the animation to trigger once
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return { ref, isInView };
};
