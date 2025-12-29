import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, MessageCircle, Smartphone, X, Download, Play, BookOpen } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-meridian-bg.png";

const Index = () => {
  const { t } = useLanguage();
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  const handleWhatsApp = () => {
    window.open("https://wa.me/972544634923", "_blank");
  };

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
        className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
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
            className="flex items-center gap-2 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-foreground px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <BookOpen className="h-5 w-5" />
            <span>CM Digital Encyclopedia</span>
          </Link>
        </div>

        {/* Watch Video Button - Bottom Left */}
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-30">
          <button className="flex items-center gap-3 bg-foreground/80 hover:bg-foreground/90 backdrop-blur-sm text-cream px-4 py-3 rounded-full transition-all shadow-lg hover:shadow-xl group">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <Play className="h-4 w-4 text-foreground fill-foreground" />
            </div>
            <span className="text-sm font-medium pr-2">Watch Short Video Clinic Presentation</span>
          </button>
        </div>

        {/* Install App Banner - Bottom Right */}
        {showInstallBanner && (
          <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 animate-fade-in">
            <div className="bg-card border border-border rounded-lg shadow-elevated p-4 w-72">
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg border border-jade/30 bg-jade/5">
                  <Smartphone className="h-6 w-6 text-jade animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">Install Our App</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Install for faster access and offline support.
                  </p>
                </div>
              </div>
              
              <Button asChild size="sm" className="w-full mt-3 bg-jade hover:bg-jade/90 text-white">
                <Link to="/install" className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Install Mobile App Android/iOS
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Index;

