'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi, couponsApi } from '@/lib/api';

export interface CartItem {
  id: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  collection: string;
  savedForLater?: boolean;
  variant?: any;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Partial<CartItem> & { id: string; name?: string; price?: number; quantity?: number; variantId?: string }) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  saveForLater: (id: string) => void;
  moveFromLater: (id: string) => void;
  clearCart: () => Promise<void> | void;
  savedItems: CartItem[];
  applyCoupon: (code: string) => Promise<void> | void;
  removeCoupon: () => void;
  coupon: { code: string; discount: number } | null;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const normalizeCartItem = (item: any): CartItem => {
  const variant = item.variant;
  const product = variant?.product;
  return {
    id: item.id || item.variantId,
    variantId: item.variantId || item.id,
    name: product?.name || item.name || 'Luxury Fragrance',
    price: Number(variant?.price ?? item.price ?? 6999),
    quantity: Number(item.quantity ?? 1),
    image: item.image || '/images/products/nefertum-detail.jpg',
    collection: product?.collection || item.collection || 'nefertum',
    savedForLater: item.savedForLater || false,
    variant: variant || item.variant,
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from backend or localStorage on mount/auth change
  useEffect(() => {
    if (authLoading) return;

    const initCart = async () => {
      setIsLoading(true);
      const savedCartStr = localStorage.getItem('cart');
      const savedLaterStr = localStorage.getItem('savedForLater');
      const savedCouponStr = localStorage.getItem('coupon');

      if (savedLaterStr) {
        try { setSavedItems(JSON.parse(savedLaterStr)); } catch (e) {}
      }
      if (savedCouponStr) {
        try { setCoupon(JSON.parse(savedCouponStr)); } catch (e) {}
      }

      if (isAuthenticated) {
        // Sync any local guest items to backend on login
        if (savedCartStr) {
          try {
            const guestItems: CartItem[] = JSON.parse(savedCartStr);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              for (const gItem of guestItems) {
                const vId = gItem.variantId || gItem.id;
                if (vId) {
                  try {
                    await cartApi.addToCart(vId, gItem.quantity || 1);
                  } catch (err) {
                    console.error('Failed to sync guest item:', err);
                  }
                }
              }
            }
          } catch (e) {}
          localStorage.removeItem('cart');
        }

        // Fetch user's cart from backend
        try {
          const res = await cartApi.getCart();
          if (res.success && res.cart && Array.isArray(res.cart.items)) {
            setItems(res.cart.items.map(normalizeCartItem));
          } else {
            setItems([]);
          }
        } catch (err) {
          console.error('Error fetching backend cart:', err);
        }
      } else {
        // Guest fallback: load from localStorage
        if (savedCartStr) {
          try {
            const guestItems = JSON.parse(savedCartStr);
            if (Array.isArray(guestItems)) {
              setItems(guestItems.map(normalizeCartItem));
            }
          } catch (e) {}
        }
      }
      setIsLoading(false);
    };

    initCart();
  }, [isAuthenticated, authLoading]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isLoading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated, authLoading, isLoading]);

  useEffect(() => {
    localStorage.setItem('savedForLater', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    if (coupon) localStorage.setItem('coupon', JSON.stringify(coupon));
    else localStorage.removeItem('coupon');
  }, [coupon]);

  const addItem = async (item: Partial<CartItem> & { id: string; name?: string; price?: number; quantity?: number; variantId?: string }) => {
    const qty = item.quantity || 1;
    const vId = item.variantId || item.id;

    if (isAuthenticated && vId) {
      try {
        const res = await cartApi.addToCart(vId, qty);
        if (res.success && res.cart && Array.isArray(res.cart.items)) {
          setItems(res.cart.items.map(normalizeCartItem));
          return;
        }
      } catch (err) {
        console.error('Error adding item to backend cart:', err);
      }
    }

    // Fallback or guest update
    setItems(prev => {
      const existing = prev.find(i => (i.variantId || i.id) === vId || i.id === item.id);
      if (existing) {
        return prev.map(i => ((i.variantId || i.id) === vId || i.id === item.id) ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, normalizeCartItem({ ...item, quantity: qty, variantId: vId })];
    });
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      const targetItem = items.find(i => i.id === id || i.variantId === id);
      const backendId = targetItem?.id || id;
      try {
        const res = await cartApi.removeFromCart(backendId);
        if (res.success && res.cart && Array.isArray(res.cart.items)) {
          setItems(res.cart.items.map(normalizeCartItem));
          return;
        }
      } catch (err) {
        console.error('Error removing item from backend cart:', err);
      }
    }
    setItems(prev => prev.filter(i => i.id !== id && i.variantId !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(id);
    }
    if (isAuthenticated) {
      const targetItem = items.find(i => i.id === id || i.variantId === id);
      const backendId = targetItem?.id || id;
      try {
        const res = await cartApi.updateQty(backendId, quantity);
        if (res.success && res.cart && Array.isArray(res.cart.items)) {
          setItems(res.cart.items.map(normalizeCartItem));
          return;
        }
      } catch (err) {
        console.error('Error updating quantity in backend cart:', err);
      }
    }
    setItems(prev => prev.map(i => (i.id === id || i.variantId === id) ? { ...i, quantity } : i));
  };

  const saveForLater = (id: string) => {
    const item = items.find(i => i.id === id || i.variantId === id);
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

  const clearCart = async () => {
    if (isAuthenticated && items.length > 0) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        console.error('Error clearing backend cart:', err);
      }
    }
    setItems([]);
    setCoupon(null);
    if (!isAuthenticated) {
      localStorage.removeItem('cart');
    }
  };

  const applyCoupon = async (code: string) => {
    if (!code || !code.trim()) return;
    try {
      const currentSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const res = await couponsApi.validateCoupon(code.trim(), currentSubtotal);
      if (res.success && res.coupon) {
        setCoupon({
          code: res.coupon.code,
          discount: res.coupon.discountValue,
        });
      } else {
        console.warn('Coupon validation failed:', res.message);
      }
    } catch (err) {
      console.error('Failed to validate coupon with server:', err);
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
        isLoading,
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
