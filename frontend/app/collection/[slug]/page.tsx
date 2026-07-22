'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { productsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const COLLECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  nefertum: {
    title: 'NEFERTUM COLLECTION',
    subtitle: 'Sacred Botanicals, Egyptian Lore & High Intensity Perfumery',
  },
  aphrodite: {
    title: 'APHRODITE COLLECTION',
    subtitle: 'Seductive Florals, Dark Gourmands & Sensual Obsidians',
  },
};

export default function CollectionSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'nefertum';
  const collectionKey = slug.toLowerCase();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);

  const meta = COLLECTION_TITLES[collectionKey] || {
    title: `${slug.toUpperCase()} COLLECTION`,
    subtitle: 'Dark Luxury Perfumes & Crafted Extraits',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productsApi.getProducts({ collection: collectionKey });
        if (res.success && res.products) {
          setProducts(res.products);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Error fetching collection products:', err);
        setError(err.message || 'Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [collectionKey]);

  // Get unique scent families dynamically
  const allScents = useMemo(() => {
    return Array.from(
      new Set(
        products.flatMap((p) => p.scents || p.variants?.[0]?.scents || [])
      )
    ).filter(Boolean);
  }, [products]);

  // Get unique moods dynamically
  const allMoods = useMemo(() => {
    return Array.from(
      new Set(
        products.flatMap((p) => p.mood || p.variants?.[0]?.mood || [])
      )
    ).filter(Boolean);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const pScents = product.scents || product.variants?.[0]?.scents || [];
      const pMoods = product.mood || product.variants?.[0]?.mood || [];
      const pIntensity = product.intensity || 5;

      const scentsMatch =
        selectedScents.length === 0 ||
        selectedScents.some((scent) => pScents.includes(scent));
      const moodsMatch =
        selectedMoods.length === 0 ||
        selectedMoods.some((mood) => pMoods.includes(mood));
      const intensityMatch =
        selectedIntensity === null || pIntensity === selectedIntensity;

      return scentsMatch && moodsMatch && intensityMatch;
    });
  }, [products, selectedScents, selectedMoods, selectedIntensity]);

  const toggleScent = (scent: string) => {
    setSelectedScents((prev) =>
      prev.includes(scent) ? prev.filter((s) => s !== scent) : [...prev, scent]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const clearFilters = () => {
    setSelectedScents([]);
    setSelectedMoods([]);
    setSelectedIntensity(null);
  };

  const hasActiveFilters =
    selectedScents.length > 0 ||
    selectedMoods.length > 0 ||
    selectedIntensity !== null;

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary mb-4">
            {meta.title}
          </h1>
          <p className="text-sm text-textSecondary font-light">
            {meta.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1"
          >
            <div className="sticky top-20 space-y-8">
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-xs text-gold hover:text-goldHover transition-colors"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </motion.button>
              )}

              {/* Scent Filter */}
              {allScents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-serif font-bold text-textPrimary uppercase tracking-widest">
                    SCENT FAMILY
                  </h3>
                  <div className="space-y-2">
                    {allScents.map((scent) => (
                      <label key={scent} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScents.includes(scent)}
                          onChange={() => toggleScent(scent)}
                          className="w-4 h-4 rounded border-gold bg-background checked:bg-gold"
                        />
                        <span className="text-xs text-textSecondary font-light capitalize">
                          {scent}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mood Filter */}
              {allMoods.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-serif font-bold text-textPrimary uppercase tracking-widest">
                    MOOD
                  </h3>
                  <div className="space-y-2">
                    {allMoods.map((mood) => (
                      <label key={mood} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMoods.includes(mood)}
                          onChange={() => toggleMood(mood)}
                          className="w-4 h-4 rounded border-gold bg-background checked:bg-gold"
                        />
                        <span className="text-xs text-textSecondary font-light capitalize">
                          {mood}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Intensity Filter */}
              <div className="space-y-3">
                <h3 className="text-xs font-serif font-bold text-textPrimary uppercase tracking-widest">
                  INTENSITY
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((intensity) => (
                    <label key={intensity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="intensity"
                        checked={selectedIntensity === intensity}
                        onChange={() =>
                          setSelectedIntensity(
                            selectedIntensity === intensity ? null : intensity
                          )
                        }
                        className="w-4 h-4 rounded-full border-gold bg-background"
                      />
                      <span className="text-xs text-textSecondary font-light">
                        {'⭐'.repeat(intensity)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3"
          >
            {/* Results Info */}
            <div className="mb-8 flex justify-between items-center">
              <p className="text-sm text-textSecondary font-light">
                {isLoading ? 'Loading products...' : `${filteredProducts.length} products`}
              </p>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse space-y-4 border border-border p-4 bg-[#0f0d0a]">
                    <div className="h-64 md:h-80 bg-[#1a1815]" />
                    <div className="h-4 bg-[#1a1815] w-3/4" />
                    <div className="h-3 bg-[#1a1815] w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 border border-red-500/20 bg-red-500/5 p-8">
                <p className="text-red-400 text-sm font-light mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gold text-background text-xs font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-sm text-textSecondary font-light">
                      No products found in this collection.
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
