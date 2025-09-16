<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Category;

class CategoryType
{
    /**
     * Get the category name in the current locale.
     */
    public function name(Category $category): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $category->name_ar : $category->name_en;
    }

    /**
     * Get the category description in the current locale.
     */
    public function description(Category $category): ?string
    {
        // Categories don't have description fields in the current schema
        // This is a placeholder for future enhancement
        return null;
    }

    /**
     * Get the category's display image with fallback logic.
     */
    public function displayImage(Category $category): ?string
    {
        return $category->display_image;
    }

    /**
     * Get the category's image URL with fallback.
     */
    public function imageUrl(Category $category): ?string
    {
        return $category->image_url;
    }

    /**
     * Get the category's SEO-friendly URL.
     */
    public function url(Category $category): string
    {
        return "/categories/{$category->slug}";
    }

    /**
     * Get the total number of products in this category.
     */
    public function productsCount(Category $category): int
    {
        return $category->products()->count();
    }

    /**
     * Get the number of active products in this category.
     */
    public function activeProductsCount(Category $category): int
    {
        return $category->products()
            ->where('is_active', true)
            ->count();
    }

    /**
     * Check if the category has any products.
     */
    public function hasProducts(Category $category): bool
    {
        return $category->products()->exists();
    }
}
