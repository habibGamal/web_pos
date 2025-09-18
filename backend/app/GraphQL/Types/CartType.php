<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Cart;

class CartType
{
    /**
     * Calculate the total price of all items in the cart.
     */
    public function totalPrice(Cart $cart): float
    {
        return $cart->getTotalPrice();
    }

    /**
     * Get the total number of unique items in the cart.
     */
    public function totalItems(Cart $cart): int
    {
        return (int) $cart->items()->count();
    }

    /**
     * Get the total quantity of all items in the cart.
     */
    public function totalQuantity(Cart $cart): int
    {
        return (int) $cart->items()->sum('quantity');
    }

    /**
     * Check if the cart is empty.
     */
    public function isEmpty(Cart $cart): bool
    {
        return $cart->items()->count() === 0;
    }
}
