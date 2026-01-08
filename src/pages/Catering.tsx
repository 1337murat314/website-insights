import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/layout/Layout";
import { 
  ChefHat, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Utensils,
  Star,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CateringQuoteModal from "@/components/catering/CateringQuoteModal";

const Catering = () => {
  const { t } = useLanguage();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  const services = [
    {
      icon: Users,
      title: t("Corporate Events", "Kurumsal Etkinlikler"),
      description: t(
        "Professional catering for meetings, conferences, and corporate gatherings of any size.",
        "Her ölçekte toplantı, konferans ve kurumsal etkinlikler için profesyonel catering."
      ),
    },
    {
      icon: Calendar,
      title: t("Private Celebrations", "Özel Kutlamalar"),
      description: t(
        "Weddings, birthdays, anniversaries, and special milestone celebrations.",
        "Düğünler, doğum günleri, yıl dönümleri ve özel gün kutlamaları."
      ),
    },
    {
      icon: Utensils,
      title: t("Cocktail Receptions", "Kokteyl Resepsiyonları"),
      description: t(
        "Elegant appetizers and drinks service for sophisticated gatherings.",
        "Sofistike buluşmalar için zarif mezeler ve içecek servisi."
      ),
    },
    {
      icon: ChefHat,
      title: t("Chef on Site", "Şef Hizmeti"),
      description: t(
        "Our experienced chefs prepare and serve dishes at your chosen venue.",
        "Deneyimli şeflerimiz seçtiğiniz mekanda yemekleri hazırlar ve servis eder."
      ),
    },
  ];

  const features = [
    t("Customized menus tailored to your preferences", "Tercihlerinize göre özelleştirilmiş menüler"),
    t("Fresh, locally-sourced ingredients", "Taze, yerel kaynaklı malzemeler"),
    t("Professional service staff", "Profesyonel servis personeli"),
    t("Complete setup and cleanup", "Tam kurulum ve temizlik"),
    t("Dietary accommodation (vegetarian, vegan, gluten-free)", "Diyet uyumu (vejetaryen, vegan, glutensiz)"),
    t("Flexible packages for any budget", "Her bütçeye uygun esnek paketler"),
  ];

  const stats = [
    { value: "500+", label: t("Events Catered", "Catering Etkinliği") },
    { value: "23", label: t("Years Experience", "Yıllık Deneyim") },
    { value: "10-500", label: t("Guest Capacity", "Misafir Kapasitesi") },
    { value: "100%", label: t("Satisfaction Rate", "Memnuniyet Oranı") },
  ];

  return (
    <Layout>
      <Helmet>
        <title>{t("Catering Services | Califorian Restaurant", "Catering Hizmetleri | Califorian Restaurant")}</title>
        <meta 
          name="description" 
          content={t(
            "Professional catering services for corporate events, weddings, and private celebrations. Fresh Mediterranean cuisine delivered to your venue.",
            "Kurumsal etkinlikler, düğünler ve özel kutlamalar için profesyonel catering hizmetleri. Taze Akdeniz mutfağı mekanınıza teslim edilir."
          )} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?w=1920')",
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
                {t("Catering Services", "Catering Hizmetleri")}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
                {t("Exceptional Catering", "Olağanüstü Catering")}
                <br />
                <span className="text-primary">{t("For Every Occasion", "Her Etkinlik İçin")}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                {t(
                  "Bring the authentic Califorian experience to your special events with our professional catering services.",
                  "Profesyonel catering hizmetlerimizle özel etkinliklerinize otantik Califorian deneyimini getirin."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8" onClick={() => setQuoteModalOpen(true)}>
                  {t("Get a Quote", "Fiyat Teklifi Al")}
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-background" asChild>
                  <a href="#services">{t("Our Services", "Hizmetlerimiz")}</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {t("Our Catering Services", "Catering Hizmetlerimiz")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "From intimate gatherings to grand celebrations, we offer comprehensive catering solutions tailored to your needs.",
                  "Samimi buluşmalardan büyük kutlamalara, ihtiyaçlarınıza göre kapsamlı catering çözümleri sunuyoruz."
                )}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-serif mb-6">
                  {t("Why Choose Califorian Catering?", "Neden Califorian Catering?")}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t(
                    "With over 23 years of culinary excellence, we bring the same passion and quality to every catering event that we bring to our restaurants.",
                    "23 yılı aşkın mutfak mükemmelliğiyle, restoranlarımıza getirdiğimiz aynı tutku ve kaliteyi her catering etkinliğine taşıyoruz."
                  )}
                </p>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"
                  alt="Catering setup"
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{t("5-Star Rated", "5 Yıldızlı")}</div>
                      <div className="text-sm text-muted-foreground">{t("Customer Reviews", "Müşteri Yorumları")}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-serif mb-4">
                {t("How It Works", "Nasıl Çalışır")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "Planning your catered event is simple and stress-free with our streamlined process.",
                  "Kolaylaştırılmış sürecimizle catering etkinliğinizi planlamak basit ve stressiz."
                )}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: t("Contact Us", "Bize Ulaşın"),
                  description: t("Share your event details and requirements", "Etkinlik detaylarınızı ve gereksinimlerinizi paylaşın"),
                },
                {
                  step: "02",
                  title: t("Consultation", "Danışmanlık"),
                  description: t("We'll discuss menu options and customize your package", "Menü seçeneklerini tartışır ve paketinizi özelleştiririz"),
                },
                {
                  step: "03",
                  title: t("Confirmation", "Onay"),
                  description: t("Review and confirm your personalized catering plan", "Kişiselleştirilmiş catering planınızı inceleyin ve onaylayın"),
                },
                {
                  step: "04",
                  title: t("Enjoy", "Keyfini Çıkarın"),
                  description: t("Relax while we handle everything on the day", "Gün boyunca her şeyi biz hallederken rahatlayın"),
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/20 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-serif mb-4">
                  {t("Ready to Plan Your Event?", "Etkinliğinizi Planlamaya Hazır mısınız?")}
                </h2>
                <p className="text-muted-foreground">
                  {t(
                    "Contact us today to discuss your catering needs and get a personalized quote.",
                    "Catering ihtiyaçlarınızı görüşmek ve kişiselleştirilmiş teklif almak için bugün bize ulaşın."
                  )}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                <motion.a
                  href="tel:+905551234567"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors text-center group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{t("Call Us", "Bizi Arayın")}</h3>
                  <p className="text-muted-foreground text-sm">+90 555 123 4567</p>
                </motion.a>

                <motion.a
                  href="mailto:catering@califorian.com"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors text-center group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{t("Email Us", "E-posta Gönderin")}</h3>
                  <p className="text-muted-foreground text-sm">catering@califorian.com</p>
                </motion.a>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors text-center group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{t("Response Time", "Yanıt Süresi")}</h3>
                  <p className="text-muted-foreground text-sm">{t("Within 24 hours", "24 saat içinde")}</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="mt-8 text-center"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    "Or visit us at any of our restaurant locations to discuss your catering needs in person.",
                    "Ya da catering ihtiyaçlarınızı yüz yüze görüşmek için restoranlarımızdan herhangi birini ziyaret edin."
                  )}
                </p>
                <Button variant="outline" asChild>
                  <Link to="/locations">{t("View Locations", "Konumları Görüntüle")}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <CateringQuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
    </Layout>
  );
};

export default Catering;
