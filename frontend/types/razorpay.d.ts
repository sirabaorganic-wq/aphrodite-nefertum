// Type declarations for Razorpay browser SDK (loaded via script tag)
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    animation?: boolean;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: (response: any) => void): void;
}

declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  close(): void;
  on(event: string, handler: (response: any) => void): void;
}

interface Window {
  Razorpay: typeof Razorpay;
}
