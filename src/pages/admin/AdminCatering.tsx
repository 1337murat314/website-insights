import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, ChefHat, Package } from "lucide-react";
import { toast } from "sonner";

interface CateringProduct {
  id: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
  category: string;
  category_tr: string | null;
  unit: string;
  unit_tr: string | null;
  price_per_unit: number;
  min_quantity: number;
  max_quantity: number | null;
  is_available: boolean;
  sort_order: number;
}

const CATEGORIES = [
  { en: "Main Dishes", tr: "Ana Yemekler" },
  { en: "Appetizers", tr: "Mezeler" },
  { en: "Salads", tr: "Salatalar" },
  { en: "Desserts", tr: "Tatlılar" },
  { en: "Beverages", tr: "İçecekler" },
  { en: "Services", tr: "Hizmetler" },
];

const UNITS = [
  { en: "person", tr: "kişi" },
  { en: "kg", tr: "kg" },
  { en: "portion", tr: "porsiyon" },
  { en: "liter", tr: "litre" },
  { en: "hour", tr: "saat" },
  { en: "package", tr: "paket" },
];

const defaultFormData = {
  name: "",
  name_tr: "",
  description: "",
  description_tr: "",
  category: "Main Dishes",
  category_tr: "Ana Yemekler",
  unit: "person",
  unit_tr: "kişi",
  price_per_unit: 0,
  min_quantity: 1,
  max_quantity: null as number | null,
  is_available: true,
  sort_order: 0,
};

export default function AdminCatering() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<CateringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CateringProduct | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catering_products")
      .select("*")
      .order("sort_order");

    if (error) {
      toast.error(t("Failed to load products", "Ürünler yüklenemedi"));
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || formData.price_per_unit < 0) {
      toast.error(t("Please fill in all required fields", "Lütfen tüm zorunlu alanları doldurun"));
      return;
    }

    setSaving(true);
    const productData = {
      name: formData.name,
      name_tr: formData.name_tr || null,
      description: formData.description || null,
      description_tr: formData.description_tr || null,
      category: formData.category,
      category_tr: formData.category_tr || null,
      unit: formData.unit,
      unit_tr: formData.unit_tr || null,
      price_per_unit: formData.price_per_unit,
      min_quantity: formData.min_quantity,
      max_quantity: formData.max_quantity || null,
      is_available: formData.is_available,
      sort_order: formData.sort_order,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("catering_products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error(t("Failed to update product", "Ürün güncellenemedi"));
      } else {
        toast.success(t("Product updated", "Ürün güncellendi"));
        setDialogOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("catering_products").insert(productData);

      if (error) {
        toast.error(t("Failed to create product", "Ürün oluşturulamadı"));
      } else {
        toast.success(t("Product created", "Ürün oluşturuldu"));
        setDialogOpen(false);
        fetchProducts();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("Are you sure you want to delete this product?", "Bu ürünü silmek istediğinizden emin misiniz?"))) {
      return;
    }

    const { error } = await supabase.from("catering_products").delete().eq("id", id);

    if (error) {
      toast.error(t("Failed to delete product", "Ürün silinemedi"));
    } else {
      toast.success(t("Product deleted", "Ürün silindi"));
      fetchProducts();
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("catering_products")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error(t("Failed to update availability", "Durum güncellenemedi"));
    } else {
      fetchProducts();
    }
  };

  const openEditDialog = (product: CateringProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_tr: product.name_tr || "",
      description: product.description || "",
      description_tr: product.description_tr || "",
      category: product.category,
      category_tr: product.category_tr || "",
      unit: product.unit,
      unit_tr: product.unit_tr || "",
      price_per_unit: product.price_per_unit,
      min_quantity: product.min_quantity,
      max_quantity: product.max_quantity,
      is_available: product.is_available,
      sort_order: product.sort_order,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const handleCategoryChange = (category: string) => {
    const categoryData = CATEGORIES.find((c) => c.en === category);
    setFormData({
      ...formData,
      category,
      category_tr: categoryData?.tr || "",
    });
  };

  const handleUnitChange = (unit: string) => {
    const unitData = UNITS.find((u) => u.en === unit);
    setFormData({
      ...formData,
      unit,
      unit_tr: unitData?.tr || "",
    });
  };

  const filteredProducts =
    filterCategory === "all"
      ? products
      : products.filter((p) => p.category === filterCategory);

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = language === "tr" && product.category_tr ? product.category_tr : product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, CateringProduct[]>);

  const stats = {
    total: products.length,
    available: products.filter((p) => p.is_available).length,
    categories: new Set(products.map((p) => p.category)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            {t("Catering Products", "Catering Ürünleri")}
          </h1>
          <p className="text-muted-foreground">
            {t("Manage catering products and pricing", "Catering ürünlerini ve fiyatlarını yönetin")}
          </p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Product", "Ürün Ekle")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Total Products", "Toplam Ürün")}</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Available", "Mevcut")}</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Categories", "Kategoriler")}</CardDescription>
            <CardTitle className="text-3xl">{stats.categories}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>{t("Filter by Category", "Kategoriye Göre Filtrele")}</Label>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Categories", "Tüm Kategoriler")}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.en} value={cat.en}>
                {language === "tr" ? cat.tr : cat.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Product", "Ürün")}</TableHead>
                  <TableHead>{t("Category", "Kategori")}</TableHead>
                  <TableHead>{t("Unit", "Birim")}</TableHead>
                  <TableHead className="text-right">{t("Price", "Fiyat")}</TableHead>
                  <TableHead className="text-center">{t("Min Qty", "Min Adet")}</TableHead>
                  <TableHead className="text-center">{t("Available", "Mevcut")}</TableHead>
                  <TableHead className="text-right">{t("Actions", "İşlemler")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("No products found", "Ürün bulunamadı")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {language === "tr" && product.name_tr ? product.name_tr : product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {language === "tr" && product.description_tr
                                ? product.description_tr
                                : product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {language === "tr" && product.category_tr
                            ? product.category_tr
                            : product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {language === "tr" && product.unit_tr ? product.unit_tr : product.unit}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₺{product.price_per_unit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">{product.min_quantity}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={product.is_available}
                          onCheckedChange={() =>
                            handleToggleAvailability(product.id, product.is_available)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? t("Edit Product", "Ürünü Düzenle")
                : t("Add New Product", "Yeni Ürün Ekle")}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Name (English)", "İsim (İngilizce)")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_tr">{t("Name (Turkish)", "İsim (Türkçe)")}</Label>
                <Input
                  id="name_tr"
                  value={formData.name_tr}
                  onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description">{t("Description (English)", "Açıklama (İngilizce)")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_tr">{t("Description (Turkish)", "Açıklama (Türkçe)")}</Label>
                <Textarea
                  id="description_tr"
                  value={formData.description_tr}
                  onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("Category", "Kategori")} *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.en} value={cat.en}>
                        {language === "tr" ? cat.tr : cat.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("Unit", "Birim")} *</Label>
                <Select value={formData.unit} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.en} value={unit.en}>
                        {language === "tr" ? unit.tr : unit.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">{t("Price per Unit (₺)", "Birim Fiyatı (₺)")} *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_unit: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_quantity">{t("Min Quantity", "Min Miktar")}</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  min="1"
                  value={formData.min_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_quantity">{t("Max Quantity", "Max Miktar")}</Label>
                <Input
                  id="max_quantity"
                  type="number"
                  min="0"
                  value={formData.max_quantity || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_quantity: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder={t("No limit", "Sınırsız")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sort_order">{t("Sort Order", "Sıralama")}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="is_available" className="cursor-pointer">
                  {t("Available for ordering", "Sipariş için mevcut")}
                </Label>
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("Cancel", "İptal")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingProduct ? t("Save Changes", "Değişiklikleri Kaydet") : t("Create Product", "Ürün Oluştur")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
