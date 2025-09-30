<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ProductsQuery
{
    /**
     * Return a query builder for products with filtering and sorting.
     * This method is used by the @paginate directive.
     */
    public function __invoke($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $query = Product::query()
            ->with(['category', 'brand', 'variants'])
            ->where('is_active', true);

        // Apply search filters
        if (isset($args['search'])) {
            $this->applySearchFilters($query, $args['search']);
        }

        // Apply ordering
        if (isset($args['orderBy']) && is_array($args['orderBy']) && ! empty($args['orderBy'])) {
            $this->applyOrdering($query, $args['orderBy']);
        } else {
            // Default ordering: featured first, then by created_at desc
            $query->orderByDesc('is_featured')
                ->orderByDesc('created_at');
        }

        return $query;
    }

    /**
     * Get a single product by ID.
     */
    public function product($root, array $args, GraphQLContext $context): ?Product
    {
        return Product::with(['category', 'brand', 'variants', 'sections'])
            ->where('is_active', true)
            ->find($args['id']);
    }

    /**
     * Get a single product by slug.
     */
    public function productBySlug($root, array $args, GraphQLContext $context): ?Product
    {
        return Product::with(['category', 'brand', 'variants', 'sections'])
            ->where('is_active', true)
            ->where('slug', $args['slug'])
            ->first();
    }

    /**
     * Apply search filters to the query.
     */
    private function applySearchFilters(Builder $query, array $search): void
    {
        if (isset($search['query'])) {
            $searchTerm = $search['query'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name_en', 'like', "%{$searchTerm}%")
                    ->orWhere('name_ar', 'like', "%{$searchTerm}%")
                    ->orWhere('description_en', 'like', "%{$searchTerm}%")
                    ->orWhere('description_ar', 'like', "%{$searchTerm}%");
            });
        }

        if (isset($search['category_id'])) {
            $query->where('category_id', $search['category_id']);
        }

        if (isset($search['brand_id'])) {
            $query->where('brand_id', $search['brand_id']);
        }

        if (isset($search['min_price'])) {
            $query->where(function ($q) use ($search) {
                $q->where('price', '>=', $search['min_price'])
                    ->orWhere(function ($subQ) use ($search) {
                        $subQ->whereNotNull('sale_price')
                            ->where('sale_price', '>=', $search['min_price']);
                    });
            });
        }

        if (isset($search['max_price'])) {
            $query->where(function ($q) use ($search) {
                $q->where(function ($subQ) use ($search) {
                    // Check sale price first if it exists
                    $subQ->whereNotNull('sale_price')
                        ->where('sale_price', '<=', $search['max_price']);
                })->orWhere(function ($subQ) use ($search) {
                    // If no sale price, check regular price
                    $subQ->whereNull('sale_price')
                        ->where('price', '<=', $search['max_price']);
                });
            });
        }

        if (isset($search['is_featured']) && $search['is_featured']) {
            $query->where('is_featured', true);
        }

        if (isset($search['is_on_sale']) && $search['is_on_sale']) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price');
        }

        if (isset($search['in_stock_only']) && $search['in_stock_only']) {
            $query->whereHas('variants', function ($variantQuery) {
                $variantQuery->where('is_active', true)
                    ->where('quantity', '>', 0);
            });
        }
    }

    /**
     * Apply ordering to the query.
     */
    private function applyOrdering(Builder $query, array $orderBy): void
    {
        foreach ($orderBy as $order) {
            $column = $order['column'];
            $direction = strtolower($order['order']);
            $query->orderBy($column, $direction);
        }
    }
}
