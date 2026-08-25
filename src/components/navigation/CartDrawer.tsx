'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer: React.FC = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, total } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsCartOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-luxury-espresso z-50 pointer-events-auto"
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-luxury-cream z-50 flex flex-col shadow-2xl border-l border-luxury-chocolate/10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-luxury-chocolate/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={18} className="text-luxury-chocolate" />
                <h2 className="font-serif text-lg tracking-wider text-luxury-chocolate uppercase font-semibold">Shopping Bag</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-luxury-chocolate/70 hover:text-luxury-chocolate transition-colors p-2"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                  <span className="font-script text-4xl text-luxury-champagne mb-2">
                    Your collection is waiting
                  </span>
                  <p className="text-xs text-luxury-coffee max-w-xs leading-relaxed tracking-wider mb-6">
                    Your bag is beautifully empty. Save pieces you love and return to them whenever you're ready.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 border border-luxury-chocolate text-xs tracking-[0.2em] font-semibold text-luxury-cream bg-luxury-chocolate hover:bg-luxury-coffee transition-all uppercase rounded-sm"
                  >
                    Discover Something Beautiful
                  </Link>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const basePrice = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
                  const itemPrice = Number(basePrice) + Number(item.variant.price_adjustment);
                  const displayImage = item.product.image_url || '/images/maya.jpg';

                  return (
                    <motion.div
                      key={item.variant.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex space-x-4 border-b border-luxury-chocolate/5 pb-6"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-24 bg-luxury-beige rounded-sm overflow-hidden flex-shrink-0 relative border border-luxury-chocolate/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayImage}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-serif text-sm font-medium text-luxury-chocolate tracking-wider uppercase">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.variant.id)}
                              className="text-luxury-chocolate/40 hover:text-red-700 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Variant Options */}
                          <div className="text-[10px] text-luxury-coffee tracking-widest mt-1 space-y-0.5">
                            {item.variant.length && <div>LENGTH: {item.variant.length}</div>}
                            {item.variant.density && <div>DENSITY: {item.variant.density}</div>}
                            {item.variant.lace_type && <div>LACE: {item.variant.lace_type}</div>}
                            {item.variant.color && <div>COLOR: {item.variant.color}</div>}
                          </div>
                        </div>

                        {/* Price and Quantity Adjuster */}
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border border-luxury-chocolate/20 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                              className="px-2 py-1 text-luxury-chocolate hover:bg-luxury-beige transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-3 text-xs font-semibold text-luxury-chocolate select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                              className="px-2 py-1 text-luxury-chocolate hover:bg-luxury-beige transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          
                          <div className="text-xs font-semibold text-luxury-espresso font-sans">
                            KSh {(itemPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary (Sticky at bottom) */}
            {cartItems.length > 0 && (
              <div className="px-6 py-6 bg-luxury-beige border-t border-luxury-chocolate/10 space-y-4">
                <div className="space-y-2 text-xs tracking-wider text-luxury-coffee">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-luxury-espresso">KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Shipping (Premium Express)</span>
                    <span>KSh 500</span>
                  </div>
                  <div className="border-t border-luxury-chocolate/10 pt-3 flex justify-between text-sm tracking-[0.1em] uppercase font-semibold text-luxury-chocolate">
                    <span>Estimated Total</span>
                    <span className="text-base text-luxury-espresso">KSh {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center block px-6 py-3 border border-luxury-chocolate text-xs tracking-[0.25em] font-semibold text-luxury-cream bg-luxury-chocolate hover:bg-luxury-coffee transition-all uppercase rounded-sm"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full text-center block mt-3 text-xs tracking-widest uppercase font-semibold text-luxury-chocolate/70 hover:text-luxury-chocolate hover:underline transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
