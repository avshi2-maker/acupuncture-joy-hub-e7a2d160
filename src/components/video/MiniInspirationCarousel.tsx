import { useState, useEffect, useRef } from 'react';
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Import your custom therapy session images
import therapySession1 from '@/assets/carousel/therapy-session-1.jpg';
import therapySession2 from '@/assets/carousel/therapy-session-2.jpg';
import therapySession3 from '@/assets/carousel/therapy-session-3.jpg';
import therapySession4 from '@/assets/carousel/therapy-session-4.png';

// Default session tips that rotate with images
const DEFAULT_SLIDES = [
  {
    id: 'welcome',
    image: therapySession1,
    tipHe: 'השתמשו בטכניקות שכנוע פסיכולוגיות מבוססות מחקר',
    tipEn: 'Use research-based psychological persuasion techniques',
    phase: 'טכניקות',
    phaseEn: 'Techniques',
    icon: 'MessageSquare',
    color: 'jade'
  },
  {
    id: 'stats',
    image: therapySession2,
    tipHe: 'הציגו נתוני הצלחה: כאב כרוני 75-85%, מיגרנה 70-80%',
    tipEn: 'Present success rates: Chronic pain 75-85%, Migraine 70-80%',
    phase: 'נתונים',
    phaseEn: 'Statistics',
    icon: 'Target',
    color: 'purple'
  },
  {
    id: 'video-session',
    image: therapySession3,
    tipHe: 'שמרו על קשר עין גם בפגישות וידאו מרחוק',
    tipEn: 'Maintain eye contact even in remote video sessions',
    phase: 'וידאו',
    phaseEn: 'Video',
    icon: 'Eye',
    color: 'blue'
  },
  {
    id: 'consultation',
    image: therapySession4,
    tipHe: 'הסבירו את תוכנית הטיפול בעזרת הדגמה ויזואלית',
    tipEn: 'Explain treatment plan with visual demonstration',
    phase: 'הדגמה',
    phaseEn: 'Demo',
    icon: 'Zap',
    color: 'amber'
  }
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
}

interface MiniInspirationCarouselProps {
  autoPlay?: boolean;
  interval?: number;
  language?: 'he' | 'en';
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Target,
  Eye,
  Zap,
  BookOpen
};

export function MiniInspirationCarousel({
  autoPlay = true,
  interval = 5000,
  language = 'he',
  className
}: MiniInspirationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>(DEFAULT_SLIDES);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Load saved tips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved tips with default images (in case images change)
        const merged = DEFAULT_SLIDES.map((defaultSlide, idx) => {
          const savedSlide = parsed[idx];
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

  const currentSlide = slides[currentIndex];

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
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
  }, [autoPlay, isPaused, interval, showSettings]);

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
      orange: 'bg-orange-600/90 text-white'
    };
    return colors[color] || colors.jade;
  };

  const Icon = ICON_MAP[currentSlide.icon] || MessageSquare;

  // Animation variants for smooth transitions
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

        {/* Tip Text with typewriter effect */}
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
          {slides.map((_, idx) => (
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
                idx === currentIndex
                  ? 'bg-white scale-125 shadow-glow'
                  : 'bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Show on hover */}
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
              {slides.map((slide, idx) => (
                <div key={slide.id} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={slide.image} alt="" className="w-16 h-10 object-cover rounded" />
                    <span className="font-semibold text-sm">
                      {language === 'he' ? slide.phase : slide.phaseEn}
                    </span>
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
        key={currentIndex}
      />
    </div>
  );
}
