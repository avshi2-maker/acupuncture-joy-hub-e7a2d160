import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import treatmentAcupuncture from "@/assets/treatment-acupuncture.jpg";
import treatmentHerbs from "@/assets/treatment-herbs.jpg";
import treatmentCupping from "@/assets/treatment-cupping.jpg";

const services = [
  {
    title: "Acupuncture",
    description:
      "Precise needle placement along meridian pathways to restore energy flow, relieve pain, and promote natural healing throughout the body.",
    image: treatmentAcupuncture,
    features: ["Pain Relief", "Stress Reduction", "Improved Sleep"],
    duration: "60-90 min",
    price: "From $120",
  },
  {
    title: "Herbal Medicine",
    description:
      "Customized herbal formulas based on traditional recipes, tailored to your unique constitution and health concerns.",
    image: treatmentHerbs,
    features: ["Digestive Health", "Immune Support", "Hormonal Balance"],
    duration: "Consultation",
    price: "From $80",
  },
  {
    title: "Cupping Therapy",
    description:
      "Ancient technique using gentle suction to improve circulation, release muscle tension, and accelerate healing.",
    image: treatmentCupping,
    features: ["Muscle Recovery", "Detoxification", "Pain Management"],
    duration: "30-45 min",
    price: "From $75",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-jade-light text-jade text-sm font-medium rounded-full mb-4">
            Our Treatments
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Holistic Healing Services
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed">
            Each treatment is personalized to address your unique health needs, 
            combining ancient techniques with modern understanding.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="font-display text-2xl font-semibold text-primary-foreground">
                    {service.title}
                  </h3>
                  <span className="px-3 py-1 bg-gold text-foreground text-sm font-medium rounded-full">
                    {service.price}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="font-body text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-jade-light text-jade text-xs font-medium rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    ⏱ {service.duration}
                  </span>
                  <Button variant="ghost" size="sm" className="group/btn text-jade hover:text-jade">
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Services
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
