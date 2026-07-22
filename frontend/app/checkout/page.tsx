'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronRight,
  Check,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Lock,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, addressesApi } from '@/lib/api';

type CheckoutStep = 'contact' | 'shipping' | 'payment';

const INPUT_CLASS =
  'w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors';

// Loads the Razorpay checkout.js script once
function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      setLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  return loaded;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, cartTotal, coupon, clearCart } = useCart();
  const rzpScriptLoaded = useRazorpayScript();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [rzpOrderData, setRzpOrderData] = useState<any | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);
  const [checkingServiceability, setCheckingServiceability] = useState(false);
  const rzpRef = useRef<any>(null);

  const shipping = cartTotal > 10000 ? 0 : 499;
  const tax = Math.round(cartTotal * 0.18);
  const finalTotal = cartTotal + shipping + tax;

  const steps: { id: CheckoutStep; label: string }[] = [
    { id: 'contact', label: 'Contact' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
  ];

  const stepIndex = (s: CheckoutStep) => steps.findIndex((x) => x.id === s);
  const currentIdx = stepIndex(currentStep);

  // Auth guard: redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to continue');
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Pre-fill user info when auth loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
      }));
    }
  }, [user]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!authLoading && isAuthenticated && (!items || items.length === 0)) {
      router.replace('/cart');
    }
  }, [items, router, authLoading, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check serviceability when postalCode changes and is 6 digits
  useEffect(() => {
    if (formData.postalCode.length === 6 && /^\d{6}$/.test(formData.postalCode)) {
      setCheckingServiceability(true);
      ordersApi
        .checkServiceability(formData.postalCode)
        .then((res) => {
          if (res.success && res.available) {
            setEstimatedDelivery(res.estimatedDelivery || '3-7 business days');
          } else {
            setEstimatedDelivery(null);
            if (!res.available) {
              toast.error('Delivery not available to this pincode');
            }
          }
        })
        .catch(() => {
          setEstimatedDelivery(null);
        })
        .finally(() => setCheckingServiceability(false));
    } else {
      setEstimatedDelivery(null);
    }
  }, [formData.postalCode]);

  const canProceedFrom = (step: CheckoutStep) => {
    if (step === 'contact') {
      return formData.email.trim() && formData.firstName.trim() && formData.phone.trim();
    }
    if (step === 'shipping') {
      return formData.address.trim() && formData.city.trim() && formData.postalCode.trim();
    }
    return true;
  };

  const handleNextStep = () => {
    if (!canProceedFrom(currentStep)) return;
    const nextSteps: Record<CheckoutStep, CheckoutStep | null> = {
      contact: 'shipping',
      shipping: 'payment',
      payment: null,
    };
    const next = nextSteps[currentStep];
    if (next) setCurrentStep(next);
  };

  // Create Razorpay order on server and open the modal
  const handleLaunchRazorpay = useCallback(async () => {
    if (!rzpScriptLoaded) {
      setPaymentError('Payment gateway is still loading. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setPaymentFailed(false);

    try {
      // Step 1: Create or find a saved address first
      let addressId: string;
      try {
        const existingRes = await addressesApi.getAddresses();
        const existingAddresses = existingRes.success ? existingRes.addresses || [] : [];
        const normStreet = formData.address.trim().toLowerCase();
        const normCity = formData.city.trim().toLowerCase();
        const normPostal = formData.postalCode.trim().toLowerCase();

        const match = existingAddresses.find(
          (a) =>
            a.street?.trim().toLowerCase() === normStreet &&
            a.city?.trim().toLowerCase() === normCity &&
            a.postalCode?.trim().toLowerCase() === normPostal
        );

        if (match) {
          addressId = match.id;
        } else {
          const addressRes = await addressesApi.createAddress({
            label: 'Home',
            street: formData.address,
            city: formData.city,
            state: formData.state || '',
            postalCode: formData.postalCode,
            country: formData.country,
          });

          if (!addressRes.success || !addressRes.address?.id) {
            throw new Error(addressRes.message || 'Failed to save shipping address.');
          }
          addressId = addressRes.address.id;
        }
      } catch (addrErr: any) {
        toast.error(addrErr.message || 'Failed to save shipping address. Please try again.');
        setIsProcessing(false);
        return; // Abort — do not proceed to Razorpay
      }

      // Step 2: Create order with the saved addressId
      const orderPayload = {
        addressId,
        items: items.map((item) => ({
          variantId: item.variantId || item.id,
          quantity: item.quantity,
        })),
        couponCode: coupon?.code,
      };

      const res = await ordersApi.createOrder(orderPayload);

      if (!res.success || !res.razorpayOrderId) {
        throw new Error(res.message || 'Failed to create order. Please try again.');
      }

      setRzpOrderData(res);

      // Step 3: Open Razorpay modal — use keyId from API response
      const options: RazorpayOptions = {
        key: res.keyId || '',
        amount: res.amount || finalTotal * 100,
        currency: res.currency || 'INR',
        name: 'APHRODITE NEFERTUM',
        description: 'Luxury Fragrance Order',
        image: '/images/logo.png',
        order_id: res.razorpayOrderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#C6A972',
          backdrop_color: 'rgba(5,5,5,0.85)',
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsProcessing(false);
            toast('Payment cancelled. Your cart is saved.');
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await ordersApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              await clearCart();
              router.push(
                `/order-success?orderId=${res.orderId || ''}&paymentId=${response.razorpay_payment_id}`
              );
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed.');
            }
          } catch (err: any) {
            setPaymentError(err.message || 'Payment verification failed. Please contact support.');
            setPaymentFailed(true);
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzpRef.current = rzp;

      rzp.on('payment.failed', (response: any) => {
        const desc = response?.error?.description || 'Your payment was not processed.';
        setPaymentError(desc);
        setPaymentFailed(true);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      setPaymentError(err.message || 'An error occurred while initiating payment.');
      setPaymentFailed(true);
      setIsProcessing(false);
    }
  }, [rzpScriptLoaded, formData, items, coupon, finalTotal, clearCart, router]);

  const handleRetryPayment = () => {
    setPaymentError(null);
    setPaymentFailed(false);

    // If we already have an order created, re-open with same order_id
    if (rzpOrderData && window.Razorpay) {
      const options: RazorpayOptions = {
        key: rzpOrderData.keyId || '',
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || 'INR',
        name: 'APHRODITE NEFERTUM',
        description: 'Luxury Fragrance Order',
        image: '/images/logo.png',
        order_id: rzpOrderData.razorpayOrderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#C6A972',
          backdrop_color: 'rgba(5,5,5,0.85)',
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsProcessing(false);
            toast('Payment cancelled. Your cart is saved.');
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const verifyRes = await ordersApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              await clearCart();
              router.push(
                `/order-success?orderId=${rzpOrderData.orderId || ''}&paymentId=${response.razorpay_payment_id}`
              );
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed.');
            }
          } catch (err: any) {
            setPaymentError(err.message || 'Payment verification failed.');
            setPaymentFailed(true);
            setIsProcessing(false);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setPaymentError(response?.error?.description || 'Payment failed.');
        setPaymentFailed(true);
      });
      rzp.open();
    } else {
      // No existing order; create a fresh one
      handleLaunchRazorpay();
    }
  };

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Don't render checkout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">CHECKOUT</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Steps + Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => stepIndex(step.id) < currentIdx && setCurrentStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all flex-shrink-0 ${
                      step.id === currentStep
                        ? 'border-gold bg-gold text-background'
                        : stepIndex(step.id) < currentIdx
                        ? 'border-gold bg-gold/20 text-gold cursor-pointer'
                        : 'border-border text-textSecondary cursor-default'
                    }`}
                  >
                    {stepIndex(step.id) < currentIdx ? (
                      <Check size={18} />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </button>
                  <p className="ml-3 text-xs font-serif font-bold text-textPrimary uppercase">
                    {step.label}
                  </p>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-px bg-border" />
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* CONTACT STEP */}
                {currentStep === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">Contact Information</h2>
                    <div className="space-y-4">
                      <input type="email" name="email" placeholder="Email Address *" value={formData.email} onChange={handleInputChange} className={INPUT_CLASS} required />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleInputChange} className={INPUT_CLASS} required />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className={INPUT_CLASS} />
                      </div>
                      <input type="tel" name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleInputChange} className={INPUT_CLASS} required />
                    </div>
                  </div>
                )}

                {/* SHIPPING STEP */}
                {currentStep === 'shipping' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">Shipping Address</h2>
                    <div className="space-y-4">
                      <input type="text" name="address" placeholder="Street Address *" value={formData.address} onChange={handleInputChange} className={INPUT_CLASS} required />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="city" placeholder="City *" value={formData.city} onChange={handleInputChange} className={INPUT_CLASS} required />
                        <input type="text" name="state" placeholder="State / Region" value={formData.state} onChange={handleInputChange} className={INPUT_CLASS} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <input type="text" name="postalCode" placeholder="Postal Code *" value={formData.postalCode} onChange={handleInputChange} className={INPUT_CLASS} required />
                          {/* Serviceability indicator */}
                          {checkingServiceability && (
                            <p className="text-xs text-textSecondary font-light flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin" /> Checking delivery availability...
                            </p>
                          )}
                          {estimatedDelivery && !checkingServiceability && (
                            <p className="text-xs text-green-400 font-light flex items-center gap-1">
                              <MapPin size={12} /> Est. delivery: {estimatedDelivery}
                            </p>
                          )}
                        </div>
                        <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleInputChange} className={INPUT_CLASS} />
                      </div>
                    </div>
                  </div>
                )}

                {/* PAYMENT STEP */}
                {currentStep === 'payment' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">Payment</h2>

                    {/* Payment Error / Failure */}
                    {paymentFailed && paymentError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/40 p-5 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-serif font-bold text-red-300">Payment Failed</p>
                            <p className="text-xs text-red-400 font-light mt-1">{paymentError}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRetryPayment}
                          className="flex items-center gap-2 text-xs text-gold font-light uppercase tracking-wider border border-gold/40 px-4 py-2 hover:bg-gold hover:text-background transition-colors"
                        >
                          <RefreshCw size={14} />
                          Retry Payment
                        </button>
                      </motion.div>
                    )}

                    {/* Razorpay Info Card */}
                    <div className="bg-[#1a1815] border border-border p-6 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                          <Shield size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-serif font-bold text-textPrimary">Secure Payment via Razorpay</p>
                          <p className="text-xs text-textSecondary font-light mt-0.5">
                            256-bit SSL encryption · PCI DSS compliant
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-xs text-textSecondary font-light mb-3 uppercase tracking-widest">
                          Accepted payment methods
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'EMI', 'Wallets'].map((m) => (
                            <span
                              key={m}
                              className="text-xs text-textSecondary border border-border px-3 py-1 font-light"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-textSecondary font-light">Amount to pay</span>
                          <span className="text-gold font-serif font-bold text-lg">
                            ₹{finalTotal.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-textSecondary font-light">
                          Clicking &quot;Pay Now&quot; will open the Razorpay secure checkout window.
                        </p>
                      </div>
                    </div>

                    {/* Order Review Summary */}
                    <div className="bg-[#1a1815] border border-border p-6 space-y-3">
                      <p className="text-xs text-textSecondary uppercase tracking-widest font-light mb-4">Shipping to</p>
                      <p className="text-sm text-textPrimary font-light">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-sm text-textSecondary font-light">
                        {formData.address}, {formData.city}
                        {formData.state ? `, ${formData.state}` : ''} — {formData.postalCode}
                      </p>
                      <p className="text-sm text-textSecondary font-light">{formData.email}</p>
                      {estimatedDelivery && (
                        <p className="text-xs text-green-400 font-light flex items-center gap-1 mt-2">
                          <MapPin size={12} /> Est. delivery: {estimatedDelivery}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-10">
              {currentIdx > 0 && (
                <button
                  onClick={() => setCurrentStep(steps[currentIdx - 1].id)}
                  disabled={isProcessing}
                  className="flex-1 border border-border text-textSecondary px-8 py-3 text-sm font-light uppercase tracking-widest hover:border-gold hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {currentStep !== 'payment' ? (
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedFrom(currentStep)}
                  className="flex-1 bg-gold text-background px-8 py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleLaunchRazorpay}
                  disabled={isProcessing || !rzpScriptLoaded}
                  className="flex-1 bg-gold text-background px-8 py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>PAY NOW — ₹{finalTotal.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-[#1a1815] border border-border p-8 h-fit space-y-6">
            <h3 className="text-sm font-serif font-bold text-textPrimary uppercase pb-4 border-b border-border">
              Order Summary
            </h3>

            {/* Cart Items */}
            <div className="space-y-4 pb-4 border-b border-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="relative w-14 h-14 bg-[#0f0d0a] flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image || '/images/products/nefertum-detail.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 bg-gold text-background text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-textPrimary font-light leading-tight">{item.name}</p>
                  </div>
                  <span className="text-xs text-textPrimary font-light flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            {coupon && (
              <div className="flex justify-between text-sm pb-4 border-b border-border">
                <span className="text-textSecondary font-light">Coupon ({coupon.code})</span>
                <span className="text-green-400">-{coupon.discount}%</span>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Subtotal</span>
                <span className="text-textPrimary">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Shipping</span>
                <span className="text-textPrimary">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">GST (18%)</span>
                <span className="text-textPrimary">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold pt-3 border-t border-border">
                <span className="text-textPrimary">Total</span>
                <span className="text-gold">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Secured By */}
            <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-textSecondary font-light">
              <Shield size={14} className="text-gold" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
