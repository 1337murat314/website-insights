import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/admin/ThemeToggle";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  UtensilsCrossed,
  TableProperties,
  QrCode,
  Ticket,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Bell,
  Globe,
  MapPin,
} from "lucide-react";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

const getNavItems = (branchSlug: string, t: (en: string, tr: string) => string) => [
  { path: `/${branchSlug}/admin`, label: t("Dashboard", "Panel"), icon: LayoutDashboard, end: true },
  { path: `/${branchSlug}/admin/orders`, label: t("Orders", "Siparişler"), icon: ShoppingBag },
  { path: `/${branchSlug}/admin/waiter`, label: t("Waiter View", "Garson Görünümü"), icon: Bell },
  { path: `/${branchSlug}/admin/kds`, label: t("Kitchen Display", "Mutfak Ekranı"), icon: ChefHat },
  { path: `/${branchSlug}/admin/reservations`, label: t("Reservations", "Rezervasyonlar"), icon: CalendarDays },
  { path: `/${branchSlug}/admin/menu`, label: t("Menu", "Menü"), icon: UtensilsCrossed },
  { path: `/${branchSlug}/admin/tables`, label: t("Tables", "Masalar"), icon: TableProperties },
  { path: `/${branchSlug}/admin/qr-codes`, label: t("QR Codes", "QR Kodlar"), icon: QrCode },
  { path: `/${branchSlug}/admin/promo-codes`, label: t("Promo Codes", "Promosyonlar"), icon: Ticket },
  { path: `/${branchSlug}/admin/staff-logins`, label: t("Staff Logins", "Personel Girişleri"), icon: Users },
  { path: `/${branchSlug}/admin/analytics`, label: t("Analytics", "Analitik"), icon: BarChart3 },
  { path: `/${branchSlug}/admin/settings`, label: t("Settings", "Ayarlar"), icon: Settings },
];

const BranchAdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { branch } = useBranch();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();

  const navItems = getNavItems(branchSlug || "", t);

  const handleSignOut = async () => {
    await signOut();
    navigate(`/${branchSlug}/admin/auth`);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Branch Name */}
        <div className="p-4 border-b flex items-center gap-3">
          <img
            src={logoLight}
            alt="Logo"
            className="h-10 w-auto dark:hidden"
          />
          <img
            src={logoDark}
            alt="Logo"
            className="h-10 w-auto hidden dark:block"
          />
          {!isCollapsed && branch && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{branch.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Branch Admin
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-b flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="h-8 w-8"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t">
          {!isCollapsed && user && (
            <div className="mb-3 text-sm">
              <p className="font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">{branch?.name} Admin</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn("w-full justify-start", isCollapsed && "justify-center")}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-2">{t("Logout", "Çıkış")}</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background hidden lg:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </>
  );
};

export default BranchAdminSidebar;
