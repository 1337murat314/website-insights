import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItemModifier {
  name: string;
  nameTr?: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  nameTr?: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers: CartItemModifier[];
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// No tax

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [tableNumber, setTableNumberState] = useState<string | null>(() => {
    return localStorage.getItem("tableNumber");
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem("tableNumber", tableNumber);
    } else {
      localStorage.removeItem("tableNumber");
    }
  }, [tableNumber]);

  const setTableNumber = (table: string | null) => {
    setTableNumberState(table);
  };

  const addItem = (item: Omit<CartItem, "id">) => {
    const id = `${item.menuItemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setItems((prev) => [...prev, { ...item, id }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setTableNumberState(null);
    localStorage.removeItem("tableNumber");
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      const modifiersTotal = item.modifiers.reduce((m, mod) => m + mod.priceAdjustment, 0);
      return sum + (item.price + modifiersTotal) * item.quantity;
    }, 0);
  };

  const getTax = () => {
    return 0;
  };

  const getTotal = () => {
    return getSubtotal();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        getTax,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
