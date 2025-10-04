<?php

namespace App\Services\Inventory\Strategies;

use App\Enums\ProductType;
use App\Models\Product;
use App\Services\Inventory\Contracts\StockStrategyInterface;

class WebStockStrategy implements StockStrategyInterface
{
    /**
     * Get reserved stock quantity for a product.
     */
    public function getReserved(Product $product): float
    {
        // For now, return 0 as reserved stock tracking is not yet implemented
        // Future implementation: return $product->reserved_quantity ?? 0;
        return 0;
    }

    /**
     * Consume stock for a product.
     */
    public function consume(Product $product, float $quantity): void
    {
        if (! $this->isAvailable($product, $quantity)) {
            throw new \RuntimeException('Insufficient stock to consume');
        }

        // For configurable products, this should be handled at variant level
        if ($product->type === ProductType::CONFIGURABLE) {
            throw new \InvalidArgumentException('Cannot consume stock for configurable products directly');
        }

        // Use update to support float quantities. Ensure quantity doesn't go below zero.
        $new = max(0, $product->quantity - $quantity);
        $product->update(['quantity' => $new]);
    }

    /**
     * Get available stock for display.
     */
    public function getAvailableStock(Product $product): float
    {
        // For configurable products, sum up variant stock
        if ($product->type === ProductType::CONFIGURABLE) {
            throw new \InvalidArgumentException('Cannot get available stock for configurable products directly');
        }

        $reserved = $this->getReserved($product);

        return max(0, $product->quantity - $reserved);
    }

    /**
     * Check if stock is available.
     */
    public function isAvailable(Product $product, float $quantity): bool
    {
        // For configurable products, check total variant stock
        if ($product->type === ProductType::CONFIGURABLE) {
            throw new \InvalidArgumentException('Cannot check availability for configurable products directly');
        }

        // For simple products, check available quantity (total - reserved)
        $reserved = $this->getReserved($product);

        return ($product->quantity - $reserved) >= $quantity;
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Product $product, float $quantity): void
    {
        if ($product->type === ProductType::CONFIGURABLE) {
            throw new \InvalidArgumentException('Cannot update stock for configurable products directly');
        }

        $product->update(['quantity' => max(0, $quantity)]);
    }

    /**
     * Sync stock from external source.
     */
    public function syncStock(Product $product): void
    {
        // For web stock manager, there's no external source to sync from
        // This is a no-op for web-managed stock
    }
}
