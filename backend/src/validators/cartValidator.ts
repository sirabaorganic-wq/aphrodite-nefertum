import { z } from 'zod';

export const cartItemSchema = z.object({
  variantId: z.string({ required_error: 'Variant ID is required' }).uuid('Invalid Variant ID format'),
  quantity: z.number({ required_error: 'Quantity is required' }).int().positive('Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number({ required_error: 'Quantity is required' }).int().positive('Quantity must be at least 1'),
});

export const mergeCartSchema = z.object({
  sessionId: z.string({ required_error: 'Guest session ID is required' }),
});
