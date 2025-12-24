import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingCTA = () => {
  return (
    <section className="py-24 bg-jade relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-jade-dark/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary-foreground mb-6">
            Begin Your Healing Journey Today
          </h2>
          <p className="font-body text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-10">
            Whether you're seeking relief from chronic conditions or looking to 
            enhance your overall wellness, our expert practitioners are here to guide you.
          </p>

          {/* Booking Options */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
              <div className="w-14 h-14 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">
                In-Person Session
              </h3>
              <p className="font-body text-primary-foreground/80 text-sm mb-4">
                Visit our clinic for a comprehensive treatment experience
              </p>
              <div className="flex items-center justify-center gap-2 text-primary-foreground/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Available Mon-Sat</span>
              </div>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
              <div className="w-14 h-14 bg-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary-foreground mb-2">
                Virtual Consultation
              </h3>
              <p className="font-body text-primary-foreground/80 text-sm mb-4">
                Connect with our practitioners from anywhere in the world
              </p>
              <div className="flex items-center justify-center gap-2 text-primary-foreground/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Flexible scheduling</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              <Calendar className="w-5 h-5" />
              Schedule Appointment
            </Button>
            <Button variant="heroOutline" size="xl">
              Call: +1 (888) 555-HEAL
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <p className="text-primary-foreground/70 text-sm mb-4">
              Trusted by leading healthcare organizations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
              <span className="font-display text-primary-foreground text-lg">NCCAOM</span>
              <span className="font-display text-primary-foreground text-lg">WHO</span>
              <span className="font-display text-primary-foreground text-lg">AAAOM</span>
              <span className="font-display text-primary-foreground text-lg">ABORM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingCTA;
