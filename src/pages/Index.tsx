import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import TcmBrainPreview from "@/components/sections/TcmBrainPreview";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>TCM Clinic | רפואה סינית מסורתית</title>
        <meta
          name="description"
          content="מרפאת רפואה סינית מסורתית - דיקור, צמחי מרפא וטיפולים הוליסטיים"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          
          {/* Encyclopedia CTA Section */}
          <section className="py-16 bg-gradient-to-b from-background to-muted/30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
                <BookOpen className="h-5 w-5 text-gold" />
                <span className="text-gold font-medium">CM Digital Encyclopedia</span>
                <Sparkles className="h-4 w-4 text-jade" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl mb-4 bg-gradient-to-r from-gold via-jade to-jade-light bg-clip-text text-transparent">
                גישה לאנציקלופדיה הדיגיטלית
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                30 שנות ידע ברפואה סינית מסורתית - מאגר מידע מקיף עם AI מתקדם
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/encyclopedia')}
                className="bg-gradient-to-r from-gold to-gold-dark hover:opacity-90 text-primary-foreground text-lg px-8 py-6"
              >
                <BookOpen className="ml-2 h-5 w-5" />
                לאנציקלופדיה הדיגיטלית
              </Button>
            </div>
          </section>

          <TcmBrainPreview />
          <Contact />
        </main>
        <Footer />
        <InstallBanner />
        <FloatingWhatsApp phoneNumber="972544634923" />
      </div>
    </>
  );
};

export default Index;
