<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Orders;

use App\DTOs\OrderPlacementData;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Services\OrderService;
use Exception;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CreateOrderMutation
{
    protected OrderService $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
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

            $paymentMethod = PaymentMethod::from($args['payment_method']);

            // Create OrderPlacementData as expected by the service
            $orderData = new OrderPlacementData(
                addressId: $args['shipping_address_id'],
                paymentMethod: $paymentMethod,
                couponCode: $args['coupon_code'] ?? null,
                notes: $args['notes'] ?? null,
                promotionId: $args['promotion_id'] ?? null
            );

            // Use the OrderService to place the order
            $order = $this->orderService->placeOrderFromCart($orderData);

            return $order;

        } catch (ValidationException $e) {
            throw new Error($e->getMessage());
        } catch (Exception $e) {
            throw new Error($e->getMessage());
        }
    }
}
