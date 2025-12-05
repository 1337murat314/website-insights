import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
                src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800"
                alt="Chef preparing food"
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
                "A Legacy of Flavor & Tradition",
                "Lezzet ve Geleneğin Mirası"
              )}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t(
                "Since 2001, Califorian Restaurant has been a cornerstone of culinary excellence in Cyprus. What started as a small family-owned establishment has grown into three beloved locations, each maintaining the warmth and quality that defined our humble beginnings.",
                "2001'den bu yana Califorian Restaurant, Kıbrıs'ta mutfak mükemmelliğinin temel taşı olmuştur. Küçük bir aile işletmesi olarak başlayan serüvenimiz, her biri mütevazı başlangıcımızı tanımlayan sıcaklık ve kaliteyi koruyan üç sevilen şubeye dönüşmüştür."
              )}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t(
                "Our chefs blend Mediterranean traditions with modern techniques, sourcing the finest local ingredients to create dishes that are both familiar and extraordinary.",
                "Şeflerimiz, hem tanıdık hem de sıra dışı yemekler yaratmak için en kaliteli yerel malzemeleri kullanarak Akdeniz geleneklerini modern tekniklerle harmanlıyor."
              )}
            </p>

            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">3</p>
                <p className="text-muted-foreground text-sm">{t("Locations", "Şube")}</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-foreground">50+</p>
                <p className="text-muted-foreground text-sm">{t("Menu Items", "Menü Çeşidi")}</p>
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