'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from './CartContext';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user, isMockAuth } = useAuth();

  // Avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (!user || isMockAuth) {
      const storedWishlist = localStorage.getItem('luxury_hair_wishlist');
      if (storedWishlist) {
        try {
          setWishlistItems(JSON.parse(storedWishlist));
        } catch (err) {
          console.error('Error loading wishlist from local storage:', err);
        }
      }
    }
  }, [user, isMockAuth]);

  // Sync state with local storage for guests
  useEffect(() => {
    if (mounted && (!user || isMockAuth)) {
      localStorage.setItem('luxury_hair_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, mounted, user, isMockAuth]);

  // Sync wishlist with database when logged in
  useEffect(() => {
    if (!mounted || !user || isMockAuth) return;

    const fetchDatabaseWishlist = async () => {
      try {
        // Get or create wishlist for user
        let { data: wishlist, error: wError } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (wError && wError.code !== 'PGRST116') {
          throw wError;
        }

        let wId = wishlist?.id;

        if (!wId) {
          const { data: newWishlist, error: createError } = await supabase
            .from('wishlists')
            .insert({ user_id: user.id })
            .select('id')
            .single();

          if (createError) throw createError;
          wId = newWishlist.id;
        }

        setWishlistId(wId);

        // Fetch wishlist items
        const { data: items, error: itemsError } = await supabase
          .from('wishlist_items')
          .select(`
            product_id,
            products:product_id (
              id, name, slug, description, price, sale_price, category_id, is_featured, is_new, is_best_seller, is_pre_order, rating, review_count
            )
          `)
          .eq('wishlist_id', wId);

        if (itemsError) throw itemsError;

        if (items) {
          const products = items.map((item: any) => item.products).filter(Boolean);
          setWishlistItems(products);
        }
      } catch (err) {
        console.error('Error fetching database wishlist:', err);
      }
    };

    fetchDatabaseWishlist();
  }, [user, isMockAuth, mounted]);

  const addToWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) return;

    setWishlistItems((prev) => [...prev, product]);

    if (user && !isMockAuth && wishlistId) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({ wishlist_id: wishlistId, product_id: product.id });

        if (error) throw error;
      } catch (err) {
        console.error('Error saving wishlist item to database:', err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));

    if (user && !isMockAuth && wishlistId) {
      try {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlistId)
          .eq('product_id', productId);

        if (error) throw error;
      } catch (err) {
        console.error('Error deleting wishlist item from database:', err);
      }
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
