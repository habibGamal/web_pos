<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Brand;

class BrandType
{
    /**
     * Get the brand name in the current locale.
     */
    public function name(Brand $brand): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $brand->name_ar : $brand->name_en;
    }

    /**
     * Get the brand description in the current locale.
     */
    public function description(Brand $brand): ?string
    {
        // Brands don't have description fields in the current schema
        // This is a placeholder for future enhancement
        return null;
    }

    /**
     * Get the brand's display image with fallback logic.
     */
    public function displayImage(Brand $brand): ?string
    {
        return $brand->display_image;
    }

    /**
     * Get the brand's image URL with fallback.
     */
    public function imageUrl(Brand $brand): ?string
    {
        return $brand->image_url;
    }

    /**
     * Get the brand's SEO-friendly URL.
     */
    public function url(Brand $brand): string
    {
        return "/brands/{$brand->slug}";
    }

    /**
     * Get the total number of products for this brand.
     */
    public function productsCount(Brand $brand): int
    {
        return $brand->products()->count();
    }

    /**
     * Get the number of active products for this brand.
     */
    public function activeProductsCount(Brand $brand): int
    {
        return $brand->products()
            ->where('is_active', true)
            ->count();
    }

    /**
     * Check if the brand has any products.
     */
    public function hasProducts(Brand $brand): bool
    {
        return $brand->products()->exists();
    }
}
