<?php

namespace App\Services;

use App\DTOs\OrderEventDTO;
use App\Models\Order;
use Exception;
use Illuminate\Support\Facades\Log;
use Junges\Kafka\Facades\Kafka;

class KafkaService
{
    private string $topicName;

    public function __construct()
    {
        $appName = config('app.name');
        $this->topicName = strtolower($appName) . '_orders';
    }

    /**
     * Publish order creation event to Kafka.
     */
    public function publishOrderCreated(Order $order): bool
    {
        try {
            $orderEventData = OrderEventDTO::fromOrder($order);

            $message = [
                'event_type' => 'order_created',
                'timestamp' => now()->toISOString(),
                'data' => $orderEventData->toArray(),
            ];

            Kafka::publish()
                ->onTopic($this->topicName)
                ->withBody($message)
                ->send();

            Log::info('Order creation event published to Kafka', [
                'order_id' => $order->id,
                'topic' => $this->topicName,
                'event_type' => 'order_created',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to publish order creation event to Kafka', [
                'order_id' => $order->id,
                'topic' => $this->topicName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Publish order updated event to Kafka.
     */
    public function publishOrderUpdated(Order $order): bool
    {
        try {
            $orderEventData = OrderEventDTO::fromOrder($order);

            $message = [
                'event_type' => 'order_updated',
                'timestamp' => now()->toISOString(),
                'data' => $orderEventData->toArray(),
            ];

            Kafka::publish($this->topicName)
                ->withBody($message)
                ->send();

            Log::info('Order update event published to Kafka', [
                'order_id' => $order->id,
                'topic' => $this->topicName,
                'event_type' => 'order_updated',
            ]);

            return true;
        } catch (Exception $e) {
            Log::error('Failed to publish order update event to Kafka', [
                'order_id' => $order->id,
                'topic' => $this->topicName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Get the Kafka topic name for orders.
     */
    public function getTopicName(): string
    {
        return $this->topicName;
    }
}
