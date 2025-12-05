import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { TrendingUp, Users, CalendarDays, UtensilsCrossed } from "lucide-react";

interface ReservationStats {
  date: string;
  count: number;
}

interface StatusStats {
  status: string;
  count: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#6b7280"];

const AdminAnalytics = () => {
  const [reservationsByDay, setReservationsByDay] = useState<ReservationStats[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusStats[]>([]);
  const [partySizeDistribution, setPartySizeDistribution] = useState<{ size: string; count: number }[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalReservations: 0,
    totalGuests: 0,
    avgPartySize: 0,
    menuItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, "yyyy-MM-dd");
    });

    // Fetch all reservations
    const { data: reservations } = await supabase
      .from("reservations")
      .select("*");

    // Fetch menu items count
    const { count: menuCount } = await supabase
      .from("menu_items")
      .select("*", { count: "exact", head: true });

    if (reservations) {
      // Reservations by day
      const byDay = last7Days.map(date => ({
        date: format(new Date(date), "EEE"),
        count: reservations.filter(r => r.reservation_date === date).length,
      }));
      setReservationsByDay(byDay);

      // Status distribution
      const statusCounts: Record<string, number> = {};
      reservations.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      setStatusDistribution(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));

      // Party size distribution
      const sizeCounts: Record<string, number> = { "1-2": 0, "3-4": 0, "5-6": 0, "7+": 0 };
      reservations.forEach(r => {
        if (r.party_size <= 2) sizeCounts["1-2"]++;
        else if (r.party_size <= 4) sizeCounts["3-4"]++;
        else if (r.party_size <= 6) sizeCounts["5-6"]++;
        else sizeCounts["7+"]++;
      });
      setPartySizeDistribution(Object.entries(sizeCounts).map(([size, count]) => ({ size, count })));

      // Total stats
      const totalGuests = reservations.reduce((sum, r) => sum + r.party_size, 0);
      setTotalStats({
        totalReservations: reservations.length,
        totalGuests,
        avgPartySize: reservations.length > 0 ? Math.round(totalGuests / reservations.length * 10) / 10 : 0,
        menuItems: menuCount || 0,
      });
    }

    setIsLoading(false);
  };

  const statCards = [
    { title: "Total Reservations", value: totalStats.totalReservations, icon: CalendarDays, color: "text-primary" },
    { title: "Total Guests", value: totalStats.totalGuests, icon: Users, color: "text-green-500" },
    { title: "Avg Party Size", value: totalStats.avgPartySize, icon: TrendingUp, color: "text-blue-500" },
    { title: "Menu Items", value: totalStats.menuItems, icon: UtensilsCrossed, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Restaurant performance insights</p>
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
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{isLoading ? "..." : stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservations by Day */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Reservations (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Reservation Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Party Size Distribution */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Party Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partySizeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="size" type="category" stroke="hsl(var(--muted-foreground))" width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
