'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordStrength = {
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumbers: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    isLongEnough: formData.password.length >= 8,
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (strengthScore < 3) {
      setError('Password is too weak. Use uppercase, lowercase, numbers, and special characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      await register({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
      });
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-[#1a1510]/95 to-[#0f0d0a]/95 backdrop-blur-xl border border-gold/20 rounded-2xl w-full max-w-md p-8 shadow-2xl my-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-serif font-bold text-foreground"
                >
                  Create Account
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    />
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-gold/20 rounded-lg pl-12 pr-4 py-3 text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-gold/20 rounded-lg pl-12 pr-12 py-3 text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < strengthScore ? getStrengthColor() : 'bg-gold/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-textSecondary">
                        {strengthScore <= 2 && 'Weak password'}
                        {strengthScore === 3 && 'Fair password'}
                        {strengthScore >= 4 && 'Strong password'}
                      </p>
                      <div className="space-y-1 text-xs text-textSecondary/70">
                        <div className="flex items-center gap-2">
                          <Check size={14} className={passwordStrength.hasUpperCase ? 'text-green-500' : 'text-gold/30'} />
                          Uppercase letter
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className={passwordStrength.hasLowerCase ? 'text-green-500' : 'text-gold/30'} />
                          Lowercase letter
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className={passwordStrength.hasNumbers ? 'text-green-500' : 'text-gold/30'} />
                          Number
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className={passwordStrength.hasSpecialChar ? 'text-green-500' : 'text-gold/30'} />
                          Special character
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/60 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        formData.confirmPassword && !passwordsMatch
                          ? 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20'
                          : 'border-gold/20 focus:border-gold/60 focus:ring-gold/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </motion.div>

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

                {/* Terms & Conditions */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 bg-white/5 border border-gold/20 rounded cursor-pointer accent-gold"
                  />
                  <span className="text-xs text-textSecondary leading-relaxed">
                    I agree to the{' '}
                    <button type="button" className="text-gold hover:text-gold/80 transition-colors">
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button type="button" className="text-gold hover:text-gold/80 transition-colors">
                      Privacy Policy
                    </button>
                  </span>
                </label>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !agreedToTerms || !passwordsMatch}
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold to-gold/80 text-background font-light uppercase tracking-wider py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-textSecondary mt-6"
              >
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-gold hover:text-gold/80 transition-colors font-semibold"
                >
                  Sign in
                </button>
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
