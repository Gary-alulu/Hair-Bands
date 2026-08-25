'use client';

import React, { use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ShopPage from '../page';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

function CategoryWrapper({ params }: CategoryPageProps) {
  const { category } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validate category slug
  const validCategories = ['wigs', 'hair-products', 'extensions', 'accessories'];
  if (!validCategories.includes(category)) {
    // Fallback to main shop page
    router.replace('/shop');
    return null;
  }

  // Force rendering ShopPage, but the page itself will read category from URL or context.
  // To keep dynamic urls correct, we check if URL matches the category param.
  // We can let ShopPage mount, which handles its own state.
  return <ShopPage />;
}

export default function ShopCategoryPage({ params }: CategoryPageProps) {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs tracking-widest uppercase font-semibold">Loading Collection...</div>}>
      <CategoryWrapper params={params} />
    </Suspense>
  );
}
