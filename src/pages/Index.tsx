import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, MessageCircle, Smartphone, X, Play, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-meridian-bg.png";

const promoVideos = [
  { src: "/videos/promo-1.mp4", titleHe: "הקליניקה שלנו - סיור וירטואלי", titleEn: "Our Clinic - Virtual Tour" },
  { src: "/videos/promo-2.mp4", titleHe: "טיפולי דיקור סיני מסורתי", titleEn: "Traditional Acupuncture Treatments" },
  { src: "/videos/promo-3.mp4", titleHe: "רפואה סינית לכאבים כרוניים", titleEn: "Chinese Medicine for Chronic Pain" },
  { src: "/videos/promo-4.mp4", titleHe: "המלצות מטופלים מרוצים", titleEn: "Happy Patient Testimonials" },
];

const Index = () => {
  const { t, language } = useLanguage();
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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
          
          <Button asChild variant="outline" size="sm" className="border-cream/50 text-cream hover:bg-cream/10 hover:text-cream">
            <Link to="/gate">{t("therapistLogin")}</Link>
          </Button>
        </nav>

        {/* Text container - no background box */}
        <section className="relative z-10 w-full max-w-2xl text-center p-8 md:p-12">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Leaf className="h-6 w-6 text-cream" />
            <p className="text-lg md:text-xl font-display text-cream">{t("drRoniSapir")}</p>
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

        {/* CM Digital Encyclopedia Button - Bottom Center */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <Link 
            to="/encyclopedia"
            className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-foreground px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium animate-[pulse_3s_ease-in-out_infinite]"
          >
            <BookOpen className="h-5 w-5" />
            <span>CM Digital Encyclopedia</span>
          </Link>
        </div>

        {/* Watch Video Button - Bottom Left */}
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-30">
          <button 
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-3 bg-foreground/80 hover:bg-foreground/90 backdrop-blur-sm text-cream px-4 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
              <Play className="h-4 w-4 text-foreground fill-foreground" />
            </div>
            <span className="text-sm font-medium pr-2">Watch Short Video Clinic Presentation</span>
          </button>
        </div>

        {/* Install App Button - Bottom Right */}
        {showInstallBanner && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 animate-fade-in">
            <div className="relative">
              <Link 
                to="/install"
                className="flex items-center gap-2 bg-jade hover:bg-jade/90 text-white px-4 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium text-sm animate-[pulse_2.5s_ease-in-out_infinite]"
              >
                <Smartphone className="h-4 w-4" />
                <span>Install App</span>
              </Link>
              <button 
                onClick={(e) => { e.preventDefault(); setShowInstallBanner(false); }}
                className="absolute -top-2 -right-2 bg-foreground/80 hover:bg-foreground text-cream rounded-full p-1 transition-colors"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Video Modal */}
      {showVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video title */}
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-medium text-sm md:text-base" dir={language === "he" ? "rtl" : "ltr"}>
                {language === "he" ? currentVideo.titleHe : currentVideo.titleEn}
              </p>
            </div>

            {/* Previous button */}
            <button
              onClick={prevVideo}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Next button */}
            <button
              onClick={nextVideo}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
              aria-label="Next video"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Video player */}
            <video 
              key={currentVideo.src}
              className="w-full aspect-video"
              controls
              autoPlay
              poster="/videos/poster-default.jpg"
            >
              <source src={currentVideo.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Video indicators/thumbnails */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {promoVideos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentVideoIndex 
                      ? "bg-gold scale-125" 
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to video ${index + 1}`}
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

