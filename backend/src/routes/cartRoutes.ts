import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { protect, looseProtect } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get cart details for user or guest
 *     tags: [Cart]
 */
router.get('/', looseProtect, cartController.getCart);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add item to user or guest cart
 *     tags: [Cart]
 */
router.post('/items', looseProtect, cartController.addItem);

/**
 * @swagger
 * /api/v1/cart/items/{variantId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 */
router.put('/items/:variantId', looseProtect, cartController.updateItemQuantity);

/**
 * @swagger
 * /api/v1/cart/items/{variantId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 */
router.delete('/items/:variantId', looseProtect, cartController.removeItem);

/**
 * @swagger
 * /api/v1/cart/merge:
 *   post:
 *     summary: Merge anonymous session cart into logged-in user cart
 *     tags: [Cart]
 */
router.post('/merge', protect, cartController.mergeCart);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 */
router.delete('/', looseProtect, cartController.clearCart);

export default router;
