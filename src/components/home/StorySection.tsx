import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import waiterImage from "@/assets/gallery/waiter-serving.jpg";

const StorySection = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/50 to-transparent" />

      <div className="container mx-auto container-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative z-10">
              <motion.img
                src={waiterImage}
                alt="Califorian service"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/30 rounded-2xl -z-10" />

            {/* Stats Card */}
            <motion.div
              className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="font-serif text-4xl font-bold text-primary">23+</p>
              <p className="text-muted-foreground text-sm">
                {t("Years of Excellence", "Yıllık Mükemmellik")}
              </p>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-medium tracking-widest uppercase text-sm">
              {t("Our Story", "Hikayemiz")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {t(
                "A Journey from Mehmet Akif Street to the Future",
                "Mehmet Akif Caddesi'nden Geleceğe"
              )}
            </h2>
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

            <div className="flex flex-wrap gap-8 pt-4">
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
                  <p className="font-serif text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <Link to="/about">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block mt-4">
                <Button size="lg" className="bg-primary hover:bg-accent text-primary-foreground group">
                  {t("Learn More", "Daha Fazla")}
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