'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { products } from '@/lib/constants';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function CollectionPage() {
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<number | null>(null);

  // Get unique values
  const allScents = Array.from(new Set(products.flatMap((p) => p.scents)));
  const allMoods = Array.from(new Set(products.flatMap((p) => p.mood)));

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const scentsMatch =
        selectedScents.length === 0 ||
        selectedScents.some((scent) => product.scents.includes(scent));
      const moodsMatch =
        selectedMoods.length === 0 ||
        selectedMoods.some((mood) => product.mood.includes(mood));
      const intensityMatch =
        selectedIntensity === null || product.intensity === selectedIntensity;

      return scentsMatch && moodsMatch && intensityMatch;
    });
  }, [selectedScents, selectedMoods, selectedIntensity]);

  const toggleScent = (scent: string) => {
    setSelectedScents((prev) =>
      prev.includes(scent)
        ? prev.filter((s) => s !== scent)
        : [...prev, scent]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
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
            NEFERTUM COLLECTION
          </h1>
          <p className="text-sm text-textSecondary font-light">
            The Power of Fragrance Embodied
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
              {/* Clear Filters */}
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

              {/* Mood Filter */}
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
                {filteredProducts.length} products
              </p>
              <select className="bg-[#1a1815] border border-border text-textSecondary text-xs p-2 hover:border-gold transition-colors">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-sm text-textSecondary font-light">
                  No products found matching your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-xs text-gold font-light uppercase tracking-widest hover:text-goldHover transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
