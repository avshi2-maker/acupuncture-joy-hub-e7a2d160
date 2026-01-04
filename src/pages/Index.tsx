import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Leaf,
  MessageCircle,
  Smartphone,
  X,
  Play as PlayIcon,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Volume1,
  Info,
  Key,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTier } from "@/hooks/useTier";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemedClockWidget, getClockTheme, type ClockTheme } from "@/components/ui/ThemedClockWidget";
import heroBg from "@/assets/hero-meridian-bg.png";
import newLogo from "@/assets/new-logo.png";
import { ClinicPhilosophy } from "@/components/home/ClinicPhilosophy";
// tcm-organ-clock image removed

const promoVideos = [
  { src: "/videos/promo-1.mp4", titleHe: "הקליניקה שלנו - סיור וירטואלי", titleEn: "Our Clinic - Virtual Tour" },
  { src: "/videos/promo-2.mp4", titleHe: "טיפולי דיקור סיני מסורתי", titleEn: "Traditional Acupuncture Treatments" },
  { src: "/videos/promo-3.mp4", titleHe: "רפואה סינית לכאבים כרוניים", titleEn: "Chinese Medicine for Chronic Pain" },
  { src: "/videos/promo-4.mp4", titleHe: "כל נתוני הרפואה הסינית מהידע, המחקר והניסיון של ד״ר רוני ספיר", titleEn: "All Chinese medicine data uniquely from Dr Roni Sapir own knowledge research & experience" },
];

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { setTier, setExpiresAt } = useTier();
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showInstallTooltip, setShowInstallTooltip] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [clockTheme, setClockTheme] = useState<ClockTheme>('gold');
  
  // Load clock theme from settings
  useEffect(() => {
    setClockTheme(getClockTheme());
    
    // Listen for storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'therapist_clock_theme' && e.newValue) {
        setClockTheme(e.newValue as ClockTheme);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  
  // Password testing dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [testPassword, setTestPassword] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  // Audio player is fixed to screen (not draggable) to ensure it never covers the hero name.

  const audioRef = useRef<HTMLAudioElement>(null);

  // Password validation handler
  const handlePasswordSubmit = async () => {
    if (!testPassword.trim()) {
      toast.error('נא להזין סיסמה');
      return;
    }

    setIsValidating(true);
    try {
      const { data: validationResult, error } = await supabase
        .rpc('validate_access_password', { password_input: testPassword.trim() });

      if (error) throw error;

      const result = validationResult?.[0];
      if (!result || !result.valid) {
        toast.error('סיסמה לא תקינה, בשימוש, או שפג תוקפה.');
        return;
      }

      setTier(result.tier as 'trial' | 'standard' | 'premium');
      if (result.expires_at) {
        setExpiresAt(new Date(result.expires_at));
      }

      // Handle remember me - extend session storage
      if (rememberMe) {
        localStorage.setItem('tcm_remember_session', 'true');
      }

      await supabase.from('access_logs').insert({
        action: 'password_login',
        details: { tier: result.tier, source: 'index_test_button' },
      });

      toast.success('ברוכים הבאים!');
      setShowPasswordDialog(false);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('שגיאה בכניסה. נסו שוב.');
    } finally {
      setIsValidating(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioDuration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audioRef.current.currentTime = percentage * audioDuration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (audioVolume === 0) return <VolumeX className="h-4 w-4" />;
    if (audioVolume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/972544634923", "_blank");
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % promoVideos.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + promoVideos.length) % promoVideos.length);
  };

  const currentVideo = promoVideos[currentVideoIndex];

  return (
    <>
      <Helmet>
        <title>CM Clinic | Chinese Medicine</title>
        <meta
          name="description"
          content="Experience the transformative power of Chinese Medicine. Restore balance and renew life."
        />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin + "/" : "/"} />
      </Helmet>

      <div className="min-h-screen overflow-y-auto">
        {/* Hero Section */}
        <main
          className="h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-jade/40" />

        {/* Top left - Home button */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <Link 
            to="/"
            className="flex items-center justify-center w-10 h-10 bg-cream/10 hover:bg-cream/20 backdrop-blur-sm rounded-full transition-all border border-cream/30"
            aria-label="Home"
          >
            <Home className="h-5 w-5 text-cream" />
          </Link>
        </div>

        {/* Top right navigation */}
        <nav className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-3">
          {/* Themed Clock Widget - Desktop only */}
          <div className="hidden md:block">
            <ThemedClockWidget theme={clockTheme} />
          </div>
          
          <LanguageSwitcher />
          
          <button 
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
          
          {/* Therapist Login Button with pulsing animation */}
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="border-gold bg-foreground/80 text-gold hover:bg-gold hover:text-foreground font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-[pulse_2s_ease-in-out_infinite]"
          >
            <Link to="/gate">{t("therapistLogin")}</Link>
          </Button>
        </nav>

        {/* Text container - no background box */}
        <section className="relative z-10 w-full max-w-2xl text-center p-8 md:p-12">
          
          {/* Dr. Sapir name with hover/click audio player */}
          
          <div
            className="relative inline-block group"
            onClick={() => setShowAudioPlayer((v) => !v)}
          >
            <div className="flex items-center justify-center gap-3 mb-1 cursor-pointer select-none">
              <img src={newLogo} alt="TCM Clinic Logo" className="h-10 w-10 object-contain" />
              <p className="text-lg md:text-xl font-display text-cream group-hover:text-gold transition-colors">
                {t("drRoniSapir")}
              </p>
              <Volume2 className="h-4 w-4 text-cream/60 group-hover:text-gold transition-colors" />
            </div>
            
            {/* Audio player popup - fixed bottom-right so it never covers the name/subtitle */}
            {showAudioPlayer && (
              <div
                className="fixed bg-cream rounded-lg p-4 shadow-2xl z-50 animate-fade-in w-[340px] max-w-[calc(100vw-32px)] border-2 border-gold"
                style={{
                  right: "16px",
                  bottom: "104px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                    setIsPlaying(false);
                    setAudioProgress(0);
                    setShowAudioPlayer(false);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors shadow-lg border-2 border-background"
                  aria-label={language === "he" ? "סגור" : "Close"}
                >
                  <X className="h-5 w-5 text-destructive-foreground" />
                </button>
                
                <audio 
                  ref={audioRef} 
                  src="/audio/roni_bio.mp3"
                  onEnded={() => { setIsPlaying(false); setAudioProgress(0); }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                />
                
                {/* Main controls row - adjusted top padding for drag handle */}
                <div className="flex items-center gap-3 mb-3 mt-6">
                  <button
                    onClick={toggleAudio}
                    className="w-10 h-10 rounded-full bg-gold hover:bg-gold/80 flex items-center justify-center transition-colors shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-foreground" />
                    ) : (
                      <Play className="h-5 w-5 text-foreground ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-foreground text-xs font-medium">
                      {language === "he" ? "ביוגרפיה קולית" : "Voice Bio"}
                    </p>
                    <p className="text-foreground/70 text-xs">Dr. Roni Sapir</p>
                  </div>
                  
                  {/* Volume control */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button 
                      onClick={() => setAudioVolume(audioVolume > 0 ? 0 : 0.7)}
                      className="text-foreground/70 hover:text-foreground transition-colors p-1"
                    >
                      {getVolumeIcon()}
                    </button>
                    
                    {showVolumeSlider && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground/95 rounded-lg p-2 shadow-lg">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={audioVolume}
                          onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                          className="w-20 h-1.5 accent-gold cursor-pointer"
                          style={{ writingMode: 'horizontal-tb' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {isPlaying && (
                    <div className="flex gap-0.5 mr-4">
                      {[1,2,3].map((i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-gold rounded-full animate-pulse"
                          style={{ 
                            height: `${8 + i * 4}px`,
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div 
                  className="h-1.5 bg-foreground/20 rounded-full cursor-pointer group"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-gold rounded-full relative transition-all"
                    style={{ width: audioDuration ? `${(audioProgress / audioDuration) * 100}%` : '0%' }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                {/* Time display */}
                <div className="flex justify-between mt-1 text-foreground/60 text-xs">
                  <span>{formatTime(audioProgress)}</span>
                  <span>{formatTime(audioDuration)}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-cream/80">
            {t("clinicSubtitle")}
          </p>
          <p className="text-xs text-cream/60 italic mb-8">
            {t("clinicTagline")}
          </p>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-cream">
            {t("restoreBalance")}
          </h1>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-gold mt-2">
            {t("renewLife")}
          </h2>

          <p className="mt-6 text-cream/90 text-base md:text-lg leading-relaxed">
            {t("heroDescription")}
          </p>
        </section>

        {/* Bottom buttons row - responsive wrap */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-5xl safe-area-inset-bottom">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Watch Video Button */}
            <button
              onClick={() => {
                setCurrentVideoIndex(0); // Always start from video #1
                setShowVideoModal(true);
              }}
              className="flex items-center gap-2 bg-foreground/80 hover:bg-foreground/90 backdrop-blur-sm text-cream px-3 py-2 sm:px-4 sm:py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group max-w-full min-w-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite] flex-shrink-0">
                <PlayIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground fill-foreground" />
              </div>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[220px]">
                {t("watchVideoCta")}
              </span>
            </button>

            {/* CM Digital Encyclopedia Button */}
            <Link
              to="/encyclopedia"
              className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-foreground px-4 py-2 sm:px-6 sm:py-3 rounded-full sm:rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] font-medium max-w-full min-w-0"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate max-w-[220px]">
                {t("encyclopediaCta")}
              </span>
            </Link>

            {/* Install App Button with touch-friendly help */}
            {showInstallBanner && (
              <div className="relative animate-fade-in group flex items-center max-w-full">
                <Link
                  to="/install"
                  className="flex items-center gap-2 bg-jade hover:bg-jade/90 text-cream px-3 py-2 sm:px-4 sm:py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] font-medium text-xs sm:text-sm max-w-full min-w-0"
                >
                  <Smartphone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-none">{t("installAppCta")}</span>
                </Link>

                {/* Help button (tap-friendly) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowInstallTooltip((v) => !v);
                  }}
                  className="ml-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-foreground/70 hover:bg-foreground text-cream flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label={t("installHelpAria")}
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Tooltip: shows on hover (desktop) AND on tap via help button */}
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-opacity duration-200 z-40 group-hover:opacity-100 group-hover:pointer-events-auto ${showInstallTooltip ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                  <div className="bg-foreground/95 text-cream rounded-lg p-3 shadow-xl w-[min(280px,90vw)] text-xs">
                    <p className="font-semibold mb-2 text-gold">{t("installTooltipTitle")}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-cream/90">{t("installTooltipIOS")}</p>
                        <p className="text-cream/70">{t("installTooltipIOSStep")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-cream/90">{t("installTooltipAndroid")}</p>
                        <p className="text-cream/70">{t("installTooltipAndroidStep")}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-cream/50 italic">{t("installTooltipFooter")}</p>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-foreground/95" />
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowInstallTooltip(false);
                    setShowInstallBanner(false);
                  }}
                  className="absolute -top-2 -right-2 bg-foreground/80 hover:bg-foreground text-cream rounded-full p-1 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Test with Password Button for Dr. Roni - subtle, positioned to the side */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-20">
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-1 bg-foreground/10 hover:bg-foreground/20 backdrop-blur-sm text-cream/60 hover:text-cream px-2 py-1 rounded transition-all text-[10px] opacity-60 hover:opacity-100"
                title="כניסת מטפלים עם סיסמה"
              >
                <Key className="h-2.5 w-2.5" />
                <span>מטפלים</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">כניסה עם סיסמה</DialogTitle>
                <DialogDescription className="text-right">
                  הזינו את הסיסמה שקיבלתם מד״ר רוני ספיר
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  type="password"
                  placeholder="הזינו סיסמה..."
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                  className="text-right"
                  dir="rtl"
                />
                
                {/* Remember me checkbox */}
                <div className="flex items-center gap-2 justify-end">
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                    זכור אותי
                  </Label>
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                </div>
                
                <Button
                  onClick={handlePasswordSubmit}
                  disabled={isValidating || !testPassword.trim()}
                  className="w-full"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      בודק...
                    </>
                  ) : (
                    'כניסה'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

        {/* Clinic Philosophy Section */}
        <ClinicPhilosophy />
      </div>
      {/* Video Modal - Auto-playing all videos in sequence */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          {/* Top bar with back button and landscape hint */}
          <div className="flex items-center justify-between p-3 bg-black/80 backdrop-blur-sm shrink-0">
            <button 
              onClick={() => setShowVideoModal(false)}
              className="flex items-center gap-2 bg-foreground/20 hover:bg-foreground/30 text-cream rounded-full px-4 py-2 transition-colors"
              aria-label={t("back")}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">{t("back")}</span>
            </button>
            
            {/* Landscape hint - only on mobile portrait */}
            <div className="flex items-center gap-2 text-cream/70 text-xs sm:hidden">
              <RotateCcw className="h-4 w-4" />
              <span>{language === "he" ? "סובב למסך רחב" : "Rotate for fullscreen"}</span>
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setShowVideoModal(false)}
              className="bg-foreground/20 hover:bg-foreground/30 text-cream rounded-full p-2 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Video container - fills remaining space */}
          <div 
            className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-w-5xl flex flex-col">
              {/* Video title */}
              <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg mb-2 shrink-0">
                <p className="text-cream font-medium text-sm md:text-base" dir="rtl">
                  {promoVideos[currentVideoIndex].titleHe}
                </p>
                <p className="text-cream/70 text-xs md:text-sm">
                  {promoVideos[currentVideoIndex].titleEn}
                </p>
                <p className="text-gold text-xs mt-1">
                  {language === "he" ? `סרטון ${currentVideoIndex + 1} מתוך ${promoVideos.length}` : `Video ${currentVideoIndex + 1} of ${promoVideos.length}`}
                </p>
              </div>

              {/* Video player - contained within viewport */}
              <div className="flex-1 flex items-center justify-center min-h-0">
                <video 
                  key={promoVideos[currentVideoIndex].src}
                  className="w-full h-full max-h-[70vh] object-contain rounded-lg"
                  controls
                  autoPlay
                  playsInline
                  poster="/videos/poster-default.jpg"
                  onEnded={() => {
                    // Auto-advance to next video, or loop if last video
                    if (currentVideoIndex < promoVideos.length - 1) {
                      setCurrentVideoIndex(prev => prev + 1);
                    } else {
                      setCurrentVideoIndex(0); // Loop back to start
                    }
                  }}
                >
                  <source src={promoVideos[currentVideoIndex].src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video progress indicators */}
              <div className="flex justify-center gap-2 mt-3 shrink-0">
                {promoVideos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentVideoIndex 
                        ? "bg-gold scale-125" 
                        : index < currentVideoIndex 
                          ? "bg-primary" // Already played
                          : "bg-muted hover:bg-muted-foreground" // Not yet played
                    }`}
                    aria-label={`Go to video ${index + 1}`}
                    title={video.titleEn}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;

