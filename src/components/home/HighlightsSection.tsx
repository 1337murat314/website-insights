import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Truck, Star, Gift, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const highlights = [
  {
    icon: Star,
    titleEn: "Daily Specials",
    titleTr: "Günün Özel Menüsü",
    descEn: "Fresh dishes prepared daily by our chefs",
    descTr: "Şeflerimiz tarafından her gün hazırlanan taze yemekler",
    href: "/menu",
  },
  {
    icon: Calendar,
    titleEn: "Private Events",
    titleTr: "Özel Etkinlikler",
    descEn: "Host your special occasions with us",
    descTr: "Özel günlerinizi bizimle kutlayın",
    href: "/contact",
  },
  {
    icon: Truck,
    titleEn: "Catering Services",
    titleTr: "Catering Hizmetleri",
    descEn: "Quality food for your corporate events",
    descTr: "Kurumsal etkinlikleriniz için kaliteli yemekler",
    href: "/contact",
  },
  {
    icon: Gift,
    titleEn: "Gift Cards",
    titleTr: "Hediye Kartları",
    descEn: "The perfect gift for food lovers",
    descTr: "Yemek severler için mükemmel hediye",
    href: "/contact",
  },
];

const HighlightsSection = () => {
  const { language, t } = useLanguage();

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
          >
            {t("What We Offer", "Sunduklarımız")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            {t("More Than Just a Restaurant", "Bir Restorandan Fazlası")}
          </motion.h2>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                className="group block h-full p-6 bg-card rounded-2xl hover:bg-card/80 transition-colors border border-border hover:border-primary/50"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {language === "en" ? item.titleEn : item.titleTr}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {language === "en" ? item.descEn : item.descTr}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  {t("Learn More", "Daha Fazla")}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
