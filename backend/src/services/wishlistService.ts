import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { NotFoundError } from '../utils/customError.js';

export class WishlistService {
  async getWishlist(userId: string) {
    return wishlistRepository.findWishlistByUserId(userId);
  }

  async addToWishlist(userId: string, productId: string) {
    // Verify product exists
    const product = await productRepository.findProductById(productId);
    if (!product) {
      throw new NotFoundError('Fragrance product does not exist.');
    }

    const existing = await wishlistRepository.findWishlistItem(userId, productId);
    if (existing) {
      return existing;
    }

    return wishlistRepository.addToWishlist(userId, productId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const existing = await wishlistRepository.findWishlistItem(userId, productId);
    if (!existing) {
      throw new NotFoundError('Fragrance not found in your wishlist.');
    }

    await wishlistRepository.removeFromWishlist(existing.id);
  }
}

export const wishlistService = new WishlistService();
