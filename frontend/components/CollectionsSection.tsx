'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { collections } from '@/lib/constants';

export function CollectionsSection() {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-screen md:min-h-[600px]">
          {/* Left - Nefertum */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden group h-96 md:h-auto"
          >
            {/* Background Image - Full Cover */}
            <Image
              src="/images/products/nefertum-bottle.png"
              alt="Nefertum Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
              <div>
                {/* <h3 className="text-sm text-textSecondary font-light uppercase tracking-widest mb-2">
                  The Power of Mythology
                </h3> */}
                {/* <h2 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary mb-8">
                  NEFERTUM<br />COLLECTION
                </h2> */}
                {/* <p className="text-sm text-textSecondary font-light leading-relaxed max-w-sm mb-8">
                  {collections[0].description}
                </p> */}
              </div>
              <Link
                href="/collection"
                className="inline-flex items-center gap-4 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-[0.25em] hover:bg-gold hover:text-background transition-colors duration-300"
              >
                EXPLORE COLLECTION
                <span className="text-base leading-none">›</span>
              </Link>
            </div>
          </motion.div>

          {/* Right - Aphrodite */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden group h-96 md:h-auto"
          >
            {/* Background Image - Full Cover */}
            <Image
              src="/images/products/aphrodite-bottle.png"
              alt="Aphrodite Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between">
              <div>
                {/* <h3 className="text-sm text-textSecondary font-light uppercase tracking-widest mb-2">
                  The Power of Allure
                </h3> */}
                {/* <h2 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary mb-8">
                  APHRODITE<br />COLLECTION
                </h2> */}
                {/* <p className="text-sm text-textSecondary font-light leading-relaxed max-w-sm mb-8">
                  {collections[1].description}
                </p> */}
              </div>
              <Link
                href="/collection"
                className="inline-flex items-center gap-4 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-[0.25em] hover:bg-gold hover:text-background transition-colors duration-300 "
              >
                EXPLORE COLLECTION
                <span className="text-base leading-none">›</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
