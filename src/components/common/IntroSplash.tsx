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

    // Auto-dismiss after 7s — plenty of time to appreciate the animation
    const timer = setTimeout(() => {
      handleDismiss();
    }, 7000);

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
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-luxury-espresso overflow-hidden select-none cursor-pointer"
          onClick={handleDismiss}
        >
          {/* Subtle Ambient Radial Gold Glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,rgba(33,21,16,0.95)_70%,rgba(18,12,9,1)_100%)] pointer-events-none"
          />

          {/* Luxury Floating Dust/Sparkle Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="absolute inset-0 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          />

          {/* Main Logo Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            
            {/* Crest Emblem Background Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-8"
            >
              {/* Animated Outer Golden Aura Ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.92, 1.08, 0.92] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
                className="absolute -inset-5 rounded-full border border-luxury-champagne/30 blur-[2px]"
              />

              {/* Logo Presentation in Luxury Cream Medallion */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.5 }}
                className="relative p-6 sm:p-8 bg-gradient-to-b from-luxury-cream to-luxury-beige rounded-2xl shadow-2xl border border-luxury-champagne/40 overflow-hidden"
              >
                {/* Shimmer Sweep Animation — delayed so the logo is visible first */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '150%' }}
                  transition={{ delay: 2.5, duration: 1.8, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src="/images/logo.png"
                  alt="Hair Bands Luxury Logo"
                  initial={{ scale: 0.85, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ delay: 0.6, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-28 sm:h-36 w-auto object-contain drop-shadow-md"
                />
              </motion.div>
            </motion.div>

            {/* Typography Animation — enters after the logo settles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1.2, ease: 'easeOut' }}
              className="space-y-3"
            >
              <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.3em] font-light text-luxury-cream uppercase">
                Hair Bands
              </h2>
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 2.8, duration: 1.2, ease: 'easeOut' }}
                  className="h-[1px] bg-luxury-champagne"
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.6, duration: 1 }}
                  className="font-script text-lg sm:text-xl text-luxury-champagne tracking-widest"
                >
                  Haute Hair &amp; Beauty
                </motion.span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ delay: 2.8, duration: 1.2, ease: 'easeOut' }}
                  className="h-[1px] bg-luxury-champagne"
                />
              </div>
            </motion.div>

            {/* Enter Boutique Button — appears last */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.85, y: 0 }}
              whileHover={{ opacity: 1, scale: 1.03 }}
              transition={{ delay: 3.8, duration: 1, ease: 'easeOut' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="mt-12 px-8 py-2.5 border border-luxury-champagne/30 text-[10px] tracking-[0.25em] text-luxury-cream/80 hover:text-luxury-champagne hover:border-luxury-champagne uppercase transition-all duration-300 rounded-sm backdrop-blur-sm"
            >
              Enter Boutique
            </motion.button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
