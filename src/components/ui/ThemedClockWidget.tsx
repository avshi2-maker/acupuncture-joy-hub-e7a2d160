import { useState, useEffect, forwardRef } from 'react';

export type ClockTheme = 'gold' | 'silver' | 'jade';

export function getClockTheme(): ClockTheme {
  try {
    const saved = localStorage.getItem('therapist_clock_theme') as ClockTheme;
    return saved && ['gold', 'silver', 'jade'].includes(saved) ? saved : 'gold';
  } catch {
    return 'gold';
  }
}

interface ThemedClockWidgetProps {
  theme?: ClockTheme;
  className?: string;
}

export const ThemedClockWidget = forwardRef<HTMLDivElement, ThemedClockWidgetProps>(
  function ThemedClockWidgetInner({ theme = 'gold', className = '' }, ref) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const hourDeg = (hours * 30) + (minutes * 0.5);
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('he-IL', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    };

    // Theme-specific styles
    const themeStyles = {
      gold: {
        container: 'from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        clockFace: 'from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-800/50 border-amber-400/50',
        innerFace: 'from-amber-50 to-yellow-100 dark:from-amber-950/80 dark:to-yellow-900/80',
        majorMarker: 'bg-amber-600 dark:bg-amber-400',
        minorMarker: 'bg-amber-400/60 dark:bg-amber-500/60',
        hourHand: 'from-amber-700 to-amber-500 dark:from-amber-400 dark:to-amber-300',
        minuteHand: 'from-amber-600 to-amber-400 dark:from-amber-300 dark:to-amber-200',
        centerDot: 'from-amber-500 to-amber-700 dark:from-amber-300 dark:to-amber-500 border-amber-400/50',
        digitalTime: 'text-amber-900 dark:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
        digitalDate: 'text-amber-800 dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]',
      },
      silver: {
        container: 'from-slate-400/20 via-gray-300/20 to-slate-400/20 border-slate-400/40 shadow-[0_0_20px_rgba(148,163,184,0.2)]',
        clockFace: 'from-slate-100 to-gray-200 dark:from-slate-800/50 dark:to-gray-700/50 border-slate-400/50',
        innerFace: 'from-slate-50 to-gray-100 dark:from-slate-900/80 dark:to-gray-800/80',
        majorMarker: 'bg-slate-600 dark:bg-slate-300',
        minorMarker: 'bg-slate-400/60 dark:bg-slate-500/60',
        hourHand: 'from-slate-700 to-slate-500 dark:from-slate-300 dark:to-slate-200',
        minuteHand: 'from-slate-600 to-slate-400 dark:from-slate-200 dark:to-slate-100',
        centerDot: 'from-slate-500 to-slate-700 dark:from-slate-300 dark:to-slate-500 border-slate-400/50',
        digitalTime: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        digitalDate: 'text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
      },
      jade: {
        container: 'from-emerald-500/20 via-jade/20 to-emerald-500/20 border-jade/40 shadow-[0_0_20px_rgba(34,197,94,0.2)]',
        clockFace: 'from-emerald-100 to-jade-light dark:from-emerald-900/50 dark:to-jade/30 border-jade/50',
        innerFace: 'from-emerald-50 to-jade-light dark:from-emerald-950/80 dark:to-jade/20',
        majorMarker: 'bg-jade dark:bg-emerald-400',
        minorMarker: 'bg-jade/60 dark:bg-emerald-500/60',
        hourHand: 'from-emerald-700 to-jade dark:from-emerald-400 dark:to-emerald-300',
        minuteHand: 'from-emerald-600 to-jade dark:from-emerald-300 dark:to-emerald-200',
        centerDot: 'from-jade to-emerald-700 dark:from-emerald-300 dark:to-jade border-jade/50',
        digitalTime: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        digitalDate: 'text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
      },
    };

    const styles = themeStyles[theme];

    return (
      <div ref={ref} className={`flex items-center gap-3 px-4 py-2 bg-card bg-gradient-to-r ${styles.container} rounded-xl border backdrop-blur-sm ${className}`}>
        {/* Analog Clock */}
        <div className={`relative w-12 h-12 rounded-full bg-card bg-gradient-to-br ${styles.clockFace} border-2 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1),inset_0_1px_3px_rgba(255,255,255,0.3)]`}>
          {/* Clock face - solid background */}
          <div className={`absolute inset-1 rounded-full bg-card bg-gradient-to-br ${styles.innerFace}`} />
          
          {/* Hour markers */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className={`absolute rounded-full ${deg % 90 === 0 ? `w-0.5 h-1.5 ${styles.majorMarker}` : `w-px h-1 ${styles.minorMarker}`}`}
              style={{
                transform: `rotate(${deg}deg) translateY(-18px)`,
                transformOrigin: 'center center',
              }}
            />
          ))}
          
          {/* Hour hand */}
          <div
            className={`absolute w-1 h-3 bg-gradient-to-t ${styles.hourHand} rounded-full origin-bottom shadow-md`}
            style={{
              transform: `rotate(${hourDeg}deg)`,
              bottom: '50%',
            }}
          />
          
          {/* Minute hand */}
          <div
            className={`absolute w-0.5 h-4 bg-gradient-to-t ${styles.minuteHand} rounded-full origin-bottom shadow-sm`}
            style={{
              transform: `rotate(${minuteDeg}deg)`,
              bottom: '50%',
            }}
          />
          
          {/* Second hand */}
          <div
            className="absolute w-px h-4.5 bg-red-500 rounded-full origin-bottom shadow-[0_0_4px_rgba(239,68,68,0.6)] transition-transform duration-100"
            style={{
              transform: `rotate(${secondDeg}deg)`,
              bottom: '50%',
            }}
          />
          
          {/* Center dot */}
          <div className={`absolute w-1.5 h-1.5 bg-gradient-to-br ${styles.centerDot} rounded-full shadow-md border`} />
        </div>

        {/* Digital Time & Date */}
        <div className="flex flex-col items-start">
          <span className={`text-lg font-mono font-bold ${styles.digitalTime} tracking-wider`}>
            {formatTime(time)}
          </span>
          <span className={`text-xs ${styles.digitalDate}`}>
            {formatDate(time)}
          </span>
        </div>
      </div>
    );
  }
);

ThemedClockWidget.displayName = 'ThemedClockWidget';
