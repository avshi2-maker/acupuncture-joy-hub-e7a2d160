import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToTopButtonProps {
  threshold?: number;
}

export function BackToTopButton({ threshold = 400 }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="h-12 w-12 rounded-full bg-gradient-to-br from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-white shadow-lg shadow-gold/30 hover:shadow-xl hover:shadow-gold/40 transition-all"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">חזרה למעלה</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BackToTopButton;
