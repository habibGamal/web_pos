'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Package,
  Heart,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImageWithFallback } from '@/components/ImageWithFallback';
import Link from 'next/link';
import type { CartItem } from '@/gql/graphql';

interface CartItemComponentProps {
  item: CartItem;
  isUpdating?: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onAddToWishlist?: (productId: string) => Promise<void>;
  showAddToWishlist?: boolean;
  className?: string;
}

export function CartItemComponent({
  item,
  isUpdating = false,
  onUpdateQuantity,
  onRemove,
  onAddToWishlist,
  showAddToWishlist = true,
  className
}: CartItemComponentProps) {
  const t = useTranslations('cartItem');
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // Should be dynamic based on locale
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setLocalQuantity(newQuantity);
    await onUpdateQuantity(item.id, newQuantity);
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setLocalQuantity(value);
  };

  const handleQuantityBlur = () => {
    const clampedQuantity = Math.max(1, Math.min(100, localQuantity));
    if (clampedQuantity !== item.quantity) {
      handleQuantityChange(clampedQuantity);
    }
  };

  const handleAddToWishlist = async () => {
    if (!onAddToWishlist) return;
    
    setIsWishlistLoading(true);
    try {
      await onAddToWishlist(item.product.id);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    }
  };

  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden", className)}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100">
              <ProductImageWithFallback
                src={item.product.featured_image}
                alt={item.product.name}
                className="object-cover"
              />
              
              {/* Availability overlay */}
              {!item.is_available && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-xs">
                    {t('outOfStock')}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  <Link 
                    href={`/products/${item.product.slug}`}
                    className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                  >
                    {item.product.name}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                </h3>
                
                {/* Variant Information */}
                {item.variant?.name && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('variant')}: {item.variant.name}
                  </p>
                )}
                
                {/* Selected Options */}
                {item.options && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(JSON.parse(item.options)).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {value as string}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {item.variant?.sku && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('sku')}: {item.variant.sku}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-4">
                {showAddToWishlist && onAddToWishlist && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddToWishlist}
                    disabled={isWishlistLoading}
                    className="text-gray-500 hover:text-red-500"
                    title={t('addToWishlist')}
                  >
                    <Heart className={cn("h-4 w-4", isWishlistLoading && "animate-pulse")} />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  disabled={isUpdating}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={t('removeItem')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(item.unit_price)}
              </span>
              
              {/* Sale indicator */}
              {item.product.sale_price && item.product.sale_price < item.product.price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(item.product.price)}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    {t('sale')}
                  </Badge>
                </div>
              )}
              
              {/* Stock warning */}
              {!item.is_available && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                  {t('limitedStock')}
                </Badge>
              )}
            </div>

            {/* Quantity Controls and Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-2">
                  {t('quantity')}:
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={isUpdating || item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={localQuantity}
                  onChange={handleQuantityInput}
                  onBlur={handleQuantityBlur}
                  disabled={isUpdating}
                  className="w-16 h-8 text-center text-sm"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={isUpdating || !item.is_available}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Line Total */}
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('lineTotal')}</p>
                <p className="font-semibold text-lg text-gray-900">
                  {formatPrice(item.total_price)}
                </p>
              </div>
            </div>

            {/* Stock warning message */}
            {!item.is_available && (
              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                {t('stockWarning')}
              </div>
            )}
            
            {/* Loading overlay */}
            {isUpdating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile or minimal layouts
interface CompactCartItemProps extends Omit<CartItemComponentProps, 'className'> {
  className?: string;
}

export function CompactCartItem({
  item,
  isUpdating = false,
  onUpdateQuantity,
  onRemove,
  className
}: CompactCartItemProps) {
  const t = useTranslations('cartItem');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const incrementQuantity = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-white border rounded", className)}>
      {/* Product Image */}
      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
        <ProductImageWithFallback
          src={item.product.featured_image}
          alt={item.product.name}
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-gray-600">
          {formatPrice(item.unit_price)} × {item.quantity}
        </p>
        {/* Selected Options */}
        {item.options && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(JSON.parse(item.options)).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-[10px] py-0 px-1">
                {key}: {value as string}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={decrementQuantity}
          disabled={isUpdating || item.quantity <= 1}
          className="h-6 w-6 p-0"
        >
          <Minus className="h-2 w-2" />
        </Button>
        
        <span className="text-sm font-medium w-6 text-center">
          {item.quantity}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={incrementQuantity}
          disabled={isUpdating}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-2 w-2" />
        </Button>
      </div>

      {/* Total and Remove */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">
          {formatPrice(item.total_price)}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}