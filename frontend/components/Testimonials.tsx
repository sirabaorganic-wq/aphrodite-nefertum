'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Kapoor',
      role: 'Interior Designer',
      rating: 5,
      text: 'APHRODITE is absolutely divine. The longevity is unmatched in India\'s climate. Every time I wear it, I feel confident and elegant.',
      product: 'APHRODITE - Divine Bloom',
    },
    {
      name: 'Arjun Malhotra',
      role: 'Creative Director',
      rating: 5,
      text: 'The depth and complexity of NEFERTUM is incredible. It\'s not just a fragrance, it\'s an experience. Worth every rupee.',
      product: 'NEFERTUM - The Midnight Lotus',
    },
    {
      name: 'Ananya Singh',
      role: 'Entrepreneur',
      rating: 5,
      text: 'Finally, a perfume brand that understands luxury AND performance. The packaging is museum-quality, and the scent lasts all day.',
      product: 'OUDH IMMORTEL - Extrait',
    },
    {
      name: 'Vikram Patel',
      role: 'Art Collector',
      rating: 5,
      text: 'The attention to detail is extraordinary. From the bottle design to the label to the scent itself—everything screams premium.',
      product: 'NEFERTUM - The Midnight Lotus',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary mb-4">
            Loved by Connoisseurs
          </h2>
          <p className="text-sm text-textSecondary font-light max-w-2xl mx-auto">
            Hear from fragrance lovers who have experienced the magic of APHRODITE NEFERTUM
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              className="border border-border rounded-none p-8 bg-[#0f0d0a] hover:border-gold transition-colors duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-gold text-gold"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-textPrimary font-light leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Product */}
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4 pb-4 border-b border-border">
                {testimonial.product}
              </p>

              {/* Author */}
              <div>
                <p className="text-sm font-serif font-bold text-textPrimary">
                  {testimonial.name}
                </p>
                <p className="text-xs text-textSecondary font-light">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-sm text-textSecondary font-light mb-6">
            Join thousands of satisfied customers across India
          </p>
          <button className="bg-gold text-background px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-goldHover transition-colors">
            Discover Your Fragrance
          </button>
        </motion.div>
      </div>
    </section>
  );
}
