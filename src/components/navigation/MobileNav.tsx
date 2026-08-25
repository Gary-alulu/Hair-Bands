'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { wishlistItems } = useWishlist();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-luxury-cream/95 backdrop-blur-md border-t border-luxury-chocolate/10 h-16 flex items-center justify-around z-40 px-2 shadow-[0_-4px_20px_rgba(58,33,24,0.05)]">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
          isActive('/') ? 'text-luxury-chocolate' : 'text-luxury-chocolate/50'
        }`}
      >
        <Home size={18} />
        <span className="text-[9px] tracking-wider mt-1 uppercase font-semibold">Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
          pathname.startsWith('/shop') ? 'text-luxury-chocolate' : 'text-luxury-chocolate/50'
        }`}
      >
        <ShoppingBag size={18} />
        <span className="text-[9px] tracking-wider mt-1 uppercase font-semibold">Shop</span>
      </Link>

      {/* Search */}
      <Link
        href="/shop?focusSearch=true"
        className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
          pathname === '/shop' && pathname.includes('focusSearch') ? 'text-luxury-chocolate' : 'text-luxury-chocolate/50'
        }`}
      >
        <Search size={18} />
        <span className="text-[9px] tracking-wider mt-1 uppercase font-semibold">Search</span>
      </Link>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className={`flex flex-col items-center justify-center w-12 h-12 transition-all relative ${
          isActive('/wishlist') ? 'text-luxury-chocolate' : 'text-luxury-chocolate/50'
        }`}
      >
        <Heart size={18} />
        {wishlistItems.length > 0 && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-luxury-champagne rounded-full" />
        )}
        <span className="text-[9px] tracking-wider mt-1 uppercase font-semibold">Wishlist</span>
      </Link>

      {/* Account */}
      <Link
        href="/account"
        className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
          pathname.startsWith('/account') ? 'text-luxury-chocolate' : 'text-luxury-chocolate/50'
        }`}
      >
        <User size={18} />
        <span className="text-[9px] tracking-wider mt-1 uppercase font-semibold">Account</span>
      </Link>
    </div>
  );
};
export default MobileNav;
