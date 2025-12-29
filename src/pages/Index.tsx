import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-meridian-bg.png";
// tcm-organ-clock image removed

const promoVideos = [
  { src: "/videos/promo-1.mp4", titleHe: "הקליניקה שלנו - סיור וירטואלי", titleEn: "Our Clinic - Virtual Tour" },
  { src: "/videos/promo-2.mp4", titleHe: "טיפולי דיקור סיני מסורתי", titleEn: "Traditional Acupuncture Treatments" },
  { src: "/videos/promo-3.mp4", titleHe: "רפואה סינית לכאבים כרוניים", titleEn: "Chinese Medicine for Chronic Pain" },
  { src: "/videos/promo-4.mp4", titleHe: "כל נתוני הרפואה הסינית מהידע, המחקר והניסיון של ד״ר רוני ספיר", titleEn: "All Chinese medicine data uniquely from Dr Roni Sapir own knowledge research & experience" },
];

const Index = () => {
  const { t, language } = useLanguage();
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
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Draggable audio player state
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, playerX: 0, playerY: 0 });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        setPlayerPosition({
          x: dragStartRef.current.playerX + deltaX,
          y: dragStartRef.current.playerY + deltaY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      playerX: playerPosition.x,
      playerY: playerPosition.y,
    };
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
        <title>TCM Clinic | Traditional Chinese Medicine</title>
        <meta
          name="description"
          content="Experience the transformative power of Traditional Chinese Medicine. Restore balance and renew life."
        />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin + "/" : "/"} />
      </Helmet>

      <main
        className="h-screen overflow-hidden flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
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
            onMouseEnter={() => setShowAudioPlayer(true)}
            onClick={() => setShowAudioPlayer((v) => !v)}
          >
            <div className="flex items-center justify-center gap-2 mb-1 cursor-pointer select-none">
              <Leaf className="h-6 w-6 text-cream" />
              <p className="text-lg md:text-xl font-display text-cream group-hover:text-gold transition-colors">
                {t("drRoniSapir")}
              </p>
              <Volume2 className="h-4 w-4 text-cream/60 group-hover:text-gold transition-colors" />
            </div>
            
            {/* Audio player popup - positioned ABOVE the name, draggable, fully opaque */}
            {showAudioPlayer && (
              <div
                className="fixed bg-cream rounded-lg p-4 shadow-2xl z-50 animate-fade-in min-w-[300px] border-2 border-gold"
                style={{
                  left: `${24 + playerPosition.x}px`,
                  top: `${88 + playerPosition.y}px`,
                  transform: 'none',
                  cursor: isDragging ? 'grabbing' : 'default',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div 
                  className="absolute top-0 left-0 right-0 h-8 bg-gold/30 rounded-t-lg cursor-grab flex items-center justify-center"
                  onMouseDown={handleDragStart}
                >
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-foreground/40 rounded-full" />
                  </div>
                </div>
                
                {/* Close button - more prominent */}
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
                    setPlayerPosition({ x: 0, y: 0 });
                  }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-colors shadow-lg border-2 border-background"
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

        {/* Bottom buttons row - all three in one line */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {/* Watch Video Button */}
          <button
            onClick={() => {
              setCurrentVideoIndex(0); // Always start from video #1
              setShowVideoModal(true);
            }}
            className="flex items-center gap-3 bg-foreground/80 hover:bg-foreground/90 backdrop-blur-sm text-cream px-4 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
              <PlayIcon className="h-4 w-4 text-foreground fill-foreground" />
            </div>
            <span className="text-sm font-medium pr-2">{t("watchVideoCta")}</span>
          </button>

          {/* CM Digital Encyclopedia Button */}
          <Link
            to="/encyclopedia"
            className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-foreground px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium animate-[pulse_3s_ease-in-out_infinite]"
          >
            <BookOpen className="h-5 w-5" />
            <span>{t("encyclopediaCta")}</span>
          </Link>

          {/* Install App Button with touch-friendly help */}
          {showInstallBanner && (
            <div className="relative animate-fade-in group flex items-center">
              <Link
                to="/install"
                className="flex items-center gap-2 bg-jade hover:bg-jade/90 text-cream px-4 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium text-sm animate-[pulse_2.5s_ease-in-out_infinite]"
              >
                <Smartphone className="h-4 w-4" />
                <span>{t("installAppCta")}</span>
              </Link>

              {/* Help button (tap-friendly) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowInstallTooltip((v) => !v);
                }}
                className="ml-2 w-10 h-10 rounded-full bg-foreground/70 hover:bg-foreground text-cream flex items-center justify-center transition-colors"
                aria-label={t("installHelpAria")}
              >
                <Info className="h-5 w-5" />
              </button>

              {/* Tooltip: shows on hover (desktop) AND on tap via help button */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-opacity duration-200 z-40 group-hover:opacity-100 group-hover:pointer-events-auto ${showInstallTooltip ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              >
                <div className="bg-foreground/95 text-cream rounded-lg p-3 shadow-xl min-w-[220px] text-xs">
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
      </main>

      {/* Video Modal - Auto-playing all videos in sequence */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Back button */}
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 left-3 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-2 transition-colors flex items-center gap-2"
              aria-label={t("back")}
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">{t("back")}</span>
            </button>

            {/* Close button */}
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video title - show current video info */}
            <div className="absolute top-14 left-3 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-medium text-sm md:text-base" dir="rtl">
                {promoVideos[currentVideoIndex].titleHe}
              </p>
              <p className="text-white/70 text-xs md:text-sm">
                {promoVideos[currentVideoIndex].titleEn}
              </p>
              <p className="text-gold text-xs mt-1">
                {language === "he" ? `סרטון ${currentVideoIndex + 1} מתוך ${promoVideos.length}` : `Video ${currentVideoIndex + 1} of ${promoVideos.length}`}
              </p>
            </div>

            {/* Video player - auto-advances to next video */}
            <video 
              key={promoVideos[currentVideoIndex].src}
              className="w-full aspect-video"
              controls
              autoPlay
              poster="/videos/poster-default.jpg"
              onEnded={() => {
                // Auto-advance to next video, or close modal if last video
                if (currentVideoIndex < promoVideos.length - 1) {
                  setCurrentVideoIndex(prev => prev + 1);
                } else {
                  // Optional: loop back to first video or close
                  setCurrentVideoIndex(0); // Loop back to start
                }
              }}
            >
              <source src={promoVideos[currentVideoIndex].src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video progress indicators */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {promoVideos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentVideoIndex 
                      ? "bg-gold scale-125" 
                      : index < currentVideoIndex 
                        ? "bg-jade" // Already played
                        : "bg-white/50 hover:bg-white/80" // Not yet played
                  }`}
                  aria-label={`Go to video ${index + 1}`}
                  title={video.titleEn}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;

