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
  Gift,
  ScrollText,
  Globe,
  ShoppingBag,
  QrCode,
  KeyRound,
  Building2,
  ChevronDown,
  ChevronRight,
  MonitorPlay,
  Utensils,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Branch {
  id: string;
  name: string;
  name_tr: string | null;
  slug: string | null;
}

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase
        .from("branches")
        .select("id, name, name_tr, slug")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setBranches(data);
    };
    fetchBranches();
  }, []);

  const toggleBranch = (branchId: string) => {
    setOpenBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
  };

  const mainControlItems = [
    { path: "/admin", label: t("Dashboard", "Kontrol Paneli"), icon: LayoutDashboard, exact: true },
    { path: "/admin/staff-logins", label: t("Staff & Logins", "Personel & Girişler"), icon: KeyRound },
    { path: "/admin/catering", label: t("Catering", "Catering"), icon: ChefHat },
    { path: "/admin/analytics", label: t("Analytics", "Analitik"), icon: BarChart3 },
    { path: "/admin/audit-logs", label: t("Audit Logs", "Denetim Kayıtları"), icon: ScrollText },
    { path: "/admin/promo-codes", label: t("Promo Codes", "Promosyon Kodları"), icon: Gift },
    { path: "/admin/settings", label: t("Settings", "Ayarlar"), icon: Settings },
  ];

  const getBranchItems = (branchSlug: string) => [
    { path: `/admin/branch/${branchSlug}`, label: t("Dashboard", "Panel"), icon: LayoutDashboard, exact: true },
    { path: `/admin/branch/${branchSlug}/orders`, label: t("Orders", "Siparişler"), icon: ShoppingBag },
    { path: `/admin/branch/${branchSlug}/reservations`, label: t("Reservations", "Rezervasyonlar"), icon: CalendarDays },
    { path: `/admin/branch/${branchSlug}/menu`, label: t("Menu", "Menü"), icon: UtensilsCrossed },
    { path: `/admin/branch/${branchSlug}/tables`, label: t("Tables", "Masalar"), icon: TableProperties },
    { path: `/admin/branch/${branchSlug}/qr-codes`, label: t("QR Codes", "QR Kodları"), icon: QrCode },
    { path: `/admin/branch/${branchSlug}/kitchen`, label: t("Kitchen", "Mutfak"), icon: MonitorPlay },
    { path: `/admin/branch/${branchSlug}/waiter`, label: t("Waiter", "Garson"), icon: Utensils },
    { path: `/admin/branch/${branchSlug}/staff`, label: t("Staff", "Personel"), icon: Users },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isBranchActive = (branchSlug: string) => {
    return location.pathname.includes(`/admin/branch/${branchSlug}`);
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
        "fixed lg:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300 overflow-hidden",
        collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0 w-72"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ChefHat className="h-5 w-5 text-primary" />
              </div>
              {!collapsed && (
                <div>
                  <h2 className="font-serif font-bold text-foreground">Califorian</h2>
                  <p className="text-xs text-muted-foreground">{t("Super Admin", "Süper Yönetici")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Theme & Language Toggle */}
          {!collapsed && (
            <div className="px-4 py-2 border-b border-border flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "en" ? "tr" : "en")}
                className="h-9 w-9 shrink-0"
                title={t("Switch to Turkish", "İngilizce'ye Geç")}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Main Control Panel */}
            <div>
              <p className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                collapsed && "hidden"
              )}>
                {t("Control Panel", "Kontrol Paneli")}
              </p>
              <div className="space-y-1">
                {mainControlItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                      isActive(item.path, item.exact)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    onClick={() => setCollapsed(true)}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Branches */}
            <div>
              <p className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                collapsed && "hidden"
              )}>
                {t("Branches", "Şubeler")}
              </p>
              <div className="space-y-1">
                {branches.map((branch) => (
                  <Collapsible
                    key={branch.id}
                    open={openBranches[branch.id] || isBranchActive(branch.slug || "")}
                    onOpenChange={() => toggleBranch(branch.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                          isBranchActive(branch.slug || "")
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <Building2 className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate">
                              {language === "tr" && branch.name_tr ? branch.name_tr : branch.name}
                            </span>
                            {openBranches[branch.id] || isBranchActive(branch.slug || "") ? (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0" />
                            )}
                          </>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="pl-4 mt-1 space-y-1">
                        {getBranchItems(branch.slug || "").map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-xs",
                              isActive(item.path, item.exact)
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                            onClick={() => setCollapsed(true)}
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ))}
              </div>
            </div>
          </nav>

          {/* User & Logout */}
          <div className="p-3 border-t border-border">
            {!collapsed && user && (
              <div className="mb-2 px-3">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">{t("Super Admin", "Süper Yönetici")}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm",
                collapsed && "justify-center"
              )}
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
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
