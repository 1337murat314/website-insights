import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { GALLERY_IMAGES } from "@/lib/constants";
import { X } from "lucide-react";

const Gallery = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_IMAGES[0] | null>(null);

  const filters = [
    { id: "all", labelEn: "All", labelTr: "Tümü" },
    { id: "interior", labelEn: "Interior", labelTr: "İç Mekan" },
    { id: "food", labelEn: "Food", labelTr: "Yemekler" },
    { id: "events", labelEn: "Events", labelTr: "Etkinlikler" },
    { id: "team", labelEn: "Team", labelTr: "Ekip" },
  ];

  const filteredImages = GALLERY_IMAGES.filter(
    (img) => activeFilter === "all" || img.category === activeFilter
  );

  const { language } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920"
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
                onClick={() => setSelectedImage(image)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-cream font-medium">{image.alt}</p>
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