<?php

namespace App\Services\Stock\Strategies;

use App\Enums\ProductType;
use App\Models\Product;
use App\Services\Stock\Contracts\StockStrategyInterface;
use Illuminate\Support\Facades\DB;

class WebStockStrategy implements StockStrategyInterface
{
    /**
     * Get reserved stock quantity for a product.
     */
    public function getReserved(Product $product): float
    {
        if (! $product->is_stockable) {
            return 0;
        }

        $stockInfo = DB::table('product_stock_overview')
            ->where('product_id', $product->id)
            ->first();

        return $stockInfo ? (float) $stockInfo->reserved : 0;
    }

    /**
     * Consume stock for a product.
     */
    public function consume(Product $product, float $quantity): void
    {
        // For configurable products, this should be handled at variant level
        if ($product->type === ProductType::CONFIGURABLE) {
            throw new \InvalidArgumentException('Cannot consume stock for configurable products directly');
        }

        if (! $product->is_stockable) {
            return;
        }

        DB::transaction(function () use ($product, $quantity) {
            // Use pessimistic locking to prevent race conditions
            $freshProduct = Product::query()
                ->where('id', $product->id)
                ->lockForUpdate()
                ->first();

            if (! $freshProduct) {
                throw new \RuntimeException("Product {$product->id} not found.");
            }

            // Revalidate stock before consuming
            $stockInfo = DB::table('product_stock_overview')
                ->where('product_id', $product->id)
                ->first();

            if (! $stockInfo || $stockInfo->available < $quantity) {
                throw new \RuntimeException("Insufficient stock for product {$product->id}. Required: {$quantity}, Available: " . ($stockInfo->available ?? 0));
            }

            $newQuantity = max(0, $freshProduct->quantity - $quantity);
            $freshProduct->quantity = $newQuantity;
            $freshProduct->save();
        });
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

        if (! $product->is_stockable) {
            return PHP_FLOAT_MAX;
        }

        $stockInfo = DB::table('product_stock_overview')
            ->where('product_id', $product->id)
            ->first();

        return $stockInfo ? max(0, (float) $stockInfo->available) : 0;
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

        if (! $product->is_stockable) {
            return true;
        }

        return $this->getAvailableStock($product) >= $quantity;
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

    /**
     * Check if stock is available for multiple items.
     */
    public function checkBulkAvailability(array $items): array
    {
        $insufficient = [];

        foreach ($items as $item) {
            $productId = $item['product_id'];
            $requestedQty = $item['quantity'];

            $product = Product::find($productId);
            if (! $product) {
                $insufficient[] = [
                    'product_id' => $productId,
                    'requested' => $requestedQty,
                    'available' => 0,
                    'message' => 'Product not found',
                ];
                continue;
            }

            if (! $product->is_stockable) {
                continue;
            }

            $stockInfo = DB::table('product_stock_overview')
                ->where('product_id', $productId)
                ->first();

            if (! $stockInfo) {
                $insufficient[] = [
                    'product_id' => $productId,
                    'requested' => $requestedQty,
                    'available' => 0,
                    'message' => 'Stock info not available',
                ];
                continue;
            }

            if ($stockInfo->available < $requestedQty) {
                $insufficient[] = [
                    'product_id' => $productId,
                    'requested' => $requestedQty,
                    'available' => (float) $stockInfo->available,
                    'message' => 'Insufficient stock',
                ];
            }
        }

        return [
            'available' => empty($insufficient),
            'insufficient' => $insufficient,
        ];
    }
}
