'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Sparkles, TrendingUp, Heart, ShoppingBag, Star, Users } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const t = useTranslations();
  const [featuredProductsToShow, setFeaturedProductsToShow] = useState(8);
  const [onSaleProductsToShow, setOnSaleProductsToShow] = useState(8);

  // Get featured products
  const { products: featuredProducts, loading: featuredLoading } = useProducts({
    search: { is_featured: true },
    orderBy: [{ column: 'CREATED_AT', order: 'DESC' }],
    first: featuredProductsToShow,
  });

  // Get products on sale
  const { products: onSaleProducts, loading: onSaleLoading } = useProducts({
    search: { is_on_sale: true },
    orderBy: [{ column: 'CREATED_AT', order: 'DESC' }],
    first: onSaleProductsToShow,
  });

  // Get latest products
  const { products: latestProducts, loading: latestLoading } = useProducts({
    orderBy: [{ column: 'CREATED_AT', order: 'DESC' }],
    first: 8,
  });

  // Get popular categories
  const { categories, loading: categoriesLoading } = useCategories({
    parents_only: true,
  });

  // Get popular brands
  const { brands, loading: brandsLoading } = useBrands({
    parents_only: true,
  });

  const topCategories = categories.slice(0, 6);
  const topBrands = brands.slice(0, 8);
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 lg:py-24'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Hero Content */}
            <div className='space-y-8'>
              <div className='space-y-4'>
                <Badge variant='secondary' className='bg-primary/10 text-primary px-4 py-2'>
                  <Sparkles className='w-4 h-4 mr-2' />
                  {t('home.hero.badge')}
                </Badge>
                <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 leading-tight'>
                  {t('home.hero.title')}
                </h1>
                <p className='text-xl text-gray-600 leading-relaxed'>
                  {t('home.hero.description')}
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link href='/products'>
                  <Button size='lg' className='w-full sm:w-auto text-lg px-8 py-3'>
                    <ShoppingBag className='w-5 h-5 mr-2' />
                    {t('home.hero.shopNow')}
                  </Button>
                </Link>
                <Link href='/categories'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='w-full sm:w-auto text-lg px-8 py-3'
                  >
                    {t('home.hero.exploreCategories')}
                    <ArrowRight className='w-5 h-5 ml-2' />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-3 gap-4 pt-8'>
                <div className='text-center'>
                  <div className='text-2xl lg:text-3xl font-bold text-gray-900'>1000+</div>
                  <div className='text-sm text-gray-600'>{t('home.stats.products')}</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl lg:text-3xl font-bold text-gray-900'>50+</div>
                  <div className='text-sm text-gray-600'>{t('home.stats.brands')}</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl lg:text-3xl font-bold text-gray-900'>10k+</div>
                  <div className='text-sm text-gray-600'>{t('home.stats.customers')}</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className='relative'>
              <div className='aspect-square relative rounded-2xl overflow-hidden bg-white shadow-2xl'>
                <ImageWithFallback
                  src='/images/hero-shopping.jpg'
                  alt={t('home.hero.imageAlt')}
                  fill
                  className='object-cover'
                  priority
                  showFallbackIcon={false}
                />
              </div>

              {/* Floating elements */}
              <div className='absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg'>
                <Heart className='w-8 h-8 text-red-500' />
              </div>
              <div className='absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg'>
                <Star className='w-8 h-8 text-yellow-500' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
              {t('home.categories.title')}
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              {t('home.categories.description')}
            </p>
            and its nested components or provided missing keys
          </div>

          {categoriesLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='animate-pulse'>
                  <div className='aspect-square bg-gray-200 rounded-2xl mb-4'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mx-auto'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8'>
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className='group text-center'
                >
                  <div className='aspect-square relative rounded-2xl overflow-hidden bg-gray-50 mb-4 group-hover:scale-105 transition-transform duration-300'>
                    <ImageWithFallback
                      src='/images/placeholder-category.jpg'
                      alt={category.name}
                      className='object-cover'
                    />
                  </div>
                  <h3 className='font-semibold text-gray-900 group-hover:text-primary transition-colors'>
                    {category.name}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    {category.active_products_count} {t('common.products')}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className='text-center'>
            <Link href='/categories'>
              <Button variant='outline' size='lg'>
                {t('home.categories.viewAll')}
                <ArrowRight className='w-5 h-5 ml-2' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                <Sparkles className='w-8 h-8 inline mr-3 text-primary' />
                {t('home.featured.title')}
              </h2>
              <p className='text-xl text-gray-600'>{t('home.featured.description')}</p>
            </div>
            <Link href='/products?featured=true'>
              <Button variant='outline'>
                {t('common.viewAll')}
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={featuredProducts.map((product) => ({
              ...product,
              discount_percentage: product.discount_percentage ?? undefined,
              featured_image: product.featured_image ?? undefined,
              description: product.description ?? undefined,
            }))}
            isLoading={featuredLoading}
            columns={4}
            variant='default'
          />

          {featuredProducts.length >= featuredProductsToShow && (
            <div className='text-center mt-8'>
              <Button
                variant='outline'
                onClick={() => setFeaturedProductsToShow((prev) => prev + 8)}
                disabled={featuredLoading}
              >
                {t('common.loadMore')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Sale Products Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                <TrendingUp className='w-8 h-8 inline mr-3 text-red-500' />
                {t('home.sale.title')}
              </h2>
              <p className='text-xl text-gray-600'>{t('home.sale.description')}</p>
            </div>
            <Link href='/products?sale=true'>
              <Button variant='outline'>
                {t('common.viewAll')}
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={onSaleProducts.map((product) => ({
              ...product,
              discount_percentage: product.discount_percentage ?? undefined,
              featured_image: product.featured_image ?? undefined,
              description: product.description ?? undefined,
            }))}
            isLoading={onSaleLoading}
            columns={4}
            variant='default'
          />

          {onSaleProducts.length >= onSaleProductsToShow && (
            <div className='text-center mt-8'>
              <Button
                variant='outline'
                onClick={() => setOnSaleProductsToShow((prev) => prev + 8)}
                disabled={onSaleLoading}
              >
                {t('common.loadMore')}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Brands Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
              {t('home.brands.title')}
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              {t('home.brands.description')}
            </p>
          </div>

          {brandsLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className='animate-pulse'>
                  <div className='aspect-square bg-gray-200 rounded-xl mb-2'></div>
                  <div className='h-3 bg-gray-200 rounded w-3/4 mx-auto'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8'>
              {topBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands?brand=${brand.id}`}
                  className='group text-center'
                >
                  <div className='aspect-square relative rounded-xl overflow-hidden bg-white border-2 border-gray-100 mb-2 group-hover:border-primary group-hover:scale-105 transition-all duration-300'>
                    <ImageWithFallback
                      src='/images/placeholder-brand.jpg'
                      alt={brand.name}
                      className='object-cover p-4'
                    />
                  </div>
                  <h3 className='font-medium text-sm text-gray-900 group-hover:text-primary transition-colors'>
                    {brand.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          <div className='text-center'>
            <Link href='/brands'>
              <Button variant='outline' size='lg'>
                {t('home.brands.viewAll')}
                <ArrowRight className='w-5 h-5 ml-2' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                {t('home.latest.title')}
              </h2>
              <p className='text-xl text-gray-600'>{t('home.latest.description')}</p>
            </div>
            <Link href='/products'>
              <Button variant='outline'>
                {t('common.viewAll')}
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={latestProducts.map((product) => ({
              ...product,
              discount_percentage: product.discount_percentage ?? undefined,
              featured_image: product.featured_image ?? undefined,
              description: product.description ?? undefined,
            }))}
            isLoading={latestLoading}
            columns={4}
            variant='default'
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className='py-16 bg-primary text-white'>
        <div className='container mx-auto px-4 max-w-4xl text-center'>
          <div className='space-y-6'>
            <h2 className='text-3xl lg:text-4xl font-bold'>{t('home.newsletter.title')}</h2>
            <p className='text-xl opacity-90'>{t('home.newsletter.description')}</p>

            <div className='flex flex-col sm:flex-row gap-4 max-w-md mx-auto'>
              <input
                type='email'
                placeholder={t('home.newsletter.placeholder')}
                className='flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500'
              />
              <Button variant='secondary' size='lg' className='text-primary'>
                {t('home.newsletter.subscribe')}
              </Button>
            </div>

            <p className='text-sm opacity-75'>{t('home.newsletter.privacy')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
