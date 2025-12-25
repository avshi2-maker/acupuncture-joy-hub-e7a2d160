import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import TcmBrainPreview from "@/components/sections/TcmBrainPreview";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import BookingCTA from "@/components/sections/BookingCTA";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import InstallBanner from "@/components/pwa/InstallBanner";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Harmony TCM Clinic | Traditional Chinese Medicine & Acupuncture</title>
        <meta
          name="description"
          content="Experience holistic healing with Traditional Chinese Medicine. Acupuncture, herbal medicine, and cupping therapy from certified practitioners. Book your session today."
        />
        <meta
          name="keywords"
          content="TCM, Traditional Chinese Medicine, acupuncture, herbal medicine, cupping therapy, holistic healing, wellness clinic"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <TcmBrainPreview />
          <About />
          <Testimonials />
          <BookingCTA />
          <Contact />
        </main>
        <Footer />
        <InstallBanner />
      </div>
    </>
  );
};

export default Index;
