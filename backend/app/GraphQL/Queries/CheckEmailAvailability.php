<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\User;

final readonly class CheckEmailAvailability
{
    /** @param  array<string, mixed>  $args */
    public function __invoke(null $_, array $args): bool
    {
        return !User::where('email', $args['email'])->exists();
    }
}
