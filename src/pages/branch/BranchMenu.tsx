import { useState, useEffect, useMemo } from "react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, UtensilsCrossed, Search, ChevronDown, ChevronRight, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  name_tr: string | null;
  sort_order: number;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  name_tr: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
}

interface BranchMenuItem {
  id: string;
  branch_id: string;
  menu_item_id: string;
  is_available: boolean;
  price_override: number | null;
}

const BranchMenu = () => {
  const { branch } = useBranch();
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branchMenuItems, setBranchMenuItems] = useState<BranchMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (branch) {
      fetchData();
    }
  }, [branch]);

  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map((c) => c.id)));
    }
  }, [categories]);

  const fetchData = async () => {
    if (!branch) return;
    setIsLoading(true);

    const [categoriesRes, itemsRes, branchItemsRes] = await Promise.all([
      supabase.from("menu_categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("menu_items").select("*").eq("is_available", true).order("sort_order"),
      supabase.from("branch_menu_items").select("*").eq("branch_id", branch.id),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setMenuItems(itemsRes.data);
    if (branchItemsRes.data) setBranchMenuItems(branchItemsRes.data);
    setIsLoading(false);
  };

  const getBranchItemStatus = (menuItemId: string): boolean => {
    const branchItem = branchMenuItems.find((bi) => bi.menu_item_id === menuItemId);
    return branchItem ? branchItem.is_available : true;
  };

  const toggleBranchItemAvailability = async (menuItemId: string) => {
    if (!branch) return;

    const existing = branchMenuItems.find((bi) => bi.menu_item_id === menuItemId);

    if (existing) {
      const { error } = await supabase
        .from("branch_menu_items")
        .update({ is_available: !existing.is_available })
        .eq("id", existing.id);

      if (!error) {
        setBranchMenuItems((prev) =>
          prev.map((bi) => (bi.id === existing.id ? { ...bi, is_available: !bi.is_available } : bi))
        );
        toast.success(t("Item availability updated", "Ürün durumu güncellendi"));
      }
    } else {
      const { data, error } = await supabase
        .from("branch_menu_items")
        .insert({ menu_item_id: menuItemId, branch_id: branch.id, is_available: false })
        .select()
        .single();

      if (!error && data) {
        setBranchMenuItems((prev) => [...prev, data]);
        toast.success(t("Item disabled for this branch", "Ürün bu şube için devre dışı bırakıldı"));
      }
    }
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    categories.forEach((cat) => (groups[cat.id] = []));
    groups["uncategorized"] = [];

    menuItems.forEach((item) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && !item.name_tr?.toLowerCase().includes(query)) {
          return;
        }
      }
      const categoryId = item.category_id || "uncategorized";
      if (!groups[categoryId]) groups[categoryId] = [];
      groups[categoryId].push(item);
    });

    return groups;
  }, [menuItems, categories, searchQuery]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const stats = useMemo(() => {
    const total = menuItems.length;
    const enabled = menuItems.filter((item) => getBranchItemStatus(item.id)).length;
    return { total, enabled, disabled: total - enabled };
  }, [menuItems, branchMenuItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t("Branch Menu", "Şube Menüsü")}</h1>
          {branch && (
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {branch.name}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t("Total Items", "Toplam Ürün")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.enabled}</p>
            <p className="text-sm text-muted-foreground">{t("Enabled", "Aktif")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.disabled}</p>
            <p className="text-sm text-muted-foreground">{t("Disabled", "Devre Dışı")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("Search menu items...", "Menü ürünlerini ara...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => {
          const items = groupedItems[category.id] || [];
          if (items.length === 0) return null;

          const isExpanded = expandedCategories.has(category.id);
          const enabledCount = items.filter((item) => getBranchItemStatus(item.id)).length;

          return (
            <Collapsible key={category.id} open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <CardTitle className="text-lg">
                          {language === "tr" && category.name_tr ? category.name_tr : category.name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {enabledCount}/{items.length} {t("enabled", "aktif")}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {items.map((item) => {
                        const isEnabled = getBranchItemStatus(item.id);
                        return (
                          <div key={item.id} className={`flex items-center justify-between py-3 ${!isEnabled ? "opacity-50" : ""}`}>
                            <div className="flex items-center gap-3">
                              {item.image_url && (
                                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-medium">{language === "tr" && item.name_tr ? item.name_tr : item.name}</p>
                                <p className="text-sm text-muted-foreground">₺{item.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={isEnabled ? "default" : "secondary"} className="gap-1">
                                {isEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {isEnabled ? t("Enabled", "Aktif") : t("Disabled", "Devre Dışı")}
                              </Badge>
                              <Switch checked={isEnabled} onCheckedChange={() => toggleBranchItemAvailability(item.id)} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default BranchMenu;
