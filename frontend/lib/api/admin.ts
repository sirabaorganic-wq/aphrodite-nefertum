import { apiClient } from './client';
import { ProductsResponse, Product } from './products';

export interface DashboardMetricsResponse {
  success: boolean;
  metrics?: any;
  [key: string]: any;
}

/**
 * Retrieves KPI dashboard analytics and summary metrics for the admin portal.
 */
export async function getMetrics(): Promise<DashboardMetricsResponse> {
  return apiClient.get<DashboardMetricsResponse>('/admin/metrics');
}

/**
 * Retrieves all catalog products including DRAFT items for admin management.
 */
export async function getProducts(filters?: Record<string, any>): Promise<ProductsResponse> {
  return apiClient.get<ProductsResponse>('/products', { params: filters });
}

/**
 * Creates a new fragrance product in the catalog (Admin only).
 */
export async function createProduct(data: any): Promise<{ success: boolean; message?: string; product: Product }> {
  return apiClient.post('/products', data);
}

/**
 * Updates an existing fragrance product by ID (Admin only).
 */
export async function updateProduct(id: string, data: any): Promise<{ success: boolean; message?: string; product: Product }> {
  return apiClient.put(`/products/${encodeURIComponent(id)}`, data);
}

/**
 * Deletes a fragrance product from the catalog by ID (Admin only).
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
  return apiClient.delete(`/products/${encodeURIComponent(id)}`);
}
