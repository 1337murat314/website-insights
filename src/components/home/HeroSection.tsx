import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/gallery/exterior-domes.jpg";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          src={heroImage}
          alt="Califorian Restaurant"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto container-padding text-center text-cream">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Tagline */}
          <motion.p
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("Est. 2001 • 23 Years of Excellence", "2001'den beri • 23 Yıllık Mükemmellik")}
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("Experience", "Lezzetin")}
            <br />
            <span className="text-primary">{t("Culinary Art", "Zirvesinde")}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t(
              "Where quality and trust meet unforgettable flavors. We serve healthy and delicious food with passion.",
              "Kalite ve güvenin unutulmaz lezzetlerle buluştuğu yer. Sağlıklı ve lezzetli yemekleri tutkuyla sunuyoruz."
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link to="/reservations">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-charcoal font-semibold px-8 py-6 text-lg shadow-lg"
                >
                  {t("Reserve Your Table", "Masanızı Ayırtın")}
                </Button>
              </motion.div>
            </Link>
            <Link to="/menu">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-cream/10 border-2 border-cream text-cream hover:bg-cream hover:text-charcoal font-semibold px-8 py-6 text-lg backdrop-blur-sm transition-all"
                >
                  {t("Explore Menu", "Menüyü Keşfedin")}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="text-cream/50" size={32} />
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;