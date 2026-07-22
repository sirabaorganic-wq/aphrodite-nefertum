'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

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
                <a href="mailto:hello@aphrodite.com" className="text-xs text-textSecondary hover:text-gold transition-colors">
                  hello@aphrodite.com
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
