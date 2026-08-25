'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart, Product, ProductVariant } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Star, ShoppingBag, Calendar, Check, AlertCircle, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock DB fallbacks
const MOCK_PRODUCTS: Record<string, any> = {
  'maya-body-wave': {
    id: 'p1000000-0000-0000-0000-000000000001',
    name: 'Maya Body Wave',
    slug: 'maya-body-wave',
    description: 'Crafted from 100% premium virgin human hair, the Maya Body Wave wig delivers voluminous, cascading waves that flow naturally. Featuring a high-definition transparent lace frontal for an invisible hairline look, it can be styled, colored, and parted in any direction. Made for the modern woman seeking ultimate elegance and styling versatility.',
    price: 28500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'Wigs',
    rating: 4.9,
    review_count: 128,
    images: [
      '/images/maya.jpg',
      '/images/hero.jpg',
      '/images/extensions.jpg'
    ],
    variants: [
      { id: 'v1', product_id: 'p1', sku: 'MAY-BW-18-150-HD-NB', length: '18"', density: '150%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 0, stock: 5 },
      { id: 'v2', product_id: 'p1', sku: 'MAY-BW-18-180-HD-NB', length: '18"', density: '180%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 3000, stock: 4 },
      { id: 'v3', product_id: 'p1', sku: 'MAY-BW-20-180-HD-NB', length: '20"', density: '180%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 5500, stock: 2 },
      { id: 'v4', product_id: 'p1', sku: 'MAY-BW-22-200-HD-NB', length: '22"', density: '200%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 9000, stock: 0 }
    ],
    reviews: [
      { name: 'Nia M.', rating: 5, comment: 'The HD lace melts completely! Best body wave wig I have ever purchased.', date: 'July 14, 2026' },
      { name: 'Jane W.', rating: 4, comment: 'Gorgeous waves, holding up very nicely after washing twice.', date: 'August 02, 2026' }
    ]
  },
  'amara-straight': {
    id: 'p1000000-0000-0000-0000-000000000002',
    name: 'Amara Straight',
    slug: 'amara-straight',
    description: 'The Amara Straight wig is a timeless classic, offering a sleek, bone-straight silhouette. This premium lace front wig is designed with pre-plucked baby hairs and pre-bleached knots for a flawless scalp simulation.',
    price: 32000,
    sale_price: 29999,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'Wigs',
    rating: 4.8,
    review_count: 86,
    images: [
      '/images/amara.jpg',
      '/images/nia.jpg',
      '/images/ayana.jpg'
    ],
    variants: [
      { id: 'v11', sku: 'AMA-ST-16-150-TR-NB', length: '16"', density: '150%', lace_type: 'Transparent Lace', color: 'Natural Black', price_adjustment: 0, stock: 8 },
      { id: 'v12', sku: 'AMA-ST-18-180-HD-NB', length: '18"', density: '180%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 4000, stock: 3 },
      { id: 'v13', sku: 'AMA-ST-20-180-HD-NB', length: '20"', density: '180%', lace_type: 'HD Lace', color: 'Natural Black', price_adjustment: 7000, stock: 0 }
    ],
    reviews: [
      { name: 'Kendi L.', rating: 5, comment: 'Glossy, sleek, and moves beautifully. Got so many compliments!', date: 'June 28, 2026' }
    ]
  },
  'marula-oil': {
    id: 'p1000000-0000-0000-0000-000000000013',
    name: 'Marula Gold Hair Oil Serum',
    slug: 'marula-oil',
    description: 'Crafted from pure cold-pressed Marula seeds, this lightweight hair oil serum absorbs instantly to nourish the scalp, prevent heat damage, and provide a radiant luxury shine without weighing hair down.',
    price: 3500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'Hair Care',
    rating: 5.0,
    review_count: 142,
    images: [
      '/images/haircare.jpg'
    ],
    variants: [
      { id: 'v103', sku: 'CARE-MARULA-50ML', length: null, density: null, lace_type: null, color: null, price_adjustment: 0, stock: 45 }
    ],
    reviews: [
      { name: 'Wambui N.', rating: 5, comment: 'Absolute magic in a bottle. Best hair serum ever.', date: 'May 19, 2026' }
    ]
  }
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailsPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  // States
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Selected variant configuration
  const [selectedLength, setSelectedLength] = useState<string>('');
  const [selectedDensity, setSelectedDensity] = useState<string>('');
  const [selectedLace, setSelectedLace] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const [currentVariant, setCurrentVariant] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotification, setAddedNotification] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_images (url, display_order),
            product_variants (*, inventory(quantity))
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;

        if (data) {
          const images = data.product_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.url) || [];
          const variants = data.product_variants?.map((v: any) => ({
            ...v,
            stock: v.inventory?.quantity ?? 0
          })) || [];

          const formatted = {
            ...data,
            category: data.categories?.name,
            images: images.length > 0 ? images : ['/images/maya.jpg'],
            variants,
            reviews: MOCK_PRODUCTS[slug]?.reviews || [] // Keep reviews mock if none in table
          };

          setProduct(formatted);
          initSelections(formatted);
        } else {
          loadFallback();
        }
      } catch (err) {
        console.warn('DB product select failed, playing fallbacks:', err);
        loadFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadFallback = () => {
      const fb = MOCK_PRODUCTS[slug] || MOCK_PRODUCTS['maya-body-wave'];
      setProduct(fb);
      initSelections(fb);
    };

    fetchProduct();
  }, [slug]);

  // Set default selections
  const initSelections = (prod: any) => {
    if (!prod || !prod.variants || prod.variants.length === 0) return;
    
    // Find first variant in stock
    const defaultVar = prod.variants.find((v: any) => v.stock > 0) || prod.variants[0];
    
    setSelectedLength(defaultVar.length || '');
    setSelectedDensity(defaultVar.density || '');
    setSelectedLace(defaultVar.lace_type || '');
    setSelectedColor(defaultVar.color || '');
    setActiveImage(prod.images[0]);
  };

  // Keep selected variant updated based on attribute configurations
  useEffect(() => {
    if (!product || !product.variants) return;

    const matched = product.variants.find((v: any) => {
      const matchLen = !v.length || v.length === selectedLength;
      const matchDens = !v.density || v.density === selectedDensity;
      const matchLace = !v.lace_type || v.lace_type === selectedLace;
      const matchCol = !v.color || v.color === selectedColor;
      return matchLen && matchDens && matchLace && matchCol;
    });

    setCurrentVariant(matched || null);
  }, [selectedLength, selectedDensity, selectedLace, selectedColor, product]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-luxury-chocolate border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest text-luxury-coffee uppercase font-semibold">Preparing details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="font-serif text-2xl text-luxury-chocolate uppercase mb-4">Piece Not Found</h2>
        <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed mb-6">The beauty piece you are looking for has sold out or is no longer listed.</p>
        <Link href="/shop" className="px-6 py-3 border border-luxury-chocolate text-xs uppercase bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate transition-all font-semibold rounded-sm">
          Return to Collection
        </Link>
      </div>
    );
  }

  // Price calculations
  const basePrice = product.sale_price !== null ? product.sale_price : product.price;
  const currentPrice = Number(basePrice) + Number(currentVariant?.price_adjustment || 0);

  // Variant options aggregates
  const lengths = Array.from(new Set(product.variants.map((v: any) => v.length).filter(Boolean))) as string[];
  const densities = Array.from(new Set(product.variants.map((v: any) => v.density).filter(Boolean))) as string[];
  const laces = Array.from(new Set(product.variants.map((v: any) => v.lace_type).filter(Boolean))) as string[];
  const colors = Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[];

  // Inventory indicators
  const isAvailable = currentVariant && currentVariant.stock > 0;
  const isLowStock = currentVariant && currentVariant.stock > 0 && currentVariant.stock <= 3;
  const isOutOfStock = currentVariant && currentVariant.stock === 0;

  const handleAddToCart = () => {
    if (!currentVariant) return;
    
    // Cast and construct product structure matching CartContext
    const cartProduct: Product = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      category_id: product.category_id,
      is_featured: product.is_featured,
      is_new: product.is_new,
      is_best_seller: product.is_best_seller,
      is_pre_order: product.is_pre_order,
      rating: product.rating,
      review_count: product.review_count,
      image_url: product.images[0]
    };

    const cartVariant: ProductVariant = {
      id: currentVariant.id,
      product_id: product.id,
      sku: currentVariant.sku,
      length: currentVariant.length,
      density: currentVariant.density,
      lace_type: currentVariant.lace_type,
      color: currentVariant.color,
      price_adjustment: currentVariant.price_adjustment
    };

    addToCart(cartProduct, cartVariant, quantity);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 3000);
  };

  const handleBuyNow = () => {
    if (!currentVariant) return;
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-luxury-cream">
      
      {/* Breadcrumbs */}
      <div className="text-[10px] tracking-widest text-luxury-coffee/60 uppercase mb-8 flex space-x-2">
        <Link href="/" className="hover:text-luxury-chocolate transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-luxury-chocolate transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-luxury-chocolate font-bold">{product.name}</span>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        
        {/* Left Column: Image gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
          {/* Main active image */}
          <div className="flex-grow aspect-[4/5] bg-luxury-beige border border-luxury-chocolate/10 rounded-sm overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail list */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:w-20 justify-start">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-20 md:w-20 md:h-24 bg-luxury-beige border overflow-hidden rounded-sm flex-shrink-0 transition-all ${
                  activeImage === img ? 'border-luxury-chocolate ring-1 ring-luxury-chocolate' : 'border-luxury-chocolate/10 hover:border-luxury-chocolate/40'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: details & purchases */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Headline info */}
          <div>
            <div className="text-xs tracking-widest text-luxury-champagne uppercase font-bold mb-1">{product.category}</div>
            <h1 className="font-serif text-3xl tracking-wide text-luxury-chocolate uppercase font-semibold">{product.name}</h1>
            
            {/* Ratings summary */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'fill-luxury-champagne text-luxury-champagne' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-xs text-luxury-coffee tracking-wider font-semibold">
                {product.rating} ({product.review_count} client reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-4 border-y border-luxury-chocolate/10 flex items-center justify-between">
            <div className="text-2xl font-semibold text-luxury-espresso font-sans">
              KSh {currentPrice.toLocaleString()}
            </div>
            
            {/* Stock indicator */}
            <div className="text-xs tracking-widest uppercase font-semibold flex items-center">
              {isAvailable && (
                <span className="text-green-800 flex items-center">
                  <Check size={14} className="mr-1.5" /> In Stock ({currentVariant.stock} left)
                </span>
              )}
              {isLowStock && (
                <span className="text-amber-800 flex items-center animate-pulse">
                  <AlertCircle size={14} className="mr-1.5" /> Low Stock
                </span>
              )}
              {isOutOfStock && (
                <span className="text-red-800 flex items-center">
                  <AlertCircle size={14} className="mr-1.5" /> Sold Out
                </span>
              )}
              {!currentVariant && (
                <span className="text-red-800 flex items-center">
                  <AlertCircle size={14} className="mr-1.5" /> Variant Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Description Snippet */}
          <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed">
            {product.description}
          </p>

          {/* 1. Length selection */}
          {lengths.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Select Length</div>
              <div className="flex flex-wrap gap-2">
                {lengths.map((len) => (
                  <button
                    key={len}
                    onClick={() => setSelectedLength(len)}
                    className={`border text-[11px] tracking-widest px-4 py-2 rounded-sm font-semibold transition-all ${
                      selectedLength === len
                        ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                        : 'border-luxury-chocolate/20 text-luxury-chocolate hover:border-luxury-chocolate/40'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Density selection */}
          {densities.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Select Volume Density</div>
              <div className="flex flex-wrap gap-2">
                {densities.map((dens) => (
                  <button
                    key={dens}
                    onClick={() => setSelectedDensity(dens)}
                    className={`border text-[11px] tracking-widest px-4 py-2 rounded-sm font-semibold transition-all ${
                      selectedDensity === dens
                        ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                        : 'border-luxury-chocolate/20 text-luxury-chocolate hover:border-luxury-chocolate/40'
                    }`}
                  >
                    {dens}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Lace Selection */}
          {laces.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Select Lace Foundation</div>
              <div className="flex flex-wrap gap-2">
                {laces.map((lc) => (
                  <button
                    key={lc}
                    onClick={() => setSelectedLace(lc)}
                    className={`border text-[11px] tracking-widest px-4 py-2 rounded-sm font-semibold transition-all ${
                      selectedLace === lc
                        ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                        : 'border-luxury-chocolate/20 text-luxury-chocolate hover:border-luxury-chocolate/40'
                    }`}
                  >
                    {lc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Color selection */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Select Tone Color</div>
              <div className="flex flex-wrap gap-2">
                {colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`border text-[11px] tracking-widest px-4 py-2 rounded-sm font-semibold transition-all ${
                      selectedColor === col
                        ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                        : 'border-luxury-chocolate/20 text-luxury-chocolate hover:border-luxury-chocolate/40'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="pt-6 space-y-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Quantity</span>
              <div className="flex items-center border border-luxury-chocolate/20 rounded-sm bg-luxury-cream">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-luxury-chocolate hover:bg-luxury-beige transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-luxury-chocolate hover:bg-luxury-beige transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-grow flex items-center justify-center px-6 py-4 border border-luxury-chocolate text-xs tracking-[0.2em] font-semibold transition-all uppercase rounded-sm ${
                  isAvailable
                    ? 'bg-transparent text-luxury-chocolate hover:bg-luxury-chocolate hover:text-luxury-cream'
                    : 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={14} className="mr-2" /> Add to bag
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className={`flex-grow flex items-center justify-center px-6 py-4 border border-luxury-chocolate text-xs tracking-[0.2em] font-semibold transition-all uppercase rounded-sm ${
                  isAvailable
                    ? 'bg-luxury-chocolate text-luxury-cream hover:bg-luxury-coffee hover:border-luxury-coffee'
                    : 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Buy it now
              </button>
            </div>

            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className="w-full py-3 border border-luxury-chocolate/10 text-xs tracking-widest uppercase font-semibold text-luxury-chocolate hover:bg-luxury-beige flex items-center justify-center space-x-2 transition-all rounded-sm"
            >
              <Heart size={14} className={isInWishlist(product.id) ? 'fill-red-700 text-red-700' : ''} />
              <span>{isInWishlist(product.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
            </button>

            {/* Wig Reservation option */}
            {product.category === 'Wigs' && (
              <Link
                href={`/reservations?product=${product.id}`}
                className="w-full py-3 bg-luxury-beige text-luxury-chocolate text-xs tracking-widest uppercase font-semibold border border-luxury-chocolate/20 flex items-center justify-center space-x-2 hover:bg-luxury-cream transition-all rounded-sm"
              >
                <Calendar size={14} />
                <span>Book Fitting / Viewing Slot</span>
              </Link>
            )}

            {/* Added confirmation pop */}
            {addedNotification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-300 text-green-800 text-xs py-2 px-4 rounded-sm text-center font-semibold tracking-wider uppercase"
              >
                Item added to shopping bag.
              </motion.div>
            )}
          </div>

          {/* Premium trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-luxury-chocolate/10 text-center text-[10px] tracking-wider text-luxury-coffee">
            <div className="space-y-1">
              <Sparkles size={16} className="mx-auto text-luxury-champagne" />
              <div className="font-semibold text-luxury-chocolate uppercase">Pure Grade 12A</div>
              <div>Single-donor cuticle intact</div>
            </div>
            <div className="space-y-1">
              <Shield size={16} className="mx-auto text-luxury-champagne" />
              <div className="font-semibold text-luxury-chocolate uppercase">Secure Checkout</div>
              <div>Daraja M-Pesa verified</div>
            </div>
            <div className="space-y-1">
              <RefreshCw size={16} className="mx-auto text-luxury-champagne" />
              <div className="font-semibold text-luxury-chocolate uppercase">7-Day Exchange</div>
              <div>Unworn pieces swap</div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs / reviews */}
      <div className="border-t border-luxury-chocolate/10 pt-12">
        <h3 className="font-serif text-lg tracking-wider text-luxury-chocolate uppercase mb-6 font-semibold">Client Encounters</h3>
        {product.reviews.length === 0 ? (
          <div className="text-center py-6 text-xs text-luxury-coffee tracking-wider">There are no client reviews for this piece yet. Share your experience.</div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {product.reviews.map((rev: any, i: number) => (
              <div key={i} className="border-b border-luxury-chocolate/5 pb-6 space-y-2">
                <div className="flex justify-between items-center text-xs tracking-wider">
                  <span className="font-bold text-luxury-chocolate">{rev.name}</span>
                  <span className="text-gray-400 font-semibold">{rev.date || 'August 2026'}</span>
                </div>
                <div className="flex space-x-0.5 text-luxury-champagne">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={10} className={idx < rev.rating ? 'fill-luxury-champagne text-luxury-champagne' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
