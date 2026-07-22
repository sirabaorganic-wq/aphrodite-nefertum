import { prisma } from '../config/db.js';

export class WishlistRepository {
  async findWishlistByUserId(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  async findWishlistItem(userId: string, productId: string) {
    return prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
  }

  async addToWishlist(userId: string, productId: string) {
    return prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  async removeFromWishlist(id: string) {
    return prisma.wishlistItem.delete({
      where: { id },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
