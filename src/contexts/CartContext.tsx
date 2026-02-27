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
  branchSlug: string | null;
  branchId: string | null;
  setTableNumber: (table: string | null) => void;
  setBranchSlug: (slug: string | null) => void;
  setBranchId: (id: string | null) => void;
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

const safeStorage = {
  get: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore storage errors (private mode / quota / restricted webview)
    }
  },
  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  },
};

const getInitialCart = (): CartItem[] => {
  const saved = safeStorage.get("cart");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// No tax

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => getInitialCart());

  const [tableNumber, setTableNumberState] = useState<string | null>(() => {
    return safeStorage.get("tableNumber");
  });

  const [branchSlug, setBranchSlugState] = useState<string | null>(() => {
    return safeStorage.get("branchSlug");
  });

  const [branchId, setBranchIdState] = useState<string | null>(() => {
    return safeStorage.get("branchId");
  });

  useEffect(() => {
    safeStorage.set("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (tableNumber) {
      safeStorage.set("tableNumber", tableNumber);
    } else {
      safeStorage.remove("tableNumber");
    }
  }, [tableNumber]);

  useEffect(() => {
    if (branchSlug) {
      safeStorage.set("branchSlug", branchSlug);
    } else {
      safeStorage.remove("branchSlug");
    }
  }, [branchSlug]);

  useEffect(() => {
    if (branchId) {
      safeStorage.set("branchId", branchId);
    } else {
      safeStorage.remove("branchId");
    }
  }, [branchId]);

  const setTableNumber = (table: string | null) => {
    setTableNumberState(table);
  };

  const setBranchSlug = (slug: string | null) => {
    setBranchSlugState(slug);
  };

  const setBranchId = (id: string | null) => {
    setBranchIdState(id);
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
    setBranchSlugState(null);
    setBranchIdState(null);
    safeStorage.remove("tableNumber");
    safeStorage.remove("branchSlug");
    safeStorage.remove("branchId");
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
        branchSlug,
        branchId,
        setTableNumber,
        setBranchSlug,
        setBranchId,
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
