import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  Bell, 
  TableProperties,
  ShoppingBag,
  Users,
  Timer,
  Utensils,
  ChefHat,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  Receipt,
  CreditCard,
  Banknote,
  X
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: number;
  table_number: string | null;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
  notes: string | null;
  order_type: string;
  payment_method: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  item_name: string;
  item_name_tr: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  modifiers: any;
}

interface TableInfo {
  id: string;
  table_number: string;
  capacity: number;
  is_available: boolean;
  location: string | null;
}

interface LiveTable {
  tableNumber: string;
  orders: Order[];
  totalAmount: number;
  hasReadyOrders: boolean;
  hasServedOrders: boolean;
  allServed: boolean;
}

const AdminWaiter = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<LiveTable | null>(null);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const fetchOrders = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      return;
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      (ordersData || []).map(async (order) => {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        return { ...order, items: items || [] };
      })
    );

    setOrders(ordersWithItems);
    setIsLoading(false);
  }, []);

  const fetchTables = useCallback(async () => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("table_number");

    if (error) {
      console.error("Error fetching tables:", error);
      return;
    }

    setTables(data || []);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchTables();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel("waiter-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT" && soundEnabled) {
            playNotificationSound();
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, fetchTables, soundEnabled]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const markAsServed = async (orderId: string) => {
    const success = await updateOrderStatus(orderId, "served");
    if (success) {
      toast({ title: t("Success", "Başarılı"), description: t("Order marked as served", "Sipariş servis edildi olarak işaretlendi") });
      fetchOrders();
    }
  };

  const closeTable = async (tableNumber: string) => {
    // Get all orders for this table that are not completed
    const tableOrders = orders.filter(
      o => o.table_number === tableNumber && !["completed", "cancelled"].includes(o.status)
    );

    // Mark all as completed
    for (const order of tableOrders) {
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);
    }

    toast({ 
      title: t("Table Closed", "Masa Kapatıldı"), 
      description: t(`Table ${tableNumber} has been closed`, `Masa ${tableNumber} kapatıldı`) 
    });
    
    setShowBillDialog(false);
    setSelectedTable(null);
    fetchOrders();
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      new: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: t("New", "Yeni") },
      accepted: { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30", label: t("Accepted", "Kabul Edildi") },
      preparing: { color: "bg-orange-500/10 text-orange-500 border-orange-500/30", label: t("Preparing", "Hazırlanıyor") },
      ready: { color: "bg-green-500/10 text-green-500 border-green-500/30", label: t("Ready", "Hazır") },
      served: { color: "bg-purple-500/10 text-purple-500 border-purple-500/30", label: t("Served", "Servis Edildi") },
      completed: { color: "bg-gray-500/10 text-gray-500 border-gray-500/30", label: t("Completed", "Tamamlandı") },
    };
    const config = statusConfig[status] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Get live tables - tables with ongoing orders (not completed)
  const getLiveTables = (): LiveTable[] => {
    const tableMap = new Map<string, Order[]>();
    
    // Group orders by table (only non-completed orders)
    orders
      .filter(o => o.table_number && !["completed", "cancelled"].includes(o.status))
      .forEach(order => {
        const tableNum = order.table_number!;
        if (!tableMap.has(tableNum)) {
          tableMap.set(tableNum, []);
        }
        tableMap.get(tableNum)!.push(order);
      });

    // Convert to LiveTable objects
    const liveTables: LiveTable[] = [];
    tableMap.forEach((tableOrders, tableNumber) => {
      const totalAmount = tableOrders.reduce((sum, o) => sum + o.total, 0);
      const hasReadyOrders = tableOrders.some(o => o.status === "ready");
      const hasServedOrders = tableOrders.some(o => o.status === "served");
      const allServed = tableOrders.every(o => o.status === "served");
      
      liveTables.push({
        tableNumber,
        orders: tableOrders,
        totalAmount,
        hasReadyOrders,
        hasServedOrders,
        allServed
      });
    });

    // Sort by table number
    return liveTables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  };

  const liveTables = getLiveTables();

  // Filter orders by status
  const readyOrders = orders.filter(o => o.status === "ready");
  const activeOrders = orders.filter(o => ["new", "accepted", "preparing"].includes(o.status));

  // Stats
  const totalActiveOrders = orders.filter(o => !["completed", "cancelled"].includes(o.status)).length;
  const tablesWaitingPayment = liveTables.filter(t => t.allServed).length;

  const handleTableClick = (liveTable: LiveTable) => {
    setSelectedTable(liveTable);
    setShowBillDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t("Waiter Display", "Garson Ekranı")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("Manage table orders and service", "Masa siparişlerini ve servisi yönetin")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchOrders()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? "text-green-500" : "text-muted-foreground"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalActiveOrders}</p>
              <p className="text-sm text-muted-foreground">{t("Active Orders", "Aktif Siparişler")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{readyOrders.length}</p>
              <p className="text-sm text-muted-foreground">{t("Ready to Serve", "Servise Hazır")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <TableProperties className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{liveTables.length}</p>
              <p className="text-sm text-muted-foreground">{t("Live Tables", "Aktif Masalar")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tablesWaitingPayment}</p>
              <p className="text-sm text-muted-foreground">{t("Awaiting Payment", "Ödeme Bekliyor")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="flex items-center gap-2">
            <TableProperties className="h-4 w-4" />
            {t("Live Tables", "Aktif Masalar")} ({liveTables.length})
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t("Ready to Serve", "Servise Hazır")} ({readyOrders.length})
          </TabsTrigger>
          <TabsTrigger value="kitchen" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            {t("In Kitchen", "Mutfakta")} ({activeOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Live Tables */}
        <TabsContent value="live" className="space-y-4">
          {liveTables.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <TableProperties className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("No active tables", "Aktif masa yok")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {liveTables.map((liveTable, index) => (
                <motion.div
                  key={liveTable.tableNumber}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      liveTable.allServed 
                        ? "border-purple-500 bg-purple-500/10" 
                        : liveTable.hasReadyOrders 
                          ? "border-green-500 bg-green-500/10 animate-pulse" 
                          : "border-orange-500/50 bg-orange-500/5"
                    }`}
                    onClick={() => handleTableClick(liveTable)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold mb-1">{liveTable.tableNumber}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {liveTable.orders.length} {t("order(s)", "sipariş")}
                      </div>
                      <div className="text-lg font-semibold">₺{liveTable.totalAmount.toFixed(2)}</div>
                      <div className="mt-2">
                        {liveTable.allServed ? (
                          <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">
                            {t("Awaiting Bill", "Hesap Bekliyor")}
                          </Badge>
                        ) : liveTable.hasReadyOrders ? (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            {t("Ready", "Hazır")}
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                            {t("In Progress", "Hazırlanıyor")}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ready to Serve */}
        <TabsContent value="ready" className="space-y-4">
          {readyOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("No orders ready to serve", "Servise hazır sipariş yok")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readyOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-green-500/30 bg-green-500/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {order.table_number ? (
                            <>
                              <TableProperties className="h-5 w-5" />
                              {t("Table", "Masa")} {order.table_number}
                            </>
                          ) : (
                            <>#{order.order_number}</>
                          )}
                        </CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {format(new Date(order.created_at), "HH:mm")}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {language === "tr" && item.item_name_tr ? item.item_name_tr : item.item_name}
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-sm text-muted-foreground italic border-t border-border/50 pt-2">
                          {order.notes}
                        </p>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={() => markAsServed(order.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t("Mark as Served", "Teslim Edildi")}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* In Kitchen */}
        <TabsContent value="kitchen" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("No orders in preparation", "Hazırlanmakta olan sipariş yok")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {order.table_number ? (
                            <>
                              <TableProperties className="h-5 w-5" />
                              {t("Table", "Masa")} {order.table_number}
                            </>
                          ) : (
                            <>#{order.order_number}</>
                          )}
                        </CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        <span>{format(new Date(order.created_at), "HH:mm")}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            <span>{item.quantity}x {language === "tr" && item.item_name_tr ? item.item_name_tr : item.item_name}</span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-sm text-muted-foreground italic border-t border-border/50 pt-2">
                          {order.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <TableProperties className="h-5 w-5" />
              {t("Table", "Masa")} {selectedTable?.tableNumber} - {t("Bill", "Hesap")}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTable && (
            <div className="space-y-4">
              {/* Orders List */}
              {selectedTable.orders.map((order) => (
                <Card key={order.id} className="border-border/50">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">#{order.order_number}</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {language === "tr" && item.item_name_tr ? item.item_name_tr : item.item_name}
                        </span>
                        <span className="font-medium">₺{item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border/50 font-medium">
                      <span>{t("Order Total", "Sipariş Toplamı")}</span>
                      <span>₺{order.total.toFixed(2)}</span>
                    </div>
                    
                    {/* Mark as served button for ready orders */}
                    {order.status === "ready" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => markAsServed(order.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t("Mark as Served", "Teslim Edildi")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Grand Total */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t("Grand Total", "Genel Toplam")}</span>
                  <span>₺{selectedTable.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span>{selectedTable.orders.length} {t("order(s)", "sipariş")}</span>
                  <span>•</span>
                  <span>
                    {selectedTable.orders[0]?.payment_method === "cash" ? (
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> {t("Cash", "Nakit")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> {t("Card", "Kart")}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowBillDialog(false)} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              {t("Close", "Kapat")}
            </Button>
            {selectedTable?.allServed && (
              <Button 
                onClick={() => closeTable(selectedTable.tableNumber)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("Payment Received - Close Table", "Ödeme Alındı - Masayı Kapat")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWaiter;
