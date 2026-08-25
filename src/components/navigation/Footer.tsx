'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-luxury-espresso text-luxury-cream border-t border-luxury-chocolate/20 pt-16 pb-24 md:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section - Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-16 border-b border-luxury-cream/10">
          
          {/* Brand Statement */}
          <div className="space-y-5 max-w-md">
            <Link href="/" className="inline-block">
              <div className="p-3 bg-luxury-cream rounded-md inline-flex items-center justify-center shadow-lg border border-luxury-champagne/30 hover:opacity-95 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/HAIR BANDS logo-01.png"
                  alt="Hair Bands Logo"
                  className="h-12 sm:h-14 w-auto object-contain"
                />
              </div>
            </Link>
            <h3 className="font-serif text-2xl tracking-[0.2em] uppercase text-luxury-cream">
              Hair Bands
            </h3>
            <p className="text-xs tracking-wider leading-relaxed text-luxury-cream/70">
              Celebrating African beauty, femininity, and sophistication. We create premium-quality hair extensions, custom lace wigs, and organic-enriched treatments designed to empower confidence in every strand.
            </p>
            <div className="flex space-x-6 pt-2 text-xs tracking-widest text-luxury-champagne">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">INSTAGRAM</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">FACEBOOK</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-luxury-cream transition-colors">TIKTOK</a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4 lg:ml-auto w-full max-w-md">
            <h4 className="font-serif text-base tracking-wider text-luxury-cream">Join the Journal</h4>
            <p className="text-xs text-luxury-cream/60 tracking-wider">
              Subscribe for exclusive previews of new arrivals, luxury beauty journals, and reservation openings.
            </p>
            {subscribed ? (
              <p className="text-xs text-luxury-champagne tracking-widest font-semibold">WELCOME TO HAIR BANDS JOURNAL.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-luxury-cream/35 py-2">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none text-luxury-cream placeholder-luxury-cream/40 focus:outline-none text-xs tracking-widest"
                  required
                />
                <button
                  type="submit"
                  className="text-xs uppercase tracking-widest text-luxury-champagne hover:text-luxury-cream transition-colors font-semibold"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Section - Directory Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-xs tracking-wider text-luxury-cream/60">
          
          {/* Shop */}
          <div className="space-y-4">
            <h5 className="font-serif text-sm font-semibold tracking-widest text-luxury-cream uppercase">Shop</h5>
            <ul className="space-y-2">
              <li><Link href="/shop?category=wigs" className="hover:text-luxury-champagne transition-colors">Premium Wigs</Link></li>
              <li><Link href="/shop?category=hair-products" className="hover:text-luxury-champagne transition-colors">Hair Care</Link></li>
              <li><Link href="/shop?category=extensions" className="hover:text-luxury-champagne transition-colors">Bundles & Clip-ins</Link></li>
              <li><Link href="/shop?category=accessories" className="hover:text-luxury-champagne transition-colors">Styling Accessories</Link></li>
            </ul>
          </div>

          {/* Reservations */}
          <div className="space-y-4">
            <h5 className="font-serif text-sm font-semibold tracking-widest text-luxury-cream uppercase">Reservations</h5>
            <ul className="space-y-2">
              <li><Link href="/reservations" className="hover:text-luxury-champagne transition-colors">Custom Fitting</Link></li>
              <li><Link href="/reservations" className="hover:text-luxury-champagne transition-colors">Wig Viewing</Link></li>
              <li><Link href="/reservations" className="hover:text-luxury-champagne transition-colors">Consultations</Link></li>
              <li><Link href="/reservations" className="hover:text-luxury-champagne transition-colors">Order Pickups</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h5 className="font-serif text-sm font-semibold tracking-widest text-luxury-cream uppercase">Help & Care</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Wig Care Guide</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h5 className="font-serif text-sm font-semibold tracking-widest text-luxury-cream uppercase">Company</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">The Journal</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-luxury-champagne transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright & Legal */}
        <div className="pt-8 border-t border-luxury-cream/10 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-luxury-cream/40 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} HAIR BANDS. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-luxury-cream transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-luxury-cream transition-colors">TERMS OF USE</a>
            <a href="#" className="hover:text-luxury-cream transition-colors">REFUND POLICY</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
