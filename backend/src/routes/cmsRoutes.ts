import { Router } from 'express';
import { cmsController } from '../controllers/cmsController.js';
import { protect, looseProtect, adminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/v1/cms/type/{type}:
 *   get:
 *     summary: Get all CMS content entries by type (JOURNAL, PHILOSOPHY, BOTANICS, etc.)
 *     tags: [CMS]
 */
router.get('/type/:type', looseProtect, cmsController.getContentByType);

/**
 * @swagger
 * /api/v1/cms/slug/{slug}:
 *   get:
 *     summary: Get a single CMS content entry by its slug
 *     tags: [CMS]
 */
router.get('/slug/:slug', looseProtect, cmsController.getContentBySlug);

/**
 * @swagger
 * /api/v1/cms:
 *   post:
 *     summary: Create a new CMS content entry (Admin only)
 *     tags: [CMS]
 */
router.post('/', protect, adminOnly, cmsController.createContent);

/**
 * @swagger
 * /api/v1/cms/{id}:
 *   put:
 *     summary: Update an existing CMS content entry (Admin only)
 *     tags: [CMS]
 */
router.put('/:id', protect, adminOnly, cmsController.updateContent);

/**
 * @swagger
 * /api/v1/cms/{id}:
 *   delete:
 *     summary: Delete a CMS content entry (Admin only)
 *     tags: [CMS]
 */
router.delete('/:id', protect, adminOnly, cmsController.deleteContent);

export default router;
