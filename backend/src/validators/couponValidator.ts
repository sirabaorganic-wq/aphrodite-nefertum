import { z } from 'zod';

export const validateCouponQuerySchema = z.object({
  code: z.string({ required_error: 'Coupon code is required' }).min(1),
  subtotal: z.preprocess((val) => parseFloat(val as string), z.number().positive('Subtotal must be greater than 0')),
});

export const createCouponSchema = z.object({
  code: z.string({ required_error: 'Coupon code is required' }).min(1),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  minOrderValue: z.number().nonnegative().optional().default(0),
  maxDiscount: z.number().positive().optional(),
  startsAt: z.string({ required_error: 'Start date is required' }),
  expiresAt: z.string({ required_error: 'Expiry date is required' }),
  usageLimit: z.number().int().positive().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();
