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
  const { language } = useLanguage();
  const displayFeatures = FEATURES.slice(0, 6);

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto container-padding">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {language === "en" ? "Why Choose Us" : "Neden Biz"}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {language === "en" ? "Our Difference" : "Farkımız"}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayFeatures.map((feature, index) => {
            const Icon = iconMap[feature.id] || Users;
            return (
              <motion.div
                key={feature.id}
                className="bg-card rounded-2xl p-6 border border-border/50 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="text-primary" size={24} />
                </motion.div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {language === "en" ? feature.titleEn : feature.titleTr}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === "en" ? feature.descEn : feature.descTr}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;