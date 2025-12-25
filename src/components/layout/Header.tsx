import { useState, useEffect } from "react";
import { Menu, X, Leaf, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#tcm-brain-preview", label: t("cmBrain") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className={`p-2 rounded-full transition-all duration-300 ${isScrolled || !isHomePage ? 'bg-jade/10' : 'bg-primary-foreground/10'}`}>
            <Leaf className={`w-6 h-6 transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-jade' : 'text-primary-foreground'}`} />
          </div>
          <span className={`font-display text-lg md:text-xl font-semibold tracking-wide transition-colors duration-300 ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'} hidden sm:inline`}>
            Dr Roni Sapir - Complementary Medicine
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {isHomePage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`font-body text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-80 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full ${
                isScrolled 
                  ? 'text-foreground after:bg-jade' 
                  : 'text-primary-foreground after:bg-primary-foreground'
              }`}
            >
              {link.label}
            </a>
          ))}
          
          {/* Dashboard Button */}
          <Button asChild variant={isScrolled || !isHomePage ? "outline" : "secondary"} size="sm" className="gap-2">
            <Link to="/crm">
              <LayoutDashboard className="w-4 h-4" />
              {t("dashboard")}
            </Link>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          
          <Button asChild variant={isScrolled || !isHomePage ? "outline" : "secondary"} size="sm">
            <Link to="/therapist-register">{t("therapistRegister")}</Link>
          </Button>
          <Button variant={isScrolled || !isHomePage ? "hero" : "heroOutline"} size="lg">
            {t("bookSession")}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher isScrolled={isScrolled || !isHomePage} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 transition-colors ${isScrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg shadow-elevated transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
          {/* Dashboard Link - Always visible */}
          <Link
            to="/crm"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-body text-lg font-medium text-jade hover:text-jade/80 transition-colors py-2 flex items-center gap-2"
          >
            <LayoutDashboard className="w-5 h-5" />
            {t("dashboard")}
          </Link>
          
          {isHomePage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-body text-lg font-medium text-foreground hover:text-jade transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <Button asChild variant="outline" className="w-full">
            <Link to="/therapist-register" onClick={() => setIsMobileMenuOpen(false)}>
              {t("therapistRegister")}
            </Link>
          </Button>
          <Button variant="hero" size="lg" className="mt-2">
            {t("bookSession")}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
