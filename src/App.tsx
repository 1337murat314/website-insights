import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import Locations from "./pages/Locations";
import About from "./pages/About";
import Reservations from "./pages/Reservations";
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
import AdminGuests from "./pages/admin/AdminGuests";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/about" element={<About />} />
        <Route path="/reservations" element={<Reservations />} />
        
        {/* Admin routes */}
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="events" element={<AdminEvents />} />
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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
