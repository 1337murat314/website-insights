import { useState, useEffect, useMemo } from "react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, UtensilsCrossed, Search, ChevronDown, ChevronRight, Loader2, Check, X, Edit, DollarSign, Plus, Trash2, Leaf, Wheat, Flame, Star } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/admin/ImageUpload";

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
  description_tr: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  sort_order: number;
}

interface BranchMenuItem {
  id: string;
  branch_id: string;
  menu_item_id: string;
  is_available: boolean;
  price_override: number | null;
}

const defaultMenuItem: Partial<MenuItem> = {
  name: "",
  name_tr: "",
  description: "",
  description_tr: "",
  price: 0,
  image_url: "",
  is_vegetarian: false,
  is_vegan: false,
  is_gluten_free: false,
  is_spicy: false,
  is_featured: false,
  is_available: true,
  sort_order: 0,
  category_id: null,
};

const BranchMenu = () => {
  const { branch } = useBranch();
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branchMenuItems, setBranchMenuItems] = useState<BranchMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Price override dialog
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [pricingItem, setPricingItem] = useState<MenuItem | null>(null);
  const [priceOverride, setPriceOverride] = useState<string>("");

  // Item edit dialog
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>(defaultMenuItem);
  const [isEditing, setIsEditing] = useState(false);

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
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("branch_menu_items").select("*").eq("branch_id", branch.id),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setMenuItems(itemsRes.data);
    if (branchItemsRes.data) setBranchMenuItems(branchItemsRes.data);
    setIsLoading(false);
  };

  const getBranchItem = (menuItemId: string): BranchMenuItem | undefined => {
    return branchMenuItems.find((bi) => bi.menu_item_id === menuItemId);
  };

  const getBranchItemStatus = (menuItemId: string): boolean => {
    const branchItem = getBranchItem(menuItemId);
    return branchItem ? branchItem.is_available : true;
  };

  const getBranchItemPrice = (item: MenuItem): number => {
    const branchItem = getBranchItem(item.id);
    return branchItem?.price_override ?? item.price;
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

  const openPriceDialog = (item: MenuItem) => {
    setPricingItem(item);
    const branchItem = getBranchItem(item.id);
    setPriceOverride(branchItem?.price_override?.toString() || "");
    setIsPriceDialogOpen(true);
  };

  const savePriceOverride = async () => {
    if (!branch || !pricingItem) return;

    const newPrice = priceOverride ? parseFloat(priceOverride) : null;
    const existing = branchMenuItems.find((bi) => bi.menu_item_id === pricingItem.id);

    if (existing) {
      const { error } = await supabase
        .from("branch_menu_items")
        .update({ price_override: newPrice })
        .eq("id", existing.id);

      if (!error) {
        setBranchMenuItems((prev) =>
          prev.map((bi) => (bi.id === existing.id ? { ...bi, price_override: newPrice } : bi))
        );
        toast.success(t("Price updated", "Fiyat güncellendi"));
      }
    } else {
      const { data, error } = await supabase
        .from("branch_menu_items")
        .insert({ 
          menu_item_id: pricingItem.id, 
          branch_id: branch.id, 
          is_available: true,
          price_override: newPrice 
        })
        .select()
        .single();

      if (!error && data) {
        setBranchMenuItems((prev) => [...prev, data]);
        toast.success(t("Price set for this branch", "Bu şube için fiyat belirlendi"));
      }
    }

    setIsPriceDialogOpen(false);
    setPricingItem(null);
    setPriceOverride("");
  };

  // Item CRUD operations
  const openNewItem = (categoryId?: string) => {
    setEditingItem({ ...defaultMenuItem, category_id: categoryId || null });
    setIsEditing(false);
    setIsItemDialogOpen(true);
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditing(true);
    setIsItemDialogOpen(true);
  };

  const saveMenuItem = async () => {
    const itemData = {
      ...editingItem,
      price: Number(editingItem.price),
    };

    let error;
    if (isEditing && editingItem.id) {
      ({ error } = await supabase.from("menu_items").update(itemData).eq("id", editingItem.id));
    } else {
      ({ error } = await supabase.from("menu_items").insert([itemData as any]));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t(isEditing ? "Item updated" : "Item created", isEditing ? "Ürün güncellendi" : "Ürün oluşturuldu"));
      setIsItemDialogOpen(false);
      setEditingItem(defaultMenuItem);
      setIsEditing(false);
      fetchData();
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm(t("Delete this menu item?", "Bu menü öğesini sil?"))) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("Item deleted", "Ürün silindi"));
      fetchData();
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
    const withPriceOverride = branchMenuItems.filter((bi) => bi.price_override != null).length;
    return { total, enabled, disabled: total - enabled, withPriceOverride };
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
      <div className="flex items-center justify-between">
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
        <Button onClick={() => openNewItem()}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Item", "Ürün Ekle")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.withPriceOverride}</p>
            <p className="text-sm text-muted-foreground">{t("Custom Prices", "Özel Fiyat")}</p>
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {enabledCount}/{items.length} {t("enabled", "aktif")}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openNewItem(category.id); }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y">
                      {items.map((item) => {
                        const isEnabled = getBranchItemStatus(item.id);
                        const branchItem = getBranchItem(item.id);
                        const hasCustomPrice = branchItem?.price_override != null;
                        const displayPrice = getBranchItemPrice(item);

                        return (
                          <div key={item.id} className={`flex items-center justify-between py-3 ${!isEnabled ? "opacity-50" : ""}`}>
                            <div className="flex items-center gap-3">
                              {item.image_url && (
                                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{language === "tr" && item.name_tr ? item.name_tr : item.name}</p>
                                  {item.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                  {item.is_vegetarian && <Leaf className="h-4 w-4 text-green-500" />}
                                  {item.is_gluten_free && <Wheat className="h-4 w-4 text-amber-600" />}
                                  {item.is_spicy && <Flame className="h-4 w-4 text-red-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm ${hasCustomPrice ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                    ₺{displayPrice.toFixed(2)}
                                  </p>
                                  {hasCustomPrice && (
                                    <Badge variant="outline" className="text-xs">
                                      {t("Custom", "Özel")}
                                    </Badge>
                                  )}
                                  {hasCustomPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      ₺{item.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditItem(item)} title={t("Edit", "Düzenle")}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openPriceDialog(item)} title={t("Set Price", "Fiyat Belirle")}>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteMenuItem(item.id)} className="text-destructive" title={t("Delete", "Sil")}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Badge variant={isEnabled ? "default" : "secondary"} className="gap-1">
                                {isEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {isEnabled ? t("On", "Açık") : t("Off", "Kapalı")}
                              </Badge>
                              <Switch checked={isEnabled} onCheckedChange={() => toggleBranchItemAvailability(item.id)} />
                            </div>
                          </div>
                        );
                      })}
                      {items.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>{t("No items in this category", "Bu kategoride ürün yok")}</p>
                          <Button variant="link" onClick={() => openNewItem(category.id)}>
                            {t("Add first item", "İlk ürünü ekle")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Item Edit Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("Edit Menu Item", "Menü Öğesini Düzenle") : t("Add Menu Item", "Menü Öğesi Ekle")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Name (English)", "İsim (İngilizce)")}</Label>
                <Input
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label>{t("Name (Turkish)", "İsim (Türkçe)")}</Label>
                <Input
                  value={editingItem.name_tr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name_tr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Description (English)", "Açıklama (İngilizce)")}</Label>
                <Textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t("Description (Turkish)", "Açıklama (Türkçe)")}</Label>
                <Textarea
                  value={editingItem.description_tr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description_tr: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Price", "Fiyat")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingItem.price || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>{t("Category", "Kategori")}</Label>
                <Select
                  value={editingItem.category_id || "none"}
                  onValueChange={(value) => setEditingItem({ ...editingItem, category_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("Uncategorized", "Kategorisiz")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {language === "tr" && cat.name_tr ? cat.name_tr : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("Image", "Görsel")}</Label>
              <ImageUpload
                value={editingItem.image_url || ""}
                onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_vegetarian || false}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_vegetarian: checked })}
                />
                <Label className="flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-green-500" />
                  {t("Vegetarian", "Vejetaryen")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_vegan || false}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_vegan: checked })}
                />
                <Label>{t("Vegan", "Vegan")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_gluten_free || false}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_gluten_free: checked })}
                />
                <Label className="flex items-center gap-1">
                  <Wheat className="h-4 w-4 text-amber-600" />
                  {t("GF", "GF")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_spicy || false}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_spicy: checked })}
                />
                <Label className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-red-500" />
                  {t("Spicy", "Acılı")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingItem.is_featured || false}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_featured: checked })}
                />
                <Label className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {t("Featured", "Öne Çıkan")}
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingItem.is_available ?? true}
                onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_available: checked })}
              />
              <Label>{t("Available", "Mevcut")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>{t("Cancel", "İptal")}</Button>
            <Button onClick={saveMenuItem}>{t("Save", "Kaydet")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Price Override Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Set Branch Price", "Şube Fiyatı Belirle")}</DialogTitle>
          </DialogHeader>
          {pricingItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {pricingItem.image_url && (
                  <img src={pricingItem.image_url} alt={pricingItem.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold">{language === "tr" && pricingItem.name_tr ? pricingItem.name_tr : pricingItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("Default price", "Varsayılan fiyat")}: ₺{pricingItem.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <Label>{t("Branch Price (leave empty for default)", "Şube Fiyatı (varsayılan için boş bırakın)")}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">₺</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    placeholder={pricingItem.price.toFixed(2)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>{t("Cancel", "İptal")}</Button>
            <Button onClick={savePriceOverride}>{t("Save", "Kaydet")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchMenu;
