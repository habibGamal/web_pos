<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Brand;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class BrandsQuery
{
    /**
     * Get all brands with optional filtering.
     */
    public function __invoke($root, array $args, GraphQLContext $context)
    {
        $query = Brand::query()
            ->with(['parent', 'children'])
            ->orderBy('display_order')
            ->orderBy('name_en');

        // Filter by active status
        if (isset($args['is_active'])) {
            $query->where('is_active', $args['is_active']);
        }

        // Filter to parents only
        if (isset($args['parents_only']) && $args['parents_only']) {
            $query->whereNull('parent_id');
        }

        return $query->get();
    }

    /**
     * Get a single brand by ID.
     */
    public function brand($root, array $args, GraphQLContext $context): ?Brand
    {
        return Brand::with(['parent', 'children', 'products'])
            ->find($args['id']);
    }

    /**
     * Get a single brand by slug.
     */
    public function brandBySlug($root, array $args, GraphQLContext $context): ?Brand
    {
        return Brand::with(['parent', 'children', 'products'])
            ->where('slug', $args['slug'])
            ->first();
    }
}
