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
  RefreshCw,
  HandMetal,
  Receipt,
  Loader2
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: number;
  status: string;
  table_number: string | null;
  total: number;
  created_at: string;
  customer_name: string;
  branch_id: string | null;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_name_tr: string | null;
  quantity: number;
  total_price: number;
}

interface ServiceRequest {
  id: string;
  request_type: string;
  status: string;
  created_at: string;
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
    key: "preparing", 
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
    key: "served", 
    label: "Served", 
    labelTr: "Servis Edildi",
    description: "Enjoy your meal!",
    descriptionTr: "Afiyet olsun!",
    icon: UtensilsCrossed 
  },
];

const OrderTracking = () => {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = searchParams.get("table");
  const verificationCode = searchParams.get("code");
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const fetchTableOrders = async () => {
    if (!tableNumber || !verificationCode) {
      setError("Invalid order access");
      setLoading(false);
      return;
    }

    try {
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch orders using verification code for secure access
      // First get the order that matches the verification code
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("table_number", tableNumber)
        .eq("verification_code", verificationCode.toUpperCase())
        .gte("created_at", today.toISOString())
        .not("status", "in", '("completed","cancelled")')
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(ordersData);

      // Fetch order items for all orders
      const itemsMap: Record<string, OrderItem[]> = {};
      for (const order of ordersData) {
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        itemsMap[order.id] = itemsData || [];
      }
      setOrderItems(itemsMap);

      // Fetch pending service requests for this table
      const { data: requestsData } = await supabase
        .from("service_requests")
        .select("*")
        .eq("table_number", tableNumber)
        .eq("status", "pending")
        .gte("created_at", today.toISOString());
      
      setServiceRequests(requestsData || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableOrders();

    // Subscribe to realtime updates - only if we have valid verification
    if (tableNumber && verificationCode) {
      const ordersChannel = supabase
        .channel(`table-orders-${tableNumber}-${verificationCode}`)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "orders",
            filter: `table_number=eq.${tableNumber}`
          },
          () => {
            fetchTableOrders();
          }
        )
        .subscribe();

      const requestsChannel = supabase
        .channel(`table-requests-${tableNumber}-${verificationCode}`)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "service_requests",
            filter: `table_number=eq.${tableNumber}`
          },
          () => {
            fetchTableOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(requestsChannel);
      };
    }
  }, [tableNumber, verificationCode]);

  const sendServiceRequest = async (requestType: "call_waiter" | "request_bill") => {
    if (!tableNumber) return;

    // Check if there's already a pending request of this type
    const existingRequest = serviceRequests.find(r => r.request_type === requestType);
    if (existingRequest) {
      toast.info(
        requestType === "call_waiter" 
          ? t("Waiter has already been called", "Garson zaten çağrıldı")
          : t("Bill has already been requested", "Hesap zaten istendi")
      );
      return;
    }

    setSendingRequest(requestType);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert({
          table_number: tableNumber,
          request_type: requestType,
          order_id: orders[0]?.id || null,
          branch_id: orders[0]?.branch_id || null,
        });

      if (error) {
        console.error("Service request error:", error);
        throw error;
      }

      toast.success(
        requestType === "call_waiter"
          ? t("Waiter has been called!", "Garson çağrıldı!")
          : t("Bill has been requested!", "Hesap istendi!")
      );
      
      fetchTableOrders();
    } catch (err: any) {
      console.error("Error sending request:", err);
      toast.error(t("Failed to send request", "İstek gönderilemedi") + (err?.message ? `: ${err.message}` : ""));
    } finally {
      setSendingRequest(null);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex(step => step.key === status);
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  const hasPendingRequest = (type: string) => {
    return serviceRequests.some(r => r.request_type === type);
  };

  if (loading) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </section>
      </Layout>
    );
  }

  if (error || !tableNumber || !verificationCode) {
    return (
      <Layout>
        <section className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-4">
              {t("Invalid Order Access", "Geçersiz Sipariş Erişimi")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("Please use the link provided after placing your order.", "Lütfen siparişinizi verdikten sonra verilen bağlantıyı kullanın.")}
            </p>
            <Button onClick={() => navigate("/order")}>
              {t("Back to Menu", "Menüye Dön")}
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 bg-charcoal">
        <div className="container mx-auto container-padding relative text-center text-cream">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full mb-4"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-bold text-lg">
              {t("Table", "Masa")} {tableNumber}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl md:text-4xl font-bold"
          >
            {t("Your Orders", "Siparişleriniz")}
          </motion.h1>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding max-w-3xl">
          {/* Service Request Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 mb-8"
          >
            <Button
              size="lg"
              variant={hasPendingRequest("call_waiter") ? "secondary" : "outline"}
              className={`h-20 flex flex-col gap-2 ${hasPendingRequest("call_waiter") ? "bg-yellow-500/20 border-yellow-500 text-yellow-600" : ""}`}
              onClick={() => sendServiceRequest("call_waiter")}
              disabled={sendingRequest === "call_waiter" || hasPendingRequest("call_waiter")}
            >
              {sendingRequest === "call_waiter" ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <HandMetal className="w-6 h-6" />
              )}
              <span className="font-medium">
                {hasPendingRequest("call_waiter") 
                  ? t("Waiter Called", "Garson Çağrıldı")
                  : t("Call Waiter", "Garson Çağır")}
              </span>
            </Button>
            <Button
              size="lg"
              variant={hasPendingRequest("request_bill") ? "secondary" : "outline"}
              className={`h-20 flex flex-col gap-2 ${hasPendingRequest("request_bill") ? "bg-purple-500/20 border-purple-500 text-purple-600" : ""}`}
              onClick={() => sendServiceRequest("request_bill")}
              disabled={sendingRequest === "request_bill" || hasPendingRequest("request_bill")}
            >
              {sendingRequest === "request_bill" ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Receipt className="w-6 h-6" />
              )}
              <span className="font-medium">
                {hasPendingRequest("request_bill") 
                  ? t("Bill Requested", "Hesap İstendi")
                  : t("Request Bill", "Hesap İste")}
              </span>
            </Button>
          </motion.div>

          {/* No Orders State */}
          {orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card p-8 rounded-2xl text-center mb-8"
            >
              <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-4">
                {t("No Active Orders", "Aktif Sipariş Yok")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("You haven't placed any orders yet.", "Henüz sipariş vermediniz.")}
              </p>
              <Button onClick={() => navigate("/order")}>
                {t("Browse Menu", "Menüyü İncele")}
              </Button>
            </motion.div>
          )}

          {/* Orders List */}
          {orders.map((order, orderIndex) => {
            const currentStepIndex = getCurrentStepIndex(order.status);
            const items = orderItems[order.id] || [];
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: orderIndex * 0.1 }}
                className="bg-card p-6 rounded-2xl mb-6"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      {t("Order", "Sipariş")} #{order.order_number}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {currentStepIndex >= 0 && (() => {
                        const CurrentIcon = statusSteps[currentStepIndex].icon;
                        return (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "served" 
                              ? "bg-green-500/20 text-green-600" 
                              : order.status === "ready"
                                ? "bg-purple-500/20 text-purple-600"
                                : "bg-primary/20 text-primary"
                          }`}>
                            <CurrentIcon className="w-4 h-4" />
                            {language === "en" 
                              ? statusSteps[currentStepIndex].label 
                              : statusSteps[currentStepIndex].labelTr}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">₺{order.total.toFixed(2)}</span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground animate-pulse"
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`text-xs text-center ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {language === "en" ? step.label : step.labelTr}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Items */}
                <div className="space-y-2 pt-4 border-t border-border">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {language === "en" ? item.item_name : item.item_name_tr || item.item_name}
                      </span>
                      <span className="text-muted-foreground">₺{item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Total Summary */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 p-6 rounded-2xl mb-8"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{t("Table Total", "Masa Toplamı")}</span>
                <span className="text-2xl font-bold text-primary">₺{getTotalAmount().toFixed(2)}</span>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/order?table=${tableNumber}`)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Order More", "Daha Sipariş Ver")}
            </Button>
            <Button 
              onClick={fetchTableOrders}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("Refresh", "Yenile")}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrderTracking;
