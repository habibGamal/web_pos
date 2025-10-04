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
}
