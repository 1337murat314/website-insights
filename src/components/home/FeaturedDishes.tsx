import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { MENU_ITEMS } from "@/lib/constants";

const FeaturedDishes = () => {
  const { language, t } = useLanguage();
  const featuredItems = MENU_ITEMS.slice(0, 4);

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Our Signature", "Özel Seçkimiz")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("Featured Dishes", "Öne Çıkan Lezzetler")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "Discover our chef's carefully curated selection of signature dishes",
              "Şefimizin özenle hazırladığı imza yemeklerini keşfedin"
            )}
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="group bg-card rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={item.image}
                  alt={language === "en" ? item.name : item.nameTr}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {language === "en" ? item.name : item.nameTr}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {language === "en" ? item.description : item.descriptionTr}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">₺{item.price}</span>
                  {item.tags.length > 0 && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      {item.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/menu">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="lg" className="group">
                {t("View Full Menu", "Tüm Menüyü Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDishes;