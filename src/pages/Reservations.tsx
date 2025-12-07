import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { BRANCHES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Calendar, Clock, Users, MapPin, Check, Loader2, Armchair } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Reservations = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    branch: "",
    date: "",
    time: "",
    guests: "",
    seatingPreference: "",
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00", "21:30", "22:00",
  ];

  const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

  const seatingOptions = [
    { value: "inside", labelEn: "Inside", labelTr: "İç Mekan" },
    { value: "outside", labelEn: "Outside / Terrace", labelTr: "Dış Mekan / Teras" },
    { value: "no_preference", labelEn: "No Preference", labelTr: "Fark Etmez" },
  ];

  const sendWhatsAppConfirmation = async (phone: string, name: string, date: string, time: string, guests: string, branch: string) => {
    try {
      const branchName = BRANCHES.find((b) => b.id === branch)?.name || branch;
      const message = t(
        `🍽️ Califorian Restaurant Reservation Confirmation\n\nDear ${name},\n\nYour reservation has been received!\n\n📅 Date: ${date}\n⏰ Time: ${time}\n👥 Guests: ${guests}\n📍 Location: ${branchName}\n\nWe will confirm your reservation shortly.\n\nThank you for choosing Califorian!`,
        `🍽️ Califorian Restaurant Rezervasyon Onayı\n\nSayın ${name},\n\nRezervasyonunuz alındı!\n\n📅 Tarih: ${date}\n⏰ Saat: ${time}\n👥 Kişi: ${guests}\n📍 Şube: ${branchName}\n\nRezervasyonunuz kısa süre içinde onaylanacaktır.\n\nCaliforian'ı tercih ettiğiniz için teşekkürler!`
      );

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { phone, message }
      });

      if (error) {
        console.error('WhatsApp notification error:', error);
      } else {
        console.log('WhatsApp notification sent:', data);
      }
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const partySize = formData.guests === "10+" ? 10 : parseInt(formData.guests);

    // Build special requests with seating preference
    const seatingLabel = seatingOptions.find((o) => o.value === formData.seatingPreference)?.labelEn || "";
    const specialRequestsWithSeating = seatingLabel 
      ? `[Seating: ${seatingLabel}]${formData.specialRequests ? ` ${formData.specialRequests}` : ""}`
      : formData.specialRequests || null;

    const { error } = await supabase.from("reservations").insert({
      guest_name: formData.name,
      guest_email: `${formData.phone}@noemail.com`,
      guest_phone: formData.phone || null,
      party_size: partySize,
      reservation_date: formData.date,
      reservation_time: formData.time,
      special_requests: specialRequestsWithSeating,
      status: "pending",
    });

    if (error) {
      setIsSubmitting(false);
      console.error("Reservation error:", error);
      toast({
        title: t("Error", "Hata"),
        description: t("Failed to create reservation. Please try again.", "Rezervasyon oluşturulamadı. Lütfen tekrar deneyin."),
        variant: "destructive",
      });
      return;
    }

    // Send WhatsApp confirmation if phone number is provided
    if (formData.phone) {
      await sendWhatsAppConfirmation(
        formData.phone,
        formData.name,
        formData.date,
        formData.time,
        formData.guests,
        formData.branch
      );
    }

    setIsSubmitting(false);

    toast({
      title: t("Reservation Request Sent!", "Rezervasyon Talebi Gönderildi!"),
      description: t(
        "We'll confirm your reservation shortly. You'll receive a WhatsApp confirmation.",
        "Rezervasyonunuzu kısa süre içinde onaylayacağız. WhatsApp'tan onay mesajı alacaksınız."
      ),
    });
    setStep(4);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData.branch && formData.date && formData.time && formData.guests && formData.seatingPreference;
  const canProceedStep2 = formData.name && formData.phone;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920"
            alt="Reservation background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Book Your Experience", "Deneyiminizi Ayırtın")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold">
            {t("Reservations", "Rezervasyon")}
          </h1>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check size={20} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 md:w-24 h-1 ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Date & Time */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="font-serif text-2xl font-bold text-center mb-8">
                  {t("Select Date & Time", "Tarih ve Saat Seçin")}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      {t("Location", "Şube")}
                    </Label>
                    <Select value={formData.branch} onValueChange={(v) => updateFormData("branch", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select branch", "Şube seçin")} />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      {t("Number of Guests", "Misafir Sayısı")}
                    </Label>
                    <Select value={formData.guests} onValueChange={(v) => updateFormData("guests", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select guests", "Seçin")} />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((num) => (
                          <SelectItem key={num} value={num}>
                            {num} {t("guests", "kişi")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      {t("Date", "Tarih")}
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => updateFormData("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      {t("Time", "Saat")}
                    </Label>
                    <Select value={formData.time} onValueChange={(v) => updateFormData("time", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Select time", "Saat seçin")} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seating Preference */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Armchair size={16} className="text-primary" />
                    {t("Seating Preference", "Oturma Tercihi")}
                  </Label>
                  <Select value={formData.seatingPreference} onValueChange={(v) => updateFormData("seatingPreference", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select preference", "Tercih seçin")} />
                    </SelectTrigger>
                    <SelectContent>
                      {seatingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelEn, option.labelTr)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full bg-primary hover:bg-accent text-primary-foreground py-6"
                >
                  {t("Continue", "Devam Et")}
                </Button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <h2 className="font-serif text-2xl font-bold text-center mb-8">
                  {t("Your Information", "Bilgileriniz")}
                </h2>

                <div className="space-y-2">
                  <Label>{t("Full Name", "Ad Soyad")}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder={t("Enter your name", "Adınızı girin")}
                  />
                </div>


                <div className="space-y-2">
                  <Label>{t("Phone", "Telefon")}</Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => updateFormData("phone", value)}
                    placeholder={t("Enter your phone", "Telefonunuzu girin")}
                  />
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    {t("Back", "Geri")}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
                  >
                    {t("Continue", "Devam Et")}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Special Requests & Confirm */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up">
                <h2 className="font-serif text-2xl font-bold text-center mb-8">
                  {t("Special Requests", "Özel İstekler")}
                </h2>

                <div className="space-y-2">
                  <Label>{t("Special Requests (Optional)", "Özel İstekler (İsteğe Bağlı)")}</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => updateFormData("specialRequests", e.target.value)}
                    placeholder={t(
                      "Any dietary requirements, special occasions, or preferences...",
                      "Diyet gereksinimleri, özel günler veya tercihler..."
                    )}
                    rows={4}
                  />
                </div>

                {/* Summary */}
                <div className="bg-secondary rounded-xl p-6 space-y-3">
                  <h3 className="font-semibold text-foreground mb-4">
                    {t("Reservation Summary", "Rezervasyon Özeti")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Location:", "Şube:")}</span>{" "}
                    {BRANCHES.find((b) => b.id === formData.branch)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Date:", "Tarih:")}</span> {formData.date}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Time:", "Saat:")}</span> {formData.time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Guests:", "Kişi:")}</span> {formData.guests}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Seating:", "Oturma:")}</span>{" "}
                    {seatingOptions.find((o) => o.value === formData.seatingPreference)
                      ? t(
                          seatingOptions.find((o) => o.value === formData.seatingPreference)!.labelEn,
                          seatingOptions.find((o) => o.value === formData.seatingPreference)!.labelTr
                        )
                      : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("Name:", "Ad:")}</span> {formData.name}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isSubmitting}>
                    {t("Back", "Geri")}
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-accent text-primary-foreground" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Submitting...", "Gönderiliyor...")}
                      </>
                    ) : (
                      t("Confirm Reservation", "Rezervasyonu Onayla")
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-6 animate-scale-in">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Check className="text-green-500" size={40} />
                </div>
                <h2 className="font-serif text-3xl font-bold text-foreground">
                  {t("Thank You!", "Teşekkürler!")}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t(
                    "Your reservation request has been received. You'll receive a WhatsApp confirmation shortly.",
                    "Rezervasyon talebiniz alındı. Kısa süre içinde WhatsApp'tan onay mesajı alacaksınız."
                  )}
                </p>
                {formData.phone && (
                  <p className="text-sm text-muted-foreground">
                    📱 {formData.phone}
                  </p>
                )}
                <Button
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      branch: "",
                      date: "",
                      time: "",
                      guests: "",
                      seatingPreference: "",
                      name: "",
                      email: "",
                      phone: "",
                      specialRequests: "",
                    });
                  }}
                  variant="outline"
                >
                  {t("Make Another Reservation", "Başka Rezervasyon Yap")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reservations;