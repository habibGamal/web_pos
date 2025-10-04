<?php

namespace App\Services\Inventory;

use App\Models\Product;
use App\Services\Inventory\Contracts\StockStrategyInterface;
use App\Services\Inventory\Strategies\WebStockStrategy;

class InventoryService
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
}
