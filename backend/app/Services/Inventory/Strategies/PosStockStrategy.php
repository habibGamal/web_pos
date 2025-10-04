<?php

namespace App\Services\Inventory\Strategies;

use App\Models\Product;
use App\Services\Inventory\Contracts\StockStrategyInterface;

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
     */
    public function getAvailableStock(Product $product): float
    {
        // TODO: Implement POS stock availability logic with percentage calculation
        return 0;
    }

    /**
     * Check if stock is available.
     */
    public function isAvailable(Product $product, float $quantity): bool
    {
        // TODO: Implement POS stock check logic (may involve API call)
        return false;
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
