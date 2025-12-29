import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/sections/Contact";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | TCM Clinic</title>
        <meta
          name="description"
          content="Contact Dr Roni Sapir's Traditional Chinese Medicine Clinic. Book appointments, ask questions, or get directions via WhatsApp."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
