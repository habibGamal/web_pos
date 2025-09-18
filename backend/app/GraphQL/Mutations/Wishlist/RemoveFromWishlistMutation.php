<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Wishlist;

use App\Services\WishlistService;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class RemoveFromWishlistMutation
{
    public function __construct(
        protected WishlistService $wishlistService
    ) {}

    /**
     * Remove a product from the wishlist.
     */
    public function __invoke($root, array $args, GraphQLContext $context): bool
    {
        $user = Auth::user();
        $productId = (int) $args['product_id'];

        return $this->wishlistService->removeItem($user, $productId);
    }
}
