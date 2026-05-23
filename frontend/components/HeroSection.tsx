'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative w-full h-screen bg-background overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt="APHRODITE NEFERTUM Hero"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              {/* Brand NAME */}
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              >
              <p
                className="
                font-serif
                text-[22px]
                font-bold
                tracking-[0.12em]
                uppercase
                leading-none
              text-[#C6923A]
                drop-shadow-[0_0_8px_rgba(198,146,58,0.25)]
                "
              >
               APHRODITE-NEFERTUM™
               </p>
              </motion.div>

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-gold leading-[1.05] tracking-tight">
                  POWER.<br />
                  MYSTERY.<br />
                  DESTINY.
                </h1>
              </motion.div>

              {/* Lotus Divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="h-px w-10 bg-gold/60" />
                {/* Lotus SVG icon */}
                <svg
                  className="w-5 h-5 text-gold flex-shrink-0"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 28C16 28 6 22 6 13C6 13 10 15 16 10C22 15 26 13 26 13C26 22 16 28 16 28Z" />
                  <path d="M16 10C16 10 12 5 8 5C8 5 9 10 16 14C23 10 24 5 24 5C20 5 16 10 16 10Z" opacity="0.7" />
                  <path d="M16 28C16 28 4 20 3 11C3 11 7 14 16 10C25 14 29 11 29 11C28 20 16 28 16 28Z" opacity="0.3" />
                </svg>
                <div className="h-px w-10 bg-gold/60" />
              </motion.div>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-sm text-textSecondary font-light tracking-[0.2em] uppercase leading-relaxed"
              >
                EXPERIENCE THE ESSENCE<br />OF LEGEND.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <Link
                  href="/collection"
                  className="inline-flex items-center gap-4 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-[0.25em] hover:bg-gold hover:text-background transition-colors duration-300"
                >
                  EXPLORE COLLECTION
                  <span className="text-base leading-none">›</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Image Content - Perfume Bottles */}
            {/* <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden md:flex relative h-screen md:h-full items-center justify-center"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full max-w-md"
              >
                <Image
                  src="/images/products/nefertum-bottle.jpg"
                  alt="NEFERTUM - The Midnight Lotus"
                  width={500}
                  height={700}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div> */}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        {/* <div className="text-center">
          <p className="text-xs text-textSecondary mb-2 tracking-widest">SCROLL TO EXPLORE</p>
          <svg
            className="w-6 h-6 mx-auto text-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div> */}
      </motion.div>
    </section>
  );
}
