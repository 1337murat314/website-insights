import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  CalendarDays,
  UtensilsCrossed,
  Users,
  Settings,
  BarChart3,
  TableProperties,
  Search,
  Gift,
  PartyPopper,
  ScrollText,
  Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchResult {
  id: string;
  type: "reservation" | "guest" | "menu" | "table";
  title: string;
  subtitle?: string;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const searchData = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];

    // Search reservations
    const { data: reservations } = await supabase
      .from("reservations")
      .select("id, guest_name, guest_email, reservation_date")
      .or(`guest_name.ilike.%${searchQuery}%,guest_email.ilike.%${searchQuery}%`)
      .limit(5);

    reservations?.forEach((r) => {
      results.push({
        id: r.id,
        type: "reservation",
        title: r.guest_name,
        subtitle: `${r.reservation_date} • ${r.guest_email}`,
      });
    });

    // Search guests
    const { data: guests } = await supabase
      .from("guests")
      .select("id, full_name, email, vip_status")
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(5);

    guests?.forEach((g) => {
      results.push({
        id: g.id,
        type: "guest",
        title: g.full_name,
        subtitle: `${g.email}${g.vip_status ? " • VIP" : ""}`,
      });
    });

    // Search menu items
    const { data: menuItems } = await supabase
      .from("menu_items")
      .select("id, name, price")
      .ilike("name", `%${searchQuery}%`)
      .limit(5);

    menuItems?.forEach((m) => {
      results.push({
        id: m.id,
        type: "menu",
        title: m.name,
        subtitle: `$${m.price}`,
      });
    });

    setSearchResults(results);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchData(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, searchData]);

  const navigationItems = [
    { path: "/admin", label: t("Dashboard", "Kontrol Paneli"), icon: LayoutDashboard },
    { path: "/admin/reservations", label: t("Reservations", "Rezervasyonlar"), icon: CalendarDays },
    { path: "/admin/menu", label: t("Menu Management", "Menü Yönetimi"), icon: UtensilsCrossed },
    { path: "/admin/tables", label: t("Tables", "Masalar"), icon: TableProperties },
    { path: "/admin/guests", label: t("Guest CRM", "Misafir CRM"), icon: Crown },
    { path: "/admin/staff", label: t("Staff", "Personel"), icon: Users },
    { path: "/admin/analytics", label: t("Analytics", "Analitik"), icon: BarChart3 },
    { path: "/admin/promo-codes", label: t("Promo Codes", "Promosyon Kodları"), icon: Gift },
    { path: "/admin/events", label: t("Special Events", "Özel Etkinlikler"), icon: PartyPopper },
    { path: "/admin/audit-logs", label: t("Audit Logs", "Denetim Kayıtları"), icon: ScrollText },
    { path: "/admin/settings", label: t("Settings", "Ayarlar"), icon: Settings },
  ];

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    switch (result.type) {
      case "reservation":
        navigate("/admin/reservations");
        break;
      case "guest":
        navigate("/admin/guests");
        break;
      case "menu":
        navigate("/admin/menu");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{t("Search...", "Ara...")}</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t("Search reservations, guests, menu items...", "Rezervasyon, misafir, menü öğesi ara...")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t("No results found.", "Sonuç bulunamadı.")}</CommandEmpty>

          {searchResults.length > 0 && (
            <>
              <CommandGroup heading={t("Search Results", "Arama Sonuçları")}>
                {searchResults.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    {result.type === "reservation" && <CalendarDays className="mr-2 h-4 w-4" />}
                    {result.type === "guest" && <Crown className="mr-2 h-4 w-4" />}
                    {result.type === "menu" && <UtensilsCrossed className="mr-2 h-4 w-4" />}
                    <div className="flex flex-col">
                      <span>{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading={t("Navigation", "Navigasyon")}>
            {navigationItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => {
                  setOpen(false);
                  navigate(item.path);
                }}
                className="cursor-pointer"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
