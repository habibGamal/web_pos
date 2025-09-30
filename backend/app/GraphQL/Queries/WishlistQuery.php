<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Services\WishlistService;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class WishlistQuery
{
    public function __construct(
        protected WishlistService $wishlistService
    ) {}

    /**
     * Get the current user's wishlist items.
     */
    public function __invoke($root, array $args, GraphQLContext $context)
    {
        $user = Auth::user();

        if (! $user) {
            return [];
        }

        return $this->wishlistService->getUserList($user);
    }

    /**
     * Get the count of items in the current user's wishlist.
     */
    public function count($root, array $args, GraphQLContext $context): int
    {
        $user = Auth::user();

        return $user->wishlistItems()->count();
    }
}
