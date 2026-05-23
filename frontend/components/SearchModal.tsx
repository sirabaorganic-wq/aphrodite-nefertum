'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingFragrances = [
  { name: 'OUDH IMMORTEL', category: 'Nefertum Collection' },
  { name: 'SACRED LOTUS', category: 'Nefertum Collection' },
  { name: 'DESERT OBSIDIAN', category: 'Aphrodite Collection' },
];

const suggestions = [
  'Nefertum Collection',
  'Aphrodite Collection',
  'Dark fragrances',
  'Floral perfumes',
  'Woody notes',
  'Oud fragrances',
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  const handleSearch = (q: string) => {
    if (q.trim()) {
      setRecentSearches([q, ...recentSearches.filter(s => s !== q)].slice(0, 5));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 max-w-2xl mx-auto w-full pt-32"
          >
            <div className="mx-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch(query);
                  }}
                  placeholder="Search fragrances, collections, notes..."
                  className="w-full bg-[#1a1815] border border-gold/30 rounded-none pl-12 pr-4 py-4 text-textPrimary placeholder-textSecondary font-light focus:outline-none focus:border-gold transition-colors"
                  autoFocus
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gold/10 rounded-none transition-colors"
                >
                  <X className="w-5 h-5 text-textSecondary" />
                </button>
              </div>

              {/* Results Panel */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0a0905] border border-gold/20 rounded-none shadow-2xl overflow-hidden"
              >
                {/* Recent Searches */}
                {recentSearches.length > 0 && !query && (
                  <div className="border-b border-gold/20">
                    <div className="px-6 py-3">
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-3">
                        Recent Searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((search, i) => (
                          <motion.button
                            key={search}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setQuery(search)}
                            className="w-full text-left px-4 py-2 text-sm text-textSecondary hover:text-gold hover:bg-[#1a1815] transition-colors"
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trending Fragrances */}
                {!query && (
                  <div className="border-b border-gold/20">
                    <div className="px-6 py-3">
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-3">
                        Trending Fragrances
                      </p>
                      <div className="space-y-1">
                        {trendingFragrances.map((frag, i) => (
                          <motion.div
                            key={frag.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="px-4 py-2 text-sm"
                          >
                            <p className="text-textPrimary font-light">{frag.name}</p>
                            <p className="text-xs text-textSecondary">{frag.category}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div className="px-6 py-3">
                  <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-3">
                    {query ? 'Search suggestions' : 'Popular searches'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, i) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSearch(suggestion)}
                        className="px-4 py-2 bg-[#1a1815] border border-gold/20 text-xs text-textSecondary hover:text-gold hover:border-gold transition-colors rounded-none font-light"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Keyboard hint */}
                <div className="px-6 py-3 border-t border-gold/20 bg-[#1a1815]/50">
                  <p className="text-xs text-textMuted font-light">
                    Press <kbd className="px-2 py-1 bg-gold/10 border border-gold/20 rounded text-textSecondary">ESC</kbd> to close
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
