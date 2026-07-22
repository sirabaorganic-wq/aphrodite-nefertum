'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cmsApi } from '@/lib/api';
import type { CmsContent } from '@/lib/api/cms';
import { journalArticles } from '@/lib/constants';

// Static article content for fallback
const staticArticleContent: Record<string, string> = {
  'the-myth-of-nefertum-and-the-sacred-lotus': `
In the ancient temples of Egypt, the god Nefertum was revered as the lord of perfume, the divine embodiment of the sacred blue lotus flower. Every morning, as the sun rose over the Nile, priests would offer lotus blossoms at his altar — believing the fragrance held the power to awaken the soul and connect mortals to the divine.

The blue lotus, Nymphaea caerulea, was not merely a flower in Egyptian mythology. It was a symbol of creation itself. According to the Hermopolitan cosmogony, the world emerged from the primordial waters of Nun, and the first thing to appear was the sacred lotus. From its petals rose the sun god Ra, bathing the world in light and warmth.

Nefertum, often depicted as a young man with a lotus blossom upon his head, was the son of Ptah (the creator god) and Sekhmet (the fierce lioness goddess of war and healing). This divine lineage gave him dominion over both beauty and power — a duality that defines the essence of our NEFERTUM collection.

The ancient Egyptians understood what modern perfumery is only beginning to rediscover: that fragrance is not mere decoration, but a transformative force. They used kyphi — a sacred incense blend of sixteen ingredients — in their evening rituals, believing it could heal the body, calm the mind, and open pathways to the divine.

Our NEFERTUM collection draws from this ancient wisdom. Each fragrance is formulated not just to smell exceptional, but to evoke a state of being — confidence, power, renewal. Like the sacred lotus that blooms fresh each morning from muddy waters, our fragrances are designed to elevate you above the ordinary.

The performance-engineered formulation ensures that, like the eternal lotus, the fragrance endures — lasting through India's intense tropical heat and humidity, maintaining projection and sillage from dawn to dusk.

Wear NEFERTUM not as a perfume, but as a ritual. An act of sacred self-adornment that connects you to millennia of tradition, mythology, and the transformative power of scent.
  `.trim(),

  'rituals-for-the-modern-conqueror': `
Throughout history, the world's greatest leaders and conquerors understood one profound truth: fragrance is power. From Cleopatra's jasmine-scented sails that announced her arrival before she was seen, to Napoleon's legendary consumption of sixty bottles of cologne per month, scent has always been the invisible weapon of the extraordinary.

In modern India, this ancient wisdom takes on new meaning. In a culture where first impressions carry enormous weight — in boardrooms, at celebrations, in intimate moments — your fragrance is your signature. It speaks before you do and lingers long after you leave.

THE MORNING RITUAL

The most powerful ritual begins at dawn. After your shower, when your pores are open and your skin is warm, apply your fragrance to pulse points: the wrists, behind the ears, the base of the throat. These areas generate heat, which activates and projects the fragrance molecules throughout the day.

For maximum impact in India's climate, layer your scent. Begin with an unscented moisturizer to create a base, then apply your fragrance. The moisturized skin holds fragrance molecules longer, extending longevity by up to 40%.

THE POWER OF INTENTION

Ancient Egyptian priests did not simply apply perfume — they performed an anointment. Each application was accompanied by an intention, a mental declaration of purpose. This practice, rooted in the belief that fragrance could channel divine energy, transforms a mundane act into a moment of personal power.

Before applying your fragrance each morning, take a breath. Set your intention for the day. Let the scent become an anchor for your ambition, your confidence, your presence. This is not superstition — it is the psychology of anchoring, where a sensory cue (your fragrance) becomes linked to a mental state (confidence, power, focus).

THE EVENING TRANSFORMATION

As day turns to night, your fragrance evolves. The lighter top notes have faded, revealing the deeper heart and base notes — the true character of the perfume. This natural evolution mirrors your own transformation from the structured discipline of daytime to the more relaxed, authentic self of evening.

For evening occasions, consider a fresh application to your pulse points. The warmth of your skin after a full day creates the perfect canvas for the fragrance's deepest, most seductive notes.

This is the way of the modern conqueror: intentional, powerful, unforgettable.
  `.trim(),

  'the-art-of-layering-in-tropical-climates': `
India's tropical climate presents unique challenges for fragrance enthusiasts. High temperatures, intense humidity, and the sheer physicality of daily life can cause even premium fragrances to fade faster than expected. But these challenges are not obstacles — they are opportunities to master the art of layering.

UNDERSTANDING TROPICAL FRAGRANCE BEHAVIOUR

In tropical climates, heat accelerates the evaporation of fragrance molecules. Top notes — the bright, citrusy, and fresh accords that greet you first — can dissipate within minutes rather than the typical 15-30 minutes in temperate climates. Heart notes project more aggressively due to body heat, and base notes emerge sooner.

This accelerated evolution is why our fragrances are specifically engineered for Indian conditions. Higher concentrations of base and heart note molecules, combined with proprietary fixative technology, ensure that the fragrance maintains its intended character throughout the day.

THE LAYERING TECHNIQUE

Step 1: The Foundation
Start with a fragrance-free moisturizer. Hydrated skin holds fragrance molecules significantly longer. Apply to all pulse points and areas where you plan to spray.

Step 2: The Base Layer  
Apply your primary fragrance immediately after moisturizing. Focus on lower pulse points first: inner elbows, behind the knees, ankles. These areas benefit from body heat while being protected from direct sunlight.

Step 3: The Accent Layer
For the upper body — wrists, neck, behind ears — consider a lighter application. In humid conditions, projection from these areas is naturally amplified, so less is more.

Step 4: The Fabric Touch
A light mist on your clothing creates a long-lasting ambient aura. Fabric fibres hold fragrance molecules differently than skin, often preserving top notes for hours longer. Spray from 12-18 inches away to avoid staining.

TIMING IS EVERYTHING

Apply your fragrance 10-15 minutes before stepping out. This allows the initial alcohol flash to dissipate and the top notes to settle into your skin chemistry. The fragrance you present to the world should be the harmonious development, not the raw opening.

In India's climate, a midday touch-up is not just acceptable — it's recommended. Keep a travel atomizer in your bag for a strategic refresh during afternoon hours when heat is at its peak.

THE SCIENCE OF SILLAGE IN HUMIDITY

Humidity actually helps fragrance diffusion. Water molecules in the air act as carriers for fragrance molecules, creating a wider sillage trail. This means that in humid conditions, your fragrance projects further — but also dissipates faster. The key is balance: apply enough to create presence, but not so much that you overwhelm.

Master these techniques, and India's climate becomes your ally — not your enemy. Your fragrance becomes a living, breathing extension of your presence, evolving beautifully from the cool of morning to the warmth of night.
  `.trim(),
};

function staticSlug(article: typeof journalArticles[number]): string {
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function JournalPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<CmsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Try to match static article
  const staticArticle = journalArticles.find((a) => staticSlug(a) === slug);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await cmsApi.getContentBySlug(slug);
        if (res.success && res.content) {
          setPost(res.content);
        } else if (!staticArticle) {
          setNotFound(true);
        }
      } catch {
        // API failed — fall back to static if available
        if (!staticArticle) {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, staticArticle]);

  // Not found state
  if (!isLoading && notFound) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Navbar />
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="text-gold text-5xl block mb-4 opacity-30">✦</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-textPrimary">
                Article Not Found
              </h1>
              <p className="text-sm text-textSecondary font-light max-w-md mx-auto">
                The journal entry you&apos;re looking for doesn&apos;t exist or may have been moved.
              </p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
              >
                <ArrowLeft size={14} />
                Back to Journal
              </Link>
            </motion.div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  // Resolve display data from CMS or static fallback
  const title = post?.title || staticArticle?.title || '';
  const coverImage = post?.mediaUrl || staticArticle?.image || '';
  const content = post?.content || (staticArticle ? staticArticleContent[slug] : '') || '';
  const excerpt = post?.excerpt || staticArticle?.excerpt || '';

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {isLoading ? (
        /* Loading skeleton */
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
            <div className="h-4 bg-[#1a1815] w-32" />
            <div className="h-10 bg-[#1a1815] w-3/4" />
            <div className="h-80 bg-[#1a1815]" />
            <div className="space-y-3">
              <div className="h-3 bg-[#1a1815] w-full" />
              <div className="h-3 bg-[#1a1815] w-full" />
              <div className="h-3 bg-[#1a1815] w-5/6" />
              <div className="h-3 bg-[#1a1815] w-4/5" />
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Hero */}
          <section className="py-12 md:py-16 border-b border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/journal"
                  className="inline-flex items-center gap-2 text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors mb-8"
                >
                  <ArrowLeft size={14} />
                  Back to Journal
                </Link>

                {excerpt && (
                  <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-4">
                    {excerpt}
                  </p>
                )}

                <h1 className="text-3xl md:text-5xl font-serif font-bold text-textPrimary leading-tight">
                  {title}
                </h1>
              </motion.div>
            </div>
          </section>

          {/* Cover Image */}
          {coverImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <div className="relative h-72 md:h-96 overflow-hidden border border-border">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </motion.div>
          )}

          {/* Content Body */}
          <section className="py-8 md:py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="prose-custom"
              >
                {content.split('\n\n').map((paragraph, i) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  // Detect headings (ALL CAPS lines)
                  if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && !trimmed.startsWith('Step')) {
                    return (
                      <h2
                        key={i}
                        className="text-lg font-serif font-bold text-textPrimary mt-12 mb-4"
                      >
                        {trimmed}
                      </h2>
                    );
                  }

                  // Detect step headings
                  if (trimmed.startsWith('Step ')) {
                    return (
                      <h3
                        key={i}
                        className="text-sm font-serif font-bold text-gold mt-8 mb-3"
                      >
                        {trimmed}
                      </h3>
                    );
                  }

                  return (
                    <p
                      key={i}
                      className="text-sm text-textSecondary font-light leading-relaxed mb-6"
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </motion.div>

              {/* Decorative end */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-16 pt-12 border-t border-border"
              >
                <span className="text-gold text-2xl opacity-40">✦</span>
                <div className="mt-8">
                  <Link
                    href="/journal"
                    className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-3 text-xs font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors duration-300"
                  >
                    <ArrowLeft size={14} />
                    More Stories
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
