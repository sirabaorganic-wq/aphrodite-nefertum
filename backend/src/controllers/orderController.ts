import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService.js';
import { createOrderSchema, verifyPaymentSchema } from '../validators/orderValidator.js';
import { UnauthorizedError, BadRequestError } from '../utils/customError.js';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = createOrderSchema.parse(req.body);
      
      const result = await orderService.createOrder({
        userId: req.user.id,
        addressId: validatedBody.addressId,
        items: validatedBody.items,
        couponCode: validatedBody.couponCode,
      });

      res.status(201).json({
        success: true,
        message: 'Checkout initialized.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = verifyPaymentSchema.parse(req.body);
      
      const order = await orderService.verifyPayment({
        userId: req.user.id,
        razorpayOrderId: validatedBody.razorpayOrderId,
        razorpayPaymentId: validatedBody.razorpayPaymentId,
        razorpaySignature: validatedBody.razorpaySignature,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed.',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const orders = await orderService.getMyOrders(req.user.id);
      
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['PENDING', 'PAID', 'FAILED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!status || !validStatuses.includes(status)) {
        throw new BadRequestError('Invalid order status value.');
      }

      const order = await orderService.updateOrderStatus(id, status, req.user);
      
      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}.`,
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Strict Razorpay Webhook Endpoint
  async razorpayWebhook(req: Request, res: Response, next: NextFunction) {
    logger.info('Received Razorpay Webhook request.');
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_razorpay_webhook_secret_key';

    if (!signature) {
      return res.status(400).send('Webhook Signature header missing.');
    }

    // 1. Signature check — use raw body (Buffer) for HMAC, not JSON.stringify
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isMockWebhook = webhookSecret === 'mock_razorpay_webhook_secret_key';

    if (!isMockWebhook && expectedSignature !== signature) {
      logger.warn('Razorpay webhook signature verification failed.');
      return res.status(400).send('Invalid webhook signature.');
    }

    // 2. Parse body — raw middleware delivers Buffer, parse to JSON
    let event: any;
    try {
      event = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    } catch (parseErr: any) {
      logger.error(`Razorpay webhook body parse error: ${parseErr.message}`);
      return res.status(400).send('Malformed webhook body.');
    }

    const eventId = event.id;

    // 3. Idempotency Check (prevent replay duplicate execution)
    try {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { id: eventId },
      });

      if (existingEvent) {
        logger.info(`Webhook event ${eventId} already processed, skipping.`);
        return res.status(200).json({ status: 'OK', message: 'Already processed' });
      }

      // Record event before processing to lock it
      await prisma.webhookEvent.create({
        data: {
          id: eventId,
          provider: 'RAZORPAY',
          status: 'PROCESSING',
        },
      });
    } catch (dbErr: any) {
      logger.error(`Webhook idempotency locking error: ${dbErr.message}`);
      return res.status(500).send('Locking failed.');
    }

    // 4. Process events
    try {
      const payload = event.payload;

      if (event.event === 'order.paid' || event.event === 'payment.captured') {
        const rzpOrderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
        const rzpPaymentId = payload.payment?.entity?.id;
        const rzpSignature = signature;

        if (rzpOrderId) {
          logger.info(`Webhook payment success reported for order ${rzpOrderId}`);
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId: rzpOrderId },
            include: { user: true },
          });

          if (order && order.status === 'PENDING') {
            await orderService.verifyPayment({
              userId: order.userId || '',
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId || 'webhook_captured',
              razorpaySignature: rzpSignature,
            });
          }
        }
      } else if (event.event === 'payment.failed') {
        const rzpOrderId = payload.payment?.entity?.order_id;
        if (rzpOrderId) {
          logger.warn(`Webhook payment failed reported for order ${rzpOrderId}. Rolling back stock holds.`);
          
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId: rzpOrderId },
          });

          if (order && order.status === 'PENDING') {
            // Restore stock holds
            const reservations = await prisma.stockReservation.findMany({
              where: { sessionId: rzpOrderId },
            });
            
            await prisma.$transaction(async (tx) => {
              for (const res of reservations) {
                await tx.productVariant.update({
                  where: { id: res.variantId },
                  data: { stock: { increment: res.quantity } },
                });
              }
              await tx.stockReservation.deleteMany({
                where: { sessionId: rzpOrderId },
              });
              await tx.order.update({
                where: { id: order.id },
                data: { status: 'PAYMENT_FAILED' },
              });
            });
          }
        }
      } else if (event.event === 'refund.processed') {
        // Handle refund — mark order as REFUNDED
        const rzpOrderId = payload.payment?.entity?.order_id || payload.refund?.entity?.order_id;
        if (rzpOrderId) {
          logger.info(`Webhook refund processed for order ${rzpOrderId}`);
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId: rzpOrderId },
          });

          if (order && order.status !== 'REFUNDED') {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'REFUNDED' },
            });

            // Restore stock on refund
            for (const item of (await prisma.orderItem.findMany({ where: { orderId: order.id } }))) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }
      }

      // Update event status to PROCESSED
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'PROCESSED' },
      });

      res.status(200).json({ status: 'OK' });
    } catch (e: any) {
      logger.error(`Webhook processing failure for event ${eventId}: ${e.message}`);
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { status: 'FAILED' },
      });
      res.status(500).send(`Webhook execution failed: ${e.message}`);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          address: true,
        },
      });

      if (!order) {
        throw new BadRequestError('Order not found.');
      }

      // Users can only view their own orders; admins can view any
      if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Access denied.');
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderTracking(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          status: true,
          shiprocketAwb: true,
          shiprocketShipmentId: true,
          shiprocketOrderId: true,
          trackingUrl: true,
        },
      });

      if (!order) {
        throw new BadRequestError('Order not found.');
      }

      if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Access denied.');
      }

      if (!order.shiprocketAwb) {
        return res.status(200).json({
          success: true,
          tracking: {
            awb: null,
            courier: null,
            currentStatus: order.status,
            estimatedDelivery: null,
            trackingUrl: null,
            statusHistory: [],
          },
        });
      }

      // Try to get live tracking from Shiprocket (via service)
      const { shiprocketService } = await import('../services/shiprocketService.js');
      const tracking = await shiprocketService.getTrackingInfo(order.id, order.shiprocketAwb, order.status);

      res.status(200).json({
        success: true,
        tracking,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
