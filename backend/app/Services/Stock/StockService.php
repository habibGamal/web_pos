<?php

namespace App\Services\Stock;

use App\Models\Product;
use App\Services\Stock\Contracts\StockStrategyInterface;
use App\Services\Stock\Strategies\WebStockStrategy;

class StockService
{
    /**
     * Get the appropriate stock strategy for a product.
     */
    public function getStrategy(Product $product): StockStrategyInterface
    {
        // TODO: Implement strategy selection logic based on product/settings
        return new WebStockStrategy;
    }

    /**
     * Get reserved stock quantity for a product.
     */
    public function getReserved(Product $product): float
    {
        $strategy = $this->getStrategy($product);

        return $strategy->getReserved($product);
    }

    /**
     * Consume stock for a product.
     */
    public function consume(Product $product, float $quantity): void
    {
        $strategy = $this->getStrategy($product);
        $strategy->consume($product, $quantity);
    }

    /**
     * Get available stock for display.
     */
    public function getAvailableStock(Product $product): float
    {
        $strategy = $this->getStrategy($product);

        return $strategy->getAvailableStock($product);
    }

    /**
     * Check if stock is available.
     */
    public function isAvailable(Product $product, float $quantity): bool
    {
        $strategy = $this->getStrategy($product);

        return $strategy->isAvailable($product, $quantity);
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Product $product, float $quantity): void
    {
        $strategy = $this->getStrategy($product);
        $strategy->updateStock($product, $quantity);
    }

    /**
     * Sync stock from external source.
     */
    public function syncStock(Product $product): void
    {
        $strategy = $this->getStrategy($product);
        $strategy->syncStock($product);
    }

    /**
     * Check if stock is available for multiple items (for order placement).
     *
     * @param  array  $items  Format: [['product_id' => int, 'quantity' => float], ...]
     * @return array ['available' => bool, 'insufficient' => array]
     */
    public function validateOrderStock(array $items): array
    {
        // Use first product's strategy (they should all use same for now)
        $firstProduct = Product::find($items[0]['product_id'] ?? null);
        if (! $firstProduct) {
            return ['available' => false, 'insufficient' => $items];
        }

        $strategy = $this->getStrategy($firstProduct);

        return $strategy->checkBulkAvailability($items);
    }

    /**
     * Release stock for order cancellation.
     */
    public function releaseOrderStock(\App\Models\Order $order, bool $wasConsumed = false): void
    {
        $order->loadMissing('items.product');

        foreach ($order->items as $orderItem) {
            if (! $orderItem->product) {
                continue;
            }

            $strategy = $this->getStrategy($orderItem->product);
            $strategy->release($orderItem->product, $orderItem->quantity, $wasConsumed);
        }
    }

    /**
     * Consume stock for all order items (called when transitioning to out_for_delivery).
     */
    public function consumeOrderStock(\App\Models\Order $order): void
    {
        $order->loadMissing('items.product');

        foreach ($order->items as $orderItem) {
            if (! $orderItem->product) {
                continue;
            }

            $this->consume($orderItem->product, $orderItem->quantity);
        }
    }
}
