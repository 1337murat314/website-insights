import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
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

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={ref} className="relative py-32 md:py-40 overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={tableSettingImage}
          alt="Dining experience"
          className="w-full h-[130%] object-cover"
        />
      </motion.div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 border border-primary/20 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/10 rounded-full opacity-50" />

      <div className="container mx-auto container-padding relative">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge-primary mb-8 inline-block">
            {t("Join Us", "Bize Katılın")}
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-foreground mb-8 leading-tight">
            {t("Ready for an", "Unutulmaz bir")}
            <br />
            <span className="font-serif italic font-normal text-primary">
              {t("unforgettable", "deneyime")}
            </span>
            <br />
            {t("experience?", "hazır mısınız?")}
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {t(
              "We would be delighted to host you at Califorian, where taste, sincerity and pleasure meet.",
              "Sizleri lezzetin, samimiyetin ve keyfin buluştuğu Califorian'da ağırlamaktan mutluluk duyacağız."
            )}
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/reservations">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 py-7 text-base rounded-full group w-full sm:w-auto"
                >
                  {t("Make a Reservation", "Rezervasyon Yap")}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            
            <a href={`tel:${RESTAURANT_PHONE}`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border hover:bg-secondary text-foreground font-semibold px-10 py-7 text-base rounded-full group w-full sm:w-auto"
                >
                  <Phone className="mr-2 w-5 h-5" />
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