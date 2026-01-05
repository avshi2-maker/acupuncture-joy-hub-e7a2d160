import { useState, useRef, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tier {
  name: string;
  nameHe: string;
  price: string;
  period?: string;
  periodSub?: string;
  queriesLimit: string;
  tokensInfo: string;
  description: string;
  features: { name: string; included: boolean }[];
  highlighted?: boolean;
}

interface MobileTierCarouselProps {
  tiers: Tier[];
  recommendedPlan: string | null;
  onSelectTier: (tierName: string) => void;
  onCalculatorClick: () => void;
}

export function MobileTierCarousel({ 
  tiers, 
  recommendedPlan, 
  onSelectTier,
  onCalculatorClick 
}: MobileTierCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Start at highlighted tier (Standard) by default
    const highlightedIndex = tiers.findIndex(t => t.highlighted);
    return highlightedIndex >= 0 ? highlightedIndex : 0;
  });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // RTL: swipe left = next, swipe right = previous (reversed for Hebrew)
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    if (isLeftSwipe && currentIndex < tiers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTier = tiers[currentIndex];
  const isRecommended = recommendedPlan === currentTier.name;

  return (
    <div className="md:hidden" dir="rtl">
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="px-4"
          >
            {/* Tier Card */}
            <div className="relative overflow-visible">
              {/* Badge for highlighted */}
              {currentTier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-gold text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                    הכי פופולרי
                  </span>
                </div>
              )}

              <div
                className={`
                  relative flex flex-col
                  rounded-[20px] px-5 pb-5 
                  ${currentTier.highlighted ? 'pt-10' : 'pt-6'} 
                  text-center
                  backdrop-blur-xl border
                  ${currentTier.highlighted 
                    ? 'bg-amber-50/80 border-2 border-[#d4af37] shadow-[0_10px_30px_rgba(212,175,55,0.25)]' 
                    : 'bg-amber-50/70 border-amber-200/40 shadow-[0_8px_20px_rgba(0,0,0,0.15)]'
                  }
                  ${isRecommended 
                    ? 'ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(212,175,55,0.4)]' 
                    : ''
                  }
                `}
                style={{ fontFamily: "'Heebo', sans-serif" }}
              >
                {/* Plan Name */}
                <h3 className="text-xl font-bold mb-0.5" style={{ color: '#2c6e49' }}>
                  {currentTier.nameHe}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{currentTier.name}</p>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-3xl font-extrabold" style={{ color: '#1a202c' }}>
                    {currentTier.price}
                  </span>
                  {currentTier.period && (
                    <span className="text-sm text-gray-600 mr-1">{currentTier.period}</span>
                  )}
                </div>
                {currentTier.periodSub && (
                  <p className="text-xs text-gray-500 mb-3">{currentTier.periodSub}</p>
                )}

                {/* Limits */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs font-semibold bg-jade/10 text-jade-dark rounded-full px-3 py-1.5">
                    {currentTier.queriesLimit}
                  </span>
                  <span className="text-xs font-semibold bg-gold/10 text-gold-dark rounded-full px-3 py-1.5">
                    {currentTier.tokensInfo}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-2 mb-5 text-right">
                  {currentTier.features.map((feature, idx) => (
                    <li 
                      key={idx} 
                      className={`flex items-center text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}
                    >
                      <span 
                        className={`ml-2.5 font-bold w-5 text-center text-base ${feature.included ? 'text-[#2c6e49]' : 'text-gray-300'}`}
                      >
                        {feature.included ? '✓' : '✕'}
                      </span>
                      {feature.name}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectTier(currentTier.name)}
                  className={`
                    w-full py-4 rounded-xl font-bold text-base
                    transition-all duration-300 min-h-[52px]
                    active:scale-[0.98] touch-manipulation
                    ${currentTier.highlighted 
                      ? 'text-white shadow-[0_4px_15px_rgba(184,150,40,0.3)]' 
                      : 'bg-transparent border-2 border-[#2c6e49] text-[#2c6e49] active:bg-[#2c6e49] active:text-white'
                    }
                  `}
                  style={currentTier.highlighted ? { background: 'linear-gradient(135deg, #d4af37, #b89628)' } : {}}
                >
                  {currentTier.name === 'Trial' ? 'התחל ניסיון' : 'בחר חבילה'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
          className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center touch-manipulation ${currentIndex === 0 ? 'opacity-30' : 'opacity-100'}`}
          disabled={currentIndex === 0}
          aria-label="Previous tier"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={() => currentIndex < tiers.length - 1 && setCurrentIndex(prev => prev + 1)}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center touch-manipulation ${currentIndex === tiers.length - 1 ? 'opacity-30' : 'opacity-100'}`}
          disabled={currentIndex === tiers.length - 1}
          aria-label="Next tier"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {tiers.map((tier, index) => (
          <button
            key={tier.name}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentIndex 
                ? 'bg-gold w-6' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to ${tier.nameHe}`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-white/60 text-xs mt-3">
        החליקו ימינה/שמאלה לראות חבילות נוספות
      </p>

      {/* ROI Calculator Link */}
      <div className="mt-4 text-center">
        <Link 
          to="/therapist-roi"
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
          <Calculator className="h-4 w-4" />
          מחשבון פוטנציאל הכנסה
        </Link>
      </div>
    </div>
  );
}
