<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Area;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users (excluding admin user, create regular users for orders)
        $users = User::where('is_admin', false)->take(5)->get();

        // If we don't have enough regular users, create some
        if ($users->count() < 5) {
            $additionalUsers = User::factory()->count(5 - $users->count())->create([
                'is_admin' => false,
            ]);
            $users = $users->concat($additionalUsers);
        }

        // Get existing products with variants
        $products = Product::with(['variants' => function ($query) {
            $query->where('is_active', true)->where('quantity', '>', 0);
        }])->where('is_active', true)->get();

        // Get existing areas for shipping addresses
        $areas = Area::all();

        foreach ($users as $user) {
            // Create 1-3 addresses per user
            $addressCount = fake()->numberBetween(1, 3);
            $userAddresses = collect();

            for ($i = 0; $i < $addressCount; ++$i) {
                $area = $areas->random();
                $address = Address::create([
                    'content' => fake()->streetAddress() . ', ' . fake()->city(),
                    'phone' => fake()->phoneNumber(),
                    'area_id' => $area->id,
                    'user_id' => $user->id,
                ]);
                $userAddresses->push($address);
            }

            // Create 2-5 orders per user
            $orderCount = fake()->numberBetween(2, 5);

            for ($i = 0; $i < $orderCount; ++$i) {
                $shippingAddress = $userAddresses->random();
                $orderStatus = fake()->randomElement(OrderStatus::cases());
                $paymentMethod = fake()->randomElement(PaymentMethod::cases());

                // Determine payment status based on order status and method
                $paymentStatus = $this->determinePaymentStatus($orderStatus, $paymentMethod);

                // Get shipping cost for the address area
                $shippingCost = $shippingAddress->area->shipping_cost ?? 15.0;

                // Create order items first to calculate totals
                $orderItems = [];
                $subtotal = 0;
                $itemCount = fake()->numberBetween(1, 4);

                for ($j = 0; $j < $itemCount; ++$j) {
                    $product = $products->random();
                    $variant = $product->variants->isNotEmpty() ? $product->variants->random() : null;

                    if (! $variant && $product->variants->isNotEmpty()) {
                        continue; // Skip if no valid variant
                    }

                    $quantity = fake()->numberBetween(1, 3);
                    $unitPrice = $product->sale_price ?? $product->price;
                    $itemSubtotal = $quantity * $unitPrice;
                    $subtotal += $itemSubtotal;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'variant_id' => $variant?->id,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                // Calculate discount (0-20% chance of having a discount)
                $discount = fake()->boolean(20) ? fake()->randomFloat(2, 5, $subtotal * 0.3) : 0;

                // Calculate total
                $total = $subtotal + $shippingCost - $discount;

                // Generate coupon code if discount applied
                $couponCode = $discount > 0 ? 'SAVE' . strtoupper(fake()->randomLetter() . fake()->randomLetter()) : null;

                // Create the order
                $order = Order::create([
                    'user_id' => $user->id,
                    'order_status' => $orderStatus,
                    'payment_status' => $paymentStatus,
                    'payment_method' => $paymentMethod,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'discount' => $discount,
                    'total' => $total,
                    'coupon_code' => $couponCode,
                    'shipping_address_id' => $shippingAddress->id,
                    'notes' => fake()->boolean(30) ? fake()->sentence() : null,
                    'payment_id' => $paymentStatus === PaymentStatus::PAID ? 'pay_' . fake()->uuid() : null,
                    'delivered_at' => $orderStatus === OrderStatus::DELIVERED ? fake()->dateTimeBetween('-30 days', 'now') : null,
                    'created_at' => fake()->dateTimeBetween('-60 days', 'now'),
                ]);

                // Create order items
                foreach ($orderItems as $itemData) {
                    OrderItem::create(array_merge($itemData, ['order_id' => $order->id]));
                }
            }
        }

        $this->command->info('Created orders for ' . $users->count() . ' users');
    }

    /**
     * Determine payment status based on order status and payment method.
     */
    private function determinePaymentStatus(OrderStatus $orderStatus, PaymentMethod $paymentMethod): PaymentStatus
    {
        // Cash on delivery orders are pending until delivered
        if ($paymentMethod === PaymentMethod::CASH_ON_DELIVERY) {
            return $orderStatus === OrderStatus::DELIVERED ? PaymentStatus::PAID : PaymentStatus::PENDING;
        }

        // For other payment methods
        return match ($orderStatus) {
            OrderStatus::PROCESSING, OrderStatus::SHIPPED, OrderStatus::DELIVERED => PaymentStatus::PAID,
            OrderStatus::CANCELLED => fake()->boolean(70) ? PaymentStatus::REFUNDED : PaymentStatus::PAID,
            default => fake()->randomElement([PaymentStatus::PENDING, PaymentStatus::PAID]),
        };
    }
}
