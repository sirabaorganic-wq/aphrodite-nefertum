import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../services/wishlistService.js';
import { UnauthorizedError } from '../utils/customError.js';
import { z } from 'zod';

const addToWishlistSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid Product ID format'),
});

export class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const wishlist = await wishlistService.getWishlist(req.user.id);
      
      res.status(200).json({
        success: true,
        wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { productId } = addToWishlistSchema.parse(req.body);
      
      const wishlistItem = await wishlistService.addToWishlist(req.user.id, productId);
      
      res.status(201).json({
        success: true,
        message: 'Product added to wishlist.',
        wishlistItem,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { productId } = req.params;
      
      await wishlistService.removeFromWishlist(req.user.id, productId);
      
      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();
