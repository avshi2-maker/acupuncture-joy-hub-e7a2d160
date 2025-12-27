import { useState } from "react";
import { Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-meridian-bg.png";
import baziWheel from "@/assets/bazi-wheel.jpg";
import { useTier } from "@/hooks/useTier";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const navigate = useNavigate();
  const { tier } = useTier();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const handleBaziClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tier) {
      navigate('/bazi-calculator');
    } else {
      setShowRegisterDialog(true);
    }
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
          {/* Bazi Wheel Image - Left Side */}
          <div className="hidden lg:block flex-shrink-0 animate-fade-in-up">
            <button 
              onClick={handleBaziClick} 
              className="block animate-float cursor-pointer transition-transform hover:scale-105 text-left"
            >
              <img
                src={baziWheel}
                alt="BaZi Chinese Astrology Wheel - Click to try the calculator"
                className="w-80 h-auto rounded-xl shadow-2xl border border-gold/30 shadow-gold/20"
              />
              <p className="text-center text-primary-foreground/80 mt-3 text-sm font-medium">
                ✨ לחץ לנסות מחשבון בא-זי / Click to try
              </p>
            </button>
          </div>

          {/* Text Content - Center/Right */}
          <div className="max-w-2xl text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-primary-foreground text-sm font-medium tracking-wide">
                Ancient Wisdom, Modern Healing
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-tight mb-6 animate-fade-in-up delay-100">
              Restore Balance.
              <br />
              <span className="text-gold">Renew Life.</span>
            </h1>

            {/* Subheading */}
            <p className="font-body text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-fade-in-up delay-200">
              Experience the transformative power of Traditional Chinese Medicine. 
              Our certified practitioners combine 5,000 years of wisdom with 
              personalized care to help you achieve optimal health and vitality.
            </p>

          </div>
        </div>
      </div>

      {/* Registration Required Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-gold" />
            </div>
            <DialogTitle className="text-xl font-display">
              🔮 BaZi Calculator Access
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              <span className="block mb-2">
                לצפייה במחשבון בא-זי יש להירשם כמטפל
              </span>
              <span className="block text-muted-foreground">
                To view the BaZi Calculator, you must register as a therapist
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={() => {
                setShowRegisterDialog(false);
                navigate('/gate');
              }}
              className="w-full"
            >
              הרשמה / Register
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowRegisterDialog(false)}
              className="w-full"
            >
              סגור / Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
