import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import TherapistTeaser from "@/components/sections/TherapistTeaser";
import TcmBrainPreview from "@/components/sections/TcmBrainPreview";
import EnglishQASection from "@/components/sections/EnglishQASection";
import BodyFiguresGallery from "@/components/sections/BodyFiguresGallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TCM Clinic | Traditional Chinese Medicine</title>
        <meta
          name="description"
          content="Traditional Chinese Medicine Clinic - Acupuncture, Herbal Medicine and Holistic Treatments"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Prominent CM Brain CTA */}
          <section className="py-8 bg-gradient-to-r from-jade/10 to-gold/10 border-b border-jade/20">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <Button asChild size="lg" className="gap-3 bg-jade hover:bg-jade-dark text-white shadow-lg hover:shadow-xl transition-all">
                <Link to="/tcm-brain">
                  <Brain className="h-6 w-6" />
                  <span className="text-lg font-semibold">Open CM Brain</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <p className="text-muted-foreground mt-3 text-sm">150 Q&A • Body Figures • AI Assistant</p>
            </div>
          </section>
          
          <Hero />
          <TherapistTeaser />
          <BodyFiguresGallery />
          <EnglishQASection />
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
