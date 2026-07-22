import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

export class AnalyticsService {
  async getDashboardMetrics() {
    logger.info('Compiling admin analytics dashboard metrics...');

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      pendingOrders,
      paidOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'PAID' },
      }),
      prisma.user.count({ where: { role: 'CONSUMER' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      pendingOrders,
      paidOrders,
      cancelledOrders,
    };
  }

  async getMonthlySales() {
    // Aggregate orders by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const orders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: twelveMonthsAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by YYYY-MM
    const monthlyMap: Record<string, { revenue: number; count: number }> = {};
    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { revenue: 0, count: 0 };
      }
      monthlyMap[key].revenue += order.totalAmount;
      monthlyMap[key].count += 1;
    }

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue * 100) / 100,
      orderCount: data.count,
    }));
  }

  async getTopSellingProducts(limit: number = 5) {
    const items = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    return items.map((item) => {
      const variant = variantMap.get(item.variantId);
      return {
        variantId: item.variantId,
        productName: variant?.product.name || 'Unknown',
        size: variant?.size || 'N/A',
        sku: variant?.sku || 'N/A',
        totalUnitsSold: item._sum.quantity || 0,
        totalOrders: item._count.id,
      };
    });
  }

  async getCustomerGrowth() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await prisma.user.findMany({
      where: {
        role: 'CONSUMER',
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyMap: Record<string, number> = {};
    for (const user of users) {
      const key = `${user.createdAt.getFullYear()}-${String(user.createdAt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    }

    return Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      newCustomers: count,
    }));
  }

  async getCouponAnalytics() {
    const coupons = await prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        usageCount: true,
        usageLimit: true,
        isActive: true,
        expiresAt: true,
        orders: {
          select: {
            totalAmount: true,
            discountAmount: true,
          },
        },
      },
      orderBy: { usageCount: 'desc' },
    });

    return coupons.map((coupon) => {
      const totalDiscountGiven = coupon.orders.reduce((sum, o) => sum + o.discountAmount, 0);
      const totalOrderValue = coupon.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        usageCount: coupon.usageCount,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
        expiresAt: coupon.expiresAt,
        totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
        totalOrderValue: Math.round(totalOrderValue * 100) / 100,
      };
    });
  }

  async getLowStockAlerts(threshold: number = 10) {
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lte: threshold } },
      include: {
        product: {
          select: { name: true, collection: true },
        },
      },
      orderBy: { stock: 'asc' },
    });

    return lowStockVariants.map((v) => ({
      variantId: v.id,
      productName: v.product.name,
      collection: v.product.collection,
      sku: v.sku,
      size: v.size,
      currentStock: v.stock,
      alert: v.stock === 0 ? 'OUT_OF_STOCK' : v.stock <= 5 ? 'CRITICAL' : 'LOW',
    }));
  }

  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const analyticsService = new AnalyticsService();
