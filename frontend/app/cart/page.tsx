'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShoppingBag, Plus, Minus, Trash2, Tag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    cartTotal,
    coupon,
    applyCoupon,
    removeCoupon,
    isLoading,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    applyCoupon(couponCode.trim());
    if (!coupon && couponCode.toUpperCase() !== 'LUXURY10' && couponCode.toUpperCase() !== 'NEFERTUM15' && couponCode.toUpperCase() !== 'APHRODITE20' && couponCode.toUpperCase() !== 'PREMIUM25') {
      setCouponError('Invalid coupon code');
    } else {
      setCouponCode('');
    }
  };

  const isEmpty = !isLoading && items.length === 0;
  const shipping = cartTotal > 0 ? (cartTotal > 10000 ? 0 : 499) : 0;
  const tax = Math.round(cartTotal * 0.18);
  const finalTotal = cartTotal + shipping + tax;

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
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 bg-[#0f0d0a] border border-border p-6 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-[#1a1815]" />
                    <div className="space-y-2">
                      <div className="h-3 bg-[#1a1815] w-20" />
                      <div className="h-5 bg-[#1a1815] w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#1a1815] border border-border p-8 h-80" />
          </div>
        ) : isEmpty ? (
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
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-6 p-6 border border-border bg-[#0f0d0a] items-start sm:items-center justify-between"
                >
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 bg-[#1a1815] flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.image || '/images/products/nefertum-detail.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gold uppercase tracking-widest">
                        {item.collection || 'Luxury Fragrance'}
                      </p>
                      <Link href={`/product/${(item.name || 'product').toLowerCase().replace(/\s+/g, '-')}`}>
                        <h3 className="text-base font-serif font-bold text-textPrimary hover:text-gold transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm font-serif text-gold mt-1">
                        ₹{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#1a1815] text-textSecondary hover:text-gold transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-light text-textPrimary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#1a1815] text-textSecondary hover:text-gold transition-colors"
                        title="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="text-base font-serif font-bold text-textPrimary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-textSecondary hover:text-red-400 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[#1a1815] border border-border p-8 h-fit space-y-6">
              <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                Order Summary
              </h3>

              {/* Coupon Section */}
              <div className="space-y-3 pb-6 border-b border-border">
                {coupon ? (
                  <div className="flex items-center justify-between bg-gold/10 border border-gold/30 p-3">
                    <div className="flex items-center gap-2 text-xs text-gold">
                      <Tag size={14} />
                      <span>{coupon.code} ({coupon.discount}% OFF)</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-textSecondary hover:text-textPrimary transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. LUXURY10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-background border border-border px-3 py-2 text-xs text-textPrimary focus:border-gold outline-none flex-1 uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-gold/20 border border-gold text-gold px-4 py-2 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 font-light">{couponError}</p>
                )}
              </div>

              <div className="space-y-4 pb-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Subtotal</span>
                  <span className="text-textPrimary">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Estimated Shipping</span>
                  <span className="text-textPrimary">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Estimated GST (18%)</span>
                  <span className="text-textPrimary">₹{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-serif font-bold">
                <span className="text-textPrimary">Total</span>
                <span className="text-gold">₹{finalTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gold text-background py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
              >
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
