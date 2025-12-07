import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BRANCHES, RESTAURANT_PHONE } from "@/lib/constants";
import { toast } from "sonner";

const Contact = () => {
  const { language, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(t("Message sent successfully!", "Mesajınız başarıyla gönderildi!"));
  };

  const contactInfo = [
    {
      icon: Phone,
      label: t("Phone", "Telefon"),
      value: RESTAURANT_PHONE,
      href: `tel:${RESTAURANT_PHONE}`,
    },
    {
      icon: Mail,
      label: t("Email", "E-posta"),
      value: "info@califorian.com",
      href: "mailto:info@califorian.com",
    },
    {
      icon: Clock,
      label: t("Hours", "Çalışma Saatleri"),
      value: t("Daily: 09:00 - 00:00", "Her gün: 09:00 - 00:00"),
      href: null,
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920"
            alt="Contact"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
          >
            {t("Get In Touch", "İletişime Geçin")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold"
          >
            {t("Contact Us", "Bize Ulaşın")}
          </motion.h1>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                {t("Send Us a Message", "Bize Mesaj Gönderin")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t(
                  "Have a question or feedback? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.",
                  "Bir sorunuz veya geri bildiriminiz mi var? Sizden haber almak isteriz. Formu doldurun, en kısa sürede size dönelim."
                )}
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card p-8 rounded-2xl text-center"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-2">
                    {t("Thank You!", "Teşekkürler!")}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(
                      "We've received your message and will get back to you soon.",
                      "Mesajınızı aldık, en kısa sürede size döneceğiz."
                    )}
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    {t("Send Another Message", "Başka Bir Mesaj Gönder")}
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">{t("Full Name", "Ad Soyad")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-2"
                        placeholder={t("Your name", "Adınız")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("Email", "E-posta")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-2"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">{t("Phone", "Telefon")}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-2"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">{t("Subject", "Konu")} *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="mt-2"
                        placeholder={t("What's this about?", "Konu nedir?")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">{t("Message", "Mesaj")} *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="mt-2 min-h-[150px]"
                      placeholder={t("How can we help you?", "Size nasıl yardımcı olabiliriz?")}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                  >
                    {isSubmitting ? (
                      t("Sending...", "Gönderiliyor...")
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t("Send Message", "Mesaj Gönder")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Contact Details */}
              <div className="bg-card p-8 rounded-2xl">
                <h3 className="font-serif text-2xl font-bold mb-6">
                  {t("Contact Information", "İletişim Bilgileri")}
                </h3>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-foreground font-medium hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-foreground font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations Quick Links */}
              <div className="bg-card p-8 rounded-2xl">
                <h3 className="font-serif text-2xl font-bold mb-6">
                  {t("Our Locations", "Şubelerimiz")}
                </h3>
                <div className="space-y-4">
                  {BRANCHES.map((branch) => (
                    <a
                      key={branch.id}
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-background rounded-xl hover:bg-muted transition-colors group"
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {language === "en" ? branch.name : branch.nameTr}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? branch.address : branch.addressTr}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="bg-card p-2 rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.8765447542437!2d33.3637!3d35.1847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDExJzA0LjkiTiAzM8KwMjEnNDkuMyJF!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                  title="Califorian Restaurant Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
