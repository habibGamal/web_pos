'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  Package,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { resolveImageSrc } from '@/lib/image';

export default function CartPage() {
  const t = useTranslations();
  const router = useRouter();
  const { 
    cart, 
    cartItems, 
    isLoading, 
    error,
    totalItems,
    totalQuantity,
    totalPrice,
    isEmpty,
    updateCartItem,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    clearError
  } = useCart();
  console.log('is loading', isLoading, 'cart', cart, 'cartItems', cartItems);
  const [isUpdatingItems, setIsUpdatingItems] = useState<Record<string, boolean>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle quantity updates
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setIsUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      if (newQuantity === 0) {
        await removeFromCart({ cart_item_id: itemId });
      } else {
        await updateCartItem({ cart_item_id: itemId, quantity: newQuantity });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleIncrement = async (itemId: string) => {
    setIsUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      await incrementQuantity(itemId);
    } catch (error) {
      console.error('Failed to increment quantity:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDecrement = async (itemId: string) => {
    setIsUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      await decrementQuantity(itemId);
    } catch (error) {
      console.error('Failed to decrement quantity:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      await removeFromCart({ cart_item_id: itemId });
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Should be dynamic based on locale
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
              <Package className="h-5 w-5" />
              <h2 className="font-semibold">{t('cart.error.title')}</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearError}>
                {t('cart.error.dismiss')}
              </Button>
              <Button onClick={() => window.location.reload()}>
                {t('cart.error.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty cart state
  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('cart.empty.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {t('cart.empty.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {t('cart.empty.startShopping')}
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/wishlist">
                <Heart className="mr-2 h-5 w-5" />
                {t('cart.empty.viewWishlist')}
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
            {t('cart.backToShopping')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('cart.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('cart.itemCount', { count: totalItems, quantity: totalQuantity })}
          </p>
        </div>
        
        {cartItems.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('cart.clearCart')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
                      {item.product.featured_image ? (
                        <Image
                          src={resolveImageSrc(item.product.featured_image)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          <Link 
                            href={`/products/${item.product.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {item.variant.name && (
                          <p className="text-sm text-gray-600">
                            {t('cart.variant')}: {item.variant.name}
                          </p>
                        )}
                        {item.variant.sku && (
                          <p className="text-xs text-gray-500">
                            {t('cart.sku')}: {item.variant.sku}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdatingItems[item.id]}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Price and Availability */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.unit_price)}
                      </span>
                      {!item.is_available && (
                        <Badge variant="destructive" className="text-xs">
                          {t('cart.outOfStock')}
                        </Badge>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecrement(item.id)}
                          disabled={isUpdatingItems[item.id] || item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleQuantityChange(item.id, value);
                          }}
                          disabled={isUpdatingItems[item.id]}
                          className="w-16 text-center"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIncrement(item.id)}
                          disabled={isUpdatingItems[item.id]}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{t('cart.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>{t('cart.shipping')}</span>
                <span className="text-green-600">{t('cart.freeShipping')}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {t('cart.proceedToCheckout')}
                  </Link>
                </Button>
                
                <Button variant="outline" asChild size="lg" className="w-full">
                  <Link href="/products">
                    {t('cart.continueShopping')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('cart.clearConfirm.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                {t('cart.clearConfirm.message')}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                >
                  {t('cart.clearConfirm.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearCart}
                >
                  {t('cart.clearConfirm.confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}