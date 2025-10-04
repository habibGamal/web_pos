<?php

namespace App\Services\Stock\Strategies;

use App\Models\Product;
use App\Services\Stock\Contracts\StockStrategyInterface;

class PosStockStrategy implements StockStrategyInterface
{
    /**
     * Get reserved stock quantity for a product.
     */
    public function getReserved(Product $product): float
    {
        // For now, return 0 as reserved stock tracking is not yet implemented
        // TODO: Implement POS reserved stock retrieval logic
        return 0;
    }

    /**
     * Consume stock for a product.
     */
    public function consume(Product $product, float $quantity): void
    {
        // TODO: Implement POS stock consumption logic
    }

    /**
     * Get available stock for display.
     *
     * This provides a basic POS fallback that reads a stock-like attribute on the Product model.
     * Adjust to call POS APIs or mirrored tables as needed.
     */
    public function getAvailableStock(Product $product): float
    {
        if (! $product->is_stockable) {
            // Non-stockable products are treated as effectively unlimited here.
            return PHP_FLOAT_MAX;
        }

        // Try common attributes that might hold stock levels; fallback to 0.
        return (float) ($product->stock ?? $product->quantity ?? 0);
    }

    /**
     * Check if stock is available.
     */
    public function isAvailable(Product $product, float $quantity): bool
    {
        // Basic implementation: compare requested quantity with available stock.
        return $this->getAvailableStock($product) >= $quantity;
    }

    /**
     * Check if stock is available for multiple items.
     *
     * @param  array  $items  Format: [['product_id' => int, 'quantity' => float], ...]
     * @return array ['available' => bool, 'insufficient' => array]
     */
    public function checkBulkAvailability(array $items): array
    {
        // TODO: Implement bulk availability check via POS APIs or mirrored tables
        return [];
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Product $product, float $quantity): void
    {
        // TODO: Implement POS stock update logic (update mirrored stock)
    }

    /**
     * Sync stock from external source.
     */
    public function syncStock(Product $product): void
    {
        // TODO: Implement POS stock sync via Kafka/API
    }
}
