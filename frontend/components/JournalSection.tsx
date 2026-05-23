'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { journalArticles } from '@/lib/constants';

export function JournalSection() {
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-textPrimary">
              THE JOURNAL
            </h2>
            <p className="text-sm text-textSecondary font-light mt-2">
              Stories, rituals, and traditions from our world.
            </p>
          </div>
          <Link
            href="/journal"
            className="hidden md:block text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors"
          >
            VIEW ALL
          </Link>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {journalArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-64 md:h-48 mb-6 overflow-hidden rounded-none">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg md:text-base font-serif font-bold text-textPrimary mb-3 group-hover:text-gold transition-colors duration-300">
                {article.title}
              </h3>
              <p className="text-sm text-textSecondary font-light leading-relaxed mb-4">
                {article.excerpt}
              </p>

              {/* Read More Link */}
              <Link
                href={`/journal/${article.id}`}
                className="text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors"
              >
                READ STORY
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="flex justify-center md:hidden"
        >
          <Link
            href="/journal"
            className="border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
          >
            VIEW ALL STORIES
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
