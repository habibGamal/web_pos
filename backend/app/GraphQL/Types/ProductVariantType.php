<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Product;

class ProductVariantType
{
    /**
     * Check if the variant is in stock.
     */
    public function isInStock(Product $variant): bool
    {
        return $variant->is_active && $variant->quantity > 0;
    }

    /**
     * Get the variant's featured image URL.
     */
    public function featuredImage(Product $variant): ?string
    {
        return $variant->featured_image;
    }

    /**
     * Get variant images.
     */
    public function images(Product $variant): array
    {
        return $variant->images ?? [];
    }

    /**
     * Get the effective price (variant price or parent product price).
     */
    public function effectivePrice(Product $variant): float
    {
        $parentProduct = $variant->parent ?? $variant;

        return (float) ($variant->sale_price ?? $variant->price ?? $parentProduct->price);
    }

    /**
     * Get variant's attributes grouped by attribute type.
     */
    public function groupedAttributes(Product $variant): array
    {
        return $variant->attributeValues()
            ->with('attribute')
            ->get()
            ->groupBy('attribute_id')
            ->map(function ($values) {
                $attribute = $values->first()->attribute;

                return [
                    'attribute' => $attribute,
                    'values' => $values->pluck('display_value')->toArray(),
                ];
            })
            ->values()
            ->toArray();
    }
}
