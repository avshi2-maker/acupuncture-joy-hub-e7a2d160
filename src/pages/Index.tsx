import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import TherapistTeaser from "@/components/sections/TherapistTeaser";
import Footer from "@/components/layout/Footer";
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

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <TherapistTeaser />
        </main>
        <Footer />
        <FloatingWhatsApp phoneNumber="972544634923" />
      </div>
    </>
  );
};

export default Index;
