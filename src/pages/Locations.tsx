import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES } from "@/lib/constants";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Locations = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920"
            alt="Locations background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Find Us", "Bizi Bulun")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold">
            {t("Our Locations", "Şubelerimiz")}
          </h1>
        </div>
      </section>

      {/* Locations */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid lg:grid-cols-3 gap-8">
            {BRANCHES.map((branch, index) => (
              <div
                key={branch.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-lg hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                  <h3 className="absolute bottom-4 left-6 font-serif text-3xl font-bold text-cream">
                    {branch.name}
                  </h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-1 flex-shrink-0" size={20} />
                    <p className="text-foreground">{branch.address}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-primary flex-shrink-0" size={20} />
                    <a
                      href={`tel:${branch.phone}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {branch.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="text-primary flex-shrink-0" size={20} />
                    <p className="text-foreground">{branch.hours}</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full group/btn">
                        {t("Get Directions", "Yol Tarifi")}
                        <ExternalLink className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                      </Button>
                    </a>
                    <a href={`tel:${branch.phone}`} className="flex-1">
                      <Button className="w-full bg-primary hover:bg-accent text-primary-foreground">
                        {t("Call", "Ara")}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto container-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            {t("Visit Any of Our Locations", "Şubelerimizden Birini Ziyaret Edin")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t(
              "Each of our three locations offers the same exceptional dining experience with unique local character.",
              "Üç şubemizin her biri, benzersiz yerel karakteriyle aynı olağanüstü yemek deneyimini sunuyor."
            )}
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Locations;