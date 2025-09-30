<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\KafkaService;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    public function __construct(
        private KafkaService $kafkaService
    ) {}

    public function created(Order $order): void
    {
        try {
            // $this->kafkaService->publishOrderCreated($order);
        } catch (\Exception $e) {
            // Log the error but don't fail the order creation
            Log::error('Failed to publish order creation event to Kafka', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
