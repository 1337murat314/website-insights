import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { NAV_LINKS } from "@/lib/constants";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Califorian Restaurant"
              className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden md:block font-serif text-xl font-semibold text-foreground">
              Califorian
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative font-medium text-sm tracking-wide transition-colors duration-300 hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80"
                }`}
              >
                {language === "en" ? link.labelEn : link.labelTr}
                {location.pathname === link.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              <span className={language === "en" ? "text-primary" : ""}>EN</span>
              <span>/</span>
              <span className={language === "tr" ? "text-primary" : ""}>TR</span>
            </button>

            {/* Reserve Button - Desktop */}
            <Link to="/reservations" className="hidden md:block">
              <Button className="bg-primary hover:bg-accent text-primary-foreground font-medium px-6">
                {t("Reserve", "Rezervasyon")}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border animate-fade-up">
          <div className="container mx-auto container-padding py-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {language === "en" ? link.labelEn : link.labelTr}
              </Link>
            ))}
            <Link to="/reservations" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-primary hover:bg-accent text-primary-foreground font-medium mt-4">
                {t("Reserve a Table", "Masa Ayırt")}
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;