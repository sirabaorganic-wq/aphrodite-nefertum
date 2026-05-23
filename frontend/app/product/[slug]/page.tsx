'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { products } from '@/lib/constants';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Minus, Heart } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find product by slug
  const product = products.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, '-') === slug
  );

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'performance' | 'ritual'>(
    'description'
  );
  const [imageIndex, setImageIndex] = useState(0);

  if (!product) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-textPrimary">
            Product not found
          </h1>
          <Link href="/collection" className="mt-4 inline-block text-gold font-light">
            ← Back to Collection
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const images = [product.image, product.image, product.image];

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-textSecondary font-light">
          <Link href="/collection" className="hover:text-gold transition-colors">
            Collection
          </Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative h-96 md:h-[500px] bg-[#1a1815] overflow-hidden">
              <Image
                src={images[imageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setImageIndex(index)}
                  className={`relative h-20 w-20 border-2 transition-colors ${
                    imageIndex === index
                      ? 'border-gold'
                      : 'border-border hover:border-gold'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <p className="text-xs text-textSecondary font-light uppercase tracking-widest mb-2">
                {product.type.replace('-', ' ')}
              </p>
              <h1 className="text-4xl font-serif font-bold text-textPrimary mb-4">
                {product.name}
              </h1>
              <p className="text-sm text-textSecondary font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Performance */}
            <div className="space-y-4 py-4 border-y border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-textSecondary font-light">Price</span>
                <span className="text-2xl font-serif font-bold text-gold">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Longevity
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {product.performance.longevity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Sillage
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {product.performance.sillage}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Projection
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {product.performance.projection}
                  </p>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-textSecondary font-light">Quantity</span>
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#1a1815] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-light">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[#1a1815] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button className="w-full bg-gold text-background py-3 text-sm font-light uppercase tracking-widest hover:bg-goldHover transition-colors">
                ADD TO CART
              </button>

              <button className="w-full border border-gold text-gold py-3 text-sm font-light uppercase tracking-widest hover:bg-gold hover:text-background transition-colors flex items-center justify-center space-x-2">
                <Heart size={16} />
                <span>ADD TO WISHLIST</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 border-t border-border pt-12"
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-8 mb-8 border-b border-border pb-4">
            {['description', 'ingredients', 'performance', 'ritual'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs font-light uppercase tracking-widest pb-4 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-gold border-gold'
                    : 'text-textSecondary border-transparent hover:text-gold'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-2xl space-y-6">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                  About this fragrance
                </h3>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )}

            {activeTab === 'ingredients' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                  Ingredients
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-2">
                      Top Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {product.notes.top.join(', ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-2">
                      Heart Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {product.notes.heart.join(', ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-2">
                      Base Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {product.notes.base.join(', ')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                  Performance Details
                </h3>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  Engineered for India&apos;s tropical climate, this fragrance delivers
                  exceptional longevity and projection throughout the day. Perfect for
                  humid environments and intense heat.
                </p>
              </motion.div>
            )}

            {activeTab === 'ritual' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-serif font-bold text-textPrimary uppercase">
                  The Ritual
                </h3>
                <p className="text-sm text-textSecondary font-light leading-relaxed">
                  Apply to pulse points for a ritualistic experience. Our fragrances
                  are designed not just as scents, but as ceremonies—small moments of
                  luxury embedded in your daily routine.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
