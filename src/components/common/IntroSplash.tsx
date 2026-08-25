'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IntroSplash: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem('hairbands_intro_seen');
    if (seen) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

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
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAF6F0] cursor-pointer"
          onClick={handleDismiss}
        >
          {/* Logo — large, centered, simple */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Hair Bands"
              className="h-40 sm:h-52 md:h-64 w-auto object-contain"
            />

            {/* Simple gold line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
              className="h-[1px] bg-[#C5A880] mt-6"
            />

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-4 text-[11px] tracking-[0.3em] text-[#8B7355] uppercase"
            >
              Haute Hair &amp; Beauty
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
