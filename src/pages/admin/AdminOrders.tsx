import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bell,
  Truck,
  UtensilsCrossed,
  ShoppingBag,
  CreditCard,
  Banknote,
  Filter,
  Search,
  RefreshCw,
  Eye,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/notificationSound";

interface OrderItem {
  id: string;
  item_name: string;
  item_name_tr: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers: { name: string; nameTr?: string; priceAdjustment: number }[];
  special_instructions: string | null;
}

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  order_type: string;
  payment_method: string;
  table_number: string | null;
  delivery_address: string | null;
  delivery_notes: string | null;
  pickup_time: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  status: string;
  estimated_prep_time: number | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; labelTr: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", labelTr: "Yeni", color: "bg-blue-500", icon: Bell },
  accepted: { label: "Accepted", labelTr: "Kabul Edildi", color: "bg-indigo-500", icon: CheckCircle2 },
  in_progress: { label: "In Progress", labelTr: "Hazırlanıyor", color: "bg-amber-500", icon: ChefHat },
  ready: { label: "Ready", labelTr: "Hazır", color: "bg-green-500", icon: Package },
  completed: { label: "Completed", labelTr: "Tamamlandı", color: "bg-gray-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", labelTr: "İptal Edildi", color: "bg-red-500", icon: XCircle },
};

const orderTypeIcons: Record<string, React.ElementType> = {
  "dine-in": UtensilsCrossed,
  pickup: ShoppingBag,
  delivery: Truck,
};

const paymentIcons: Record<string, React.ElementType> = {
  cash_at_table: Banknote,
  card_at_table: CreditCard,
};

const AdminOrders = () => {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("orderSoundEnabled");
    return saved !== "false";
  });

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("orderSoundEnabled", String(newValue));
    if (newValue) {
      playNotificationSound();
      toast.success(t("Sound notifications enabled", "Ses bildirimleri açıldı"));
    } else {
      toast.info(t("Sound notifications disabled", "Ses bildirimleri kapatıldı"));
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Order change received:", payload);
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order;
            setOrders((prev) => [newOrder, ...prev]);
            toast.success(
              t(
                `New order #${newOrder.order_number} from Table ${newOrder.table_number || 'N/A'}!`,
                `Yeni sipariş #${newOrder.order_number} - Masa ${newOrder.table_number || 'N/A'}!`
              ),
              { duration: 10000 }
            );
            // Play notification sound if enabled
            if (soundEnabled) {
              playNotificationSound();
            }
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("Failed to load orders", "Siparişler yüklenemedi"));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    
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
      toast.success(t("Order status updated", "Sipariş durumu güncellendi"));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("Failed to update order", "Sipariş güncellenemedi"));
    }
  };

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    await fetchOrderItems(order.id);
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === "all" || order.status === statusFilter;
    const typeMatch = orderTypeFilter === "all" || order.order_type === orderTypeFilter;
    const searchMatch =
      !searchQuery ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.order_number.toString().includes(searchQuery);
    return statusMatch && typeMatch && searchMatch;
  });

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      new: "accepted",
      accepted: "in_progress",
      in_progress: "ready",
      ready: "completed",
    };
    return flow[currentStatus] || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("Orders", "Siparişler")}</h1>
          <p className="text-muted-foreground">
            {t("Manage incoming orders in real-time", "Gelen siparişleri gerçek zamanlı yönetin")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={toggleSound} 
            variant={soundEnabled ? "default" : "outline"}
            className="gap-2"
            title={soundEnabled ? t("Sound On", "Ses Açık") : t("Sound Off", "Ses Kapalı")}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? t("Sound On", "Ses Açık") : t("Sound Off", "Ses Kapalı")}
          </Button>
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("Refresh", "Yenile")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("Search by name, phone, order #...", "İsim, telefon, sipariş no ile ara...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("All Statuses", "Tüm Durumlar")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Statuses", "Tüm Durumlar")}</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {language === "en" ? config.label : config.labelTr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("All Types", "Tüm Tipler")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types", "Tüm Tipler")}</SelectItem>
            <SelectItem value="dine-in">{t("Dine In", "Restoranda")}</SelectItem>
            <SelectItem value="pickup">{t("Pickup", "Gel Al")}</SelectItem>
            <SelectItem value="delivery">{t("Delivery", "Teslimat")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter((o) => o.status === key).length;
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl ${config.color}/10 border border-${config.color}/20 cursor-pointer`}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
            >
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={`w-5 h-5 ${config.color.replace("bg-", "text-")}`} />
                <span className="text-sm font-medium">
                  {language === "en" ? config.label : config.labelTr}
                </span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const OrderTypeIcon = orderTypeIcons[order.order_type] || Package;
              const PaymentIcon = paymentIcons[order.payment_method] || CreditCard;
              const nextStatus = getNextStatus(order.status);

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold">#{order.order_number}</span>
                        <Badge className={`${status.color} text-white`}>
                          {language === "en" ? status.label : status.labelTr}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "MMM d, HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <div className="p-2 rounded-lg bg-muted" title={order.order_type}>
                        <OrderTypeIcon className="w-4 h-4" />
                      </div>
                      <div className="p-2 rounded-lg bg-muted" title={order.payment_method}>
                        <PaymentIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mb-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    {order.table_number && (
                      <p className="text-sm text-primary mt-1">
                        {t("Table", "Masa")}: {order.table_number}
                      </p>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Total", "Toplam")}</span>
                    <span className="text-xl font-bold text-primary">₺{order.total.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openOrderDetail(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t("Details", "Detay")}
                    </Button>
                    {nextStatus && (
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                      >
                        {language === "en"
                          ? statusConfig[nextStatus].label
                          : statusConfig[nextStatus].labelTr}
                      </Button>
                    )}
                    {order.status === "new" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, "cancelled")}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {t("No orders found", "Sipariş bulunamadı")}
          </p>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <span className="text-2xl font-bold">#{selectedOrder.order_number}</span>
                  <Badge className={`${statusConfig[selectedOrder.status].color} text-white`}>
                    {language === "en"
                      ? statusConfig[selectedOrder.status].label
                      : statusConfig[selectedOrder.status].labelTr}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("Customer", "Müşteri")}</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                    {selectedOrder.customer_email && (
                      <p className="text-sm">{selectedOrder.customer_email}</p>
                    )}
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("Order Details", "Sipariş Detayları")}</p>
                    <p className="font-medium capitalize">{selectedOrder.order_type.replace("-", " ")}</p>
                    <p className="text-sm capitalize">{selectedOrder.payment_method.replace(/_/g, " ")}</p>
                    {selectedOrder.table_number && (
                      <p className="text-sm text-primary">{t("Table", "Masa")}: {selectedOrder.table_number}</p>
                    )}
                  </div>
                </div>

                {/* Delivery/Pickup Info */}
                {selectedOrder.delivery_address && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">{t("Delivery Address", "Teslimat Adresi")}</p>
                    <p>{selectedOrder.delivery_address}</p>
                    {selectedOrder.delivery_notes && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.delivery_notes}</p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <p className="font-medium mb-3">{t("Items", "Ürünler")}</p>
                  <div className="space-y-3">
                    {orderItems[selectedOrder.id]?.map((item) => (
                      <div key={item.id} className="flex justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {language === "en" ? item.item_name : item.item_name_tr || item.item_name}
                          </p>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {item.modifiers.map((m) => m.name).join(", ")}
                            </p>
                          )}
                          {item.special_instructions && (
                            <p className="text-xs text-primary italic mt-1">"{item.special_instructions}"</p>
                          )}
                        </div>
                        <span className="font-medium">₺{item.total_price.toFixed(2)}</span>
                      </div>
                    )) || (
                      <div className="text-center py-4 text-muted-foreground">
                        {t("Loading items...", "Ürünler yükleniyor...")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">{t("Order Notes", "Sipariş Notları")}</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Subtotal", "Ara Toplam")}</span>
                    <span>₺{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t("Tax", "KDV")}</span>
                    <span>₺{selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>{t("Total", "Toplam")}</span>
                    <span className="text-primary">₺{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 pt-4">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedOrder.status === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateOrderStatus(selectedOrder.id, key)}
                      className={selectedOrder.status === key ? config.color : ""}
                    >
                      {language === "en" ? config.label : config.labelTr}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
