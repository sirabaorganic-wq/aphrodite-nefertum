'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi, ordersApi } from '@/lib/api';
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-900/20 text-yellow-400',
  PROCESSING: 'bg-blue-900/20 text-blue-400',
  SHIPPED: 'bg-indigo-900/20 text-indigo-400',
  DELIVERED: 'bg-green-900/20 text-green-400',
  CANCELLED: 'bg-red-900/20 text-red-400',
  REFUNDED: 'bg-purple-900/20 text-purple-400',
};

const INPUT_CLASS =
  'w-full bg-[#0f0d0a] border border-border text-textPrimary placeholder-textSecondary px-3 py-2 text-sm font-light focus:outline-none focus:border-gold transition-colors';

// ─── Product Form Modal ─────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: any;
  onClose: () => void;
  onSave: (data: any, id?: string) => Promise<void>;
}

function ProductFormModal({ initial, onClose, onSave }: ProductFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    collection: initial?.collection || 'nefertum',
    description: initial?.description || '',
    price: initial?.price ?? initial?.variants?.[0]?.price ?? '',
    type: initial?.type || initial?.variants?.[0]?.type || 'extrait',
    sku: initial?.sku || initial?.variants?.[0]?.sku || '',
    stock: initial?.stock ?? initial?.variants?.[0]?.stock ?? '',
    image: initial?.image || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(form, initial?.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1a1815] border border-border w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-textSecondary hover:text-gold transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-lg font-serif font-bold text-textPrimary mb-6">
          {initial ? 'Edit Product' : 'New Product'}
        </h2>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/30 p-3 mb-4">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="OUDH IMMORTEL" className={INPUT_CLASS} required />
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Collection</label>
              <select name="collection" value={form.collection} onChange={handleChange} className={INPUT_CLASS}>
                <option value="nefertum">Nefertum</option>
                <option value="aphrodite">Aphrodite</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={INPUT_CLASS}>
                <option value="extrait">Extrait de Parfum</option>
                <option value="eau-de-parfum">Eau de Parfum</option>
                <option value="eau-de-toilette">Eau de Toilette</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Price (₹)</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="6999" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="100" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} placeholder="APH-001" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="/images/products/..." className={INPUT_CLASS} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-textSecondary uppercase tracking-widest block mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Product description..."
                className={INPUT_CLASS + ' resize-none'}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-textSecondary py-2 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gold text-background py-2 text-xs uppercase tracking-widest hover:bg-goldHover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving…' : initial ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────

function ConfirmDeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#1a1815] border border-red-500/30 w-full max-w-sm p-8 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-base font-serif font-bold text-textPrimary">Delete Product?</h3>
        <p className="text-xs text-textSecondary font-light">
          Are you sure you want to delete <span className="text-textPrimary font-medium">{name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 border border-border text-textSecondary py-2 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white py-2 text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Metrics
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productModal, setProductModal] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // Role guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  // ── Fetch Metrics ──────────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const res = await adminApi.getMetrics();
      setMetrics(res.metrics || res);
    } catch (err: any) {
      setMetricsError(err.message || 'Failed to load metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchMetrics();
  }, [user, fetchMetrics]);

  // ── Fetch Products ─────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await adminApi.getProducts();
      setProducts(res.products || []);
    } catch (err: any) {
      setProductsError(err.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products' && user?.role === 'ADMIN') fetchProducts();
  }, [activeTab, user, fetchProducts]);

  // ── Fetch Orders ───────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await ordersApi.getAllOrders({ page, limit: 15 });
      setOrders(res.orders || []);
      if ((res as any).totalPages) setOrdersTotalPages((res as any).totalPages);
    } catch (err: any) {
      setOrdersError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders' && user?.role === 'ADMIN') fetchOrders(ordersPage);
  }, [activeTab, user, ordersPage, fetchOrders]);

  // ── Product CRUD ───────────────────────────────────────────────
  const handleSaveProduct = async (data: any, id?: string) => {
    if (id) {
      await adminApi.updateProduct(id, data);
    } else {
      await adminApi.createProduct(data);
    }
    fetchProducts();
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await adminApi.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  // ── Guard ──────────────────────────────────────────────────────
  if (authLoading || !user || user.role !== 'ADMIN') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-textSecondary text-sm">Checking admin authorization…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Derive KPI cards from API metrics ─────────────────────────
  const kpis = [
    {
      label: 'Total Orders',
      value: metricsLoading ? '—' : (metrics?.totalOrders ?? metrics?.orders?.total ?? '—').toLocaleString?.() || '—',
      icon: ShoppingCart,
      change: metrics?.ordersGrowth,
      isPositive: (metrics?.ordersGrowth ?? 0) >= 0,
    },
    {
      label: 'Revenue',
      value: metricsLoading ? '—' : metrics?.totalRevenue != null ? `₹${Number(metrics.totalRevenue).toLocaleString()}` : (metrics?.revenue?.total != null ? `₹${Number(metrics.revenue.total).toLocaleString()}` : '—'),
      icon: TrendingUp,
      change: metrics?.revenueGrowth,
      isPositive: (metrics?.revenueGrowth ?? 0) >= 0,
    },
    {
      label: 'Customers',
      value: metricsLoading ? '—' : (metrics?.totalUsers ?? metrics?.customers?.total ?? '—').toLocaleString?.() || '—',
      icon: Users,
      change: metrics?.usersGrowth,
      isPositive: (metrics?.usersGrowth ?? 0) >= 0,
    },
    {
      label: 'Pending Orders',
      value: metricsLoading ? '—' : (metrics?.pendingOrders ?? metrics?.orders?.pending ?? '—').toLocaleString?.() || '—',
      icon: Package,
      change: null,
      isPositive: false,
    },
  ];

  const topProducts: any[] = metrics?.topProducts || metrics?.products?.top || [];
  const weeklySales: any[] = metrics?.weeklySales || metrics?.salesByWeek || [];

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
                ADMIN DASHBOARD
              </h1>
              <p className="text-sm text-textSecondary font-light mt-1">
                Logged in as <span className="text-gold">{user.email}</span>
              </p>
            </div>
            <button
              onClick={fetchMetrics}
              className="p-3 bg-[#0f0d0a] border border-border hover:border-gold transition-colors self-start sm:self-auto"
              title="Refresh metrics"
            >
              <RefreshCw size={18} className={metricsLoading ? 'animate-spin text-gold' : ''} />
            </button>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-[#0f0d0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs font-light uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-textSecondary hover:text-gold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

              {metricsError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {metricsError}
                  <button onClick={fetchMetrics} className="ml-auto underline text-xs">Retry</button>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className="bg-[#1a1815] border border-border p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">{kpi.label}</p>
                          {metricsLoading ? (
                            <div className="h-7 bg-[#0f0d0a] w-2/3 animate-pulse" />
                          ) : (
                            <p className="text-2xl font-serif font-bold text-textPrimary">{kpi.value}</p>
                          )}
                        </div>
                        <div className="text-gold"><Icon size={24} /></div>
                      </div>
                      {kpi.change != null && (
                        <div className="flex items-center gap-1">
                          {kpi.isPositive ? (
                            <ArrowUpRight size={14} className="text-green-400" />
                          ) : (
                            <ArrowDownLeft size={14} className="text-red-400" />
                          )}
                          <span className={`text-xs font-light ${kpi.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {kpi.change > 0 ? '+' : ''}{kpi.change}%
                          </span>
                          <span className="text-xs text-textSecondary font-light">vs last month</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Sales Bars */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 bg-[#1a1815] border border-border p-8"
                >
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
                    <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">Sales Overview</h3>
                    <BarChart3 size={18} className="text-textSecondary" />
                  </div>
                  {metricsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="space-y-2">
                          <div className="flex justify-between">
                            <div className="h-3 bg-[#0f0d0a] w-16" />
                            <div className="h-3 bg-[#0f0d0a] w-20" />
                          </div>
                          <div className="w-full bg-[#0f0d0a] h-2 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : weeklySales.length > 0 ? (
                    <div className="space-y-4">
                      {weeklySales.map((item: any, i: number) => {
                        const max = Math.max(...weeklySales.map((s: any) => s.revenue || s.value || 0));
                        const pct = max > 0 ? ((item.revenue || item.value || 0) / max) * 100 : 0;
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-textSecondary font-light">{item.label || item.week || `Week ${i + 1}`}</span>
                              <span className="text-textPrimary font-light">₹{Number(item.revenue || item.value || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-[#0f0d0a] h-2 rounded-full overflow-hidden">
                              <div className="bg-gold h-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-textSecondary font-light text-center py-8">No weekly sales data available.</p>
                  )}
                </motion.div>

                {/* Top Products */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#1a1815] border border-border p-8"
                >
                  <h3 className="text-sm font-serif font-bold text-textPrimary uppercase mb-6 pb-6 border-b border-border">Top Products</h3>
                  {metricsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2, 3].map((n) => (
                        <div key={n}>
                          <div className="h-3 bg-[#0f0d0a] w-full mb-2" />
                          <div className="h-5 bg-[#0f0d0a] w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : topProducts.length > 0 ? (
                    <div className="space-y-5">
                      {topProducts.slice(0, 5).map((p: any, i: number) => (
                        <div key={i}>
                          <p className="text-xs text-textSecondary font-light mb-1">{p.name}</p>
                          <p className="text-lg font-serif font-bold text-gold">{p.sales ?? p.totalSold ?? p.count ?? 0} units</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-textSecondary font-light text-center py-8">No product data yet.</p>
                  )}
                </motion.div>
              </div>

              {/* Recent Orders preview */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#1a1815] border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-gold font-light uppercase tracking-widest hover:text-goldHover transition-colors">
                    View All →
                  </button>
                </div>
                <RecentOrdersTable orders={(metrics?.recentOrders || []).slice(0, 5)} loading={metricsLoading} />
              </motion.div>
            </motion.div>
          )}

          {/* ── PRODUCTS TAB ─────────────────────────────────── */}
          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-serif font-bold text-textPrimary">Product Catalog</h2>
                <button
                  onClick={() => { setEditingProduct(null); setProductModal('create'); }}
                  className="flex items-center gap-2 bg-gold text-background px-5 py-2 text-xs font-light uppercase tracking-widest hover:bg-goldHover transition-colors self-start"
                >
                  <Plus size={14} />
                  New Product
                </button>
              </div>

              {productsError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {productsError}
                  <button onClick={fetchProducts} className="ml-auto underline text-xs">Retry</button>
                </div>
              )}

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-[#1a1815] border border-border p-4 space-y-3">
                      <div className="h-32 bg-[#0f0d0a]" />
                      <div className="h-4 bg-[#0f0d0a] w-3/4" />
                      <div className="h-3 bg-[#0f0d0a] w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border">
                  <Package size={40} className="mx-auto text-textSecondary mb-4 opacity-30" />
                  <p className="text-sm text-textSecondary font-light">No products found.</p>
                  <button onClick={() => { setEditingProduct(null); setProductModal('create'); }} className="mt-4 text-xs text-gold border border-gold px-4 py-2 hover:bg-gold hover:text-background transition-colors">
                    Add your first product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-[#1a1815] border-b border-border">
                      <tr>
                        {['Product', 'Collection', 'Type', 'Price', 'Stock', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-serif font-bold text-textSecondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p: any) => {
                        const variant = p.variants?.[0];
                        const price = p.price ?? variant?.price;
                        const stock = p.stock ?? variant?.stock;
                        return (
                          <tr key={p.id} className="border-b border-border hover:bg-[#1a1815] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 bg-[#0f0d0a] flex-shrink-0 overflow-hidden">
                                  {(p.image || variant?.image) && (
                                    <Image src={p.image || variant?.image} alt={p.name} fill className="object-cover" />
                                  )}
                                </div>
                                <span className="text-xs font-light text-textPrimary">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-light text-textSecondary capitalize">{p.collection || '—'}</td>
                            <td className="px-6 py-4 text-xs font-light text-textSecondary capitalize">{(p.type || variant?.type || '—').replace('-', ' ')}</td>
                            <td className="px-6 py-4 text-xs font-serif font-bold text-gold">{price != null ? `₹${Number(price).toLocaleString()}` : '—'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-light px-2 py-1 ${stock != null && stock > 0 ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {stock ?? '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => { setEditingProduct(p); setProductModal('edit'); }}
                                  className="text-textSecondary hover:text-gold transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => setDeletingProduct(p)}
                                  className="text-textSecondary hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── ORDERS TAB ───────────────────────────────────── */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-serif font-bold text-textPrimary">All Orders</h2>
                <button onClick={() => fetchOrders(ordersPage)} className="flex items-center gap-2 border border-border text-textSecondary px-4 py-2 text-xs uppercase tracking-widest hover:border-gold hover:text-gold transition-colors self-start">
                  <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>

              {ordersError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {ordersError}
                  <button onClick={() => fetchOrders(ordersPage)} className="ml-auto underline text-xs">Retry</button>
                </div>
              )}

              {ordersLoading ? (
                <div className="border border-border animate-pulse">
                  <div className="p-6 bg-[#1a1815] border-b border-border h-12" />
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="border-b border-border px-6 py-5 flex gap-8">
                      <div className="h-3 bg-[#1a1815] w-24" />
                      <div className="h-3 bg-[#1a1815] w-32" />
                      <div className="h-3 bg-[#1a1815] w-20" />
                      <div className="h-3 bg-[#1a1815] w-16" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border">
                  <ShoppingCart size={40} className="mx-auto text-textSecondary mb-4 opacity-30" />
                  <p className="text-sm text-textSecondary font-light">No orders found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-[#1a1815] border-b border-border">
                        <tr>
                          {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                            <th key={h} className="text-left px-6 py-4 text-xs font-serif font-bold text-textSecondary uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: any) => {
                          const customer = order.user || order.customer;
                          const customerName = customer
                            ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email
                            : 'Guest';
                          const status = (order.status || 'PENDING').toUpperCase();
                          const total = order.total ?? order.amount ?? 0;
                          const itemCount = order.items?.length ?? order.orderItems?.length ?? '—';
                          const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                          return (
                            <tr key={order.id} className="border-b border-border hover:bg-[#1a1815] transition-colors">
                              <td className="px-6 py-4 text-xs font-light text-gold font-mono">
                                {(order.id || '').slice(0, 8).toUpperCase()}…
                              </td>
                              <td className="px-6 py-4 text-xs font-light text-textPrimary">{customerName}</td>
                              <td className="px-6 py-4 text-xs font-light text-textSecondary">{itemCount} {itemCount === 1 ? 'item' : 'items'}</td>
                              <td className="px-6 py-4 text-xs font-serif font-bold text-textPrimary">₹{Number(total).toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`text-xs font-light px-2 py-1 ${STATUS_COLORS[status] || 'bg-border text-textSecondary'}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-light text-textSecondary whitespace-nowrap">{date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {ordersTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        disabled={ordersPage <= 1}
                        onClick={() => { setOrdersPage((p) => p - 1); }}
                        className="p-2 border border-border text-textSecondary hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs text-textSecondary font-light">
                        Page {ordersPage} of {ordersTotalPages}
                      </span>
                      <button
                        disabled={ordersPage >= ordersTotalPages}
                        onClick={() => { setOrdersPage((p) => p + 1); }}
                        className="p-2 border border-border text-textSecondary hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(productModal === 'create' || productModal === 'edit') && (
          <ProductFormModal
            key="product-modal"
            initial={productModal === 'edit' ? editingProduct : undefined}
            onClose={() => { setProductModal(null); setEditingProduct(null); }}
            onSave={handleSaveProduct}
          />
        )}
        {deletingProduct && (
          <ConfirmDeleteModal
            key="delete-modal"
            name={deletingProduct.name}
            onConfirm={handleDeleteProduct}
            onClose={() => setDeletingProduct(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

// ─── Shared Recent Orders Table ─────────────────────────────────────────────

function RecentOrdersTable({ orders, loading }: { orders: any[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="overflow-x-auto animate-pulse p-6 space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-6">
            <div className="h-3 bg-[#0f0d0a] w-20" />
            <div className="h-3 bg-[#0f0d0a] w-32" />
            <div className="h-3 bg-[#0f0d0a] w-20" />
            <div className="h-3 bg-[#0f0d0a] w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (!orders || orders.length === 0) {
    return (
      <p className="text-xs text-textSecondary font-light text-center py-8">
        No recent orders to display.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border">
          <tr>
            {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
              <th key={h} className="text-left px-6 py-3 text-xs font-serif font-bold text-textSecondary uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any, i: number) => {
            const customer = order.user || order.customer;
            const customerName = customer
              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email
              : 'Guest';
            const status = (order.status || 'PENDING').toUpperCase();
            const total = order.total ?? order.amount ?? 0;
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—';
            return (
              <tr key={i} className="border-b border-border hover:bg-[#0f0d0a] transition-colors">
                <td className="px-6 py-3 text-xs font-light text-gold font-mono">{(order.id || '').slice(0, 8).toUpperCase()}…</td>
                <td className="px-6 py-3 text-xs font-light text-textPrimary">{customerName}</td>
                <td className="px-6 py-3 text-xs font-serif font-bold text-textPrimary">₹{Number(total).toLocaleString()}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-light px-2 py-1 ${STATUS_COLORS[status] || 'bg-border text-textSecondary'}`}>{status}</span>
                </td>
                <td className="px-6 py-3 text-xs font-light text-textSecondary">{date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
