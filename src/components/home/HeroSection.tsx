import { Link } from "react-router-dom";
import { ArrowDown, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/gallery/exterior-domes.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <img
          src={heroImage}
          alt="Califorian Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal/80" />
      </motion.div>

      {/* Animated Particles/Sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 container mx-auto container-padding text-center text-cream"
        style={{ opacity }}
      >
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Decorative Element */}
          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <Sparkles className="text-primary" size={20} />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-primary font-medium tracking-[0.4em] uppercase text-sm md:text-base"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("Est. 2001 • 23 Years of Excellence", "2001'den beri • 23 Yıllık Mükemmellik")}
          </motion.p>

          {/* Main Heading with Script Font Accent */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tight">
              {t("Experience", "Lezzetin")}
            </h1>
            <span className="font-script text-4xl md:text-6xl lg:text-7xl text-primary block mt-2">
              {t("Culinary Art", "Zirvesinde")}
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-cream/80 max-w-2xl mx-auto leading-relaxed font-light"
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
            className="flex flex-col sm:flex-row gap-5 justify-center pt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link to="/reservations">
              <motion.div 
                whileHover={{ scale: 1.05, y: -2 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-40 group-hover:opacity-70 transition-opacity" />
                <Button
                  size="lg"
                  className="relative bg-primary hover:bg-primary/90 text-charcoal font-semibold px-10 py-7 text-lg shadow-glow"
                >
                  {t("Reserve Your Table", "Masanızı Ayırtın")}
                </Button>
              </motion.div>
            </Link>
            <Link to="/menu">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="bg-cream/10 border-2 border-cream/80 text-cream hover:bg-cream hover:text-charcoal font-semibold px-10 py-7 text-lg backdrop-blur-sm transition-all duration-300"
                >
                  {t("Explore Menu", "Menüyü Keşfedin")}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity }}
      >
        <span className="text-cream/50 text-xs uppercase tracking-widest">Scroll</span>
        <ArrowDown className="text-cream/50" size={24} />
      </motion.div>

      {/* Corner Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-primary/30" />
    </section>
  );
};

export default HeroSection;