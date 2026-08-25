'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroSplash: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has already seen intro this session
    const seen = sessionStorage.getItem('hairbands_intro_seen');
    if (seen) {
      setIsVisible(false);
      return;
    }

    // Auto-dismiss after 2.8s
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('hairbands_intro_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-luxury-espresso overflow-hidden select-none"
        >
          {/* Subtle Ambient Radial Gold Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0%,rgba(33,21,16,0.95)_70%,rgba(18,12,9,1)_100%)] pointer-events-none" />

          {/* Luxury Floating Dust/Sparkle Effect */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Main Logo Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            
            {/* Crest Emblem Background Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="relative mb-6"
            >
              {/* Animated Outer Golden Aura Ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -inset-4 rounded-full border border-luxury-champagne/30 blur-[2px]"
              />

              {/* Logo Presentation in Luxury Cream Medallion */}
              <div className="relative p-5 sm:p-6 bg-gradient-to-b from-luxury-cream to-luxury-beige rounded-2xl shadow-2xl border border-luxury-champagne/40 overflow-hidden">
                {/* Shimmer Sweep Animation */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '150%' }}
                  transition={{ delay: 0.6, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none"
                />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src="/images/HAIR BANDS logo-01.png"
                  alt="Hair Bands Luxury Logo"
                  initial={{ scale: 0.88, opacity: 0, filter: 'blur(8px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                  className="h-24 sm:h-32 w-auto object-contain drop-shadow-md"
                />
              </div>
            </motion.div>

            {/* Typography Animation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
              className="space-y-2"
            >
              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.3em] font-light text-luxury-cream uppercase">
                Hair Bands
              </h2>
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="h-[1px] bg-luxury-champagne"
                />
                <span className="font-script text-lg sm:text-xl text-luxury-champagne tracking-widest">
                  Haute Hair & Beauty
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="h-[1px] bg-luxury-champagne"
                />
              </div>
            </motion.div>

            {/* Subtle Enter / Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              onClick={handleDismiss}
              className="mt-10 px-6 py-2 border border-luxury-champagne/30 text-[10px] tracking-[0.25em] text-luxury-cream/80 hover:text-luxury-champagne hover:border-luxury-champagne uppercase transition-all rounded-sm backdrop-blur-sm"
            >
              Enter Boutique
            </motion.button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
