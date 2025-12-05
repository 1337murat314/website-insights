import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { MENU_ITEMS, MENU_CATEGORIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const Menu = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const dietaryMatch = !dietaryFilter || item.tags.includes(dietaryFilter);
    return categoryMatch && dietaryMatch;
  });

  const dietaryTags = ["vegetarian", "vegan", "gluten-free", "spicy"];

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
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4">
            {t("Discover Our", "Keşfedin")}
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold">
            {t("Menu", "Menümüzü")}
          </h1>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-secondary sticky top-20 z-40 border-b border-border">
        <div className="container mx-auto container-padding">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {language === "en" ? cat.nameEn : cat.nameTr}
              </button>
            ))}
          </div>

          {/* Dietary Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {dietaryTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setDietaryFilter(dietaryFilter === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  dietaryFilter === tag
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="section-padding bg-background">
        <div className="container mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-lg hover-lift"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={language === "en" ? item.name : item.nameTr}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif text-xl font-semibold text-foreground">
                      {language === "en" ? item.name : item.nameTr}
                    </h3>
                    <span className="text-primary font-bold text-xl">₺{item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === "en" ? item.description : item.descriptionTr}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {t("No items found with current filters.", "Seçili filtrelere uygun ürün bulunamadı.")}
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Menu;