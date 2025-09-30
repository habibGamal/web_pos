<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Scout\Searchable;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class SearchQuery
{
    /**
     * Search products with text-based search.
     */
    public function __invoke($root, array $args, GraphQLContext $context): Builder
    {
        $searchQuery = $args['query'];

        // Start with a base query for active products
        $query = Product::query()
            ->with(['category', 'brand', 'variants'])
            ->where('is_active', true);

        // Apply text search
        $hasCustomOrdering = isset($args['orderBy']);
        $this->applyTextSearch($query, $searchQuery, $hasCustomOrdering);

        // Apply additional filters
        if (isset($args['filters'])) {
            $this->applySearchFilters($query, $args['filters']);
        }

        // Apply ordering - this must come AFTER all other query modifications
        if ($hasCustomOrdering) {
            // Clear any existing ordering that might have been applied
            $query->reorder();
            $this->applyOrdering($query, $args['orderBy']);
        } else {
            // Default ordering for search results: relevance, then featured, then newest
            $query->orderByDesc('is_featured')
                ->orderByDesc('created_at');
        }

        return $query;
    }

    /**
     * Get search suggestions based on query.
     */
    public function suggestions($root, array $args, GraphQLContext $context): array
    {
        $query = $args['query'];
        $limit = $args['limit'] ?? 10;

        // Search for products that match the query in name fields
        $suggestions = Product::query()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name_en', 'like', "%{$query}%")
                    ->orWhere('name_ar', 'like', "%{$query}%");
            })
            ->orderByDesc('is_featured')
            ->limit($limit)
            ->get(['name_en', 'name_ar'])
            ->flatMap(function ($product) {
                return [$product->name_en, $product->name_ar];
            })
            ->filter(function ($name) use ($query) {
                return stripos($name, $query) !== false;
            })
            ->unique()
            ->values()
            ->take($limit)
            ->toArray();

        return $suggestions;
    }

    /**
     * Apply text-based search to the query.
     */
    private function applyTextSearch(Builder $query, string $searchTerm, bool $hasCustomOrdering = false): void
    {
        // Check if the model uses Laravel Scout for full-text search
        if (in_array(Searchable::class, class_uses(Product::class))) {
            // Use Scout search if available
            $productIds = Product::search($searchTerm)
                ->where('is_active', true)
                ->keys();

            if ($productIds->isNotEmpty()) {
                $query->whereIn('id', $productIds);
                // Preserve Scout relevance order when no explicit ordering is provided
                if (! $hasCustomOrdering) {
                    $query->orderByRaw('FIELD(id, ' . $productIds->implode(',') . ')');
                }
            } else {
                // If no Scout results, fall back to LIKE search
                $this->applyLikeSearch($query, $searchTerm);
            }
        } else {
            // Fall back to LIKE search
            $this->applyLikeSearch($query, $searchTerm);
        }
    }

    /**
     * Apply LIKE-based search to the query.
     */
    private function applyLikeSearch(Builder $query, string $searchTerm): void
    {
        $query->where(function ($q) use ($searchTerm) {
            $q->where('name_en', 'like', "%{$searchTerm}%")
                ->orWhere('name_ar', 'like', "%{$searchTerm}%")
                ->orWhere('description_en', 'like', "%{$searchTerm}%")
                ->orWhere('description_ar', 'like', "%{$searchTerm}%")
                ->orWhereHas('category', function ($categoryQuery) use ($searchTerm) {
                    $categoryQuery->where('name_en', 'like', "%{$searchTerm}%")
                        ->orWhere('name_ar', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('brand', function ($brandQuery) use ($searchTerm) {
                    $brandQuery->where('name_en', 'like', "%{$searchTerm}%")
                        ->orWhere('name_ar', 'like', "%{$searchTerm}%");
                });
        });
    }

    /**
     * Apply search filters to the query.
     */
    private function applySearchFilters(Builder $query, array $filters): void
    {
        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (isset($filters['min_price'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('price', '>=', $filters['min_price'])
                    ->orWhere(function ($subQ) use ($filters) {
                        $subQ->whereNotNull('sale_price')
                            ->where('sale_price', '>=', $filters['min_price']);
                    });
            });
        }

        if (isset($filters['max_price'])) {
            $query->where(function ($q) use ($filters) {
                $q->where(function ($subQ) use ($filters) {
                    $subQ->whereNotNull('sale_price')
                        ->where('sale_price', '<=', $filters['max_price']);
                })->orWhere(function ($subQ) use ($filters) {
                    $subQ->whereNull('sale_price')
                        ->where('price', '<=', $filters['max_price']);
                });
            });
        }

        if (isset($filters['is_featured']) && $filters['is_featured']) {
            $query->where('is_featured', true);
        }

        if (isset($filters['is_on_sale']) && $filters['is_on_sale']) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price');
        }

        if (isset($filters['in_stock_only']) && $filters['in_stock_only']) {
            $query->where('stock', '>', 0);
        }
    }

    /**
     * Apply ordering to the query.
     */
    private function applyOrdering(Builder $query, array $orderBy): void
    {
        foreach ($orderBy as $order) {
            $column = $this->getColumnName($order['column']);
            $direction = strtolower($order['order']);

            $query->orderBy($column, $direction);
        }
    }

    /**
     * Map GraphQL enum values to database column names.
     */
    private function getColumnName(string $column): string
    {
        return match ($column) {
            'ID' => 'id',
            'NAME_EN' => 'name_en',
            'NAME_AR' => 'name_ar',
            'PRICE' => 'price',
            'SALE_PRICE' => 'sale_price',
            'CREATED_AT' => 'created_at',
            'UPDATED_AT' => 'updated_at',
            'IS_FEATURED' => 'is_featured',
            default => 'created_at',
        };
    }
}
