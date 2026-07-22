import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string({ required_error: 'Label is required (e.g. Home, Work)' }).min(1),
  street: z.string({ required_error: 'Street address is required' }).min(1),
  city: z.string({ required_error: 'City is required' }).min(1),
  state: z.string({ required_error: 'State is required' }).min(1),
  postalCode: z.string({ required_error: 'Postal code is required' }).min(1),
  country: z.string({ required_error: 'Country is required' }).min(1).default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
