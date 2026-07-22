import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { protect, looseProtect, adminOnly } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/storage.js';

const router = Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Retrieve products with pagination and filtering
 *     tags: [Products]
 */
router.get('/', looseProtect, productController.getProducts);

/**
 * @swagger
 * /api/v1/products/slug/{slug}:
 *   get:
 *     summary: Get details of a single product by URL slug
 *     tags: [Products]
 */
router.get('/slug/:slug', looseProtect, productController.getProductBySlug);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get details of a single product by UUID
 *     tags: [Products]
 */
router.get('/:id', looseProtect, productController.getProductById);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 */
router.post('/', protect, adminOnly, productController.createProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Update an existing product (Admin only)
 *     tags: [Products]
 */
router.put('/:id', protect, adminOnly, productController.updateProduct);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 */
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

/**
 * @swagger
 * /api/v1/products/{productId}/variants:
 *   post:
 *     summary: Add a variant to a product (Admin only)
 *     tags: [Products]
 */
router.post('/:productId/variants', protect, adminOnly, productController.addVariant);

/**
 * @swagger
 * /api/v1/products/variants/{variantId}:
 *   put:
 *     summary: Update a product variant (Admin only)
 *     tags: [Products]
 */
router.put('/variants/:variantId', protect, adminOnly, productController.updateVariant);

/**
 * @swagger
 * /api/v1/products/variants/{variantId}:
 *   delete:
 *     summary: Delete a product variant (Admin only)
 *     tags: [Products]
 */
router.delete('/variants/:variantId', protect, adminOnly, productController.deleteVariant);

/**
 * @swagger
 * /api/v1/products/upload:
 *   post:
 *     summary: Upload a product image to storage (Admin only)
 *     tags: [Products]
 */
router.post('/upload', protect, adminOnly, upload.single('image'), productController.uploadImage);

export default router;
