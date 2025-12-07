import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  UtensilsCrossed, 
  Bell,
  XCircle,
  Package,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  order_number: number;
  status: string;
  table_number: string | null;
  total: number;
  created_at: string;
  customer_name: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_name_tr: string | null;
  quantity: number;
  total_price: number;
}

const statusSteps = [
  { 
    key: "new", 
    label: "Order Received", 
    labelTr: "Sipariş Alındı",
    description: "Your order has been sent to the kitchen",
    descriptionTr: "Siparişiniz mutfağa gönderildi",
    icon: Bell 
  },
  { 
    key: "accepted", 
    label: "Order Accepted", 
    labelTr: "Sipariş Kabul Edildi",
    description: "The kitchen has accepted your order",
    descriptionTr: "Mutfak siparişinizi kabul etti",
    icon: CheckCircle2 
  },
  { 
    key: "in_progress", 
    label: "Preparing", 
    labelTr: "Hazırlanıyor",
    description: "Your food is being prepared",
    descriptionTr: "Yemeğiniz hazırlanıyor",
    icon: ChefHat 
  },
  { 
    key: "ready", 
    label: "Ready to Serve", 
    labelTr: "Servise Hazır",
    description: "Your order is ready and will be served shortly",
    descriptionTr: "Siparişiniz hazır, kısa sürede servis edilecek",
    icon: Package 
  },
  { 
    key: "completed", 
    label: "Completed", 
    labelTr: "Tamamlandı",
    description: "Enjoy your meal!",
    descriptionTr: "Afiyet olsun!",
    icon: UtensilsCrossed 
  },
];

const OrderTracking = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get("order");
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderNumber) {
      setError("No order number provided");
      setLoading(false);
      return;
    }

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", parseInt(orderNumber))
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderData.id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Subscribe to realtime updates for this order
    if (orderNumber) {
      const channel = supabase
        .channel(`order-tracking-${orderNumber}`)
        .on(
          "postgres_changes",
          { 
            event: "UPDATE", 
            schema: "public", 
            table: "orders",
            filter: `order_number=eq.${orderNumber}`
          },
          (payload) => {
            console.log("Order update received:", payload);
            setOrder(payload.new as Order);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderNumber]);

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-4">
              {t("Order Not Found", "Sipariş Bulunamadı")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("Please check your order number and try again.", "Lütfen sipariş numaranızı kontrol edip tekrar deneyin.")}
            </p>
            <Button onClick={() => navigate("/order")}>
              {t("Back to Menu", "Menüye Dön")}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (order.status === "cancelled") {
    return (
      <Layout>
        <section className="py-24 bg-charcoal">
          <div className="container mx-auto container-padding text-center text-cream">
            <h1 className="font-serif text-4xl md:text-5xl font-bold">
              {t("Order Tracking", "Sipariş Takibi")}
            </h1>
          </div>
        </section>
        <section className="section-padding bg-background">
          <div className="container mx-auto container-padding max-w-2xl">
            <div className="bg-card p-8 rounded-2xl text-center">
              <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">
                {t("Order Cancelled", "Sipariş İptal Edildi")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("This order has been cancelled.", "Bu sipariş iptal edildi.")}
              </p>
              <Button onClick={() => navigate("/order")}>
                {t("Place New Order", "Yeni Sipariş Ver")}
              </Button>
            </div>
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary uppercase tracking-widest mb-4"
          >
            {t("Order", "Sipariş")} #{order.order_number}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl font-bold"
          >
            {t("Track Your Order", "Siparişinizi Takip Edin")}
          </motion.h1>
          {order.table_number && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full mt-6"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="font-bold text-lg">
                {t("Table", "Masa")} {order.table_number}
              </span>
            </motion.div>
          )}
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding max-w-3xl">
          {/* Current Status Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-8 rounded-2xl mb-8 text-center"
          >
            {currentStepIndex >= 0 && (
              <>
                {(() => {
                  const CurrentIcon = statusSteps[currentStepIndex].icon;
                  return (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                      order.status === "completed" ? "bg-green-500/20" : "bg-primary/20"
                    }`}>
                      <CurrentIcon className={`w-10 h-10 ${
                        order.status === "completed" ? "text-green-500" : "text-primary"
                      }`} />
                    </div>
                  );
                })()}
                <h2 className="font-serif text-3xl font-bold mb-4">
                  {language === "en" 
                    ? statusSteps[currentStepIndex].label 
                    : statusSteps[currentStepIndex].labelTr}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === "en" 
                    ? statusSteps[currentStepIndex].description 
                    : statusSteps[currentStepIndex].descriptionTr}
                </p>
              </>
            )}
          </motion.div>

          {/* Progress Steps */}
          <div className="bg-card p-8 rounded-2xl mb-8">
            <h3 className="font-serif text-xl font-bold mb-6 text-center">
              {t("Order Progress", "Sipariş Durumu")}
            </h3>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const StepIcon = step.icon;
                  
                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative flex items-start gap-4 pl-16 ${
                        isCompleted ? "" : "opacity-40"
                      }`}
                    >
                      {/* Icon Circle */}
                      <div
                        className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-primary text-primary-foreground animate-pulse"
                            : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="pt-2">
                        <h4 className={`font-semibold ${isCurrent ? "text-primary" : ""}`}>
                          {language === "en" ? step.label : step.labelTr}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? step.description : step.descriptionTr}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card p-6 rounded-2xl mb-8">
            <h3 className="font-serif text-xl font-bold mb-4">
              {t("Order Items", "Sipariş Ürünleri")}
            </h3>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium">
                      {item.quantity}x {language === "en" ? item.item_name : item.item_name_tr || item.item_name}
                    </span>
                  </div>
                  <span className="text-primary font-bold">₺{item.total_price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="font-bold text-lg">{t("Total", "Toplam")}</span>
                <span className="text-primary font-bold text-xl">₺{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/order")}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Order More", "Daha Sipariş Ver")}
            </Button>
            <Button 
              onClick={fetchOrder}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("Refresh Status", "Durumu Yenile")}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderTracking;
