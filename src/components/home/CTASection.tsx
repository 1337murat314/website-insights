import { Link } from "react-router-dom";
import { Calendar, Phone, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { RESTAURANT_PHONE } from "@/lib/constants";
import tableSettingImage from "@/assets/gallery/table-setting.jpg";

const CTASection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={tableSettingImage}
          alt="Dining experience"
          className="w-full h-[120%] object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/85 to-charcoal/95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full" />
      <div className="absolute bottom-10 right-10 w-48 h-48 border border-primary/10 rounded-full" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto container-padding relative">
        <motion.div
          className="max-w-4xl mx-auto text-center text-cream"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Header */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
            <Sparkles className="text-primary" size={24} />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
            {t("Ready for an", "Unutulmaz bir")}
            <br />
            <span className="font-script text-primary">{t("Unforgettable", "Deneyime")}</span>
            <br />
            <span className="text-cream/90">{t("Experience?", "Hazır mısınız?")}</span>
          </h2>
          
          <div className="divider-ornament max-w-xs mx-auto my-8">
            <span className="text-primary">✦</span>
          </div>
          
          <p className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            {t(
              "We would be delighted to host you at Califorian, where taste, sincerity and pleasure meet.",
              "Sizleri lezzetin, samimiyetin ve keyfin buluştuğu Califorian'da ağırlamaktan mutluluk duyacağız."
            )}
          </p>
          <p className="text-cream/60 text-base mb-12">
            {t(
              "Reserve your place now for unforgettable moments!",
              "Unutulmaz anlar için yerinizi şimdiden ayırtın!"
            )}
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/reservations">
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-40 group-hover:opacity-70 transition-opacity" />
                <Button
                  size="lg"
                  className="relative bg-primary hover:bg-primary/90 text-charcoal font-semibold px-10 py-7 text-lg w-full sm:w-auto shadow-glow"
                >
                  <Calendar className="mr-3" size={22} />
                  {t("Make a Reservation", "Rezervasyon Yap")}
                </Button>
              </motion.div>
            </Link>
            <a href={`tel:${RESTAURANT_PHONE}`}>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-cream/10 border-2 border-cream/80 text-cream hover:bg-cream hover:text-charcoal font-semibold px-10 py-7 text-lg w-full sm:w-auto backdrop-blur-sm transition-all duration-300"
                >
                  <Phone className="mr-3" size={22} />
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