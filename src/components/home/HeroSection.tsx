import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
          alt="Restaurant ambiance"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto container-padding text-center text-cream">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Tagline */}
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm animate-fade-up opacity-0 stagger-1">
            {t("Est. 2001 • 23 Years of Excellence", "2001'den beri • 23 Yıllık Mükemmellik")}
          </p>

          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-up opacity-0 stagger-2">
            {t("Experience", "Deneyimleyin")}
            <br />
            <span className="text-primary">{t("Culinary Art", "Mutfak Sanatını")}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto animate-fade-up opacity-0 stagger-3">
            {t(
              "Where Mediterranean flavors meet modern elegance. Every dish tells a story of passion, tradition, and excellence.",
              "Akdeniz lezzetlerinin modern zarafetle buluştuğu yer. Her tabak tutku, gelenek ve mükemmelliğin hikayesini anlatır."
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up opacity-0 stagger-4">
            <Link to="/reservations">
              <Button
                size="lg"
                className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-8 py-6 text-lg"
              >
                {t("Reserve Your Table", "Masanızı Ayırtın")}
              </Button>
            </Link>
            <Link to="/menu">
              <Button
                size="lg"
                variant="outline"
                className="border-cream/30 text-cream hover:bg-cream/10 font-semibold px-8 py-6 text-lg"
              >
                {t("Explore Menu", "Menüyü Keşfedin")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <ArrowDown className="text-cream/50" size={32} />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
    </section>
  );
};

export default HeroSection;