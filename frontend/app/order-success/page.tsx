'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Clock, Shield, ArrowRight } from 'lucide-react';
import { ordersApi } from '@/lib/api';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const paymentId = searchParams.get('paymentId') || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    ordersApi
      .getOrderById(orderId)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        }
      })
      .catch(() => {
        // Fail silently — show static content
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const steps = [
    { icon: CheckCircle, label: 'Order Placed', done: true },
    { icon: Package, label: 'Processing', done: order?.status === 'PROCESSING' || order?.status === 'SHIPPED' || order?.status === 'DELIVERED' },
    { icon: Clock, label: 'Shipped', done: order?.status === 'SHIPPED' || order?.status === 'DELIVERED' },
  ];

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero Confirmation Section */}
      <section className="bg-[#1a1815] border-b border-border py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gold/30"
              />
              <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-background" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold">
              ORDER CONFIRMED
            </h1>
            <p className="text-sm text-textSecondary font-light leading-relaxed max-w-lg mx-auto">
              Thank you for your purchase. Your luxury fragrance is being carefully prepared and will
              be dispatched within 1–3 business days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Order Details */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        {/* Order IDs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {orderId && (
            <div className="bg-[#1a1815] border border-border p-6">
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                Order Reference
              </p>
              <p className="text-sm font-serif font-bold text-gold break-all">
                {orderId.length > 20 ? `${orderId.slice(0, 20)}...` : orderId}
              </p>
            </div>
          )}
          {paymentId && (
            <div className="bg-[#1a1815] border border-border p-6">
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                Payment ID
              </p>
              <p className="text-sm font-serif font-bold text-textPrimary break-all">
                {paymentId}
              </p>
            </div>
          )}
        </motion.div>

        {/* Order Items (fetched from API) */}
        {order?.items && order.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#1a1815] border border-border p-6 space-y-4"
          >
            <h2 className="text-sm font-serif font-bold text-textPrimary uppercase mb-4">
              Order Items
            </h2>
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-textPrimary font-light">
                    {item.variant?.product?.name || 'Fragrance'}
                  </p>
                  <p className="text-xs text-textSecondary font-light">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-gold font-serif font-bold">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
            {/* Totals */}
            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Subtotal</span>
                <span className="text-textPrimary">₹{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary font-light">Discount</span>
                  <span className="text-green-400">-₹{order.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Shipping</span>
                <span className="text-textPrimary">{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold pt-2 border-t border-border">
                <span className="text-textPrimary">Total</span>
                <span className="text-gold">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Tracking Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1815] border border-border p-8"
        >
          <h2 className="text-sm font-serif font-bold text-textPrimary uppercase mb-8">
            Order Status
          </h2>
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-col items-center flex-1 relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step.done
                        ? 'border-gold bg-gold text-background'
                        : 'border-border text-textSecondary'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <p
                    className={`text-xs font-light mt-2 uppercase tracking-wider ${
                      step.done ? 'text-gold' : 'text-textSecondary'
                    }`}
                  >
                    {step.label}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-px bg-border -z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-[#1a1815] border border-border p-6 text-center space-y-2">
            <Clock size={24} className="text-gold mx-auto" />
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest">
              Estimated Delivery
            </p>
            <p className="text-sm font-serif font-bold text-textPrimary">3–7 Business Days</p>
          </div>
          <div className="bg-[#1a1815] border border-border p-6 text-center space-y-2">
            <Package size={24} className="text-gold mx-auto" />
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest">
              Packaging
            </p>
            <p className="text-sm font-serif font-bold text-textPrimary">Luxury Gift Box</p>
          </div>
          <div className="bg-[#1a1815] border border-border p-6 text-center space-y-2">
            <Shield size={24} className="text-gold mx-auto" />
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest">
              Authenticity
            </p>
            <p className="text-sm font-serif font-bold text-textPrimary">100% Guaranteed</p>
          </div>
        </motion.div>

        {/* Email Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-gold/30 bg-gold/5 p-6 text-center space-y-2"
        >
          <p className="text-sm text-textSecondary font-light leading-relaxed">
            A confirmation email has been sent to your registered address with your order details
            and tracking information.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/account"
            className="flex-1 flex items-center justify-center gap-2 bg-gold text-background py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
          >
            View My Orders
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/collection"
            className="flex-1 flex items-center justify-center gap-2 border border-gold text-gold py-3 text-sm font-light uppercase tracking-widest hover:bg-gold hover:text-background transition-colors"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
