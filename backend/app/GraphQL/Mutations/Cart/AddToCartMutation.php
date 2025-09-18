<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Cart;

use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\CartItemResolverService;
use App\Services\CartService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class AddToCartMutation
{
    public function __construct(
        protected CartService $cartService,
        protected CartItemResolverService $cartItemResolver
    ) {}

    /**
     * Add a product variant to the cart.
     */
    public function __invoke($root, array $args, GraphQLContext $context): CartItem
    {
        $user = Auth::user();
        $variantId = $args['product_variant_id'];
        $quantity = $args['quantity'];

        // Validate quantity
        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'The quantity field must be at least 1.',
            ]);
        }

        // Validate the product variant exists and is active
        $variant = ProductVariant::where('id', $variantId)
            ->where('is_active', true)
            ->with('product')
            ->first();

        if (! $variant) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Product variant not found or inactive.',
            ]);
        }

        if (! $variant->product->is_active) {
            throw ValidationException::withMessages([
                'product_variant_id' => 'Product is not active.',
            ]);
        }

        // Get or create cart
        $cart = $this->cartService->getOrCreateCart();

        // Check if item already exists in cart
        $existingItem = $cart->items()
            ->where('product_variant_id', $variantId)
            ->first();

        if ($existingItem) {
            // Add to existing quantity
            return $this->cartService->addToCart($existingItem, $quantity);
        } else {
            // Get the resolved cart item (without quantity set)
            $cartItem = $this->cartItemResolver->resolveCartItem($cart, $variant->product_id, (int) $variantId);

            // Set the quantity and save
            $cartItem->quantity = $quantity;
            $cartItem->save();

            return $cartItem;
        }
    }
}
