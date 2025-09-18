<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\OrderItem;

class OrderItemType
{
    /**
     * Calculate the quantity that can still be returned.
     */
    public function returnableQuantity(OrderItem $orderItem): int
    {
        // Get the total quantity already returned for this order item
        $alreadyReturned = $orderItem->returnItems()->sum('quantity');

        // Calculate remaining returnable quantity
        return max(0, $orderItem->quantity - $alreadyReturned);
    }

    /**
     * Get total price (map from subtotal field).
     */
    public function totalPrice(OrderItem $orderItem): float
    {
        return (float) $orderItem->subtotal;
    }
}
