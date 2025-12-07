import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreditCard, Banknote, UtensilsCrossed, ShoppingBag, Truck, MapPin, Clock, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type OrderType = "dine-in" | "pickup" | "delivery";
type PaymentMethod = "cash_at_table" | "card_at_table";

const Checkout = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    orderType: "dine-in" as OrderType,
    paymentMethod: "cash_at_table" as PaymentMethod,
    tableNumber: "",
    deliveryAddress: "",
    deliveryNotes: "",
    pickupTime: "",
    notes: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error(t("Your cart is empty", "Sepetiniz boş"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          customer_email: formData.customerEmail || null,
          order_type: formData.orderType,
          payment_method: formData.paymentMethod,
          table_number: formData.orderType === "dine-in" ? formData.tableNumber : null,
          delivery_address: formData.orderType === "delivery" ? formData.deliveryAddress : null,
          delivery_notes: formData.orderType === "delivery" ? formData.deliveryNotes : null,
          pickup_time: formData.orderType === "pickup" && formData.pickupTime ? new Date(formData.pickupTime).toISOString() : null,
          subtotal: getSubtotal(),
          tax: getTax(),
          total: getTotal(),
          notes: formData.notes || null,
          status: "new",
          estimated_prep_time: 30,
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        item_name: item.name,
        item_name_tr: item.nameTr || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: (item.price + item.modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)) * item.quantity,
        modifiers: JSON.parse(JSON.stringify(item.modifiers)),
        special_instructions: item.specialInstructions || null,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderNumber(orderData.order_number);
      clearCart();
      setStep(4); // Success step
      toast.success(t("Order placed successfully!", "Siparişiniz başarıyla alındı!"));
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(t("Failed to place order. Please try again.", "Sipariş verilemedi. Lütfen tekrar deneyin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderTypes = [
    { id: "dine-in", label: t("Dine In", "Restoranda"), icon: UtensilsCrossed },
    { id: "pickup", label: t("Pickup", "Gel Al"), icon: ShoppingBag },
    { id: "delivery", label: t("Delivery", "Teslimat"), icon: Truck },
  ];

  const paymentMethods = [
    { id: "cash_at_table", label: t("Pay Cash at Table", "Masada Nakit Öde"), icon: Banknote },
    { id: "card_at_table", label: t("Pay Card at Table", "Masada Kart ile Öde"), icon: CreditCard },
  ];

  const canProceedStep1 = formData.customerName && formData.customerPhone;
  const canProceedStep2 = formData.orderType && (
    (formData.orderType === "dine-in") ||
    (formData.orderType === "pickup") ||
    (formData.orderType === "delivery" && formData.deliveryAddress)
  );

  if (items.length === 0 && step < 4) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-4">
              {t("Your cart is empty", "Sepetiniz boş")}
            </h2>
            <Button onClick={() => navigate("/order")}>
              {t("Browse Menu", "Menüyü İncele")}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-charcoal">
        <div className="container mx-auto container-padding relative text-center text-cream">
          <h1 className="font-serif text-4xl md:text-5xl font-bold">
            {t("Checkout", "Sipariş Tamamla")}
          </h1>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 bg-secondary border-b border-border">
        <div className="container mx-auto container-padding">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: Contact Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-6 rounded-2xl"
                >
                  <h2 className="font-serif text-2xl font-bold mb-6">
                    {t("Contact Information", "İletişim Bilgileri")}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t("Full Name", "Ad Soyad")} *</Label>
                      <Input
                        id="name"
                        value={formData.customerName}
                        onChange={(e) => updateFormData("customerName", e.target.value)}
                        placeholder={t("Enter your name", "Adınızı girin")}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t("Phone Number", "Telefon")} *</Label>
                      <Input
                        id="phone"
                        value={formData.customerPhone}
                        onChange={(e) => updateFormData("customerPhone", e.target.value)}
                        placeholder="+90 5XX XXX XX XX"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("Email", "E-posta")} ({t("Optional", "Opsiyonel")})</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => updateFormData("customerEmail", e.target.value)}
                        placeholder="email@example.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full mt-6 bg-primary hover:bg-primary/90"
                  >
                    {t("Continue", "Devam Et")}
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Order Type & Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card p-6 rounded-2xl"
                >
                  <h2 className="font-serif text-2xl font-bold mb-6">
                    {t("Order Type", "Sipariş Tipi")}
                  </h2>
                  
                  {/* Order Type Selection */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {orderTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => updateFormData("orderType", type.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.orderType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                          formData.orderType === type.id ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <p className="text-sm font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Conditional Fields */}
                  {formData.orderType === "dine-in" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="table">{t("Table Number", "Masa Numarası")} ({t("Optional", "Opsiyonel")})</Label>
                        <Input
                          id="table"
                          value={formData.tableNumber}
                          onChange={(e) => updateFormData("tableNumber", e.target.value)}
                          placeholder={t("Enter table number if known", "Masa numarası")}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {formData.orderType === "pickup" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pickupTime">{t("Preferred Pickup Time", "Tercih Edilen Alış Saati")}</Label>
                        <Input
                          id="pickupTime"
                          type="datetime-local"
                          value={formData.pickupTime}
                          onChange={(e) => updateFormData("pickupTime", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {formData.orderType === "delivery" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address">{t("Delivery Address", "Teslimat Adresi")} *</Label>
                        <Textarea
                          id="address"
                          value={formData.deliveryAddress}
                          onChange={(e) => updateFormData("deliveryAddress", e.target.value)}
                          placeholder={t("Enter your full address", "Tam adresinizi girin")}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deliveryNotes">{t("Delivery Notes", "Teslimat Notları")}</Label>
                        <Input
                          id="deliveryNotes"
                          value={formData.deliveryNotes}
                          onChange={(e) => updateFormData("deliveryNotes", e.target.value)}
                          placeholder={t("Floor, door code, etc.", "Kat, kapı kodu, vb.")}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      {t("Back", "Geri")}
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {t("Continue", "Devam Et")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment & Review */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Payment Method */}
                  <div className="bg-card p-6 rounded-2xl">
                    <h2 className="font-serif text-2xl font-bold mb-6">
                      {t("Payment Method", "Ödeme Yöntemi")}
                    </h2>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => updateFormData("paymentMethod", value)}
                      className="space-y-4"
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            formData.paymentMethod === method.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          onClick={() => updateFormData("paymentMethod", method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <method.icon className={`w-6 h-6 ${
                            formData.paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer font-medium">
                            {method.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Order Notes */}
                  <div className="bg-card p-6 rounded-2xl">
                    <Label htmlFor="notes">{t("Order Notes", "Sipariş Notları")} ({t("Optional", "Opsiyonel")})</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateFormData("notes", e.target.value)}
                      placeholder={t("Any allergies or special requests?", "Alerji veya özel istek var mı?")}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      {t("Back", "Geri")}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isSubmitting ? t("Placing Order...", "Sipariş Veriliyor...") : t("Place Order", "Sipariş Ver")}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card p-8 rounded-2xl text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold mb-4">
                    {t("Order Confirmed!", "Sipariş Onaylandı!")}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t("Thank you for your order. We're preparing it now.", "Siparişiniz için teşekkürler. Hazırlanıyor.")}
                  </p>
                  {orderNumber && (
                    <div className="bg-background p-4 rounded-xl mb-6">
                      <p className="text-sm text-muted-foreground">{t("Order Number", "Sipariş Numarası")}</p>
                      <p className="text-3xl font-bold text-primary">#{orderNumber}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
                    <Clock className="w-5 h-5" />
                    <span>{t("Estimated preparation: 25-35 minutes", "Tahmini hazırlık: 25-35 dakika")}</span>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate("/")}>
                      {t("Back to Home", "Ana Sayfaya Dön")}
                    </Button>
                    <Button onClick={() => navigate("/order")} className="bg-primary hover:bg-primary/90">
                      {t("Order More", "Daha Fazla Sipariş")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {step < 4 && (
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-2xl sticky top-32">
                  <h3 className="font-serif text-xl font-bold mb-4">
                    {t("Order Summary", "Sipariş Özeti")}
                  </h3>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => {
                      const modifiersTotal = item.modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
                      const itemTotal = (item.price + modifiersTotal) * item.quantity;
                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {language === "en" ? item.name : item.nameTr || item.name}
                          </span>
                          <span>₺{itemTotal.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t("Subtotal", "Ara Toplam")}</span>
                      <span>₺{getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t("Tax (8%)", "KDV (%8)")}</span>
                      <span>₺{getTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                      <span>{t("Total", "Toplam")}</span>
                      <span className="text-primary">₺{getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
