<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Category;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CategoriesQuery
{
    /**
     * Get all categories with optional filtering.
     */
    public function __invoke($root, array $args, GraphQLContext $context)
    {
        $query = Category::query()
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
     * Get a single category by ID.
     */
    public function category($root, array $args, GraphQLContext $context): ?Category
    {
        return Category::with(['parent', 'children', 'products'])
            ->find($args['id']);
    }

    /**
     * Get a single category by slug.
     */
    public function categoryBySlug($root, array $args, GraphQLContext $context): ?Category
    {
        return Category::with(['parent', 'children', 'products'])
            ->where('slug', $args['slug'])
            ->first();
    }
}
