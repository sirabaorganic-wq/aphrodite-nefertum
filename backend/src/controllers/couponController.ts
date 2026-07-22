import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/couponService.js';
import { validateCouponQuerySchema, createCouponSchema, updateCouponSchema } from '../validators/couponValidator.js';
import { UnauthorizedError } from '../utils/customError.js';

export class CouponController {
  async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = validateCouponQuerySchema.parse(req.query);
      const result = await couponService.validateCoupon(code, subtotal);
      
      res.status(200).json({
        success: true,
        message: 'Coupon is valid.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.getAllCoupons();
      res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const validatedBody = createCouponSchema.parse(req.body);
      
      const coupon = await couponService.createCoupon(req.user, validatedBody);
      
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully.',
        coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const validatedBody = updateCouponSchema.parse(req.body);
      
      const coupon = await couponService.updateCoupon(id, req.user, validatedBody);
      
      res.status(200).json({
        success: true,
        message: 'Coupon updated successfully.',
        coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await couponService.deleteCoupon(id, req.user);
      
      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
