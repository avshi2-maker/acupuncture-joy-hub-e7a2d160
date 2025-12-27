import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import TcmBrainPreview from "@/components/sections/TcmBrainPreview";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

const Index = () => {
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
