'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  Settings,
} from 'lucide-react';

export default function AdminPage() {
  const kpis = [
    {
      label: 'Total Orders',
      value: '1,248',
      change: '+12.5%',
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      label: 'Revenue',
      value: '₹68,45,230',
      change: '+8.2%',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      label: 'Customers',
      value: '8,432',
      change: '+5.1%',
      isPositive: true,
      icon: Users,
    },
    {
      label: 'Pending Orders',
      value: '23',
      change: '-2.3%',
      isPositive: false,
      icon: Package,
    },
  ];

  const recentOrders = [
    {
      id: '#APH24001',
      customer: 'Rajesh Sharma',
      product: 'OUDH IMMORTEL',
      amount: '₹6,999',
      status: 'Shipped',
      date: '2 hours ago',
    },
    {
      id: '#APH23999',
      customer: 'Priya Patel',
      product: 'SACRED LOTUS',
      amount: '₹5,999',
      status: 'Processing',
      date: '4 hours ago',
    },
    {
      id: '#APH23997',
      customer: 'Arun Gupta',
      product: 'DESERT OBSIDIAN',
      amount: '₹5,499',
      status: 'Delivered',
      date: '1 day ago',
    },
  ];

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
                ADMIN DASHBOARD
              </h1>
              <p className="text-sm text-textSecondary font-light mt-2">
                Overview
              </p>
            </div>
            <Link
              href="#"
              className="p-3 bg-[#0f0d0a] border border-border hover:border-gold transition-colors"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1815] border border-border p-6 rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-serif font-bold text-textPrimary">
                      {kpi.value}
                    </p>
                  </div>
                  <div className="text-gold">
                    <IconComponent size={24} />
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {kpi.isPositive ? (
                    <ArrowUpRight size={14} className="text-green-400" />
                  ) : (
                    <ArrowDownLeft size={14} className="text-red-400" />
                  )}
                  <span
                    className={`text-xs font-light ${
                      kpi.isPositive
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-xs text-textSecondary font-light">
                    vs last month
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#1a1815] border border-border p-8 rounded-none"
          >
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                Sales Overview
              </h3>
              <select className="bg-[#0f0d0a] border border-border text-textSecondary text-xs p-2 hover:border-gold transition-colors">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
              </select>
            </div>

            {/* Simple Chart Placeholder */}
            <div className="space-y-4">
              {[
                { label: 'Week 1', value: 65 },
                { label: 'Week 2', value: 78 },
                { label: 'Week 3', value: 85 },
                { label: 'Week 4', value: 92 },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-textSecondary font-light">{item.label}</span>
                    <span className="text-textPrimary font-light">
                      ₹{item.value * 10000}
                    </span>
                  </div>
                  <div className="w-full bg-[#0f0d0a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gold h-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1815] border border-border p-8 rounded-none"
          >
            <h3 className="text-sm font-serif font-bold text-textPrimary uppercase mb-6 pb-6 border-b border-border">
              Top Products
            </h3>
            <div className="space-y-4">
              {[
                { name: 'OUDH IMMORTEL', sales: 342 },
                { name: 'SACRED LOTUS', sales: 287 },
                { name: 'DESERT OBSIDIAN', sales: 195 },
              ].map((product, index) => (
                <div key={index}>
                  <p className="text-xs text-textSecondary font-light mb-2">
                    {product.name}
                  </p>
                  <p className="text-lg font-serif font-bold text-gold">
                    {product.sales} units
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-[#1a1815] border border-border rounded-none overflow-hidden"
        >
          <div className="p-8 border-b border-border">
            <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
              Recent Orders
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Order ID
                  </th>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Customer
                  </th>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Product
                  </th>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Amount
                  </th>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Status
                  </th>
                  <th className="text-left px-8 py-4 text-xs font-serif font-bold text-textSecondary uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-[#0f0d0a] transition-colors"
                  >
                    <td className="px-8 py-4 text-xs font-light text-gold">
                      {order.id}
                    </td>
                    <td className="px-8 py-4 text-xs font-light text-textPrimary">
                      {order.customer}
                    </td>
                    <td className="px-8 py-4 text-xs font-light text-textSecondary">
                      {order.product}
                    </td>
                    <td className="px-8 py-4 text-xs font-light text-textPrimary">
                      {order.amount}
                    </td>
                    <td className="px-8 py-4">
                      <span
                        className={`text-xs font-light px-3 py-1 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-green-900/20 text-green-400'
                            : order.status === 'Shipped'
                            ? 'bg-blue-900/20 text-blue-400'
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs font-light text-textSecondary">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-border text-center">
            <Link
              href="#"
              className="text-xs font-light text-gold uppercase tracking-widest hover:text-goldHover transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
