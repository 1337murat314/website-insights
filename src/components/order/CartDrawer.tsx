import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { language, t } = useLanguage();
  const { items, removeItem, updateQuantity, getSubtotal, getTax, getTotal, getTotalItems } = useCart();

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
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-xl font-bold">
                  {t("Your Cart", "Sepetiniz")}
                </h2>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {getTotalItems()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    {t("Your cart is empty", "Sepetiniz boş")}
                  </p>
                  <Button onClick={onClose} variant="outline">
                    {t("Browse Menu", "Menüyü İncele")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const modifiersTotal = item.modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
                    const itemTotal = (item.price + modifiersTotal) * item.quantity;
                    
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4 p-4 bg-background rounded-xl"
                      >
                        {/* Image */}
                        {item.image && (
                          <img
                            src={item.image}
                            alt={language === "en" ? item.name : item.nameTr || item.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {language === "en" ? item.name : item.nameTr || item.name}
                          </h3>
                          
                          {/* Modifiers */}
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.modifiers.map((m) => 
                                language === "en" ? m.name : m.nameTr || m.name
                              ).join(", ")}
                            </p>
                          )}
                          
                          {/* Special Instructions */}
                          {item.specialInstructions && (
                            <p className="text-xs text-primary mt-1 italic">
                              "{item.specialInstructions}"
                            </p>
                          )}
                          
                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-primary font-bold">
                                ₺{itemTotal.toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-card space-y-4">
                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("Subtotal", "Ara Toplam")}</span>
                    <span>₺{getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("Tax (8%)", "KDV (%8)")}</span>
                    <span>₺{getTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                    <span>{t("Total", "Toplam")}</span>
                    <span className="text-primary">₺{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link to="/order/checkout" onClick={onClose}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold">
                    {t("Proceed to Checkout", "Siparişi Tamamla")}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
