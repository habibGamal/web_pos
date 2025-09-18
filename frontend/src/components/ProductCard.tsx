'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
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
  console.log('default variant', product.default_variant);
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
      'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] py-0',
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
            <Image
              src={resolveImageSrc(product.featured_image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isCompact ? '(max-width: 768px) 50vw, 25vw' : '(max-width: 768px) 100vw, 50vw'}
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {product.is_featured && (
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  {t('product.featured')}
                </Badge>
              )}
              {product.is_on_sale && product.discount_percentage && (
                <Badge variant="destructive" className="bg-red-500/90">
                  -{Math.round(product.discount_percentage)}%
                </Badge>
              )}
              {!product.is_in_stock && (
                <Badge variant="secondary" className="bg-gray-500/90">
                  {t('product.outOfStock')}
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            {showWishlist && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-2 right-2 z-10 h-8 w-8 bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-200',
                  isInWishlist && 'text-red-500 bg-white'
                )}
                onClick={handleAddToWishlist}
                disabled={isWishlistLoading}
              >
                <Heart className={cn(
                  'h-4 w-4 transition-all',
                  isInWishlist && 'fill-current'
                )} />
              </Button>
            )}
          </div>

          {/* Product Info */}
          <CardContent className={cn(
            'p-4',
            isCompact && 'p-3',
            isFeatured && 'p-6'
          )}>
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>{product.category.name}</span>
              <span>•</span>
              <span>{product.brand.name}</span>
            </div>

            {/* Product Name */}
            <h3 className={cn(
              'font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors',
              isCompact ? 'text-sm' : 'text-base',
              isFeatured && 'text-lg'
            )}>
              {product.name}
            </h3>

            {/* Description (only for featured variant) */}
            {isFeatured && product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                'font-bold text-primary',
                isCompact ? 'text-sm' : 'text-base',
                isFeatured && 'text-lg'
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
                  'w-full transition-all duration-200',
                  isCompact && 'h-8 text-xs'
                )}
                onClick={handleAddToCart}
                disabled={isCartLoading}
              >
                <ShoppingCart className={cn(
                  'w-4 h-4 mr-2',
                  isCompact && 'w-3 h-3 mr-1'
                )} />
                {isCartLoading ? t('product.adding') : t('product.addToCart')}
              </Button>
            )}

            {/* Out of Stock Button */}
            {showAddToCart && (!product.is_in_stock || !product.default_variant) && (
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                {!product.is_in_stock ? t('product.outOfStock') : t('product.unavailable')}
              </Button>
            )}
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}