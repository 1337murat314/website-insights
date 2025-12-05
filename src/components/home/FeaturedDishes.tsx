import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { MENU_ITEMS } from "@/lib/constants";

const FeaturedDishes = () => {
  const { language, t } = useLanguage();
  const featuredItems = MENU_ITEMS.slice(0, 4);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
      
      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge-primary mb-6 inline-block">
              {t("Our Signature", "Özel Seçkimiz")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              {t("Handcrafted", "El Yapımı")}
              <br />
              <span className="font-serif italic font-normal text-primary">
                {t("with passion", "tutku ile")}
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/menu">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground px-8 py-6 rounded-full group transition-all duration-300"
              >
                {t("View Full Menu", "Tüm Menüyü Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featuredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <motion.div
                className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 h-full"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image */}
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <motion.img
                      src={item.image}
                      alt={language === "en" ? item.name : item.nameTr}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/50 md:block hidden" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {item.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-xs px-3 py-1 bg-secondary rounded-full text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                        {language === "en" ? item.name : item.nameTr}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">
                        {language === "en" ? item.description : item.descriptionTr}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                      <span className="text-2xl font-display font-bold text-primary">
                        ₺{item.price}
                      </span>
                      <motion.div
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ArrowUpRight size={18} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDishes;