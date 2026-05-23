'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  collection: string;
  savedForLater?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  saveForLater: (id: string) => void;
  moveFromLater: (id: string) => void;
  clearCart: () => void;
  savedItems: CartItem[];
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  coupon: { code: string; discount: number } | null;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedLater = localStorage.getItem('savedForLater');
    const savedCoupon = localStorage.getItem('coupon');

    if (savedCart) setItems(JSON.parse(savedCart));
    if (savedLater) setSavedItems(JSON.parse(savedLater));
    if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('savedForLater', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    if (coupon) localStorage.setItem('coupon', JSON.stringify(coupon));
  }, [coupon]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  };

  const saveForLater = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setSavedItems(prev => [...prev, item]);
      removeItem(id);
    }
  };

  const moveFromLater = (id: string) => {
    const item = savedItems.find(i => i.id === id);
    if (item) {
      addItem({ ...item, savedForLater: false });
      setSavedItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    // Example coupon codes
    const coupons: Record<string, number> = {
      'LUXURY10': 10,
      'NEFERTUM15': 15,
      'APHRODITE20': 20,
      'PREMIUM25': 25,
    };

    if (coupons[code.toUpperCase()]) {
      setCoupon({ code: code.toUpperCase(), discount: coupons[code.toUpperCase()] });
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountedTotal = coupon ? cartTotal * (1 - coupon.discount / 100) : cartTotal;
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        saveForLater,
        moveFromLater,
        clearCart,
        savedItems,
        applyCoupon,
        removeCoupon,
        coupon,
        cartTotal: discountedTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
