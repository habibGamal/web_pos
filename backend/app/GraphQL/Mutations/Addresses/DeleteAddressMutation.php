<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Addresses;

use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class DeleteAddressMutation
{
    /**
     * Delete an address for the authenticated user.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): bool
    {
        $user = Auth::user();

        if (! $user) {
            throw new \Exception('Unauthenticated.');
        }

        $addressId = $args['id'];

        // Find the address and ensure it belongs to the authenticated user
        $address = Address::where('id', $addressId)
            ->where('user_id', $user->id)
            ->first();

        if (! $address) {
            throw new \Exception('Address not found or access denied.');
        }

        // Delete the address
        $deleted = $address->delete();

        return (bool) $deleted;
    }
}
