import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

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

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src={exteriorEvening}
            alt="Gallery background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Visual Journey", "Görsel Yolculuk")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold">
            {t("Gallery", "Galeri")}
          </h1>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-secondary sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto container-padding">
          <div className="flex flex-wrap gap-2 justify-center">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                  activeFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {language === "en" ? filter.labelEn : filter.labelTr}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setSelectedImage({ src: image.src, alt: language === "en" ? image.alt : image.altTr })}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={image.src}
                    alt={language === "en" ? image.alt : image.altTr}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-cream font-medium">{language === "en" ? image.alt : image.altTr}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-cream hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Layout>
  );
};

export default Gallery;