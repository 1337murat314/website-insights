import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { GALLERY_IMAGES } from "@/lib/constants";

const GalleryPreview = () => {
  const { t } = useLanguage();
  const previewImages = GALLERY_IMAGES.slice(0, 6);

  return (
    <section className="section-padding bg-secondary">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
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
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden rounded-xl group ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                  index === 0 ? "h-full min-h-[300px] md:min-h-[500px]" : "h-48 md:h-56"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/gallery">
            <Button variant="outline" size="lg" className="group">
              {t("View Full Gallery", "Tüm Galeriyi Gör")}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;