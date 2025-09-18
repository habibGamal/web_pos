<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Cart;
use App\Services\CartService;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CartQuery
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Get the current user's cart.
     */
    public function __invoke($root, array $args, GraphQLContext $context): Cart
    {
        return $this->cartService->getCart();
    }
}
