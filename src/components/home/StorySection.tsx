import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import waiterImage from "@/assets/gallery/waiter-serving.jpg";

const StorySection = () => {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/50 to-transparent" />

      <div className="container mx-auto container-padding relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={waiterImage}
                alt="Califorian service"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-primary/30 rounded-2xl -z-10" />

            {/* Stats Card */}
            <div className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
              <p className="font-serif text-4xl font-bold text-primary">23+</p>
              <p className="text-muted-foreground text-sm">
                {t("Years of Excellence", "Yıllık Mükemmellik")}
              </p>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <p className="text-primary font-medium tracking-widest uppercase text-sm">
              {t("Our Story", "Hikayemiz")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {t(
                "A Journey from Mehmet Akif Street to the Future",
                "Mehmet Akif Caddesi'nden Geleceğe"
              )}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t(
                "We started serving 23 years ago on Mehmet Akif Street, one of the most popular areas of Lefkoşa. During this time, we have continuously expanded our customer portfolio with our quality service and reliable products.",
                "Lefkoşa'nın gözde bölgelerinden biri olan Mehmet Akif Caddesi'nde, tam 23 yıl önce hizmet vermeye başladık. Bu süre zarfında, kaliteli hizmet anlayışımız ve güvenilir ürünlerimizle müşteri portföyümüzü sürekli olarak genişlettik."
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "With our vision of being the address of quality and trust, we opened our Gazimağusa and Esentepe branches over the years. Through our catering services, we are now reaching thousands of people daily.",
                "Kalite ve güvenin adresi olma vizyonumuzla devam ettiğimiz yıllar içerisinde Gazimağusa ve Esentepe şubelerini açtık. Catering hizmetleriyle binlerce kişiye günlük yemek sunarak daha geniş bir kitleye ulaşıyoruz."
              )}
            </p>

            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">3</p>
                <p className="text-muted-foreground text-sm">{t("Locations", "Şube")}</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">1000+</p>
                <p className="text-muted-foreground text-sm">{t("Daily Catering", "Günlük Catering")}</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">100K+</p>
                <p className="text-muted-foreground text-sm">{t("Happy Guests", "Mutlu Misafir")}</p>
              </div>
            </div>

            <Link to="/about">
              <Button size="lg" className="bg-primary hover:bg-accent text-primary-foreground mt-4 group">
                {t("Learn More", "Daha Fazla")}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;