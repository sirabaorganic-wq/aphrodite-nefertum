import { apiClient } from './client';

export interface CartItemVariant {
  id: string;
  sku: string;
  size: string;
  type: string;
  price: number;
  discountPrice?: number | null;
  product?: {
    id: string;
    name: string;
    collection: string;
  };
}

export interface CartItem {
  id?: string;
  variantId: string;
  quantity: number;
  variant?: CartItemVariant;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart: {
    id?: string;
    userId?: string | null;
    sessionId?: string | null;
    items: CartItem[];
    subtotal?: number;
    total?: number;
  };
}

/**
 * Retrieves the current shopping cart for the authenticated user or guest session.
 */
export async function getCart(): Promise<CartResponse> {
  return apiClient.get<CartResponse>('/cart');
}

/**
 * Adds a specific product variant and quantity to the user's or guest's cart.
 */
export async function addToCart(variantId: string, qty: number): Promise<CartResponse> {
  return apiClient.post<CartResponse>('/cart/items', { variantId, quantity: qty });
}

/**
 * Removes an item or variant from the active cart.
 */
export async function removeFromCart(itemId: string): Promise<CartResponse> {
  return apiClient.delete<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`);
}

/**
 * Updates the quantity of an existing item in the cart.
 */
export async function updateQty(itemId: string, qty: number): Promise<CartResponse> {
  return apiClient.put<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, { quantity: qty });
}

/**
 * Clears all items from the cart in a single bulk operation.
 */
export async function clearCart(): Promise<CartResponse> {
  return apiClient.delete<CartResponse>('/cart');
}
