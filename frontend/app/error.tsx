'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[#1a1815] border border-[#2a2520] p-8 md:p-12 space-y-6 shadow-2xl"
      >
        <div className="w-16 h-16 bg-[#C6A972]/10 border border-[#C6A972]/30 rounded-full flex items-center justify-center mx-auto text-[#C6A972]">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#C6A972] font-light">
            An Error Occurred
          </p>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#F5F0E8]">
            Something Went Wrong
          </h1>
          <p className="text-xs text-[#a09888] font-light leading-relaxed pt-2">
            An unexpected error interrupted your experience. Please try again or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2a2520]">
          <button
            onClick={() => reset()}
            className="flex-1 bg-[#C6A972] text-[#0a0805] py-3 px-4 text-xs uppercase tracking-widest hover:bg-[#b0935c] transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 border border-[#2a2520] text-[#a09888] py-3 px-4 text-xs uppercase tracking-widest hover:border-[#C6A972] hover:text-[#C6A972] transition-colors flex items-center justify-center gap-2 font-light"
          >
            <Home size={14} />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
