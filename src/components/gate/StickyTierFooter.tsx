import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tier {
  name: string;
  nameHe: string;
  price: string;
  period?: string;
  highlighted?: boolean;
}

interface StickyTierFooterProps {
  tiers: Tier[];
  selectedTier: string | null;
  onSelectTier: (tierName: string) => void;
  onScrollToTiers: () => void;
  isVisible: boolean;
}

export function StickyTierFooter({ 
  tiers, 
  selectedTier, 
  onSelectTier, 
  onScrollToTiers,
  isVisible 
}: StickyTierFooterProps) {
  const currentTier = tiers.find(t => t.name === selectedTier) || tiers.find(t => t.highlighted) || tiers[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom"
          dir="rtl"
        >
          <div className="px-4 py-3 pb-safe">
            {/* Tier Info Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500">חבילה נבחרת</p>
                  <p className="font-bold text-gray-800">{currentTier.nameHe}</p>
                </div>
                <span className="text-lg font-extrabold text-jade">
                  {currentTier.price}
                  {currentTier.period && <span className="text-xs text-gray-500 mr-1">{currentTier.period}</span>}
                </span>
              </div>
              
              {/* Change plan button */}
              <button
                onClick={onScrollToTiers}
                className="flex items-center gap-1 text-sm text-jade font-medium touch-manipulation min-h-[44px] px-3"
              >
                <ChevronUp className="w-4 h-4" />
                החלף
              </button>
            </div>

            {/* ROI Calculator Link */}
            <Link 
              to="/therapist-roi"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-jade transition-colors mb-2"
            >
              <Calculator className="h-3 w-3" />
              מחשבון פוטנציאל הכנסה
            </Link>

            {/* CTA Button */}
            <button
              onClick={() => onSelectTier(currentTier.name)}
              className="w-full py-3.5 rounded-xl font-bold text-base text-white shadow-lg active:scale-[0.98] touch-manipulation min-h-[52px]"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b89628)' }}
            >
              {currentTier.name === 'Trial' ? 'התחל ניסיון חינם' : `המשך עם ${currentTier.nameHe}`}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
