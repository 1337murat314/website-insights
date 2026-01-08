import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Edit, Trash2, UtensilsCrossed, Leaf, Wheat, Flame, Image, 
  Search, ChevronDown, ChevronRight, Eye, EyeOff, Star, GripVertical,
  ArrowUp, ArrowDown, Copy, MoreVertical, RefreshCw, Filter, Package,
  Ruler, MapPin, Check, X
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ImageUpload from "@/components/admin/ImageUpload";

interface Category {
  id: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
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
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  has_sizes?: boolean;
}

interface MenuItemSize {
  id: string;
  menu_item_id: string;
  name: string;
  name_tr: string | null;
  price_adjustment: number;
  is_default: boolean;
  sort_order: number;
}

interface Branch {
  id: string;
  name: string;
  name_tr: string | null;
  is_active: boolean;
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
  has_sizes: false,
};

const defaultCategory: Partial<Category> = {
  name: "",
  name_tr: "",
  description: "",
  description_tr: "",
  sort_order: 0,
  is_active: true,
};

const AdminMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchMenuItems, setBranchMenuItems] = useState<BranchMenuItem[]>([]);
  const [itemSizes, setItemSizes] = useState<MenuItemSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSizesDialogOpen, setIsSizesDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>(defaultMenuItem);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>(defaultCategory);
  const [editingSizes, setEditingSizes] = useState<MenuItemSize[]>([]);
  const [sizesItemId, setSizesItemId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAvailable, setFilterAvailable] = useState<"all" | "available" | "unavailable">("all");
  const [filterFeatured, setFilterFeatured] = useState<boolean | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("organized");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  // Expand all categories by default on load
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set(categories.map(c => c.id)));
    }
  }, [categories]);

  const fetchData = async () => {
    setIsLoading(true);
    const [categoriesRes, itemsRes, branchesRes, branchItemsRes, sizesRes] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("branches").select("*").order("sort_order"),
      supabase.from("branch_menu_items").select("*"),
      supabase.from("menu_item_sizes").select("*").order("sort_order"),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setMenuItems(itemsRes.data);
    if (branchesRes.data) {
      setBranches(branchesRes.data);
      if (!selectedBranch && branchesRes.data.length > 0) {
        setSelectedBranch(branchesRes.data[0].id);
      }
    }
    if (branchItemsRes.data) setBranchMenuItems(branchItemsRes.data);
    if (sizesRes.data) setItemSizes(sizesRes.data);
    setIsLoading(false);
  };

  // Size management functions
  const openSizesDialog = (itemId: string) => {
    const sizes = itemSizes.filter(s => s.menu_item_id === itemId);
    setEditingSizes(sizes.length > 0 ? sizes : [
      { id: '', menu_item_id: itemId, name: 'Small', name_tr: 'Küçük', price_adjustment: 0, is_default: true, sort_order: 0 },
      { id: '', menu_item_id: itemId, name: 'Medium', name_tr: 'Orta', price_adjustment: 50, is_default: false, sort_order: 1 },
      { id: '', menu_item_id: itemId, name: 'Large', name_tr: 'Büyük', price_adjustment: 100, is_default: false, sort_order: 2 },
    ]);
    setSizesItemId(itemId);
    setIsSizesDialogOpen(true);
  };

  const saveSizes = async () => {
    if (!sizesItemId) return;
    
    // Delete existing sizes for this item
    await supabase.from("menu_item_sizes").delete().eq("menu_item_id", sizesItemId);
    
    // Insert new sizes
    const sizesToInsert = editingSizes.map((s, idx) => ({
      menu_item_id: sizesItemId,
      name: s.name,
      name_tr: s.name_tr,
      price_adjustment: s.price_adjustment,
      is_default: s.is_default,
      sort_order: idx,
    }));
    
    const { error: sizesError } = await supabase.from("menu_item_sizes").insert(sizesToInsert);
    
    // Update the menu item to have has_sizes = true
    const { error: itemError } = await supabase.from("menu_items").update({ has_sizes: true }).eq("id", sizesItemId);
    
    if (sizesError || itemError) {
      toast({ title: "Error", description: "Failed to save sizes", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Sizes saved successfully" });
      setIsSizesDialogOpen(false);
      fetchData();
    }
  };

  const removeSizes = async () => {
    if (!sizesItemId) return;
    
    await supabase.from("menu_item_sizes").delete().eq("menu_item_id", sizesItemId);
    await supabase.from("menu_items").update({ has_sizes: false }).eq("id", sizesItemId);
    
    toast({ title: "Sizes removed", description: "Item no longer has size options" });
    setIsSizesDialogOpen(false);
    fetchData();
  };

  // Branch menu functions
  const getBranchItemStatus = (menuItemId: string, branchId: string): boolean => {
    const branchItem = branchMenuItems.find(bi => bi.menu_item_id === menuItemId && bi.branch_id === branchId);
    // If no branch item exists, item is available by default
    return branchItem ? branchItem.is_available : true;
  };

  const toggleBranchItemAvailability = async (menuItemId: string, branchId: string) => {
    const existing = branchMenuItems.find(bi => bi.menu_item_id === menuItemId && bi.branch_id === branchId);
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("branch_menu_items")
        .update({ is_available: !existing.is_available })
        .eq("id", existing.id);
      
      if (!error) {
        setBranchMenuItems(prev => prev.map(bi => 
          bi.id === existing.id ? { ...bi, is_available: !bi.is_available } : bi
        ));
      }
    } else {
      // Create new (disabled)
      const { data, error } = await supabase
        .from("branch_menu_items")
        .insert({ menu_item_id: menuItemId, branch_id: branchId, is_available: false })
        .select()
        .single();
      
      if (!error && data) {
        setBranchMenuItems(prev => [...prev, data]);
      }
    }
  };

  // Grouped items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    
    // Initialize with all categories
    categories.forEach(cat => {
      groups[cat.id] = [];
    });
    groups["uncategorized"] = [];

    // Filter and group items
    menuItems.forEach(item => {
      // Apply filters
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && 
            !(item.name_tr?.toLowerCase().includes(query)) &&
            !(item.description?.toLowerCase().includes(query))) {
          return;
        }
      }
      if (filterAvailable === "available" && !item.is_available) return;
      if (filterAvailable === "unavailable" && item.is_available) return;
      if (filterFeatured === true && !item.is_featured) return;
      if (filterFeatured === false && item.is_featured) return;

      const categoryId = item.category_id || "uncategorized";
      if (!groups[categoryId]) groups[categoryId] = [];
      groups[categoryId].push(item);
    });

    // Sort items within each group
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.sort_order - b.sort_order);
    });

    return groups;
  }, [menuItems, categories, searchQuery, filterAvailable, filterFeatured]);

  const stats = useMemo(() => ({
    total: menuItems.length,
    available: menuItems.filter(i => i.is_available).length,
    unavailable: menuItems.filter(i => !i.is_available).length,
    featured: menuItems.filter(i => i.is_featured).length,
    categories: categories.length,
  }), [menuItems, categories]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => setExpandedCategories(new Set([...categories.map(c => c.id), "uncategorized"]));
  const collapseAll = () => setExpandedCategories(new Set());

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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Menu item ${isEditing ? "updated" : "created"}` });
      setIsItemDialogOpen(false);
      setEditingItem(defaultMenuItem);
      setIsEditing(false);
      fetchData();
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Menu item deleted" });
      fetchData();
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
      toast({ title: item.is_available ? "Item hidden" : "Item visible", description: item.name });
    }
  };

  const toggleItemFeatured = async (item: MenuItem) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ is_featured: !item.is_featured })
      .eq("id", item.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i));
      toast({ title: item.is_featured ? "Removed from featured" : "Added to featured", description: item.name });
    }
  };

  const duplicateItem = async (item: MenuItem) => {
    // Only include fields that should be duplicated, excluding id and timestamps
    const newItem = {
      name: `${item.name} (Copy)`,
      name_tr: item.name_tr ? `${item.name_tr} (Kopya)` : null,
      description: item.description,
      description_tr: item.description_tr,
      price: item.price,
      image_url: item.image_url,
      category_id: item.category_id,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_gluten_free: item.is_gluten_free,
      is_spicy: item.is_spicy,
      is_featured: false,
      is_available: item.is_available,
      sort_order: item.sort_order + 1,
    };
    
    const { error } = await supabase.from("menu_items").insert([newItem]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item duplicated", description: `${newItem.name} created` });
      fetchData();
    }
  };

  const moveItem = async (item: MenuItem, direction: "up" | "down") => {
    const categoryItems = groupedItems[item.category_id || "uncategorized"];
    const currentIndex = categoryItems.findIndex(i => i.id === item.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (swapIndex < 0 || swapIndex >= categoryItems.length) return;
    
    const swapItem = categoryItems[swapIndex];
    
    await Promise.all([
      supabase.from("menu_items").update({ sort_order: swapItem.sort_order }).eq("id", item.id),
      supabase.from("menu_items").update({ sort_order: item.sort_order }).eq("id", swapItem.id),
    ]);
    
    fetchData();
  };

  const saveCategory = async () => {
    let error;
    if (isEditing && editingCategory.id) {
      ({ error } = await supabase.from("menu_categories").update(editingCategory).eq("id", editingCategory.id));
    } else {
      ({ error } = await supabase.from("menu_categories").insert([editingCategory as any]));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Category ${isEditing ? "updated" : "created"}` });
      setIsCategoryDialogOpen(false);
      setEditingCategory(defaultCategory);
      setIsEditing(false);
      fetchData();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Items in this category will be uncategorized.")) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category deleted" });
      fetchData();
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    const { error } = await supabase
      .from("menu_categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, is_active: !c.is_active } : c));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || categoryId === "uncategorized") return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  const openNewItem = (categoryId?: string) => {
    setEditingItem({ ...defaultMenuItem, category_id: categoryId || null });
    setIsEditing(false);
    setIsItemDialogOpen(true);
  };

  const renderItemCard = (item: MenuItem, compact = false) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group bg-card rounded-lg border border-border hover:border-primary/50 transition-all overflow-hidden ${
        !item.is_available ? "opacity-60" : ""
      }`}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-20 h-20 shrink-0 bg-secondary/50">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
          {item.is_featured && (
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Star className="w-3 h-3 text-primary-foreground fill-current" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {item.name_tr && <p className="text-xs text-muted-foreground truncate">{item.name_tr}</p>}
            </div>
            <span className="font-bold text-primary text-sm shrink-0">₺{item.price}</span>
          </div>
          
          {/* Dietary badges */}
          <div className="flex flex-wrap gap-1 mt-1">
            {item.has_sizes && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-purple-500 text-purple-500"><Ruler className="w-2 h-2 mr-0.5" />Sizes</Badge>}
            {item.is_vegetarian && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-500 text-green-500"><Leaf className="w-2 h-2 mr-0.5" />V</Badge>}
            {item.is_vegan && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-green-600 text-green-600"><Leaf className="w-2 h-2 mr-0.5" />VG</Badge>}
            {item.is_gluten_free && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-amber-500 text-amber-500"><Wheat className="w-2 h-2 mr-0.5" />GF</Badge>}
            {item.is_spicy && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-red-500 text-red-500"><Flame className="w-2 h-2 mr-0.5" />🌶</Badge>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-0.5 p-1 border-l border-border bg-muted/30">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => toggleItemAvailability(item)}
            title={item.is_available ? "Hide item" : "Show item"}
          >
            {item.is_available ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => toggleItemFeatured(item)}
            title={item.is_featured ? "Unfeature" : "Feature"}
          >
            <Star className={`h-3 w-3 ${item.is_featured ? "fill-primary text-primary" : ""}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => { setEditingItem(item); setIsEditing(true); setIsItemDialogOpen(true); }}>
                <Edit className="h-3 w-3 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateItem(item)}>
                <Copy className="h-3 w-3 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSizesDialog(item.id)}>
                <Ruler className="h-3 w-3 mr-2" /> {item.has_sizes ? "Edit Sizes" : "Add Sizes"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => moveItem(item, "up")}>
                <ArrowUp className="h-3 w-3 mr-2" /> Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveItem(item, "down")}>
                <ArrowDown className="h-3 w-3 mr-2" /> Move Down
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteMenuItem(item.id)} className="text-destructive">
                <Trash2 className="h-3 w-3 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Organize your restaurant's menu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => openNewItem()}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Card className="p-3">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-500">{stats.available}</div>
          <div className="text-xs text-muted-foreground">Available</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-muted-foreground">{stats.unavailable}</div>
          <div className="text-xs text-muted-foreground">Hidden</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-primary">{stats.featured}</div>
          <div className="text-xs text-muted-foreground">Featured</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold">{stats.categories}</div>
          <div className="text-xs text-muted-foreground">Categories</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="organized">By Category</TabsTrigger>
          <TabsTrigger value="branches">Branch Menus</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Organized by Category Tab */}
        <TabsContent value="organized" className="space-y-4 mt-4">
          {/* Search & Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filterAvailable} onValueChange={(v: any) => setFilterAvailable(v)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={filterFeatured === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterFeatured(filterFeatured === true ? null : true)}
              className="h-9"
            >
              <Star className="h-3 w-3 mr-1" /> Featured
            </Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={expandAll} className="h-9 text-xs">Expand All</Button>
              <Button variant="ghost" size="sm" onClick={collapseAll} className="h-9 text-xs">Collapse</Button>
            </div>
          </div>

          {/* Categories with Items */}
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const items = groupedItems[category.id] || [];
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <Card key={category.id} className={`overflow-hidden ${!category.is_active ? "opacity-60" : ""}`}>
                    <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              {category.name_tr && <p className="text-xs text-muted-foreground">{category.name_tr}</p>}
                            </div>
                            <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
                            {!category.is_active && <Badge variant="outline" className="text-xs text-muted-foreground">Hidden</Badge>}
                          </div>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openNewItem(category.id)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCategory(category); setIsEditing(true); setIsCategoryDialogOpen(true); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <AnimatePresence>
                            {items.map((item) => renderItemCard(item))}
                          </AnimatePresence>
                          {items.length === 0 && (
                            <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                              No items in this category
                              <Button variant="link" size="sm" onClick={() => openNewItem(category.id)} className="ml-2">
                                Add one
                              </Button>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}

              {/* Uncategorized */}
              {(groupedItems["uncategorized"]?.length > 0 || !searchQuery) && (
                <Card className="overflow-hidden border-dashed">
                  <Collapsible open={expandedCategories.has("uncategorized")} onOpenChange={() => toggleCategory("uncategorized")}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {expandedCategories.has("uncategorized") ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <h3 className="font-semibold text-muted-foreground">Uncategorized</h3>
                          </div>
                          <Badge variant="secondary" className="text-xs">{groupedItems["uncategorized"]?.length || 0} items</Badge>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openNewItem(); }}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <AnimatePresence>
                          {(groupedItems["uncategorized"] || []).map((item) => renderItemCard(item))}
                        </AnimatePresence>
                        {(!groupedItems["uncategorized"] || groupedItems["uncategorized"].length === 0) && (
                          <div className="col-span-full text-center py-6 text-muted-foreground text-sm">
                            No uncategorized items
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Categories Management Tab */}
        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditingCategory(defaultCategory); setIsEditing(false); setIsCategoryDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((category, index) => (
              <Card key={category.id} className={`${!category.is_active ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={async () => {
                            const prevCat = categories[index - 1];
                            await Promise.all([
                              supabase.from("menu_categories").update({ sort_order: prevCat.sort_order }).eq("id", category.id),
                              supabase.from("menu_categories").update({ sort_order: category.sort_order }).eq("id", prevCat.id),
                            ]);
                            fetchData();
                          }}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs">{category.sort_order}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={index === categories.length - 1}
                          onClick={async () => {
                            const nextCat = categories[index + 1];
                            await Promise.all([
                              supabase.from("menu_categories").update({ sort_order: nextCat.sort_order }).eq("id", category.id),
                              supabase.from("menu_categories").update({ sort_order: category.sort_order }).eq("id", nextCat.id),
                            ]);
                            fetchData();
                          }}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        {category.name_tr && <p className="text-sm text-muted-foreground">{category.name_tr}</p>}
                        {category.description && <p className="text-xs text-muted-foreground mt-1">{category.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{groupedItems[category.id]?.length || 0} items</Badge>
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={() => toggleCategoryActive(category)}
                      />
                      <Button size="icon" variant="ghost" onClick={() => { setEditingCategory(category); setIsEditing(true); setIsCategoryDialogOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Branch Menus Tab */}
        <TabsContent value="branches" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              {branches.map(branch => (
                <Button
                  key={branch.id}
                  variant={selectedBranch === branch.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {branch.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Toggle items on/off for {branches.find(b => b.id === selectedBranch)?.name || "selected branch"}
            </p>
          </div>

          {selectedBranch && (
            <div className="space-y-3">
              {categories.filter(c => c.is_active).map(category => {
                const items = menuItems.filter(i => i.category_id === category.id && i.is_available);
                if (items.length === 0) return null;
                
                return (
                  <Card key={category.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {category.name}
                        <Badge variant="secondary" className="text-xs">{items.length} items</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map(item => {
                          const isEnabled = getBranchItemStatus(item.id, selectedBranch);
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                isEnabled ? "bg-green-500/10 border-green-500/30" : "bg-muted/50 border-border opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {item.image_url && (
                                  <img src={item.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">₺{item.price}</p>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant={isEnabled ? "default" : "outline"}
                                className="h-7 w-7 shrink-0"
                                onClick={() => toggleBranchItemAvailability(item.id, selectedBranch)}
                              >
                                {isEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Menu Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Menu Item</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name (English) *</Label>
              <Input value={editingItem.name || ""} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Name (Turkish)</Label>
              <Input value={editingItem.name_tr || ""} onChange={(e) => setEditingItem({ ...editingItem, name_tr: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description (English)</Label>
              <Textarea value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} rows={2} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description (Turkish)</Label>
              <Textarea value={editingItem.description_tr || ""} onChange={(e) => setEditingItem({ ...editingItem, description_tr: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Price (₺) *</Label>
              <Input type="number" step="0.01" value={editingItem.price || ""} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editingItem.category_id || "none"} onValueChange={(v) => setEditingItem({ ...editingItem, category_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={editingItem.sort_order || 0} onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Food Image</Label>
              <ImageUpload
                value={editingItem.image_url}
                onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
              />
            </div>
            <div className="col-span-2">
              <Label className="mb-3 block">Properties</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <Switch checked={editingItem.is_vegetarian} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_vegetarian: v })} />
                  <Label className="text-sm cursor-pointer">Vegetarian</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <Switch checked={editingItem.is_vegan} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_vegan: v })} />
                  <Label className="text-sm cursor-pointer">Vegan</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <Switch checked={editingItem.is_gluten_free} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_gluten_free: v })} />
                  <Label className="text-sm cursor-pointer">Gluten-Free</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                  <Switch checked={editingItem.is_spicy} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_spicy: v })} />
                  <Label className="text-sm cursor-pointer">Spicy</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-primary/5">
                  <Switch checked={editingItem.is_featured} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_featured: v })} />
                  <Label className="text-sm cursor-pointer">Featured</Label>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-green-500/5">
                  <Switch checked={editingItem.is_available} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_available: v })} />
                  <Label className="text-sm cursor-pointer">Available</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveMenuItem} disabled={!editingItem.name || !editingItem.price}>{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English) *</Label>
                <Input value={editingCategory.name || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Name (Turkish)</Label>
                <Input value={editingCategory.name_tr || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name_tr: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea value={editingCategory.description || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Description (Turkish)</Label>
              <Textarea value={editingCategory.description_tr || ""} onChange={(e) => setEditingCategory({ ...editingCategory, description_tr: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={editingCategory.sort_order || 0} onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={editingCategory.is_active} onCheckedChange={(v) => setEditingCategory({ ...editingCategory, is_active: v })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCategory} disabled={!editingCategory.name}>{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sizes Dialog */}
      <Dialog open={isSizesDialogOpen} onOpenChange={setIsSizesDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Manage Sizes
            </DialogTitle>
            <DialogDescription>
              Add size options with price adjustments. The base price is the item's default price.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {editingSizes.map((size, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Size name"
                    value={size.name}
                    onChange={(e) => {
                      const newSizes = [...editingSizes];
                      newSizes[index].name = e.target.value;
                      setEditingSizes(newSizes);
                    }}
                  />
                  <Input
                    placeholder="Turkish"
                    value={size.name_tr || ""}
                    onChange={(e) => {
                      const newSizes = [...editingSizes];
                      newSizes[index].name_tr = e.target.value;
                      setEditingSizes(newSizes);
                    }}
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+₺</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={size.price_adjustment}
                      onChange={(e) => {
                        const newSizes = [...editingSizes];
                        newSizes[index].price_adjustment = parseFloat(e.target.value) || 0;
                        setEditingSizes(newSizes);
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => {
                    setEditingSizes(editingSizes.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSizes([...editingSizes, {
                id: '',
                menu_item_id: sizesItemId || '',
                name: '',
                name_tr: '',
                price_adjustment: 0,
                is_default: false,
                sort_order: editingSizes.length,
              }])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Size
            </Button>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" size="sm" onClick={removeSizes}>
              Remove All Sizes
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSizesDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveSizes} disabled={editingSizes.length === 0 || editingSizes.some(s => !s.name)}>
                Save Sizes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;