'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useProducts } from '@/hooks/use-products';
import type { ProductOrderByColumn, SortOrder } from '@/gql/graphql';
import { ProductGrid } from '@/components/ProductGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, Grid, List, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
interface SearchFilters {
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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5>(4);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 24;
  
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');

  // Load initial filters from URL params
  useEffect(() => {
    setFilters({
      category_id: searchParams.get('category') || undefined,
      brand_id: searchParams.get('brand') || undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      is_featured: searchParams.get('featured') === 'true',
      is_on_sale: searchParams.get('sale') === 'true',
      in_stock_only: searchParams.get('in_stock') === 'true',
    });
  }, [searchParams]);

  const sortOptions: SortOption[] = [
    { 
      value: 'relevance', 
      label: t('search.sort.relevance'),
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

  // Create search filters for GraphQL
  const searchFilters = {
    ...searchQuery ? { keyword: searchQuery.trim() } : {},
    ...filters.category_id ? { category_id: filters.category_id } : {},
    ...filters.brand_id ? { brand_id: filters.brand_id } : {},
    ...filters.min_price ? { min_price: filters.min_price } : {},
    ...filters.max_price ? { max_price: filters.max_price } : {},
    ...filters.is_featured ? { is_featured: filters.is_featured } : {},
    ...filters.is_on_sale ? { is_on_sale: filters.is_on_sale } : {},
    ...filters.in_stock_only ? { in_stock_only: filters.in_stock_only } : {},
  };

  // Use GraphQL hook for products search
  const { products, loading: isLoading, paginatorInfo } = useProducts({
    search: Object.keys(searchFilters).length > 0 ? searchFilters : undefined,
    orderBy: currentSortOption.orderBy,
    first: perPage,
    page: currentPage,
    skip: !searchQuery.trim() && Object.keys(filters).every(key => !filters[key as keyof SearchFilters]),
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search query to recent searches when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      saveToRecentSearches(searchQuery.trim());
    }
  }, [searchQuery]);

  // TODO: Replace with actual GraphQL query for suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const loadSuggestions = async () => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Mock suggestions - replace with real GraphQL query
          setSuggestions([
            `${searchQuery} pro`,
            `${searchQuery} max`,
            `${searchQuery} plus`,
          ]);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
        }
      };

      const debounceTimer = setTimeout(loadSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const saveToRecentSearches = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== false && value !== ''
    ).length;
  };

  const hasSearched = searchQuery.trim().length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {hasSearched ? t('search.resultsFor', { query: searchQuery }) : t('search.searchProducts')}
        </h1>
        
        {/* Search Input */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('search.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-12 h-12 text-lg"
            />
            <Button
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-1 top-1 bottom-1 px-4"
            >
              {t('search.search')}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (searchQuery.length > 0 || recentSearches.length > 0) && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
              <CardContent className="p-0">
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t('search.suggestions')}
                    </h4>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    {suggestions.length > 0 && <Separator />}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          {t('search.recentSearches')}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          {t('search.clear')}
                        </Button>
                      </div>
                      {recentSearches.map((recent, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(recent)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{recent}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {hasSearched && (
        <>
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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

              <span className="text-sm text-gray-600">
                {isLoading 
                  ? t('search.searching') 
                  : t('search.resultsCount', { count: products.length })
                }
              </span>
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

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-64 flex-shrink-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      {t('product.filters')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

            {/* Search Results */}
            <div className="flex-1">
              {!hasSearched ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('search.startSearching')}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {t('search.startSearchingDescription')}
                  </p>
                </div>
              ) : (
                <ProductGrid
                  products={products.map(product => ({
                    ...product,
                    discount_percentage: product.discount_percentage ?? undefined,
                    featured_image: product.featured_image ?? undefined,
                    description: product.description ?? undefined,
                  }))}
                  isLoading={isLoading}
                  columns={gridColumns}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}