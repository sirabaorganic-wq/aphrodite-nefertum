'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cmsApi } from '@/lib/api';
import type { CmsContent } from '@/lib/api/cms';

export default function PhilosophyPage() {
  const [cmsContent, setCmsContent] = useState<CmsContent[]>([]);
  const [usingCms, setUsingCms] = useState(false);

  useEffect(() => {
    const fetchPhilosophy = async () => {
      try {
        const res = await cmsApi.getContentByType('PHILOSOPHY');
        if (res.success && res.content && res.content.length > 0) {
          setCmsContent(res.content);
          setUsingCms(true);
        }
      } catch {
        // CMS unavailable — use static content below
      }
    };
    fetchPhilosophy();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 md:py-32 border-b border-border overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/philosophy-hero.svg"
            alt="Our Philosophy"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
              Our Philosophy
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-textPrimary leading-tight">
              Perfume as Ritual,<br />Not Just Scent
            </h1>
            <p className="text-sm text-textSecondary font-light mt-6 max-w-2xl leading-relaxed">
              At APHRODITE NEFERTUM, we believe fragrance is a sacred journey of self-discovery.
              Inspired by ancient Egyptian mythology and engineered for modern India, every fragrance
              tells a story of divinity, power, and eternal beauty.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CMS Content (if available) */}
      {usingCms && cmsContent.length > 0 && (
        <section className="py-16 md:py-24 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {cmsContent.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-16 last:mb-0"
              >
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-textPrimary mb-6">
                  {entry.title}
                </h2>
                {entry.content.split('\n\n').map((p, i) => (
                  <p key={i} className="text-sm text-textSecondary font-light leading-relaxed mb-4">
                    {p.trim()}
                  </p>
                ))}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Static Philosophy Content */}
      <section className="py-20 md:py-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-20"
          >
            {/* Brand Story */}
            <motion.div variants={itemVariants} className="max-w-3xl">
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
                The Beginning
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary mb-6">
                Born from Ancient Wisdom,<br />Perfected for Modern India
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  APHRODITE NEFERTUM was born from a singular obsession: to create fragrances that perform
                  flawlessly in India&apos;s demanding tropical climate without compromising on luxury, complexity,
                  or character.
                </p>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  We drew inspiration from two of antiquity&apos;s most powerful mythological figures — Nefertum,
                  the Egyptian god of perfume and the sacred lotus, and Aphrodite, the Greek goddess of beauty
                  and desire. These divine archetypes embody the transformative power of fragrance: the ability
                  to elevate, inspire, and captivate.
                </p>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  Every formulation undergoes extensive testing in real Indian conditions — from the humid
                  monsoons of Mumbai to the dry heat of Rajasthan — ensuring that our promise of all-day
                  performance is never an exaggeration, but a guarantee.
                </p>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="border-t border-border" />

            {/* Philosophy Pillars */}
            <motion.div variants={itemVariants}>
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-8">
                Our Pillars
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Engineered for India',
                    description:
                      'Crafted to perform flawlessly in tropical climates without compromise on longevity or projection. Our formulations are perfected through years of research in India\'s unique environment — from 45°C summers to monsoon humidity.',
                  },
                  {
                    title: 'Mythology Inspired',
                    description:
                      'Each fragrance draws from the wisdom of ancient deities. Nefertum brings renewal and divine strength, while Aphrodite celebrates beauty and eternal allure. These aren\'t just names — they are the essence of each collection.',
                  },
                  {
                    title: 'Performance Obsessed',
                    description:
                      'We obsess over every detail: ingredient sourcing, formulation ratios, bottle design, and packaging. Nothing is compromised. Our fragrances deliver 8-12 hours of performance in conditions where others fail within two.',
                  },
                ].map((pillar) => (
                  <motion.div
                    key={pillar.title}
                    variants={itemVariants}
                    className="space-y-4 p-8 border border-border rounded-none bg-[#0f0d0a] hover:border-gold transition-colors duration-300"
                  >
                    <h3 className="text-lg font-serif font-bold text-textPrimary">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-textSecondary font-light leading-relaxed">
                      {pillar.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="border-t border-border" />

            {/* Core Values */}
            <motion.div variants={itemVariants}>
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-8">
                Core Values
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: '✦',
                    title: 'Purity',
                    desc: 'Premium ingredients sourced from the finest suppliers worldwide. Every raw material is verified for quality, potency, and ethical sourcing before it enters our formulation lab.',
                  },
                  {
                    icon: '✦',
                    title: 'Authenticity',
                    desc: 'Genuine fragrances with certificates of authenticity and batch numbers. We never use synthetic substitutes where nature provides superior quality.',
                  },
                  {
                    icon: '✦',
                    title: 'Sustainability',
                    desc: 'Eco-conscious packaging and ethically sourced ingredients. Our bottles are designed for reuse and refill, reducing waste without compromising the luxury experience.',
                  },
                  {
                    icon: '✦',
                    title: 'Excellence',
                    desc: 'Uncompromising quality standards in every aspect. From the weight of the bottle cap to the precision of the atomizer spray, every detail is deliberate and luxurious.',
                  },
                ].map((value) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <span className="text-gold text-xl flex-shrink-0">{value.icon}</span>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-textPrimary mb-2">
                        {value.title}
                      </h4>
                      <p className="text-xs text-textSecondary font-light leading-relaxed">
                        {value.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="border-t border-border" />

            {/* Craftsmanship */}
            <motion.div variants={itemVariants} className="max-w-3xl">
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
                Craftsmanship
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary mb-6">
                The Science Behind the Art
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  Our master perfumers combine traditional French perfumery techniques with modern molecular
                  science. Each fragrance undergoes over 200 iterations before it meets our standards — balancing
                  artistic expression with scientific precision.
                </p>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  We employ advanced fixative technology that locks fragrance molecules into a slow-release
                  matrix, ensuring consistent projection and sillage throughout the day. This proprietary
                  approach is what enables our fragrances to thrive where others fade — in India&apos;s most
                  demanding climate conditions.
                </p>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  The result is not just a fragrance, but an experience — one that evolves beautifully on
                  your skin, revealing new facets as the hours pass, yet maintaining its essential character
                  from the first spray to the last whisper.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-gold text-3xl opacity-30">✦</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-textPrimary">
              Experience the Difference
            </h2>
            <p className="text-sm text-textSecondary font-light max-w-lg mx-auto">
              Discover fragrances crafted with intention, engineered for performance,
              and inspired by millennia of mythology.
            </p>
            <a
              href="/collection"
              className="inline-block border border-gold text-gold px-10 py-4 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
            >
              Explore Collections
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
