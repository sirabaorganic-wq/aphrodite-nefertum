import { apiClient } from './client';

export interface WishlistItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    collection: string;
    description?: string;
    intensity?: number;
    variants?: Array<{
      id: string;
      sku: string;
      size: string;
      type: string;
      price: number;
      discountPrice?: number | null;
    }>;
  };
  createdAt?: string;
}

export interface WishlistResponse {
  success: boolean;
  wishlist: WishlistItem[];
}

export interface WishlistMutationResponse {
  success: boolean;
  message?: string;
  wishlistItem?: WishlistItem;
}

/**
 * Retrieves the authenticated user's wishlist with product details.
 */
export async function getWishlist(): Promise<WishlistResponse> {
  return apiClient.get<WishlistResponse>('/wishlist');
}

/**
 * Adds a product to the authenticated user's wishlist.
 */
export async function addToWishlist(productId: string): Promise<WishlistMutationResponse> {
  return apiClient.post<WishlistMutationResponse>('/wishlist', { productId });
}

/**
 * Removes a product from the authenticated user's wishlist.
 */
export async function removeFromWishlist(productId: string): Promise<WishlistMutationResponse> {
  return apiClient.delete<WishlistMutationResponse>(`/wishlist/${encodeURIComponent(productId)}`);
}
