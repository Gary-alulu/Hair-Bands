'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Star, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/context/CartContext';

interface ProductCardProps {
  product: Product & { category?: string; stock?: number };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const displayImage = product.image_url || '/images/maya.jpg';
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative flex flex-col h-full border border-luxury-chocolate/10 bg-luxury-cream p-3 rounded-sm luxury-shadow hover:scale-[1.01] transition-all duration-300">
      
      {/* Image Area */}
      <div className="relative w-full aspect-[4/5] bg-luxury-beige overflow-hidden rounded-sm mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-luxury-cream/80 backdrop-blur-md flex items-center justify-center text-luxury-chocolate hover:text-red-700 transition-colors shadow-sm z-10"
          aria-label="Add to Wishlist"
        >
          <Heart size={14} className={isWishlisted ? 'fill-red-700 text-red-700' : ''} />
        </button>

        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-10">
          {product.is_pre_order && (
            <span className="bg-luxury-coffee text-luxury-cream text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-sm">
              Pre-Order
            </span>
          )}
          {product.sale_price && !isOutOfStock && (
            <span className="bg-red-700 text-luxury-cream text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-sm">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-luxury-espresso text-luxury-cream/60 text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-sm">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] tracking-widest text-luxury-champagne uppercase font-bold mb-1">
            {product.category || 'Collection'}
          </div>
          <h3 className="font-serif text-sm sm:text-base font-semibold tracking-wide text-luxury-chocolate mb-2">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < Math.floor(product.rating)
                    ? 'fill-luxury-champagne text-luxury-champagne'
                    : 'text-gray-300'
                }
              />
            ))}
            <span className="text-[10px] text-luxury-coffee font-medium">({product.review_count})</span>
          </div>
        </div>

        {/* Action / Price Area */}
        <div className="flex items-center justify-between pt-2 border-t border-luxury-chocolate/10">
          <div className="flex flex-col text-xs font-semibold font-sans">
            {product.sale_price ? (
              <>
                <span className="text-red-700">KSh {product.sale_price.toLocaleString()}</span>
                <span className="line-through text-gray-400 text-[10px] font-normal">KSh {product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="text-luxury-espresso">KSh {product.price.toLocaleString()}</span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="text-[10px] tracking-widest font-semibold uppercase text-luxury-chocolate hover:text-luxury-champagne transition-all"
          >
            {isOutOfStock ? 'View Options' : 'Explore'}
          </Link>
        </div>
      </div>

    </div>
  );
};
export default ProductCard;
