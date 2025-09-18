'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useBrands } from '@/hooks/use-brands';
import { useProducts } from '@/hooks/use-products';
import type { ProductOrderByColumn, SortOrder } from '@/gql/graphql';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid, List, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { resolveImageSrc } from '@/lib/image';
interface SortOption {
  value: string;
  label: string;
}

interface ProductSortOption {
  value: string;
  label: string;
  orderBy: Array<{ column: ProductOrderByColumn; order: SortOrder }>;
}

export default function BrandsPage() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'brands' | 'products'>('brands');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState('name_asc');
  const [productSortBy, setProductSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 24;

  const sortOptions: SortOption[] = [
    { 
      value: 'name_asc', 
      label: t('brand.sort.nameAtoZ')
    },
    { 
      value: 'name_desc', 
      label: t('brand.sort.nameZtoA')
    },
    { 
      value: 'products_count_desc', 
      label: t('brand.sort.mostProducts')
    },
    { 
      value: 'products_count_asc', 
      label: t('brand.sort.leastProducts')
    },
  ];

  const productSortOptions: ProductSortOption[] = [
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
  const currentProductSortOption = productSortOptions.find(option => option.value === productSortBy) || productSortOptions[0];

  // Use GraphQL hooks for data fetching
  const { brands, loading: brandsLoading } = useBrands({
    is_active: true,
    parents_only: false,
  });

  // Get products for selected brand
  const { products, loading: productsLoading } = useProducts({
    search: selectedBrandId ? {
      brand_id: selectedBrandId,
    } : undefined,
    orderBy: currentProductSortOption.orderBy,
    first: perPage,
    page: currentPage,
    skip: !selectedBrandId,
  });

  const selectedBrand = brands.find(brand => brand.id === selectedBrandId);
  const isLoading = brandsLoading;
  const isProductsLoading = productsLoading;

  const handleBrandClick = (brandId: string) => {
    setSelectedBrandId(brandId);
    setViewMode('products');
    setCurrentPage(1);
  };

  // Client-side filtering and sorting since API doesn't support it
  const filteredAndSortedBrands = brands
    .filter(brand => 
      searchQuery === '' || 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'products_count_desc':
          return b.active_products_count - a.active_products_count;
        case 'products_count_asc':
          return a.active_products_count - b.active_products_count;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {viewMode === 'brands' ? t('brand.allBrands') : selectedBrand?.name}
        </h1>
        <p className="text-gray-600">
          {viewMode === 'brands' 
            ? t('brand.browseOurBrands') 
            : t('brand.browseProductsFrom', { brandName: selectedBrand?.name || '' })
          }
        </p>
      </div>

      {/* Breadcrumb for product view */}
      {viewMode === 'products' && selectedBrand && (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">
            {t('common.home')}
          </Link>
          <span>/</span>
          <button 
            onClick={() => setViewMode('brands')}
            className="hover:text-primary"
          >
            {t('brand.brands')}
          </button>
          <span>/</span>
          <span className="text-gray-900">{selectedBrand.name}</span>
        </nav>
      )}

      {viewMode === 'brands' ? (
        <>
          {/* Search and Filter Controls */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('brand.searchBrands')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
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
            </div>
          </div>

          {/* Brands Grid */}
          {filteredAndSortedBrands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? t('brand.noBrandsFound') : t('brand.noBrands')}
              </h3>
              <p className="text-gray-500 max-w-md">
                {searchQuery 
                  ? t('brand.tryDifferentSearch') 
                  : t('brand.noBrandsDescription')
                }
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="mt-4"
                >
                  {t('brand.clearSearch')}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredAndSortedBrands.map((brand) => (
                <Card
                  key={brand.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] py-0"
                  onClick={() => handleBrandClick(brand.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={resolveImageSrc(brand.display_image)}
                        alt={brand.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    {brand.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {brand.active_products_count} {t('brand.products')}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button and Brand Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => { setViewMode('brands'); setSelectedBrandId(null); }}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {t('brand.backToBrands')}
            </Button>
            
            {selectedBrand && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={'/images/placeholder-brand.jpg'}
                    alt={selectedBrand.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedBrand.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedBrand.active_products_count} {t('brand.products')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product Controls */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-900">
                {t('brand.products')} ({selectedBrand?.active_products_count || 0})
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {productSortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View mode toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={productViewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setProductViewMode('grid')}
                  className="px-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={productViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setProductViewMode('list')}
                  className="px-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Grid columns (only for grid view) */}
              {productViewMode === 'grid' && (
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
            isLoading={isProductsLoading}
            columns={gridColumns}
            variant={productViewMode === 'list' ? 'compact' : 'default'}
          />
        </>
      )}
    </div>
  );
}