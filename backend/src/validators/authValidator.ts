import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  firstName: z.string({ required_error: 'First name is required' }).min(1, 'First name cannot be empty'),
  lastName: z.string({ required_error: 'Last name is required' }).min(1, 'Last name cannot be empty'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(1, 'Reset token cannot be empty'),
  password: z
    .string({ required_error: 'New password is required' })
    .min(6, 'Password must be at least 6 characters long'),
});
