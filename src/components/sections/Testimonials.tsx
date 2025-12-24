import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "New York, USA",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    text: "After years of chronic back pain, I finally found relief through acupuncture at Harmony TCM. The practitioners are incredibly skilled and caring. I've regained my quality of life.",
    rating: 5,
    treatment: "Acupuncture",
  },
  {
    name: "James Chen",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "The herbal formulas prescribed for my digestive issues worked wonders. It's been six months and I feel like a new person. The virtual consultations made it so convenient.",
    rating: 5,
    treatment: "Herbal Medicine",
  },
  {
    name: "Maria Garcia",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "I was skeptical at first, but the cupping therapy combined with acupuncture has completely transformed my stress levels. The team explains everything so well.",
    rating: 5,
    treatment: "Cupping & Acupuncture",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-gold-light text-gold text-sm font-medium rounded-full mb-4">
            Patient Stories
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Transforming Lives <span className="text-jade">Worldwide</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed">
            Hear from patients around the globe who have experienced the 
            healing power of Traditional Chinese Medicine.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-10 h-10 bg-jade rounded-full flex items-center justify-center">
                  <Quote className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-4">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                {/* Text */}
                <p className="font-body text-foreground leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Treatment Tag */}
                <span className="inline-block px-3 py-1 bg-jade-light text-jade text-xs font-medium rounded-full mb-6">
                  {testimonial.treatment}
                </span>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-display text-lg font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="font-body text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
