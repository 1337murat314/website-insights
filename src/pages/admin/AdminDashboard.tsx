import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  CalendarDays, 
  Users, 
  UtensilsCrossed, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Stats {
  totalReservations: number;
  todayReservations: number;
  pendingReservations: number;
  menuItems: number;
  tables: number;
}

interface RecentReservation {
  id: string;
  guest_name: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    todayReservations: 0,
    pendingReservations: 0,
    menuItems: 0,
    tables: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    const [
      { count: totalReservations },
      { count: todayReservations },
      { count: pendingReservations },
      { count: menuItems },
      { count: tables },
      { data: recent }
    ] = await Promise.all([
      supabase.from("reservations").select("*", { count: "exact", head: true }),
      supabase.from("reservations").select("*", { count: "exact", head: true }).eq("reservation_date", today),
      supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("menu_items").select("*", { count: "exact", head: true }),
      supabase.from("restaurant_tables").select("*", { count: "exact", head: true }),
      supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(5)
    ]);

    setStats({
      totalReservations: totalReservations || 0,
      todayReservations: todayReservations || 0,
      pendingReservations: pendingReservations || 0,
      menuItems: menuItems || 0,
      tables: tables || 0,
    });
    setRecentReservations(recent || []);
    setIsLoading(false);
  };

  const statCards = [
    { 
      title: "Today's Reservations", 
      value: stats.todayReservations, 
      icon: CalendarDays, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Pending Approvals", 
      value: stats.pendingReservations, 
      icon: Clock, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      title: "Menu Items", 
      value: stats.menuItems, 
      icon: UtensilsCrossed, 
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      title: "Total Tables", 
      value: stats.tables, 
      icon: Users, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your restaurant management panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Recent Reservations
            </CardTitle>
            <CardDescription>Latest booking activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reservations yet</p>
            ) : (
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(reservation.status)}
                      <div>
                        <p className="font-medium">{reservation.guest_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reservation.party_size} guests • {reservation.reservation_date} at {reservation.reservation_time}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      reservation.status === "confirmed" ? "bg-green-500/10 text-green-500" :
                      reservation.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>Overview of your restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Reservations</span>
                  <span className="font-bold">{stats.totalReservations}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((stats.todayReservations / Math.max(stats.totalReservations, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                  <p className="text-sm text-muted-foreground">Active Tables</p>
                  <p className="text-2xl font-bold text-green-500">{stats.tables}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <p className="text-sm text-muted-foreground">Menu Items</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.menuItems}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
