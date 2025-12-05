import { Link } from "react-router-dom";
import { ArrowRight, Maximize2 } from "lucide-react";
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
    { id: 1, src: exteriorDomes, alt: "Califorian exterior with glass domes", span: "col-span-2 row-span-2" },
    { id: 2, src: pannaCotta, alt: "Panna Cotta dessert", span: "" },
    { id: 3, src: cocktail, alt: "Signature cocktail", span: "" },
    { id: 4, src: waiterServing, alt: "Waiter serving food", span: "col-span-2" },
    { id: 5, src: exteriorEvening, alt: "Evening ambiance", span: "" },
    { id: 6, src: tableSetting, alt: "Elegant table setting", span: "" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  return (
    <section className="section-padding bg-secondary relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto container-padding relative">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p 
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t("Gallery", "Galeri")}
          </motion.p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {t("Captured", "Yakalanan")}
            <span className="font-script text-primary ml-3">{t("Moments", "Anlar")}</span>
          </h2>
          <div className="divider-ornament my-6">
            <span className="text-primary">✦</span>
          </div>
          <p className="text-muted-foreground text-lg">
            {t(
              "A glimpse into the Califorian experience",
              "Califorian deneyiminden bir kesit"
            )}
          </p>
        </motion.div>

        {/* Gallery Grid - Masonry Style */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${image.span}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`relative overflow-hidden ${
                index === 0 ? "h-full min-h-[350px] md:min-h-[500px]" : 
                index === 3 ? "h-48 md:h-64" : "h-48 md:h-56"
              }`}>
                <motion.img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Hover Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileHover={{ scale: 1.1 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-glow"
                  >
                    <Maximize2 className="text-charcoal" size={24} />
                  </motion.div>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-cream font-medium text-sm">{image.alt}</p>
                </div>
              </div>
              
              {/* Border glow effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/gallery">
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
                {t("View Full Gallery", "Tüm Galeriyi Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" size={18} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryPreview;