<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Section;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class SectionsQuery
{
    /**
     * Get all sections with optional filtering.
     */
    public function __invoke($root, array $args, GraphQLContext $context)
    {
        $query = Section::query();

        // Filter by active status
        if (isset($args['active'])) {
            $query->where('active', $args['active']);
        }

        // Apply sorting
        if (isset($args['sorted']) && $args['sorted']) {
            $query->orderBy('sort_order')
                ->orderBy('title_en');
        } else {
            $query->orderBy('title_en');
        }

        return $query->get();
    }

    /**
     * Get a single section by ID.
     */
    public function section($root, array $args, GraphQLContext $context): ?Section
    {
        return Section::with(['products'])
            ->find($args['id']);
    }
}
