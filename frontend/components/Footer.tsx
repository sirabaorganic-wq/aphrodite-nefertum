'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Instagram, Facebook, Twitter, Star, Send, CheckCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewName || !reviewEmail || !reviewRating || !reviewMessage) {
      setReviewError('Please fill in all fields and select a rating.');
      return;
    }

    if (reviewMessage.length < 10) {
      setReviewError('Review must be at least 10 characters.');
      return;
    }

    setReviewSubmitting(true);
    try {
      await apiClient.post('/reviews', {
        name: reviewName,
        email: reviewEmail,
        rating: reviewRating,
        message: reviewMessage,
      });
      setReviewSuccess(true);
      setReviewName('');
      setReviewEmail('');
      setReviewRating(0);
      setReviewMessage('');
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#0a0905] border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-gold font-serif font-bold text-sm mb-4">
              APHRODITE<br />NEFERTUM™
            </h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Dark Luxury Perfume. Mythology. Performance.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-textPrimary font-light text-xs font-serif mb-4 uppercase tracking-wide">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/collection/nefertum" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Nefertum
                </Link>
              </li>
              <li>
                <Link href="/collection/aphrodite" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Aphrodite
                </Link>
              </li>
              <li>
                <Link href="/collection" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Climate Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-textPrimary font-light text-xs font-serif mb-4 uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/philosophy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Philosophy
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Care Guide
                </Link>
              </li>
              <li>
                <Link href="/customs" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Customs & Returns
                </Link>
              </li>
              <li>
                <Link href="/botanics" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Botanics & Naturals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-textPrimary font-light text-xs font-serif mb-4 uppercase tracking-wide">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:aphroditenefertum@gmail.com" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  aphroditenefertum@gmail.com
                </a>
              </li>
              <li className="text-xs text-textSecondary">+91 98765 43210</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-textPrimary font-light text-xs font-serif mb-4 uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/authenticity-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Authenticity Policy
                </Link>
              </li>
              <li>
                <Link href="/grievance-policy" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Grievance Policy
                </Link>
              </li>
              <li>
                <Link href="/intellectual-property" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Intellectual Property
                </Link>
              </li>
              <li>
                <Link href="/product-disclaimer" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  Product Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-12" />

        {/* Review Form Section */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h3 className="text-gold font-serif font-bold text-lg tracking-widest uppercase mb-2">
              Share Your Experience
            </h3>
            <p className="text-xs text-textSecondary font-light">
              We value your genuine feedback. Tell us what you think about Aphrodite Nefertum.
            </p>
          </div>

          {reviewSuccess ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                <p className="text-green-300 font-serif font-bold text-sm">Thank you for your review!</p>
                <p className="text-xs text-green-400/70 font-light">
                  Your feedback has been received and means a lot to us.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="max-w-2xl mx-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="review-name" className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Your Name
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-gold/15 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="review-email" className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    id="review-email"
                    type="email"
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-gold/15 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        size={22}
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || reviewRating)
                            ? 'text-gold fill-gold'
                            : 'text-gold/25'
                        }`}
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="text-xs text-textSecondary ml-2 font-light">
                      {reviewRating === 1 && 'Poor'}
                      {reviewRating === 2 && 'Fair'}
                      {reviewRating === 3 && 'Good'}
                      {reviewRating === 4 && 'Very Good'}
                      {reviewRating === 5 && 'Excellent'}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Message */}
              <div className="space-y-1.5">
                <label htmlFor="review-message" className="block text-xs font-light text-textSecondary uppercase tracking-widest">
                  Your Review
                </label>
                <textarea
                  id="review-message"
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Share your genuine experience with us..."
                  rows={4}
                  className="w-full bg-white/5 border border-gold/15 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-textSecondary/40 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-300 resize-none"
                />
              </div>

              {/* Error */}
              {reviewError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400">
                  {reviewError}
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="inline-flex items-center gap-2 bg-gold text-background px-8 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-goldHover transition-all duration-300 disabled:opacity-50 rounded-sm"
                >
                  {reviewSubmitting ? (
                    <div className="w-4 h-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-12" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left */}
          <p className="text-xs text-textSecondary mb-4 md:mb-0">
            © {currentYear} Aphrodite Nefertum™. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-textSecondary hover:text-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="text-textSecondary hover:text-gold transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="text-textSecondary hover:text-gold transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
          </div>

          {/* Right Links */}
          <div className="flex items-center space-x-6 text-xs mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-textSecondary hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-textSecondary hover:text-gold transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
