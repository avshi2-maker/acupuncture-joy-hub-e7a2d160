import { Sparkles, BookOpen, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TTSButton } from "@/components/audio/TTSButton";
import heroBg from "@/assets/hero-meridian-bg.png";
import baziWheel from "@/assets/bazi-wheel.jpg";

const welcomeTextHebrew = `ברוכים הבאים לקליניקה לרפואה סינית מסורתית של דר רוני ספיר. אנחנו משלבים חמשת אלפים שנות חוכמה עתיקה עם טיפול מותאם אישית כדי לעזור לכם להגיע לבריאות ולחיוניות מיטביים. שחזרו את האיזון, חדשו את החיים.`;

const Hero = () => {
  const navigate = useNavigate();

  const handleBaziClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // BaZi is now free - navigate directly
    navigate('/bazi-calculator');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-visible">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Serene zen garden with bamboo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-jade/90 via-jade/80 to-jade-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-jade-dark/50 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gold/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-gold/15 rounded-full blur-3xl animate-pulse-soft delay-300" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Bazi Wheel Image - Left Side (visible on all screens) */}
          <div className="flex-shrink-0 animate-fade-in-up order-2 lg:order-1">
            <button 
              onClick={handleBaziClick} 
              className="block animate-float cursor-pointer transition-transform hover:scale-105 text-left"
            >
              <img
                src={baziWheel}
                alt="BaZi Chinese Astrology Wheel - Click to try the calculator"
                className="w-48 sm:w-64 lg:w-80 h-auto rounded-xl shadow-2xl border border-gold/30 shadow-gold/20"
              />
              <p className="text-center text-primary-foreground/80 mt-3 text-sm font-medium">
                ✨ לחץ לנסות מחשבון בא-זי / Click to try
              </p>
            </button>
          </div>

          {/* Text Content - Center/Right */}
          <div className="max-w-2xl text-center lg:text-left order-1 lg:order-2">
            {/* Clinic Name on Mobile */}
            <div className="sm:hidden text-center mb-6 animate-fade-in-up">
              <h2 className="text-xl font-bold text-primary-foreground">Dr Roni Sapir</h2>
              <p className="text-sm text-primary-foreground/90">Complementary Medicine - Acupuncture Clinic</p>
              <p className="text-xs text-primary-foreground/70 italic">Healing Through Balance with AI</p>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-primary-foreground text-sm font-medium tracking-wide">
                Ancient Wisdom, Modern Healing
              </span>
              <TTSButton
                text={welcomeTextHebrew}
                title="Welcome Message"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:text-gold hover:bg-primary-foreground/10"
              />
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-tight mb-6 animate-fade-in-up delay-100">
              Restore Balance.
              <br />
              <span className="text-gold">Renew Life.</span>
            </h1>

            {/* Subheading */}
            <p className="font-body text-base sm:text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up delay-200">
              Experience the transformative power of Traditional Chinese Medicine. 
              Our certified practitioners combine 5,000 years of wisdom with 
              personalized care to help you achieve optimal health and vitality.
            </p>

            {/* Encyclopedia Button */}
            <div className="animate-fade-in-up delay-300">
              <Button 
                size="lg"
                onClick={() => navigate('/encyclopedia')}
                className="bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-primary-foreground text-lg px-8 py-6 shadow-lg shadow-gold/30"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                CM Digital Encyclopedia
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
