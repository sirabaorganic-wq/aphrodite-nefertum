import { prisma } from '../config/db.js';

export class CartRepository {
  async findCartByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async findCartBySessionId(sessionId: string) {
    return prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async createCart(userId?: string | null, sessionId?: string | null) {
    return prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async addItemToCart(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: {
        cartId_variantId: { cartId, variantId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId,
        variantId,
        quantity,
      },
    });
  }

  async updateItemQuantity(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.update({
      where: {
        cartId_variantId: { cartId, variantId },
      },
      data: {
        quantity,
      },
    });
  }

  async removeItem(cartId: string, variantId: string) {
    return prisma.cartItem.delete({
      where: {
        cartId_variantId: { cartId, variantId },
      },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async deleteCart(cartId: string) {
    return prisma.cart.delete({
      where: { id: cartId },
    });
  }
}

export const cartRepository = new CartRepository();
