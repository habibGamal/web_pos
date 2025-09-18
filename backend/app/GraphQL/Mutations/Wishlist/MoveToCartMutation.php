<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Wishlist;

use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\CartItemResolverService;
use App\Services\CartService;
use App\Services\WishlistService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class MoveToCartMutation
{
    public function __construct(
        protected WishlistService $wishlistService,
        protected CartService $cartService,
        protected CartItemResolverService $cartItemResolver
    ) {}

    /**
     * Move a product from wishlist to cart.
     */
    public function __invoke($root, array $args, GraphQLContext $context): CartItem
    {
        $user = Auth::user();
        $productId = (int) $args['product_id'];
        $variantId = (int) $args['product_variant_id'];
        $quantity = $args['quantity'];

        return DB::transaction(function () use ($user, $productId, $variantId, $quantity) {
            // Verify product is in wishlist
            $wishlistItem = $user->wishlistItems()
                ->where('product_id', $productId)
                ->first();

            if (! $wishlistItem) {
                throw ValidationException::withMessages([
                    'product_id' => 'Product not found in your wishlist.',
                ]);
            }

            // Verify variant belongs to the product
            $variant = ProductVariant::where('id', $variantId)
                ->where('product_id', $productId)
                ->where('is_active', true)
                ->first();

            if (! $variant) {
                throw ValidationException::withMessages([
                    'product_variant_id' => 'Product variant does not belong to the specified product.',
                ]);
            }

            // Get or create cart
            $cart = $this->cartService->getOrCreateCart();

            // Check if item already exists in cart
            $existingCartItem = $cart->items()
                ->where('product_variant_id', $variantId)
                ->first();

            if ($existingCartItem) {
                // Add to existing quantity
                $cartItem = $this->cartService->addToCart($existingCartItem, $quantity);
            } else {
                // Get the resolved cart item and set quantity
                $cartItem = $this->cartItemResolver->resolveCartItem($cart, $productId, $variantId);
                $cartItem->quantity = $quantity;
                $cartItem->save();
            }

            // Remove from wishlist
            $this->wishlistService->removeItem($user, $productId);

            return $cartItem->load(['product', 'variant']);
        });
    }
}
