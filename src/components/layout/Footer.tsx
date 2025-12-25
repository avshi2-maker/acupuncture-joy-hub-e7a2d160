import { Leaf, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { forwardRef } from "react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
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
    <footer ref={ref} className="bg-foreground text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-jade rounded-full">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold">Harmony TCM</span>
            </a>
            <p className="font-body text-primary-foreground/70 leading-relaxed mb-6 max-w-sm">
              Bringing 5,000 years of Traditional Chinese Medicine wisdom to 
              the modern world. Your journey to optimal health starts here.
            </p>
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
                  <a
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-gold transition-colors"
                  >
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
                  <a
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-gold transition-colors"
                  >
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
                  <a
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-sm text-primary-foreground/50">
              © {currentYear} Harmony TCM Clinic. All rights reserved.
            </p>
            <p className="font-body text-sm text-primary-foreground/50">
              Licensed Acupuncture & Traditional Chinese Medicine Practice
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
