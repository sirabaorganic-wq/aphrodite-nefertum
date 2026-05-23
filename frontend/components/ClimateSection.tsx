'use client';

import { motion } from 'framer-motion';
import { Flame, Droplets, Wind, Zap } from 'lucide-react';
import { climateFeatures } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame size={32} />,
  Droplets: <Droplets size={32} />,
  Wind: <Wind size={32} />,
  Zap: <Zap size={32} />,
};

export function ClimateSection() {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary mb-4">
            ENGINEERED FOR INDIA.<br />PERFECTED FOR YOU.
          </h2>
          <p className="text-sm text-textSecondary font-light max-w-2xl mx-auto">
            Our fragrances are scientifically engineered to perform in India&apos;s tropical climate,
            ensuring longevity, projection, and unmatchable quality.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {climateFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Card */}
              <div className="bg-[#1a1815] border border-border rounded-none p-8 text-center h-full hover:border-gold transition-colors duration-300">
                {/* Icon */}
                <div className="text-gold mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {iconMap[feature.icon]}
                </div>

                {/* Content */}
                <h3 className="text-sm font-serif font-bold text-textPrimary mb-3 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-xs text-textSecondary font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <button className="border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300">
            DISCOVER CLIMATE COLLECTION
          </button>
        </motion.div>
      </div>
    </section>
  );
}
