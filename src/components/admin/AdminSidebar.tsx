import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  UtensilsCrossed, 
  Users, 
  Settings, 
  BarChart3,
  TableProperties,
  LogOut,
  ChefHat,
  Menu,
  UserPlus,
  Gift,
  ScrollText,
  Globe,
  ShoppingBag,
  QrCode,
  MonitorPlay,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import GlobalSearch from "./GlobalSearch";

const getNavItems = (t: (en: string, tr: string) => string) => [
  { path: "/admin", label: t("Dashboard", "Kontrol Paneli"), icon: LayoutDashboard, exact: true },
  { path: "/admin/orders", label: t("Orders", "Siparişler"), icon: ShoppingBag },
  { path: "/admin/kds", label: t("Kitchen Display", "Mutfak Ekranı"), icon: MonitorPlay },
  { path: "/admin/reservations", label: t("Reservations", "Rezervasyonlar"), icon: CalendarDays },
  { path: "/admin/leads", label: t("Leads", "Müşteri Adayları"), icon: UserPlus },
  { path: "/admin/menu", label: t("Menu", "Menü"), icon: UtensilsCrossed },
  { path: "/admin/tables", label: t("Tables", "Masalar"), icon: TableProperties },
  { path: "/admin/qr-codes", label: t("QR Codes", "QR Kodları"), icon: QrCode },
  { path: "/admin/promo-codes", label: t("Promo Codes", "Promosyon Kodları"), icon: Gift },
  { path: "/admin/staff", label: t("Staff", "Personel"), icon: Users },
  { path: "/admin/analytics", label: t("Analytics", "Analitik"), icon: BarChart3 },
  { path: "/admin/audit-logs", label: t("Audit Logs", "Denetim Kayıtları"), icon: ScrollText },
  { path: "/admin/settings", label: t("Settings", "Ayarlar"), icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = getNavItems(t);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              {!collapsed && (
                <div>
                  <h2 className="font-serif font-bold text-foreground">Califorian</h2>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Search, Theme Toggle, and Language Toggle */}
          {!collapsed && (
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <GlobalSearch />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "en" ? "tr" : "en")}
                className="h-9 w-9 shrink-0"
                title={t("Switch to Turkish", "İngilizce'ye Geç")}
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">{language === "en" ? "TR" : "EN"}</span>
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive(item.path, item.exact)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                onClick={() => setCollapsed(true)}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            {!collapsed && user && (
              <div className="mb-3 px-3">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">{t("Administrator", "Yönetici")}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                collapsed && "justify-center"
              )}
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && t("Sign Out", "Çıkış Yap")}
            </Button>
          </div>

          {/* Collapse toggle for desktop */}
          <button
            className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-card border border-border rounded-full shadow-sm hover:bg-secondary transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <span className={cn(
              "block transition-transform",
              collapsed ? "rotate-180" : ""
            )}>
              ‹
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
