'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  category_id: string;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_pre_order: boolean;
  rating: number;
  review_count: number;
  image_url?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  length: string | null;
  density: string | null;
  lace_type: string | null;
  color: string | null;
  price_adjustment: number;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Constants
  const deliveryFee = 500; // Standard premium delivery fee in KSh
  const discount = 0; // Can be linked to coupons later

  // Avoid SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem('luxury_hair_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error('Error loading cart from local storage:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('luxury_hair_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.variant.id === variant.id
      );

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      // Add new item
      return [...prevItems, { product, variant, quantity }];
    });
    
    // Automatically open the cart drawer when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.variant.id !== variantId)
    );
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate pricing
  const subtotal = cartItems.reduce((acc, item) => {
    const basePrice = item.product.sale_price !== null ? item.product.sale_price : item.product.price;
    const finalItemPrice = Number(basePrice) + Number(item.variant.price_adjustment);
    return acc + finalItemPrice * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        discount,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
