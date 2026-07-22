'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/constants';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const variant = product.variants?.[0];
  const slug = (product.name || 'product').toLowerCase().replace(/\s+/g, '-');
  const image = product.image || '/images/products/nefertum-detail.jpg';
  const typeStr = product.type || variant?.type || 'Extrait';
  const longevity = product.performance?.longevity || product.longevity || '12+ hours';
  const sillage = product.performance?.sillage || product.sillage || 'Intense';
  const scents = product.scents || variant?.scents || ['luxury', 'oud'];
  const intensity = product.intensity || 5;
  const price = product.price ?? variant?.price ?? 6999;
  const vId = variant?.id || product.id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: vId,
      variantId: vId,
      name: product.name || 'Luxury Fragrance',
      price: Number(price),
      quantity: 1,
      image,
      collection: product.collection || 'nefertum',
    });
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group bg-[#0f0d0a] border border-border/50 hover:border-gold/50 transition-colors duration-300 flex flex-col justify-between"
    >
      <Link href={`/product/${slug}`} className="block flex-1 cursor-pointer">
        {/* Image Container */}
        <motion.div
          className="relative h-64 md:h-80 mb-6 overflow-hidden rounded-none bg-[#1a1815]"
          whileHover="hover"
        >
          <motion.div
            variants={{
              hover: {
                scale: 1.05,
              }
            }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full"
          >
            <Image
              src={image}
              alt={product.name || 'Fragrance'}
              fill
              className="object-cover"
            />
            {/* Luxury shine effect on hover */}
            <motion.div
              variants={{
                hover: {
                  opacity: 1,
                }
              }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"
            />
          </motion.div>

          {/* Overlay with specs */}
          <motion.div
            variants={{
              hover: {
                opacity: 1,
              }
            }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4"
          >
            <p className="text-xs text-textPrimary font-light uppercase tracking-widest mb-2">
              {typeStr.replace('-', ' ')}
            </p>
            <p className="text-xs text-textSecondary font-light">
              {longevity} • {sillage}
            </p>
          </motion.div>
        </motion.div>

        {/* Product Details */}
        <div className="space-y-3 px-4">
          {/* Name */}
          <h3 className="text-sm font-serif font-bold text-textPrimary group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>

          {/* Type & Collection */}
          <p className="text-xs text-textSecondary font-light uppercase tracking-widest">
            {typeStr.replace('-', ' ')}
          </p>

          {/* Scents */}
          <div className="flex flex-wrap gap-2">
            {scents.slice(0, 2).map((scent: string) => (
              <span
                key={scent}
                className="inline-block bg-[#1a1815] text-textSecondary px-3 py-1 text-xs font-light rounded-none capitalize"
              >
                {scent}
              </span>
            ))}
          </div>

          {/* Intensity */}
          <div className="flex items-center space-x-2 pb-2">
            <span className="text-xs text-textSecondary font-light">Intensity:</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 ${i < intensity ? 'bg-gold' : 'bg-border'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Bar (Outside Link) */}
      <div className="flex justify-between items-center pt-3 mt-4 pb-4 px-4 border-t border-border">
        <span className="text-sm font-serif font-bold text-gold">
          ₹{Number(price).toLocaleString()}
        </span>
        <button
          onClick={handleAddToCart}
          className="text-xs text-gold font-light uppercase tracking-wider hover:bg-gold hover:text-background transition-colors py-2 px-3 border border-gold/40 hover:border-gold rounded-none"
        >
          ADD TO CART
        </button>
      </div>
    </motion.article>
  );
}
