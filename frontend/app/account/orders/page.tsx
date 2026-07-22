'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/lib/api';

const statusColors: Record<string, string> = {
  PENDING: 'bg-gold/20 text-gold',
  PROCESSING: 'bg-gold/20 text-gold',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  SHIPPED: 'bg-blue-500/20 text-blue-400',
  OUT_FOR_DELIVERY: 'bg-blue-500/20 text-blue-400',
  DELIVERED: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
  REFUNDED: 'bg-red-500/20 text-red-400',
};

function getStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await ordersApi.getMyOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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
              My Orders
            </h1>
            <p className="text-textSecondary font-light text-sm mt-2">
              Track and manage your order history
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Skeleton */
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse border border-border p-6 bg-[#0f0d0a]">
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-[#1a1815] w-32" />
                    <div className="h-6 bg-[#1a1815] w-24 rounded-none" />
                  </div>
                  <div className="h-3 bg-[#1a1815] w-48 mb-2" />
                  <div className="h-3 bg-[#1a1815] w-64" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error */
            <div className="text-center py-16 border border-red-500/20 bg-red-500/5 p-8">
              <p className="text-red-400 text-sm font-light mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gold text-background text-xs font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
              >
                Retry
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 space-y-6"
            >
              <Package className="w-16 h-16 text-gold/20 mx-auto" />
              <h2 className="text-2xl font-serif font-bold text-textPrimary">
                No Orders Yet
              </h2>
              <p className="text-sm text-textSecondary font-light max-w-md mx-auto">
                You haven&apos;t placed any orders yet. Explore our collections and discover your signature scent.
              </p>
              <Link
                href="/collection"
                className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
              >
                <ShoppingBag size={14} />
                Browse Collection
              </Link>
            </motion.div>
          ) : (
            /* Orders list */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {orders.map((order) => {
                const status = order.status || 'PENDING';
                const colorClass = statusColors[status] || statusColors.PENDING;

                return (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="border border-border rounded-none p-6 md:p-8 bg-[#0f0d0a] hover:border-gold/40 transition-colors duration-300"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                          Order ID
                        </p>
                        <p className="text-sm font-serif font-bold text-textPrimary">
                          {order.id?.substring(0, 8).toUpperCase() || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.createdAt && (
                          <p className="text-xs text-textSecondary font-light">
                            {formatDate(order.createdAt)}
                          </p>
                        )}
                        <span className={`inline-block px-3 py-1 text-xs rounded-none font-light uppercase tracking-wider ${colorClass}`}>
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-border pt-4 space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-textPrimary font-light">
                                {item.variant?.product?.name || item.productName || 'Fragrance'}
                              </p>
                              <p className="text-xs text-textSecondary">
                                {item.variant?.size || ''} {item.variant?.type || ''} × {item.quantity || 1}
                              </p>
                            </div>
                            <p className="text-sm text-gold font-light">
                              {formatPrice((item.price || item.variant?.price || 0) * (item.quantity || 1))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                      <p className="text-xs text-textSecondary font-light uppercase tracking-wider">
                        Total
                      </p>
                      <p className="text-lg font-serif font-bold text-gold">
                        {formatPrice(order.totalAmount || order.total || 0)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
