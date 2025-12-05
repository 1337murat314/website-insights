import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import pannaCotta from "@/assets/gallery/panna-cotta.jpg";
import exteriorDomes from "@/assets/gallery/exterior-domes.jpg";
import cocktail from "@/assets/gallery/cocktail.jpg";
import waiterServing from "@/assets/gallery/waiter-serving.jpg";
import exteriorEvening from "@/assets/gallery/exterior-evening.jpg";
import tableSetting from "@/assets/gallery/table-setting.jpg";
import exteriorMain from "@/assets/gallery/exterior-main.jpg";

const Gallery = () => {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const GALLERY_IMAGES = [
    { id: 1, src: exteriorDomes, alt: "Restaurant exterior with glass domes", altTr: "Cam kubbeli dış mekan", category: "interior" },
    { id: 2, src: pannaCotta, alt: "Panna Cotta dessert", altTr: "Panna Cotta tatlısı", category: "food" },
    { id: 3, src: cocktail, alt: "Signature cocktail", altTr: "İmza kokteyli", category: "food" },
    { id: 4, src: waiterServing, alt: "Waiter serving fresh dishes", altTr: "Garson taze yemekler servis ediyor", category: "interior" },
    { id: 5, src: exteriorEvening, alt: "Evening ambiance at Califorian", altTr: "Califorian akşam atmosferi", category: "interior" },
    { id: 6, src: tableSetting, alt: "Elegant table setting for events", altTr: "Etkinlikler için zarif masa düzeni", category: "events" },
    { id: 7, src: exteriorMain, alt: "Califorian Restaurants main building", altTr: "Califorian Restaurants ana bina", category: "interior" },
  ];

  const filters = [
    { id: "all", labelEn: "All", labelTr: "Tümü" },
    { id: "interior", labelEn: "Interior & Exterior", labelTr: "İç & Dış Mekan" },
    { id: "food", labelEn: "Food & Drinks", labelTr: "Yemek & İçecek" },
    { id: "events", labelEn: "Events", labelTr: "Etkinlikler" },
  ];

  const filteredImages = GALLERY_IMAGES.filter(
    (img) => activeFilter === "all" || img.category === activeFilter
  );

  const currentImage = selectedIndex !== null ? filteredImages[selectedIndex] : null;

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredImages.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-40 bg-charcoal overflow-hidden">
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img
            src={exteriorEvening}
            alt="Gallery background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/30 to-charcoal" />
        </motion.div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <motion.p 
            className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t("Visual Journey", "Görsel Yolculuk")}
          </motion.p>
          <motion.h1 
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t("Gallery", "Galeri")}
          </motion.h1>
          <motion.div 
            className="divider-ornament mt-8 max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-primary">✦</span>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-background sticky top-20 z-40 border-b border-border/50 backdrop-blur-lg bg-background/90">
        <div className="container mx-auto container-padding">
          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                  activeFilter === filter.id
                    ? "bg-primary text-charcoal shadow-glow"
                    : "bg-card text-foreground hover:bg-muted border border-border/50"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {language === "en" ? filter.labelEn : filter.labelTr}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid - Masonry */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <motion.div 
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-card">
                    <motion.img
                      src={image.src}
                      alt={language === "en" ? image.alt : image.altTr}
                      className="w-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <motion.div
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-glow"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                      >
                        <Maximize2 className="text-charcoal" size={28} />
                      </motion.div>
                    </div>
                    
                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-cream font-medium">{language === "en" ? image.alt : image.altTr}</p>
                    </div>
                    
                    {/* Border Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/50 transition-colors duration-500" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/98 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <motion.button
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-cream/10 flex items-center justify-center text-cream hover:bg-primary hover:text-charcoal transition-all duration-300"
              onClick={() => setSelectedIndex(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.button>

            {/* Navigation Arrows */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <motion.button
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-cream/10 flex items-center justify-center text-cream hover:bg-primary hover:text-charcoal transition-all duration-300"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={28} />
              </motion.button>
            )}
            
            {selectedIndex !== null && selectedIndex < filteredImages.length - 1 && (
              <motion.button
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-cream/10 flex items-center justify-center text-cream hover:bg-primary hover:text-charcoal transition-all duration-300"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={28} />
              </motion.button>
            )}

            {/* Image */}
            <motion.img
              key={currentImage.id}
              src={currentImage.src}
              alt={language === "en" ? currentImage.alt : currentImage.altTr}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-elegant"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Caption */}
            <motion.div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-cream font-medium text-lg mb-2">
                {language === "en" ? currentImage.alt : currentImage.altTr}
              </p>
              <p className="text-cream/50 text-sm">
                {selectedIndex !== null && `${selectedIndex + 1} / ${filteredImages.length}`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Gallery;