'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Convert product name to URL slug
  const slug = product.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link href={`/product/${slug}`}>
      <motion.article
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="group cursor-pointer"
      >
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
              src={product.image}
              alt={product.name}
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
              {product.type.replace('-', ' ')}
            </p>
            <p className="text-xs text-textSecondary font-light">
              {product.performance.longevity} • {product.performance.sillage}
            </p>
          </motion.div>
        </motion.div>

        {/* Product Details */}
        <div className="space-y-3">
          {/* Name */}
          <h3 className="text-sm font-serif font-bold text-textPrimary group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>

          {/* Type & Collection */}
          <p className="text-xs text-textSecondary font-light uppercase tracking-widest">
            {product.type.replace('-', ' ')} de Parfum
          </p>

          {/* Scents */}
          <div className="flex flex-wrap gap-2">
            {product.scents.slice(0, 2).map((scent) => (
              <span
                key={scent}
                className="inline-block bg-[#1a1815] text-textSecondary px-3 py-1 text-xs font-light rounded-none"
              >
                {scent}
              </span>
            ))}
          </div>

          {/* Intensity */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-textSecondary font-light">Intensity:</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 ${
                    i < product.intensity ? 'bg-gold' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-serif font-bold text-gold">
              ₹{product.price.toLocaleString()}
            </span>
            <button className="text-xs text-gold font-light uppercase tracking-wider hover:text-goldHover transition-colors">
              ADD TO CART
            </button>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
