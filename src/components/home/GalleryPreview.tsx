import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import pannaCotta from "@/assets/gallery/panna-cotta.jpg";
import exteriorDomes from "@/assets/gallery/exterior-domes.jpg";
import cocktail from "@/assets/gallery/cocktail.jpg";
import waiterServing from "@/assets/gallery/waiter-serving.jpg";
import exteriorEvening from "@/assets/gallery/exterior-evening.jpg";
import tableSetting from "@/assets/gallery/table-setting.jpg";

const GalleryPreview = () => {
  const { t } = useLanguage();
  
  const previewImages = [
    { id: 1, src: exteriorDomes, alt: "Glass Domes", span: "md:col-span-2 md:row-span-2" },
    { id: 2, src: pannaCotta, alt: "Desserts", span: "" },
    { id: 3, src: cocktail, alt: "Cocktails", span: "" },
    { id: 4, src: waiterServing, alt: "Service", span: "md:col-span-2" },
    { id: 5, src: exteriorEvening, alt: "Ambiance", span: "" },
    { id: 6, src: tableSetting, alt: "Dining", span: "" },
  ];

  return (
    <section className="section-padding bg-secondary relative overflow-hidden">
      <div className="container mx-auto container-padding">
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
              {t("Gallery", "Galeri")}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              {t("Captured", "Yakalanan")}
              <br />
              <span className="font-serif italic font-normal text-primary">
                {t("moments", "anlar")}
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/gallery">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground px-8 py-6 rounded-full group transition-all duration-300"
              >
                {t("View All", "Tümünü Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group cursor-pointer ${image.span}`}
            >
              <motion.div
                className={`relative overflow-hidden rounded-2xl md:rounded-3xl ${
                  index === 0 ? "h-full min-h-[300px] md:min-h-[500px]" : 
                  index === 3 ? "h-48 md:h-64" : "h-48 md:h-56"
                }`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Hover Content */}
                <div className="absolute inset-0 flex items-end p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-foreground font-medium text-sm md:text-base">{image.alt}</span>
                    <motion.div
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <ArrowUpRight className="text-primary-foreground" size={18} />
                    </motion.div>
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

export default GalleryPreview;