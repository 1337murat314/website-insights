import { Link } from "react-router-dom";
import { Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { RESTAURANT_PHONE } from "@/lib/constants";
import tableSettingImage from "@/assets/gallery/table-setting.jpg";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={tableSettingImage}
          alt="Dining experience"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 to-charcoal/95" />
      </div>

      <div className="container mx-auto container-padding relative">
        <div className="max-w-3xl mx-auto text-center text-cream">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {t("Ready for an", "Unutulmaz bir")}
            <br />
            <span className="text-primary">{t("Unforgettable Experience?", "Deneyime Hazır mısınız?")}</span>
          </h2>
          <p className="text-cream/80 text-lg mb-4">
            {t(
              "We would be delighted to host you at Califorian, where taste, sincerity and pleasure meet.",
              "Sizleri lezzetin, samimiyetin ve keyfin buluştuğu Califorian'da ağırlamaktan mutluluk duyacağız."
            )}
          </p>
          <p className="text-cream/70 text-base mb-10">
            {t(
              "Reserve your place now for unforgettable moments!",
              "Unutulmaz anlar için yerinizi şimdiden ayırtın!"
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reservations">
              <Button
                size="lg"
                className="bg-primary hover:bg-accent text-primary-foreground font-semibold px-8 py-6 text-lg w-full sm:w-auto"
              >
                <Calendar className="mr-2" size={20} />
                {t("Make a Reservation", "Rezervasyon Yap")}
              </Button>
            </Link>
            <a href={`tel:${RESTAURANT_PHONE}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-cream/30 text-cream hover:bg-cream/10 font-semibold px-8 py-6 text-lg w-full sm:w-auto"
              >
                <Phone className="mr-2" size={20} />
                392 444 7070
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;