import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { orderController } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all platform orders (Admin alias)
 *     tags: [Orders]
 */
router.get('/orders', protect, adminOnly, orderController.getAllOrders);

/**
 * @swagger
 * /api/v1/admin/metrics:
 *   get:
 *     summary: Get KPI dashboard metrics (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/metrics', protect, adminOnly, analyticsController.getDashboardMetrics);

/**
 * @swagger
 * /api/v1/admin/sales:
 *   get:
 *     summary: Get monthly sales aggregation (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/sales', protect, adminOnly, analyticsController.getMonthlySales);

/**
 * @swagger
 * /api/v1/admin/top-products:
 *   get:
 *     summary: Get top-selling products (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/top-products', protect, adminOnly, analyticsController.getTopSellingProducts);

/**
 * @swagger
 * /api/v1/admin/customer-growth:
 *   get:
 *     summary: Get customer growth over time (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/customer-growth', protect, adminOnly, analyticsController.getCustomerGrowth);

/**
 * @swagger
 * /api/v1/admin/coupon-analytics:
 *   get:
 *     summary: Get coupon performance analytics (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/coupon-analytics', protect, adminOnly, analyticsController.getCouponAnalytics);

/**
 * @swagger
 * /api/v1/admin/low-stock:
 *   get:
 *     summary: Get low-stock and out-of-stock alerts (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/low-stock', protect, adminOnly, analyticsController.getLowStockAlerts);

/**
 * @swagger
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get paginated audit logs (Admin only)
 *     tags: [Admin Analytics]
 */
router.get('/audit-logs', protect, adminOnly, analyticsController.getAuditLogs);

export default router;
