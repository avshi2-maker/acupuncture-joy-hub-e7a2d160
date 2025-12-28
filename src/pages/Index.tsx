import { Helmet } from "react-helmet-async";
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
