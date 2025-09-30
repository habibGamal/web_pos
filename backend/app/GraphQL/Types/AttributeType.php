<?php

namespace App\GraphQL\Types;

use App\Models\Attribute;

class AttributeType
{
    /**
     * Get the attribute name in the current locale.
     */
    public function name(Attribute $attribute): string
    {
        $locale = app()->getLocale();

        return $attribute->{"name_{$locale}"} ?? $attribute->name_en;
    }

    /**
     * Get the attribute description in the current locale.
     */
    public function description(Attribute $attribute): ?string
    {
        $locale = app()->getLocale();

        return $attribute->{"description_{$locale}"} ?? $attribute->description_en;
    }
}
