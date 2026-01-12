import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

interface MobileQuickActionsProps {
  onSave: () => void;
  onPrint: () => void;
}

export function MobileQuickActions({ onSave, onPrint }: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lightTap, successTap } = useHaptic();

  const handleToggle = () => {
    lightTap();
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    successTap();
    onSave();
    setIsOpen(false);
  };

  const handlePrint = () => {
    lightTap();
    onPrint();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col-reverse items-center gap-3 md:hidden">
      {/* Action Buttons - appear when FAB is open */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Save Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: 20 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              onClick={handleSave}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg flex items-center justify-center",
                "bg-jade-500 text-white hover:bg-jade-600 active:scale-95",
                "transition-colors"
              )}
              aria-label="Save Notes"
            >
              <Save className="h-5 w-5" />
            </motion.button>

            {/* PDF Export Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.3, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: 20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={handlePrint}
              className={cn(
                "h-12 w-12 rounded-full shadow-lg flex items-center justify-center",
                "bg-amber-500 text-white hover:bg-amber-600 active:scale-95",
                "transition-colors"
              )}
              aria-label="Export PDF"
            >
              <FileText className="h-5 w-5" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={handleToggle}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl flex items-center justify-center",
          "bg-gradient-to-br from-jade-500 to-jade-600 text-white",
          "hover:from-jade-600 hover:to-jade-700 active:scale-95",
          "transition-all"
        )}
        aria-label={isOpen ? "Close menu" : "Open quick actions"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </motion.button>

      {/* Labels - appear next to buttons when open */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="absolute bottom-[76px] right-16 bg-card/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap"
            >
              Save Notes
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, delay: 0.15 }}
              className="absolute bottom-[136px] right-16 bg-card/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap"
            >
              PDF Export
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}