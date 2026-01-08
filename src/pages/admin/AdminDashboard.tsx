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
  AlertCircle,
  Store,
  ShoppingBag,
  ChefHat
} from "lucide-react";
import { format, subDays } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

interface Branch {
  id: string;
  name: string;
  slug: string;
}

interface BranchStats {
  branchId: string;
  branchName: string;
  todayReservations: number;
  pendingReservations: number;
  todayOrders: number;
  totalRevenue: number;
  tables: number;
  staff: number;
}

interface GlobalStats {
  totalBranches: number;
  totalReservations: number;
  todayReservations: number;
  pendingReservations: number;
  totalOrders: number;
  todayOrders: number;
  menuItems: number;
  totalTables: number;
  totalStaff: number;
  totalRevenue: number;
}

interface RecentReservation {
  id: string;
  guest_name: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  branch_name?: string;
}

interface DailyData {
  date: string;
  orders: number;
  reservations: number;
  revenue: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(217, 91%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
];

const AdminDashboard = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalBranches: 0,
    totalReservations: 0,
    todayReservations: 0,
    pendingReservations: 0,
    totalOrders: 0,
    todayOrders: 0,
    menuItems: 0,
    totalTables: 0,
    totalStaff: 0,
    totalRevenue: 0,
  });
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

    try {
      // Fetch branches
      const { data: branches } = await supabase
        .from("branches")
        .select("id, name, slug")
        .eq("is_active", true);

      // Fetch global counts
      const [
        { count: totalReservations },
        { count: todayReservations },
        { count: pendingReservations },
        { count: menuItems },
        { count: totalTables },
        { count: totalStaff },
        { count: totalOrders },
        { count: todayOrders },
        { data: ordersWithTotal },
        { data: recent },
        { data: recentOrders },
        { data: recentReservationsData }
      ] = await Promise.all([
        supabase.from("reservations").select("*", { count: "exact", head: true }),
        supabase.from("reservations").select("*", { count: "exact", head: true }).eq("reservation_date", today),
        supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("menu_items").select("*", { count: "exact", head: true }),
        supabase.from("restaurant_tables").select("*", { count: "exact", head: true }),
        supabase.from("staff_logins").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("orders").select("total"),
        supabase.from("reservations").select("*, branches(name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("created_at, total").gte("created_at", sevenDaysAgo),
        supabase.from("reservations").select("created_at").gte("created_at", sevenDaysAgo)
      ]);

      // Calculate total revenue
      const totalRevenue = ordersWithTotal?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Set global stats
      setGlobalStats({
        totalBranches: branches?.length || 0,
        totalReservations: totalReservations || 0,
        todayReservations: todayReservations || 0,
        pendingReservations: pendingReservations || 0,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrders || 0,
        menuItems: menuItems || 0,
        totalTables: totalTables || 0,
        totalStaff: totalStaff || 0,
        totalRevenue,
      });

      // Fetch per-branch stats
      if (branches && branches.length > 0) {
        const branchStatsPromises = branches.map(async (branch) => {
          const [
            { count: branchTodayRes },
            { count: branchPendingRes },
            { count: branchTodayOrders },
            { data: branchOrdersTotal },
            { count: branchTables },
            { count: branchStaff }
          ] = await Promise.all([
            supabase.from("reservations").select("*", { count: "exact", head: true }).eq("branch_id", branch.id).eq("reservation_date", today),
            supabase.from("reservations").select("*", { count: "exact", head: true }).eq("branch_id", branch.id).eq("status", "pending"),
            supabase.from("orders").select("*", { count: "exact", head: true }).eq("branch_id", branch.id).gte("created_at", today),
            supabase.from("orders").select("total").eq("branch_id", branch.id),
            supabase.from("restaurant_tables").select("*", { count: "exact", head: true }).eq("branch_id", branch.id),
            supabase.from("staff_logins").select("*", { count: "exact", head: true }).eq("branch_id", branch.id).eq("is_active", true)
          ]);

          return {
            branchId: branch.id,
            branchName: branch.name,
            todayReservations: branchTodayRes || 0,
            pendingReservations: branchPendingRes || 0,
            todayOrders: branchTodayOrders || 0,
            totalRevenue: branchOrdersTotal?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
            tables: branchTables || 0,
            staff: branchStaff || 0,
          };
        });

        const allBranchStats = await Promise.all(branchStatsPromises);
        setBranchStats(allBranchStats);
      }

      // Process recent reservations
      const processedReservations = recent?.map((res: any) => ({
        ...res,
        branch_name: res.branches?.name || "Unknown"
      })) || [];
      setRecentReservations(processedReservations);

      // Process daily data for charts
      const dailyMap: Record<string, { orders: number; reservations: number; revenue: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        dailyMap[date] = { orders: 0, reservations: 0, revenue: 0 };
      }

      recentOrders?.forEach((order) => {
        const date = format(new Date(order.created_at), "yyyy-MM-dd");
        if (dailyMap[date]) {
          dailyMap[date].orders++;
          dailyMap[date].revenue += order.total || 0;
        }
      });

      recentReservationsData?.forEach((res) => {
        const date = format(new Date(res.created_at), "yyyy-MM-dd");
        if (dailyMap[date]) {
          dailyMap[date].reservations++;
        }
      });

      const dailyDataArray = Object.entries(dailyMap).map(([date, data]) => ({
        date: format(new Date(date), "MMM dd"),
        ...data,
      }));
      setDailyData(dailyDataArray);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Branches", 
      value: globalStats.totalBranches, 
      icon: Store, 
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Today's Orders", 
      value: globalStats.todayOrders, 
      icon: ShoppingBag, 
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      title: "Today's Reservations", 
      value: globalStats.todayReservations, 
      icon: CalendarDays, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      title: "Pending Approvals", 
      value: globalStats.pendingReservations, 
      icon: Clock, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    { 
      title: "Total Staff", 
      value: globalStats.totalStaff, 
      icon: ChefHat, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    { 
      title: "Menu Items", 
      value: globalStats.menuItems, 
      icon: UtensilsCrossed, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
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

  // Prepare chart data
  const branchComparisonData = branchStats.map((branch, index) => ({
    name: branch.branchName,
    orders: branch.todayOrders,
    reservations: branch.todayReservations,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const revenueComparisonData = branchStats.map((branch, index) => ({
    name: branch.branchName,
    revenue: branch.totalRevenue,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const staffDistributionData = branchStats.map((branch, index) => ({
    name: branch.branchName,
    value: branch.staff,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all branches and key metrics</p>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Total Revenue Card */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue (All Branches)</p>
              <p className="text-4xl font-bold text-primary">
                {isLoading ? "..." : `₺${globalStats.totalRevenue.toLocaleString()}`}
              </p>
            </div>
            <div className="p-4 rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders & Reservations by Branch */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Today's Activity by Branch
            </CardTitle>
            <CardDescription>Orders and reservations comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {branchStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No branch data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="orders" name="Orders" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reservations" name="Reservations" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Branch */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue by Branch
            </CardTitle>
            <CardDescription>Total revenue comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {branchStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No branch data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `₺${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                    {revenueComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Trend & Staff Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7-Day Activity Trend
            </CardTitle>
            <CardDescription>Orders and reservations over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ fill: 'hsl(142, 76%, 36%)' }} />
                <Line type="monotone" dataKey="reservations" name="Reservations" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(217, 91%, 60%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Staff Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Distribution
            </CardTitle>
            <CardDescription>Staff per branch</CardDescription>
          </CardHeader>
          <CardContent>
            {staffDistributionData.length === 0 || staffDistributionData.every(d => d.value === 0) ? (
              <p className="text-muted-foreground text-center py-8">No staff data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={staffDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {staffDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Branch Cards & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Summary Cards */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Branch Overview
            </CardTitle>
            <CardDescription>Quick stats for each branch</CardDescription>
          </CardHeader>
          <CardContent>
            {branchStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No branches found</p>
            ) : (
              <div className="space-y-3">
                {branchStats.map((branch, index) => (
                  <motion.div
                    key={branch.branchId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <h4 className="font-semibold">{branch.branchName}</h4>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        ₺{branch.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-lg font-bold">{branch.todayOrders}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-lg font-bold">{branch.todayReservations}</p>
                        <p className="text-xs text-muted-foreground">Reservations</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-lg font-bold">{branch.tables}</p>
                        <p className="text-xs text-muted-foreground">Tables</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/50">
                        <p className="text-lg font-bold">{branch.staff}</p>
                        <p className="text-xs text-muted-foreground">Staff</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Recent Reservations
            </CardTitle>
            <CardDescription>Latest booking activity across all branches</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReservations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reservations yet</p>
            ) : (
              <div className="space-y-3">
                {recentReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(reservation.status)}
                      <div>
                        <p className="font-medium">{reservation.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.party_size} guests • {reservation.reservation_date} at {reservation.reservation_time}
                        </p>
                        <p className="text-xs text-primary">{reservation.branch_name}</p>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
