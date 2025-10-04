<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Inventory\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->inventoryService = $this->mock(InventoryService::class);
    $this->cartService = new CartService($this->inventoryService);
});

describe('getCart', function () {
    it('returns existing cart for user', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);

        $result = $this->cartService->getCart($this->user);

        expect($result)->toBeInstanceOf(Cart::class);
        expect($result->id)->toBe($cart->id);
    });

    it('creates new cart if user does not have one', function () {
        expect($this->user->cart)->toBeNull();

        $result = $this->cartService->getCart($this->user);

        expect($result)->toBeInstanceOf(Cart::class);
        expect($result->user_id)->toBe($this->user->id);
        expect($this->user->fresh()->cart)->not->toBeNull();
    });
});

describe('add', function () {
    it('throws exception for inactive product', function () {
        $product = Product::factory()->create(['is_active' => false]);

        $this->cartService->add($this->user, $product, 1);
    })->throws(\InvalidArgumentException::class, 'Product not found or inactive');

    it('throws exception for invalid quantity', function () {
        $product = Product::factory()->create(['is_active' => true]);

        $this->cartService->add($this->user, $product, 0);
    })->throws(\InvalidArgumentException::class, 'Quantity must be greater than 0');

    it('throws exception when stock is insufficient', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 5]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with($product, 10)
            ->once()
            ->andReturn(false);

        $this->cartService->add($this->user, $product, 10);
    })->throws(\RuntimeException::class, 'Insufficient stock available');

    it('adds new item to cart when stock is available', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with($product, 2)
            ->once()
            ->andReturn(true);

        $this->cartService->add($this->user, $product, 2);

        expect($this->user->cart->items)->toHaveCount(1);
        expect($this->user->cart->items->first()->product_id)->toBe($product->id);
        expect($this->user->cart->items->first()->quantity)->toBe(2);
    });

    it('updates quantity for existing item with same options', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'options' => [],
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with($product, 5)
            ->once()
            ->andReturn(true);

        $this->cartService->add($this->user, $product, 3);

        expect($this->user->cart->items)->toHaveCount(1);
        expect($this->user->cart->items->first()->quantity)->toBe(5);
    });

    it('adds separate item for different options', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'options' => ['color' => 'red'],
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with($product, 3)
            ->once()
            ->andReturn(true);

        $this->cartService->add($this->user, $product, 3, ['color' => 'blue']);

        expect($this->user->cart->items)->toHaveCount(2);
    });

    it('creates cart if user does not have one', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 10]);

        expect($this->user->cart)->toBeNull();

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with($product, 1)
            ->once()
            ->andReturn(true);

        $this->cartService->add($this->user, $product, 1);
        $this->user->load('cart');
        expect($this->user->cart)->not->toBeNull();
        expect($this->user->cart->items)->toHaveCount(1);
    });
});

describe('remove', function () {
    it('throws exception when cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->remove($this->user, 999);
    })->throws(\InvalidArgumentException::class, 'Cart item not found');

    it('removes item from cart successfully', function () {
        $product = Product::factory()->create();
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        expect($cart->items)->toHaveCount(1);

        $this->cartService->remove($this->user, $cartItem->id);

        expect($cart->fresh()->items)->toHaveCount(0);
    });
});

describe('increment', function () {
    it('throws exception for invalid quantity', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create(['cart_id' => $cart->id]);

        $this->cartService->increment($this->user, $cartItem->id, 0);
    })->throws(\InvalidArgumentException::class, 'Quantity must be greater than 0');

    it('throws exception when cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->increment($this->user, 999, 1);
    })->throws(\InvalidArgumentException::class, 'Cart item not found');

    it('throws exception when stock is insufficient', function () {
        $product = Product::factory()->create(['quantity' => 5]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 5)
            ->once()
            ->andReturn(false);

        $this->cartService->increment($this->user, $cartItem->id, 2);
    })->throws(\RuntimeException::class, 'Insufficient stock available');

    it('increments quantity successfully', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 5)
            ->once()
            ->andReturn(true);

        $this->cartService->increment($this->user, $cartItem->id, 3);

        expect($cartItem->fresh()->quantity)->toBe(5);
    });
});

describe('decrement', function () {
    it('throws exception for invalid quantity', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create(['cart_id' => $cart->id]);

        $this->cartService->decrement($this->user, $cartItem->id, 0);
    })->throws(\InvalidArgumentException::class, 'Quantity must be greater than 0');

    it('throws exception when cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->decrement($this->user, 999, 1);
    })->throws(\InvalidArgumentException::class, 'Cart item not found');

    it('decrements quantity successfully', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->cartService->decrement($this->user, $cartItem->id, 2);

        expect($cartItem->fresh()->quantity)->toBe(3);
    });

    it('removes item when quantity becomes zero', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->cartService->decrement($this->user, $cartItem->id, 2);

        expect($cart->fresh()->items)->toHaveCount(0);
    });

    it('removes item when quantity becomes negative', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->cartService->decrement($this->user, $cartItem->id, 5);

        expect($cart->fresh()->items)->toHaveCount(0);
    });
});

describe('clear', function () {
    it('removes all items from cart', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->count(3)->create(['cart_id' => $cart->id]);

        expect($cart->items)->toHaveCount(3);

        $this->cartService->clear($this->user);

        expect($cart->fresh()->items)->toHaveCount(0);
    });

    it('handles empty cart gracefully', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);

        expect($cart->items)->toHaveCount(0);

        $this->cartService->clear($this->user);

        expect($cart->fresh()->items)->toHaveCount(0);
    });
});

describe('validateCartItems', function () {
    it('returns valid when all items are available', function () {
        $product1 = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $product2 = Product::factory()->create(['is_active' => true, 'quantity' => 5]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $item1 = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 2,
        ]);
        $item2 = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'quantity' => 1,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 2)
            ->once()
            ->andReturn(true);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 1)
            ->once()
            ->andReturn(true);

        $result = $this->cartService->validateCartItems($this->user);

        expect($result['is_valid'])->toBeTrue();
        expect($result['valid_items'])->toHaveCount(2);
        expect($result['invalid_items'])->toHaveCount(0);
        expect($result['errors'])->toHaveCount(0);
    });

    it('identifies inactive products', function () {
        $product = Product::factory()->create(['is_active' => false]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $result = $this->cartService->validateCartItems($this->user);

        expect($result['is_valid'])->toBeFalse();
        expect($result['valid_items'])->toHaveCount(0);
        expect($result['invalid_items'])->toHaveCount(1);
        expect($result['errors'])->toHaveCount(1);
        expect($result['errors'][0]['type'])->toBe('inactive');
    });

    it('identifies insufficient stock', function () {
        $product = Product::factory()->create(['is_active' => true, 'quantity' => 5]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 10,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 10)
            ->once()
            ->andReturn(false);

        $this->inventoryService
            ->shouldReceive('getAvailableStock')
            ->with(Mockery::type(Product::class))
            ->once()
            ->andReturn(5);

        $result = $this->cartService->validateCartItems($this->user);

        expect($result['is_valid'])->toBeFalse();
        expect($result['valid_items'])->toHaveCount(0);
        expect($result['invalid_items'])->toHaveCount(1);
        expect($result['errors'])->toHaveCount(1);
        expect($result['errors'][0]['type'])->toBe('insufficient_stock');
        expect($result['errors'][0]['requested_quantity'])->toBe(10);
        expect($result['errors'][0]['available_quantity'])->toBe(5);
    });

    it('handles mixed valid and invalid items', function () {
        $validProduct = Product::factory()->create(['is_active' => true, 'quantity' => 10]);
        $inactiveProduct = Product::factory()->create(['is_active' => false]);
        $lowStockProduct = Product::factory()->create(['is_active' => true, 'quantity' => 2]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $validProduct->id,
            'quantity' => 2,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $inactiveProduct->id,
            'quantity' => 1,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $lowStockProduct->id,
            'quantity' => 5,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 2)
            ->once()
            ->andReturn(true);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 5)
            ->once()
            ->andReturn(false);

        $this->inventoryService
            ->shouldReceive('getAvailableStock')
            ->with(Mockery::type(Product::class))
            ->once()
            ->andReturn(2);

        $result = $this->cartService->validateCartItems($this->user);

        expect($result['is_valid'])->toBeFalse();
        expect($result['valid_items'])->toHaveCount(1);
        expect($result['invalid_items'])->toHaveCount(2);
        expect($result['errors'])->toHaveCount(2);
    });
});

describe('updateQuantity', function () {
    it('throws exception for negative quantity', function () {
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create(['cart_id' => $cart->id]);

        $this->cartService->updateQuantity($this->user, $cartItem->id, -1);
    })->throws(\InvalidArgumentException::class, 'Quantity cannot be negative');

    it('throws exception when cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->updateQuantity($this->user, 999, 5);
    })->throws(\InvalidArgumentException::class, 'Cart item not found');

    it('removes item when quantity is zero', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->cartService->updateQuantity($this->user, $cartItem->id, 0);

        expect($cart->fresh()->items)->toHaveCount(0);
    });

    it('throws exception when stock is insufficient', function () {
        $product = Product::factory()->create(['quantity' => 5]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 10)
            ->once()
            ->andReturn(false);

        $this->cartService->updateQuantity($this->user, $cartItem->id, 10);
    })->throws(\RuntimeException::class, 'Insufficient stock available');

    it('updates quantity successfully', function () {
        $product = Product::factory()->create(['quantity' => 10]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::type(Product::class), 7)
            ->once()
            ->andReturn(true);

        $this->cartService->updateQuantity($this->user, $cartItem->id, 7);

        expect($cartItem->fresh()->quantity)->toBe(7);
    });
});
