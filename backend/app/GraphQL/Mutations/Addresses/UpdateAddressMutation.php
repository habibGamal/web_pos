<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Addresses;

use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class UpdateAddressMutation
{
    /**
     * Update an existing address for the authenticated user.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): Address
    {
        $user = Auth::user();

        $addressId = $args['id'] ?? null;

        // Find the address and ensure it belongs to the authenticated user
        $address = Address::where('id', $addressId)
            ->where('user_id', $user->id)
            ->first();

        // Validate input
        $content = $args['content'];
        $phone = $args['phone'];
        $areaId = $args['area_id'];

        // Update the address
        $address->update([
            'content' => $content,
            'phone' => $phone,
            'area_id' => $areaId,
        ]);

        // Load relationships for the response
        $address->load(['area.gov', 'user']);

        return $address;
    }
}
