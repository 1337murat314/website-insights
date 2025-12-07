import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

const FloatingReserveButton = () => {
  const { t } = useLanguage();
  const { tableNumber } = useCart();

  // Hide the reserve button when ordering from a table (QR code scan)
  if (tableNumber) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link to="/reservations">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-3 rounded-full shadow-2xl shadow-accent/30 font-semibold"
        >
          <Calendar className="w-5 h-5" />
          <span>{t("Reserve Table", "Masa Ayırt")}</span>
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default FloatingReserveButton;