import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronDown, Sparkles, Lightbulb } from 'lucide-react';

// Logic constants
const LIMIT_TIER_40 = 150;
const LIMIT_TIER_50 = 250;
const MINS_SAVED_PER_ACTION = 7;

interface ClinicEfficiencyCalculatorProps {
  onTierRecommended?: (tierName: string) => void;
}

export function ClinicEfficiencyCalculator({ onTierRecommended }: ClinicEfficiencyCalculatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const [patients, setPatients] = useState(40);
  const [queries, setQueries] = useState(3);
  
  const totalActions = patients * queries;
  const minutesSaved = totalActions * MINS_SAVED_PER_ACTION;
  const hoursSaved = (minutesSaved / 60).toFixed(1);
  
  // Determine recommended tier
  const getRecommendation = () => {
    if (totalActions <= LIMIT_TIER_40) {
      return {
        tierName: 'Standard',
        tierNameHe: 'סטנדרט (Tier 40)',
        message: 'חבילה מעולה לקליניקה יציבה.',
        price: '₪40 לחודש',
        color: 'jade',
      };
    } else if (totalActions <= LIMIT_TIER_50) {
      return {
        tierName: 'Premium',
        tierNameHe: 'פרימיום (Tier 50)',
        message: 'הבחירה החכמה ביותר. מקסימום חופש פעולה.',
        price: '₪50 לחודש',
        color: 'gold',
      };
    } else {
      return {
        tierName: 'Custom',
        tierNameHe: 'מותאם אישית / Pro',
        message: 'קצב עבודה גבוה! מומלץ ליצור קשר.',
        price: 'צור קשר',
        color: 'destructive',
      };
    }
  };
  
  const recommendation = getRecommendation();
  
  // Notify parent when recommendation changes
  useEffect(() => {
    onTierRecommended?.(recommendation.tierName);
  }, [recommendation.tierName, onTierRecommended]);
  
  // Scroll removed per user request

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-jade max-w-xl mx-auto">
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-b from-white to-jade/5 border-b border-border/50 text-center">
          <div className="inline-flex items-center gap-1.5 bg-jade/10 text-jade-dark px-3 py-1 rounded-full text-xs font-bold mb-3 border border-jade/20">
            <Sparkles className="h-3 w-3" />
            Powered by Gemini 3 Flash ⚡
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2 font-heebo">
            מחשבון יעילות קלינית
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            גלה כמה זמן יקר המערכת חוסכת לך בחודש, ואיזו חבילה מתאימה להיקף הפעילות שלך.
          </p>
        </div>
        
        {/* Inputs Section */}
        <div className="px-6 py-6 space-y-6">
          {/* Patients Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-foreground text-sm">מספר מטופלים בחודש</label>
              <span className="bg-jade/10 text-jade-dark px-3 py-1 rounded-lg font-bold text-sm">
                {patients}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={patients}
              onChange={(e) => setPatients(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-jade
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                [&::-webkit-slider-thumb]:bg-jade [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
          </div>
          
          {/* Queries Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold text-foreground text-sm">מספר פעולות (שאילתות) למטופל</label>
              <span className="bg-jade/10 text-jade-dark px-3 py-1 rounded-lg font-bold text-sm">
                {queries}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={queries}
              onChange={(e) => setQueries(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-jade
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                [&::-webkit-slider-thumb]:bg-jade [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
          </div>
        </div>
        
        {/* Results Section */}
        <div className="bg-slate-800 text-white px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs opacity-70 mb-1">סה״כ פעולות בחודש</p>
              <p className="text-2xl font-bold">{totalActions}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs opacity-70 mb-1">זמן שנחסך (חודשי)</p>
              <p className="text-2xl font-bold text-gold">{hoursSaved} שעות</p>
            </div>
          </div>
          
          {/* Recommendation Box */}
          <motion.div 
            className="bg-white text-foreground rounded-xl p-6 shadow-lg text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            key={recommendation.tierName}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              החבילה המומלצת עבורך
            </p>
            <p className={`text-2xl font-extrabold mb-2 ${
              recommendation.color === 'jade' ? 'text-jade' : 
              recommendation.color === 'gold' ? 'text-gold' : 'text-destructive'
            }`}>
              {recommendation.tierNameHe}
            </p>
            <p className="text-sm text-foreground/80 mb-4">
              {recommendation.message}
            </p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm ${
              recommendation.color === 'jade' ? 'bg-jade' : 
              recommendation.color === 'gold' ? 'bg-gold' : 'bg-destructive'
            }`}>
              {recommendation.price}
            </span>
          </motion.div>
        </div>
        
        {/* Wisdom Section */}
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-5 text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-amber-800 mb-2">
            <Lightbulb className="h-4 w-4" />
            <span>נקודה למחשבה</span>
          </div>
          <p className="text-amber-900/80 text-sm italic leading-relaxed font-serif">
            "תעשה את החשבון: טיפול אחד נוסף בזמן שהתפנה לך מכסה את עלות המנוי לכל השנה. כל שאר השעות שנחסכו הן הרווח הנקי שלך."
          </p>
        </div>
      </div>
      
      {/* Scroll indicator removed per user request */}
    </motion.div>
  );
}
