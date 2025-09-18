<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Order;
use GraphQL\Error\Error;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class OrdersQuery
{
    /**
     * Builder for orders pagination query.
     */
    public function __invoke($root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Builder
    {
        $user = Auth::user();

        $query = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.variant.product', 'shippingAddress'])
            ->orderBy('created_at', 'desc');

        // Apply status filter if provided
        if (isset($args['status'])) {
            $query->where('order_status', $args['status']);
        }

        // Apply date range filters if provided
        if (isset($args['date_from'])) {
            $query->where('created_at', '>=', $args['date_from']);
        }

        if (isset($args['date_to'])) {
            $query->where('created_at', '<=', $args['date_to']);
        }

        return $query;
    }

    /**
     * Get single order by ID.
     */
    public function order($root, array $args, GraphQLContext $context): ?Order
    {
        $user = Auth::user();

        // Validate order exists first
        $orderExists = Order::where('id', $args['id'])->exists();
        if (! $orderExists) {
            throw new Error('The selected id is invalid.');
        }

        $order = Order::query()
            ->where('id', $args['id'])
            ->where('user_id', $user->id)
            ->with([
                'items.variant.product',
                'shippingAddress',
            ])
            ->first();

        if (! $order) {
            throw new Error('Order not found or access denied.');
        }

        return $order;
    }
}
