import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface FloatingCartButtonProps {
  onClick: () => void;
}

const FloatingCartButton = ({ onClick }: FloatingCartButtonProps) => {
  const { getTotalItems, getTotal } = useCart();
  const { t } = useLanguage();
  const itemCount = getTotalItems();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-3 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-2xl shadow-primary/30"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-background text-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <span className="font-semibold">
            ₺{getTotal().toFixed(2)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartButton;
