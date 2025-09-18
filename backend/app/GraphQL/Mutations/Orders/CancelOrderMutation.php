<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Orders;

use App\Models\Order;
use App\Services\OrderCancellationService;
use Exception;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CancelOrderMutation
{
    protected OrderCancellationService $orderCancellationService;

    public function __construct(OrderCancellationService $orderCancellationService)
    {
        $this->orderCancellationService = $orderCancellationService;
    }

    /**
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     *
     * @throws Error
     */
    public function __invoke($_, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Order
    {
        try {
            $user = Auth::user();
            if (! $user) {
                throw new Error('Unauthenticated.');
            }

            // Validate input
            $validator = Validator::make($args, [
                'order_id' => 'required|exists:orders,id',
                'reason' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                throw new Error($validator->errors()->first());
            }

            // Check if user owns the order
            $order = Order::where('id', $args['order_id'])
                ->where('user_id', $user->id)
                ->first();

            if (! $order) {
                throw new Error('Order not found or access denied.');
            }

            // Check if order can be cancelled
            if (! $order->canBeCancelled()) {
                throw new Error('This order cannot be cancelled.');
            }

            // Cancel the order using the service
            $cancelledOrder = $this->orderCancellationService->cancelOrder(
                (int) $args['order_id'],
                $args['reason'] ?? null
            );

            return $cancelledOrder;

        } catch (Exception $e) {
            throw new Error($e->getMessage());
        }
    }
}
