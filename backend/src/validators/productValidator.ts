import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().optional(),
  collection: z.enum(['nefertum', 'aphrodite']).optional(),
  scent: z.string().optional(),
  mood: z.string().optional(),
  intensity: z.preprocess((val) => parseInt(val as string, 10), z.number().min(1).max(5)).optional(),
  minPrice: z.preprocess((val) => parseFloat(val as string), z.number().nonnegative()).optional(),
  maxPrice: z.preprocess((val) => parseFloat(val as string), z.number().nonnegative()).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'recommended']).optional().default('recommended'),
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().positive().default(1)).optional().default(1),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().positive().default(10)).optional().default(10),
});

export const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).min(1, 'Name cannot be empty'),
  collection: z.enum(['nefertum', 'aphrodite'], { required_error: 'Collection is required' }),
  description: z.string({ required_error: 'Description is required' }),
  intensity: z.number().min(1).max(5),
  sillage: z.string(),
  longevity: z.string(),
  projection: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('PUBLISHED'),
});

export const updateProductSchema = createProductSchema.partial();

export const createVariantSchema = z.object({
  size: z.string({ required_error: 'Size is required (e.g. 50ml)' }),
  type: z.enum(['extrait', 'eau_de_parfum', 'eau_de_toilette'], { required_error: 'Fragrance concentration type is required' }),
  sku: z.string({ required_error: 'SKU is required' }),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive().optional(),
  stock: z.number().nonnegative().default(0),
  ingredients: z.array(z.string()).default([]),
  scents: z.array(z.string()).default([]),
  mood: z.array(z.string()).default([]),
  topNotes: z.array(z.string()).default([]),
  heartNotes: z.array(z.string()).default([]),
  baseNotes: z.array(z.string()).default([]),
});

export const updateVariantSchema = createVariantSchema.partial();
