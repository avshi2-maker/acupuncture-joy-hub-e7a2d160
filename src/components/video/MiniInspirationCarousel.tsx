import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Eye, 
  MessageSquare, 
  Target, 
  Zap, 
  BookOpen,
  Edit3,
  X,
  Save,
  RotateCcw,
  Settings,
  Clock,
  Heart,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Import your custom therapy session images
import therapySession1 from '@/assets/carousel/therapy-session-1.jpg';
import therapySession2 from '@/assets/carousel/therapy-session-2.jpg';
import therapySession3 from '@/assets/carousel/therapy-session-3.jpg';
import therapySession4 from '@/assets/carousel/therapy-session-4.png';

// Session phase definitions (in minutes)
const SESSION_PHASES = [
  { id: 'opening', startMin: 0, endMin: 5, nameHe: 'פתיחה', nameEn: 'Opening' },
  { id: 'diagnosis', startMin: 5, endMin: 15, nameHe: 'אבחון', nameEn: 'Diagnosis' },
  { id: 'treatment', startMin: 15, endMin: 35, nameHe: 'טיפול', nameEn: 'Treatment' },
  { id: 'closing', startMin: 35, endMin: 45, nameHe: 'סיום', nameEn: 'Closing' },
];

// Default session tips organized by phase
const DEFAULT_SLIDES: CarouselSlide[] = [
  // Opening Phase (0-5 min)
  {
    id: 'welcome',
    image: therapySession1,
    tipHe: 'ברכו את המטופל בחום ושאלו על מצבו מאז הפגישה האחרונה',
    tipEn: 'Greet warmly and ask how they have been since last session',
    phase: 'פתיחה',
    phaseEn: 'Opening',
    icon: 'MessageSquare',
    color: 'jade',
    sessionPhase: 'opening',
    minRange: [0, 5] as [number, number]
  },
  // Diagnosis Phase (5-15 min)
  {
    id: 'diagnosis',
    image: therapySession2,
    tipHe: 'הציגו נתוני הצלחה: כאב כרוני 75-85%, מיגרנה 70-80%',
    tipEn: 'Present success rates: Chronic pain 75-85%, Migraine 70-80%',
    phase: 'אבחון',
    phaseEn: 'Diagnosis',
    icon: 'Target',
    color: 'purple',
    sessionPhase: 'diagnosis',
    minRange: [5, 15] as [number, number]
  },
  {
    id: 'listen',
    image: therapySession3,
    tipHe: 'הקשיבו לתלונה העיקרית והשתמשו בשיקוף רגשי',
    tipEn: 'Listen to chief complaint and use emotional mirroring',
    phase: 'הקשבה',
    phaseEn: 'Listening',
    icon: 'Heart',
    color: 'rose',
    sessionPhase: 'diagnosis',
    minRange: [5, 15] as [number, number]
  },
  // Treatment Phase (15-35 min)
  {
    id: 'treatment',
    image: therapySession4,
    tipHe: 'הסבירו את תוכנית הטיפול בעזרת הדגמה ויזואלית',
    tipEn: 'Explain treatment plan with visual demonstration',
    phase: 'טיפול',
    phaseEn: 'Treatment',
    icon: 'Zap',
    color: 'amber',
    sessionPhase: 'treatment',
    minRange: [15, 35] as [number, number]
  },
  {
    id: 'video-tips',
    image: therapySession3,
    tipHe: 'שמרו על קשר עין גם בפגישות וידאו מרחוק',
    tipEn: 'Maintain eye contact even in remote video sessions',
    phase: 'וידאו',
    phaseEn: 'Video',
    icon: 'Eye',
    color: 'blue',
    sessionPhase: 'treatment',
    minRange: [15, 35] as [number, number]
  },
  // Closing Phase (35-45 min)
  {
    id: 'closing',
    image: therapySession1,
    tipHe: 'סכמו את הטיפול ותאמו מועד המשך לפני סיום הפגישה',
    tipEn: 'Summarize treatment and schedule follow-up before ending',
    phase: 'סיום',
    phaseEn: 'Closing',
    icon: 'Calendar',
    color: 'green',
    sessionPhase: 'closing',
    minRange: [35, 45] as [number, number]
  },
  {
    id: 'commitment',
    image: therapySession2,
    tipHe: 'בקשו מחויבות קטנה: "נסה רק מפגש אחד"',
    tipEn: 'Ask for small commitment: "Just try one session"',
    phase: 'מחויבות',
    phaseEn: 'Commitment',
    icon: 'BookOpen',
    color: 'orange',
    sessionPhase: 'closing',
    minRange: [35, 45] as [number, number]
  },
];

const STORAGE_KEY = 'therapist-carousel-tips';

export interface CarouselSlide {
  id: string;
  image: string;
  tipHe: string;
  tipEn: string;
  phase: string;
  phaseEn: string;
  icon: string;
  color: string;
  sessionPhase?: string;
  minRange?: [number, number];
}

interface MiniInspirationCarouselProps {
  autoPlay?: boolean;
  interval?: number;
  language?: 'he' | 'en';
  className?: string;
  sessionDuration?: number; // in seconds - for auto-sync
  autoSync?: boolean; // Enable phase-based auto-sync
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Target,
  Eye,
  Zap,
  BookOpen,
  Heart,
  Calendar,
  Clock
};

export function MiniInspirationCarousel({
  autoPlay = true,
  interval = 5000,
  language = 'he',
  className,
  sessionDuration = 0,
  autoSync = true
}: MiniInspirationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>(DEFAULT_SLIDES);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(0);
  const lastPhaseRef = useRef<string | null>(null);

  // Calculate current session phase based on duration
  const currentSessionMinute = Math.floor(sessionDuration / 60);
  const currentPhase = useMemo(() => {
    return SESSION_PHASES.find(
      phase => currentSessionMinute >= phase.startMin && currentSessionMinute < phase.endMin
    ) || SESSION_PHASES[0];
  }, [currentSessionMinute]);

  // Get slides relevant to current phase
  const phaseRelevantSlides = useMemo(() => {
    if (!autoSync || sessionDuration === 0) return slides;
    return slides.filter(slide => 
      !slide.minRange || 
      (currentSessionMinute >= slide.minRange[0] && currentSessionMinute < slide.minRange[1])
    );
  }, [slides, currentSessionMinute, autoSync, sessionDuration]);

  // Auto-sync: Jump to phase-relevant slide when phase changes
  useEffect(() => {
    if (autoSync && sessionDuration > 0 && currentPhase.id !== lastPhaseRef.current) {
      lastPhaseRef.current = currentPhase.id;
      // Find first slide matching current phase
      const phaseSlideIndex = slides.findIndex(s => s.sessionPhase === currentPhase.id);
      if (phaseSlideIndex !== -1 && phaseSlideIndex !== currentIndex) {
        setDirection(1);
        setCurrentIndex(phaseSlideIndex);
        toast.info(
          language === 'he' 
            ? `שלב: ${currentPhase.nameHe}` 
            : `Phase: ${currentPhase.nameEn}`,
          { duration: 2000, icon: '🎯' }
        );
      }
    }
  }, [currentPhase.id, autoSync, sessionDuration, slides, language]);

  // Load saved tips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved tips with default images (in case images change)
        const merged = DEFAULT_SLIDES.map((defaultSlide, idx) => {
          const savedSlide = parsed.find((s: CarouselSlide) => s.id === defaultSlide.id) || parsed[idx];
          if (savedSlide) {
            return {
              ...defaultSlide,
              tipHe: savedSlide.tipHe || defaultSlide.tipHe,
              tipEn: savedSlide.tipEn || defaultSlide.tipEn,
              phase: savedSlide.phase || defaultSlide.phase,
              phaseEn: savedSlide.phaseEn || defaultSlide.phaseEn
            };
          }
          return defaultSlide;
        });
        setSlides(merged);
      } catch (e) {
        console.error('Failed to parse saved carousel tips');
      }
    }
  }, []);

  const displaySlides = autoSync && sessionDuration > 0 ? phaseRelevantSlides : slides;
  const currentSlide = displaySlides[currentIndex % displaySlides.length] || slides[0];

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  // Auto-play logic
  useEffect(() => {
    if (autoPlay && !isPaused && !showSettings) {
      timerRef.current = setInterval(goToNext, interval);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, isPaused, interval, showSettings, displaySlides.length]);

  const saveTips = (updatedSlides: CarouselSlide[]) => {
    setSlides(updatedSlides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSlides));
    toast.success(language === 'he' ? 'הטיפים נשמרו!' : 'Tips saved!');
  };

  const handleSaveEdit = () => {
    if (!editingSlide) return;
    const updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    saveTips(updated);
    setEditingSlide(null);
  };

  const resetToDefaults = () => {
    setSlides(DEFAULT_SLIDES);
    localStorage.removeItem(STORAGE_KEY);
    toast.success(language === 'he' ? 'הטיפים אופסו!' : 'Tips reset!');
    setShowSettings(false);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      jade: 'bg-jade/90 text-white',
      purple: 'bg-purple-600/90 text-white',
      blue: 'bg-blue-600/90 text-white',
      amber: 'bg-amber-500/90 text-white',
      green: 'bg-green-600/90 text-white',
      orange: 'bg-orange-600/90 text-white',
      rose: 'bg-rose-600/90 text-white'
    };
    return colors[color] || colors.jade;
  };

  const Icon = ICON_MAP[currentSlide.icon] || MessageSquare;

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.4,
        ease: 'easeIn' as const
      }
    })
  };

  return (
    <div 
      className={cn(
        'relative w-full h-24 md:h-28 rounded-xl overflow-hidden group shadow-lg',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={currentSlide.image}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Session Phase Indicator (when auto-sync is active) */}
      {autoSync && sessionDuration > 0 && (
        <div className="absolute top-1.5 left-2 z-10">
          <Badge 
            variant="outline" 
            className="bg-black/50 text-white border-white/30 text-[9px] backdrop-blur-sm"
          >
            <Clock className="h-2.5 w-2.5 mr-1" />
            {language === 'he' ? currentPhase.nameHe : currentPhase.nameEn}
          </Badge>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center px-3 md:px-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {/* Phase Badge with bounce animation */}
        <motion.div
          key={`phase-${currentSlide.id}`}
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shrink-0 shadow-md',
            getColorClasses(currentSlide.color)
          )}
        >
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
          <span className="text-[10px] md:text-xs font-bold">
            {language === 'he' ? currentSlide.phase : currentSlide.phaseEn}
          </span>
        </motion.div>

        {/* Tip Text */}
        <motion.p
          key={`tip-${currentSlide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="flex-1 text-white text-xs md:text-sm font-medium mx-3 leading-relaxed drop-shadow-lg"
        >
          {language === 'he' ? currentSlide.tipHe : currentSlide.tipEn}
        </motion.p>

        {/* Progress Dots */}
        <div className="flex gap-1.5 shrink-0">
          {displaySlides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300',
                idx === currentIndex % displaySlides.length
                  ? 'bg-white scale-125 shadow-glow'
                  : 'bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <motion.button
        onClick={goToPrev}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          language === 'he' ? 'right-2' : 'left-2'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>
      <motion.button
        onClick={goToNext}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          language === 'he' ? 'left-2' : 'right-2'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </motion.button>

      {/* Settings & Pause indicators */}
      <div className="absolute bottom-1.5 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Edit Button */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm"
              title={language === 'he' ? 'ערוך טיפים' : 'Edit tips'}
            >
              <Settings className="h-3 w-3" />
            </motion.button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-jade" />
                {language === 'he' ? 'התאמה אישית של טיפים' : 'Customize Tips'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {slides.map((slide) => (
                <div key={slide.id} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={slide.image} alt="" className="w-16 h-10 object-cover rounded" />
                    <div>
                      <span className="font-semibold text-sm">
                        {language === 'he' ? slide.phase : slide.phaseEn}
                      </span>
                      {slide.minRange && (
                        <p className="text-[10px] text-muted-foreground">
                          {slide.minRange[0]}-{slide.minRange[1]} min
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {editingSlide?.id === slide.id ? (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {language === 'he' ? 'טיפ בעברית:' : 'Hebrew tip:'}
                        </label>
                        <Input
                          value={editingSlide.tipHe}
                          onChange={(e) => setEditingSlide({ ...editingSlide, tipHe: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {language === 'he' ? 'טיפ באנגלית:' : 'English tip:'}
                        </label>
                        <Input
                          value={editingSlide.tipEn}
                          onChange={(e) => setEditingSlide({ ...editingSlide, tipEn: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="gap-1">
                          <Save className="h-3 w-3" />
                          {language === 'he' ? 'שמור' : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingSlide(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-muted-foreground flex-1">
                        {language === 'he' ? slide.tipHe : slide.tipEn}
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setEditingSlide(slide)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={resetToDefaults} 
                className="w-full gap-2 mt-4"
              >
                <RotateCcw className="h-4 w-4" />
                {language === 'he' ? 'איפוס לברירת מחדל' : 'Reset to defaults'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pause/Play indicator */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="p-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </motion.div>
      </div>

      {/* Animated progress bar */}
      <motion.div 
        className="absolute bottom-0 left-0 h-0.5 bg-white/80"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ 
          duration: interval / 1000, 
          ease: 'linear',
          repeat: Infinity 
        }}
        key={`progress-${currentIndex}`}
      />
    </div>
  );
}
