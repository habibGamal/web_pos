<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;

class CartItemResolverService
{
    protected InventoryManagementService $inventoryService;

    public function __construct(InventoryManagementService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Convert a CartItem to an OrderItem for a given order
     * Creates order item from cart item, preserving product and options.
     *
     * @param  CartItem  $cartItem  The cart item to convert
     * @param  Order  $order  The order to associate the item with
     * @return OrderItem The created order item
     *
     * @throws \Exception If the cart item is invalid
     */
    public function toOrderItem(CartItem $cartItem, Order $order): OrderItem
    {
        $product = $cartItem->product;

        if (! $product) {
            throw new \Exception('Cart item must have a valid product. Cart Item ID: ' . $cartItem->id);
        }

        $unitPrice = $cartItem->getUnitPrice();

        // Create the order item - stores product_id and options
        $orderItem = $order->items()->create([
            'product_id' => $product->id,
            'quantity' => $cartItem->quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $unitPrice * $cartItem->quantity,
            'options' => $cartItem->options, // Transfer selected options to order item
        ]);

        // Reserve inventory using the product
        $this->inventoryService->reserveInventory($product, $cartItem->quantity);

        return $orderItem;
    }
}
