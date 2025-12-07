import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock, 
  CheckCircle2, 
  Bell, 
  TableProperties,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  Receipt,
  CreditCard,
  Banknote,
  X,
  HandMetal,
  ChefHat,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { playNotificationSound } from "@/lib/notificationSound";

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

interface ServiceRequest {
  id: string;
  table_number: string;
  request_type: string;
  status: string;
  created_at: string;
}

interface LiveTable {
  tableNumber: string;
  orders: Order[];
  totalAmount: number;
  hasReadyOrders: boolean;
  hasServedOrders: boolean;
  allServed: boolean;
  serviceRequests: ServiceRequest[];
}

const AdminWaiter = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
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

  const fetchServiceRequests = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("status", "pending")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching service requests:", error);
      return;
    }

    setServiceRequests(data || []);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchServiceRequests();

    const ordersChannel = supabase
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

    const requestsChannel = supabase
      .channel("waiter-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        (payload) => {
          if (payload.eventType === "INSERT" && soundEnabled) {
            playNotificationSound();
          }
          fetchServiceRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [fetchOrders, fetchServiceRequests, soundEnabled]);

  const markAsServed = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "served" })
      .eq("id", orderId);

    if (error) {
      toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("Success", "Başarılı"), description: t("Order marked as served", "Sipariş servis edildi") });
    fetchOrders();
  };

  const acknowledgeRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ status: "completed" })
      .eq("id", requestId);

    if (error) {
      toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("Success", "Başarılı"), description: t("Request acknowledged", "İstek onaylandı") });
      fetchServiceRequests();
    }
  };

  const closeTable = async (tableNumber: string) => {
    const tableOrders = orders.filter(
      o => o.table_number === tableNumber && !["completed", "cancelled"].includes(o.status)
    );

    for (const order of tableOrders) {
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);
    }

    await supabase
      .from("service_requests")
      .update({ status: "completed" })
      .eq("table_number", tableNumber)
      .eq("status", "pending");

    toast({ 
      title: t("Table Closed", "Masa Kapatıldı"), 
      description: t(`Table ${tableNumber} has been closed`, `Masa ${tableNumber} kapatıldı`) 
    });
    
    setShowBillDialog(false);
    setSelectedTable(null);
    fetchOrders();
    fetchServiceRequests();
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

  const getLiveTables = (): LiveTable[] => {
    const tableMap = new Map<string, Order[]>();
    
    orders
      .filter(o => o.table_number && !["completed", "cancelled"].includes(o.status))
      .forEach(order => {
        const tableNum = order.table_number!;
        if (!tableMap.has(tableNum)) {
          tableMap.set(tableNum, []);
        }
        tableMap.get(tableNum)!.push(order);
      });

    serviceRequests.forEach(request => {
      if (!tableMap.has(request.table_number)) {
        tableMap.set(request.table_number, []);
      }
    });

    const liveTables: LiveTable[] = [];
    tableMap.forEach((tableOrders, tableNumber) => {
      const totalAmount = tableOrders.reduce((sum, o) => sum + o.total, 0);
      const hasReadyOrders = tableOrders.some(o => o.status === "ready");
      const hasServedOrders = tableOrders.some(o => o.status === "served");
      const allServed = tableOrders.length > 0 && tableOrders.every(o => o.status === "served");
      const tableRequests = serviceRequests.filter(r => r.table_number === tableNumber);
      
      liveTables.push({
        tableNumber,
        orders: tableOrders,
        totalAmount,
        hasReadyOrders,
        hasServedOrders,
        allServed,
        serviceRequests: tableRequests
      });
    });

    return liveTables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  };

  const liveTables = getLiveTables();
  const readyOrders = orders.filter(o => o.status === "ready");
  const pendingRequests = serviceRequests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isFullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}>
      {/* Compact Header */}
      <div className="bg-card border-b border-border p-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{t("Waiter", "Garson")}</h1>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => { fetchOrders(); fetchServiceRequests(); }}
              variant="ghost"
              size="icon"
              className="h-9 w-9"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${soundEnabled ? "text-green-500" : ""}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button onClick={toggleFullscreen} variant="ghost" size="icon" className="h-9 w-9">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          <Badge variant="outline" className="shrink-0 px-3 py-1">
            <TableProperties className="w-3 h-3 mr-1" />
            {liveTables.length}
          </Badge>
          <Badge variant="outline" className={`shrink-0 px-3 py-1 ${readyOrders.length > 0 ? "bg-green-500/20 text-green-600 border-green-500" : ""}`}>
            <Package className="w-3 h-3 mr-1" />
            {readyOrders.length} {t("Ready", "Hazır")}
          </Badge>
          {pendingRequests > 0 && (
            <Badge className="shrink-0 px-3 py-1 bg-yellow-500 text-yellow-950 animate-pulse">
              <Bell className="w-3 h-3 mr-1" />
              {pendingRequests}
            </Badge>
          )}
        </div>
      </div>

      {/* Service Requests Alert - Full Width Cards */}
      <AnimatePresence>
        {serviceRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 space-y-2"
          >
            {serviceRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  request.request_type === "call_waiter" 
                    ? "bg-yellow-500/20 border-2 border-yellow-500" 
                    : "bg-purple-500/20 border-2 border-purple-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  {request.request_type === "call_waiter" ? (
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                      <HandMetal className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-lg">
                      {t("Table", "Masa")} {request.table_number}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {request.request_type === "call_waiter" 
                        ? t("Calling Waiter", "Garson Çağırıyor")
                        : t("Requesting Bill", "Hesap İstiyor")}
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={() => acknowledgeRequest(request.id)}
                  className="h-12 px-6"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready to Serve Section */}
      {readyOrders.length > 0 && (
        <div className="p-3">
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            {t("Ready to Serve", "Servise Hazır")}
          </h2>
          <div className="space-y-2">
            {readyOrders.map((order) => (
              <Card key={order.id} className="border-green-500 bg-green-500/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <span className="font-bold text-green-600">{order.table_number || "#" + order.order_number}</span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {order.items.slice(0, 2).map(i => `${i.quantity}x ${language === "tr" && i.item_name_tr ? i.item_name_tr : i.item_name}`).join(", ")}
                          {order.items.length > 2 && ` +${order.items.length - 2}`}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(order.created_at), "HH:mm")}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => markAsServed(order.id)} className="h-12 px-4">
                      <CheckCircle2 className="h-5 w-5 mr-1" />
                      {t("Served", "Teslim")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Live Tables Grid */}
      <div className="p-3">
        <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
          <TableProperties className="w-4 h-4" />
          {t("Active Tables", "Aktif Masalar")}
        </h2>
        {liveTables.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <TableProperties className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>{t("No active tables", "Aktif masa yok")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {liveTables.map((liveTable) => {
              const hasCallWaiter = liveTable.serviceRequests.some(r => r.request_type === "call_waiter");
              const hasRequestBill = liveTable.serviceRequests.some(r => r.request_type === "request_bill");
              const hasKitchenOrders = liveTable.orders.some(o => ["new", "preparing"].includes(o.status));
              
              return (
                <motion.div
                  key={liveTable.tableNumber}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    className={`cursor-pointer relative overflow-hidden ${
                      hasCallWaiter || hasRequestBill
                        ? "border-yellow-500 bg-yellow-500/10 animate-pulse"
                        : liveTable.hasReadyOrders 
                          ? "border-green-500 bg-green-500/10" 
                          : liveTable.hasServedOrders
                            ? "border-purple-500 bg-purple-500/10"
                            : hasKitchenOrders
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-border"
                    }`}
                    onClick={() => { setSelectedTable(liveTable); setShowBillDialog(true); }}
                  >
                    {/* Request Icons */}
                    {(hasCallWaiter || hasRequestBill) && (
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        {hasCallWaiter && (
                          <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                            <HandMetal className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {hasRequestBill && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Receipt className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold">{liveTable.tableNumber}</div>
                      <div className="text-sm font-medium text-primary">₺{liveTable.totalAmount.toFixed(0)}</div>
                      <div className="mt-1">
                        {liveTable.hasReadyOrders ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-600 border-green-500">
                            {t("Ready", "Hazır")}
                          </Badge>
                        ) : liveTable.hasServedOrders ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-purple-500/20 text-purple-600 border-purple-500">
                            {t("Served", "Servis")}
                          </Badge>
                        ) : hasKitchenOrders ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/20 text-orange-600 border-orange-500">
                            <ChefHat className="w-2.5 h-2.5 mr-0.5" />
                            {t("Kitchen", "Mutfak")}
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill Dialog - Mobile Optimized */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto p-4 rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <TableProperties className="h-5 w-5" />
              {t("Table", "Masa")} {selectedTable?.tableNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTable && (
            <div className="space-y-3">
              {/* Service Requests */}
              {selectedTable.serviceRequests.length > 0 && (
                <div className="space-y-2">
                  {selectedTable.serviceRequests.map((request) => (
                    <div 
                      key={request.id}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        request.request_type === "call_waiter" 
                          ? "bg-yellow-500/20" 
                          : "bg-purple-500/20"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {request.request_type === "call_waiter" ? (
                          <><HandMetal className="h-4 w-4" /> {t("Call Waiter", "Garson Çağır")}</>
                        ) : (
                          <><Receipt className="h-4 w-4" /> {t("Request Bill", "Hesap İste")}</>
                        )}
                      </span>
                      <Button size="sm" onClick={() => acknowledgeRequest(request.id)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Orders */}
              {selectedTable.orders.map((order) => (
                <Card key={order.id} className="border-border/50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">#{order.order_number}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.status === "ready" ? t("Ready", "Hazır") : 
                         order.status === "served" ? t("Served", "Servis") :
                         order.status === "preparing" ? t("Cooking", "Pişiyor") : 
                         t("New", "Yeni")}
                      </Badge>
                    </div>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {language === "tr" && item.item_name_tr ? item.item_name_tr : item.item_name}</span>
                        <span className="font-medium">₺{item.total_price.toFixed(0)}</span>
                      </div>
                    ))}
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

              {/* Total */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t("Total", "Toplam")}</span>
                  <span>₺{selectedTable.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {selectedTable.orders[0]?.payment_method === "cash_at_table" ? (
                    <><Banknote className="h-3 w-3" /> {t("Cash", "Nakit")}</>
                  ) : (
                    <><CreditCard className="h-3 w-3" /> {t("Card", "Kart")}</>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowBillDialog(false)} className="w-full">
              <X className="h-4 w-4 mr-2" />
              {t("Close", "Kapat")}
            </Button>
            <Button 
              onClick={() => selectedTable && closeTable(selectedTable.tableNumber)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t("Payment Received", "Ödeme Alındı")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWaiter;
