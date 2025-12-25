import { Award, Heart, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Every patient receives personalized attention and treatment plans tailored to their unique needs.",
  },
  {
    icon: Award,
    title: "Expert Practitioners",
    description: "Our team holds advanced certifications and decades of combined experience in Complementary Medicine.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Virtual consultations available worldwide, bringing ancient healing to your doorstep.",
  },
  {
    icon: Users,
    title: "Community Focus",
    description: "We believe in empowering our patients with knowledge and sustainable wellness practices.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-jade-light">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-jade/10 text-jade text-sm font-medium rounded-full mb-4">
              About Our Practice
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Bridging Ancient Wisdom
              <br />
              <span className="text-jade">& Modern Wellness</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-6">
              For over 35 years, Dr Roni Sapir has been a sanctuary for those seeking 
              natural, holistic healing. Founded on the principles of Traditional Chinese 
              Medicine and Complementary therapies, we integrate time-tested methods with 
              contemporary healthcare standards.
            </p>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              Our practitioners have trained with master acupuncturists across Asia and 
              bring a wealth of experience in treating chronic pain, stress disorders, 
              digestive issues, and more. We believe that true health is achieved when 
              body, mind, and spirit are in harmony.
            </p>
            <Button variant="jade" size="lg">
              Meet Our Practitioners
            </Button>
          </div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="bg-background rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-jade/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-jade" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
