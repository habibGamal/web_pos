'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ArrowLeft,
  Package,
  Plus,
  Star,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const router = useRouter();
  const { 
    wishlistItems, 
    wishlistCount,
    isLoading, 
    error,
    removeFromWishlist,
    moveToCart,
    clearError
  } = useWishlist();

  const { getCartItemByVariant } = useCart();

  const [isUpdatingItems, setIsUpdatingItems] = useState<Record<string, boolean>>({});
  const [moveToCartQuantities, setMoveToCartQuantities] = useState<Record<string, number>>({});

  // Handle removing items from wishlist
  const handleRemoveFromWishlist = async (productId: string) => {
    setIsUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      await removeFromWishlist({ product_id: productId });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Handle moving item to cart
  const handleMoveToCart = async (item: any) => {
    const productId = item.product_id;
    const variantId = item.product.default_variant?.id;
    
    if (!variantId) {
      console.error('No default variant found for product');
      return;
    }

    setIsUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const quantity = moveToCartQuantities[productId] || 1;
      await moveToCart(productId, variantId, quantity);
      
      // Reset quantity input
      setMoveToCartQuantities(prev => ({ ...prev, [productId]: 1 }));
    } catch (error) {
      console.error('Failed to move to cart:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Should be dynamic based on locale
    }).format(price);
  };

  const getQuantityForProduct = (productId: string) => {
    return moveToCartQuantities[productId] || 1;
  };

  const setQuantityForProduct = (productId: string, quantity: number) => {
    setMoveToCartQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(100, quantity))
    }));
  };

  // Check if product variant is already in cart
  const isInCart = (item: any) => {
    const variantId = item.product.default_variant?.id;
    return variantId ? getCartItemByVariant(variantId) !== null : false;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <Heart className="h-5 w-5" />
              <h2 className="font-semibold">{t('error.title')}</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearError}>
                {t('error.dismiss')}
              </Button>
              <Button onClick={() => window.location.reload()}>
                {t('error.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('empty.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {t('empty.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/products">
                <Package className="mr-2 h-5 w-5" />
                {t('empty.startShopping')}
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('empty.viewCart')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToShopping')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('itemCount', { count: wishlistCount })}
          </p>
        </div>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              {/* Product Image */}
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                {item.product.featured_image ? (
                  <Image
                    src={item.product.featured_image}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Remove from wishlist button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                  disabled={isUpdatingItems[item.product_id]}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Badges */}
                <div className="absolute top-2 left-2 space-y-1">
                  {item.product.sale_price && item.product.sale_price < item.product.price && (
                    <Badge variant="destructive" className="text-xs">
                      {t('onSale')}
                    </Badge>
                  )}
                  {!item.product.is_in_stock && (
                    <Badge variant="secondary" className="text-xs">
                      {t('outOfStock')}
                    </Badge>
                  )}
                </div>

                {/* Quick view button */}
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                >
                  <Link href={`/products/${item.product.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Product Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                  <Link 
                    href={`/products/${item.product.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                </h3>
                
                {/* Category and Brand */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  {item.product.category && (
                    <span>{item.product.category.name}</span>
                  )}
                  {item.product.category && item.product.brand && (
                    <span>•</span>
                  )}
                  {item.product.brand && (
                    <span>{item.product.brand.name}</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(item.product.effective_price)}
                  </span>
                  {item.product.sale_price && item.product.sale_price < item.product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(item.product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Quantity selector and move to cart */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantityForProduct(
                        item.product_id, 
                        getQuantityForProduct(item.product_id) - 1
                      )}
                      disabled={getQuantityForProduct(item.product_id) <= 1}
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={getQuantityForProduct(item.product_id)}
                      onChange={(e) => setQuantityForProduct(
                        item.product_id, 
                        parseInt(e.target.value) || 1
                      )}
                      className="w-16 text-center text-sm"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantityForProduct(
                        item.product_id, 
                        getQuantityForProduct(item.product_id) + 1
                      )}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Move to cart button */}
                <Button
                  onClick={() => handleMoveToCart(item)}
                  disabled={
                    isUpdatingItems[item.product_id] || 
                    !item.product.is_in_stock ||
                    !item.product.default_variant
                  }
                  className="w-full"
                  variant={isInCart(item) ? "outline" : "default"}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isInCart(item) 
                    ? t('updateCart') 
                    : t('moveToCart')
                  }
                </Button>

                {/* Added to wishlist date */}
                <p className="text-xs text-gray-500 text-center">
                  {t('addedOn', { 
                    date: new Date(item.created_at).toLocaleDateString() 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Shopping */}
      <div className="mt-12 text-center">
        <Button asChild size="lg" variant="outline">
          <Link href="/products">
            <Package className="mr-2 h-5 w-5" />
            {t('continueShopping')}
          </Link>
        </Button>
      </div>
    </div>
  );
}