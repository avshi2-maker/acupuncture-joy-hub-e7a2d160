import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-meridian-bg.png";

const Index = () => {
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
        className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-jade/30" />

        {/* Text container with glass effect */}
        <section className="relative z-10 w-full max-w-2xl text-center">
          <div className="bg-background/80 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-elevated border border-jade/20">
            <p className="text-lg md:text-xl font-display text-foreground">Dr Roni Sapir</p>
            <p className="text-sm md:text-base text-muted-foreground">
              Complementary Medicine - Acupuncture Clinic
            </p>
            <p className="text-xs text-muted-foreground/70 italic mb-6">
              Healing Through Balance with AI
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground">
              Restore Balance.
            </h1>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight text-gold mt-2">
              Renew Life.
            </h2>

            <p className="mt-6 text-muted-foreground text-base md:text-lg leading-relaxed">
              Experience the transformative power of Traditional Chinese Medicine. 
              Our certified practitioners combine 5,000 years of wisdom with personalized care 
              to help you achieve optimal health and vitality.
            </p>

            <div className="mt-8">
              <Button asChild size="lg" variant="hero">
                <Link to="/gate">Therapist Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;

