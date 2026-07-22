import { prisma } from '../config/db.js';
import { OrderStatus } from '@prisma/client';

export class OrderRepository {
  async createOrder(data: {
    userId: string;
    addressId: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    totalAmount: number;
    couponId?: string | null;
    razorpayOrderId?: string | null;
    items: Array<{ variantId: string; quantity: number; price: number }>;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create order parent
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          addressId: data.addressId,
          subtotal: data.subtotal,
          shippingFee: data.shippingFee,
          discountAmount: data.discountAmount,
          totalAmount: data.totalAmount,
          couponId: data.couponId || null,
          razorpayOrderId: data.razorpayOrderId || null,
          status: 'PENDING',
        },
      });

      // 2. Create order children (items)
      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: order.id,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });
    });
  }

  async findOrderById(id: string) {
    return prisma.order.findUnique({
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
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findOrderByRazorpayId(razorpayOrderId: string) {
    return prisma.order.findUnique({
      where: { razorpayOrderId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async updateOrderStatus(id: string, status: 'PENDING' | 'PAID' | 'FAILED' | 'PAYMENT_FAILED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_INITIATED' | 'RETURNED' | 'REFUNDED') {
    return prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async updateOrderPaymentDetails(id: string, details: {
    razorpayPaymentId: string;
    razorpaySignature: string;
    status: 'PAID' | 'FAILED';
  }) {
    return prisma.order.update({
      where: { id },
      data: {
        razorpayPaymentId: details.razorpayPaymentId,
        razorpaySignature: details.razorpaySignature,
        status: details.status as OrderStatus,
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrders() {
    return prisma.order.findMany({
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Stock Reservation repository functions
  async createStockReservation(variantId: string, quantity: number, sessionId: string, expiresAt: Date) {
    return prisma.stockReservation.create({
      data: {
        variantId,
        quantity,
        sessionId,
        expiresAt,
      },
    });
  }

  async findStockReservationsBySession(sessionId: string) {
    return prisma.stockReservation.findMany({
      where: { sessionId },
    });
  }

  async deleteStockReservationsBySession(sessionId: string) {
    return prisma.stockReservation.deleteMany({
      where: { sessionId },
    });
  }

  async getExpiredStockReservations() {
    return prisma.stockReservation.findMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async deleteStockReservationById(id: string) {
    return prisma.stockReservation.delete({
      where: { id },
    });
  }
}

export const orderRepository = new OrderRepository();
