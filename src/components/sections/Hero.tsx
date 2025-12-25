import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-meridian-bg.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        <div className="max-w-3xl mx-auto text-center">
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
          <p className="font-body text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Experience the transformative power of Traditional Chinese Medicine. 
            Our certified practitioners combine 5,000 years of wisdom with 
            personalized care to help you achieve optimal health and vitality.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button variant="hero" size="xl" className="group">
              Book Your Session
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Explore Treatments
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 pt-8 border-t border-primary-foreground/20 grid grid-cols-3 gap-8 animate-fade-in-up delay-400">
            {[
              { value: "35+", label: "Years Experience" },
              { value: "10K+", label: "Patients Treated" },
              { value: "50+", label: "Countries Served" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-semibold text-gold mb-1">
                  {stat.value}
                </div>
                <div className="font-body text-sm text-primary-foreground/70 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
