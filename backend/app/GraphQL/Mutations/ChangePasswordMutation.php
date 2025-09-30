<?php

namespace App\GraphQL\Mutations;

use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class ChangePasswordMutation
{
    /**
     * Change password for authenticated user.
     *
     * @param  mixed  $rootValue
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    public function __invoke($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $user = Auth::user();

        if (! $user) {
            throw new \Illuminate\Auth\AuthenticationException('Unauthenticated.');
        }

        $currentPassword = $args['current_password'];
        $newPassword = $args['password'];

        // Verify current password
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return [
            'success' => true,
            'message' => 'Password changed successfully',
        ];
    }
}
