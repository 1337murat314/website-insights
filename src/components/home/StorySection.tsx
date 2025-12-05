import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
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

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={sectionRef} className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto container-padding relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Side with Parallax */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div className="relative z-10" style={{ y: imageY }}>
              <div className="relative overflow-hidden rounded-3xl">
                <motion.img
                  src={waiterImage}
                  alt="Califorian service"
                  className="w-full h-[550px] object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent" />
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-primary/15 rounded-3xl -z-10" />
            <div className="absolute -top-8 -left-8 w-40 h-40 border-2 border-primary/20 rounded-3xl -z-10" />
            
            {/* Floating Badge */}
            <motion.div
              className="absolute top-8 right-8 bg-primary text-charcoal rounded-full px-5 py-2 shadow-glow"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="font-medium text-sm">Since 2001</span>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              className="absolute bottom-10 left-10 glass-effect rounded-2xl p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="font-script text-5xl text-primary">23+</p>
              <p className="text-muted-foreground text-sm mt-1">
                {t("Years of Excellence", "Yıllık Mükemmellik")}
              </p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" size={18} />
              <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm">
                {t("Our Story", "Hikayemiz")}
              </p>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1]">
              {t("A Journey from", "Mehmet Akif")}
              <span className="font-script text-primary block mt-2">
                {t("Mehmet Akif Street", "Caddesi'nden")}
              </span>
            </h2>
            
            <div className="divider-ornament">
              <span className="text-primary">✦</span>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t(
                "We started serving 23 years ago on Mehmet Akif Street, one of the most popular areas of Lefkoşa. During this time, we have continuously expanded our customer portfolio with our quality service and reliable products.",
                "Lefkoşa'nın gözde bölgelerinden biri olan Mehmet Akif Caddesi'nde, tam 23 yıl önce hizmet vermeye başladık. Bu süre zarfında, kaliteli hizmet anlayışımız ve güvenilir ürünlerimizle müşteri portföyümüzü sürekli olarak genişlettik."
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "With our vision of being the address of quality and trust, we opened our Gazimağusa and Esentepe branches over the years. Through our catering services, we are now reaching thousands of people daily.",
                "Kalite ve güvenin adresi olma vizyonumuzla devam ettiğimiz yıllar içerisinde Gazimağusa ve Esentepe şubelerini açtık. Catering hizmetleriyle binlerce kişiye günlük yemek sunarak daha geniş bir kitleye ulaşıyoruz."
              )}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-10 pt-6">
              {[
                { value: "3", label: t("Locations", "Şube") },
                { value: "1000+", label: t("Daily Catering", "Günlük Catering") },
                { value: "100K+", label: t("Happy Guests", "Mutlu Misafir") },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <p className="font-serif text-4xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/about">
              <motion.div 
                whileHover={{ scale: 1.03, x: 5 }} 
                whileTap={{ scale: 0.98 }} 
                className="inline-block mt-6"
              >
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-charcoal group px-8 py-6 text-base font-medium"
                >
                  {t("Learn More", "Daha Fazla")}
                  <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={18} />
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