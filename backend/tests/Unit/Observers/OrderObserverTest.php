<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Services\KafkaService;
use Illuminate\Support\Facades\Log;

test('calls kafka service when order is created', function () {
    // Arrange
    $kafkaService = Mockery::mock(KafkaService::class);
    $observer = new OrderObserver($kafkaService);

    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::PROCESSING,
        'payment_status' => PaymentStatus::PENDING,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    $kafkaService->shouldReceive('publishOrderCreated')
        ->once()
        ->with($order);

    // Act
    $observer->created($order);

    // Assert is handled by Mockery expectations
});

test('handles kafka service exception gracefully', function () {
    // Arrange
    $kafkaService = Mockery::mock(KafkaService::class);
    $observer = new OrderObserver($kafkaService);

    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::PROCESSING,
        'payment_status' => PaymentStatus::PENDING,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    $kafkaService->shouldReceive('publishOrderCreated')
        ->once()
        ->with($order)
        ->andThrow(new Exception('Kafka service failed'));

    Log::shouldReceive('error')->once();

    // Act & Assert - should not throw exception
    expect(fn () => $observer->created($order))->not->toThrow();
});
