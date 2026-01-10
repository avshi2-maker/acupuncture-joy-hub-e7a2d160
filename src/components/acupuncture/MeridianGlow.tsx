import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { meridianColors, meridianNames } from '@/data/point-technical-data';

interface MeridianGlowProps {
  activeMeridian: string | null;
  className?: string;
}

/**
 * Phase 4: Meridian Context Glow
 * Visual overlay that shows meridian pathway when hovering a point
 */
export function MeridianGlow({ activeMeridian, className }: MeridianGlowProps) {
  if (!activeMeridian) return null;

  const color = meridianColors[activeMeridian] || '#00A896';
  const meridianInfo = meridianNames[activeMeridian];

  return (
    <AnimatePresence>
      <motion.div
        key={activeMeridian}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'absolute inset-0 pointer-events-none z-10',
          className
        )}
      >
        {/* Meridian color overlay glow */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
          }}
        />

        {/* Meridian info badge - bottom corner */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-md rounded-lg px-3 py-2 border shadow-lg"
          style={{ borderColor: `${color}50` }}
        >
          <div className="flex items-center gap-2">
            {/* Color indicator dot */}
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-xs font-bold" style={{ color }}>
                {activeMeridian} • {meridianInfo?.english}
              </p>
              <p className="text-[10px] text-muted-foreground" dir="rtl">
                {meridianInfo?.hebrew} • {meridianInfo?.chinese}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Animated meridian pathway hint (decorative lines) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id={`meridian-gradient-${activeMeridian}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0" />
              <stop offset="50%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Decorative flowing line to suggest meridian pathway */}
          <motion.path
            d="M 10,100 Q 50,50 100,100 T 200,100 T 300,100"
            fill="none"
            stroke={`url(#meridian-gradient-${activeMeridian})`}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Meridian pathway data for future SVG rendering
 * Each meridian has key points that define its flow
 */
export const meridianPathways: Record<string, string[]> = {
  'LU': ['LU1', 'LU2', 'LU3', 'LU4', 'LU5', 'LU6', 'LU7', 'LU8', 'LU9', 'LU10', 'LU11'],
  'LI': ['LI1', 'LI2', 'LI3', 'LI4', 'LI5', 'LI6', 'LI7', 'LI8', 'LI9', 'LI10', 'LI11', 'LI12', 'LI13', 'LI14', 'LI15', 'LI16', 'LI17', 'LI18', 'LI19', 'LI20'],
  'ST': ['ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'ST8', 'ST9', 'ST10', 'ST25', 'ST36', 'ST40', 'ST44', 'ST45'],
  'SP': ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP9', 'SP10', 'SP15', 'SP21'],
  'HT': ['HT1', 'HT2', 'HT3', 'HT4', 'HT5', 'HT6', 'HT7', 'HT8', 'HT9'],
  'SI': ['SI1', 'SI2', 'SI3', 'SI4', 'SI5', 'SI6', 'SI7', 'SI8', 'SI9', 'SI10', 'SI11', 'SI12', 'SI13', 'SI14', 'SI15', 'SI16', 'SI17', 'SI18', 'SI19'],
  'BL': ['BL1', 'BL2', 'BL10', 'BL11', 'BL12', 'BL13', 'BL14', 'BL15', 'BL17', 'BL18', 'BL19', 'BL20', 'BL21', 'BL22', 'BL23', 'BL40', 'BL60', 'BL67'],
  'KI': ['KI1', 'KI2', 'KI3', 'KI6', 'KI7', 'KI10', 'KI27'],
  'PC': ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6', 'PC7', 'PC8', 'PC9'],
  'TE': ['TE1', 'TE2', 'TE3', 'TE4', 'TE5', 'TE6', 'TE10', 'TE14', 'TE17', 'TE21', 'TE23'],
  'GB': ['GB1', 'GB2', 'GB8', 'GB14', 'GB20', 'GB21', 'GB30', 'GB34', 'GB39', 'GB40', 'GB41', 'GB44'],
  'LV': ['LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV13', 'LV14'],
  'GV': ['GV1', 'GV4', 'GV14', 'GV16', 'GV20', 'GV24', 'GV26'],
  'CV': ['CV1', 'CV3', 'CV4', 'CV6', 'CV8', 'CV12', 'CV14', 'CV17', 'CV22', 'CV24'],
};
