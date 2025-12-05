import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Heart, Users, Utensils } from "lucide-react";

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleEn: "Passion",
      titleTr: "Tutku",
      descEn: "Every dish is crafted with love and dedication to culinary excellence.",
      descTr: "Her yemek, sevgi ve mutfak mükemmelliğine adanmışlıkla hazırlanır.",
    },
    {
      icon: Utensils,
      titleEn: "Quality",
      titleTr: "Kalite",
      descEn: "We source only the finest local ingredients for our kitchen.",
      descTr: "Mutfağımız için yalnızca en kaliteli yerel malzemeleri kullanıyoruz.",
    },
    {
      icon: Users,
      titleEn: "Community",
      titleTr: "Topluluk",
      descEn: "Building lasting relationships with our guests and neighbors.",
      descTr: "Misafirlerimiz ve komşularımızla kalıcı ilişkiler kuruyoruz.",
    },
    {
      icon: Award,
      titleEn: "Excellence",
      titleTr: "Mükemmellik",
      descEn: "23 years of consistent quality and exceptional service.",
      descTr: "23 yıllık tutarlı kalite ve olağanüstü hizmet.",
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1920"
            alt="About background"
            className="w-full h-full object-cover"
          />
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

      {/* Story */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-primary font-medium tracking-widest uppercase text-sm">
                {t("Since 2001", "2001'den Beri")}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {t(
                  "A Journey of Flavor & Tradition",
                  "Lezzet ve Geleneğin Yolculuğu"
                )}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t(
                  "Califorian Restaurant began as a dream shared by a family passionate about Mediterranean cuisine. In 2001, we opened our first doors in Lefkoşa, offering guests a taste of authentic flavors prepared with love and the finest ingredients.",
                  "Califorian Restaurant, Akdeniz mutfağına tutkuyla bağlı bir ailenin paylaştığı bir hayal olarak başladı. 2001 yılında Lefkoşa'da ilk kapılarımızı açtık ve misafirlerimize sevgiyle ve en kaliteli malzemelerle hazırlanan otantik lezzetler sunduk."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Over 23 years, what started as a single restaurant has blossomed into three beloved locations across Northern Cyprus. Our commitment to quality, authenticity, and warm hospitality remains unchanged—each visit to Califorian is a celebration of good food and cherished moments.",
                  "23 yılı aşkın sürede, tek bir restoran olarak başlayan serüvenimiz, Kuzey Kıbrıs genelinde üç sevilen şubeye dönüştü. Kalite, özgünlük ve sıcak misafirperverliğe olan bağlılığımız değişmedi—Califorian'a her ziyaret, güzel yemeklerin ve değerli anların kutlamasıdır."
                )}
              </p>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800"
                alt="Restaurant history"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground rounded-xl p-6 shadow-xl">
                <p className="font-serif text-5xl font-bold">23</p>
                <p className="text-sm">{t("Years", "Yıl")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto container-padding">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
              {t("What Drives Us", "Bizi Yönlendiren")}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              {t("Our Values", "Değerlerimiz")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 text-center hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {t(value.titleEn, value.titleTr)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(value.descEn, value.descTr)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800"
                alt="Our team"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <p className="text-primary font-medium tracking-widest uppercase text-sm">
                {t("The Heart of Califorian", "Califorian'ın Kalbi")}
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight">
                {t("Our Team", "Ekibimiz")}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t(
                  "Behind every memorable meal is our dedicated team of culinary professionals. From our experienced chefs to our attentive service staff, each member of the Califorian family is committed to making your dining experience exceptional.",
                  "Her unutulmaz yemeğin arkasında, mutfak profesyonellerinden oluşan özel ekibimiz var. Deneyimli şeflerimizden özenli servis personelimize kadar Califorian ailesinin her üyesi, yemek deneyiminizi olağanüstü kılmaya kararlıdır."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Many of our team members have been with us for over a decade, and their passion shines through in every plate we serve and every smile that greets you.",
                  "Ekip üyelerimizin çoğu on yılı aşkın süredir bizimle ve tutkuları servis ettiğimiz her tabakta ve sizi karşılayan her gülümsemede parlıyor."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;