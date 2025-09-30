<?php

namespace App\GraphQL\Types;

use App\Models\AttributeValue;

class AttributeValueType
{
    /**
     * Get the attribute value display name in the current locale.
     */
    public function displayValue(AttributeValue $attributeValue): string
    {
        $locale = app()->getLocale();

        return $attributeValue->{"value_{$locale}"} ?? $attributeValue->value;
    }
}
