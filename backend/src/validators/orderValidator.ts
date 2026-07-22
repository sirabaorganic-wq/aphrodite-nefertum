import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string({ required_error: 'Shipping address ID is required' }).uuid('Invalid shipping address ID format'),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string({ required_error: 'Variant ID is required' }).uuid('Invalid variant ID format'),
        quantity: z.number({ required_error: 'Quantity is required' }).int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Order must contain at least one item'),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string({ required_error: 'Razorpay Order ID is required' }),
  razorpayPaymentId: z.string({ required_error: 'Razorpay Payment ID is required' }),
  razorpaySignature: z.string({ required_error: 'Razorpay Signature is required' }),
});
