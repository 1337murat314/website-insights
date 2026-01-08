import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedItem {
  id: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
  price: number;
  image_url: string | null;
  is_vegetarian: boolean | null;
  is_vegan: boolean | null;
  is_spicy: boolean | null;
}

const FeaturedDishes = () => {
  const { language, t } = useLanguage();
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_featured", true)
        .eq("is_available", true)
        .order("sort_order")
        .limit(4);
      
      setFeaturedItems(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  // Don't render section if no featured items and not loading
  if (!loading && featuredItems.length === 0) {
    return null;
  }

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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-3xl overflow-hidden border border-border/50">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="w-full md:w-2/5 h-64" />
                  <div className="flex-1 p-6 md:p-8 space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {t("No featured dishes available", "Öne çıkan yemek bulunamadı")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {featuredItems.map((item, index) => {
              // Build tags from dietary flags
              const tags: string[] = [];
              if (item.is_vegetarian) tags.push("vegetarian");
              if (item.is_vegan) tags.push("vegan");
              if (item.is_spicy) tags.push("spicy");

              return (
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
                          src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                          alt={language === "en" ? item.name : item.name_tr || item.name}
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
                          {tags.length > 0 && (
                            <div className="flex gap-2 mb-4 flex-wrap">
                              {tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-xs px-3 py-1 bg-secondary rounded-full text-muted-foreground capitalize">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                            {language === "en" ? item.name : item.name_tr || item.name}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-2">
                            {language === "en" ? item.description : item.description_tr || item.description}
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDishes;