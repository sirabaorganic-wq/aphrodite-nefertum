'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, ArrowLeft } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const handleBack = () => {
    setEmail('');
    setIsSubmitted(false);
    onSwitchToLogin();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-[#1a1510]/95 to-[#0f0d0a]/95 backdrop-blur-xl border border-gold/20 rounded-2xl w-full max-w-md p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-serif font-bold text-foreground"
                >
                  {isSubmitted ? 'Check Your Email' : 'Reset Password'}
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="text-textSecondary hover:text-foreground transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  // Form View
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <p className="text-textSecondary text-sm leading-relaxed">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-white/5 border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-gold to-gold/80 text-background font-light uppercase tracking-wider py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin mx-auto" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </motion.button>

                    {/* Back Button */}
                    <button
                      onClick={handleBack}
                      className="w-full flex items-center justify-center gap-2 text-gold hover:text-gold/80 transition-colors text-sm"
                    >
                      <ArrowLeft size={16} />
                      Back to Sign In
                    </button>
                  </motion.div>
                ) : (
                  // Success View
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 text-center"
                  >
                    {/* Success Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                      className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Check className="w-8 h-8 text-green-500" />
                    </motion.div>

                    <div className="space-y-2">
                      <p className="text-foreground font-semibold">
                        Reset link sent to {email}
                      </p>
                      <p className="text-sm text-textSecondary">
                        Check your email for a link to reset your password. If you don't see it, check your spam folder.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-gold to-gold/80 text-background font-light uppercase tracking-wider py-3 rounded-lg font-semibold transition-all duration-300"
                      >
                        Close
                      </motion.button>
                      <button
                        onClick={() => {
                          setEmail('');
                          setIsSubmitted(false);
                        }}
                        className="w-full text-gold hover:text-gold/80 transition-colors text-sm font-semibold"
                      >
                        Try another email
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
