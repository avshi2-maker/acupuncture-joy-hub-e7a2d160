import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, Eye, MessageSquare, Target, Zap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import images for the carousel
import acupunctureRoomBg from '@/assets/acupuncture-room-bg.png';
import brainBg from '@/assets/brain-bg.png';
import deskBg from '@/assets/desk-bg.png';
import calendarBg from '@/assets/calendar-bg.png';
import knowledgeBg from '@/assets/knowledge-bg.png';
import heroMeridianBg from '@/assets/hero-meridian-bg.png';

// Session tips that rotate with images
const CAROUSEL_SLIDES = [
  {
    id: 'welcome',
    image: acupunctureRoomBg,
    tipHe: 'ברכו את המטופל בחום ובעין בעין',
    tipEn: 'Greet warmly with eye contact',
    phase: 'פתיחה',
    phaseEn: 'Opening',
    icon: MessageSquare,
    color: 'jade'
  },
  {
    id: 'listen',
    image: brainBg,
    tipHe: 'הקשיבו לתלונה העיקרית ללא הפרעה',
    tipEn: 'Listen to chief complaint without interrupting',
    phase: 'אבחון',
    phaseEn: 'Diagnosis',
    icon: Eye,
    color: 'purple'
  },
  {
    id: 'diagnosis',
    image: heroMeridianBg,
    tipHe: 'בדקו דופק ולשון לפני הטיפול',
    tipEn: 'Check pulse and tongue before treatment',
    phase: 'בדיקה',
    phaseEn: 'Examination',
    icon: Target,
    color: 'blue'
  },
  {
    id: 'treatment',
    image: deskBg,
    tipHe: 'הסבירו את תוכנית הטיפול בשפה פשוטה',
    tipEn: 'Explain treatment plan in simple terms',
    phase: 'טיפול',
    phaseEn: 'Treatment',
    icon: Zap,
    color: 'amber'
  },
  {
    id: 'followup',
    image: calendarBg,
    tipHe: 'תאמו מועד המשך לפני סיום הפגישה',
    tipEn: 'Schedule follow-up before session ends',
    phase: 'סיום',
    phaseEn: 'Closing',
    icon: BookOpen,
    color: 'green'
  },
  {
    id: 'notes',
    image: knowledgeBg,
    tipHe: 'תעדו הערות מיד לאחר הטיפול',
    tipEn: 'Document notes immediately after treatment',
    phase: 'תיעוד',
    phaseEn: 'Documentation',
    icon: Target,
    color: 'orange'
  }
];

interface MiniInspirationCarouselProps {
  autoPlay?: boolean;
  interval?: number;
  language?: 'he' | 'en';
  className?: string;
}

export function MiniInspirationCarousel({
  autoPlay = true,
  interval = 5000,
  language = 'he',
  className
}: MiniInspirationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = CAROUSEL_SLIDES[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && !isPaused) {
      timerRef.current = setInterval(goToNext, interval);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, isPaused, interval]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      jade: 'bg-jade/80 text-white',
      purple: 'bg-purple-600/80 text-white',
      blue: 'bg-blue-600/80 text-white',
      amber: 'bg-amber-500/80 text-white',
      green: 'bg-green-600/80 text-white',
      orange: 'bg-orange-600/80 text-white'
    };
    return colors[color] || colors.jade;
  };

  const Icon = currentSlide.icon;

  return (
    <div 
      className={cn(
        'relative w-full h-20 md:h-24 rounded-xl overflow-hidden group',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={currentSlide.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center px-3 md:px-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Phase Badge */}
        <motion.div
          key={`phase-${currentSlide.id}`}
          initial={{ opacity: 0, x: language === 'he' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0',
            getColorClasses(currentSlide.color)
          )}
        >
          <Icon className="h-3 w-3 md:h-4 md:w-4" />
          <span className="text-[10px] md:text-xs font-semibold">
            {language === 'he' ? currentSlide.phase : currentSlide.phaseEn}
          </span>
        </motion.div>

        {/* Tip Text */}
        <motion.p
          key={`tip-${currentSlide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 text-white text-xs md:text-sm font-medium mx-3 leading-tight"
        >
          {language === 'he' ? currentSlide.tipHe : currentSlide.tipEn}
        </motion.p>

        {/* Progress Dots */}
        <div className="flex gap-1 shrink-0">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all',
                idx === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Show on hover */}
      <button
        onClick={goToPrev}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          language === 'he' ? 'right-1' : 'left-1'
        )}
      >
        <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
      </button>
      <button
        onClick={goToNext}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          language === 'he' ? 'left-1' : 'right-1'
        )}
      >
        <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
      </button>

      {/* Pause/Play indicator */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 rounded-full bg-black/40 text-white">
          {isPaused ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
        </div>
      </div>
    </div>
  );
}
