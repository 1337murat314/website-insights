import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Leaf, Wheat, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MenuItemModal from "@/components/order/MenuItemModal";
import { MENU_CATEGORIES, MENU_ITEMS } from "@/lib/constants";

interface MenuItem {
  id: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_vegetarian: boolean | null;
  is_vegan: boolean | null;
  is_spicy: boolean | null;
  is_gluten_free: boolean | null;
}

interface Category {
  id: string;
  name: string;
  name_tr: string | null;
}

const Menu = () => {
  const { language, t } = useLanguage();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        supabase.from("menu_items").select("*").eq("is_available", true).order("sort_order"),
        supabase.from("menu_categories").select("*").eq("is_active", true).order("sort_order"),
      ]);

      if (itemsRes.data && itemsRes.data.length > 0) {
        setMenuItems(itemsRes.data);
      }
      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Always use database items and categories since they're available
  const displayItems = menuItems;
  const displayCategories = categories;

  const filteredItems = displayItems.filter((item) => {
    const categoryMatch = !activeCategory || item.category_id === activeCategory;
    const searchMatch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name_tr && item.name_tr.toLowerCase().includes(searchQuery.toLowerCase()));
    const dietaryMatch =
      !dietaryFilter ||
      (dietaryFilter === "vegetarian" && item.is_vegetarian) ||
      (dietaryFilter === "vegan" && item.is_vegan) ||
      (dietaryFilter === "spicy" && item.is_spicy) ||
      (dietaryFilter === "gluten-free" && item.is_gluten_free);
    return categoryMatch && searchMatch && dietaryMatch;
  });

  const dietaryFilters = [
    { id: "vegetarian", label: t("Vegetarian", "Vejetaryen"), icon: Leaf },
    { id: "vegan", label: t("Vegan", "Vegan"), icon: Leaf },
    { id: "spicy", label: t("Spicy", "Acılı"), icon: Flame },
    { id: "gluten-free", label: t("Gluten-Free", "Glutensiz"), icon: Wheat },
  ];

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 bg-charcoal">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920"
            alt="Menu background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto container-padding relative text-center text-cream">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-medium tracking-widest uppercase text-sm mb-4"
          >
            {t("Discover Our", "Keşfedin")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold"
          >
            {t("Menu", "Menümüzü")}
          </motion.h1>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-6 bg-secondary sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto container-padding">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("Search menu...", "Menüde ara...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-background border-border"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {t("All", "Tümü")}
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {language === "en" ? cat.name : cat.name_tr || cat.name}
              </button>
            ))}
          </div>

          {/* Dietary Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {dietaryFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDietaryFilter(dietaryFilter === filter.id ? null : filter.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  dietaryFilter === filter.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <filter.icon className="w-3 h-3" />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className="group bg-card rounded-2xl overflow-hidden shadow-lg hover-lift cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                      alt={language === "en" ? item.name : item.name_tr || item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      {item.is_vegetarian && (
                        <Badge variant="secondary" className="bg-green-500/90 text-white">
                          <Leaf className="w-3 h-3 mr-1" />
                          {t("Veg", "Vej")}
                        </Badge>
                      )}
                      {item.is_spicy && (
                        <Badge variant="secondary" className="bg-red-500/90 text-white">
                          <Flame className="w-3 h-3 mr-1" />
                          {t("Spicy", "Acı")}
                        </Badge>
                      )}
                      {item.is_gluten_free && (
                        <Badge variant="secondary" className="bg-amber-500/90 text-white">
                          <Wheat className="w-3 h-3 mr-1" />
                          GF
                        </Badge>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <span className="text-foreground font-medium">
                        {t("Click for details", "Detaylar için tıkla")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif text-xl font-semibold text-foreground">
                        {language === "en" ? item.name : item.name_tr || item.name}
                      </h3>
                      <span className="text-primary font-bold text-xl">₺{item.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {language === "en" ? item.description : item.description_tr || item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {t("No items found with current filters.", "Seçili filtrelere uygun ürün bulunamadı.")}
              </p>
              <Button onClick={() => { setActiveCategory(null); setDietaryFilter(null); setSearchQuery(""); }} className="mt-4">
                {t("Clear Filters", "Filtreleri Temizle")}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Menu Item Modal */}
      <MenuItemModal
        item={selectedItem ? {
          id: selectedItem.id,
          name: selectedItem.name,
          nameTr: selectedItem.name_tr || undefined,
          description: selectedItem.description || undefined,
          descriptionTr: selectedItem.description_tr || undefined,
          price: selectedItem.price,
          image: selectedItem.image_url || undefined,
          isVegetarian: selectedItem.is_vegetarian || undefined,
          isVegan: selectedItem.is_vegan || undefined,
          isSpicy: selectedItem.is_spicy || undefined,
          isGlutenFree: selectedItem.is_gluten_free || undefined,
        } : null}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
      />
    </Layout>
  );
};

export default Menu;