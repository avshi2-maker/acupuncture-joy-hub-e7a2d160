import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import heroBg from "@/assets/hero-meridian-bg.png";

const Index = () => {
  const { t } = useLanguage();

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
      </main>
    </>
  );
};

export default Index;

