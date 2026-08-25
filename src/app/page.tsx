'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Calendar, Sparkles, Shield, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

// Hardcoded fallback data in case database is not populated
const SEED_PRODUCTS = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    name: 'Maya Body Wave',
    slug: 'maya-body-wave',
    description: 'Crafted from 100% premium virgin human hair, the Maya Body Wave wig delivers voluminous, cascading waves.',
    price: 28500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    is_featured: true,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.9,
    review_count: 128,
    image_url: '/images/maya.jpg',
    category: 'Wigs'
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    name: 'Amara Straight',
    slug: 'amara-straight',
    description: 'The Amara Straight wig is a timeless classic, offering a sleek, bone-straight silhouette.',
    price: 32000,
    sale_price: 29999,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    is_featured: true,
    is_new: true,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.8,
    review_count: 86,
    image_url: '/images/amara.jpg',
    category: 'Wigs'
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    name: 'Naomi Deep Wave',
    slug: 'naomi-deep-wave',
    description: 'Bring out your inner goddess with Naomi Deep Wave. This luxury piece features deep, bouncy curls.',
    price: 29000,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    is_featured: false,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.7,
    review_count: 95,
    image_url: '/images/naomi.jpg',
    category: 'Wigs'
  },
  {
    id: 'p1000000-0000-0000-0000-000000000013',
    name: 'Marula Gold Hair Oil Serum',
    slug: 'marula-oil',
    description: 'Crafted from pure cold-pressed Marula seeds, this lightweight hair oil serum absorbs instantly.',
    price: 3500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    is_featured: true,
    is_new: true,
    is_best_seller: true,
    is_pre_order: false,
    rating: 5.0,
    review_count: 142,
    image_url: '/images/haircare.jpg',
    category: 'Hair Care'
  },
  {
    id: 'p1000000-0000-0000-0000-000000000011',
    name: 'Cocoa Butter Hydrating Treatment',
    slug: 'cocoa-shampoo',
    description: 'Enriched with premium African cocoa butter and argan oil for deep nourishment.',
    price: 2400,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    is_featured: false,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.8,
    review_count: 110,
    image_url: '/images/nia.jpg',
    category: 'Hair Care'
  }
];

export default function Homepage() {
  const [products, setProducts] = useState<any[]>(SEED_PRODUCTS);
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    // Attempt to load from database if configured
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (url, display_order)
          `)
          .limit(6);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map((p: any) => ({
            ...p,
            category: p.categories?.name,
            image_url: p.product_images?.find((img: any) => img.display_order === 0)?.url || p.product_images?.[0]?.url
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.warn('Failed to load live database products, keeping defaults:', err);
      }
    };

    loadProducts();
  }, []);

  const featuredWigs = products.filter(p => p.category_id === 'c1000000-0000-0000-0000-000000000001' || p.category === 'Wigs');
  const hairCare = products.filter(p => p.category_id === 'c1000000-0000-0000-0000-000000000002' || p.category === 'Hair Care');

  return (
    <div className="w-full overflow-hidden bg-luxury-cream">
      
      {/* 1. Cinematic Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center">
        {/* Background Zoom Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.95 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(33, 21, 16, 0.7), rgba(33, 21, 16, 0.2)), url('/images/hero.jpg')`
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left w-full text-luxury-cream flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="font-script text-3xl sm:text-4xl text-luxury-champagne mb-2"
          >
            unveiling the crown
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light tracking-[0.2em] uppercase leading-tight max-w-3xl"
          >
            The Art of Beauty
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-xs sm:text-sm tracking-[0.25em] text-luxury-cream/80 mt-4 max-w-md uppercase"
          >
            Luxury hair that feels like you. Sourced with integrity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-10"
          >
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 border border-luxury-champagne bg-luxury-champagne hover:bg-transparent hover:text-luxury-champagne text-luxury-espresso font-semibold text-xs tracking-[0.25em] transition-all uppercase rounded-sm"
            >
              Shop The Collection
            </Link>
            <Link
              href="/reservations"
              className="w-full sm:w-auto px-8 py-4 border border-luxury-cream hover:bg-luxury-cream hover:text-luxury-espresso text-luxury-cream font-semibold text-xs tracking-[0.25em] transition-all uppercase rounded-sm"
            >
              Reserve a Wig
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="font-script text-2xl text-luxury-champagne">browse our collection</span>
          <h2 className="font-serif text-3xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">Curated Categories</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Luxury Wigs', slug: 'wigs', img: '/images/maya.jpg' },
            { name: 'Hair Care', slug: 'hair-products', img: '/images/haircare.jpg' },
            { name: 'Extensions', slug: 'extensions', img: '/images/ayana.jpg' },
            { name: 'Accessories', slug: 'accessories', img: '/images/accessories.jpg' }
          ].map((cat, idx) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group relative h-96 rounded-sm overflow-hidden border border-luxury-chocolate/10 luxury-shadow bg-luxury-beige"
            >
              {/* Image */}
              <div className="w-full h-full relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-espresso/80 via-luxury-espresso/15 to-transparent" />
              </div>
              
              {/* Category Info */}
              <div className="absolute bottom-6 left-6 right-6 text-luxury-cream">
                <h3 className="font-serif text-lg tracking-wider uppercase font-semibold mb-2">{cat.name}</h3>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="inline-flex items-center text-[10px] tracking-[0.2em] font-semibold text-luxury-champagne hover:text-luxury-cream uppercase transition-colors"
                >
                  Explore <ArrowRight size={12} className="ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Featured Editorial Collection (Asymmetric layout) */}
      <section className="bg-luxury-beige py-24 border-y border-luxury-chocolate/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image Col (Asymmetric placement) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 grid grid-cols-12 gap-4"
            >
              <div className="col-span-8 h-[450px] bg-luxury-cream rounded-sm overflow-hidden border border-luxury-chocolate/15 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/amara.jpg"
                  alt="Editorial Hair Model"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-4 h-[300px] mt-auto bg-luxury-cream rounded-sm overflow-hidden border border-luxury-chocolate/15 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/maya.jpg"
                  alt="Lace Close up"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Copy Col */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 space-y-6"
            >
              <span className="font-script text-3xl text-luxury-champagne">exclusive pieces</span>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-widest text-luxury-chocolate uppercase font-light leading-tight">
                The Maya Silk Wave
              </h2>
              <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed">
                Hand-tied by skilled artisans, each lace front wig represents the absolute pinnacle of luxury hair. Sourced from individual donors to preserve cuticle alignment, the Maya body wave holds its style through washes, weather, and life's moments.
              </p>
              
              <div className="border-t border-luxury-chocolate/15 pt-6 space-y-4">
                <div className="flex items-center space-x-3 text-xs tracking-wider text-luxury-chocolate font-medium">
                  <Sparkles size={14} className="text-luxury-champagne" />
                  <span>100% Raw Virgin Human Hair</span>
                </div>
                <div className="flex items-center space-x-3 text-xs tracking-wider text-luxury-chocolate font-medium">
                  <Shield size={14} className="text-luxury-champagne" />
                  <span>Ultra-thin HD Transparent Swiss Lace</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/product/maya-body-wave"
                  className="inline-block px-8 py-4 border border-luxury-chocolate bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate text-xs tracking-[0.25em] font-semibold transition-all uppercase rounded-sm"
                >
                  Explore Maya Wig
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Best Sellers & New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="font-script text-2xl text-luxury-champagne">handpicked items</span>
          <h2 className="font-serif text-3xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">The Best Sellers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredWigs.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative flex flex-col h-full border border-luxury-chocolate/10 bg-luxury-cream p-3 rounded-sm shadow-sm"
            >
              {/* Product Image Wrapper */}
              <div className="relative w-full aspect-[4/5] bg-luxury-beige overflow-hidden rounded-sm mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-luxury-cream/80 backdrop-blur-md flex items-center justify-center text-luxury-chocolate hover:text-red-700 transition-colors shadow-sm"
                >
                  <Heart size={14} className={isInWishlist(product.id) ? 'fill-red-700 text-red-700' : ''} />
                </button>

                {/* Badge (Sale or Pre-order) */}
                {product.sale_price && (
                  <span className="absolute bottom-3 left-3 bg-luxury-chocolate text-luxury-cream text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-sm">
                    Sale
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] tracking-widest text-luxury-champagne uppercase font-bold mb-1">
                    {product.category}
                  </div>
                  <h3 className="font-serif text-base font-semibold tracking-wide text-luxury-chocolate mb-2">
                    <Link href={`/product/${product.slug}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="fill-luxury-champagne text-luxury-champagne" />
                    ))}
                    <span className="text-[10px] text-luxury-coffee">({product.review_count})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-luxury-chocolate/10">
                  <div className="flex items-center space-x-2 text-xs font-semibold font-sans">
                    {product.sale_price ? (
                      <>
                        <span className="text-red-700">KSh {product.sale_price.toLocaleString()}</span>
                        <span className="line-through text-gray-400">KSh {product.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span>KSh {product.price.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-[10px] tracking-widest font-semibold uppercase text-luxury-chocolate hover:text-luxury-champagne transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Custom Wig fitting Reservation Section */}
      <section className="bg-luxury-chocolate text-luxury-cream py-24 text-center relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Sparkles className="mx-auto text-luxury-champagne animate-pulse" size={24} />
          <span className="font-script text-3xl text-luxury-champagne block">custom consultations</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light tracking-[0.2em] uppercase leading-tight">
            Book A Bespoke Wig Fitting
          </h2>
          <p className="text-xs text-luxury-cream/70 tracking-widest leading-relaxed max-w-lg mx-auto uppercase">
            Visit our physical beauty boutique for custom scalp coloring, wig viewing, fitting modifications, or custom design sessions with our expert stylists.
          </p>
          <div className="pt-4">
            <Link
              href="/reservations"
              className="inline-flex items-center px-8 py-4 border border-luxury-champagne bg-luxury-champagne text-luxury-espresso hover:bg-transparent hover:text-luxury-champagne text-xs tracking-[0.25em] font-semibold transition-all uppercase rounded-sm"
            >
              <Calendar size={14} className="mr-2" /> Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Hair Care Spotlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Spotlight text */}
          <div className="lg:col-span-5 space-y-6 lg:order-2">
            <span className="font-script text-2xl text-luxury-champagne">nourishment and shine</span>
            <h2 className="font-serif text-3xl tracking-widest text-luxury-chocolate uppercase font-light">Hair Care Rituals</h2>
            <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed">
              Formulated for extension longevity and natural hair health. Our Marula Gold and Cocoa Butter oils are derived from wild-harvested botanicals to preserve structural moisture and natural curls.
            </p>
            <div>
              <Link
                href="/shop?category=hair-products"
                className="inline-flex items-center text-xs tracking-[0.2em] font-semibold text-luxury-chocolate hover:text-luxury-champagne uppercase transition-colors"
              >
                Browse Treatments <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>

          {/* Spotlight images */}
          <div className="lg:col-span-7 lg:order-1 grid grid-cols-2 gap-4">
            {hairCare.slice(0, 2).map((item, idx) => (
              <div
                key={item.id}
                className={`bg-luxury-beige rounded-sm overflow-hidden border border-luxury-chocolate/10 luxury-shadow ${
                  idx === 1 ? 'mt-8' : ''
                }`}
              >
                <div className="w-full aspect-[4/5] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 bg-luxury-cream">
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-luxury-chocolate">{item.name}</h4>
                  <div className="text-xs font-semibold text-luxury-coffee mt-1">KSh {item.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Brand Story (Luxury editorial) */}
      <section className="bg-luxury-beige/40 py-24 border-t border-luxury-chocolate/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="font-script text-3xl text-luxury-champagne block">the heritage</span>
          <p className="font-serif text-xl sm:text-2xl font-light text-luxury-chocolate leading-relaxed max-w-3xl mx-auto italic">
            "Beauty isn't merely an appearance; it is a declaration of confidence, a connection to our heritage, and the crowning grace of femininity."
          </p>
          <div className="w-12 h-px bg-luxury-champagne mx-auto" />
          <div className="text-xs tracking-[0.25em] text-luxury-chocolate/70 font-semibold uppercase">
            Hair Bands Founders
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="font-script text-2xl text-luxury-champagne">beautiful encounters</span>
          <h2 className="font-serif text-3xl tracking-widest text-luxury-chocolate uppercase mt-2 font-light">Client Love</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: "The Swiss lace melts into my skin. I've worn the Maya Body Wave for 6 months and the hair texture remains incredibly soft.", client: "Nia M. — Nairobi" },
            { quote: "Marula Gold Oil is magical. It keeps my wig shiny without feeling greasy. A bottle lasts a long time.", client: "Amina J. — Mombasa" },
            { quote: "My custom fitting reservation was so luxurious. They adjusted the cap size and custom colored the knots for a perfect scalp melt.", client: "Wanjiku G. — Eldoret" }
          ].map((t, i) => (
            <div key={i} className="border border-luxury-chocolate/10 bg-luxury-cream p-8 rounded-sm luxury-shadow text-center space-y-4">
              <div className="flex justify-center space-x-1 text-luxury-champagne">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={10} className="fill-luxury-champagne text-luxury-champagne" />
                ))}
              </div>
              <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="text-[10px] tracking-widest uppercase font-semibold text-luxury-chocolate/80">
                {t.client}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
