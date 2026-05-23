'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const isEmpty = true; // Cart is empty for now

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
            YOUR CART
          </h1>
        </div>
      </section>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isEmpty ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="mx-auto text-textSecondary mb-6 opacity-50" />
            <h2 className="text-2xl font-serif font-bold text-textPrimary mb-4">
              Your cart is empty
            </h2>
            <p className="text-sm text-textSecondary font-light mb-8">
              Discover our luxurious collection of fragrances
            </p>
            <Link
              href="/collection"
              className="inline-block bg-gold text-background px-8 py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Items would go here */}
            </div>

            {/* Order Summary */}
            <div className="bg-[#1a1815] border border-border p-8 h-fit">
              <h3 className="text-sm font-serif font-bold text-textPrimary uppercase mb-6">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Subtotal</span>
                  <span className="text-textPrimary">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Shipping</span>
                  <span className="text-textPrimary">₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Tax</span>
                  <span className="text-textPrimary">₹0</span>
                </div>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold mb-6">
                <span className="text-textPrimary">Total</span>
                <span className="text-gold">₹0</span>
              </div>
              <button className="w-full bg-gold text-background py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
