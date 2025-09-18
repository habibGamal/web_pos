'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCategory } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import type { ProductOrderByColumn, SortOrder } from '@/gql/graphql';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Grid, List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
interface SortOption {
  value: string;
  label: string;
  orderBy: Array<{ column: ProductOrderByColumn; order: SortOrder }>;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const categorySlug = params.slug as string;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 24;

  // Use GraphQL hooks for data fetching
  const { category, loading: categoryLoading, error: categoryError } = useCategory({ 
    slug: categorySlug 
  });

  const sortOptions: SortOption[] = [
    { 
      value: 'featured', 
      label: t('product.sort.featured'),
      orderBy: [{ column: 'IS_FEATURED', order: 'DESC' }, { column: 'CREATED_AT', order: 'DESC' }]
    },
    { 
      value: 'newest', 
      label: t('product.sort.newest'),
      orderBy: [{ column: 'CREATED_AT', order: 'DESC' }]
    },
    { 
      value: 'price_asc', 
      label: t('product.sort.priceLowToHigh'),
      orderBy: [{ column: 'PRICE', order: 'ASC' }]
    },
    { 
      value: 'price_desc', 
      label: t('product.sort.priceHighToLow'),
      orderBy: [{ column: 'PRICE', order: 'DESC' }]
    },
    { 
      value: 'name_asc', 
      label: t('product.sort.nameAtoZ'),
      orderBy: [{ column: 'NAME_EN', order: 'ASC' }]
    },
    { 
      value: 'name_desc', 
      label: t('product.sort.nameZtoA'),
      orderBy: [{ column: 'NAME_EN', order: 'DESC' }]
    },
  ];

  const currentSortOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0];

  // Get products for this category
  const { products, loading: productsLoading, paginatorInfo } = useProducts({
    search: category ? {
      category_id: category.id,
    } : undefined,
    orderBy: currentSortOption.orderBy,
    first: perPage,
    page: currentPage,
    skip: !category,
  });

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  if (categoryError) {
    console.error('Category query error:', categoryError);
  }

  const isLoading = categoryLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-48 bg-gray-200 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[4/3] bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('category.notFound')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('category.notFoundDescription')}
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
        {category.parent && (
          <>
            <span>/</span>
            <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary">
              {category.parent.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <Image
            src={category.display_image || '/images/placeholder-category.jpg'}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                  {category.description}
                </p>
              )}
              <div className="mt-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {category.active_products_count} {t('category.products')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('category.subcategories')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {category.children.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${subcategory.slug}`}
                className="group"
              >
                <Card className="transition-all duration-200 hover:shadow-md hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={'/images/placeholder-category.jpg'}
                        alt={subcategory.name}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {subcategory.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {subcategory.active_products_count} {t('category.products')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('category.allProducts')} ({category.active_products_count})
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Grid columns (only for grid view) */}
          {viewMode === 'grid' && (
            <Select value={gridColumns.toString()} onValueChange={(value: string) => setGridColumns(Number(value) as 2 | 3 | 4 | 5)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={products.map(product => ({
          ...product,
          discount_percentage: product.discount_percentage ?? undefined,
          featured_image: product.featured_image ?? undefined,
          description: product.description ?? undefined,
        }))}
        isLoading={false}
        columns={gridColumns}
        variant={viewMode === 'list' ? 'compact' : 'default'}
      />
    </div>
  );
}