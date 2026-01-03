import { Facebook, Instagram, Youtube, Linkedin, Mail } from "lucide-react";
import { WhatsAppCTA } from "@/components/ui/WhatsAppCTA";
import { Disclaimer } from "./Disclaimer";
import ForceRefreshButton from "@/components/pwa/ForceRefreshButton";
import clinicLogo from "@/assets/clinic-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "Acupuncture", href: "#services" },
      { label: "Herbal Medicine", href: "#services" },
      { label: "Cupping Therapy", href: "#services" },
      { label: "Moxibustion", href: "#services" },
      { label: "Tui Na Massage", href: "#services" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Our Practitioners", href: "#about" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
    support: [
      { label: "Contact", href: "#contact" },
      { label: "FAQs", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Booking Policy", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <>
      {/* Disclaimer */}
      <Disclaimer />

      <footer className="bg-foreground text-primary-foreground pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded-full">
                  <img src={clinicLogo} alt="Clinic Logo" className="w-10 h-10 object-contain" />
                </div>
                <span className="font-display text-xl font-semibold">Dr Roni Sapir - Complementary Medicine</span>
              </a>
              <p className="font-body text-primary-foreground/70 leading-relaxed mb-6 max-w-sm">
                Bringing 5,000 years of Traditional Chinese Medicine wisdom to the modern world. Your journey to optimal
                health starts here.
              </p>

              {/* WhatsApp CTA */}
              <div className="mb-6">
                <WhatsAppCTA variant="button" phoneNumber="972544634923" message="שלום! אשמח לקבוע תור או לשמוע עוד על הטיפולים">
                  Chat with Us
                </WhatsAppCTA>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-jade transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-primary-foreground/70 hover:text-gold transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-primary-foreground/70 hover:text-gold transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="font-body text-primary-foreground/70 hover:text-gold transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Support */}
          <div className="border-t border-primary-foreground/10 pt-6 mb-6">
            <div className="flex flex-col items-center justify-center gap-2 text-primary-foreground/70">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="font-body text-sm">Technical Support: Contact via form above</span>
              </div>
              <div className="text-xs text-primary-foreground/60">
                Seeing old pages after publish? <ForceRefreshButton />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-primary-foreground/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-body text-sm text-primary-foreground/50">
                © {currentYear} Dr Roni Sapir - Complementary Medicine Clinic. All rights reserved.
              </p>
              <p className="font-body text-sm text-primary-foreground/50">Alternative & Complementary Wellness Practice</p>
            </div>
            <p className="font-body text-xs text-primary-foreground/40 text-center mt-4">
              This is a complementary/alternative wellness practice. Services are not medical care and are not a
              substitute for diagnosis or treatment by a licensed physician.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
