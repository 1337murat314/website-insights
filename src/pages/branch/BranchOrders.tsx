import { useState, useEffect, useMemo } from "react";
import { format, isToday } from "date-fns";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Package, Clock, CheckCircle2, XCircle, ChefHat, Bell, Search, RefreshCw, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  table_number: string | null;
  total: number;
  status: string;
  created_at: string;
  notes: string | null;
}

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
}

const statusConfig: Record<string, { label: string; labelTr: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", labelTr: "Yeni", color: "bg-blue-500", icon: Bell },
  accepted: { label: "Accepted", labelTr: "Kabul Edildi", color: "bg-indigo-500", icon: CheckCircle2 },
  in_progress: { label: "In Progress", labelTr: "Hazırlanıyor", color: "bg-amber-500", icon: ChefHat },
  ready: { label: "Ready", labelTr: "Hazır", color: "bg-green-500", icon: Package },
  completed: { label: "Completed", labelTr: "Tamamlandı", color: "bg-gray-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", labelTr: "İptal Edildi", color: "bg-red-500", icon: XCircle },
};

const BranchOrders = () => {
  const { branch } = useBranch();
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (!branch) return;
    fetchOrders();

    const channel = supabase
      .channel(`branch-orders-${branch.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `branch_id=eq.${branch.id}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as Order, ...prev]);
          toast.success(t(`New order #${(payload.new as Order).order_number}!`, `Yeni sipariş #${(payload.new as Order).order_number}!`));
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o)));
        } else if (payload.eventType === "DELETE") {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [branch]);

  const fetchOrders = async () => {
    if (!branch) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("branch_id", branch.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("Failed to load orders", "Siparişler yüklenemedi"));
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data }));
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) {
      toast.error(t("Failed to update order", "Sipariş güncellenemedi"));
    } else {
      toast.success(t("Order status updated", "Sipariş durumu güncellendi"));
    }
  };

  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    await fetchOrderItems(order.id);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === "all" || order.status === statusFilter;
      const searchMatch = !searchQuery || 
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.order_number.toString().includes(searchQuery);
      return statusMatch && searchMatch && isToday(new Date(order.created_at));
    });
  }, [orders, statusFilter, searchQuery]);

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = { new: "accepted", accepted: "in_progress", in_progress: "ready", ready: "completed" };
    return flow[status] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branch && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">{branch.name}</span>
            <Badge variant="secondary">{t("Branch Orders", "Şube Siparişleri")}</Badge>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("Search orders...", "Sipariş ara...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Statuses", "Tüm Durumlar")}</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{language === "tr" ? config.labelTr : config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchOrders}><RefreshCw className="h-4 w-4 mr-2" />{t("Refresh", "Yenile")}</Button>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.new;
          const StatusIcon = config.icon;
          const nextStatus = getNextStatus(order.status);

          return (
            <Card key={order.id} className="overflow-hidden">
              <div className={`h-1.5 ${config.color}`} />
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">#{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    {order.table_number && <Badge variant="outline">{t("Table", "Masa")} {order.table_number}</Badge>}
                  </div>
                  <Badge className={`${config.color} text-white`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {language === "tr" ? config.labelTr : config.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(order.created_at), "HH:mm")}</span>
                  <span className="font-medium text-foreground">₺{order.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openOrderDetail(order)}>
                    <Eye className="h-4 w-4 mr-1" />{t("View", "Görüntüle")}
                  </Button>
                  {nextStatus && (
                    <Button size="sm" className="flex-1" onClick={() => updateOrderStatus(order.id, nextStatus)}>
                      {language === "tr" ? statusConfig[nextStatus]?.labelTr : statusConfig[nextStatus]?.label}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t("No orders found", "Sipariş bulunamadı")}</p>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Order", "Sipariş")} #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">{t("Customer", "Müşteri")}:</span> {selectedOrder.customer_name}</div>
                <div><span className="text-muted-foreground">{t("Phone", "Telefon")}:</span> {selectedOrder.customer_phone}</div>
                {selectedOrder.table_number && <div><span className="text-muted-foreground">{t("Table", "Masa")}:</span> {selectedOrder.table_number}</div>}
                <div><span className="text-muted-foreground">{t("Total", "Toplam")}:</span> ₺{selectedOrder.total.toFixed(2)}</div>
              </div>
              <div className="border-t pt-3">
                <p className="font-medium mb-2">{t("Items", "Ürünler")}</p>
                {orderItems[selectedOrder.id]?.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 text-sm">
                    <span>{item.quantity}x {item.item_name}</span>
                    <span>₺{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {selectedOrder.notes && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-1">{t("Notes", "Notlar")}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchOrders;
