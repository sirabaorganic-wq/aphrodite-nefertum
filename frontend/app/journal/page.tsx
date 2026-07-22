'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cmsApi } from '@/lib/api';
import type { CmsContent } from '@/lib/api/cms';
import { journalArticles } from '@/lib/constants';

// Generate a slug from static articles that only have numeric IDs
function staticSlug(article: typeof journalArticles[number]): string {
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function JournalPage() {
  const [posts, setPosts] = useState<CmsContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await cmsApi.getContentByType('JOURNAL');
        if (res.success && res.content && res.content.length > 0) {
          setPosts(res.content);
        } else {
          setUsingFallback(true);
        }
      } catch {
        setUsingFallback(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
              Stories & Rituals
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-textPrimary">
              THE JOURNAL
            </h1>
            <p className="text-sm text-textSecondary font-light mt-4 max-w-xl">
              Stories, rituals, and traditions from our world. Explore the mythology, craftsmanship, and art behind every fragrance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Skeleton loading */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse space-y-4">
                  <div className="h-64 bg-[#1a1815] rounded-none" />
                  <div className="h-5 bg-[#1a1815] w-3/4" />
                  <div className="h-3 bg-[#1a1815] w-full" />
                  <div className="h-3 bg-[#1a1815] w-1/3" />
                </div>
              ))}
            </div>
          ) : usingFallback ? (
            /* Fallback: Static articles from constants */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {journalArticles.map((article) => (
                <motion.article
                  key={article.id}
                  variants={itemVariants}
                  className="group cursor-pointer"
                >
                  <Link href={`/journal/${staticSlug(article)}`}>
                    {/* Image */}
                    <div className="relative h-72 mb-6 overflow-hidden rounded-none border border-border">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <h2 className="text-lg font-serif font-bold text-textPrimary mb-3 group-hover:text-gold transition-colors duration-300">
                      {article.title}
                    </h2>
                    <p className="text-sm text-textSecondary font-light leading-relaxed mb-4">
                      {article.excerpt}
                    </p>

                    <span className="text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors">
                      READ STORY
                    </span>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            /* CMS posts */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={itemVariants}
                  className="group cursor-pointer"
                >
                  <Link href={`/journal/${post.slug}`}>
                    {/* Image */}
                    <div className="relative h-72 mb-6 overflow-hidden rounded-none border border-border">
                      {post.mediaUrl ? (
                        <Image
                          src={post.mediaUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1a1815] flex items-center justify-center">
                          <span className="text-gold text-3xl opacity-20">✦</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <h2 className="text-lg font-serif font-bold text-textPrimary mb-3 group-hover:text-gold transition-colors duration-300">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-textSecondary font-light leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    <span className="text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors">
                      READ STORY
                    </span>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
