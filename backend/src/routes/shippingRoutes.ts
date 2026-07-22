import { Router } from 'express';
import { shiprocketController } from '../controllers/shiprocketController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/shipping/serviceability:
 *   get:
 *     summary: Check delivery serviceability for a pincode
 *     tags: [Shipping]
 *     parameters:
 *       - in: query
 *         name: pincode
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: weight
 *         required: false
 *         schema:
 *           type: number
 */
router.get('/serviceability', shiprocketController.checkServiceability);

export default router;
