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
        'parent_id',
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
     * Get the parent cart item (for bundle child items).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Get the child cart items (for bundle parent items).
     */
    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function isBundleItem(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Calculate the total price for this cart item.
     * Uses sale price if available, otherwise regular price.
     */
    public function getTotalPrice(): float
    {
        if ($this->isBundleItem()) {
            // For bundle child items, price is handled at the parent bundle level
            return 0.0;
        }

        $price = $this->product->sale_price ?? $this->product->price;

        return (float) ($price * $this->quantity);
    }

    /**
     * Get the unit price for this cart item.
     */
    public function getUnitPrice(): float
    {
        return (float) ($this->product->sale_price ?? $this->product->price);
    }
}
