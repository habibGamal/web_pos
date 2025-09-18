<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\ReturnOrder;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ReturnsQuery
{
    /**
     * Builder for returns pagination query.
     */
    public function __invoke($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $user = Auth::user();

        $query = ReturnOrder::query()
            ->whereHas('order', function ($orderQuery) use ($user) {
                $orderQuery->where('user_id', $user->id);
            })
            ->with(['order', 'returnItems.orderItem'])
            ->orderBy('created_at', 'desc');

        // Apply status filter if provided
        if (isset($args['status'])) {
            $query->where('status', $args['status']);
        }

        return $query;
    }

    /**
     * Get single return by ID.
     */
    public function returnOrder($root, array $args, GraphQLContext $context): ?ReturnOrder
    {
        $user = Auth::user();

        return ReturnOrder::query()
            ->where('id', $args['id'])
            ->whereHas('order', function ($orderQuery) use ($user) {
                $orderQuery->where('user_id', $user->id);
            })
            ->with([
                'order.items',
                'returnItems.orderItem.variant.product',
                'statusHistory.changedBy',
            ])
            ->first();
    }
}
