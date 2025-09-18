'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import type { ProductOrderByColumn, SortOrder } from '@/gql/graphql';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFilters {
  query?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  is_on_sale?: boolean;
  in_stock_only?: boolean;
}

interface SortOption {
  value: string;
  label: string;
  orderBy: Array<{ column: ProductOrderByColumn; order: SortOrder }>;
}

export default function ProductsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 24;
  
  const [filters, setFilters] = useState<ProductFilters>({
    query: searchParams.get('search') || undefined,
    category_id: searchParams.get('category') || undefined,
    brand_id: searchParams.get('brand') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    is_featured: searchParams.get('featured') === 'true',
    is_on_sale: searchParams.get('sale') === 'true',
    in_stock_only: searchParams.get('in_stock') === 'true',
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

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

  // Use hooks for data fetching
  const { products, paginatorInfo, loading: productsLoading, error: productsError } = useProducts({
    first: perPage,
    page: currentPage,
    search: {
      query: filters.query,
      category_id: filters.category_id,
      brand_id: filters.brand_id,
      min_price: filters.min_price,
      max_price: filters.max_price,
      is_featured: filters.is_featured,
      is_on_sale: filters.is_on_sale,
      in_stock_only: filters.in_stock_only,
    },
    orderBy: currentSortOption.orderBy,
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setFilters(prev => ({
      ...prev,
      min_price: values[0] > 0 ? values[0] : undefined,
      max_price: values[1] < 10000 ? values[1] : undefined,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 10000]);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== false && value !== ''
    ).length;
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  if (productsError) {
    console.error('Products query error:', productsError);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('product.allProducts')}
        </h1>
        <p className="text-gray-600">
          {t('product.browseOurCollection')}
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        {/* Left side - Filters toggle and active filters */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('product.filters')}
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>

          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              {t('product.clearFilters')}
            </Button>
          )}
        </div>

        {/* Right side - View controls and sort */}
        <div className="flex items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-sm">
              {t('product.sortBy')}:
            </Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger id="sort" className="w-48">
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

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  {t('product.filters')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                    {t('product.search')}
                  </Label>
                  <Input
                    id="search"
                    placeholder={t('product.searchPlaceholder')}
                    value={filters.query || ''}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                  />
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    {t('product.categories')}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category: any) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.category_id === category.id}
                          onCheckedChange={(checked) => {
                            handleFilterChange('category_id', checked ? category.id : undefined);
                          }}
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-sm font-normal flex-1 cursor-pointer"
                        >
                          {t('product.categoryLabel', { name: category.name, count: category.active_products_count })}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Brands */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    {t('product.brands')}
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand: any) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={filters.brand_id === brand.id}
                          onCheckedChange={(checked) => {
                            handleFilterChange('brand_id', checked ? brand.id : undefined);
                          }}
                        />
                        <Label
                          htmlFor={`brand-${brand.id}`}
                          className="text-sm font-normal flex-1 cursor-pointer"
                        >
                          {t('product.brandLabel', { name: brand.name, count: brand.active_products_count })}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    {t('product.priceRange')}
                  </Label>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceRangeChange}
                      max={10000}
                      min={0}
                      step={50}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{t('product.currency')} {priceRange[0]}</span>
                      <span>{t('product.currency')} {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Product Status Filters */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    {t('product.productStatus')}
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.is_featured || false}
                        onCheckedChange={(checked) => handleFilterChange('is_featured', checked)}
                      />
                      <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                        {t('product.featured')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="on-sale"
                        checked={filters.is_on_sale || false}
                        onCheckedChange={(checked) => handleFilterChange('is_on_sale', checked)}
                      />
                      <Label htmlFor="on-sale" className="text-sm font-normal cursor-pointer">
                        {t('product.onSale')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={filters.in_stock_only || false}
                        onCheckedChange={(checked) => handleFilterChange('in_stock_only', checked)}
                      />
                      <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                        {t('product.inStockOnly')}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid
            products={products.map(product => ({
              ...product,
              discount_percentage: product.discount_percentage ?? undefined,
              featured_image: product.featured_image ?? undefined,
              description: product.description ?? undefined,
            }))}
            isLoading={productsLoading}
            columns={gridColumns}
            variant={viewMode === 'list' ? 'compact' : 'default'}
          />
        </div>
      </div>
    </div>
  );
}