'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, deliveryFee, total, clearCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-luxury-cream">
      
      {/* Header */}
      <div className="text-center mb-12">
        <span className="font-script text-3xl text-luxury-champagne">your bag</span>
        <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">Shopping Bag</h1>
        <div className="w-10 h-px bg-luxury-champagne mx-auto mt-4" />
      </div>

      {cartItems.length === 0 ? (
        // Empty State
        <div className="max-w-md mx-auto text-center py-16 space-y-6">
          <span className="font-script text-4xl text-luxury-champagne block">
            Your bag is beautifully empty
          </span>
          <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed uppercase">
            Discover premium hair designed to elevate your everyday luxury.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-4 border border-luxury-chocolate bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate text-xs tracking-[0.2em] font-semibold transition-all uppercase rounded-sm"
            >
              Start Discovering <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        // Cart layout
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-luxury-chocolate/10">
              <h2 className="text-xs tracking-widest uppercase font-bold text-luxury-chocolate">Items</h2>
              <button 
                onClick={clearCart}
                className="text-[10px] tracking-widest uppercase font-bold text-red-700 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="divide-y divide-luxury-chocolate/10">
              {cartItems.map((item) => {
                const basePrice = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
                const itemPrice = Number(basePrice) + Number(item.variant.price_adjustment);
                const displayImage = item.product.image_url || '/images/maya.jpg';

                return (
                  <div key={item.variant.id} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    
                    {/* Image & Details */}
                    <div className="flex space-x-6">
                      <div className="w-24 h-28 bg-luxury-beige rounded-sm overflow-hidden flex-shrink-0 border border-luxury-chocolate/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={displayImage} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] tracking-widest text-luxury-champagne uppercase font-bold">{item.product.category_id}</span>
                        <h3 className="font-serif text-base font-semibold text-luxury-chocolate uppercase">
                          <Link href={`/product/${item.product.slug}`} className="hover:underline">
                            {item.product.name}
                          </Link>
                        </h3>
                        
                        {/* Variant options */}
                        <div className="text-[10px] text-luxury-coffee tracking-widest space-y-0.5 pt-1 uppercase">
                          {item.variant.length && <div>Length: {item.variant.length}</div>}
                          {item.variant.density && <div>Density: {item.variant.density}</div>}
                          {item.variant.lace_type && <div>Lace: {item.variant.lace_type}</div>}
                          {item.variant.color && <div>Color: {item.variant.color}</div>}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                      
                      {/* Price per item */}
                      <div className="text-xs font-semibold text-luxury-coffee">
                        KSh {itemPrice.toLocaleString()} each
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-luxury-chocolate/20 bg-luxury-cream rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-luxury-chocolate hover:bg-luxury-beige transition-colors font-bold"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-3.5 text-xs font-semibold text-luxury-chocolate">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-luxury-chocolate hover:bg-luxury-beige transition-colors font-bold"
                          aria-label="Increase quantity"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Total and delete */}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-luxury-espresso font-sans">
                          KSh {(itemPrice * item.quantity).toLocaleString()}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.variant.id)}
                          className="text-luxury-chocolate/30 hover:text-red-700 p-1"
                          aria-label="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-4 bg-luxury-beige/50 p-8 border border-luxury-chocolate/10 rounded-sm h-fit space-y-6">
            <h2 className="font-serif text-lg tracking-widest text-luxury-chocolate uppercase border-b border-luxury-chocolate/10 pb-4 font-semibold">Summary</h2>
            
            <div className="space-y-4 text-xs tracking-wider text-luxury-coffee">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-luxury-espresso">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery (Express)</span>
                <span className="font-semibold text-luxury-espresso">KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-luxury-chocolate/10 pt-4 flex justify-between text-sm uppercase tracking-[0.1em] font-semibold text-luxury-chocolate">
                <span>Order Total</span>
                <span className="text-lg text-luxury-espresso">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full text-center block px-6 py-4 border border-luxury-chocolate text-xs tracking-[0.25em] font-semibold text-luxury-cream bg-luxury-chocolate hover:bg-luxury-coffee transition-all uppercase rounded-sm"
              >
                Proceed to Checkout
              </Link>
              
              <Link
                href="/shop"
                className="w-full text-center block mt-3 text-xs tracking-widest uppercase font-semibold text-luxury-chocolate/70 hover:text-luxury-chocolate hover:underline transition-all"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Safety badge */}
            <div className="pt-6 border-t border-luxury-chocolate/10 flex items-center space-x-3 text-[10px] tracking-wider text-luxury-coffee uppercase font-semibold">
              <ShieldCheck size={18} className="text-luxury-champagne flex-shrink-0" />
              <span>MPesa Daraja encrypted transactions. Your details are safe.</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
