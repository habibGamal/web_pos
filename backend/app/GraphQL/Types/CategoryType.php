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
     * Get the category's display image with fallback logic.
     */
    public function displayImage(Category $category): ?string
    {
        return $category->display_image;
    }

    /**
     * Check if the category has any products.
     */
    public function hasProducts(Category $category): bool
    {
        return $category->products()->exists();
    }
}
