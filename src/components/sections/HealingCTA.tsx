import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HealingCTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-jade via-jade-dark to-jade-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-gold/15 rounded-full blur-3xl animate-pulse-soft delay-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in">
            <Heart className="w-4 h-4 text-gold" />
            <span className="text-primary-foreground/90 text-sm font-medium">Start Your Healing Journey</span>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>

          {/* Heading */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-6 animate-fade-in delay-100">
            Ready to Restore <span className="text-gold">Your Balance?</span>
          </h2>

          {/* Description */}
          <p className="font-body text-lg md:text-xl text-primary-foreground/80 mb-10 leading-relaxed animate-fade-in delay-200">
            Take the first step towards optimal health and vitality. 
            Contact us to schedule your personalized consultation with Dr. Roni Sapir.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in delay-300">
            <Button 
              asChild 
              size="lg" 
              className="bg-gold hover:bg-gold-dark text-primary-foreground text-lg px-10 py-7 shadow-xl shadow-gold/30 hover:shadow-gold/50 transition-all duration-300 hover:scale-105"
            >
              <Link to="/contact" className="gap-3">
                Get In Touch
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-primary-foreground/60 text-sm animate-fade-in delay-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <span>WhatsApp Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <span>Fast Response</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full" />
              <span>Personal Consultation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealingCTA;
