import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, UtensilsCrossed, Leaf, Wheat, Flame } from "lucide-react";

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
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
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

const AdminMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>(defaultMenuItem);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({ name: "", name_tr: "", sort_order: 0, is_active: true });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (itemsRes.data) setMenuItems(itemsRes.data);
    setIsLoading(false);
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
      setEditingCategory({ name: "", name_tr: "", sort_order: 0, is_active: true });
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

  const getCategoryName = (categoryId: string | null) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant's menu items and categories</p>
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingItem(defaultMenuItem); setIsEditing(false); setIsItemDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : menuItems.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No menu items yet</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-border/50 ${!item.is_available ? "opacity-50" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{getCategoryName(item.category_id)}</p>
                        </div>
                        <span className="font-bold text-primary">${item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.is_vegetarian && <span className="flex items-center gap-1 text-xs text-green-500"><Leaf className="h-3 w-3" />Vegetarian</span>}
                        {item.is_vegan && <span className="flex items-center gap-1 text-xs text-green-600"><Leaf className="h-3 w-3" />Vegan</span>}
                        {item.is_gluten_free && <span className="flex items-center gap-1 text-xs text-amber-500"><Wheat className="h-3 w-3" />GF</span>}
                        {item.is_spicy && <span className="flex items-center gap-1 text-xs text-red-500"><Flame className="h-3 w-3" />Spicy</span>}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingItem(item); setIsEditing(true); setIsItemDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMenuItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingCategory({ name: "", name_tr: "", sort_order: 0, is_active: true }); setIsEditing(false); setIsCategoryDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className={`border-border/50 ${!category.is_active ? "opacity-50" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.name_tr && <p className="text-sm text-muted-foreground">{category.name_tr}</p>}
                    <p className="text-xs text-muted-foreground">Order: {category.sort_order}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingCategory(category); setIsEditing(true); setIsCategoryDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Label>Name (English)</Label>
              <Input value={editingItem.name || ""} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Name (Turkish)</Label>
              <Input value={editingItem.name_tr || ""} onChange={(e) => setEditingItem({ ...editingItem, name_tr: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description (English)</Label>
              <Textarea value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description (Turkish)</Label>
              <Textarea value={editingItem.description_tr || ""} onChange={(e) => setEditingItem({ ...editingItem, description_tr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" value={editingItem.price || ""} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editingItem.category_id || ""} onValueChange={(v) => setEditingItem({ ...editingItem, category_id: v || null })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Image URL</Label>
              <Input value={editingItem.image_url || ""} onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })} />
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_vegetarian} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_vegetarian: v })} />
                <Label>Vegetarian</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_vegan} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_vegan: v })} />
                <Label>Vegan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_gluten_free} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_gluten_free: v })} />
                <Label>Gluten-Free</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_spicy} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_spicy: v })} />
                <Label>Spicy</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_featured} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_featured: v })} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingItem.is_available} onCheckedChange={(v) => setEditingItem({ ...editingItem, is_available: v })} />
                <Label>Available</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveMenuItem}>{isEditing ? "Update" : "Create"}</Button>
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
            <div className="space-y-2">
              <Label>Name (English)</Label>
              <Input value={editingCategory.name || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Name (Turkish)</Label>
              <Input value={editingCategory.name_tr || ""} onChange={(e) => setEditingCategory({ ...editingCategory, name_tr: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input type="number" value={editingCategory.sort_order || 0} onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editingCategory.is_active} onCheckedChange={(v) => setEditingCategory({ ...editingCategory, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCategory}>{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
