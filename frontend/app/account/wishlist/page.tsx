'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { wishlistApi } from '@/lib/api';
import type { WishlistItem as ApiWishlistItem } from '@/lib/api/wishlist';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DisplayItem {
  id: string;
  productId: string;
  name: string;
  collection: string;
  price: number;
  image: string;
  variantId?: string;
  source: 'api' | 'local';
}

export default function WishlistPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { items: localItems, removeItem: removeLocalItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [apiItems, setApiItems] = useState<ApiWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const res = await wishlistApi.getWishlist();
        if (res.success && res.wishlist) {
          setApiItems(res.wishlist);
        }
      } catch {
        // API unavailable — rely on local wishlist
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  // Merge API items and local items (deduplicating by product id)
  const displayItems: DisplayItem[] = [];
  const seenIds = new Set<string>();

  // API items first
  for (const item of apiItems) {
    const product = item.product;
    const firstVariant = product?.variants?.[0];
    const id = item.productId || item.id;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      displayItems.push({
        id: item.id,
        productId: item.productId,
        name: product?.name || 'Fragrance',
        collection: product?.collection || 'nefertum',
        price: firstVariant?.price || 0,
        image: '/images/products/nefertum-bottle.jpg',
        variantId: firstVariant?.id,
        source: 'api',
      });
    }
  }

  // Local items
  for (const item of localItems) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      displayItems.push({
        id: item.id,
        productId: item.id,
        name: item.name,
        collection: item.collection,
        price: item.price,
        image: item.image || '/images/products/nefertum-bottle.jpg',
        source: 'local',
      });
    }
  }

  const handleRemove = async (item: DisplayItem) => {
    setRemovingId(item.id);
    try {
      if (item.source === 'api' && isAuthenticated) {
        await wishlistApi.removeFromWishlist(item.productId);
        setApiItems((prev) => prev.filter((i) => i.productId !== item.productId));
      }
      if (item.source === 'local') {
        removeLocalItem(item.id);
      }
    } catch (err) {
      console.error('Error removing wishlist item:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: DisplayItem) => {
    setAddingToCartId(item.id);
    try {
      await addToCart({
        id: item.variantId || item.productId,
        variantId: item.variantId || item.productId,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        collection: item.collection,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCartId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-textSecondary text-sm">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              My Account
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
              Your Wishlist
            </h1>
            <p className="text-textSecondary font-light text-sm mt-2">
              Saved fragrances you love
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse border border-border p-4 bg-[#0f0d0a]">
                  <div className="h-64 bg-[#1a1815] mb-4" />
                  <div className="h-4 bg-[#1a1815] w-3/4 mb-2" />
                  <div className="h-3 bg-[#1a1815] w-1/2" />
                </div>
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <Heart className="w-16 h-16 text-gold/20 mx-auto" />
              <h2 className="text-2xl font-serif font-bold text-textPrimary">
                Your Wishlist is Empty
              </h2>
              <p className="text-sm text-textSecondary font-light max-w-md mx-auto">
                Save your favourite fragrances here to revisit them later.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
              >
                <ShoppingBag size={14} />
                Explore Collection
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
            >
              {displayItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="border border-border rounded-none bg-[#0f0d0a] overflow-hidden group hover:border-gold/40 transition-colors duration-300"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item)}
                      disabled={removingId === item.id}
                      className="absolute top-3 right-3 p-2 bg-background/60 backdrop-blur-sm text-red-400 hover:bg-red-500/20 transition-colors rounded-none"
                    >
                      {removingId === item.id ? (
                        <div className="w-4 h-4 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                        {item.collection}
                      </p>
                      <h3 className="text-sm font-serif font-bold text-textPrimary group-hover:text-gold transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {item.price > 0 && (
                      <p className="text-lg font-serif font-bold text-gold">
                        {formatPrice(item.price)}
                      </p>
                    )}

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCartId === item.id}
                      className="w-full border border-gold text-gold px-4 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300 disabled:opacity-50"
                    >
                      {addingToCartId === item.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
