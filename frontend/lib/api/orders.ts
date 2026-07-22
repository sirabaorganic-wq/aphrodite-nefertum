import { apiClient } from './client';

export interface OrderItemPayload {
  variantId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  addressId: string;
  items: OrderItemPayload[];
  couponCode?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  [key: string]: any;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  order?: any;
}

export interface OrderHistoryResponse {
  success: boolean;
  orders: any[];
}

export interface OrderDetailResponse {
  success: boolean;
  order: any;
}

export interface TrackingResponse {
  success: boolean;
  tracking: {
    awb: string | null;
    courier: string | null;
    currentStatus: string | null;
    estimatedDelivery: string | null;
    trackingUrl: string | null;
    statusHistory: Array<{ status: string; date: string; location: string }>;
  };
}

export interface ServiceabilityResponse {
  success: boolean;
  available: boolean;
  couriers: Array<{ name: string; etd: string; rate: number }>;
  estimatedDelivery: string | null;
}

/**
 * Initiates the checkout process and generates Razorpay payment transaction configurations.
 */
export async function createOrder(data: CreateOrderPayload): Promise<CreateOrderResponse> {
  return apiClient.post<CreateOrderResponse>('/orders/checkout', data);
}

/**
 * Cryptographically verifies Razorpay payment signature to confirm and finalize order.
 */
export async function verifyPayment(data: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
  return apiClient.post<VerifyPaymentResponse>('/orders/verify', data);
}

/**
 * Retrieves full order history of the currently authenticated consumer.
 */
export async function getMyOrders(): Promise<OrderHistoryResponse> {
  return apiClient.get<OrderHistoryResponse>('/orders/myorders');
}

/**
 * Retrieves a single order by ID.
 */
export async function getOrderById(orderId: string): Promise<OrderDetailResponse> {
  return apiClient.get<OrderDetailResponse>(`/orders/${encodeURIComponent(orderId)}`);
}

/**
 * Retrieves live tracking information for an order.
 */
export async function getOrderTracking(orderId: string): Promise<TrackingResponse> {
  return apiClient.get<TrackingResponse>(`/orders/${encodeURIComponent(orderId)}/tracking`);
}

/**
 * Checks delivery serviceability for a given pincode.
 */
export async function checkServiceability(pincode: string): Promise<ServiceabilityResponse> {
  return apiClient.get<ServiceabilityResponse>('/shipping/serviceability', {
    params: { pincode },
  });
}

/**
 * Retrieves all orders in the system (Admin only).
 */
export async function getAllOrders(params?: { page?: number; limit?: number; status?: string }): Promise<OrderHistoryResponse> {
  return apiClient.get<OrderHistoryResponse>('/admin/orders', { params });
}
