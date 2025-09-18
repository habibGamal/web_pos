'use client';

import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

// TODO: Replace with actual GraphQL generated types when available
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  effective_price: number;
  discount_percentage?: number;
  is_featured: boolean;
  is_on_sale: boolean;
  is_in_stock: boolean;
  is_in_wishlist?: boolean;
  featured_image?: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
  columns?: 2 | 3 | 4 | 5;
  variant?: 'default' | 'compact' | 'featured';
  showAddToCart?: boolean;
  showWishlist?: boolean;
}

export function ProductGrid({
  products,
  isLoading = false,
  className,
  columns = 4,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
}: ProductGridProps) {
  const t = useTranslations();

  const gridColumns = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  };

  if (isLoading) {
    return (
      <div className={cn(
        'grid gap-6',
        gridColumns[columns],
        className
      )}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 7-7 7" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('product.noProductsFound')}
        </h3>
        <p className="text-gray-500 max-w-md">
          {t('product.noProductsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-6',
      gridColumns[columns],
      className
    )}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showAddToCart={showAddToCart}
          showWishlist={showWishlist}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'featured' }) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <div className="space-y-3">
      <Skeleton className={cn(
        'w-full bg-gray-200',
        isCompact ? 'aspect-square' : 'aspect-[4/3]',
        isFeatured && 'aspect-[3/2]'
      )} />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3 bg-gray-200" />
        <Skeleton className={cn(
          'w-full bg-gray-200',
          isCompact ? 'h-4' : 'h-5'
        )} />
        <Skeleton className="h-4 w-3/4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 bg-gray-200" />
          <Skeleton className="h-4 w-12 bg-gray-200" />
        </div>
        <Skeleton className={cn(
          'w-full bg-gray-200',
          isCompact ? 'h-7' : 'h-9'
        )} />
      </div>
    </div>
  );
}