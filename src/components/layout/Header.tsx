import { useState, useEffect, useRef } from "react";
import { Menu, X, Leaf, Code, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlayingBio, setIsPlayingBio] = useState(false);
  const [bioProgress, setBioProgress] = useState(0);
  const bioAudioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const { t } = useLanguage();

  const isDevMode = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('lovableproject.com');

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBioToggle = () => {
    if (!bioAudioRef.current) {
      bioAudioRef.current = new Audio('/audio/roni_bio.mp3');
      bioAudioRef.current.onended = () => {
        setIsPlayingBio(false);
        setBioProgress(0);
      };
      bioAudioRef.current.onerror = () => {
        setIsPlayingBio(false);
        setBioProgress(0);
      };
      bioAudioRef.current.ontimeupdate = () => {
        if (bioAudioRef.current && bioAudioRef.current.duration) {
          setBioProgress((bioAudioRef.current.currentTime / bioAudioRef.current.duration) * 100);
        }
      };
    }
    
    if (isPlayingBio) {
      bioAudioRef.current.pause();
      bioAudioRef.current.currentTime = 0;
      setIsPlayingBio(false);
      setBioProgress(0);
    } else {
      bioAudioRef.current.currentTime = 0;
      bioAudioRef.current.play().then(() => {
        setIsPlayingBio(true);
      }).catch(console.error);
    }
  };

  const handleBioHover = () => {
    // Only auto-play on hover for desktop (non-touch devices)
    if (window.matchMedia('(hover: hover)').matches && !isPlayingBio) {
      handleBioToggle();
    }
  };

  const handleBioLeave = () => {
    // Only auto-stop on leave for desktop
    if (window.matchMedia('(hover: hover)').matches && bioAudioRef.current && isPlayingBio) {
      bioAudioRef.current.pause();
      bioAudioRef.current.currentTime = 0;
      setIsPlayingBio(false);
      setBioProgress(0);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className={`p-2 rounded-full transition-all duration-300 flex-shrink-0 ${isScrolled || !isHomePage ? 'bg-jade/10' : 'bg-primary-foreground/10'}`}>
            <Leaf className={`w-6 h-6 transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-jade' : 'text-primary-foreground'}`} />
          </div>
          <div className={`font-display tracking-wide transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'} hidden sm:flex flex-col leading-tight`}>
            <div className="relative inline-block">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBioToggle();
                }}
                onMouseEnter={handleBioHover}
                onMouseLeave={handleBioLeave}
                className="text-lg lg:text-xl font-bold cursor-pointer hover:underline underline-offset-2 inline-flex items-center gap-2 text-left group/bio relative"
                title={isPlayingBio ? "Click to stop" : "Click to hear bio"}
              >
                Dr Roni Sapir
                {isPlayingBio ? (
                  <span className="inline-flex items-center gap-0.5 h-4">
                    <span className="w-0.5 h-full bg-gold rounded-full animate-waveform" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3 bg-gold rounded-full animate-waveform" style={{ animationDelay: '100ms' }} />
                    <span className="w-0.5 h-full bg-gold rounded-full animate-waveform" style={{ animationDelay: '200ms' }} />
                    <span className="w-0.5 h-2 bg-gold rounded-full animate-waveform" style={{ animationDelay: '300ms' }} />
                    <span className="w-0.5 h-3 bg-gold rounded-full animate-waveform" style={{ animationDelay: '400ms' }} />
                  </span>
                ) : (
                  <span className="text-xs opacity-0 group-hover/bio:opacity-70 transition-opacity duration-200 font-normal whitespace-nowrap">
                    🔊 Click to hear bio
                  </span>
                )}
              </button>
              {/* Progress bar */}
              {isPlayingBio && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-150 ease-linear rounded-full"
                    style={{ width: `${bioProgress}%` }}
                  />
                </div>
              )}
            </div>
            <span className="text-sm lg:text-base font-semibold opacity-90">Complementary Medicine - Acupuncture Clinic</span>
            <span className="text-xs lg:text-sm font-normal opacity-70 italic">Healing Through Balance with AI</span>
          </div>
        </Link>

        {/* Dev Mode Badge */}
        {isDevMode && (
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono">
              <Code className="w-3 h-3" />
              DEV MODE
            </Badge>
            <Button asChild variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              <Link to="/tcm-brain">TCM Brain</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              <Link to="/admin/knowledge">Knowledge</Link>
            </Button>
          </div>
        )}

        {/* Desktop Navigation - WhatsApp + Therapist Login */}
        <nav className="hidden lg:flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          
          {/* WhatsApp Button */}
          <WhatsAppCTA 
            variant="minimal"
            phoneNumber="972544634923"
            message="שלום! אשמח לשמוע עוד על הטיפולים שלכם"
          />
          
          <Button asChild variant={isScrolled || !isHomePage ? "hero" : "heroOutline"} size="lg">
            <Link to="/gate">{t("therapistLogin")}</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg shadow-elevated transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
          {/* WhatsApp Button */}
          <WhatsAppCTA 
            variant="minimal"
            phoneNumber="972544634923"
            message="שלום! אשמח לשמוע עוד על הטיפולים שלכם"
          />
          
          {/* Therapist Login - Main CTA */}
          <Button asChild variant="hero" size="lg" className="w-full">
            <Link to="/gate" onClick={() => setIsMobileMenuOpen(false)}>
              {t("therapistLogin")}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
