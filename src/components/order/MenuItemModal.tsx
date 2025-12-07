import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Flame, Leaf, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart, CartItemModifier } from "@/contexts/CartContext";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  nameTr?: string;
  description?: string;
  descriptionTr?: string;
  price: number;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  isGlutenFree?: boolean;
}

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemModal = ({ item, isOpen, onClose }: MenuItemModalProps) => {
  const { language, t } = useLanguage();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState<CartItemModifier[]>([]);

  if (!item) return null;

  const handleAddToCart = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      nameTr: item.nameTr,
      price: item.price,
      quantity,
      image: item.image,
      modifiers: selectedModifiers,
      specialInstructions: specialInstructions || undefined,
    });
    toast.success(t("Added to cart!", "Sepete eklendi!"));
    onClose();
    setQuantity(1);
    setSpecialInstructions("");
    setSelectedModifiers([]);
  };

  const totalPrice = (item.price + selectedModifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)) * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full bg-card rounded-2xl overflow-hidden z-50 max-h-[90vh] flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            {item.image && (
              <div className="relative h-64 flex-shrink-0">
                <img
                  src={item.image}
                  alt={language === "en" ? item.name : item.nameTr || item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Header */}
              <div className="mb-4">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {language === "en" ? item.name : item.nameTr || item.name}
                </h2>
                <p className="text-primary text-2xl font-bold">₺{item.price}</p>
              </div>

              {/* Dietary Icons */}
              <div className="flex gap-2 mb-4">
                {item.isVegetarian && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                    <Leaf className="w-3 h-3" />
                    {t("Vegetarian", "Vejetaryen")}
                  </span>
                )}
                {item.isVegan && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-xs">
                    <Leaf className="w-3 h-3" />
                    {t("Vegan", "Vegan")}
                  </span>
                )}
                {item.isSpicy && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">
                    <Flame className="w-3 h-3" />
                    {t("Spicy", "Acılı")}
                  </span>
                )}
                {item.isGlutenFree && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-500 rounded-full text-xs">
                    <Wheat className="w-3 h-3" />
                    {t("Gluten-Free", "Glutensiz")}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">
                {language === "en" ? item.description : item.descriptionTr || item.description}
              </p>

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("Special Instructions", "Özel İstekler")}
                </label>
                <Textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t("Any allergies or special requests?", "Alerji veya özel istek var mı?")}
                  className="bg-background border-border"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-foreground">
                  {t("Quantity", "Adet")}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-card flex-shrink-0">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
              >
                {t("Add to Cart", "Sepete Ekle")} - ₺{totalPrice.toFixed(2)}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuItemModal;
