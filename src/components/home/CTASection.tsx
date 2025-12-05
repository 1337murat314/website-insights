import { Link } from "react-router-dom";
import { Calendar, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { RESTAURANT_PHONE } from "@/lib/constants";
import tableSettingImage from "@/assets/gallery/table-setting.jpg";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={tableSettingImage}
          alt="Dining experience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 to-charcoal/95" />
      </div>

      <div className="container mx-auto container-padding relative">
        <motion.div
          className="max-w-3xl mx-auto text-center text-cream"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t("Ready for an", "Unutulmaz bir")}
            <br />
            <span className="text-primary">{t("Unforgettable Experience?", "Deneyime Hazır mısınız?")}</span>
          </h2>
          <p className="text-cream/80 text-lg mb-4">
            {t(
              "We would be delighted to host you at Califorian, where taste, sincerity and pleasure meet.",
              "Sizleri lezzetin, samimiyetin ve keyfin buluştuğu Califorian'da ağırlamaktan mutluluk duyacağız."
            )}
          </p>
          <p className="text-cream/70 text-base mb-10">
            {t(
              "Reserve your place now for unforgettable moments!",
              "Unutulmaz anlar için yerinizi şimdiden ayırtın!"
            )}
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/reservations">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-8 py-6 text-lg w-full sm:w-auto"
                >
                  <Calendar className="mr-2" size={20} />
                  {t("Make a Reservation", "Rezervasyon Yap")}
                </Button>
              </motion.div>
            </Link>
            <a href={`tel:${RESTAURANT_PHONE}`}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-cream/10 border-2 border-cream text-cream hover:bg-cream hover:text-charcoal font-semibold px-8 py-6 text-lg w-full sm:w-auto backdrop-blur-sm transition-all"
                >
                  <Phone className="mr-2" size={20} />
                  392 444 7070
                </Button>
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;