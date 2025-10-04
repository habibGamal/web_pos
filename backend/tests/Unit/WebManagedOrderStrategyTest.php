<?php

use App\DTOs\CartValidationResult;
use App\DTOs\OrderPlacementData;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Orders\Strategies\WebManagedOrderStrategy;
use App\Services\Payments\PaymentService;
use App\Services\Stock\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Prevent Order observer from firing to avoid KafkaService dependency
    Order::unsetEventDispatcher();

    $this->user = User::factory()->create();
    $this->cartService = $this->mock(CartService::class);
    $this->paymentService = $this->mock(PaymentService::class);
    $this->stockService = $this->mock(StockService::class);
    $this->strategy = new WebManagedOrderStrategy(
        $this->cartService,
        $this->paymentService,
        $this->stockService
    );
});

describe('placeOrder', function () {
    it('throws exception when validation fails', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(false, [], [1], [['type' => 'inactive']]));

        $this->strategy->placeOrder($this->user, $placementData);
    })->throws(\InvalidArgumentException::class, 'Invalid checkout data or cart items.');

    it('throws exception when address does not exist', function () {
        $placementData = new OrderPlacementData(
            addressId: 999,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $this->strategy->placeOrder($this->user, $placementData);
    })->throws(\InvalidArgumentException::class, 'Invalid checkout data or cart items.');

    it('throws exception when cart is empty', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $emptyCart = Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [], [], []));

        $this->cartService
            ->shouldReceive('getCart')
            ->with($this->user)
            ->once()
            ->andReturn($emptyCart);

        $this->strategy->placeOrder($this->user, $placementData);
    })->throws(\RuntimeException::class, 'Cart is empty.');

    it('throws exception when stock is insufficient', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 5]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $this->cartService
            ->shouldReceive('getCart')
            ->with($this->user)
            ->once()
            ->andReturn($cart);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->twice()
            ->andReturn([
                'available' => false,
                'sufficient' => [],
                'insufficient' => [
                    ['product_id' => $product->id, 'requested' => 10, 'available' => 5],
                ],
            ]);

        $this->strategy->placeOrder($this->user, $placementData);
    })->throws(\RuntimeException::class);

    it('creates order with PROCESSING status for COD payment', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY,
            couponCode: 'TEST123'
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $this->cartService
            ->shouldReceive('getCart')
            ->with($this->user)
            ->once()
            ->andReturn($cart);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->cartService
            ->shouldReceive('clear')
            ->with($this->user)
            ->once();

        $order = $this->strategy->placeOrder($this->user, $placementData);

        expect($order)->toBeInstanceOf(Order::class);
        expect($order->user_id)->toBe($this->user->id);
        expect($order->order_status)->toBe(OrderStatus::PROCESSING);
        expect($order->payment_status)->toBe(PaymentStatus::PENDING);
        expect($order->payment_method)->toBe(PaymentMethod::CASH_ON_DELIVERY);
        expect($order->shipping_address_id)->toBe($address->id);
        expect($order->coupon_code)->toBe('TEST123');
        expect($order->items)->toHaveCount(1);
    });

    it('creates order with PENDING status for online payment', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CREDIT_CARD
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $this->cartService
            ->shouldReceive('getCart')
            ->with($this->user)
            ->once()
            ->andReturn($cart);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->cartService
            ->shouldReceive('clear')
            ->with($this->user)
            ->once();

        $order = $this->strategy->placeOrder($this->user, $placementData);

        expect($order->order_status)->toBe(OrderStatus::PENDING);
        expect($order->payment_method)->toBe(PaymentMethod::CREDIT_CARD);
    });

    it('calculates order totals correctly', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $product1 = Product::factory()->create(['is_active' => true, 'quantity' => 10, 'price' => 100]);
        $product2 = Product::factory()->create(['is_active' => true, 'quantity' => 10, 'price' => 50]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 2,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'quantity' => 3,
        ]);

        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1, 2], [], []));

        $this->cartService
            ->shouldReceive('getCart')
            ->with($this->user)
            ->once()
            ->andReturn($cart);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->cartService
            ->shouldReceive('clear')
            ->with($this->user)
            ->once();

        $order = $this->strategy->placeOrder($this->user, $placementData);

        $expectedSubtotal = (100 * 2) + (50 * 3); // 350
        expect((float) $order->subtotal)->toBe((float) $expectedSubtotal);
        expect((float) $order->total)->toBe((float) $expectedSubtotal);
    });
});

describe('markOutForDelivery', function () {
    it('throws exception when order is not in PROCESSING status', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PENDING]);

        $this->strategy->markOutForDelivery($order);
    })->throws(\RuntimeException::class, 'Order must be in PROCESSING status to mark as out for delivery.');

    it('throws exception when stock is insufficient', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PROCESSING]);
        $product = Product::factory()->create(['quantity' => 5]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->twice()
            ->andReturn([
                'available' => false,
                'sufficient' => [],
                'insufficient' => [
                    ['product_id' => $product->id, 'requested' => 10, 'available' => 5],
                ],
            ]);

        $this->strategy->markOutForDelivery($order);
    })->throws(\RuntimeException::class);

    it('consumes stock and updates order status successfully', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PROCESSING]);
        $product = Product::factory()->create(['quantity' => 10]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->stockService
            ->shouldReceive('consumeOrderStock')
            ->with(Mockery::type(Order::class))
            ->once();

        $this->strategy->markOutForDelivery($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::OUT_FOR_DELIVERY);
    });
});

describe('completeOrder', function () {
    it('throws exception when order cannot be completed', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PENDING]);

        $this->strategy->completeOrder($order);
    })->throws(\RuntimeException::class, 'Order cannot be completed from current status.');

    it('completes order from OUT_FOR_DELIVERY status', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::OUT_FOR_DELIVERY]);

        $this->strategy->completeOrder($order);

        $order->refresh();
        expect($order->order_status)->toBe(OrderStatus::COMPLETED);
        expect($order->delivered_at)->not->toBeNull();
    });

    it('completes order from PROCESSING status', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PROCESSING]);

        $this->strategy->completeOrder($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::COMPLETED);
    });

    it('marks COD payment as paid on completion', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::OUT_FOR_DELIVERY,
            'payment_method' => PaymentMethod::CASH_ON_DELIVERY,
            'payment_status' => PaymentStatus::PENDING,
        ]);

        $this->strategy->completeOrder($order);

        $order->refresh();
        expect($order->payment_status)->toBe(PaymentStatus::PAID);
    });

    it('does not change payment status for already paid orders', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::OUT_FOR_DELIVERY,
            'payment_status' => PaymentStatus::PAID,
        ]);

        $this->strategy->completeOrder($order);

        expect($order->fresh()->payment_status)->toBe(PaymentStatus::PAID);
    });
});

describe('changePaymentMethod', function () {
    it('throws exception when order is not PENDING', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PROCESSING]);

        $this->strategy->changePaymentMethod($order, PaymentMethod::CREDIT_CARD);
    })->throws(\RuntimeException::class, 'Payment method can only be changed for PENDING orders.');

    it('throws exception when order is already paid', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_status' => PaymentStatus::PAID,
        ]);

        $this->strategy->changePaymentMethod($order, PaymentMethod::CASH_ON_DELIVERY);
    })->throws(\RuntimeException::class, 'Cannot change payment method for paid orders.');

    it('changes payment method successfully', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PENDING,
        ]);
        $product = Product::factory()->create(['quantity' => 10]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->changePaymentMethod($order, PaymentMethod::CASH_ON_DELIVERY);

        $order->refresh();
        expect($order->payment_method)->toBe(PaymentMethod::CASH_ON_DELIVERY);
    });

    it('moves order to PROCESSING when switching to COD with available stock', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
        ]);
        $product = Product::factory()->create(['quantity' => 10]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->changePaymentMethod($order, PaymentMethod::CASH_ON_DELIVERY);

        expect($order->fresh()->order_status)->toBe(OrderStatus::PROCESSING);
    });

    it('keeps order PENDING when switching to COD without available stock', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
        ]);
        $product = Product::factory()->create(['quantity' => 2]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => false, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->changePaymentMethod($order, PaymentMethod::CASH_ON_DELIVERY);

        expect($order->fresh()->order_status)->toBe(OrderStatus::PENDING);
    });
});

describe('validateStockAvailability', function () {
    it('returns true when stock is available', function () {
        $items = [
            ['product_id' => 1, 'quantity' => 5],
            ['product_id' => 2, 'quantity' => 3],
        ];

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->with($items)
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $result = $this->strategy->validateStockAvailability($items);

        expect($result)->toBeTrue();
    });

    it('returns false when stock is unavailable', function () {
        $items = [
            ['product_id' => 1, 'quantity' => 10],
        ];

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->with($items)
            ->once()
            ->andReturn(['available' => false, 'sufficient' => [], 'insufficient' => [['product_id' => 1]]]);

        $result = $this->strategy->validateStockAvailability($items);

        expect($result)->toBeFalse();
    });
});

describe('payOrder', function () {
    it('throws exception for COD payment method', function () {
        $order = Order::factory()->create(['payment_method' => PaymentMethod::CASH_ON_DELIVERY]);

        $this->strategy->payOrder($order, ['gateway' => 'paymob']);
    })->throws(\LogicException::class, 'Payment initiation is only applicable for online payment methods.');

    it('throws exception for invalid payment data', function () {
        $order = Order::factory()->create(['payment_method' => PaymentMethod::CREDIT_CARD]);

        $this->paymentService
            ->shouldReceive('validatePaymentData')
            ->with('paymob', ['gateway' => 'paymob'])
            ->once()
            ->andReturn(false);

        $this->strategy->payOrder($order, ['gateway' => 'paymob']);
    })->throws(\InvalidArgumentException::class, 'Invalid payment data for gateway.');

    it('initiates payment successfully', function () {
        $order = Order::factory()->create(['payment_method' => PaymentMethod::CREDIT_CARD]);
        $paymentData = ['gateway' => 'paymob', 'card_number' => '4111111111111111'];
        $paymentResult = ['transaction_id' => 'TXN123', 'redirect_url' => 'https://payment.gateway/pay'];

        $this->paymentService
            ->shouldReceive('validatePaymentData')
            ->with('paymob', $paymentData)
            ->once()
            ->andReturn(true);

        $this->paymentService
            ->shouldReceive('initiatePayment')
            ->with(Mockery::type(Order::class), 'paymob', $paymentData)
            ->once()
            ->andReturn($paymentResult);

        $result = $this->strategy->payOrder($order, $paymentData);

        expect($result)->toBe($paymentResult);
        $order->refresh();
        expect($order->payment_id)->toBe('TXN123');
        expect($order->payment_status)->toBe(PaymentStatus::PENDING);
    });
});

describe('confirmOrder', function () {
    it('does nothing for cancelled orders', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::CANCELLED]);

        $this->strategy->confirmOrder($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::CANCELLED);
    });

    it('does nothing for completed orders', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::COMPLETED]);

        $this->strategy->confirmOrder($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::COMPLETED);
    });

    it('does not confirm online payment orders with unpaid status', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PENDING,
        ]);

        $this->strategy->confirmOrder($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::PENDING);
    });

    it('confirms order when payment is completed', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PAID,
        ]);
        $product = Product::factory()->create(['quantity' => 10]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->confirmOrder($order);

        expect($order->fresh()->order_status)->toBe(OrderStatus::PROCESSING);
    });

    it('rejects order when stock is unavailable', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PAID,
        ]);
        $product = Product::factory()->create(['quantity' => 2]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->twice()
            ->andReturn([
                'available' => false,
                'sufficient' => [],
                'insufficient' => [['product_id' => $product->id, 'requested' => 10, 'available' => 2]],
            ]);

        $this->strategy->confirmOrder($order);

        $order->refresh();
        expect($order->order_status)->toBe(OrderStatus::REJECTED);
        expect($order->cancellation_reason)->toContain('Stock unavailable');
    });
});

describe('cancelOrder', function () {
    it('does nothing for already cancelled orders', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::CANCELLED]);

        $this->strategy->cancelOrder($order, 'Duplicate cancellation');

        expect($order->fresh()->order_status)->toBe(OrderStatus::CANCELLED);
    });

    it('cancels order without releasing stock for PENDING orders', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::PENDING]);

        $this->strategy->cancelOrder($order, 'Customer request');

        $order->refresh();
        expect($order->order_status)->toBe(OrderStatus::CANCELLED);
        expect($order->cancelled_at)->not->toBeNull();
        expect($order->cancellation_reason)->toBe('Customer request');
    });

    it('cancels order and releases stock for OUT_FOR_DELIVERY orders', function () {
        $order = Order::factory()->create(['order_status' => OrderStatus::OUT_FOR_DELIVERY]);
        $product = Product::factory()->create(['quantity' => 5]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->stockService
            ->shouldReceive('releaseOrderStock')
            ->with(Mockery::type(Order::class), true)
            ->once();

        $this->strategy->cancelOrder($order, 'Customer changed mind');

        expect($order->fresh()->order_status)->toBe(OrderStatus::CANCELLED);
    });

    it('attempts refund for paid online orders', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PAID,
            'total' => 100.00,
            'payment_details' => json_encode(['gateway' => 'paymob']),
        ]);

        $this->paymentService
            ->shouldReceive('refund')
            ->with(Mockery::type(Order::class), 'paymob', 100.00)
            ->once()
            ->andReturn(true);

        $this->strategy->cancelOrder($order, 'Refund test');

        $order->refresh();
        expect($order->payment_status)->toBe(PaymentStatus::REFUNDED);
        expect($order->refunded_at)->not->toBeNull();
    });

    it('handles refund failure gracefully', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PROCESSING,
            'payment_method' => PaymentMethod::CREDIT_CARD,
            'payment_status' => PaymentStatus::PAID,
            'payment_details' => json_encode(['gateway' => 'paymob']),
        ]);

        $this->paymentService
            ->shouldReceive('refund')
            ->once()
            ->andThrow(new \Exception('Gateway error'));

        $this->strategy->cancelOrder($order, 'Refund failure test');

        $order->refresh();
        expect($order->order_status)->toBe(OrderStatus::CANCELLED);
        expect($order->payment_status)->toBe(PaymentStatus::PAID);
    });
});

describe('handleOrderAfterPayment', function () {
    it('marks payment as paid', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::COMPLETED,
            'payment_status' => PaymentStatus::PENDING,
        ]);

        $this->strategy->handleOrderAfterPayment($order);

        expect($order->fresh()->payment_status)->toBe(PaymentStatus::PAID);
    });

    it('moves PENDING order to PROCESSING when stock is available', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_status' => PaymentStatus::PENDING,
        ]);
        $product = Product::factory()->create(['quantity' => 10]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => true, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->handleOrderAfterPayment($order);

        $order->refresh();
        expect($order->payment_status)->toBe(PaymentStatus::PAID);
        expect($order->order_status)->toBe(OrderStatus::PROCESSING);
    });

    it('rejects PENDING order when stock is unavailable', function () {
        $order = Order::factory()->create([
            'order_status' => OrderStatus::PENDING,
            'payment_status' => PaymentStatus::PENDING,
        ]);
        $product = Product::factory()->create(['quantity' => 2]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $this->stockService
            ->shouldReceive('validateOrderStock')
            ->once()
            ->andReturn(['available' => false, 'sufficient' => [], 'insufficient' => []]);

        $this->strategy->handleOrderAfterPayment($order);

        $order->refresh();
        expect($order->order_status)->toBe(OrderStatus::REJECTED);
        expect($order->cancellation_reason)->toBe('Stock unavailable after payment');
    });
});

describe('validateOrderPlacement', function () {
    it('returns false when cart validation fails', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(false, [], [1], []));

        $result = $this->strategy->validateOrderPlacement($this->user, $placementData);

        expect($result)->toBeFalse();
    });

    it('returns false when address does not exist', function () {
        $placementData = new OrderPlacementData(
            addressId: 999,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $result = $this->strategy->validateOrderPlacement($this->user, $placementData);

        expect($result)->toBeFalse();
    });

    it('returns false when address belongs to different user', function () {
        $otherUser = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $otherUser->id]);
        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $result = $this->strategy->validateOrderPlacement($this->user, $placementData);

        expect($result)->toBeFalse();
    });

    it('returns true when all validations pass', function () {
        $address = Address::factory()->create(['user_id' => $this->user->id]);
        $placementData = new OrderPlacementData(
            addressId: $address->id,
            paymentMethod: PaymentMethod::CASH_ON_DELIVERY
        );

        $this->cartService
            ->shouldReceive('validateCartItems')
            ->with($this->user)
            ->once()
            ->andReturn(new CartValidationResult(true, [1], [], []));

        $result = $this->strategy->validateOrderPlacement($this->user, $placementData);

        expect($result)->toBeTrue();
    });
});
