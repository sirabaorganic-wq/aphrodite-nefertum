import { apiClient } from './client';

export interface ProductFilters {
  page?: number;
  limit?: number;
  collection?: 'nefertum' | 'aphrodite' | string;
  intensity?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'recommended' | string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  [key: string]: any;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  type: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  ingredients: string[];
  scents: string[];
  mood: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  collection: 'nefertum' | 'aphrodite' | string;
  description: string;
  intensity: number;
  sillage: string;
  longevity: string;
  projection: string;
  status?: string;
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingleProductResponse {
  success: boolean;
  product: Product;
}

/**
 * Retrieves list of products matching optional filter, sorting, and pagination criteria.
 */
export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  return apiClient.get<ProductsResponse>('/products', { params: filters });
}

/**
 * Retrieves detailed information of a single fragrance product by ID or slug.
 */
export async function getProductBySlug(slug: string): Promise<SingleProductResponse> {
  return apiClient.get<SingleProductResponse>(`/products/slug/${encodeURIComponent(slug)}`);
}
