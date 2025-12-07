import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Locations from "./pages/Locations";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Reservations from "./pages/Reservations";
import OrderOnline from "./pages/OrderOnline";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminTables from "./pages/admin/AdminTables";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminQRCodes from "./pages/admin/AdminQRCodes";
import AdminKDS from "./pages/admin/AdminKDS";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/order" element={<OrderOnline />} />
        <Route path="/order/checkout" element={<Checkout />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reservations" element={<Reservations />} />
        
        {/* Admin routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="kds" element={<AdminKDS />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="qr-codes" element={<AdminQRCodes />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
