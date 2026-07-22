import { apiClient } from './client';

export interface CouponValidationResponse {
  success: boolean;
  message?: string;
  discountAmount?: number;
  finalAmount?: number;
  coupon?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
  [key: string]: any;
}

/**
 * Validates a promotional coupon code against a specific order subtotal.
 */
export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidationResponse> {
  return apiClient.get<CouponValidationResponse>('/coupons/validate', {
    params: { code, subtotal },
  });
}
