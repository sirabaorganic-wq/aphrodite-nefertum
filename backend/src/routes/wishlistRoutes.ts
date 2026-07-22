import { Router } from 'express';
import { wishlistController } from '../controllers/wishlistController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Retrieve wishlist items of authenticated user
 *     tags: [Wishlist]
 */
router.get('/', protect, wishlistController.getWishlist);

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     summary: Add product to user wishlist
 *     tags: [Wishlist]
 */
router.post('/', protect, wishlistController.addToWishlist);

/**
 * @swagger
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 */
router.delete('/:productId', protect, wishlistController.removeFromWishlist);

export default router;
