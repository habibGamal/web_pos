<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Addresses;

use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class CreateAddressMutation
{
    /**
     * Create a new address for the authenticated user.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): Address
    {
        $user = Auth::user();

        if (! $user) {
            throw new \Exception('Unauthenticated.');
        }

        // Validate input
        $content = $args['content'];
        $phone = $args['phone'];
        $areaId = $args['area_id'];

        // Create the address
        $address = Address::create([
            'content' => $content,
            'phone' => $phone,
            'area_id' => $areaId,
            'user_id' => $user->id,
        ]);

        // Load relationships for the response
        $address->load(['area.gov', 'user']);

        return $address;
    }
}
