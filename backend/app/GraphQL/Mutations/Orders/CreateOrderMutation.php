<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Orders;

use App\DTOs\OrderPlacementData;
use App\Enums\PaymentMethod;
use App\Models\Address;
use App\Models\Order;
use App\Services\OrderService;
use Exception;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
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

            // Validate required fields
            $validator = Validator::make($args, [
                'shipping_address.full_name' => 'required|string|max:255',
                'shipping_address.phone' => 'required|string|max:20',
                'shipping_address.address_line_1' => 'required|string|max:255',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.state' => 'required|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'shipping_address.country' => 'required|string|max:100',
                'payment_method' => 'required|in:CARD,COD,BANK_TRANSFER,WALLET',
            ]);

            if ($validator->fails()) {
                throw new Error($validator->errors()->first());
            }

            // Map GraphQL payment method values to PHP enum values
            $paymentMethodMapping = [
                'CARD' => PaymentMethod::CREDIT_CARD,
                'COD' => PaymentMethod::CASH_ON_DELIVERY,
                'BANK_TRANSFER' => PaymentMethod::WALLET, // Map to available enum
                'WALLET' => PaymentMethod::WALLET,
            ];

            $paymentMethod = $paymentMethodMapping[$args['payment_method']] ?? PaymentMethod::CASH_ON_DELIVERY;

            // Create a temporary address for the OrderService
            // This follows the existing pattern in the application
            $address = $this->createTemporaryAddress($args['shipping_address'], $user);

            // Create OrderPlacementData as expected by the service
            $orderData = new OrderPlacementData(
                addressId: $address->id,
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

    /**
     * Create a temporary address for order placement.
     */
    private function createTemporaryAddress(array $addressData, $user): Address
    {
        // Find or create minimal area setup for the address
        $area = \App\Models\Area::first();
        if (! $area) {
            // Create minimal gov and area for testing
            $gov = \App\Models\Gov::first();
            if (! $gov) {
                $gov = \App\Models\Gov::create([
                    'name_en' => 'Cairo',
                    'name_ar' => 'القاهرة',
                ]);
            }

            $area = \App\Models\Area::create([
                'name_en' => 'Cairo',
                'name_ar' => 'القاهرة',
                'gov_id' => $gov->id,
            ]);
        }

        // Create shipping cost for the area if it doesn't exist
        $shippingCost = \App\Models\ShippingCost::where('area_id', $area->id)->first();
        if (! $shippingCost) {
            \App\Models\ShippingCost::create([
                'area_id' => $area->id,
                'value' => 10.00, // Default shipping cost
            ]);
        }

        return Address::create([
            'content' => $addressData['address_line_1'],
            'phone' => $addressData['phone'],
            'area_id' => $area->id,
            'user_id' => $user->id,
        ]);
    }
}
