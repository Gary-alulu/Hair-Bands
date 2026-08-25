'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  
  // Detect route categories
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCheckoutRoute = pathname?.startsWith('/checkout');
  
  // Show standard header/footer for regular customer pages
  const showCustomerLayout = !isAdminRoute;

  return (
    <div className="min-h-screen flex flex-col">
      {showCustomerLayout && <Navbar />}
      
      <main className="flex-grow">
        {children}
      </main>

      {showCustomerLayout && !isCheckoutRoute && <Footer />}
      {showCustomerLayout && <MobileNav />}
      {showCustomerLayout && <CartDrawer />}
    </div>
  );
};
export default ClientShell;
