'use client';

import { motion } from 'framer-motion';

export function BrandPhilosophy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-background py-24 md:py-32 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="max-w-3xl">
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
              Our Philosophy
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary leading-tight mb-6">
              Perfume as Ritual,<br />Not Just Scent
            </h2>
            <p className="text-sm text-textSecondary font-light leading-relaxed">
              At APHRODITE NEFERTUM, we believe fragrance is a sacred journey of self-discovery. Inspired by ancient Egyptian mythology and engineered for modern India, every fragrance tells a story of divinity, power, and eternal beauty.
            </p>
          </motion.div>

          {/* Philosophy Points */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Engineered for India',
                description: 'Crafted to perform flawlessly in tropical climates without compromise on longevity or projection. Our formulations are perfected through years of research in India\'s unique environment.',
              },
              {
                title: 'Mythology Inspired',
                description: 'Each fragrance draws from the wisdom of ancient Egyptian deities. Nefertum brings renewal and divine strength, while Aphrodite celebrates beauty and eternal allure.',
              },
              {
                title: 'Performance Obsessed',
                description: 'We obsess over every detail: ingredient sourcing, formulation ratios, bottle design, and packaging. Nothing is compromised for luxury.',
              },
            ].map((point, i) => (
              <motion.div
                key={point.title}
                variants={itemVariants}
                className="space-y-4 p-8 border border-border rounded-none bg-[#0f0d0a] hover:border-gold transition-colors duration-300"
              >
                <h3 className="text-lg font-serif font-bold text-textPrimary">
                  {point.title}
                </h3>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-border my-8"
          />

          {/* Core Values */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-6">
                Core Values
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: '✦',
                  title: 'Purity',
                  desc: 'Premium ingredients sourced from the finest suppliers worldwide',
                },
                {
                  icon: '✦',
                  title: 'Authenticity',
                  desc: 'Genuine fragrances with certificates of authenticity and batch numbers',
                },
                {
                  icon: '✦',
                  title: 'Sustainability',
                  desc: 'Eco-conscious packaging and ethically sourced ingredients',
                },
                {
                  icon: '✦',
                  title: 'Excellence',
                  desc: 'Uncompromising quality standards in every aspect',
                },
              ].map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <span className="text-gold text-xl flex-shrink-0">{value.icon}</span>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-textPrimary mb-1">
                      {value.title}
                    </h4>
                    <p className="text-xs text-textSecondary font-light">
                      {value.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
