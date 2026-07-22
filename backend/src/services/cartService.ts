import { cartRepository } from '../repositories/cartRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { NotFoundError, BadRequestError } from '../utils/customError.js';
import { logger } from '../utils/logger.js';

export class CartService {
  private async verifyVariantStock(variantId: string, requestedQty: number) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Fragrance variant not found.');
    }
    if (variant.stock < requestedQty) {
      throw new BadRequestError(`Insufficient stock. Only ${variant.stock} units available for ${variant.product.name} (${variant.size}).`);
    }
    return variant;
  }

  async getCart(userId?: string | null, sessionId?: string | null) {
    if (userId) {
      const cart = await cartRepository.findCartByUserId(userId);
      if (cart) return cart;
      return cartRepository.createCart(userId, null);
    } else if (sessionId) {
      const cart = await cartRepository.findCartBySessionId(sessionId);
      if (cart) return cart;
      return cartRepository.createCart(null, sessionId);
    } else {
      throw new BadRequestError('Either User ID or Session ID is required to retrieve a cart.');
    }
  }

  async addItem(params: {
    userId?: string | null;
    sessionId?: string | null;
    variantId: string;
    quantity: number;
  }) {
    const cart = await this.getCart(params.userId, params.sessionId);
    
    // Check if item already exists in cart to calculate total target quantity
    const existingItem = cart.items.find((item) => item.variantId === params.variantId);
    const targetQty = (existingItem?.quantity || 0) + params.quantity;
    
    await this.verifyVariantStock(params.variantId, targetQty);
    
    await cartRepository.addItemToCart(cart.id, params.variantId, params.quantity);
    return this.getCart(params.userId, params.sessionId);
  }

  async updateItemQuantity(params: {
    userId?: string | null;
    sessionId?: string | null;
    variantId: string;
    quantity: number;
  }) {
    const cart = await this.getCart(params.userId, params.sessionId);
    await this.verifyVariantStock(params.variantId, params.quantity);
    
    const existingItem = cart.items.find((item) => item.variantId === params.variantId);
    if (!existingItem) {
      throw new NotFoundError('Item not found in your cart.');
    }

    await cartRepository.updateItemQuantity(cart.id, params.variantId, params.quantity);
    return this.getCart(params.userId, params.sessionId);
  }

  async removeItem(params: {
    userId?: string | null;
    sessionId?: string | null;
    variantId: string;
  }) {
    const cart = await this.getCart(params.userId, params.sessionId);
    
    const existingItem = cart.items.find((item) => item.variantId === params.variantId);
    if (!existingItem) {
      throw new NotFoundError('Item not found in your cart.');
    }

    await cartRepository.removeItem(cart.id, params.variantId);
    return this.getCart(params.userId, params.sessionId);
  }

  async mergeCart(userId: string, guestSessionId: string) {
    logger.info(`Merging guest cart (Session: ${guestSessionId}) into user cart (User: ${userId})...`);
    
    const userCart = await this.getCart(userId, null);
    const guestCart = await cartRepository.findCartBySessionId(guestSessionId);
    
    if (!guestCart || guestCart.items.length === 0) {
      logger.debug('Guest cart is empty, skipping merge.');
      return userCart;
    }

    for (const guestItem of guestCart.items) {
      const existingUserItem = userCart.items.find((item) => item.variantId === guestItem.variantId);
      const combinedQty = (existingUserItem?.quantity || 0) + guestItem.quantity;
      
      try {
        // Verify combined stock limits
        const variant = await this.verifyVariantStock(guestItem.variantId, combinedQty);
        await cartRepository.addItemToCart(userCart.id, guestItem.variantId, guestItem.quantity);
      } catch (e: any) {
        // If merge quantity exceeds stock, cap it to maximum available variant stock
        logger.warn(`Cart merge stock cap triggered for variant ${guestItem.variantId}: ${e.message}`);
        const variant = await productRepository.findVariantById(guestItem.variantId);
        if (variant && variant.stock > 0) {
          const addableQty = Math.max(0, variant.stock - (existingUserItem?.quantity || 0));
          if (addableQty > 0) {
            await cartRepository.addItemToCart(userCart.id, guestItem.variantId, addableQty);
          }
        }
      }
    }

    // Clean up guest cart database footprints
    await cartRepository.clearCart(guestCart.id);
    await cartRepository.deleteCart(guestCart.id);
    
    logger.info('Cart merge completed successfully.');
    return this.getCart(userId, null);
  }

  async clearCart(userId?: string | null, sessionId?: string | null) {
    const cart = await this.getCart(userId, sessionId);
    await cartRepository.clearCart(cart.id);
    return this.getCart(userId, sessionId);
  }
}

export const cartService = new CartService();
