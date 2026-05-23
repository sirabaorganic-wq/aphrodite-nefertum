'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
}

export function CartDrawer({ isOpen, onClose, items = [] }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0905] border-l border-gold/30 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gold/20">
              <h2 className="text-sm font-serif font-bold text-textPrimary uppercase tracking-widest">
                YOUR CART
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gold/10 rounded-none transition-colors"
              >
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <p className="text-textSecondary font-light mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="text-gold text-sm font-light uppercase tracking-widest hover:text-goldHover transition-colors"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3 pb-4 border-b border-border/50"
                  >
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-none"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-serif font-bold text-textPrimary mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gold font-light mb-3">₹{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 bg-[#1a1815] rounded-none w-fit">
                        <button className="p-1 hover:bg-gold/20 transition-colors">
                          <Minus className="w-3 h-3 text-textSecondary" />
                        </button>
                        <span className="text-xs text-textPrimary w-5 text-center">{item.quantity}</span>
                        <button className="p-1 hover:bg-gold/20 transition-colors">
                          <Plus className="w-3 h-3 text-textSecondary" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-t border-gold/20 p-6 space-y-4"
              >
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>Tax (18%)</span>
                    <span>₹{Math.round(tax).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gold/20 pt-2 flex justify-between">
                    <span className="text-sm font-serif font-bold text-textPrimary">Total</span>
                    <span className="text-sm font-serif font-bold text-gold">
                      ₹{Math.round(total).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-gold text-background px-4 py-3 text-xs font-light uppercase tracking-wider text-center hover:bg-goldHover transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
