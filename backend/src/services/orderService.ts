import crypto from 'crypto';
import { orderRepository } from '../repositories/orderRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { addressRepository } from '../repositories/addressRepository.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { couponService } from './couponService.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { prisma } from '../config/db.js';
import { razorpayClient, isRazorpayMock } from '../config/razorpay.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/customError.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { addJobToQueue, emailQueue, shipmentQueue } from '../config/bullQueue.js';
import { logger } from '../utils/logger.js';

export class OrderService {
  async createOrder(params: {
    userId: string;
    addressId: string;
    items: Array<{ variantId: string; quantity: number }>;
    couponCode?: string;
  }) {
    logger.info(`Initializing checkout for user: ${params.userId}`);

    // 1. Verify address
    const address = await addressRepository.findAddressById(params.addressId);
    if (!address || address.userId !== params.userId) {
      throw new NotFoundError('Selected shipping address not found.');
    }

    const sessionId = crypto.randomUUID();
    const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes hold

    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: any[] = [];
      const reservationsToCreate: any[] = [];

      // 2. Validate items, pricing and stock
      for (const item of params.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new NotFoundError(`Fragrance variant not found.`);
        }

        if (variant.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for ${variant.product.name} (${variant.size}). Only ${variant.stock} units left.`);
        }

        const price = variant.discountPrice || variant.price;
        subtotal += price * item.quantity;

        orderItemsToCreate.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: price,
          name: variant.product.name,
          size: variant.size,
        });

        // Reserve stock: decrement variant stock immediately in database
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Track temporary hold
        reservationsToCreate.push({
          variantId: variant.id,
          quantity: item.quantity,
          sessionId,
          expiresAt: reservationExpiry,
        });
      }

      // 3. Handle Coupon discount
      let discountAmount = 0;
      let couponId: string | null = null;
      if (params.couponCode) {
        try {
          const validation = await couponService.validateCoupon(params.couponCode, subtotal);
          discountAmount = validation.discountAmount;
          couponId = validation.coupon.id;
        } catch (e: any) {
          throw new BadRequestError(`Coupon validation failed: ${e.message}`);
        }
      }

      // 4. Calculate Shipping Fee (₹500 flat, free above ₹10,000 post-discount)
      const shippingFee = (subtotal - discountAmount) >= 10000 ? 0 : 500;
      const totalAmount = subtotal - discountAmount + shippingFee;

      // 5. Create Order parent in PENDING state
      const order = await tx.order.create({
        data: {
          userId: params.userId,
          addressId: params.addressId,
          subtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          couponId,
          status: 'PENDING',
          razorpayOrderId: `PENDING_RZP_${sessionId}`, // Temporary placeholder
        },
      });

      // 6. Create Order children
      await tx.orderItem.createMany({
        data: orderItemsToCreate.map((item) => ({
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // 7. Write stock reservations to db
      await tx.stockReservation.createMany({
        data: reservationsToCreate,
      });

      // 8. Initialize Razorpay Payment Order
      let razorpayOrderId = '';
      if (isRazorpayMock) {
        razorpayOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      } else if (razorpayClient) {
        try {
          const rzpOrder = await razorpayClient.orders.create({
            amount: Math.round(totalAmount * 100), // in paise
            currency: 'INR',
            receipt: order.id,
            notes: {
              orderId: order.id,
              userId: params.userId,
            },
          });
          razorpayOrderId = rzpOrder.id;
        } catch (e: any) {
          logger.error(`Razorpay checkout initialization failed: ${e.message}`);
          throw new BadRequestError(`Payment gateway initialization failed: ${e.message}`);
        }
      }

      // Update Order with final Razorpay Order ID and bind session id
      await tx.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId,
        },
      });

      // Update reservations with razorpayOrderId as session identifier
      await tx.stockReservation.updateMany({
        where: { sessionId },
        data: { sessionId: razorpayOrderId },
      });

      logger.info(`Checkout pending order initialized: ${order.id} (Razorpay: ${razorpayOrderId})`);

      return {
        orderId: order.id,
        amount: totalAmount,
        currency: 'INR',
        razorpayOrderId,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123',
      };
    });
  }

  async verifyPayment(params: {
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    logger.info(`Verifying payment for Razorpay Order: ${params.razorpayOrderId}`);

    const order = await orderRepository.findOrderByRazorpayId(params.razorpayOrderId);
    if (!order) {
      throw new NotFoundError('Order associated with this payment not found.');
    }

    if (order.userId !== params.userId) {
      throw new ForbiddenError('Access denied. You do not own this order.');
    }

    // 1. Signature Verification
    if (!isRazorpayMock) {
      const secret = process.env.RAZORPAY_KEY_SECRET || 'mockKeySecret45678';
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== params.razorpaySignature) {
        logger.warn(`Signature mismatch on Razorpay Order: ${params.razorpayOrderId}`);
        
        // Restore stock holds
        await this.rollbackOrderStock(params.razorpayOrderId);
        
        await orderRepository.updateOrderStatus(order.id, 'FAILED');
        throw new BadRequestError('Payment signature verification failed.');
      }
    }

    // 2. Process Successful Payment
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Transition order status to PAID
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature,
        },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });

      // Clear stock holds for this order session
      await tx.stockReservation.deleteMany({
        where: { sessionId: params.razorpayOrderId },
      });

      // Increment Coupon usage if applied
      if (updated.couponId) {
        await tx.coupon.update({
          where: { id: updated.couponId },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      // Clear User Shopping Cart
      const cart = await tx.cart.findUnique({ where: { userId: params.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return updated;
    });

    // Write Audit Log
    await logAuditAction({
      actorId: params.userId,
      actorEmail: order.user?.email,
      actorRole: order.user?.role,
      action: 'ORDER_PAID',
      entityType: 'Order',
      entityId: order.id,
      metadata: { totalAmount: order.totalAmount, paymentId: params.razorpayPaymentId },
    });

    // Queue Order Confirmation Email
    const emailPayload = {
      id: updatedOrder.id,
      subtotal: updatedOrder.subtotal,
      discountAmount: updatedOrder.discountAmount,
      shippingFee: updatedOrder.shippingFee,
      totalAmount: updatedOrder.totalAmount,
      items: updatedOrder.items.map((item) => ({
        name: item.variant.product.name,
        size: item.variant.size,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    if (order.user?.email) {
      await addJobToQueue(emailQueue, 'sendOrderConfirmation', {
        email: order.user.email,
        payload: { order: emailPayload },
      });
    }

    // Queue Shiprocket Order Creation job
    await addJobToQueue(shipmentQueue, 'createShipment', {
      orderId: updatedOrder.id,
    });

    logger.info(`Payment verified and confirmed for Order ID: ${order.id}`);
    return updatedOrder;
  }

  // Rollback reserved stock
  private async rollbackOrderStock(razorpayOrderId: string) {
    try {
      const reservations = await orderRepository.findStockReservationsBySession(razorpayOrderId);
      if (reservations.length > 0) {
        await prisma.$transaction(async (tx) => {
          for (const res of reservations) {
            await tx.productVariant.update({
              where: { id: res.variantId },
              data: {
                stock: { increment: res.quantity },
              },
            });
          }
          await tx.stockReservation.deleteMany({
            where: { sessionId: razorpayOrderId },
          });
        });
        logger.info(`Stock reservations rolled back and restored for session: ${razorpayOrderId}`);
      }
    } catch (e: any) {
      logger.error(`Failed to rollback stock for session ${razorpayOrderId}: ${e.message}`);
    }
  }

  // Stock Reservation Release Daemon Task
  async releaseExpiredReservations() {
    const expiredReservations = await orderRepository.getExpiredStockReservations();
    if (expiredReservations.length === 0) return;

    logger.info(`Found ${expiredReservations.length} expired stock reservations. Releasing holds...`);

    for (const res of expiredReservations) {
      try {
        await prisma.$transaction(async (tx) => {
          // Restore variant stock
          await tx.productVariant.update({
            where: { id: res.variantId },
            data: {
              stock: { increment: res.quantity },
            },
          });

          // Delete hold row
          await tx.stockReservation.delete({
            where: { id: res.id },
          });

          // Find pending order associated with the session ID
          const order = await tx.order.findFirst({
            where: {
              razorpayOrderId: res.sessionId,
              status: 'PENDING',
            },
          });

          if (order) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: 'FAILED' },
            });
            logger.debug(`Transitioned expired order ${order.id} status to FAILED.`);
          }
        });
        
        await logAuditAction({
          action: 'STOCK_RESERVATION_RELEASED',
          entityType: 'ProductVariant',
          entityId: res.variantId,
          metadata: { quantity: res.quantity, session: res.sessionId },
        });
      } catch (e: any) {
        logger.error(`Error releasing stock reservation ${res.id}: ${e.message}`);
      }
    }
    logger.info('Expired stock reservation cleanup cycle complete.');
  }

  async getMyOrders(userId: string) {
    return orderRepository.findUserOrders(userId);
  }

  async getAllOrders() {
    return orderRepository.findAllOrders();
  }

  async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PAID' | 'FAILED' | 'PAYMENT_FAILED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_INITIATED' | 'RETURNED' | 'REFUNDED',
    actor: { id: string; email: string; role: string }
  ) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order details not found.');
    }

    const updated = await orderRepository.updateOrderStatus(orderId, status);

    // If order was cancelled and was paid, restore stock levels
    if (status === 'CANCELLED' && order.status === 'PAID') {
      logger.info(`Restoring stock levels for cancelled PAID order: ${orderId}`);
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }
      });
    }

    await logAuditAction({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: `ORDER_STATUS_${status}`,
      entityType: 'Order',
      entityId: orderId,
    });

    // If shipment status updated, dispatch email notification
    if (order.user?.email && ['SHIPPED', 'DELIVERED'].includes(status)) {
      await addJobToQueue(emailQueue, 'sendShipmentUpdate', {
        email: order.user.email,
        payload: {
          order: { id: order.id },
          status: status,
          awb: order.shiprocketAwb,
        },
      });
    }

    return updated;
  }
}

export const orderService = new OrderService();
