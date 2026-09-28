import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => { success: boolean; message?: string };
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartMrpTotal: number;
  cartDiscount: number;
  shippingFee: number;
  shippingThreshold: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => ({ success: false }),
  removeFromCart: () => {},
  updateQuantity: () => ({ success: false }),
  clearCart: () => {},
  cartCount: 0,
  cartSubtotal: 0,
  cartMrpTotal: 0,
  cartDiscount: 0,
  shippingFee: 0,
  shippingThreshold: 500,
  grandTotal: 0,
});

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'navin_homeo_cart_v2';
export const SHIPPING_THRESHOLD = 500;
export const STANDARD_SHIPPING_FEE = 50;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to load cart from localStorage', err);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  const addToCart = (
    item: Omit<CartItem, 'quantity'>,
    quantity = 1
  ): { success: boolean; message?: string } => {
    if (item.stockQuantity <= 0) {
      return { success: false, message: 'This item is currently out of stock.' };
    }

    let result = { success: true, message: 'Added to cart' };

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const potentialQty = existing.quantity + quantity;
        if (potentialQty > item.stockQuantity) {
          result = {
            success: false,
            message: `Only ${item.stockQuantity} units available in stock.`,
          };
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: item.stockQuantity } : i
          );
        }
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: potentialQty } : i
        );
      }

      const initialQty = Math.min(quantity, item.stockQuantity);
      return [...prev, { ...item, quantity: initialQty }];
    });

    return result;
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (
    id: string,
    delta: number
  ): { success: boolean; message?: string } => {
    let result = { success: true, message: '' };

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.stockQuantity) {
              result = {
                success: false,
                message: `Maximum available stock (${item.stockQuantity}) reached.`,
              };
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );

    return result;
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartMrpTotal = cart.reduce((acc, item) => acc + item.mrp * item.quantity, 0);
  const cartDiscount = Math.max(0, cartMrpTotal - cartSubtotal);
  const shippingFee = cartSubtotal === 0 || cartSubtotal >= SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = cartSubtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartMrpTotal,
        cartDiscount,
        shippingFee,
        shippingThreshold: SHIPPING_THRESHOLD,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
