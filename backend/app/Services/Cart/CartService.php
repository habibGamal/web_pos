<?php

namespace App\Services\Cart;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use App\Services\Stock\StockService;

class CartService
{
    public function __construct(
        protected StockService $stockService
    ) {}

    /**
     * Get or create cart for user.
     */
    public function getCart(User $user): Cart
    {
        $user->loadMissing('cart');

        return $user->cart ?? $user->cart()->create();
    }

    /**
     * Add item to cart.
     */
    public function add(User $user, Product $product, float $quantity = 1, array $options = []): void
    {
        // Validate product exists and is active
        if (! $product->exists || ! $product->is_active) {
            throw new \InvalidArgumentException('Product not found or inactive');
        }

        // Validate quantity
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        $cart = $this->getCart($user);

        // Check if item already exists in cart with same options
        $existingItem = $cart->items()
            ->where('product_id', $product->id)
            ->where('options', json_encode($options))
            ->first();

        if ($existingItem) {
            // Update quantity instead of adding new item
            $newQuantity = $existingItem->quantity + $quantity;

            // Validate stock availability for new quantity
            if (! $this->stockService->isAvailable($product, $newQuantity)) {
                throw new \RuntimeException('Insufficient stock available');
            }

            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            // Validate stock availability
            if (! $this->stockService->isAvailable($product, $quantity)) {
                throw new \RuntimeException('Insufficient stock available');
            }

            // Create new cart item
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'options' => $options,
            ]);
        }
    }

    /**
     * Remove item from cart.
     */
    public function remove(User $user, int $cartItemId): void
    {
        $cart = $this->getCart($user);

        $cartItem = $cart->items()->find($cartItemId);

        if (! $cartItem) {
            throw new \InvalidArgumentException('Cart item not found');
        }

        $cartItem->delete();
    }

    /**
     * Increment item quantity in cart.
     */
    public function increment(User $user, int $cartItemId, float $quantity = 1): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        $cart = $this->getCart($user);

        $cartItem = $cart->items()->with('product')->find($cartItemId);

        if (! $cartItem) {
            throw new \InvalidArgumentException('Cart item not found');
        }

        $newQuantity = $cartItem->quantity + $quantity;

        // Validate stock availability
        if (! $this->stockService->isAvailable($cartItem->product, $newQuantity)) {
            throw new \RuntimeException('Insufficient stock available');
        }

        $cartItem->update(['quantity' => $newQuantity]);
    }

    /**
     * Decrement item quantity in cart.
     */
    public function decrement(User $user, int $cartItemId, float $quantity = 1): void
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        $cart = $this->getCart($user);

        $cartItem = $cart->items()->find($cartItemId);

        if (! $cartItem) {
            throw new \InvalidArgumentException('Cart item not found');
        }

        $newQuantity = $cartItem->quantity - $quantity;

        // If quantity becomes 0 or less, remove the item
        if ($newQuantity <= 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => $newQuantity]);
        }
    }

    /**
     * Clear user's cart.
     */
    public function clear(User $user): void
    {
        $cart = $this->getCart($user);
        $cart->items()->delete();
    }

    /**
     * Validate cart items availability.
     */
    public function validateCartItems(User $user): \App\DTOs\CartValidationResult
    {
        $cart = $this->getCart($user);
        $cart->load('items.product');

        $errors = [];
        $validItems = [];
        $invalidItems = [];

        foreach ($cart->items as $item) {
            $product = $item->product;

            // Check if product exists and is active
            if (! $product || ! $product->is_active) {
                $errors[] = [
                    'cart_item_id' => $item->id,
                    'product_id' => $item->product_id,
                    'error' => 'Product not found or inactive',
                    'type' => 'inactive',
                ];
                $invalidItems[] = $item->id;
                continue;
            }

            // Check stock availability
            if (! $this->stockService->isAvailable($product, $item->quantity)) {
                $availableStock = $this->stockService->getAvailableStock($product);

                $errors[] = [
                    'cart_item_id' => $item->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name_en,
                    'requested_quantity' => $item->quantity,
                    'available_quantity' => $availableStock,
                    'error' => 'Insufficient stock available',
                    'type' => 'insufficient_stock',
                ];
                $invalidItems[] = $item->id;
                continue;
            }

            $validItems[] = $item->id;
        }

        return new \App\DTOs\CartValidationResult(
            isValid: empty($errors),
            validItems: $validItems,
            invalidItems: $invalidItems,
            errors: $errors,
        );
    }

    /**
     * Update cart item quantity.
     */
    public function updateQuantity(User $user, int $cartItemId, float $quantity): void
    {
        if ($quantity < 0) {
            throw new \InvalidArgumentException('Quantity cannot be negative');
        }

        $cart = $this->getCart($user);

        $cartItem = $cart->items()->with('product')->find($cartItemId);

        if (! $cartItem) {
            throw new \InvalidArgumentException('Cart item not found');
        }

        // If quantity is 0, remove the item
        if ($quantity == 0) {
            $cartItem->delete();

            return;
        }

        // Validate stock availability
        if (! $this->stockService->isAvailable($cartItem->product, $quantity)) {
            throw new \RuntimeException('Insufficient stock available');
        }

        $cartItem->update(['quantity' => $quantity]);
    }

    /**
     * Add bundle to cart.
     *
     * @param  User  $user  The user adding the bundle
     * @param  Product  $bundle  The bundle product
     * @param  array  $selectedVariants  Array of selected variants/products for configurable items in bundle
     *                                   Format: ['bundle_item_id' => 'product_id'] or ['product_id' => 'variant_id']
     * @param  float  $quantity  Quantity of the bundle
     * @param  array  $options  Additional options
     *
     * Example:
     * $selectedVariants = [
     *     101 => 201,  // For configurable product with ID 101, selected variant ID 201
     *     102 => 202,  // For configurable product with ID 102, selected variant ID 202
     *     // Simple products don't need selection, they'll be added automatically
     * ];
     */
    public function addBundle(User $user, Product $bundle, array $selectedVariants = [], float $quantity = 1, array $options = []): void
    {
        // Validate bundle product
        if (! $bundle->exists || ! $bundle->is_active) {
            throw new \InvalidArgumentException('Bundle not found or inactive');
        }

        if ($bundle->type !== \App\Enums\ProductType::BUNDLE) {
            throw new \InvalidArgumentException('Product is not a bundle');
        }

        // Validate quantity
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        // Load bundle items with their products
        $bundle->load(['bundleItems.product.variants']);

        // Validate bundle has items
        if ($bundle->bundleItems->isEmpty()) {
            throw new \InvalidArgumentException('Bundle has no items');
        }

        // Validate selected variants and prepare child items data
        $childItemsData = [];
        foreach ($bundle->bundleItems as $bundleItem) {
            $product = $bundleItem->product;

            // Check if product is active
            if (! $product->is_active) {
                throw new \InvalidArgumentException("Product {$product->name_en} in bundle is inactive");
            }

            if ($product->type === \App\Enums\ProductType::CONFIGURABLE) {
                // For configurable products, a variant must be selected
                if (! isset($selectedVariants[$product->id])) {
                    throw new \InvalidArgumentException("Variant must be selected for configurable product: {$product->name_en}");
                }

                $variantId = $selectedVariants[$product->id];
                $variant = $product->variants()->where('id', $variantId)->where('is_active', true)->first();

                if (! $variant) {
                    throw new \InvalidArgumentException("Invalid or inactive variant selected for: {$product->name_en}");
                }

                // Validate stock for variant
                $requiredQuantity = $bundleItem->quantity * $quantity;
                if (! $this->stockService->isAvailable($variant, $requiredQuantity)) {
                    throw new \RuntimeException("Insufficient stock for variant: {$variant->name_en}");
                }

                $childItemsData[] = [
                    'product_id' => $variant->id,
                    'quantity' => $bundleItem->quantity,
                ];
            } elseif ($product->type === \App\Enums\ProductType::SIMPLE) {
                // For simple products, validate stock
                $requiredQuantity = $bundleItem->quantity * $quantity;
                if (! $this->stockService->isAvailable($product, $requiredQuantity)) {
                    throw new \RuntimeException("Insufficient stock for product: {$product->name_en}");
                }

                $childItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $bundleItem->quantity,
                ];
            } else {
                throw new \InvalidArgumentException("Invalid product type in bundle: {$product->type->value}");
            }
        }

        // Use transaction to ensure atomicity
        \DB::transaction(function () use ($user, $bundle, $quantity, $options, $childItemsData) {
            $cart = $this->getCart($user);

            // Create parent cart item (the bundle)
            $parentCartItem = $cart->items()->create([
                'product_id' => $bundle->id,
                'parent_id' => null,
                'quantity' => $quantity,
                'options' => $options,
            ]);

            // Create child cart items (the selected products/variants)
            foreach ($childItemsData as $childData) {
                $cart->items()->create([
                    'product_id' => $childData['product_id'],
                    'parent_id' => $parentCartItem->id,
                    'quantity' => $childData['quantity'],
                    'options' => [],
                ]);
            }
        });
    }

    /**
     * Update bundle in cart by changing selected variants.
     *
     * @param  User  $user  The user updating the bundle
     * @param  int  $parentCartItemId  The parent cart item ID (bundle)
     * @param  array  $selectedVariants  New array of selected variants/products
     *                                   Format: ['product_id' => 'variant_id']
     *
     * Example:
     * $selectedVariants = [
     *     101 => 203,  // Changed from variant 201 to 203 for configurable product 101
     *     102 => 202,  // Keep variant 202 for configurable product 102
     * ];
     */
    public function updateBundle(User $user, int $parentCartItemId, array $selectedVariants): void
    {
        $cart = $this->getCart($user);

        // Get parent cart item (bundle)
        $parentCartItem = $cart->items()
            ->with(['product.bundleItems.product.variants', 'children.product'])
            ->whereNull('parent_id')
            ->find($parentCartItemId);

        if (! $parentCartItem) {
            throw new \InvalidArgumentException('Bundle cart item not found');
        }

        $bundle = $parentCartItem->product;

        // Validate it's a bundle
        if ($bundle->type !== \App\Enums\ProductType::BUNDLE) {
            throw new \InvalidArgumentException('Cart item is not a bundle');
        }

        // Validate bundle is still active
        if (! $bundle->is_active) {
            throw new \InvalidArgumentException('Bundle is no longer active');
        }

        // Prepare new child items data
        $newChildItemsData = [];
        foreach ($bundle->bundleItems as $bundleItem) {
            $product = $bundleItem->product;

            // Check if product is active
            if (! $product->is_active) {
                throw new \InvalidArgumentException("Product {$product->name_en} in bundle is inactive");
            }

            if ($product->type === \App\Enums\ProductType::CONFIGURABLE) {
                // For configurable products, a variant must be selected
                if (! isset($selectedVariants[$product->id])) {
                    throw new \InvalidArgumentException("Variant must be selected for configurable product: {$product->name_en}");
                }

                $variantId = $selectedVariants[$product->id];
                $variant = $product->variants()->where('id', $variantId)->where('is_active', true)->first();

                if (! $variant) {
                    throw new \InvalidArgumentException("Invalid or inactive variant selected for: {$product->name_en}");
                }

                // Validate stock for variant
                $requiredQuantity = $bundleItem->quantity * $parentCartItem->quantity;
                if (! $this->stockService->isAvailable($variant, $requiredQuantity)) {
                    throw new \RuntimeException("Insufficient stock for variant: {$variant->name_en}");
                }

                $newChildItemsData[] = [
                    'product_id' => $variant->id,
                    'quantity' => $bundleItem->quantity,
                ];
            } elseif ($product->type === \App\Enums\ProductType::SIMPLE) {
                // For simple products, validate stock
                $requiredQuantity = $bundleItem->quantity * $parentCartItem->quantity;
                if (! $this->stockService->isAvailable($product, $requiredQuantity)) {
                    throw new \RuntimeException("Insufficient stock for product: {$product->name_en}");
                }

                $newChildItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $bundleItem->quantity,
                ];
            } else {
                throw new \InvalidArgumentException("Invalid product type in bundle: {$product->type->value}");
            }
        }

        // Use transaction to ensure atomicity
        \DB::transaction(function () use ($parentCartItem, $newChildItemsData) {
            // Delete existing child cart items
            $parentCartItem->children()->delete();

            // Create new child cart items with updated selections
            foreach ($newChildItemsData as $childData) {
                $parentCartItem->children()->create([
                    'cart_id' => $parentCartItem->cart_id,
                    'product_id' => $childData['product_id'],
                    'quantity' => $childData['quantity'],
                    'options' => [],
                ]);
            }
        });
    }

    /**
     * Remove bundle from cart (removes parent and all children).
     *
     * @param  User  $user  The user
     * @param  int  $parentCartItemId  The parent cart item ID (bundle)
     */
    public function removeBundle(User $user, int $parentCartItemId): void
    {
        $cart = $this->getCart($user);

        $parentCartItem = $cart->items()->whereNull('parent_id')->find($parentCartItemId);

        if (! $parentCartItem) {
            throw new \InvalidArgumentException('Bundle cart item not found');
        }

        // Delete parent (cascade will delete children due to foreign key constraint)
        $parentCartItem->delete();
    }
}
