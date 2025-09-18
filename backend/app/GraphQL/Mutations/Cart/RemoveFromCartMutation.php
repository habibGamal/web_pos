<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Cart;

use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class RemoveFromCartMutation
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Remove an item from the cart.
     */
    public function __invoke($root, array $args, GraphQLContext $context): bool
    {
        $user = Auth::user();
        $cartItemId = $args['cart_item_id'];

        // Find the cart item and verify it belongs to the current user
        $cartItem = CartItem::whereHas('cart', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->find($cartItemId);

        if (! $cartItem) {
            throw ValidationException::withMessages([
                'cart_item_id' => 'Cart item not found or access denied.',
            ]);
        }

        return $this->cartService->removeFromCart($cartItem);
    }
}
