<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use GraphQL\Type\Definition\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class LoginMutation
{
    /**
     * Handle the login mutation.
     *
     * @param  mixed  $rootValue
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return array<string, mixed>
     * @throws ValidationException
     */
    public function __invoke($rootValue, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $email = $args['email'];
        $password = $args['password'];
        $remember = $args['remember'] ?? false;

        // Rate limiting check
        $this->checkRateLimit($email, $context);

        // Find user by email
        $user = User::where('email', $email)->first();

        // Validate credentials
        if (!$user || !Hash::check($password, $user->password)) {
            // Record the failed attempt for rate limiting
            RateLimiter::hit($this->throttleKey($email, $context));

            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Check if email is verified
        if (!$user->email_verified_at) {
            // Record the failed attempt for rate limiting
            RateLimiter::hit($this->throttleKey($email, $context));

            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        // Clear any rate limit attempts on successful login
        RateLimiter::clear($this->throttleKey($email, $context));

        // Create Sanctum token for API authentication
        $tokenName = 'auth_token_' . now()->timestamp;
        $token = $user->createToken($tokenName, ['*'], now()->addDays(30));

        // Fire login event
        event(new Login('sanctum', $user, $remember));

        return [
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_in' => 30 * 24 * 60 * 60, // 30 days in seconds
            'user' => $user,
        ];
    }

    /**
     * Check rate limiting for login attempts.
     *
     * @param  string  $email
     * @param  GraphQLContext  $context
     * @return void
     * @throws ValidationException
     */
    private function checkRateLimit(string $email, GraphQLContext $context): void
    {
        $key = $this->throttleKey($email, $context);
        $maxAttempts = 5; // Maximum attempts
        $decayMinutes = 15; // Lockout duration in minutes

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            $minutes = ceil($seconds / 60);

            throw ValidationException::withMessages([
                'email' => [
                    "Too many login attempts. Please try again in {$minutes} minutes.",
                ],
            ]);
        }
    }

    /**
     * Generate the throttle key for rate limiting.
     *
     * @param  string  $email
     * @param  GraphQLContext  $context
     * @return string
     */
    private function throttleKey(string $email, GraphQLContext $context): string
    {
        $ip = $context->request()->ip();

        return "login.{$email}.{$ip}";
    }
}
