'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  collection: string;
}

const PRODUCTS: SearchResult[] = [
  {
    id: '1',
    name: 'OUDH IMMORTEL',
    category: 'Extrait',
    price: 6999,
    image: '/images/products/nefertum-detail.jpg',
    collection: 'Nefertum',
  },
  {
    id: '2',
    name: 'SACRED LOTUS',
    category: 'Eau de Parfum',
    price: 5999,
    image: '/images/products/nefertum-detail.jpg',
    collection: 'Nefertum',
  },
  {
    id: '3',
    name: 'DESERT OBSIDIAN',
    category: 'Eau de Parfum',
    price: 5499,
    image: '/images/products/aphrodite-detail.jpg',
    collection: 'Aphrodite',
  },
];

const TRENDING = ['OUDH IMMORTEL', 'SACRED LOTUS', 'DESERT OBSIDIAN'];
const RECENT_SEARCHES = ['luxury perfume', 'Egyptian', 'dark scents'];

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdvancedSearch({ isOpen, onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setSearchHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Fuzzy search function
  const fuzzyMatch = (query: string, text: string): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (lowerText.includes(lowerQuery)) return 100;
    
    let score = 0;
    let queryIdx = 0;
    for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
      if (lowerText[i] === lowerQuery[queryIdx]) {
        score += 10;
        queryIdx++;
      }
    }
    
    return queryIdx === lowerQuery.length ? score : 0;
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    return PRODUCTS
      .map(product => ({
        ...product,
        score: Math.max(
          fuzzyMatch(query, product.name),
          fuzzyMatch(query, product.collection),
          fuzzyMatch(query, product.category),
        ),
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-gold/20"
          >
            <div className="max-w-3xl mx-auto px-4 py-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search perfumes, collections, notes..."
                  className="w-full bg-white/5 border border-gold/20 rounded-lg pl-12 pr-12 py-4 text-lg text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Results */}
              <AnimatePresence>
                {query && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 space-y-4"
                  >
                    {results.length > 0 ? (
                      <>
                        <p className="text-xs font-light text-textSecondary uppercase tracking-widest">
                          RESULTS ({results.length})
                        </p>
                        <div className="space-y-2">
                          {results.map((result, index) => (
                            <motion.div
                              key={result.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="bg-white/5 border border-gold/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 hover:border-gold/30 transition-all duration-300"
                              onClick={() => {
                                handleSearch(result.name);
                                onClose();
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={result.image}
                                  alt={result.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-foreground font-light">{result.name}</p>
                                  <p className="text-xs text-textSecondary">{result.collection} • {result.category}</p>
                                </div>
                                <p className="text-gold font-light">₹{result.price.toLocaleString('en-IN')}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <p className="text-textSecondary">No results found for "{query}"</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trending & Recent */}
              {!query && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid grid-cols-2 gap-8"
                >
                  {/* Trending */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={16} className="text-gold" />
                      <p className="text-xs font-light text-textSecondary uppercase tracking-widest">Trending Now</p>
                    </div>
                    <div className="space-y-2">
                      {TRENDING.map((item, index) => (
                        <motion.button
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSearch(item)}
                          className="block w-full text-left text-foreground hover:text-gold transition-colors text-sm font-light"
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-gold" />
                        <p className="text-xs font-light text-textSecondary uppercase tracking-widest">Recent</p>
                      </div>
                      <div className="space-y-2">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <motion.button
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSearch(item)}
                            className="block w-full text-left text-foreground hover:text-gold transition-colors text-sm font-light"
                          >
                            {item}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
