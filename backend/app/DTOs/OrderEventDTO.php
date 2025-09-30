<?php

namespace App\DTOs;

use App\Models\Order;

class OrderEventDTO
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly string $orderStatus,
        public readonly string $paymentStatus,
        public readonly string $paymentMethod,
        public readonly float $subtotal,
        public readonly float $shippingCost,
        public readonly float $discount,
        public readonly float $total,
        public readonly ?string $couponCode,
        public readonly ?int $promotionId,
        public readonly ?int $shippingAddressId,
        public readonly ?string $notes,
        public readonly ?string $paymentId,
        public readonly ?array $paymentDetails,
        public readonly string $createdAt,
        public readonly string $updatedAt,
        public readonly ?string $deliveredAt,
        public readonly ?string $cancelledAt,
        public readonly ?string $cancellationReason,
        public readonly ?string $refundedAt,
        public readonly array $items,
        public readonly ?array $shippingAddress,
        public readonly ?array $user,
    ) {}

    /**
     * Create OrderEventDTO from Order model.
     */
    public static function fromOrder(Order $order): self
    {
        // Load relationships for event data
        $order->load(['items.product', 'shippingAddress', 'user']);

        return new self(
            id: $order->id,
            userId: $order->user_id,
            orderStatus: $order->order_status->value,
            paymentStatus: $order->payment_status->value,
            paymentMethod: $order->payment_method->value,
            subtotal: (float) $order->subtotal,
            shippingCost: (float) $order->shipping_cost,
            discount: (float) $order->discount,
            total: (float) $order->total,
            couponCode: $order->coupon_code,
            promotionId: $order->promotion_id,
            shippingAddressId: $order->shipping_address_id,
            notes: $order->notes,
            paymentId: $order->payment_id,
            paymentDetails: $order->payment_details,
            createdAt: $order->created_at->toISOString(),
            updatedAt: $order->updated_at->toISOString(),
            deliveredAt: $order->delivered_at?->toISOString(),
            cancelledAt: $order->cancelled_at?->toISOString(),
            cancellationReason: $order->cancellation_reason,
            refundedAt: $order->refunded_at?->toISOString(),
            items: $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name_en' => $item->product->name_en,
                        'name_ar' => $item->product->name_ar,
                        'sku' => $item->product->sku,
                    ] : null,
                ];
            })->toArray(),
            shippingAddress: $order->shippingAddress ? [
                'id' => $order->shippingAddress->id,
                'first_name' => $order->shippingAddress->first_name,
                'last_name' => $order->shippingAddress->last_name,
                'company' => $order->shippingAddress->company,
                'address_line_1' => $order->shippingAddress->address_line_1,
                'address_line_2' => $order->shippingAddress->address_line_2,
                'city' => $order->shippingAddress->city,
                'state' => $order->shippingAddress->state,
                'postal_code' => $order->shippingAddress->postal_code,
                'country' => $order->shippingAddress->country,
                'phone' => $order->shippingAddress->phone,
            ] : null,
            user: $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
        );
    }

    /**
     * Convert DTO to array.
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->userId,
            'order_status' => $this->orderStatus,
            'payment_status' => $this->paymentStatus,
            'payment_method' => $this->paymentMethod,
            'subtotal' => $this->subtotal,
            'shipping_cost' => $this->shippingCost,
            'discount' => $this->discount,
            'total' => $this->total,
            'coupon_code' => $this->couponCode,
            'promotion_id' => $this->promotionId,
            'shipping_address_id' => $this->shippingAddressId,
            'notes' => $this->notes,
            'payment_id' => $this->paymentId,
            'payment_details' => $this->paymentDetails,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
            'delivered_at' => $this->deliveredAt,
            'cancelled_at' => $this->cancelledAt,
            'cancellation_reason' => $this->cancellationReason,
            'refunded_at' => $this->refundedAt,
            'items' => $this->items,
            'shipping_address' => $this->shippingAddress,
            'user' => $this->user,
        ];
    }
}
