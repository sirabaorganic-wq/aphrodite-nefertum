'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cmsApi } from '@/lib/api';
import { journalArticles } from '@/lib/constants';

function staticSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function JournalSection() {
  const [articles, setArticles] = useState<
    Array<{ id: string; slug: string; title: string; excerpt: string; image: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      setIsLoading(true);
      try {
        const res = await cmsApi.getContentByType('JOURNAL');
        if (res.success && res.content && res.content.length > 0) {
          const formatted = res.content.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt || '',
            image: item.mediaUrl || '/images/journal/scent-history.jpg',
          }));
          setArticles(formatted);
        } else {
          setArticles(
            journalArticles.map((a) => ({
              id: String(a.id),
              slug: staticSlug(a.title),
              title: a.title,
              excerpt: a.excerpt,
              image: a.image,
            }))
          );
        }
      } catch (err) {
        setArticles(
          journalArticles.map((a) => ({
            id: String(a.id),
            slug: staticSlug(a.title),
            title: a.title,
            excerpt: a.excerpt,
            image: a.image,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournal();
  }, []);

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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="h-64 md:h-48 bg-[#1a1815]" />
                <div className="h-5 bg-[#1a1815] w-3/4" />
                <div className="h-3 bg-[#1a1815] w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {articles.slice(0, 3).map((article, index) => (
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
                  href={`/journal/${article.slug}`}
                  className="text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors"
                >
                  READ STORY
                </Link>
              </motion.article>
            ))}
          </div>
        )}

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
