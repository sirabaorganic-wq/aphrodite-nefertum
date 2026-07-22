import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cartService.js';
import { cartItemSchema, updateCartItemSchema, mergeCartSchema } from '../validators/cartValidator.js';
import { UnauthorizedError } from '../utils/customError.js';

// Helper to resolve user or session id
const resolveCartIdentity = (req: Request) => {
  const userId = req.user?.id || null;
  const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string) || null;
  return { userId, sessionId };
};

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveCartIdentity(req);
      const cart = await cartService.getCart(userId, sessionId);
      
      res.status(200).json({
        success: true,
        cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveCartIdentity(req);
      const { variantId, quantity } = cartItemSchema.parse(req.body);
      
      const cart = await cartService.addItem({
        userId,
        sessionId,
        variantId,
        quantity,
      });

      res.status(200).json({
        success: true,
        message: 'Item added to cart successfully.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveCartIdentity(req);
      const { variantId } = req.params;
      const { quantity } = updateCartItemSchema.parse(req.body);

      const cart = await cartService.updateItemQuantity({
        userId,
        sessionId,
        variantId,
        quantity,
      });

      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveCartIdentity(req);
      const { variantId } = req.params;

      const cart = await cartService.removeItem({
        userId,
        sessionId,
        variantId,
      });

      res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async mergeCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Cart merge requires user authentication.');
      }
      const { sessionId } = mergeCartSchema.parse(req.body);
      
      const cart = await cartService.mergeCart(req.user.id, sessionId);

      res.status(200).json({
        success: true,
        message: 'Guest cart merged successfully.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, sessionId } = resolveCartIdentity(req);
      const cart = await cartService.clearCart(userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully.',
        cart,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
