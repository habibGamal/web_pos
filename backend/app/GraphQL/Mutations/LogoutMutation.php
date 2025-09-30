<?php

namespace App\GraphQL\Mutations;

use App\Traits\ManagesPushTokens;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class LogoutMutation
{
    use ManagesPushTokens;

    /**
     * Logout user by revoking their current access token.
     *
     * @param  mixed  $rootValue
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    public function __invoke($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $user = Auth::user();

        // This should not happen due to @guard directive, but adding for safety
        if (! $user) {
            throw new \Illuminate\Auth\AuthenticationException('Unauthenticated.');
        }

        // Get the current access token from the request
        $currentToken = $user->currentAccessToken();

        if ($currentToken) {
            // Check if it's a real token (not a TransientToken used in testing)
            if (method_exists($currentToken, 'update')) {
                // Clear the push token before deleting the token
                $currentToken->update(['expo_push_token' => null]);
                $currentToken->delete();
            }
            // For TransientToken (testing), we don't need to do anything
        } else {
            // Fallback: clear push tokens and revoke all user tokens
            $user->tokens()->update(['expo_push_token' => null]);
            $user->tokens()->delete();
        }

        return [
            'success' => true,
            'message' => 'Successfully logged out',
        ];
    }
}
