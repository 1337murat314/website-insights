import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES, NAV_LINKS } from "@/lib/constants";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-charcoal text-cream">
      <div className="container mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Califorian Restaurant" className="h-16 w-auto" />
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed">
              {t(
                "23 years of culinary excellence, bringing Mediterranean flavors to your table with passion and dedication.",
                "23 yıllık mutfak mükemmelliği, Akdeniz lezzetlerini tutku ve özveri ile sofranıza taşıyoruz."
              )}
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">
              {t("Quick Links", "Hızlı Bağlantılar")}
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-cream/70 hover:text-primary transition-colors text-sm"
                  >
                    {language === "en" ? link.labelEn : link.labelTr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">
              {t("Contact", "İletişim")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-cream/70">
                <Phone size={16} className="mt-0.5 text-primary" />
                <span>{BRANCHES[0].phone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-cream/70">
                <Mail size={16} className="mt-0.5 text-primary" />
                <span>info@califorian.com</span>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">
              {t("Our Locations", "Şubelerimiz")}
            </h4>
            <ul className="space-y-3">
              {BRANCHES.map((branch) => (
                <li key={branch.id} className="flex items-start gap-3 text-sm text-cream/70">
                  <MapPin size={16} className="mt-0.5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-cream">{branch.name}</p>
                    <p className="text-xs">{branch.hours}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © {new Date().getFullYear()} Califorian Restaurant. {t("All rights reserved.", "Tüm hakları saklıdır.")}
          </p>
          <div className="flex gap-6 text-sm text-cream/50">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              {t("Privacy Policy", "Gizlilik Politikası")}
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              {t("Terms of Service", "Kullanım Şartları")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;