import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES } from "@/lib/constants";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import exteriorDomes from "@/assets/gallery/exterior-domes.jpg";
import exteriorEvening from "@/assets/gallery/exterior-evening.jpg";
import exteriorMain from "@/assets/gallery/exterior-main.jpg";

const branchImages: Record<string, string> = {
  lefkosa: exteriorDomes,
  gazimagusa: exteriorMain,
  esentepe: exteriorEvening,
};

const branchMaps: Record<string, string> = {
  lefkosa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203.80178827230822!2d33.351121895015!3d35.1858240031671!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de1735785d8783%3A0xadfe327e03020cda!2sCaliforian%20Restaurant!5e0!3m2!1sen!2suk!4v1765098448389!5m2!1sen!2suk",
  gazimagusa: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9228.839070424725!2d33.91527177446731!3d35.13448475154426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14dfc9d03279c415%3A0x5b7f570775a70914!2sCaliforian%20Gold!5e0!3m2!1sen!2suk!4v1765098477065!5m2!1sen!2suk",
  esentepe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3253.979021145473!2d33.628595876332355!3d35.35617694776138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de4f06c210ff9d%3A0xcb0c303355137d5a!2sCaliforian%20Restaurant%2C%20Esentepe%20(Maldives%20Homes)!5e0!3m2!1sen!2suk!4v1765098494537!5m2!1sen!2suk",
};

const Locations = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src={exteriorMain}
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
          <div className="space-y-12">
            {BRANCHES.map((branch, index) => (
              <div
                key={branch.id}
                className="grid md:grid-cols-2 gap-6 items-stretch"
              >
                {/* Info Card */}
                <div className={`bg-card rounded-2xl overflow-hidden shadow-lg flex flex-col ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={branchImages[branch.id]}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
                    <h3 className="absolute bottom-4 left-6 font-serif text-2xl font-bold text-cream">
                      {branch.name}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary mt-1 flex-shrink-0" size={18} />
                      <p className="text-foreground text-sm">{branch.address}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="text-primary flex-shrink-0" size={18} />
                      <a
                        href={`tel:${branch.phone}`}
                        className="text-foreground hover:text-primary transition-colors text-sm"
                      >
                        392 444 7070
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="text-primary flex-shrink-0" size={18} />
                      <p className="text-foreground text-sm">{branch.hours}</p>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <a
                        href={branch.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full group/btn">
                          {t("Get Directions", "Yol Tarifi")}
                          <ExternalLink className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={14} />
                        </Button>
                      </a>
                      <a href={`tel:${branch.phone}`} className="flex-1">
                        <Button size="sm" className="w-full bg-primary hover:bg-accent text-primary-foreground">
                          {t("Call", "Ara")}
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className={`rounded-2xl overflow-hidden shadow-lg min-h-[350px] ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <iframe
                    src={branchMaps[branch.id]}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '350px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${branch.name} Map`}
                  />
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
          <p className="text-muted-foreground max-w-xl mx-auto mb-2">
            {t(
              "Each of our three locations offers the same exceptional dining experience with unique local character.",
              "Üç şubemizin her biri, benzersiz yerel karakteriyle aynı olağanüstü yemek deneyimini sunuyor."
            )}
          </p>
          <p className="text-2xl font-bold text-primary">392 444 7070</p>
        </div>
      </section>
    </Layout>
  );
};

export default Locations;