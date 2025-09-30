<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\ProductVariant;

class ProductVariantType
{
    /**
     * Check if the variant is in stock.
     */
    public function isInStock(ProductVariant $variant): bool
    {
        return $variant->is_active && $variant->quantity > 0;
    }

    /**
     * Get the variant's featured image URL.
     */
    public function featuredImage(ProductVariant $variant): ?string
    {
        return $variant->featured_image;
    }

    /**
     * Get variant images.
     */
    public function images(ProductVariant $variant): array
    {
        return $variant->images ?? [];
    }

    /**
     * Get the effective price (variant price or product price).
     */
    public function effectivePrice(ProductVariant $variant): float
    {
        return (float) ($variant->sale_price ?? $variant->price ?? $variant->product->price);
    }
}
