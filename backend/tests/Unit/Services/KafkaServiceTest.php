<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\User;
use App\Services\KafkaService;
use Illuminate\Support\Facades\Log;
use Junges\Kafka\Facades\Kafka;

beforeEach(function () {
    $this->kafkaService = new KafkaService;
});

test('can get topic name with app name', function () {
    config(['app.name' => 'TestApp']);
    $service = new KafkaService;

    expect($service->getTopicName())->toBe('testapp_orders');
});

test('can publish order created event successfully', function () {
    // Arrange
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::PROCESSING,
        'payment_status' => PaymentStatus::PENDING,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    // Mock Kafka
    $kafkaProducer = Mockery::mock();
    $kafkaProducer->shouldReceive('withBody')
        ->once()
        ->with(Mockery::type('array'))
        ->andReturnSelf();
    $kafkaProducer->shouldReceive('send')->once();

    Kafka::shouldReceive('publish')
        ->once()
        ->with('moda1_orders')
        ->andReturn($kafkaProducer);

    Log::shouldReceive('info')->once();

    // Act
    $result = $this->kafkaService->publishOrderCreated($order);

    // Assert
    expect($result)->toBeTrue();
});

test('handles kafka publish failure gracefully for order created', function () {
    // Arrange
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::PROCESSING,
        'payment_status' => PaymentStatus::PENDING,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    // Mock Kafka to throw exception
    Kafka::shouldReceive('publish')
        ->once()
        ->andThrow(new Exception('Kafka connection failed'));

    Log::shouldReceive('error')->once();

    // Act
    $result = $this->kafkaService->publishOrderCreated($order);

    // Assert
    expect($result)->toBeFalse();
});

test('can publish order updated event successfully', function () {
    // Arrange
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::SHIPPED,
        'payment_status' => PaymentStatus::PAID,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    // Mock Kafka
    $kafkaProducer = Mockery::mock();
    $kafkaProducer->shouldReceive('withBody')
        ->once()
        ->with(Mockery::type('array'))
        ->andReturnSelf();
    $kafkaProducer->shouldReceive('send')->once();

    Kafka::shouldReceive('publish')
        ->once()
        ->with('moda1_orders')
        ->andReturn($kafkaProducer);

    Log::shouldReceive('info')->once();

    // Act
    $result = $this->kafkaService->publishOrderUpdated($order);

    // Assert
    expect($result)->toBeTrue();
});

test('handles kafka publish failure gracefully for order updated', function () {
    // Arrange
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::DELIVERED,
        'payment_status' => PaymentStatus::PAID,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    // Mock Kafka to throw exception
    Kafka::shouldReceive('publish')
        ->once()
        ->andThrow(new Exception('Kafka connection failed'));

    Log::shouldReceive('error')->once();

    // Act
    $result = $this->kafkaService->publishOrderUpdated($order);

    // Assert
    expect($result)->toBeFalse();
});

test('published message contains correct event structure for order created', function () {
    // Arrange
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'order_status' => OrderStatus::PROCESSING,
        'payment_status' => PaymentStatus::PENDING,
        'payment_method' => PaymentMethod::CREDIT_CARD,
    ]);

    $capturedMessage = null;

    // Mock Kafka to capture the message
    $kafkaProducer = Mockery::mock();
    $kafkaProducer->shouldReceive('withBody')
        ->once()
        ->with(Mockery::on(function ($message) use (&$capturedMessage) {
            $capturedMessage = $message;

            return true;
        }))
        ->andReturnSelf();
    $kafkaProducer->shouldReceive('send')->once();

    Kafka::shouldReceive('publish')
        ->once()
        ->with('moda1_orders')
        ->andReturn($kafkaProducer);

    Log::shouldReceive('info')->once();

    // Act
    $this->kafkaService->publishOrderCreated($order);

    // Assert
    expect($capturedMessage)->toHaveKeys(['event_type', 'timestamp', 'data']);
    expect($capturedMessage['event_type'])->toBe('order_created');
    expect($capturedMessage['data'])->toHaveKeys(['id', 'user_id', 'order_status', 'payment_status']);
    expect($capturedMessage['data']['id'])->toBe($order->id);
    expect($capturedMessage['data']['user_id'])->toBe($order->user_id);
});
