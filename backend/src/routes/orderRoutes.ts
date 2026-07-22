import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/orders/checkout:
 *   post:
 *     summary: Initiate checkout order and get Razorpay transaction configs
 *     tags: [Orders]
 */
router.post('/checkout', protect, orderController.createOrder);

/**
 * @swagger
 * /api/v1/orders/verify:
 *   post:
 *     summary: Cryptographically verify signature and confirm order payment
 *     tags: [Orders]
 */
router.post('/verify', protect, orderController.verifyPayment);

/**
 * @swagger
 * /api/v1/orders/myorders:
 *   get:
 *     summary: Get order history of current user
 *     tags: [Orders]
 */
router.get('/myorders', protect, orderController.getMyOrders);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all platform orders (Admin only)
 *     tags: [Orders]
 */
router.get('/', protect, adminOnly, orderController.getAllOrders);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Modify order status (Admin only)
 *     tags: [Orders]
 */
router.put('/:id/status', protect, adminOnly, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/v1/orders/webhook:
 *   post:
 *     summary: Listen to payment updates from Razorpay Webhook
 *     tags: [Orders]
 */
router.post('/webhook', orderController.razorpayWebhook);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get single order by ID (authenticated)
 *     tags: [Orders]
 */
router.get('/:id', protect, orderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{id}/tracking:
 *   get:
 *     summary: Get live tracking info for an order
 *     tags: [Orders]
 */
router.get('/:id/tracking', protect, orderController.getOrderTracking);

export default router;
