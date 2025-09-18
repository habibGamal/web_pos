<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Wishlist;

use App\Models\WishlistItem;
use App\Services\WishlistService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class AddToWishlistMutation
{
    public function __construct(
        protected WishlistService $wishlistService
    ) {}

    /**
     * Add a product to the wishlist.
     */
    public function __invoke($root, array $args, GraphQLContext $context): WishlistItem
    {
        $user = Auth::user();
        $productId = (int) $args['product_id'];

        // Check if product is already in wishlist
        $existingItem = $user->wishlistItems()
            ->where('product_id', $productId)
            ->first();

        if ($existingItem) {
            throw ValidationException::withMessages([
                'product_id' => 'Product is already in your wishlist.',
            ]);
        }

        $wishlistItem = $this->wishlistService->addItem($user, $productId);

        if (! $wishlistItem) {
            throw ValidationException::withMessages([
                'product_id' => 'Failed to add product to wishlist. Product may not exist.',
            ]);
        }

        return $wishlistItem->load('product');
    }
}
