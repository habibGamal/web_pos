'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { ProductImageWithFallback } from '@/components/ImageWithFallback';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { resolveImageSrc } from '@/lib/image';
import { useQuickCartActions } from '@/hooks/use-cart';
import { useWishlistActions, useWishlistStatus } from '@/hooks/use-wishlist';

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
  default_variant?: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  className?: string;
  showAddToCart?: boolean;
  showWishlist?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({
  product,
  className,
  showAddToCart = true,
  showWishlist = true,
  variant = 'default',
}: ProductCardProps) {
  const t = useTranslations();
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Cart and wishlist hooks
  const { addOrUpdateCart } = useQuickCartActions();
  const { toggleWishlist } = useWishlistActions();
  const { isInWishlist } = useWishlistStatus(product.id);
  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlistLoading(true);
    try {
      await toggleWishlist(product.id);
      // Show success notification if needed
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // Show error notification if needed
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsCartLoading(true);
    try {
      // Use the first variant or a default variant ID
      // In a real scenario, you might want to get the default variant from product data
      const defaultVariantId = product.default_variant!.id;
      await addOrUpdateCart(defaultVariantId, 1);
      // Show success notification if needed
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error notification if needed
    } finally {
      setIsCartLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300',
      // Mobile-first hover states - only scale on larger screens
      'hover:shadow-lg sm:hover:scale-[1.02] py-0',
      // Better mobile touch feedback
      'active:scale-[0.98] sm:active:scale-[1.02]',
      isCompact && 'h-auto',
      isFeatured && 'border-primary/20 shadow-md',
      className
    )}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative">
          {/* Product Image */}
          <div className={cn(
            'relative overflow-hidden bg-gray-50',
            isCompact ? 'aspect-square' : 'aspect-[4/3]',
            isFeatured && 'aspect-[3/2]'
          )}>
            <ProductImageWithFallback
              src={resolveImageSrc(product.featured_image)}
              alt={product.name}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={
                isCompact 
                  ? '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw'
                  : '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
              }
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            
            {/* Badges */}
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 flex flex-col gap-0.5 sm:gap-1">
              {product.is_featured && (
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">{t('product.featured')}</span>
                  <span className="sm:hidden">★</span>
                </Badge>
              )}
              {product.is_on_sale && product.discount_percentage && (
                <Badge variant="destructive" className="bg-red-500/90 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 font-bold">
                  -{Math.round(product.discount_percentage)}%
                </Badge>
              )}
              {!product.is_in_stock && (
                <Badge variant="secondary" className="bg-gray-500/90 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                  <span className="hidden sm:inline">{t('product.outOfStock')}</span>
                  <span className="sm:hidden">OOS</span>
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            {showWishlist && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  // Better touch targets for mobile
                  'absolute top-1 right-1 sm:top-2 sm:right-2 z-10',
                  'h-7 w-7 sm:h-8 sm:w-8',
                  'bg-white/80 hover:bg-white active:bg-white/90',
                  'text-gray-600 hover:text-red-500 active:text-red-600',
                  'transition-all duration-200',
                  // Enhanced mobile tap feedback
                  'touch-manipulation',
                  isInWishlist && 'text-red-500 bg-white'
                )}
                onClick={handleAddToWishlist}
                disabled={isWishlistLoading}
              >
                <Heart className={cn(
                  'h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all',
                  isInWishlist && 'fill-current'
                )} />
              </Button>
            )}
          </div>

          {/* Product Info */}
          <CardContent className={cn(
            // Mobile-first padding with responsive scaling
            'p-3 sm:p-4',
            // Compact variant gets smaller padding on mobile
            isCompact && 'p-2 sm:p-3',
            // Featured variant gets more generous padding
            isFeatured && 'p-4 sm:p-6'
          )}>
            {/* Category & Brand */}
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-2">
              <span className="truncate max-w-[80px] sm:max-w-none">{product.category.name}</span>
              <span className="text-xs opacity-60">•</span>
              <span className="truncate max-w-[80px] sm:max-w-none">{product.brand.name}</span>
            </div>

            {/* Product Name */}
            <h3 className={cn(
              'font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors',
              // Mobile-first responsive text sizing with better line height
              'text-sm leading-tight sm:text-base sm:leading-normal',
              // Compact variant stays smaller but readable
              isCompact && 'text-xs sm:text-sm leading-tight',
              // Featured variant gets larger text
              isFeatured && 'text-base sm:text-lg leading-normal'
            )}>
              {product.name}
            </h3>

            {/* Description (only for featured variant) */}
            {isFeatured && product.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
              <span className={cn(
                'font-bold text-primary',
                // Mobile-first pricing typography
                'text-sm sm:text-base',
                // Compact variant pricing
                isCompact && 'text-xs sm:text-sm',
                // Featured variant pricing
                isFeatured && 'text-base sm:text-lg'
              )}>
                {formatPrice(product.effective_price)}
              </span>
              {product.is_on_sale && product.price !== product.effective_price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            {showAddToCart && product.is_in_stock && product.default_variant && (
              <Button
                className={cn(
                  'w-full transition-all duration-200 touch-manipulation',
                  // Mobile-first button sizing
                  'h-8 sm:h-9 text-xs sm:text-sm',
                  // Compact variant gets smaller button
                  isCompact && 'h-7 sm:h-8 text-xs',
                  // Featured variant gets larger button
                  isFeatured && 'h-9 sm:h-10 text-sm sm:text-base'
                )}
                onClick={handleAddToCart}
                disabled={isCartLoading}
              >
                <ShoppingCart className={cn(
                  'w-3 h-3 sm:w-4 sm:h-4',
                  'mr-1 sm:mr-2',
                  isCompact && 'w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1'
                )} />
                {/* Mobile-friendly button text */}
                <span className="hidden sm:inline">
                  {isCartLoading ? t('product.adding') : t('product.addToCart')}
                </span>
                <span className="sm:hidden">
                  {isCartLoading ? t('product.adding') : 'Add'}
                </span>
              </Button>
            )}

            {/* Out of Stock Button */}
            {showAddToCart && (!product.is_in_stock || !product.default_variant) && (
              <Button
                variant="outline"
                className={cn(
                  'w-full',
                  // Mobile-first button sizing
                  'h-8 sm:h-9 text-xs sm:text-sm',
                  isCompact && 'h-7 sm:h-8 text-xs',
                  isFeatured && 'h-9 sm:h-10 text-sm sm:text-base'
                )}
                disabled
              >
                {/* Mobile-friendly text */}
                <span className="hidden sm:inline">
                  {!product.is_in_stock ? t('product.outOfStock') : t('product.unavailable')}
                </span>
                <span className="sm:hidden">
                  {!product.is_in_stock ? 'OOS' : 'N/A'}
                </span>
              </Button>
            )}
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}