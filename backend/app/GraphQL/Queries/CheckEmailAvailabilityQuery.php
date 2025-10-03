<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\User;

final class CheckEmailAvailabilityQuery
{
    /**
     * Check if an email address is available for registration.
     */
    public function __invoke(mixed $root, array $args): bool
    {
        return ! User::where('email', $args['email'])->exists();
    }
}
