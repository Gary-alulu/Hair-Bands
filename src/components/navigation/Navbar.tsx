'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, ShoppingBag, Heart, User, Search, Calendar, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  
  const { cartItems, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, profile, signOut, isMockAuth, mockLogin } = useAuth();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => pathname === path;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="w-full z-50 sticky top-0 bg-luxury-cream/90 backdrop-blur-md border-b border-luxury-chocolate/10 luxury-shadow">
      {/* 1. Announcement Bar */}
      <div className="w-full bg-luxury-chocolate text-luxury-cream text-center py-2 text-xs tracking-[0.2em] font-medium uppercase font-sans">
        Complimentary Delivery On All Orders | Book A Custom Fitting
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-luxury-chocolate hover:text-luxury-coffee transition-colors p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Navigation Links Left */}
        <nav className="hidden md:flex items-center space-x-8 text-xs tracking-[0.15em] uppercase font-medium">
          <Link 
            href="/" 
            className={`text-luxury-chocolate hover:text-luxury-coffee transition-colors ${isActive('/') ? 'border-b border-luxury-chocolate pb-1' : ''}`}
          >
            Home
          </Link>
          
          {/* Shop Mega Menu Trigger */}
          <div className="relative group">
            <Link 
              href="/shop" 
              className={`flex items-center space-x-1 text-luxury-chocolate hover:text-luxury-coffee transition-colors ${pathname.startsWith('/shop') ? 'border-b border-luxury-chocolate pb-1' : ''}`}
            >
              <span>Shop</span>
              <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
            </Link>

            {/* Mega Menu Dropdown */}
            <div className="absolute left-[-100px] top-full mt-4 w-[600px] bg-luxury-cream border border-luxury-chocolate/10 luxury-shadow p-8 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-3 gap-8">
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider text-luxury-chocolate border-b border-luxury-chocolate/10 pb-2 mb-4">Wigs</h4>
                <ul className="space-y-2 text-xs tracking-wider text-luxury-coffee">
                  <li><Link href="/shop?category=wigs" className="hover:text-luxury-champagne hover:underline transition-all">All Wigs</Link></li>
                  <li><Link href="/shop?category=wigs&texture=Straight" className="hover:text-luxury-champagne hover:underline transition-all">Sleek Straight</Link></li>
                  <li><Link href="/shop?category=wigs&texture=Body+Wave" className="hover:text-luxury-champagne hover:underline transition-all">Classic Body Wave</Link></li>
                  <li><Link href="/shop?category=wigs&texture=Curly" className="hover:text-luxury-champagne hover:underline transition-all">Voluminous Curly</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider text-luxury-chocolate border-b border-luxury-chocolate/10 pb-2 mb-4">Hair Care</h4>
                <ul className="space-y-2 text-xs tracking-wider text-luxury-coffee">
                  <li><Link href="/shop?category=hair-products" className="hover:text-luxury-champagne hover:underline transition-all">All Products</Link></li>
                  <li><Link href="/shop?category=hair-products&type=Shampoo" className="hover:text-luxury-champagne hover:underline transition-all">Shampoo</Link></li>
                  <li><Link href="/shop?category=hair-products&type=Conditioner" className="hover:text-luxury-champagne hover:underline transition-all">Conditioner</Link></li>
                  <li><Link href="/shop?category=hair-products&type=Oil" className="hover:text-luxury-champagne hover:underline transition-all">Oils & Serums</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wider text-luxury-chocolate border-b border-luxury-chocolate/10 pb-2 mb-4">Reservations</h4>
                <ul className="space-y-2 text-xs tracking-wider text-luxury-coffee">
                  <li><Link href="/reservations" className="hover:text-luxury-champagne hover:underline transition-all">Wig Viewing</Link></li>
                  <li><Link href="/reservations" className="hover:text-luxury-champagne hover:underline transition-all">Custom Fitting</Link></li>
                  <li><Link href="/reservations" className="hover:text-luxury-champagne hover:underline transition-all">Consultation</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <Link 
            href="/reservations" 
            className={`text-luxury-chocolate hover:text-luxury-coffee transition-colors ${isActive('/reservations') ? 'border-b border-luxury-chocolate pb-1' : ''}`}
          >
            Reservations
          </Link>
        </nav>

        {/* Brand Logo - Asymmetric Center */}
        <Link 
          href="/" 
          className="flex flex-col items-center select-none"
        >
          <span className="font-serif text-xl sm:text-2xl tracking-[0.25em] font-medium text-luxury-espresso uppercase">
            Hair Bands
          </span>
          <span className="font-script text-base text-luxury-champagne tracking-wider mt-[-2px] lowercase leading-none">
            beauté
          </span>
        </Link>

        {/* Right Nav Icons */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-luxury-chocolate">
          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:text-luxury-coffee transition-colors p-2"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative hover:text-luxury-coffee transition-colors p-2"
            aria-label="Wishlist"
          >
            <Heart size={18} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-luxury-champagne animate-pulse" />
            )}
          </Link>

          {/* Account Menu */}
          <div className="relative group/account">
            <Link
              href="/account"
              className="hover:text-luxury-coffee transition-colors p-2 flex items-center"
              aria-label="Account"
            >
              <User size={18} />
            </Link>
            
            {/* Quick Login / Sign Out Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-luxury-cream border border-luxury-chocolate/10 rounded-sm luxury-shadow opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-300 p-2 z-50">
              {user ? (
                <>
                  <div className="px-3 py-2 text-xs text-luxury-coffee border-b border-luxury-chocolate/10 mb-1">
                    Hi, <span className="font-semibold">{profile?.full_name || 'Gorgeous'}</span>
                  </div>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-xs text-luxury-chocolate hover:bg-luxury-beige rounded-sm">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/account" className="block px-3 py-2 text-xs text-luxury-chocolate hover:bg-luxury-beige rounded-sm">
                    My Account
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left block px-3 py-2 text-xs text-red-700 hover:bg-luxury-beige rounded-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/account" className="block px-3 py-2 text-xs text-luxury-chocolate hover:bg-luxury-beige rounded-sm font-medium">
                    Log In / Register
                  </Link>
                  {isMockAuth && (
                    <div className="border-t border-luxury-chocolate/10 mt-1 pt-1">
                      <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Demo Quick Login</div>
                      <button
                        onClick={() => mockLogin('customer')}
                        className="w-full text-left block px-3 py-1 text-[11px] text-luxury-coffee hover:bg-luxury-beige rounded-sm"
                      >
                        Sign in as Customer
                      </button>
                      <button
                        onClick={() => mockLogin('admin')}
                        className="w-full text-left block px-3 py-1 text-[11px] text-luxury-coffee hover:bg-luxury-beige rounded-sm"
                      >
                        Sign in as Admin
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative hover:text-luxury-coffee transition-colors p-2"
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-0 bg-luxury-chocolate text-luxury-cream text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-semibold">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Dropdown Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-luxury-beige border-b border-luxury-chocolate/10 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center">
              <form onSubmit={handleSearchSubmit} className="w-full flex items-center border-b border-luxury-chocolate/30 py-2">
                <Search size={18} className="text-luxury-chocolate/60 mr-3" />
                <input
                  type="text"
                  placeholder="Search premium wigs, textures, length, oils..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-luxury-espresso placeholder-luxury-chocolate/50 focus:outline-none text-sm tracking-wider"
                  autoFocus
                />
                <button type="submit" className="text-xs uppercase tracking-widest font-semibold text-luxury-chocolate hover:text-luxury-coffee transition-all">
                  Search
                </button>
              </form>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="ml-4 text-luxury-chocolate/70 hover:text-luxury-chocolate p-1"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Mobile Navigation Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 w-full bg-luxury-cream border-b border-luxury-chocolate/10 luxury-shadow p-6 md:hidden z-40"
          >
            <div className="flex flex-col space-y-4 text-sm font-medium tracking-widest uppercase">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-chocolate hover:text-luxury-coffee"
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-chocolate hover:text-luxury-coffee"
              >
                Shop All
              </Link>
              <Link 
                href="/shop?category=wigs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-coffee pl-4"
              >
                — Wigs
              </Link>
              <Link 
                href="/shop?category=hair-products" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-coffee pl-4"
              >
                — Hair Care
              </Link>
              <Link 
                href="/shop?category=extensions" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-coffee pl-4"
              >
                — Extensions
              </Link>
              <Link 
                href="/reservations" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-chocolate hover:text-luxury-coffee"
              >
                Reservations
              </Link>
              <Link 
                href="/wishlist" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-chocolate hover:text-luxury-coffee flex items-center justify-between"
              >
                <span>Wishlist</span>
                <Heart size={16} />
              </Link>
              <Link 
                href="/account" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-luxury-chocolate hover:text-luxury-coffee flex items-center justify-between"
              >
                <span>Account</span>
                <User size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
