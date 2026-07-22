import { Request, Response, NextFunction } from 'express';
import { shiprocketService } from '../services/shiprocketService.js';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export class ShiprocketController {
  async shiprocketWebhook(req: Request, res: Response, next: NextFunction) {
    logger.info('Received Shiprocket logistics webhook update.');

    // Shiprocket sends signature in x-shiprocket-hmac-sha256 header
    const signature = req.headers['x-shiprocket-hmac-sha256'] as string;
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET || 'mock_shiprocket_webhook_secret_key';

    // Use raw body (Buffer) for HMAC — express.raw() delivers Buffer
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isMockWebhook = webhookSecret === 'mock_shiprocket_webhook_secret_key';

    if (!isMockWebhook && signature && expectedSignature !== signature) {
      logger.warn('Shiprocket webhook signature verification failed.');
      return res.status(400).send('Invalid webhook signature.');
    }

    // Parse body — raw middleware delivers Buffer
    let body: any;
    try {
      body = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    } catch (parseErr: any) {
      logger.error(`Shiprocket webhook body parse error: ${parseErr.message}`);
      return res.status(400).send('Malformed webhook body.');
    }

    // Capture unique event ID for idempotency
    const eventId = (body.awb || 'unknown') + '-' + (body.current_status_id || '0') + '-' + (body.etd || Date.now());

    try {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { id: eventId },
      });

      if (existingEvent) {
        logger.info(`Shiprocket event ${eventId} already processed, skipping.`);
        return res.status(200).json({ success: true, message: 'Duplicate event bypassed' });
      }

      await prisma.webhookEvent.create({
        data: {
          id: eventId,
          provider: 'SHIPROCKET',
          status: 'PROCESSING',
        },
      });
    } catch (dbErr: any) {
      logger.error(`Shiprocket webhook idempotency error: ${dbErr.message}`);
      return res.status(500).send('Idempotency lock failed.');
    }

    try {
      // Process status updates
      await shiprocketService.handleLogisticsWebhook(body);

      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'PROCESSED' },
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      logger.error(`Shiprocket webhook processing error: ${error.message}`);
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'FAILED' },
      });
      res.status(500).send('Webhook execution failed.');
    }
  }

  async checkServiceability(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode } = req.query;
      if (!pincode || typeof pincode !== 'string' || pincode.length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'Valid 6-digit pincode is required.',
        });
      }

      const weight = parseFloat(req.query.weight as string) || 0.5;
      const { shiprocketClient } = await import('../config/shiprocket.js');
      const result = await shiprocketClient.checkServiceability(pincode, weight);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const shiprocketController = new ShiprocketController();
