<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\CartItem;
use App\Models\Product;

class CartItemType
{
    /**
     * Get the product for this cart item.
     */
    public function product(CartItem $cartItem): Product
    {
        return $cartItem->product;
    }

    /**
     * Calculate the total price for this cart item.
     */
    public function totalPrice(CartItem $cartItem): float
    {
        return $cartItem->getTotalPrice();
    }

    /**
     * Check if this cart item is available (in stock).
     */
    public function isAvailable(CartItem $cartItem): bool
    {
        $variant = $cartItem->variant;

        if (! $variant || ! $variant->is_active) {
            return false;
        }

        // Check if variant has enough stock
        return $variant->quantity >= $cartItem->quantity;
    }

    /**
     * Get the unit price for this cart item.
     */
    public function unitPrice(CartItem $cartItem): float
    {
        return $cartItem->getUnitPrice();
    }
}
