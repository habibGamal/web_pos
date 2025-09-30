<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Section;

class SectionType
{
    /**
     * Get the section title in the current locale.
     */
    public function title(Section $section): string
    {
        $locale = app()->getLocale();

        return $locale === 'ar' ? $section->title_ar : $section->title_en;
    }

    /**
     * Get the total number of products in this section.
     */
    public function productsCount(Section $section): int
    {
        return $section->products()->count();
    }

    /**
     * Get the number of active products in this section.
     */
    public function activeProductsCount(Section $section): int
    {
        return $section->products()
            ->where('is_active', true)
            ->count();
    }

    /**
     * Check if the section has any products.
     */
    public function hasProducts(Section $section): bool
    {
        return $section->products()->exists();
    }
}
