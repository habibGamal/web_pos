<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'integer',
        'options' => 'array',
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product that the cart item refers to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product variant that the cart item refers to.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_variant_id');
    }

    /**
     * Calculate the unit price for this cart item.
     * Uses variant pricing when available, fallback to product pricing.
     */
    public function getUnitPrice(): float
    {
        $product = $this->product;
        $variant = $this->variant;

        // Determine pricing strategy: use variant price if available, otherwise product price
        $pricingStrategy = $variant && $variant->price ? 'variant' : 'product';

        if ($pricingStrategy === 'variant') {
            return $variant->sale_price ?: $variant->price;
        } else {
            return $product->sale_price ?: $product->price;
        }
    }

    /**
     * Calculate the total price for this cart item (unit price * quantity).
     */
    public function getTotalPrice(): float
    {
        return $this->quantity * $this->getUnitPrice();
    }

    /**
     * Get the unit price attribute.
     */
    public function getUnitPriceAttribute(): float
    {
        return $this->getUnitPrice();
    }

    /**
     * Get the total price attribute.
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->getTotalPrice();
    }

    /**
     * Get options as JSON string for GraphQL.
     * Returns null if options is null or empty.
     */
    public function getOptionsJson(): ?string
    {
        if ($this->options === null || empty($this->options)) {
            return null;
        }

        return json_encode($this->options);
    }
}
