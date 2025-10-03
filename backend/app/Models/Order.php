<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Observers\OrderObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[ObservedBy([OrderObserver::class])]
class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'order_status',
        'payment_status',
        'payment_method',
        'subtotal',
        'shipping_cost',
        'discount',
        'total',
        'coupon_code',
        'promotion_id',
        'shipping_address_id',
        'notes',
        'payment_id',
        'payment_details',
        'delivered_at',
        'cancelled_at',
        'cancellation_reason',
        'refunded_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'order_status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
        'payment_method' => PaymentMethod::class,
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'needs_refund',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the shipping address for the order.
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    /**
     * Get the items for the order.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the promotion applied to the order.
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Get the return orders for this order.
     */
    public function returnOrders(): HasMany
    {
        return $this->hasMany(ReturnOrder::class);
    }

    /**
     * Check if the order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->order_status, [OrderStatus::PROCESSING, OrderStatus::SHIPPED]);
    }

    /**
     * Check if the order can be returned.
     */
    public function canBeReturned(): bool
    {
        // Business logic: Orders can be returned if they're DELIVERED and within return window
        if ($this->order_status !== OrderStatus::DELIVERED || ! $this->delivered_at) {
            return false;
        }

        // Allow returns within 30 days of delivery
        $returnWindow = now()->subDays(30);

        return $this->delivered_at->greaterThan($returnWindow);
    }

    /**
     * Check if the order needs a refund.
     */
    public function needsRefund(): bool
    {
        return $this->order_status === OrderStatus::CANCELLED &&
            $this->payment_status === PaymentStatus::PAID &&
            ! $this->payment_method->isCOD();
    }

    /**
     * Get the needsRefund attribute.
     */
    public function getNeedsRefundAttribute(): bool
    {
        return $this->needsRefund();
    }

    /**
     * Scope a query to only include processing orders.
     */
    public function scopeProcessing($query)
    {
        return $query->where('order_status', OrderStatus::PROCESSING);
    }

    /**
     * Scope a query to only include delivery orders (shipped and delivered).
     */
    public function scopeDelivery($query)
    {
        return $query->where('order_status', OrderStatus::SHIPPED);
    }

    /**
     * Scope a query to only include delivery orders (shipped and delivered).
     */
    public function scopeCompleted($query)
    {
        return $query->where('order_status', OrderStatus::DELIVERED)
            ->whereNull('return_status');
    }

    /**
     * Scope a query to only include cancelled orders.
     */
    public function scopeCancelled($query)
    {
        return $query->where('order_status', OrderStatus::CANCELLED);
    }

    /**
     * Scope a query to only include orders that need refunds.
     */
    public function scopeNeedsRefund($query)
    {
        return $query->where('order_status', OrderStatus::CANCELLED)
            ->where('payment_status', PaymentStatus::PAID)
            ->whereNot('payment_method', PaymentMethod::CASH_ON_DELIVERY);
    }

    /**
     * Get the currency code for the order.
     */
    public function getCurrency(): string
    {
        return 'EGP';
    }
}
