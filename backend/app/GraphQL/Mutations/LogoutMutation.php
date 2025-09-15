<?php

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Auth;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class LogoutMutation
{
    /**
     * Logout user by revoking their current access token
     *
     * @param  mixed  $rootValue
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return array<string, mixed>
     */
    public function __invoke($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $user = Auth::user();

        // This should not happen due to @guard directive, but adding for safety
        if (!$user) {
            throw new \Illuminate\Auth\AuthenticationException('Unauthenticated.');
        }

        // Get the current access token from the request
        $currentToken = $user->currentAccessToken();

        if ($currentToken) {
            $currentToken->delete();
        } else {
            // Fallback: revoke all user tokens if we can't get the current one
            $user->tokens()->delete();
        }

        return [
            'success' => true,
            'message' => 'Successfully logged out'
        ];
    }
}
