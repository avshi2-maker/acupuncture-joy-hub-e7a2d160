import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Leaf, Code } from "lucide-react";
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
  const [frequencyData, setFrequencyData] = useState<number[]>([0, 0, 0, 0]);
  const bioAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
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

  // Frequency analysis animation loop
  const updateFrequencyData = useCallback(() => {
    if (analyserRef.current && isPlayingBio) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample 4 frequency bands for our 4 bars
      const bands = [
        dataArray.slice(0, 4).reduce((a, b) => a + b, 0) / 4,      // Low
        dataArray.slice(4, 8).reduce((a, b) => a + b, 0) / 4,      // Low-mid
        dataArray.slice(8, 16).reduce((a, b) => a + b, 0) / 8,     // Mid
        dataArray.slice(16, 32).reduce((a, b) => a + b, 0) / 16,   // High
      ].map(v => Math.min(1, v / 180)); // Normalize to 0-1
      
      setFrequencyData(bands);
      animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
    }
  }, [isPlayingBio]);

  useEffect(() => {
    if (isPlayingBio) {
      animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlayingBio, updateFrequencyData]);

  const handleBioToggle = () => {
    if (!bioAudioRef.current) {
      bioAudioRef.current = new Audio('/audio/roni_bio.mp3');
      bioAudioRef.current.crossOrigin = "anonymous";
      bioAudioRef.current.onended = () => {
        setIsPlayingBio(false);
        setBioProgress(0);
        setFrequencyData([0, 0, 0, 0]);
      };
      bioAudioRef.current.onerror = () => {
        setIsPlayingBio(false);
        setBioProgress(0);
        setFrequencyData([0, 0, 0, 0]);
      };
      bioAudioRef.current.ontimeupdate = () => {
        if (bioAudioRef.current && bioAudioRef.current.duration) {
          setBioProgress((bioAudioRef.current.currentTime / bioAudioRef.current.duration) * 100);
        }
      };
    }
    
    // Setup Web Audio API for frequency analysis
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      sourceRef.current = audioContextRef.current.createMediaElementSource(bioAudioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    if (isPlayingBio) {
      bioAudioRef.current.pause();
      bioAudioRef.current.currentTime = 0;
      setIsPlayingBio(false);
      setBioProgress(0);
      setFrequencyData([0, 0, 0, 0]);
    } else {
      bioAudioRef.current.currentTime = 0;
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      bioAudioRef.current.play().then(() => {
        setIsPlayingBio(true);
      }).catch(console.error);
    }
  };

  // Removed auto-play on hover - user requested click-only playback

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
                className="text-lg lg:text-xl font-bold cursor-pointer hover:underline underline-offset-2 inline-flex items-center gap-2 text-left group/bio relative"
                title={isPlayingBio ? "לחץ לעצור" : "לחץ לשמוע ביוגרפיה"}
              >
                Dr Roni Sapir
                {isPlayingBio ? (
                  <span className="relative inline-flex items-center justify-center w-7 h-7">
                    {/* Glow effect */}
                    <span 
                      className="absolute inset-0 rounded-full blur-md transition-opacity duration-300"
                      style={{ 
                        backgroundColor: 'hsl(var(--gold))',
                        opacity: 0.4 + (frequencyData.reduce((a, b) => a + b, 0) / 4) * 0.4
                      }}
                    />
                    {/* Circular progress ring with glow */}
                    <svg className="absolute inset-0 w-7 h-7 -rotate-90 drop-shadow-[0_0_6px_hsl(var(--gold))]" viewBox="0 0 28 28">
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-20"
                      />
                      <circle
                        cx="14"
                        cy="14"
                        r="12"
                        fill="none"
                        stroke="hsl(var(--gold))"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 12}
                        strokeDashoffset={2 * Math.PI * 12 * (1 - bioProgress / 100)}
                        className="transition-all duration-150 ease-linear"
                        style={{ filter: 'drop-shadow(0 0 3px hsl(var(--gold)))' }}
                      />
                    </svg>
                    {/* Real frequency waveform inside */}
                    <span className="inline-flex items-end justify-center gap-0.5 h-3 z-10">
                      {frequencyData.map((level, i) => (
                        <span 
                          key={i}
                          className="w-0.5 bg-gold rounded-full transition-all duration-75"
                          style={{ 
                            height: `${Math.max(20, level * 100)}%`,
                            boxShadow: level > 0.3 ? '0 0 4px hsl(var(--gold))' : 'none'
                          }}
                        />
                      ))}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs opacity-0 group-hover/bio:opacity-70 transition-opacity duration-200 font-normal whitespace-nowrap">
                    🔊 Click to hear bio
                  </span>
                )}
              </button>
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
