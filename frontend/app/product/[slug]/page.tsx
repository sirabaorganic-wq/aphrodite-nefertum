'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { productsApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Minus, Heart } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

export default function ProductPage() {
  const { addItem } = useCart();
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);


  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'performance' | 'ritual'>(
    'description'
  );
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await productsApi.getProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="h-96 md:h-[500px] bg-[#1a1815] border border-border" />
            <div className="space-y-6 py-6">
              <div className="h-4 bg-[#1a1815] w-1/4" />
              <div className="h-10 bg-[#1a1815] w-3/4" />
              <div className="h-4 bg-[#1a1815] w-full" />
              <div className="h-4 bg-[#1a1815] w-5/6" />
              <div className="py-6 border-y border-border space-y-4">
                <div className="h-8 bg-[#1a1815] w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-12 bg-[#1a1815]" />
                  <div className="h-12 bg-[#1a1815]" />
                  <div className="h-12 bg-[#1a1815]" />
                </div>
              </div>
              <div className="h-12 bg-[#1a1815] w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <h1 className="text-2xl font-serif font-bold text-textPrimary">
            {error || 'Product not found'}
          </h1>
          <p className="text-sm text-textSecondary font-light">
            We couldn&apos;t load the product you requested.
          </p>
          <div className="flex justify-center gap-4">
            {error && error !== 'Product not found' && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gold text-background text-xs font-light uppercase tracking-widest hover:bg-goldHover transition-colors"
              >
                Retry
              </button>
            )}
            <Link
              href="/collection"
              className="px-6 py-2 border border-gold text-gold text-xs font-light uppercase tracking-widest hover:bg-gold hover:text-background transition-colors inline-block"
            >
              ← Back to Collection
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const variant = product.variants?.[0];
  const price = product.price ?? variant?.price ?? 6999;
  const typeStr = product.type || variant?.type || 'Extrait de Parfum';
  const longevity = product.performance?.longevity || product.longevity || '12+ hours';
  const sillage = product.performance?.sillage || product.sillage || 'Intense';
  const projection = product.performance?.projection || product.projection || 'Strong';
  const description = product.description || 'An intoxicating luxury fragrance crafted for ultimate performance.';
  const topNotes = product.notes?.top || variant?.topNotes || ['Bergamot', 'Saffron'];
  const heartNotes = product.notes?.heart || variant?.heartNotes || ['Oud', 'Lotus'];
  const baseNotes = product.notes?.base || variant?.baseNotes || ['Amber', 'Sandalwood'];
  const ingredients = product.ingredients || variant?.ingredients || ['Oud', 'Saffron', 'Bergamot', 'Black Pepper', 'Amber'];
  const image = product.image || '/images/products/nefertum-detail.jpg';
  const images = [image, image, image];

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
                alt={product.name || 'Fragrance'}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4">
              {images.map((img, index) => (
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
                    src={img}
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
                {typeStr.replace('-', ' ')}
              </p>
              <h1 className="text-4xl font-serif font-bold text-textPrimary mb-4">
                {product.name}
              </h1>
              <p className="text-sm text-textSecondary font-light leading-relaxed">
                {description}
              </p>
            </div>

            {/* Price & Performance */}
            <div className="space-y-4 py-4 border-y border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-textSecondary font-light">Price</span>
                <span className="text-2xl font-serif font-bold text-gold">
                  ₹{Number(price).toLocaleString()}
                </span>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Longevity
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {longevity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Sillage
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {sillage}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-textSecondary font-light mb-1">
                    Projection
                  </p>
                  <p className="text-sm font-serif font-bold text-textPrimary">
                    {projection}
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

              <button
                onClick={() => {
                  const vId = variant?.id || product.id;
                  addItem({
                    id: vId,
                    variantId: vId,
                    name: product.name || 'Luxury Fragrance',
                    price: Number(price),
                    quantity,
                    image,
                    collection: product.collection || 'nefertum',
                  });
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className={`w-full py-3 text-sm font-light uppercase tracking-widest transition-colors ${
                  added
                    ? 'bg-green-700 text-white'
                    : 'bg-gold text-background hover:bg-goldHover'
                }`}
              >
                {added ? 'ADDED TO CART ✓' : 'ADD TO CART'}
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
                  {description}
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
                  Ingredients & Notes
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-1">
                      Top Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {topNotes.join(', ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-1">
                      Heart Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {heartNotes.join(', ')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-gold font-light uppercase mb-1">
                      Base Notes
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {baseNotes.join(', ')}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-xs text-gold font-light uppercase mb-1">
                      Key Ingredients
                    </h4>
                    <p className="text-sm text-textSecondary font-light">
                      {ingredients.join(', ')}
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
                  exceptional longevity ({longevity}) and projection ({projection}) throughout the day. Perfect for
                  humid environments and intense heat with an {sillage.toLowerCase()} sillage.
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

      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              brand: {
                '@type': 'Brand',
                name: 'Aphrodite Nefertum',
              },
              offers: {
                '@type': 'Offer',
                price: product.variants?.[0]?.price || 6999,
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                url: `https://www.aphrodite-nefertum.com/product/${slug}`,
              },
              image: 'https://www.aphrodite-nefertum.com/images/products/nefertum-detail.jpg',
            }),
          }}
        />
      )}

      <Footer />
    </main>
  );
}
