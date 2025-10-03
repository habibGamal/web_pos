<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = fake()->randomFloat(2, 10, 200);
        $quantity = fake()->numberBetween(1, 5);

        // product_id now points directly to the variant (Product with type=VARIANT)
        // 70% chance of using a variant, otherwise use a simple product
        $product = fake()->boolean(70)
            ? Product::factory()->variant()
            : Product::factory()->simple();

        return [
            'order_id' => Order::factory(),
            'product_id' => $product,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice * $quantity,
        ];
    }
}
