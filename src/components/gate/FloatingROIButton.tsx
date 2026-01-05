import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FloatingROIButtonProps {
  scrollThreshold?: number;
}

export function FloatingROIButton({ scrollThreshold = 300 }: FloatingROIButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:block"
        >
          <Link
            to="/therapist-roi"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="group flex flex-col items-center gap-1 bg-gradient-to-b from-gold to-gold/90 text-white px-3 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
          >
            <Calculator className="h-5 w-5" />
            <span className="text-xs font-medium">מחשבון הכנסה</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
