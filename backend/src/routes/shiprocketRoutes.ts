import { Router } from 'express';
import { shiprocketController } from '../controllers/shiprocketController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/logistics/webhook:
 *   post:
 *     summary: Webhook endpoint for Shiprocket tracking updates
 *     tags: [Logistics]
 */
router.post('/webhook', shiprocketController.shiprocketWebhook);

export default router;
