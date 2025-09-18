<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ProductType
{
    /**
     * Get the product name in the current locale.
     */
    public function name(Product $product): string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $product->name_ar : $product->name_en;
    }

    /**
     * Get the product description in the current locale.
     */
    public function description(Product $product): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'ar' ? $product->description_ar : $product->description_en;
    }

    /**
     * Get the cost price (admin only).
     */
    public function costPrice(Product $product): ?float
    {
        // Only show cost price to admin users
        if (!Auth::check() || !Auth::user()->is_admin) {
            return null;
        }

        return $product->cost_price ? (float) $product->cost_price : null;
    }

    /**
     * Check if the product is in stock.
     */
    public function isInStock(Product $product): bool
    {
        return $product->is_in_stock;
    }

    /**
     * Get the product's featured image URL.
     */
    public function featuredImage(Product $product): ?string
    {
        return $product->featured_image;
    }

    /**
     * Get the product's image gallery URLs.
     */
    public function images(Product $product): array
    {
        return $product->all_images ?? [];
    }

    /**
     * Get the product's effective price (considers sale price).
     */
    public function effectivePrice(Product $product): float
    {
        if ($product->sale_price && $product->sale_price > 0) {
            return floatval($product->sale_price);
        }
        return floatval($product->price);
    }

    /**
     * Get the discount percentage if on sale.
     */
    public function discountPercentage(Product $product): ?float
    {
        if (!$product->sale_price || $product->sale_price <= 0 || $product->price <= 0) {
            return null;
        }

        $discount = (($product->price - $product->sale_price) / $product->price) * 100;
        return round($discount, 2);
    }

    /**
     * Check if the product is on sale.
     */
    public function isOnSale(Product $product): bool
    {
        return $product->sale_price && $product->sale_price > 0 && $product->sale_price < $product->price;
    }

    /**
     * Check if the user has this product in wishlist.
     */
    public function isInWishlist(Product $product): ?bool
    {
        if (!Auth::check()) {
            return null;
        }

        return $product->wishlists()
            ->where('user_id', Auth::id())
            ->exists();
    }

    /**
     * Get the product's SEO-friendly URL.
     */
    public function url(Product $product): string
    {
        return "/products/{$product->slug}";
    }

    /**
     * Get total stock quantity across all variants.
     */
    public function stock(Product $product): int
    {
        return $product->total_quantity ?? 0;
    }

    /**
     * Get the default variant for the product.
     */
    public function defaultVariant(Product $product)
    {
        return $product->defaultVariant();
    }
}
