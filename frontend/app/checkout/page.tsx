'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

type CheckoutStep = 'contact' | 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const steps: { id: CheckoutStep; label: string }[] = [
    { id: 'contact', label: 'Contact' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Confirmation' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    const stepOrder: CheckoutStep[] = ['contact', 'shipping', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const stepOrder: CheckoutStep[] = ['contact', 'shipping', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Page Header */}
      <section className="bg-[#1a1815] border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
            CHECKOUT
          </h1>
        </div>
      </section>

      {/* Main Checkout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    {/* Step Circle */}
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        currentStep === step.id
                          ? 'border-gold bg-gold text-background'
                          : 'border-border text-textSecondary hover:border-gold'
                      }`}
                    >
                      {steps.findIndex((s) => s.id === step.id) < steps.findIndex((s) => s.id === currentStep) ? (
                        <Check size={20} />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </button>

                    {/* Step Label */}
                    <div className="ml-3">
                      <p className="text-xs font-serif font-bold text-textPrimary uppercase">
                        {step.label}
                      </p>
                    </div>

                    {/* Divider */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 ml-3 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">
                      Contact Information
                    </h2>
                    <div className="space-y-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 'shipping' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="address"
                        placeholder="Street Address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 'payment' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold text-textPrimary">
                      Payment Details
                    </h2>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Name on Card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card Number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full bg-[#1a1815] border border-border text-textPrimary placeholder-textSecondary px-4 py-3 text-sm font-light focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'confirmation' && (
                  <div className="space-y-6 text-center py-12">
                    <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} className="text-background" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gold">
                      Order Confirmed
                    </h2>
                    <p className="text-sm text-textSecondary font-light leading-relaxed">
                      Thank you for your purchase. Your order has been confirmed and will
                      be shipped within 3-5 business days.
                    </p>
                    <div className="bg-[#1a1815] border border-border p-6 mt-8">
                      <p className="text-xs text-textSecondary font-light mb-2">
                        ORDER CONFIRMATION #
                      </p>
                      <p className="text-lg font-serif font-bold text-gold">
                        #APH24657
                      </p>
                    </div>
                    <Link
                      href="/collection"
                      className="inline-block mt-8 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-widest hover:bg-gold hover:text-background transition-colors"
                    >
                      CONTINUE SHOPPING
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {currentStep !== 'confirmation' && (
              <div className="flex gap-4 mt-12">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 'contact'}
                  className="flex-1 border border-border text-textSecondary px-8 py-3 text-sm font-light uppercase tracking-widest hover:border-gold hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-gold text-background px-8 py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-[#1a1815] border border-border p-8 h-fit">
            <h3 className="text-sm font-serif font-bold text-textPrimary uppercase mb-6 pb-6 border-b border-border">
              Order Summary
            </h3>
            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">
                  OUDH IMMORTEL x 1
                </span>
                <span className="text-textPrimary font-light">₹6,999</span>
              </div>
            </div>
            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Subtotal</span>
                <span className="text-textPrimary">₹6,999</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Shipping</span>
                <span className="text-textPrimary">₹500</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textSecondary font-light">Tax</span>
                <span className="text-textPrimary">₹1,260</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-serif font-bold mb-6">
              <span className="text-textPrimary">Total</span>
              <span className="text-gold text-lg">₹8,759</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
