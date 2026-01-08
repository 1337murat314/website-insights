import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { FEATURES } from "@/lib/constants";
import { 
  Users, Leaf, Coffee, PartyPopper, Wifi, Car, 
  Baby, Crown, TreePine, Wine, Utensils, Salad,
  LucideIcon
} from "lucide-react";
import exteriorDomes from "@/assets/gallery/exterior-domes.jpg";
import waiterServing from "@/assets/gallery/waiter-serving.jpg";

const iconMap: Record<number, LucideIcon> = {
  1: Users,
  2: Leaf,
  3: Coffee,
  4: PartyPopper,
  5: Wifi,
  6: Car,
  7: Baby,
  8: Crown,
  9: TreePine,
  10: Wine,
  11: Utensils,
  12: Salad,
};

const About = () => {
  const { t, language } = useLanguage();

  return (
    <Layout>
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img src={exteriorDomes} alt="About background" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Our Story", "Hikayemiz")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold">
            {t("About Us", "Hakkımızda")}
          </h1>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-primary font-medium tracking-widest uppercase text-sm">
                {t("Since 2000", "2000'den Beri")}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {t("A Journey from Mehmet Akif Street to the Future", "Mehmet Akif Caddesi'nden Geleceğe Yürümek")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t(
                  "We started serving 26 years ago on Mehmet Akif Street, one of the most popular areas of Lefkoşa. During this time, we have continuously expanded our customer portfolio with our quality service approach and reliable products.",
                  "Lefkoşa'nın gözde bölgelerinden biri olan Mehmet Akif Caddesi'nde, tam 26 yıl önce hizmet vermeye başladık. Bu süre zarfında, kaliteli hizmet anlayışımız ve güvenilir ürünlerimizle müşteri portföyümüzü sürekli olarak genişlettik."
                )}
              </p>
            </div>
            <div className="relative">
              <img src={waiterServing} alt="Restaurant service" className="rounded-2xl shadow-2xl" />
              <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground rounded-xl p-6 shadow-xl">
                <p className="font-serif text-5xl font-bold">26</p>
                <p className="text-sm">{t("Years", "Yıl")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              {t("Our Features", "Özelliklerimiz")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = iconMap[feature.id] || Users;
              return (
                <div key={feature.id} className="bg-card rounded-2xl p-6 hover-lift border border-border/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    {language === "en" ? feature.titleEn : feature.titleTr}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === "en" ? feature.descEn : feature.descTr}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;