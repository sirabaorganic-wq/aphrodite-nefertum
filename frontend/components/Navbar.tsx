'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LoginModal } from './auth/LoginModal';
import { RegisterModal } from './auth/RegisterModal';
import { ForgotPasswordModal } from './auth/ForgotPasswordModal';
import { AdvancedSearch } from './AdvancedSearch';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

type AuthModal = 'none' | 'login' | 'register' | 'forgot-password';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModal>('none');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { label: 'NEFERTUM COLLECTION', href: '/collection' },
    { label: 'APHRODITE', href: '/collection' },
    { label: 'CLIMATE COLLECTION', href: '/collection' },
    { label: 'DISCOVERY SET', href: '/collection' },
    { label: 'JOURNAL', href: '/journal' },
  ];

  return (
    <>
      <nav className="bg-[#0a0908] border-b border-border sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl md:text-2xl font-serif tracking-widest text-gold font-bold">
                APHRODITE NEFERTUM
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs font-light text-textPrimary hover:text-gold transition-colors duration-300 px-3 py-2"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:text-gold transition-colors"
              >
                <Search size={18} />
              </button>
              {isAuthenticated ? (
                <Link
                  href={user?.role === 'ADMIN' ? '/admin' : '/account'}
                  className="p-2 text-gold hover:text-gold/80 transition-colors hidden sm:block"
                  title={`Logged in as ${user?.firstName || user?.email}`}
                >
                  <User size={18} />
                </Link>
              ) : (
                <button
                  onClick={() => setAuthModal('login')}
                  className="p-2 hover:text-gold transition-colors hidden sm:block"
                  title="Sign In"
                >
                  <User size={18} />
                </button>
              )}
              <Link
                href="/cart"
                className="p-2 hover:text-gold transition-colors relative"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-background text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:text-gold transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-border pb-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-textPrimary hover:text-gold transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>

    {/* Advanced Search */}
    <AdvancedSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

    {/* Auth Modals */}
    <LoginModal
      isOpen={authModal === 'login'}
      onClose={() => setAuthModal('none')}
      onSwitchToRegister={() => setAuthModal('register')}
      onSwitchToForgotPassword={() => setAuthModal('forgot-password')}
    />
    <RegisterModal
      isOpen={authModal === 'register'}
      onClose={() => setAuthModal('none')}
      onSwitchToLogin={() => setAuthModal('login')}
    />
    <ForgotPasswordModal
      isOpen={authModal === 'forgot-password'}
      onClose={() => setAuthModal('none')}
      onSwitchToLogin={() => setAuthModal('login')}
    />
    </>
  );
}
