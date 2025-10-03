<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Cart;

use App\Models\CartItem;
use App\Models\Product;
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
        $productId = (int) $args['product_id'];
        $quantity = $args['quantity'];
        $options = $args['options'] ?? null;

        // Validate quantity
        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'The quantity field must be at least 1.',
            ]);
        }

        // Validate options if provided (should be valid JSON)
        if ($options !== null) {
            $decodedOptions = json_decode($options, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw ValidationException::withMessages([
                    'options' => 'The options field must be valid JSON.',
                ]);
            }
        }

        // Validate the product exists and is active
        $product = Product::where('id', $productId)
            ->where('is_active', true)
            ->first();

        if (! $product) {
            throw ValidationException::withMessages([
                'product_id' => 'Product not found or inactive.',
            ]);
        }

        // For variants, check if parent is active. For simple products, there's no parent.
        if ($product->parent_id) {
            $parent = $product->parent;
            if (! $parent || ! $parent->is_active) {
                throw ValidationException::withMessages([
                    'product_id' => 'Parent product is not active.',
                ]);
            }
        }

        // Get or create cart
        $cart = $this->cartService->getOrCreateCart();

        // Decode options for proper comparison
        $decodedOptions = $options ? json_decode($options, true) : null;

        // Check if item already exists in cart with same options
        $existingItem = null;
        foreach ($cart->items()->where('product_id', $productId)->get() as $item) {
            // Compare options arrays
            if ($decodedOptions === null && $item->options === null) {
                $existingItem = $item;
                break;
            } elseif ($decodedOptions !== null && $item->options !== null) {
                // Sort both arrays for comparison to handle different key orders
                ksort($decodedOptions);
                $itemOptions = $item->options;
                ksort($itemOptions);
                if ($decodedOptions === $itemOptions) {
                    $existingItem = $item;
                    break;
                }
            }
        }

        if ($existingItem) {
            // Add to existing quantity
            return $this->cartService->addToCart($existingItem, $quantity);
        } else {
            // Create new cart item
            $cartItem = new CartItem([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
                'options' => $decodedOptions,
            ]);
            $cartItem->save();

            return $cartItem;
        }
    }
}
