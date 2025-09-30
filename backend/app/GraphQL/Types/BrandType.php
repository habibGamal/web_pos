<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Brand;

class BrandType
{
    /**
     * Check if the brand has any products.
     */
    public function hasProducts(Brand $brand): bool
    {
        return $brand->products()->exists();
    }
}
