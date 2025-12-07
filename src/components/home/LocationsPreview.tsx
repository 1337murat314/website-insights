import { motion } from "framer-motion";
import { MapPin, Clock, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES, RESTAURANT_PHONE } from "@/lib/constants";

const LocationsPreview = () => {
  const { language, t } = useLanguage();

  return (
    <section className="section-padding bg-charcoal text-cream">
      <div className="container mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
          >
            {t("Find Us", "Bizi Bulun")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold"
          >
            {t("Three Locations Across Cyprus", "Kıbrıs'ta Üç Şube")}
          </motion.h2>
        </div>

        {/* Locations Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {BRANCHES.map((branch, index) => (
            <motion.a
              key={branch.id}
              href={branch.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 bg-background/5 rounded-2xl border border-border/20 hover:border-primary/50 hover:bg-background/10 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                {language === "en" ? branch.name : branch.nameTr}
              </h3>
              <div className="space-y-3 text-cream/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                  <span className="text-sm">
                    {language === "en" ? branch.address : branch.addressTr}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span className="text-sm">{branch.hours}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span className="text-sm">{branch.phone}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Map Embed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl overflow-hidden"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d416315.91969695793!2d33.0!3d35.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14de1767ca494d55%3A0x130bc0d16ece51f5!2sNorth%20Cyprus!5e0!3m2!1sen!2s!4v1234567890"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Califorian Locations Map"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default LocationsPreview;
