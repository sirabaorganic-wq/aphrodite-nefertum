import { shiprocketClient } from '../config/shiprocket.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { prisma } from '../config/db.js';
import { redisConnection } from '../config/redis.js';
import { addJobToQueue, emailQueue } from '../config/bullQueue.js';
import { logger } from '../utils/logger.js';
import { logAuditAction } from '../utils/auditLogger.js';

export class ShiprocketService {
  /**
   * Sequential shipment creation flow:
   * 1. createOrder → 2. assignAWB → 3. generateLabel → 4. generatePickup
   * Each step saves its result before proceeding. Failures are logged but not thrown.
   */
  async processShipmentCreation(orderId: string) {
    logger.info(`Starting logistical booking for Order: ${orderId}`);
    
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      logger.error(`Order ${orderId} not found, aborting shipment booking.`);
      return;
    }

    if (order.status !== 'PAID') {
      logger.warn(`Order ${orderId} status is ${order.status}, skipping shipment creation until paid.`);
      return;
    }

    // Step 1: Create shipment in Shiprocket
    let shipment: any;
    try {
      shipment = await shiprocketClient.createShipment(order, order.address);

      await prisma.order.update({
        where: { id: orderId },
        data: {
          shiprocketOrderId: String(shipment.order_id),
          shiprocketShipmentId: String(shipment.shipment_id),
          shiprocketAwb: shipment.awb_code || null,
          status: 'PROCESSING',
        },
      });

      await logAuditAction({
        action: 'ORDER_SHIPMENT_BOOKED',
        entityType: 'Order',
        entityId: orderId,
        metadata: { shipmentId: shipment.shipment_id, orderId: shipment.order_id },
      });

      logger.info(`Step 1 complete: Shiprocket order created for ${orderId}. Shipment ID: ${shipment.shipment_id}`);
    } catch (error: any) {
      logger.error(`Shiprocket Step 1 (createShipment) failed for Order ${orderId}: ${error.message}`);
      throw error; // Re-throw to let BullMQ trigger retry
    }

    // Step 2: Assign AWB (tracking number) — if not already returned in step 1
    let awb = shipment.awb_code;
    if (!awb && shipment.shipment_id) {
      try {
        awb = await shiprocketClient.generateAwb(shipment.shipment_id);
        if (awb) {
          await prisma.order.update({
            where: { id: orderId },
            data: { shiprocketAwb: awb },
          });
          logger.info(`Step 2 complete: AWB assigned for ${orderId}: ${awb}`);
        } else {
          logger.warn(`Step 2: AWB assignment returned null for ${orderId}. Will be assigned later by Shiprocket.`);
        }
      } catch (error: any) {
        logger.error(`Shiprocket Step 2 (assignAWB) failed for Order ${orderId}: ${error.message}`);
        // Non-fatal — continue to next steps
      }
    } else if (awb) {
      logger.info(`Step 2 skipped: AWB already assigned during order creation: ${awb}`);
    }

    // Step 3: Generate shipping label
    try {
      const labelUrl = await shiprocketClient.generateLabel(shipment.shipment_id);
      if (labelUrl) {
        await prisma.order.update({
          where: { id: orderId },
          data: { labelUrl },
        });
        logger.info(`Step 3 complete: Label generated for ${orderId}: ${labelUrl}`);
      } else {
        logger.warn(`Step 3: Label generation returned null for ${orderId}.`);
      }
    } catch (error: any) {
      logger.error(`Shiprocket Step 3 (generateLabel) failed for Order ${orderId}: ${error.message}`);
      // Non-fatal — continue
    }

    // Step 4: Schedule pickup
    try {
      const pickupScheduled = await shiprocketClient.generatePickup(shipment.shipment_id);
      if (pickupScheduled) {
        await prisma.order.update({
          where: { id: orderId },
          data: { pickupScheduled: true },
        });
        logger.info(`Step 4 complete: Pickup scheduled for ${orderId}.`);
      } else {
        logger.warn(`Step 4: Pickup scheduling returned false for ${orderId}.`);
      }
    } catch (error: any) {
      logger.error(`Shiprocket Step 4 (generatePickup) failed for Order ${orderId}: ${error.message}`);
      // Non-fatal
    }

    // Send shipment update email if AWB was assigned
    if (awb && order.user?.email) {
      await addJobToQueue(emailQueue, 'sendShipmentUpdate', {
        email: order.user.email,
        payload: {
          order: { id: order.id },
          status: 'PROCESSING',
          awb,
        },
      });
    }

    logger.info(`All shipment steps completed for Order ${orderId}. AWB: ${awb || 'pending'}`);
  }

  // Shiprocket webhook for tracking status updates — expanded status mapping
  async handleLogisticsWebhook(payload: any) {
    const { awb, current_status, order_id } = payload;
    logger.info(`Logistics update received for AWB ${awb}: ${current_status}`);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { shiprocketAwb: awb },
          { shiprocketOrderId: String(order_id) },
        ],
      },
      include: { user: true },
    });

    if (!order) {
      logger.warn(`No order match found in database for AWB ${awb} / Shiprocket Order ID ${order_id}`);
      return;
    }

    // Extended Shiprocket → System status mapping
    type MappableStatus = 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_INITIATED' | 'RETURNED';
    let mappedStatus: MappableStatus | null = null;
    const statusLower = String(current_status).toLowerCase();

    if (['pickup scheduled', 'pickup queued'].some(s => statusLower.includes(s))) {
      mappedStatus = 'PROCESSING';
    } else if (['in transit', 'shipped', 'picked up', 'out for pickup'].some(s => statusLower.includes(s))) {
      mappedStatus = 'SHIPPED';
    } else if (statusLower.includes('out for delivery')) {
      mappedStatus = 'OUT_FOR_DELIVERY';
    } else if (statusLower === 'delivered') {
      mappedStatus = 'DELIVERED';
    } else if (statusLower.includes('rto initiated') || statusLower.includes('rto in transit')) {
      mappedStatus = 'RETURN_INITIATED';
    } else if (statusLower.includes('rto delivered')) {
      mappedStatus = 'RETURNED';
    } else if (statusLower.includes('cancelled')) {
      mappedStatus = 'CANCELLED';
    }

    if (mappedStatus && order.status !== mappedStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: mappedStatus },
      });

      await logAuditAction({
        action: `SHIPROCKET_LOGISTICS_${mappedStatus}`,
        entityType: 'Order',
        entityId: order.id,
        metadata: { rawStatus: current_status },
      });

      // Dispatch shipment status email for key events
      if (order.user?.email && ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(mappedStatus)) {
        await addJobToQueue(emailQueue, 'sendShipmentUpdate', {
          email: order.user.email,
          payload: {
            order: { id: order.id },
            status: mappedStatus,
            awb: order.shiprocketAwb,
          },
        });
      }
    }
  }

  /**
   * Get tracking info with variable Redis cache TTL:
   *  - IN_TRANSIT / OUT_FOR_DELIVERY → 5min
   *  - DELIVERED → 24hr
   *  - Other → 30min
   */
  async getTrackingInfo(orderId: string, awb: string, currentStatus: string) {
    const cacheKey = `tracking:${awb}`;

    // Check Redis cache
    try {
      if (redisConnection.status === 'ready') {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          logger.debug(`Tracking cache hit for AWB ${awb}`);
          return JSON.parse(cached);
        }
      }
    } catch (e: any) {
      logger.warn(`Redis tracking cache lookup failed: ${e.message}`);
    }

    // Fetch live from Shiprocket
    const tracking = await shiprocketClient.trackShipment(awb);

    // Determine cache TTL based on current order status
    let ttlSeconds = 30 * 60; // 30 min default
    const statusUpper = currentStatus.toUpperCase();
    if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(statusUpper)) {
      ttlSeconds = 5 * 60; // 5 min for active transit
    } else if (statusUpper === 'DELIVERED') {
      ttlSeconds = 24 * 60 * 60; // 24 hr for delivered
    }

    // Cache result in Redis
    try {
      if (redisConnection.status === 'ready') {
        await redisConnection.set(cacheKey, JSON.stringify(tracking), 'EX', ttlSeconds);
      }
    } catch (e: any) {
      logger.warn(`Redis tracking cache write failed: ${e.message}`);
    }

    return tracking;
  }
}

export const shiprocketService = new ShiprocketService();
