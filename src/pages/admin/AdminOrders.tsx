import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay, endOfDay, subDays, isToday, isSameDay } from "date-fns";
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
  Search,
  RefreshCw,
  Eye,
  Volume2,
  VolumeX,
  Calendar,
  TrendingUp,
  Trash2,
  History,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Ban,
  AlertCircle,
  MoreVertical,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/notificationSound";
import { logOrderStatusChanged, logOrderDeleted } from "@/lib/auditLogger";

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
  preparing: { label: "Preparing", labelTr: "Hazırlanıyor", color: "bg-amber-500", icon: ChefHat },
  ready: { label: "Ready", labelTr: "Hazır", color: "bg-green-500", icon: Package },
  served: { label: "Served", labelTr: "Servis Edildi", color: "bg-teal-500", icon: CheckCircle2 },
  completed: { label: "Completed", labelTr: "Tamamlandı", color: "bg-gray-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", labelTr: "İptal Edildi", color: "bg-red-500", icon: XCircle },
  customer_cancelled: { label: "Customer Cancelled", labelTr: "Müşteri İptali", color: "bg-red-400", icon: Ban },
  kitchen_cancelled: { label: "Kitchen Cancelled", labelTr: "Mutfak İptali", color: "bg-orange-500", icon: AlertCircle },
  out_of_stock: { label: "Out of Stock", labelTr: "Stokta Yok", color: "bg-yellow-600", icon: AlertTriangle },
  refunded: { label: "Refunded", labelTr: "İade Edildi", color: "bg-purple-500", icon: RotateCcw },
  modified: { label: "Modified", labelTr: "Değiştirildi", color: "bg-cyan-500", icon: Edit3 },
};

const defaultStatusConfig = { label: "Unknown", labelTr: "Bilinmiyor", color: "bg-gray-400", icon: AlertCircle };

const getStatusConfig = (status: string) => statusConfig[status] || defaultStatusConfig;

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
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("today");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearingOrders, setClearingOrders] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("orderSoundEnabled");
    return saved !== "false";
  });
  
  // Order action dialog state
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionOrder, setActionOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<string>("");
  const [actionNote, setActionNote] = useState("");
  const [processingAction, setProcessingAction] = useState(false);

  const openActionDialog = (order: Order, action: string) => {
    setActionOrder(order);
    setActionType(action);
    setActionNote("");
    setShowActionDialog(true);
  };

  const handleOrderAction = async () => {
    if (!actionOrder || !actionType) return;
    
    setProcessingAction(true);
    try {
      const notePrefix = actionNote 
        ? `[${statusConfig[actionType]?.label || actionType}] ${actionNote}` 
        : `[${statusConfig[actionType]?.label || actionType}]`;
      
      const existingNotes = actionOrder.notes || "";
      const newNotes = existingNotes 
        ? `${notePrefix}\n---\n${existingNotes}` 
        : notePrefix;

      const oldStatus = actionOrder.status;

      const { error } = await supabase
        .from("orders")
        .update({ 
          status: actionType,
          notes: newNotes
        })
        .eq("id", actionOrder.id);

      if (error) throw error;

      // Log status change to audit
      await logOrderStatusChanged(
        actionOrder.id, 
        oldStatus, 
        actionType, 
        actionOrder.order_number, 
        actionOrder.table_number
      );
      
      toast.success(t("Order updated successfully", "Sipariş başarıyla güncellendi"));
      setShowActionDialog(false);
      setActionOrder(null);
      setActionType("");
      setActionNote("");
      
      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === actionOrder.id 
          ? { ...o, status: actionType, notes: newNotes }
          : o
      ));
      
      // Also update selected order if it's open
      if (selectedOrder?.id === actionOrder.id) {
        setSelectedOrder({ ...selectedOrder, status: actionType, notes: newNotes });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("Failed to update order", "Sipariş güncellenemedi"));
    } finally {
      setProcessingAction(false);
    }
  };

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
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching orders:", fetchError);
        setError(fetchError.message);
        throw fetchError;
      }
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err?.message || "Unknown error");
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
    const order = orders.find(o => o.id === orderId);
    const oldStatus = order?.status || '';
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Log status change to audit
      await logOrderStatusChanged(orderId, oldStatus, newStatus, order?.order_number, order?.table_number);

      toast.success(t("Order status updated", "Sipariş durumu güncellendi"));
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(t("Failed to update order", "Sipariş güncellenemedi"));
    }
  };

  const clearOrdersForDate = async (date: Date) => {
    setClearingOrders(true);
    try {
      const start = startOfDay(date).toISOString();
      const end = endOfDay(date).toISOString();
      
      // First get order IDs for this date
      const { data: ordersToDelete, error: fetchError } = await supabase
        .from("orders")
        .select("id, order_number, table_number")
        .gte("created_at", start)
        .lte("created_at", end);
      
      if (fetchError) throw fetchError;
      
      if (ordersToDelete && ordersToDelete.length > 0) {
        const orderIds = ordersToDelete.map(o => o.id);
        
        // Delete order items first
        const { error: itemsError } = await supabase
          .from("order_items")
          .delete()
          .in("order_id", orderIds);
        
        if (itemsError) throw itemsError;
        
        // Then delete orders
        const { error: ordersError } = await supabase
          .from("orders")
          .delete()
          .in("id", orderIds);
        
        if (ordersError) throw ordersError;

        // Log each deletion to audit
        for (const order of ordersToDelete) {
          await logOrderDeleted(order.id, order.order_number, order.table_number);
        }
        
        // Update local state
        setOrders(prev => prev.filter(o => !orderIds.includes(o.id)));
        toast.success(t(`Cleared ${ordersToDelete.length} orders`, `${ordersToDelete.length} sipariş silindi`));
      } else {
        toast.info(t("No orders to clear for this date", "Bu tarih için silinecek sipariş yok"));
      }
    } catch (error) {
      console.error("Error clearing orders:", error);
      toast.error(t("Failed to clear orders", "Siparişler silinemedi"));
    } finally {
      setClearingOrders(false);
      setShowClearDialog(false);
    }
  };

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    await fetchOrderItems(order.id);
  };

  // Get unique dates from orders for history
  const orderDates = useMemo(() => {
    const dates = new Map<string, Date>();
    orders.forEach(order => {
      const date = startOfDay(new Date(order.created_at));
      const key = date.toISOString();
      if (!dates.has(key)) {
        dates.set(key, date);
      }
    });
    return Array.from(dates.values()).sort((a, b) => b.getTime() - a.getTime());
  }, [orders]);

  // Filter orders by date and other filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      
      // Date filter based on active tab
      let dateMatch = true;
      if (activeTab === "today") {
        dateMatch = isToday(orderDate);
      } else if (activeTab === "history") {
        dateMatch = isSameDay(orderDate, selectedDate);
      }
      
      const statusMatch = statusFilter === "all" || order.status === statusFilter;
      const typeMatch = orderTypeFilter === "all" || order.order_type === orderTypeFilter;
      const searchMatch =
        !searchQuery ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_phone.includes(searchQuery) ||
        order.order_number.toString().includes(searchQuery);
      
      return dateMatch && statusMatch && typeMatch && searchMatch;
    });
  }, [orders, activeTab, selectedDate, statusFilter, orderTypeFilter, searchQuery]);

  // Calculate daily stats
  const dailyStats = useMemo(() => {
    const todayOrders = orders.filter(o => isToday(new Date(o.created_at)));
    const completedOrders = todayOrders.filter(o => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = todayOrders.length;
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    return {
      totalOrders,
      completedOrders: completedOrders.length,
      totalRevenue,
      avgOrderValue,
      pendingOrders: todayOrders.filter(o => !["completed", "cancelled"].includes(o.status)).length,
      cancelledOrders: todayOrders.filter(o => o.status === "cancelled").length,
    };
  }, [orders]);

  // Stats for selected history date
  const historyStats = useMemo(() => {
    const dateOrders = orders.filter(o => isSameDay(new Date(o.created_at), selectedDate));
    const completedOrders = dateOrders.filter(o => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    
    return {
      totalOrders: dateOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      cancelledOrders: dateOrders.filter(o => o.status === "cancelled").length,
    };
  }, [orders, selectedDate]);

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      new: "accepted",
      accepted: "in_progress",
      in_progress: "ready",
      ready: "completed",
    };
    return flow[currentStatus] || null;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("Loading orders...", "Siparişler yükleniyor...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">{t("Error loading orders", "Siparişler yüklenirken hata oluştu")}</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {t("Try Again", "Tekrar Dene")}
          </Button>
        </div>
      </div>
    );
  }

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
          </Button>
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs for Today / History */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="today" className="gap-2">
            <Bell className="w-4 h-4" />
            {t("Today", "Bugün")}
            {dailyStats.pendingOrders > 0 && (
              <Badge variant="destructive" className="ml-1">{dailyStats.pendingOrders}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            {t("History", "Geçmiş")}
          </TabsTrigger>
        </TabsList>

        {/* Today Tab */}
        <TabsContent value="today" className="space-y-6 mt-6">
          {/* Daily Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t("Total Orders", "Toplam Sipariş")}</span>
              </div>
              <p className="text-3xl font-bold">{dailyStats.totalOrders}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">{t("Completed", "Tamamlanan")}</span>
              </div>
              <p className="text-3xl font-bold">{dailyStats.completedOrders}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t("Revenue", "Gelir")}</span>
              </div>
              <p className="text-3xl font-bold text-primary">₺{dailyStats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">{t("Avg Order", "Ort. Sipariş")}</span>
              </div>
              <p className="text-3xl font-bold">₺{dailyStats.avgOrderValue.toFixed(0)}</p>
            </div>
          </div>

          {/* Clear Today Button */}
          {dailyStats.totalOrders > 0 && dailyStats.pendingOrders === 0 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowClearDialog(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
                {t("Clear Today's Orders", "Bugünün Siparişlerini Sil")}
              </Button>
            </div>
          )}

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
          </div>

          {/* Status Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = filteredOrders.filter((o) => o.status === key).length;
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

          {/* Orders Grid - Compact View with All Info */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => {
                  const status = getStatusConfig(order.status);
                  const OrderTypeIcon = orderTypeIcons[order.order_type] || Package;
                  const PaymentIcon = paymentIcons[order.payment_method] || CreditCard;
                  const nextStatus = getNextStatus(order.status);
                  const items = orderItems[order.id] || [];

                  // Fetch items if not loaded
                  if (!orderItems[order.id]) {
                    fetchOrderItems(order.id);
                  }

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card rounded-xl border border-border hover:border-primary/50 transition-colors overflow-hidden"
                    >
                      {/* Compact Header */}
                      <div className={`px-3 py-2 flex items-center justify-between ${status.color}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">#{order.order_number}</span>
                          {order.table_number && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                              {t("T", "M")}{order.table_number}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <OrderTypeIcon className="w-3.5 h-3.5 text-white/80" />
                          <PaymentIcon className="w-3.5 h-3.5 text-white/80" />
                          <span className="text-white/80 text-xs ml-1">
                            {format(new Date(order.created_at), "HH:mm")}
                          </span>
                        </div>
                      </div>

                      {/* Order Items - Compact List */}
                      <div className="px-3 py-2 max-h-32 overflow-y-auto border-b border-border/50">
                        {items.length === 0 ? (
                          <div className="text-xs text-muted-foreground animate-pulse">{t("Loading...", "Yükleniyor...")}</div>
                        ) : (
                          <div className="space-y-1">
                            {items.map((item) => (
                              <div key={item.id} className="flex items-start justify-between text-sm">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-primary">{item.quantity}x</span>{" "}
                                  <span className="truncate">
                                    {language === "en" ? item.item_name : item.item_name_tr || item.item_name}
                                  </span>
                                  {item.modifiers?.length > 0 && (
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({item.modifiers.map((m: any) => language === "en" ? m.name : m.nameTr || m.name).join(", ")})
                                    </span>
                                  )}
                                  {item.special_instructions && (
                                    <p className="text-xs text-amber-500 truncate">⚠️ {item.special_instructions}</p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground ml-1">₺{item.total_price.toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes if any */}
                      {order.notes && (
                        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-border/50">
                          <p className="text-xs text-amber-600 truncate">📝 {order.notes}</p>
                        </div>
                      )}

                      {/* Footer with Total and Actions */}
                      <div className="px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-lg font-bold text-primary">₺{order.total.toFixed(0)}</span>
                        <div className="flex gap-1">
                          {nextStatus && (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                            >
                              {language === "en"
                                ? statusConfig[nextStatus]?.label || nextStatus
                                : statusConfig[nextStatus]?.labelTr || nextStatus}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openOrderDetail(order)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {t("Full Details", "Tüm Detaylar")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openActionDialog(order, "customer_cancelled")}>
                                <Ban className="w-4 h-4 mr-2 text-red-400" />
                                {t("Customer Cancel", "Müşteri İptal")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openActionDialog(order, "kitchen_cancelled")}>
                                <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                                {t("Kitchen Cancel", "Mutfak İptal")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openActionDialog(order, "out_of_stock")}>
                                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                                {t("Out of Stock", "Stokta Yok")}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openActionDialog(order, "refunded")}>
                                <RotateCcw className="w-4 h-4 mr-2 text-purple-500" />
                                {t("Refund", "İade")}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openActionDialog(order, "cancelled")}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t("Cancel", "İptal Et")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          {/* Date Selector */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium">{t("Select Date", "Tarih Seçin")}:</span>
            </div>
            <Select 
              value={selectedDate.toISOString()} 
              onValueChange={(val) => setSelectedDate(new Date(val))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("Select date", "Tarih seçin")} />
              </SelectTrigger>
              <SelectContent>
                {orderDates.filter(d => !isToday(d)).slice(0, 30).map((date) => (
                  <SelectItem key={date.toISOString()} value={date.toISOString()}>
                    {format(date, "EEEE, MMM d, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {historyStats.totalOrders > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                {t("Clear This Day", "Bu Günü Sil")}
              </Button>
            )}
          </div>

          {/* History Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t("Orders", "Siparişler")}</span>
              </div>
              <p className="text-3xl font-bold">{historyStats.totalOrders}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-muted-foreground">{t("Completed", "Tamamlanan")}</span>
              </div>
              <p className="text-3xl font-bold">{historyStats.completedOrders}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t("Revenue", "Gelir")}</span>
              </div>
              <p className="text-3xl font-bold text-primary">₺{historyStats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-muted-foreground">{t("Cancelled", "İptal")}</span>
              </div>
              <p className="text-3xl font-bold">{historyStats.cancelledOrders}</p>
            </div>
          </div>

          {/* History Orders Grid */}
          {filteredOrders.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const status = getStatusConfig(order.status);
                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl p-5 border border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => openOrderDetail(order)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold">#{order.order_number}</span>
                        <Badge className={`${status.color} text-white ml-2`}>
                          {language === "en" ? status.label : status.labelTr}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "HH:mm")}
                      </span>
                    </div>
                    {order.table_number && (
                      <p className="text-primary font-medium mb-2">
                        {t("Table", "Masa")} {order.table_number}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">{t("Total", "Toplam")}</span>
                      <span className="text-lg font-bold text-primary">₺{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t("No orders for this date", "Bu tarih için sipariş yok")}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Clear Orders Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t("Clear Orders", "Siparişleri Sil")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `Are you sure you want to delete all orders from ${format(selectedDate, "MMMM d, yyyy")}? This action cannot be undone.`,
                `${format(selectedDate, "d MMMM yyyy")} tarihindeki tüm siparişleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingOrders}>
              {t("Cancel", "İptal")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearOrdersForDate(selectedDate)}
              disabled={clearingOrders}
              className="bg-destructive hover:bg-destructive/90"
            >
              {clearingOrders ? t("Deleting...", "Siliniyor...") : t("Delete All", "Tümünü Sil")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <span className="text-2xl font-bold">#{selectedOrder.order_number}</span>
                  <Badge className={`${getStatusConfig(selectedOrder.status).color} text-white`}>
                    {language === "en"
                      ? getStatusConfig(selectedOrder.status).label
                      : getStatusConfig(selectedOrder.status).labelTr}
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

                {/* Status Actions - Progress Flow */}
                <div className="pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">{t("Order Progress", "Sipariş İlerlemesi")}</p>
                    <div className="flex flex-wrap gap-2">
                      {["new", "accepted", "in_progress", "ready", "completed"].map((key) => {
                        const config = statusConfig[key];
                        const StatusIcon = config.icon;
                        return (
                          <Button
                            key={key}
                            variant={selectedOrder.status === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateOrderStatus(selectedOrder.id, key)}
                            className={selectedOrder.status === key ? config.color : ""}
                          >
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {language === "en" ? config.label : config.labelTr}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Cancel/Issue Actions */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t("Cancel / Issues", "İptal / Sorunlar")}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(selectedOrder, "customer_cancelled")}
                        className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        {t("Customer Cancelled", "Müşteri İptali")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(selectedOrder, "kitchen_cancelled")}
                        className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      >
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {t("Kitchen Cancelled", "Mutfak İptali")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(selectedOrder, "out_of_stock")}
                        className="border-yellow-600/50 text-yellow-600 hover:bg-yellow-600/10"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {t("Out of Stock", "Stokta Yok")}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Modify/Refund Actions */}
                  <div>
                    <p className="text-sm font-medium mb-2">{t("Modify / Refund", "Değiştir / İade")}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(selectedOrder, "modified")}
                        className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        {t("Order Modified", "Sipariş Değiştirildi")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(selectedOrder, "refunded")}
                        className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {t("Refund / Return", "İade")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType && statusConfig[actionType] && (
                <>
                  {(() => {
                    const ActionIcon = statusConfig[actionType].icon;
                    return <ActionIcon className={`w-5 h-5 ${statusConfig[actionType].color.replace("bg-", "text-")}`} />;
                  })()}
                  {language === "en" ? statusConfig[actionType].label : statusConfig[actionType].labelTr}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionOrder && (
                <>
                  {t("Order", "Sipariş")} #{actionOrder.order_number} - {t("Table", "Masa")} {actionOrder.table_number || "N/A"}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("Reason / Notes (Optional)", "Sebep / Notlar (İsteğe Bağlı)")}</Label>
              <Textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={t("Add notes about this action...", "Bu işlem hakkında not ekleyin...")}
                rows={3}
              />
            </div>
            
            {actionType === "refunded" && (
              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                <p className="text-sm text-purple-400">
                  {t(
                    "Note: This will mark the order as refunded. Process the actual refund through your payment system.",
                    "Not: Bu işlem siparişi iade olarak işaretleyecektir. Gerçek iadeyi ödeme sisteminizden yapın."
                  )}
                </p>
              </div>
            )}
            
            {(actionType === "customer_cancelled" || actionType === "kitchen_cancelled" || actionType === "cancelled") && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <p className="text-sm text-red-400">
                  {t(
                    "This will cancel the order. The customer will see the order as cancelled.",
                    "Bu işlem siparişi iptal edecektir. Müşteri siparişin iptal edildiğini görecektir."
                  )}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)} disabled={processingAction}>
              {t("Cancel", "İptal")}
            </Button>
            <Button 
              onClick={handleOrderAction} 
              disabled={processingAction}
              className={actionType && statusConfig[actionType] ? statusConfig[actionType].color : ""}
            >
              {processingAction ? t("Processing...", "İşleniyor...") : t("Confirm", "Onayla")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
