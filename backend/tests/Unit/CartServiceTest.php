<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Stock\StockService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->inventoryService = $this->mock(StockService::class);
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

        expect($result->isValid)->toBeTrue();
        expect($result->validItems)->toHaveCount(2);
        expect($result->invalidItems)->toHaveCount(0);
        expect($result->errors)->toHaveCount(0);
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

        expect($result->isValid)->toBeFalse();
        expect($result->validItems)->toHaveCount(0);
        expect($result->invalidItems)->toHaveCount(1);
        expect($result->errors)->toHaveCount(1);
        expect($result->errors[0]['type'])->toBe('inactive');
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

        expect($result->isValid)->toBeFalse();
        expect($result->validItems)->toHaveCount(0);
        expect($result->invalidItems)->toHaveCount(1);
        expect($result->errors)->toHaveCount(1);
        expect($result->errors[0]['type'])->toBe('insufficient_stock');
        expect($result->errors[0]['requested_quantity'])->toBe(10);
        expect($result->errors[0]['available_quantity'])->toBe(5.0);
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

        expect($result->isValid)->toBeFalse();
        expect($result->validItems)->toHaveCount(1);
        expect($result->invalidItems)->toHaveCount(2);
        expect($result->errors)->toHaveCount(2);
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

describe('addBundle', function () {
    it('throws exception for inactive bundle', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => false]);

        $this->cartService->addBundle($this->user, $bundle);
    })->throws(\InvalidArgumentException::class, 'Bundle not found or inactive');

    it('throws exception when product is not a bundle', function () {
        $product = Product::factory()->simple()->create(['is_active' => true]);

        $this->cartService->addBundle($this->user, $product);
    })->throws(\InvalidArgumentException::class, 'Product is not a bundle');

    it('throws exception for invalid quantity', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);

        $this->cartService->addBundle($this->user, $bundle, [], 0);
    })->throws(\InvalidArgumentException::class, 'Quantity must be greater than 0');

    it('throws exception when bundle has no items', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);

        $this->cartService->addBundle($this->user, $bundle);
    })->throws(\InvalidArgumentException::class, 'Bundle has no items');

    it('throws exception when bundle product is inactive', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $inactiveProduct = Product::factory()->simple()->create(['is_active' => false]);
        $bundle->bundleItems()->create([
            'product_id' => $inactiveProduct->id,
            'quantity' => 1,
        ]);

        $this->cartService->addBundle($this->user, $bundle);
    })->throws(\InvalidArgumentException::class);

    it('throws exception when variant not selected for configurable product', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->withVariants(2)->create();
        $bundle->bundleItems()->create([
            'product_id' => $configurableProduct->id,
            'quantity' => 1,
        ]);

        $this->cartService->addBundle($this->user, $bundle, []);
    })->throws(\InvalidArgumentException::class, 'Variant must be selected for configurable product');

    it('throws exception when invalid variant selected', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->configurable()->create(['is_active' => true]);
        Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $bundle->bundleItems()->create([
            'product_id' => $configurableProduct->id,
            'quantity' => 1,
        ]);

        $this->cartService->addBundle($this->user, $bundle, [
            $configurableProduct->id => 99999, // Invalid variant ID
        ]);
    })->throws(\InvalidArgumentException::class, 'Invalid or inactive variant selected');

    it('throws exception when stock insufficient for variant', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->withVariants(2)->create();
        $variant = $configurableProduct->variants()->first();
        $bundle->bundleItems()->create([
            'product_id' => $configurableProduct->id,
            'quantity' => 2,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::on(fn ($prod) => $prod->id === $variant->id), 2)
            ->once()
            ->andReturn(false);

        $this->cartService->addBundle($this->user, $bundle, [
            $configurableProduct->id => $variant->id,
        ]);
    })->throws(\RuntimeException::class, 'Insufficient stock for variant');

    it('throws exception when stock insufficient for simple product', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 5]);
        $bundle->bundleItems()->create([
            'product_id' => $simpleProduct->id,
            'quantity' => 2,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::on(fn ($prod) => $prod->id === $simpleProduct->id), 2)
            ->once()
            ->andReturn(false);

        $this->cartService->addBundle($this->user, $bundle, []);
    })->throws(\RuntimeException::class, 'Insufficient stock for product');

    it('adds bundle with simple products successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct1 = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 10]);
        $simpleProduct2 = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 20]);

        $bundle->bundleItems()->create(['product_id' => $simpleProduct1->id, 'quantity' => 1]);
        $bundle->bundleItems()->create(['product_id' => $simpleProduct2->id, 'quantity' => 2]);

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->addBundle($this->user, $bundle, [], 1);

        $cart = $this->user->fresh()->cart;
        expect($cart->items)->toHaveCount(3); // 1 parent + 2 children

        $parentItem = $cart->items()->whereNull('parent_id')->first();
        expect($parentItem)->not->toBeNull();
        expect($parentItem->product_id)->toBe($bundle->id);
        expect($parentItem->quantity)->toBe(1);

        $childItems = $cart->items()->where('parent_id', $parentItem->id)->get();
        expect($childItems)->toHaveCount(2);
    });

    it('adds bundle with configurable products successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->configurable()->create(['is_active' => true]);
        $variant1 = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $variant2 = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $variant3 = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $selectedVariant = $variant2;

        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->addBundle($this->user, $bundle, [
            $configurableProduct->id => $selectedVariant->id,
        ], 1);

        $cart = $this->user->fresh()->cart;
        expect($cart->items)->toHaveCount(2); // 1 parent + 1 child (variant)

        $parentItem = $cart->items()->whereNull('parent_id')->first();
        expect($parentItem->product_id)->toBe($bundle->id);

        $childItem = $cart->items()->where('parent_id', $parentItem->id)->first();
        expect($childItem->product_id)->toBe($selectedVariant->id);
    });

    it('adds bundle with mixed products successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 10]);
        $configurableProduct = Product::factory()->withVariants(2)->create();
        $selectedVariant = $configurableProduct->variants()->first();

        $bundle->bundleItems()->create(['product_id' => $simpleProduct->id, 'quantity' => 2]);
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->addBundle($this->user, $bundle, [
            $configurableProduct->id => $selectedVariant->id,
        ], 2);

        $cart = $this->user->fresh()->cart;
        expect($cart->items)->toHaveCount(3); // 1 parent + 2 children

        $parentItem = $cart->items()->whereNull('parent_id')->first();
        expect($parentItem->quantity)->toBe(2);

        $childItems = $cart->items()->where('parent_id', $parentItem->id)->get();
        expect($childItems)->toHaveCount(2);
    });

    it('creates cart if user does not have one', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 10]);
        $bundle->bundleItems()->create(['product_id' => $simpleProduct->id, 'quantity' => 1]);

        expect($this->user->cart)->toBeNull();

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->addBundle($this->user, $bundle, [], 1);

        $this->user->load('cart');
        expect($this->user->cart)->not->toBeNull();
        expect($this->user->cart->items)->toHaveCount(2);
    });
});

describe('updateBundle', function () {
    it('throws exception when parent cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->updateBundle($this->user, 999, []);
    })->throws(\InvalidArgumentException::class, 'Bundle cart item not found');

    it('throws exception when cart item is not a bundle', function () {
        $product = Product::factory()->simple()->create();
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'parent_id' => null,
        ]);

        $this->cartService->updateBundle($this->user, $cartItem->id, []);
    })->throws(\InvalidArgumentException::class, 'Cart item is not a bundle');

    it('throws exception when bundle is no longer active', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => false]);
        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);

        $this->cartService->updateBundle($this->user, $parentItem->id, []);
    })->throws(\InvalidArgumentException::class, 'Bundle is no longer active');

    it('throws exception when bundle product is inactive', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $inactiveProduct = Product::factory()->simple()->create(['is_active' => false]);
        $bundle->bundleItems()->create(['product_id' => $inactiveProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);

        $this->cartService->updateBundle($this->user, $parentItem->id, []);
    })->throws(\InvalidArgumentException::class);

    it('throws exception when new variant not selected', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->withVariants(2)->create();
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);

        $this->cartService->updateBundle($this->user, $parentItem->id, []);
    })->throws(\InvalidArgumentException::class, 'Variant must be selected for configurable product');

    it('throws exception when new variant is invalid', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->withVariants(2)->create();
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);

        $this->cartService->updateBundle($this->user, $parentItem->id, [
            $configurableProduct->id => 99999,
        ]);
    })->throws(\InvalidArgumentException::class, 'Invalid or inactive variant selected');

    it('throws exception when stock insufficient for new variant', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->configurable()->create(['is_active' => true]);
        $variant1 = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $newVariant = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 2]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
            'quantity' => 3,
        ]);

        $this->inventoryService
            ->shouldReceive('isAvailable')
            ->with(Mockery::on(fn ($prod) => $prod->id === $newVariant->id), 6) // 2 * 3
            ->once()
            ->andReturn(false);

        $this->cartService->updateBundle($this->user, $parentItem->id, [
            $configurableProduct->id => $newVariant->id,
        ]);
    })->throws(\RuntimeException::class, 'Insufficient stock for variant');

    it('updates bundle variants successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $configurableProduct = Product::factory()->withVariants(3)->create();
        $oldVariant = $configurableProduct->variants()->first();
        $newVariant = $configurableProduct->variants()->skip(1)->first();
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
            'quantity' => 2,
        ]);
        $oldChildItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $oldVariant->id,
            'parent_id' => $parentItem->id,
            'quantity' => 1,
        ]);

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->updateBundle($this->user, $parentItem->id, [
            $configurableProduct->id => $newVariant->id,
        ]);

        $cart->refresh();
        expect($cart->items)->toHaveCount(2); // 1 parent + 1 new child

        $parentItem->refresh();
        expect($parentItem->quantity)->toBe(2); // Quantity preserved

        $newChildItem = $cart->items()->where('parent_id', $parentItem->id)->first();
        expect($newChildItem->product_id)->toBe($newVariant->id);
        expect($newChildItem->id)->not->toBe($oldChildItem->id); // New item created
    });

    it('updates bundle with mixed products successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true, 'quantity' => 10]);
        $configurableProduct = Product::factory()->configurable()->create(['is_active' => true]);
        $oldVariant = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);
        $newVariant = Product::factory()->variant($configurableProduct)->create(['is_active' => true]);

        $bundle->bundleItems()->create(['product_id' => $simpleProduct->id, 'quantity' => 1]);
        $bundle->bundleItems()->create(['product_id' => $configurableProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $simpleProduct->id,
            'parent_id' => $parentItem->id,
            'quantity' => 1,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $oldVariant->id,
            'parent_id' => $parentItem->id,
            'quantity' => 1,
        ]);

        $this->inventoryService->shouldReceive('isAvailable')->andReturn(true);

        $this->cartService->updateBundle($this->user, $parentItem->id, [
            $configurableProduct->id => $newVariant->id,
        ]);

        $cart->refresh();
        expect($cart->items)->toHaveCount(3); // 1 parent + 2 children

        $childItems = $cart->items()->where('parent_id', $parentItem->id)->get();
        expect($childItems->pluck('product_id'))->toContain($simpleProduct->id);
        expect($childItems->pluck('product_id'))->toContain($newVariant->id);
        expect($childItems->pluck('product_id'))->not->toContain($oldVariant->id);
    });
});

describe('removeBundle', function () {
    it('throws exception when parent cart item not found', function () {
        Cart::factory()->create(['user_id' => $this->user->id]);

        $this->cartService->removeBundle($this->user, 999);
    })->throws(\InvalidArgumentException::class, 'Bundle cart item not found');

    it('removes bundle and all children successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true]);
        $bundle->bundleItems()->create(['product_id' => $simpleProduct->id, 'quantity' => 1]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);
        $childItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $simpleProduct->id,
            'parent_id' => $parentItem->id,
        ]);

        expect($cart->items)->toHaveCount(2);

        $this->cartService->removeBundle($this->user, $parentItem->id);

        $cart->refresh();
        expect($cart->items)->toHaveCount(0); // Both parent and child removed
    });

    it('removes bundle with multiple children successfully', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $product1 = Product::factory()->simple()->create(['is_active' => true]);
        $product2 = Product::factory()->simple()->create(['is_active' => true]);
        $product3 = Product::factory()->simple()->create(['is_active' => true]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'parent_id' => $parentItem->id,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'parent_id' => $parentItem->id,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product3->id,
            'parent_id' => $parentItem->id,
        ]);

        expect($cart->items)->toHaveCount(4);

        $this->cartService->removeBundle($this->user, $parentItem->id);

        $cart->refresh();
        expect($cart->items)->toHaveCount(0);
    });

    it('does not affect other cart items', function () {
        $bundle = Product::factory()->bundle()->create(['is_active' => true]);
        $simpleProduct = Product::factory()->simple()->create(['is_active' => true]);
        $otherProduct = Product::factory()->simple()->create(['is_active' => true]);

        $cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $parentItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $bundle->id,
            'parent_id' => null,
        ]);
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $simpleProduct->id,
            'parent_id' => $parentItem->id,
        ]);
        $otherItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $otherProduct->id,
            'parent_id' => null,
        ]);

        expect($cart->items)->toHaveCount(3);

        $this->cartService->removeBundle($this->user, $parentItem->id);

        $cart->refresh();
        expect($cart->items)->toHaveCount(1);
        expect($cart->items->first()->id)->toBe($otherItem->id);
    });
});
