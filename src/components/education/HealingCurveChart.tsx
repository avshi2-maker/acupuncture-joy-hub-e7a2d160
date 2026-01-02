import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealingCurveChartProps {
  className?: string;
}

export function HealingCurveChart({ className }: HealingCurveChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Sawtooth pattern points (SOS approach - pain spikes)
  const sawtoothPath = "M 50,180 L 80,60 L 110,160 L 140,50 L 170,170 L 200,70 L 230,180 L 260,60 L 290,150 L 320,80 L 350,180";
  
  // Cumulative curve points (Long-term approach - steady improvement)
  const cumulativePath = "M 50,180 Q 100,170 120,155 T 180,120 T 240,80 T 300,50 T 350,35";

  // Background grid lines
  const gridLines = [40, 80, 120, 160];

  return (
    <div className={className}>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 border border-border shadow-inner">
        {/* Chart Title */}
        <div className="text-center mb-4">
          <h4 className="text-sm font-bold text-foreground">השוואת גישות טיפוליות</h4>
          <p className="text-xs text-muted-foreground">Treatment Approach Comparison</p>
        </div>

        {/* SVG Chart */}
        <svg viewBox="0 0 400 220" className="w-full h-auto">
          {/* Background gradient */}
          <defs>
            <linearGradient id="sawtoothGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="cumulativeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((y, i) => (
            <line
              key={i}
              x1="40"
              y1={y}
              x2="360"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Y-axis */}
          <line x1="40" y1="30" x2="40" y2="190" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="40" y1="190" x2="370" y2="190" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />

          {/* Y-axis labels */}
          <text x="15" y="45" className="fill-current text-[10px] opacity-50">בריאות</text>
          <text x="15" y="185" className="fill-current text-[10px] opacity-50">כאב</text>

          {/* X-axis label */}
          <text x="200" y="210" className="fill-current text-[10px] opacity-50" textAnchor="middle">זמן (שבועות)</text>

          {/* Sawtooth path (SOS pattern) - Animated */}
          <motion.path
            d={sawtoothPath}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Cumulative curve path - Animated */}
          <motion.path
            d={cumulativePath}
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isVisible ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 2.5, ease: "easeOut", delay: 1 }}
          />

          {/* Animated dots on sawtooth peaks */}
          {[
            { x: 80, y: 60 },
            { x: 140, y: 50 },
            { x: 200, y: 70 },
            { x: 260, y: 60 },
            { x: 320, y: 80 },
          ].map((point, i) => (
            <motion.circle
              key={`saw-${i}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#ef4444"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 1 + i * 0.2, duration: 0.3 }}
            />
          ))}

          {/* Animated dots on cumulative curve */}
          {[
            { x: 120, y: 155 },
            { x: 180, y: 120 },
            { x: 240, y: 80 },
            { x: 300, y: 50 },
            { x: 350, y: 35 },
          ].map((point, i) => (
            <motion.circle
              key={`cum-${i}`}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#22c55e"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 1.5 + i * 0.2, duration: 0.3 }}
            />
          ))}

          {/* Goal line */}
          <motion.line
            x1="40"
            y1="35"
            x2="370"
            y2="35"
            stroke="#22c55e"
            strokeWidth="1"
            strokeDasharray="6 3"
            strokeOpacity="0.5"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 0.5 } : {}}
            transition={{ delay: 2.5 }}
          />
          <motion.text
            x="375"
            y="38"
            className="fill-emerald-500 text-[9px] font-medium"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 2.5 }}
          >
            יעד
          </motion.text>
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 flex-wrap">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 2.8 }}
          >
            <div className="w-4 h-1 bg-red-500 rounded" />
            <span className="text-xs text-muted-foreground">גישת SOS (שיניים של מסור)</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 3 }}
          >
            <div className="w-4 h-1 bg-emerald-500 rounded" />
            <span className="text-xs text-muted-foreground">גישה מצטברת (עקומת ריפוי)</span>
          </motion.div>
        </div>

        {/* Insight boxes */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <motion.div 
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 3.2 }}
          >
            <div className="text-red-600 dark:text-red-400 font-bold text-lg">↕️</div>
            <p className="text-[10px] text-red-700 dark:text-red-300 font-medium">תנודות קבועות</p>
            <p className="text-[9px] text-red-600/70 dark:text-red-400/70">מתחילים מאפס כל פעם</p>
          </motion.div>
          <motion.div 
            className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center"
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 3.4 }}
          >
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">📈</div>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">שיפור מתמשך</p>
            <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70">בניית יסודות</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
