<?php

namespace App\Services\Stock\Contracts;

use App\Models\Product;

interface StockStrategyInterface
{
    /**
     * Get reserved stock quantity for a product.
     */
    public function getReserved(Product $product): float;

    /**
     * Consume stock for a product.
     */
    public function consume(Product $product, float $quantity): void;

    /**
     * Get available stock for display.
     */
    public function getAvailableStock(Product $product): float;

    /**
     * Check if stock is available.
     */
    public function isAvailable(Product $product, float $quantity): bool;

    /**
     * Update stock quantity.
     */
    public function updateStock(Product $product, float $quantity): void;

    /**
     * Sync stock from external source.
     */
    public function syncStock(Product $product): void;

    /**
     * Check if stock is available for multiple items.
     *
     * @param  array  $items  Format: [['product_id' => int, 'quantity' => float], ...]
     * @return array ['available' => bool, 'insufficient' => array]
     */
    public function checkBulkAvailability(array $items): array;
}
