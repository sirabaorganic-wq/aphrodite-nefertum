'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Heart, Package, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-textSecondary text-sm">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <main className="bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
              Your Account
            </h1>
            <p className="text-textSecondary font-light">Manage your profile, orders, and preferences</p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Profile Card */}
            <motion.div
              variants={itemVariants}
              className="border border-border rounded-none p-8 bg-[#0f0d0a]"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                    Welcome back
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-textPrimary">{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Valued Member' : 'Member'}</h2>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                      Email
                    </p>
                    <p className="text-sm text-textPrimary">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                      Member Since
                    </p>
                    <p className="text-sm text-textPrimary">March 2025</p>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <p className="text-sm">
                      <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs rounded-none">
                        Premium Member
                      </span>
                    </p>
                  </div>
                </div>

                <button className="w-full border border-gold text-gold px-6 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors">
                  Edit Profile
                </button>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              <Link href="/account/orders">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="border border-border rounded-none p-6 bg-[#0f0d0a] cursor-pointer hover:border-gold transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                        My Orders
                      </p>
                      <h3 className="text-lg font-serif font-bold text-textPrimary group-hover:text-gold transition-colors">
                        View Order History
                      </h3>
                    </div>
                    <Package className="w-6 h-6 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/account/wishlist">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="border border-border rounded-none p-6 bg-[#0f0d0a] cursor-pointer hover:border-gold transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                        Saved Fragrances
                      </p>
                      <h3 className="text-lg font-serif font-bold text-textPrimary group-hover:text-gold transition-colors">
                        Your Wishlist
                      </h3>
                    </div>
                    <Heart className="w-6 h-6 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/account/settings">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="border border-border rounded-none p-6 bg-[#0f0d0a] cursor-pointer hover:border-gold transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-1">
                        Settings
                      </p>
                      <h3 className="text-lg font-serif font-bold text-textPrimary group-hover:text-gold transition-colors">
                        Manage Preferences
                      </h3>
                    </div>
                    <Settings className="w-6 h-6 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Recent Orders Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 border-t border-border pt-16"
          >
            <h2 className="text-2xl font-serif font-bold text-textPrimary mb-8">Recent Orders</h2>

            <div className="space-y-4">
              {[
                { id: 'ORD001', product: 'OUDH IMMORTEL', date: 'May 10, 2026', status: 'Delivered' },
                { id: 'ORD002', product: 'SACRED LOTUS', date: 'April 28, 2026', status: 'Delivered' },
              ].map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-border rounded-none p-6 flex justify-between items-center group hover:border-gold transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-serif font-bold text-textPrimary mb-1">{order.id}</p>
                    <p className="text-xs text-textSecondary">{order.product} • {order.date}</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-gold/20 text-gold text-xs rounded-none font-light">
                    {order.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            variants={itemVariants}
            className="mt-16 border-t border-border pt-16"
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gold font-light uppercase tracking-widest text-sm hover:text-goldHover transition-colors group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              Sign Out
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
