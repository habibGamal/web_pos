'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProduct, useProducts } from '@/hooks/use-products';
import { useQuickCartActions } from '@/hooks/use-cart';
import { useWishlistActions, useWishlistStatus } from '@/hooks/use-wishlist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Heart, ShoppingCart, Share2, Star, Truck, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { ProductImageWithFallback } from '@/components/ImageWithFallback';
import Link from 'next/link';
import { ProductGrid } from '@/components/ProductGrid';
import { cn } from '@/lib/utils';
import { resolveImageSrc } from '@/lib/image';
export default function ProductDetailPage() {
  const params = useParams();
  const t = useTranslations();
  const productSlug = params.id as string;
  
  // Use GraphQL hooks for data fetching
  const { product, loading: isLoading, error } = useProduct({ 
    slug: productSlug 
  });
  
  // Get related products from same category
  const { products: relatedProducts } = useProducts({
    search: product ? {
      category_id: product.category?.id,
    } : undefined,
    first: 8,
    skip: !product,
  });
  
  // Cart and wishlist hooks
  const { addOrUpdateCart } = useQuickCartActions();
  const { toggleWishlist } = useWishlistActions();
  const { isInWishlist } = useWishlistStatus(product?.id || '');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants?.length && !selectedVariant) {
      const defaultVariant = product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product, selectedVariant]);

  const handleVariantChange = (variantId: string) => {
    const variant = product?.variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxQuantity = selectedVariant?.quantity || 0;
    
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (error) {
    console.error('Product query error:', error);
  }

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validate required options
    if (product.options && product.options.length > 0) {
      const missingOptions = product.options.filter(
        (option: any) => option.is_required && !selectedOptions[option.name]
      );
      
      if (missingOptions.length > 0) {
        // Show error notification
        console.error('Please select all required options');
        return;
      }
    }
    
    setIsAddingToCart(true);
    try {
      // Pass options to cart
      await addOrUpdateCart(
        product.id, 
        quantity, 
        Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
      );
      // Show success notification if needed
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Show error notification if needed
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    
    setIsAddingToWishlist(true);
    try {
      await toggleWishlist(product.id);
      // Show success notification if needed
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      // Show error notification if needed
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };
  const currentImages = selectedVariant?.images?.length 
    ? selectedVariant.images 
    : product?.images || [];

  const currentPrice = selectedVariant?.effective_price || product?.effective_price || 0;
  const originalPrice = selectedVariant?.price || product?.price || 0;
  const isOnSale = currentPrice < originalPrice;
  const discountPercentage = isOnSale 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('product.notFound')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('product.notFoundDescription')}
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('product.backToProducts')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">
          {t('common.home')}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          {t('product.products')}
        </Link>
        <span>/</span>
        <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
            <ProductImageWithFallback
              src={resolveImageSrc(currentImages[selectedImageIndex])}
              alt={product.name}
              className="object-cover"
              priority
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.is_featured && (
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  {t('product.featured')}
                </Badge>
              )}
              {isOnSale && (
                <Badge variant="destructive" className="bg-red-500/90">
                  -{discountPercentage}%
                </Badge>
              )}
              {!product.is_in_stock && (
                <Badge variant="secondary" className="bg-gray-500/90">
                  {t('product.outOfStock')}
                </Badge>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          {currentImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {currentImages.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "aspect-square relative overflow-hidden rounded-md bg-gray-50 border-2 transition-colors",
                    selectedImageIndex === index 
                      ? "border-primary" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <ProductImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link href={`/brands/${product.brand.slug}`} className="hover:text-primary">
                {product.brand.name}
              </Link>
              <span>•</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
              {isOnSale && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {t('product.selectVariant')}
              </Label>
              <Select
                value={selectedVariant?.id || product.variants[0]?.id}
                onValueChange={handleVariantChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('product.selectVariant')} />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{variant.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatPrice(variant.effective_price)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Product Options */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4">
              {product.options.map((option: any) => (
                <div key={option.id} className="space-y-2">
                  <Label className="text-base font-medium">
                    {option.name}
                    {option.is_required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Select
                    value={selectedOptions[option.name] || ''}
                    onValueChange={(value) => setSelectedOptions(prev => ({
                      ...prev,
                      [option.name]: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`${t('product.select')} ${option.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {option.values.map((value: string) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-base font-medium">
                {t('product.quantity')}
              </Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-3"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedVariant?.quantity || 0)}
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                {selectedVariant?.quantity || 0} {t('product.available')}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart || 
                  !product.is_in_stock ||
                  (product.options && product.options.some((opt: any) => 
                    opt.is_required && !selectedOptions[opt.name]
                  ))
                }
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAddingToCart ? t('product.adding') : t('product.addToCart')}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                size="lg"
                className="px-4"
              >
                <Heart className={cn(
                  "w-5 h-5 transition-all",
                  isInWishlist ? "fill-current text-red-500" : "text-gray-400 hover:text-red-500"
                )} />
              </Button>
              
              <Button variant="outline" size="lg" className="px-4">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-green-600" />
              <span>{t('product.freeShipping')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>{t('product.warranty')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">
            {t('product.description')}
          </TabsTrigger>
          <TabsTrigger value="specifications">
            {t('product.specifications')}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {t('product.reviews')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {product.description ? (
                <div className="prose max-w-none">
                  {product.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {t('product.noDescription')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">{t('product.brand')}</span>
                  <span>{product.brand.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="font-medium">{t('product.category')}</span>
                  <span>{product.category.name}</span>
                </div>
                {selectedVariant?.sku && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium">{t('product.sku')}</span>
                    <span>{selectedVariant.sku}</span>
                  </div>
                )}
                {product.options && product.options.length > 0 && (
                  <>
                    <div className="py-2">
                      <span className="font-semibold text-gray-900">{t('product.availableOptions')}</span>
                    </div>
                    {product.options.map((option: any) => (
                      <div key={option.id} className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">{option.name}</span>
                        <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                          {option.values.map((value: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 italic text-center py-8">
                {t('product.noReviews')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('product.relatedProducts')}
          </h2>
          <ProductGrid
            products={relatedProducts.map(product => ({
              ...product,
              discount_percentage: product.discount_percentage ?? undefined,
              featured_image: product.featured_image ?? undefined,
              description: product.description ?? undefined,
            }))}
            columns={4}
            className="mb-8"
          />
        </div>
      )}
    </div>
  );
}