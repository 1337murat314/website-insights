import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
    { id: 1, src: exteriorDomes, alt: "Califorian exterior with glass domes" },
    { id: 2, src: pannaCotta, alt: "Panna Cotta dessert" },
    { id: 3, src: cocktail, alt: "Signature cocktail" },
    { id: 4, src: waiterServing, alt: "Waiter serving food" },
    { id: 5, src: exteriorEvening, alt: "Evening ambiance" },
    { id: 6, src: tableSetting, alt: "Elegant table setting" },
  ];

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Gallery", "Galeri")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("Captured Moments", "Yakalanan Anlar")}
          </h2>
          <p className="text-muted-foreground">
            {t(
              "A glimpse into the Califorian experience",
              "Califorian deneyiminden bir kesit"
            )}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((image, index) => (
            <motion.div
              key={image.id}
              className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover ${
                  index === 0 ? "h-full min-h-[300px] md:min-h-[500px]" : "h-48 md:h-56"
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/gallery">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="lg" className="group">
                {t("View Full Gallery", "Tüm Galeriyi Gör")}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryPreview;