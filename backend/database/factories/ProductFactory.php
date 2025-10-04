<?php

namespace Database\Factories;

use App\Enums\ProductType;
use App\Enums\ProductUnit;
use App\Enums\StockManagerStrategy;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name_en = $this->faker->unique()->words(3, true);
        $type = $this->faker->randomElement([ProductType::SIMPLE, ProductType::CONFIGURABLE, ProductType::BUNDLE]);

        return [
            'name_en' => $name_en,
            'name_ar' => $this->faker->unique()->words(3, true),
            'slug' => Str::slug($name_en),
            'description_en' => $this->faker->paragraphs(3, true),
            'description_ar' => $this->faker->paragraphs(3, true),
            'type' => $type,
            'parent_id' => null,
            'sku' => $type === ProductType::SIMPLE ? 'SKU-' . $this->faker->unique()->randomNumber(8) : null,
            'price' => $this->faker->randomFloat(2, 10, 500),
            'sale_price' => null,
            'cost_price' => $this->faker->randomFloat(2, 1, 300),
            'quantity' => $type === ProductType::CONFIGURABLE ? 0 : $this->faker->numberBetween(0, 100),
            'unit' => $this->faker->randomElement(ProductUnit::cases())->value,
            'is_stockable' => $type !== ProductType::BUNDLE ? true : $this->faker->boolean(80),
            'stock_manager' => $this->faker->randomElement(StockManagerStrategy::cases())->value,
            'pos_stock_display_percentage' => $this->faker->optional(0.3)->numberBetween(10, 100),
            'images' => $type !== ProductType::CONFIGURABLE ? [
                'products/product-' . $this->faker->numberBetween(1, 10) . '.jpg',
            ] : null,
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'is_active' => $this->faker->boolean(80),
            'is_featured' => $this->faker->boolean(20),
            'is_default' => false,
        ];
    }

    /**
     * Create a simple product.
     */
    public function simple(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => ProductType::SIMPLE,
                'parent_id' => null,
                'sku' => 'SKU-' . $this->faker->unique()->randomNumber(8),
                'quantity' => $this->faker->numberBetween(0, 100),
                'unit' => $this->faker->randomElement(ProductUnit::cases())->value,
                'is_stockable' => true,
                'stock_manager' => $this->faker->randomElement(StockManagerStrategy::cases())->value,
                'pos_stock_display_percentage' => $this->faker->optional(0.3)->numberBetween(10, 100),
                'images' => [
                    'products/product-' . $this->faker->numberBetween(1, 10) . '.jpg',
                ],
            ];
        });
    }

    /**
     * Create a configurable product.
     */
    public function configurable(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => ProductType::CONFIGURABLE,
                'parent_id' => null,
                'sku' => null,
                'quantity' => 0,
                'images' => null,
            ];
        });
    }

    /**
     * Create a variant product.
     */
    public function variant(?Product $parent = null): static
    {
        return $this->state(function (array $attributes) use ($parent) {
            $parentProduct = $parent ?? Product::factory()->configurable()->create();

            return [
                'type' => ProductType::VARIANT,
                'parent_id' => $parentProduct->id,
                'sku' => 'SKU-' . $parentProduct->id . '-' . $this->faker->unique()->randomNumber(4),
                'quantity' => $this->faker->numberBetween(0, 50),
                'unit' => $parentProduct->unit,
                'is_stockable' => $parentProduct->is_stockable,
                'stock_manager' => $parentProduct->stock_manager,
                'pos_stock_display_percentage' => $parentProduct->pos_stock_display_percentage,
                'images' => [
                    'products/variant-' . $this->faker->numberBetween(1, 10) . '.jpg',
                ],
                'category_id' => $parentProduct->category_id,
                'brand_id' => $parentProduct->brand_id,
                'is_default' => false,
            ];
        });
    }

    /**
     * Create a bundle product.
     */
    public function bundle(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'type' => ProductType::BUNDLE,
                'parent_id' => null,
                'sku' => 'BUNDLE-' . $this->faker->unique()->randomNumber(8),
                'quantity' => $this->faker->numberBetween(0, 20),
                'unit' => ProductUnit::PIECE->value,
                'is_stockable' => $this->faker->boolean(80),
                'stock_manager' => StockManagerStrategy::WEB_STOCK_MANAGER->value,
                'pos_stock_display_percentage' => null,
                'images' => [
                    'products/bundle-' . $this->faker->numberBetween(1, 10) . '.jpg',
                ],
            ];
        });
    }

    /**
     * Create a default variant.
     */
    public function defaultVariant(): static
    {
        return $this->variant()->state([
            'is_default' => true,
        ]);
    }

    /**
     * Create a product with variants (configurable with its variants).
     */
    public function withVariants(int $variantCount = 3): static
    {
        return $this->configurable()->afterCreating(function (Product $product) use ($variantCount) {
            // Create a default variant
            Product::factory()
                ->variant($product)
                ->defaultVariant()
                ->create();

            // Create additional variants
            for ($i = 1; $i < $variantCount; ++$i) {
                Product::factory()
                    ->variant($product)
                    ->create();
            }
        });
    }

    /**
     * Create a bundle with products.
     */
    public function withBundleItems(int $itemCount = 3): static
    {
        return $this->bundle()->afterCreating(function (Product $bundle) use ($itemCount) {
            $products = Product::factory()
                ->count($itemCount)
                ->simple()
                ->create();

            foreach ($products as $product) {
                $bundle->bundleItems()->create([
                    'product_id' => $product->id,
                    'quantity' => $this->faker->numberBetween(1, 3),
                ]);
            }
        });
    }

    /**
     * Create a product with a sale price.
     */
    public function withSalePrice(?float $salePrice = null): static
    {
        return $this->state(function (array $attributes) use ($salePrice) {
            $price = $attributes['price'] ?? $this->faker->randomFloat(2, 10, 500);

            return [
                'sale_price' => $salePrice ?? ($price * 0.8),
            ];
        });
    }

    /**
     * Create a product that's on sale.
     */
    public function onSale(): static
    {
        return $this->state(function (array $attributes) {
            $price = $attributes['price'] ?? $this->faker->randomFloat(2, 10, 500);

            return [
                'sale_price' => $this->faker->randomFloat(2, 5, $price * 0.9),
            ];
        });
    }
}
