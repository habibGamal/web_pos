<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Cart;

use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UpdateCartItemMutation
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Update the quantity of a cart item.
     */
    public function __invoke($root, array $args, GraphQLContext $context): ?CartItem
    {
        $user = Auth::user();
        $cartItemId = $args['cart_item_id'];
        $quantity = $args['quantity'];

        // Find the cart item and verify it belongs to the current user
        $cartItem = CartItem::whereHas('cart', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->find($cartItemId);

        if (! $cartItem) {
            throw ValidationException::withMessages([
                'cart_item_id' => 'Cart item not found or access denied.',
            ]);
        }

        // If quantity is 0, remove the item
        if ($quantity === 0) {
            $this->cartService->removeFromCart($cartItem);

            return null;
        }

        // Update the quantity
        return $this->cartService->updateCartItemQuantity($cartItem, $quantity);
    }
}
