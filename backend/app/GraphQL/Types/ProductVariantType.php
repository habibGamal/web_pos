<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\ProductVariant;

class ProductVariantType
{
    /**
     * Get display name for variant based on attributes.
     */
    public function name(ProductVariant $variant): string
    {
        $attributes = [];

        if ($variant->color) {
            $attributes[] = $variant->color;
        }
        if ($variant->size) {
            $attributes[] = $variant->size;
        }
        if ($variant->capacity) {
            $attributes[] = $variant->capacity;
        }

        return !empty($attributes) ? implode(' - ', $attributes) : $variant->sku;
    }

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
        return $variant->sale_price ?? $variant->price ?? $variant->product->price;
    }

    /**
     * Get variant attributes as JSON.
     */
    public function attributes(ProductVariant $variant): array
    {
        $attributes = [];

        if ($variant->color) {
            $attributes['color'] = $variant->color;
        }
        if ($variant->size) {
            $attributes['size'] = $variant->size;
        }
        if ($variant->capacity) {
            $attributes['capacity'] = $variant->capacity;
        }

        // Merge additional attributes
        if ($variant->additional_attributes) {
            $attributes = array_merge($attributes, $variant->additional_attributes);
        }

        return $attributes;
    }
}
