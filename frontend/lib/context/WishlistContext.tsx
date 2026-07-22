'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistApi } from '@/lib/api';

export interface WishlistItem {
  id: string; // product ID
  name: string;
  price: number;
  image: string;
  collection: string;
  addedDate?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const normalizeWishlistItem = (backendItem: any): WishlistItem => {
  const p = backendItem.product || {};
  const variant = p.variants?.[0];
  return {
    id: p.id || backendItem.productId || backendItem.id,
    name: p.name || 'Luxury Fragrance',
    price: Number(variant?.price || 6999),
    image: '/images/products/nefertum-detail.jpg',
    collection: p.collection || 'nefertum',
    addedDate: backendItem.createdAt || new Date().toISOString(),
  };
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync / Load wishlist
  const syncWishlist = useCallback(async () => {
    setIsLoading(true);
    const saved = localStorage.getItem('wishlist');
    let localItems: WishlistItem[] = [];
    if (saved) {
      try {
        localItems = JSON.parse(saved);
      } catch (e) {}
    }

    if (isAuthenticated) {
      try {
        // Fetch server wishlist
        const res = await wishlistApi.getWishlist();
        let serverItems: WishlistItem[] = [];
        if (res.success && Array.isArray(res.wishlist)) {
          serverItems = res.wishlist.map(normalizeWishlistItem);
        }

        // Sync local items to server if not already present
        if (localItems.length > 0) {
          for (const localItem of localItems) {
            if (!serverItems.some((s) => s.id === localItem.id)) {
              try {
                await wishlistApi.addToWishlist(localItem.id);
                serverItems.push(localItem);
              } catch (e) {
                console.error('Failed to sync wishlist item to server:', e);
              }
            }
          }
          localStorage.removeItem('wishlist');
        }

        setItems(serverItems);
      } catch (err) {
        console.error('Error fetching backend wishlist:', err);
        setItems(localItems);
      }
    } else {
      setItems(localItems);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      syncWishlist();
    }
  }, [isAuthenticated, authLoading, syncWishlist]);

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isLoading) {
      localStorage.setItem('wishlist', JSON.stringify(items));
    }
  }, [items, isAuthenticated, authLoading, isLoading]);

  const addItem = async (item: WishlistItem) => {
    const exists = items.some((i) => i.id === item.id);
    if (exists) return;

    const newItem = { ...item, addedDate: new Date().toISOString() };

    if (isAuthenticated) {
      try {
        await wishlistApi.addToWishlist(item.id);
      } catch (err) {
        console.error('Error adding to server wishlist:', err);
      }
    }

    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      try {
        await wishlistApi.removeFromWishlist(id);
      } catch (err) {
        console.error('Error removing from server wishlist:', err);
      }
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        wishlistCount: items.length,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
