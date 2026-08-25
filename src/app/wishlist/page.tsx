'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    // Default to the first available variant for this product
    // For demo/simplicity, we can find a variant or create a default structure
    // A production app would open a quick-view modal to choose variants,
    // or select a standard variant. Here we define a default variant based on the product.
    const defaultVariant = {
      id: 'default-var-' + product.id,
      product_id: product.id,
      sku: 'WL-MOV-' + product.slug.toUpperCase(),
      length: '18"',
      density: '150%',
      lace_type: 'HD Lace',
      color: 'Natural Black',
      price_adjustment: 0
    };

    addToCart(product, defaultVariant, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-luxury-cream">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="font-script text-3xl text-luxury-champagne">your selections</span>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">My Wishlist</h1>
        <div className="w-10 h-px bg-luxury-champagne mx-auto mt-4" />
      </div>

      {wishlistItems.length === 0 ? (
        // Empty State
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <span className="font-script text-4xl text-luxury-champagne block">
            Your collection is waiting
          </span>
          <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed uppercase">
            Save pieces you love and return to them whenever you're ready to make them yours.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-4 border border-luxury-chocolate bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate text-xs tracking-[0.2em] font-semibold transition-all uppercase rounded-sm"
            >
              Browse The Collection <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        // Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product) => {
            const displayImage = product.image_url || '/images/maya.jpg';
            const basePrice = product.sale_price !== null ? product.sale_price : product.price;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col h-full border border-luxury-chocolate/10 bg-luxury-cream p-3 rounded-sm luxury-shadow"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/5] bg-luxury-beige overflow-hidden rounded-sm mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-luxury-cream/80 backdrop-blur-md flex items-center justify-center text-luxury-chocolate hover:text-red-700 transition-colors shadow-sm"
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold tracking-wide text-luxury-chocolate mb-2">
                      <Link href={`/product/${product.slug}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </h3>
                    
                    <div className="text-xs font-semibold text-luxury-espresso font-sans mb-4">
                      KSh {basePrice.toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-luxury-chocolate/10 space-y-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full py-2 bg-luxury-chocolate text-luxury-cream text-[10px] tracking-widest font-semibold uppercase hover:bg-luxury-coffee transition-colors flex items-center justify-center rounded-sm"
                    >
                      <ShoppingBag size={12} className="mr-2" /> Add To Bag
                    </button>
                    
                    <Link
                      href={`/product/${product.slug}`}
                      className="w-full py-2 bg-transparent text-luxury-chocolate border border-luxury-chocolate/20 text-[10px] tracking-widest font-semibold uppercase hover:bg-luxury-beige transition-colors flex items-center justify-center rounded-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
