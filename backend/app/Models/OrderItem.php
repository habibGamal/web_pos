<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'parent_id',
        'quantity',
        'unit_price',
        'subtotal',
        'options',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'options' => 'array',
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product (variant) that owns the order item.
     * This points to the actual variant (Product with type=VARIANT) that was purchased.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the parent order item (for bundle child items).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Get the child order items (for bundle parent items).
     */
    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * Get the return order items for this order item.
     */
    public function returnOrderItems(): HasMany
    {
        return $this->hasMany(ReturnOrderItem::class);
    }

    /**
     * Get return items for this order item.
     */
    public function returnItems(): HasMany
    {
        return $this->hasMany(ReturnOrderItem::class);
    }

    /**
     * Get the total price attribute (alias for subtotal).
     */
    public function getTotalPriceAttribute(): float
    {
        return (float) $this->subtotal;
    }
}
