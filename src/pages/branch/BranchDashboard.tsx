import { useEffect, useState } from "react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  CalendarDays, 
  DollarSign, 
  Users,
  TrendingUp,
  Clock,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingReservations: number;
  activeStaff: number;
  ordersInProgress: number;
}

const BranchDashboard = () => {
  const { branch, branchId } = useBranch();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingReservations: 0,
    activeStaff: 0,
    ordersInProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!branchId) return;

    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's orders for this branch
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total, status")
        .gte("created_at", today.toISOString());

      const branchOrders = (ordersData || []).filter(
        (o: any) => o.branch_id === branchId || !o.branch_id
      );

      // Fetch pending reservations
      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("id")
        .eq("status", "pending")
        .gte("reservation_date", format(today, "yyyy-MM-dd"));

      // Fetch active staff for branch
      const { data: staffData } = await supabase
        .from("staff_logins")
        .select("id")
        .eq("is_active", true);

      const branchStaff = (staffData || []).filter(
        (s: any) => s.branch_id === branchId || !s.branch_id
      );

      setStats({
        todayOrders: branchOrders.length,
        todayRevenue: branchOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingReservations: reservationsData?.length || 0,
        activeStaff: branchStaff.length,
        ordersInProgress: branchOrders.filter(
          (o) => ["new", "preparing"].includes(o.status)
        ).length,
      });
      setIsLoading(false);
    };

    fetchStats();
  }, [branchId]);

  if (!branch) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{branch.name}</h1>
          <p className="text-muted-foreground">
            {t("Branch Dashboard", "Şube Paneli")}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              {t("Today's Orders", "Bugünkü Siparişler")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayOrders}</div>
            {stats.ordersInProgress > 0 && (
              <Badge variant="secondary" className="mt-1">
                {stats.ordersInProgress} {t("in progress", "devam ediyor")}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("Today's Revenue", "Bugünkü Gelir")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₺{stats.todayRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {t("Pending Reservations", "Bekleyen Rezervasyonlar")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("Active Staff", "Aktif Personel")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeStaff}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("Branch Information", "Şube Bilgileri")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {branch.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{branch.address}</span>
            </div>
          )}
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">📞</span>
              <span>{branch.phone}</span>
            </div>
          )}
          {branch.hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{branch.hours}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchDashboard;
