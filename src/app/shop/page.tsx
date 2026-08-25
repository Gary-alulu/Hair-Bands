'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/product/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';

const SEED_PRODUCTS = [
  {
    id: 'p1000000-0000-0000-0000-000000000001',
    name: 'Maya Body Wave',
    slug: 'maya-body-wave',
    description: 'Crafted from 100% premium virgin human hair, the Maya Body Wave wig delivers voluminous, cascading waves.',
    price: 28500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: true,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.9,
    review_count: 128,
    image_url: '/images/maya.jpg',
    textures: ['Body Wave', 'Wave'],
    lengths: ['18"', '20"', '22"'],
    colors: ['Natural Black'],
    stock: 11
  },
  {
    id: 'p1000000-0000-0000-0000-000000000002',
    name: 'Amara Straight',
    slug: 'amara-straight',
    description: 'The Amara Straight wig is a timeless classic, offering a sleek, bone-straight silhouette.',
    price: 32000,
    sale_price: 29999,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: true,
    is_new: true,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.8,
    review_count: 86,
    image_url: '/images/amara.jpg',
    textures: ['Straight'],
    lengths: ['16"', '18"', '20"'],
    colors: ['Natural Black'],
    stock: 11
  },
  {
    id: 'p1000000-0000-0000-0000-000000000003',
    name: 'Naomi Deep Wave',
    slug: 'naomi-deep-wave',
    description: 'Bring out your inner goddess with Naomi Deep Wave. This luxury piece features deep, bouncy curls.',
    price: 29000,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: false,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.7,
    review_count: 95,
    image_url: '/images/naomi.jpg',
    textures: ['Deep Wave', 'Curly'],
    lengths: ['18"', '20"'],
    colors: ['Natural Black'],
    stock: 5
  },
  {
    id: 'p1000000-0000-0000-0000-000000000004',
    name: 'Zuri Curly',
    slug: 'zuri-curly',
    description: 'Embrace bold, bouncy curls with the Zuri Curly wig. Styled with defined kinky curls.',
    price: 26500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: false,
    is_new: true,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.9,
    review_count: 44,
    image_url: '/images/zuri.jpg',
    textures: ['Curly'],
    lengths: ['16"', '18"', '20"'],
    colors: ['Natural Black'],
    stock: 8
  },
  {
    id: 'p1000000-0000-0000-0000-000000000005',
    name: 'Nia Lace Front',
    slug: 'nia-lace-front',
    description: 'The Nia Lace Front is designed with pre-styled light layers that frame the face beautifully.',
    price: 18500,
    sale_price: 15500,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: false,
    is_new: false,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.5,
    review_count: 37,
    image_url: '/images/nia.jpg',
    textures: ['Straight'],
    lengths: ['14"', '16"'],
    colors: ['Natural Black', 'Brown'],
    stock: 12
  },
  {
    id: 'p1000000-0000-0000-0000-000000000006',
    name: 'Ayana Body Wave',
    slug: 'ayana-body-wave',
    description: 'Indulge in the luxury of the Ayana Body Wave wig. Sourced from single-donor raw hair.',
    price: 35000,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'wigs',
    is_featured: true,
    is_new: false,
    is_best_seller: false,
    is_pre_order: true,
    rating: 5.0,
    review_count: 19,
    image_url: '/images/ayana.jpg',
    textures: ['Body Wave'],
    lengths: ['18"', '20"', '22"'],
    colors: ['Brown'],
    stock: 3
  },
  {
    id: 'p1000000-0000-0000-0000-000000000011',
    name: 'Cocoa Butter Hydrating Shampoo',
    slug: 'cocoa-shampoo',
    description: 'Enriched with premium African cocoa butter and argan oil, this sulfate-free hydrating shampoo.',
    price: 2400,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'hair-products',
    is_featured: false,
    is_new: false,
    is_best_seller: true,
    is_pre_order: false,
    rating: 4.8,
    review_count: 110,
    image_url: '/images/haircare.jpg',
    textures: [],
    lengths: [],
    colors: [],
    stock: 25
  },
  {
    id: 'p1000000-0000-0000-0000-000000000012',
    name: 'Argan Oil Restoring Conditioner',
    slug: 'argan-conditioner',
    description: 'A rich, creamy conditioner that untangles hair fibers, smooths frizz, and seals in moisture.',
    price: 2600,
    sale_price: 2200,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'hair-products',
    is_featured: false,
    is_new: false,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.6,
    review_count: 75,
    image_url: '/images/haircare.jpg',
    textures: [],
    lengths: [],
    colors: [],
    stock: 15
  },
  {
    id: 'p1000000-0000-0000-0000-000000000013',
    name: 'Marula Gold Hair Oil Serum',
    slug: 'marula-oil',
    description: 'Crafted from pure cold-pressed Marula seeds, this lightweight hair oil serum absorbs instantly.',
    price: 3500,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'hair-products',
    is_featured: true,
    is_new: true,
    is_best_seller: true,
    is_pre_order: false,
    rating: 5.0,
    review_count: 142,
    image_url: '/images/haircare.jpg',
    textures: [],
    lengths: [],
    colors: [],
    stock: 45
  },
  {
    id: 'p1000000-0000-0000-0000-000000000014',
    name: 'Shea Edge Control & Styling Gel',
    slug: 'shea-edge-control',
    description: 'Infused with organic shea butter and black castor oil, this strong-hold edge control gel.',
    price: 1200,
    sale_price: null,
    category_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'hair-products',
    is_featured: false,
    is_new: false,
    is_best_seller: false,
    is_pre_order: false,
    rating: 4.7,
    review_count: 215,
    image_url: '/images/haircare.jpg',
    textures: [],
    lengths: [],
    colors: [],
    stock: 30
  }
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL States
  const urlCategory = searchParams.get('category') || 'all';
  const urlSearch = searchParams.get('search') || '';
  const urlTexture = searchParams.get('texture') || 'all';
  const urlLength = searchParams.get('length') || 'all';
  const urlColor = searchParams.get('color') || 'all';
  const urlSort = searchParams.get('sort') || 'featured';

  // Local state
  const [products, setProducts] = useState<any[]>(SEED_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<any[]>(SEED_PRODUCTS);
  const [searchVal, setSearchVal] = useState(urlSearch);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(40000);

  useEffect(() => {
    // Attempt database load
    const loadDbProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(slug, name),
            product_images(url, display_order),
            product_variants(id, length, density, lace_type, color)
          `);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formatted = data.map((p: any) => {
            const texturesSet = new Set(p.product_variants?.map((v: any) => v.lace_type).filter(Boolean));
            const lengthsSet = new Set(p.product_variants?.map((v: any) => v.length).filter(Boolean));
            const colorsSet = new Set(p.product_variants?.map((v: any) => v.color).filter(Boolean));
            
            return {
              ...p,
              category: p.categories?.slug,
              category_name: p.categories?.name,
              image_url: p.product_images?.find((img: any) => img.display_order === 0)?.url || p.product_images?.[0]?.url,
              textures: Array.from(texturesSet),
              lengths: Array.from(lengthsSet),
              colors: Array.from(colorsSet),
              stock: 10 // Mock stock levels for database items
            };
          });
          setProducts(formatted);
        }
      } catch (err) {
        console.warn('Failed to load live database products, keeping defaults:', err);
      }
    };

    loadDbProducts();
  }, []);

  // Update search input when url changes
  useEffect(() => {
    setSearchVal(urlSearch);
  }, [urlSearch]);

  // Focus Search if requested
  useEffect(() => {
    if (searchParams.get('focusSearch') === 'true') {
      const searchInput = document.getElementById('shop-search-input');
      if (searchInput) searchInput.focus();
    }
  }, [searchParams]);

  // Handle updates to search query parameters
  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Remove focus search helper if navigate
    params.delete('focusSearch');
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParam('search', searchVal);
  };

  const clearFilters = () => {
    router.push('/shop');
    setPriceRange(40000);
  };

  // Perform client-side filtering and sorting
  useEffect(() => {
    let result = [...products];

    // 1. Search Query
    if (urlSearch) {
      const query = urlSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    if (urlCategory && urlCategory !== 'all') {
      result = result.filter((p) => p.category === urlCategory);
    }

    // 3. Texture Filter
    if (urlTexture && urlTexture !== 'all') {
      result = result.filter((p) => 
        p.textures?.some((t: string) => t.toLowerCase() === urlTexture.toLowerCase())
      );
    }

    // 4. Length Filter
    if (urlLength && urlLength !== 'all') {
      result = result.filter((p) => 
        p.lengths?.some((l: string) => l.includes(urlLength))
      );
    }

    // 5. Color Filter
    if (urlColor && urlColor !== 'all') {
      result = result.filter((p) => 
        p.colors?.some((c: string) => c.toLowerCase() === urlColor.toLowerCase())
      );
    }

    // 6. Price Range Filter
    result = result.filter((p) => {
      const currentPrice = p.sale_price !== null ? p.sale_price : p.price;
      return currentPrice <= priceRange;
    });

    // 7. Sorting
    switch (urlSort) {
      case 'newest':
        result.sort((a, b) => (a.is_new ? -1 : 1));
        break;
      case 'price-low':
        result.sort((a, b) => {
          const pA = a.sale_price !== null ? a.sale_price : a.price;
          const pB = b.sale_price !== null ? b.sale_price : b.price;
          return pA - pB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const pA = a.sale_price !== null ? a.sale_price : a.price;
          const pB = b.sale_price !== null ? b.sale_price : b.price;
          return pB - pA;
        });
        break;
      case 'best-selling':
        result.sort((a, b) => (a.is_best_seller ? -1 : 1));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (a.is_featured ? -1 : 1));
        break;
    }

    setFilteredProducts(result);
  }, [products, urlCategory, urlSearch, urlTexture, urlLength, urlColor, urlSort, priceRange]);

  const categories = [
    { name: 'All Pieces', slug: 'all' },
    { name: 'Luxury Wigs', slug: 'wigs' },
    { name: 'Hair Care Rituals', slug: 'hair-products' },
    { name: 'Extensions', slug: 'extensions' },
    { name: 'Accessories', slug: 'accessories' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-luxury-cream">
      
      {/* Header */}
      <div className="text-center md:text-left mb-8 border-b border-luxury-chocolate/10 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-luxury-chocolate uppercase font-light">The Collections</h1>
        <p className="text-xs text-luxury-coffee tracking-wider mt-2 uppercase">Discover bespoke extensions, custom frontals, and nourishing elixirs.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-luxury-beige/50 p-4 rounded-sm border border-luxury-chocolate/10">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex items-center bg-luxury-cream px-3 py-2 border border-luxury-chocolate/15 rounded-sm">
          <Search size={16} className="text-luxury-chocolate/50 mr-2" />
          <input
            id="shop-search-input"
            type="text"
            placeholder="Search piece..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-luxury-espresso placeholder-luxury-chocolate/40 focus:outline-none tracking-wider uppercase font-medium"
          />
          {searchVal && (
            <button type="button" onClick={() => { setSearchVal(''); updateQueryParam('search', ''); }} className="text-luxury-chocolate/40 hover:text-luxury-chocolate">
              <X size={14} />
            </button>
          )}
        </form>

        {/* Sort & Mobile filters */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center space-x-2 border border-luxury-chocolate/20 px-4 py-2 bg-luxury-cream text-xs uppercase tracking-widest font-semibold rounded-sm"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-widest uppercase text-luxury-coffee font-semibold">Sort:</span>
            <div className="relative">
              <select
                value={urlSort}
                onChange={(e) => updateQueryParam('sort', e.target.value)}
                className="appearance-none bg-luxury-cream border border-luxury-chocolate/15 px-4 py-2 pr-8 text-xs uppercase tracking-widest rounded-sm focus:outline-none focus:border-luxury-chocolate text-luxury-chocolate font-semibold cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="best-selling">Best Selling</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3 text-luxury-chocolate pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8 bg-luxury-beige/35 p-6 border border-luxury-chocolate/10 rounded-sm">
          <div className="flex justify-between items-center pb-4 border-b border-luxury-chocolate/15">
            <h3 className="font-serif text-sm tracking-widest uppercase font-semibold text-luxury-chocolate">Refine By</h3>
            <button onClick={clearFilters} className="text-[10px] tracking-widest uppercase font-bold text-luxury-champagne hover:text-luxury-chocolate transition-colors">Clear All</button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Category</h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateQueryParam('category', cat.slug)}
                  className={`w-full text-left flex items-center justify-between text-xs tracking-wider uppercase py-1 ${
                    urlCategory === cat.slug ? 'text-luxury-chocolate font-bold' : 'text-luxury-coffee hover:text-luxury-chocolate'
                  }`}
                >
                  <span>{cat.name}</span>
                  {urlCategory === cat.slug && <Check size={12} />}
                </button>
              ))}
            </div>
          </div>

          {/* Textures (Conditional on Wigs/Extensions) */}
          {(urlCategory === 'all' || urlCategory === 'wigs' || urlCategory === 'extensions') && (
            <div className="space-y-3 border-t border-luxury-chocolate/10 pt-6">
              <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Texture</h4>
              <div className="space-y-2">
                {[
                  { name: 'All Textures', slug: 'all' },
                  { name: 'Sleek Straight', slug: 'Straight' },
                  { name: 'Body Wave', slug: 'Body Wave' },
                  { name: 'Deep Wave', slug: 'Deep Wave' },
                  { name: 'Curly', slug: 'Curly' }
                ].map((text) => (
                  <button
                    key={text.slug}
                    onClick={() => updateQueryParam('texture', text.slug)}
                    className={`w-full text-left flex items-center justify-between text-xs tracking-wider uppercase py-1 ${
                      urlTexture === text.slug ? 'text-luxury-chocolate font-bold' : 'text-luxury-coffee hover:text-luxury-chocolate'
                    }`}
                  >
                    <span>{text.name}</span>
                    {urlTexture === text.slug && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lengths (Conditional) */}
          {(urlCategory === 'all' || urlCategory === 'wigs' || urlCategory === 'extensions') && (
            <div className="space-y-3 border-t border-luxury-chocolate/10 pt-6">
              <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Length</h4>
              <div className="grid grid-cols-3 gap-2">
                {['14"', '16"', '18"', '20"', '22"'].map((len) => (
                  <button
                    key={len}
                    onClick={() => updateQueryParam('length', urlLength === len ? 'all' : len)}
                    className={`border text-[10px] tracking-widest py-2 rounded-sm font-semibold uppercase ${
                      urlLength === len
                        ? 'bg-luxury-chocolate border-luxury-chocolate text-luxury-cream'
                        : 'border-luxury-chocolate/20 text-luxury-chocolate bg-luxury-cream hover:bg-luxury-beige'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3 border-t border-luxury-chocolate/10 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Max Price</h4>
              <span className="text-[11px] font-bold text-luxury-espresso">KSh {priceRange.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="40000"
              step="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-luxury-chocolate cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-semibold tracking-wider">
              <span>KSh 1,000</span>
              <span>KSh 40,000</span>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-center">
              <span className="font-script text-3xl text-luxury-champagne mb-2">no pieces match</span>
              <p className="text-xs text-luxury-coffee tracking-wider leading-relaxed uppercase mb-6 max-w-xs">We couldn't find any pieces matching your selections. Try adjusting your filters.</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 border border-luxury-chocolate text-[10px] tracking-widest font-semibold uppercase bg-luxury-chocolate text-luxury-cream hover:bg-transparent hover:text-luxury-chocolate transition-all rounded-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="fixed inset-0 bg-luxury-espresso/50" onClick={() => setShowMobileFilters(false)} />
          <div className="relative w-full max-w-xs bg-luxury-cream h-full shadow-xl flex flex-col p-6 overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-luxury-chocolate/10 pb-4">
              <h3 className="font-serif text-sm tracking-widest uppercase font-semibold text-luxury-chocolate">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="text-luxury-chocolate p-1">
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Category</h4>
              <div className="flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => { updateQueryParam('category', cat.slug); }}
                    className={`text-left text-xs tracking-wider uppercase py-2 border-b border-luxury-chocolate/5 flex justify-between ${
                      urlCategory === cat.slug ? 'text-luxury-chocolate font-bold' : 'text-luxury-coffee'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {urlCategory === cat.slug && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Textures */}
            <div className="space-y-2 pt-4 border-t border-luxury-chocolate/10">
              <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Texture</h4>
              <div className="flex flex-col gap-1">
                {[
                  { name: 'All Textures', slug: 'all' },
                  { name: 'Straight', slug: 'Straight' },
                  { name: 'Body Wave', slug: 'Body Wave' },
                  { name: 'Deep Wave', slug: 'Deep Wave' },
                  { name: 'Curly', slug: 'Curly' }
                ].map((text) => (
                  <button
                    key={text.slug}
                    onClick={() => { updateQueryParam('texture', text.slug); }}
                    className={`text-left text-xs tracking-wider uppercase py-2 border-b border-luxury-chocolate/5 flex justify-between ${
                      urlTexture === text.slug ? 'text-luxury-chocolate font-bold' : 'text-luxury-coffee'
                    }`}
                  >
                    <span>{text.name}</span>
                    {urlTexture === text.slug && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="space-y-2 pt-4 border-t border-luxury-chocolate/10">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] tracking-widest uppercase font-bold text-luxury-chocolate">Max Price</h4>
                <span className="text-xs font-bold">KSh {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="40000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-luxury-chocolate"
              />
            </div>

            <div className="pt-6 flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-luxury-chocolate/30 text-xs tracking-widest uppercase font-semibold text-luxury-chocolate bg-transparent rounded-sm"
              >
                Clear
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 border border-luxury-chocolate text-xs tracking-widest uppercase font-semibold text-luxury-cream bg-luxury-chocolate rounded-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs tracking-widest uppercase font-semibold">Loading Collections...</div>}>
      <ShopContent />
    </Suspense>
  );
}
