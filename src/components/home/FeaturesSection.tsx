import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { FEATURES } from "@/lib/constants";
import { 
  Users, Leaf, Coffee, PartyPopper, Wifi, Car, 
  Baby, Crown, TreePine, Wine, Utensils, Salad,
  LucideIcon
} from "lucide-react";

const iconMap: Record<number, LucideIcon> = {
  1: Users,
  2: Leaf,
  3: Coffee,
  4: PartyPopper,
  5: Wifi,
  6: Car,
  7: Baby,
  8: Crown,
  9: TreePine,
  10: Wine,
  11: Utensils,
  12: Salad,
};

const FeaturesSection = () => {
  const { language, t } = useLanguage();
  const displayFeatures = FEATURES.slice(0, 6);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge-primary mb-6 inline-block">
            {t("Why Choose Us", "Neden Biz")}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
            {t("Experience the", "Farkı")}
            <br />
            <span className="font-serif italic font-normal text-primary">
              {t("difference", "hissedin")}
            </span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFeatures.map((feature, index) => {
            const Icon = iconMap[feature.id] || Users;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className="group p-8 rounded-3xl bg-card border border-border/50 h-full transition-all duration-500 hover:border-primary/30"
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="text-primary" size={26} />
                  </motion.div>
                  
                  <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {language === "en" ? feature.titleEn : feature.titleTr}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {language === "en" ? feature.descEn : feature.descTr}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;