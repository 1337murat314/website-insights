import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES, NAV_LINKS, RESTAURANT_PHONE } from "@/lib/constants";
import logoLight from "@/assets/logo-light.png";

const Footer = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto container-padding py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/">
              <img src={logoLight} alt="Califorian" className="h-12 w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                "23 years as the address of quality and trust. Serving healthy and delicious food with passion.",
                "23 yıldır kalite ve güvenin adresi. Tutku ile sağlıklı ve lezzetli yemekler sunuyoruz."
              )}
            </p>
            <div className="flex gap-3">
              <motion.a
                href="https://instagram.com/califorianrestaurant"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href="https://facebook.com/califorianrestaurant"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Facebook size={18} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              {t("Quick Links", "Hızlı Bağlantılar")}
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {language === "en" ? link.labelEn : link.labelTr}
                    <ArrowUpRight className="ml-1 w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              {t("Contact", "İletişim")}
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={`tel:${RESTAURANT_PHONE}`} 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone size={14} className="text-primary" />
                  </div>
                  392 444 7070
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@califorianrestaurant.com" 
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail size={14} className="text-primary" />
                  </div>
                  info@califorianrestaurant.com
                </a>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              {t("Locations", "Şubelerimiz")}
            </h4>
            <ul className="space-y-4">
              {BRANCHES.map((branch) => (
                <li key={branch.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.hours}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Califorian. {t("All rights reserved.", "Tüm hakları saklıdır.")}
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              {t("Privacy", "Gizlilik")}
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              {t("Terms", "Şartlar")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;