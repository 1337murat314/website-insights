import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CreditCard, Banknote, ShoppingBag, CheckCircle2, UtensilsCrossed } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type PaymentMethod = "cash_at_table" | "card_at_table";

const Checkout = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { items, tableNumber, getSubtotal, getTotal, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [formData, setFormData] = useState({
    paymentMethod: "cash_at_table" as PaymentMethod,
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

    if (!tableNumber) {
      toast.error(t("No table selected. Please scan your table QR code.", "Masa seçilmedi. Lütfen masanızdaki QR kodu tarayın."));
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: `Table ${tableNumber}`,
          customer_phone: "-",
          customer_email: null,
          order_type: "dine-in",
          payment_method: formData.paymentMethod,
          table_number: tableNumber,
          subtotal: getSubtotal(),
          tax: 0,
          total: getTotal(),
          notes: formData.notes || null,
          status: "new",
          estimated_prep_time: 20,
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
      setOrderPlaced(true);
      toast.success(t("Order placed successfully!", "Siparişiniz başarıyla alındı!"));
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(t("Failed to place order. Please try again.", "Sipariş verilemedi. Lütfen tekrar deneyin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "cash_at_table", label: t("Pay Cash at Table", "Masada Nakit Öde"), icon: Banknote },
    { id: "card_at_table", label: t("Pay Card at Table", "Masada Kart ile Öde"), icon: CreditCard },
  ];

  // Redirect if no table number
  if (!tableNumber && !orderPlaced) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-4">
              {t("No Table Selected", "Masa Seçilmedi")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("Please scan the QR code on your table to place an order.", "Sipariş vermek için lütfen masanızdaki QR kodu tarayın.")}
            </p>
            <Button onClick={() => navigate("/order")}>
              {t("Browse Menu", "Menüyü İncele")}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0 && !orderPlaced) {
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
          {/* Table Badge */}
          {tableNumber && (
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full mb-4">
              <UtensilsCrossed className="w-5 h-5" />
              <span className="font-bold text-lg">
                {t("Table", "Masa")} {tableNumber}
              </span>
            </div>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold">
            {t("Checkout", "Sipariş Tamamla")}
          </h1>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Form */}
              {!orderPlaced && (
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

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? t("Placing Order...", "Sipariş Veriliyor...") : t("Place Order", "Sipariş Ver")}
                  </Button>
                </motion.div>
              )}

              {/* Success */}
              {orderPlaced && (
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
                    {t(
                      "Your order has been sent to the kitchen!",
                      "Siparişiniz mutfağa gönderildi!"
                    )}
                  </p>
                  {orderNumber && (
                    <div className="bg-secondary p-4 rounded-xl mb-6">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("Order Number", "Sipariş Numarası")}
                      </p>
                      <p className="text-3xl font-bold text-primary">#{orderNumber}</p>
                    </div>
                  )}
                  <div className="bg-primary/10 p-4 rounded-xl mb-6">
                    <p className="text-primary font-medium">
                      {t(
                        "Track your order status in real-time below!",
                        "Sipariş durumunuzu aşağıdan anlık takip edin!"
                      )}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate(`/order-tracking?order=${orderNumber}`)} 
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {t("Track Order Status", "Sipariş Durumunu Takip Et")}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/order")} 
                      className="w-full"
                    >
                      {t("Order More", "Daha Fazla Sipariş Ver")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            {!orderPlaced && (
              <div className="lg:col-span-1">
                <div className="bg-card p-6 rounded-2xl sticky top-32">
                  <h3 className="font-serif text-xl font-bold mb-4">
                    {t("Order Summary", "Sipariş Özeti")}
                  </h3>
                  
                  {/* Table Info */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    <span className="font-medium">{t("Table", "Masa")} {tableNumber}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {language === "en" ? item.name : item.nameTr || item.name}
                        </span>
                        <span className="font-medium">
                          ₺{((item.price + item.modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold">
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
