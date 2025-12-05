import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { MENU_ITEMS } from "@/lib/constants";

const FeaturedDishes = () => {
  const { language, t } = useLanguage();
  const featuredItems = MENU_ITEMS.slice(0, 4);

  return (
    <section className="section-padding bg-secondary relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <Sparkles className="text-primary" size={18} />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </motion.div>
          
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6">
            {t("Our Signature", "Özel Seçkimiz")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t("Featured", "Öne Çıkan")}
            <span className="font-script text-primary ml-3">{t("Dishes", "Lezzetler")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {t(
              "Discover our chef's carefully curated selection of signature dishes",
              "Şefimizin özenle hazırladığı imza yemeklerini keşfedin"
            )}
          </p>
        </motion.div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="bg-card rounded-3xl overflow-hidden shadow-lg h-full"
                whileHover={{ 
                  y: -12, 
                  boxShadow: '0 25px 50px -12px hsl(var(--charcoal) / 0.25)',
                  transition: { duration: 0.3 } 
                }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={language === "en" ? item.name : item.nameTr}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Price Badge */}
                  <motion.div 
                    className="absolute top-4 right-4 bg-primary text-charcoal font-bold px-4 py-2 rounded-full shadow-glow"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    ₺{item.price}
                  </motion.div>
                  
                  {/* Tag */}
                  {item.tags.length > 0 && (
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs bg-cream/90 text-charcoal px-3 py-1 rounded-full font-medium">
                        {item.tags[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {language === "en" ? item.name : item.nameTr}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {language === "en" ? item.description : item.descriptionTr}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/menu">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="group border-2 border-foreground/20 hover:border-primary hover:bg-primary hover:text-charcoal px-8 py-6 text-base font-medium transition-all duration-300"
              >
                {t("View Full Menu", "Tüm Menüyü Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={18} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedDishes;