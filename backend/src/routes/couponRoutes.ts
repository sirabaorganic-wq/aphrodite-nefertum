import { Router } from 'express';
import { couponController } from '../controllers/couponController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   get:
 *     summary: Validate a coupon code against a purchase subtotal (Public)
 *     tags: [Coupons]
 */
router.get('/validate', couponController.validateCoupon);

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: Retrieve all coupons (Admin only)
 *     tags: [Coupons]
 */
router.get('/', protect, adminOnly, couponController.getAllCoupons);

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Create a new discount coupon (Admin only)
 *     tags: [Coupons]
 */
router.post('/', protect, adminOnly, couponController.createCoupon);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   put:
 *     summary: Update an existing coupon (Admin only)
 *     tags: [Coupons]
 */
router.put('/:id', protect, adminOnly, couponController.updateCoupon);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   delete:
 *     summary: Delete a coupon (Admin only)
 *     tags: [Coupons]
 */
router.delete('/:id', protect, adminOnly, couponController.deleteCoupon);

export default router;
