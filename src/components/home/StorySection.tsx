import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import waiterImage from "@/assets/gallery/waiter-serving.jpg";

const StorySection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={sectionRef} className="section-padding bg-card relative overflow-hidden">
      <div className="container mx-auto container-padding">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Side */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Main Image */}
              <motion.div 
                className="relative rounded-3xl overflow-hidden"
                style={{ y: imageY }}
              >
                <img
                  src={waiterImage}
                  alt="Califorian service"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </motion.div>
              
              {/* Floating Card */}
              <motion.div
                className="absolute -bottom-6 -right-6 lg:bottom-10 lg:-right-10 glass-card p-6 md:p-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-5xl md:text-6xl font-display font-bold text-primary">23+</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {t("Years of Excellence", "Yıllık Mükemmellik")}
                </p>
              </motion.div>

              {/* Decorative Element */}
              <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-primary/20 rounded-3xl -z-10" />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge-primary">
              {t("Our Story", "Hikayemiz")}
            </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              {t("A Legacy of", "Lezzetin")}
              <br />
              <span className="font-serif italic font-normal text-primary">
                {t("Taste & Trust", "Mirası")}
              </span>
            </h2>
            
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                {t(
                  "We started serving 23 years ago on Mehmet Akif Street, one of the most popular areas of Lefkoşa. During this time, we have continuously expanded our customer portfolio with our quality service and reliable products.",
                  "Lefkoşa'nın gözde bölgelerinden biri olan Mehmet Akif Caddesi'nde, tam 23 yıl önce hizmet vermeye başladık. Bu süre zarfında, kaliteli hizmet anlayışımız ve güvenilir ürünlerimizle müşteri portföyümüzü sürekli olarak genişlettik."
                )}
              </p>
              <p>
                {t(
                  "With our vision of being the address of quality and trust, we opened our Gazimağusa and Esentepe branches over the years.",
                  "Kalite ve güvenin adresi olma vizyonumuzla devam ettiğimiz yıllar içerisinde Gazimağusa ve Esentepe şubelerini açtık."
                )}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-8 border-y border-border/50">
              {[
                { value: "3", label: t("Locations", "Şube") },
                { value: "1000+", label: t("Daily Catering", "Günlük Catering") },
                { value: "100K+", label: t("Happy Guests", "Mutlu Misafir") },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                >
                  <p className="text-3xl md:text-4xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/about">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group px-8 py-7 rounded-full font-semibold"
                >
                  {t("Learn Our Story", "Hikayemizi Öğrenin")}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;