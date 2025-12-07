import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  ChefHat,
  Clock,
  Maximize,
  Minimize,
  Package,
  RefreshCw,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/notificationSound";

interface OrderItem {
  id: string;
  item_name: string;
  item_name_tr: string | null;
  quantity: number;
  modifiers: { name: string; nameTr?: string; priceAdjustment: number }[];
  special_instructions: string | null;
}

interface Order {
  id: string;
  order_number: number;
  table_number: string | null;
  status: string;
  created_at: string;
  notes: string | null;
}

const statusFlow = ["new", "accepted", "in_progress", "ready"];

const statusConfig: Record<string, { label: string; labelTr: string; color: string; bgColor: string }> = {
  new: { label: "NEW", labelTr: "YENİ", color: "text-blue-500", bgColor: "bg-blue-500/20 border-blue-500" },
  accepted: { label: "ACCEPTED", labelTr: "KABUL", color: "text-indigo-500", bgColor: "bg-indigo-500/20 border-indigo-500" },
  in_progress: { label: "COOKING", labelTr: "PİŞİRİLİYOR", color: "text-amber-500", bgColor: "bg-amber-500/20 border-amber-500" },
  ready: { label: "READY", labelTr: "HAZIR", color: "text-green-500", bgColor: "bg-green-500/20 border-green-500" },
};

const AdminKDS = () => {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("kdsSoundEnabled");
    return saved !== "false";
  });

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("kdsSoundEnabled", String(newValue));
    if (newValue) {
      playNotificationSound();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("kds-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            fetchOrderItemsForOrder(newOrder.id);
            if (soundEnabled) {
              playNotificationSound();
            }
            toast.success(
              t(`New Order: Table ${newOrder.table_number || 'N/A'}`, `Yeni Sipariş: Masa ${newOrder.table_number || 'N/A'}`),
              { duration: 5000 }
            );
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o))
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["new", "accepted", "in_progress", "ready"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setOrders(data || []);

      // Fetch items for all orders
      for (const order of data || []) {
        fetchOrderItemsForOrder(order.id);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItemsForOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      const items: OrderItem[] = (data || []).map((item) => ({
        ...item,
        modifiers: (item.modifiers as unknown as OrderItem["modifiers"]) || [],
      }));
      setOrderItems((prev) => ({ ...prev, [orderId]: items }));
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("Failed to update order", "Sipariş güncellenemedi"));
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return "completed";
  };

  const getTimeSinceOrder = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("Just now", "Şimdi");
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getTimeColor = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 10) return "text-green-500";
    if (minutes < 20) return "text-amber-500";
    return "text-red-500";
  };

  // Group orders by status
  const ordersByStatus = statusFlow.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status);
    return acc;
  }, {} as Record<string, Order[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChefHat className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{t("Kitchen Display", "Mutfak Ekranı")}</h1>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {orders.length} {t("Active Orders", "Aktif Sipariş")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleSound}
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button onClick={fetchOrders} variant="outline" size="sm">
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Grid - Kanban Style */}
      <div className="grid grid-cols-4 gap-4 p-4 h-[calc(100vh-80px)] overflow-hidden">
        {statusFlow.map((status) => {
          const config = statusConfig[status];
          const statusOrders = ordersByStatus[status];

          return (
            <div key={status} className="flex flex-col h-full">
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl border-2 ${config.bgColor} flex items-center justify-between`}>
                <span className={`font-bold text-lg ${config.color}`}>
                  {language === "en" ? config.label : config.labelTr}
                </span>
                <Badge variant="secondary" className="text-lg">
                  {statusOrders.length}
                </Badge>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto bg-card/50 rounded-b-xl border border-t-0 border-border p-2 space-y-3">
                <AnimatePresence mode="popLayout">
                  {statusOrders.map((order) => {
                    const items = orderItems[order.id] || [];
                    const nextStatus = getNextStatus(order.status);

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`bg-card rounded-xl border-2 ${config.bgColor} overflow-hidden`}
                      >
                        {/* Order Header */}
                        <div className="p-3 border-b border-border flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold">#{order.order_number}</span>
                            {order.table_number && (
                              <Badge className="text-lg px-3 py-1 bg-primary">
                                {t("Table", "Masa")} {order.table_number}
                              </Badge>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 ${getTimeColor(order.created_at)}`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-lg">{getTimeSinceOrder(order.created_at)}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-3 space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-start gap-2">
                              <span className="text-xl font-bold text-primary min-w-[2rem]">
                                {item.quantity}x
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-lg">
                                  {language === "en" ? item.item_name : item.item_name_tr || item.item_name}
                                </p>
                                {item.modifiers.length > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.modifiers.map((m) => 
                                      language === "en" ? m.name : m.nameTr || m.name
                                    ).join(", ")}
                                  </p>
                                )}
                                {item.special_instructions && (
                                  <p className="text-sm text-amber-500 font-medium mt-1">
                                    ⚠️ {item.special_instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                          <div className="px-3 pb-2">
                            <p className="text-sm text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                              📝 {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="p-3 pt-0">
                          {nextStatus && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="w-full h-14 text-lg font-bold"
                              variant={nextStatus === "completed" ? "secondary" : "default"}
                            >
                              {nextStatus === "accepted" && (
                                <>
                                  <CheckCircle2 className="w-6 h-6 mr-2" />
                                  {t("ACCEPT", "KABUL ET")}
                                </>
                              )}
                              {nextStatus === "in_progress" && (
                                <>
                                  <ChefHat className="w-6 h-6 mr-2" />
                                  {t("START COOKING", "PİŞİRMEYE BAŞLA")}
                                </>
                              )}
                              {nextStatus === "ready" && (
                                <>
                                  <Package className="w-6 h-6 mr-2" />
                                  {t("READY", "HAZIR")}
                                </>
                              )}
                              {nextStatus === "completed" && (
                                <>
                                  <CheckCircle2 className="w-6 h-6 mr-2" />
                                  {t("SERVED", "SERVİS EDİLDİ")}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {statusOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">{t("No orders", "Sipariş yok")}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminKDS;
