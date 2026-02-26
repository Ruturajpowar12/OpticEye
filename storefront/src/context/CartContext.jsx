import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

const getInitialCart = () => {
  const raw = localStorage.getItem("opticeye_cart");
  return raw ? JSON.parse(raw) : [];
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getInitialCart());

  const persist = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem("opticeye_cart", JSON.stringify(nextItems));
  };

  const addToCart = (product, qty = 1) => {
    const price = product.salePrice || product.price;
    const existing = items.find((item) => item.product === product._id);

    if (existing) {
      const updated = items.map((item) =>
        item.product === product._id
          ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
          : item
      );
      persist(updated);
      return;
    }

    persist([
      ...items,
      {
        product: product._id,
        name: product.title,
        image: product.images[0],
        price,
        stock: product.stock,
        qty: Math.min(qty, product.stock),
      },
    ]);
  };

  const updateQty = (productId, qty) => {
    const updated = items.map((item) =>
      item.product === productId
        ? { ...item, qty: Math.max(1, Math.min(qty, item.stock)) }
        : item
    );
    persist(updated);
  };

  const removeFromCart = (productId) => {
    persist(items.filter((item) => item.product !== productId));
  };

  const clearCart = () => {
    persist([]);
  };

  const totals = useMemo(() => {
    const itemsCount = items.reduce((sum, item) => sum + item.qty, 0);
    const itemsPrice = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const shippingPrice = itemsPrice > 99 || itemsPrice === 0 ? 0 : 9;
    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    return {
      itemsCount,
      itemsPrice: Number(itemsPrice.toFixed(2)),
      taxPrice,
      shippingPrice,
      totalPrice,
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      ...totals,
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
