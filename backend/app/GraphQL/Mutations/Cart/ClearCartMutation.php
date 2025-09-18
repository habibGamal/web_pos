<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Cart;

use App\Services\CartService;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ClearCartMutation
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Clear all items from the cart.
     */
    public function __invoke($root, array $args, GraphQLContext $context): bool
    {
        return $this->cartService->clearCart();
    }
}
