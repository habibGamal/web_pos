<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

final class RegisterMutation
{
    /**
     * Register a new user and return authentication payload.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): array
    {
        // With @spread, the input fields are spread directly into $args
        $input = $args;

        // Rate limiting for registration attempts
        $key = 'register:' . request()->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'email' => ["Too many registration attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minute window

        // Create the user
        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'phone' => $input['phone'] ?? null,
            'locale' => $input['locale'] ?? 'en',
            'email_verified_at' => null, // Will be set when user verifies email
        ]);

        // Fire registered event (triggers email verification if enabled)
        event(new Registered($user));

        // Refresh user instance to ensure clean state
        $user = $user->fresh();

        // Create API token for the user
        $token = $user->createToken('auth-token');

        // Debug: Verify token belongs to correct user
        if (app()->environment('testing')) {
            $tokenUser = $user->fresh();
            logger('RegisterMutation Debug', [
                'created_user_id' => $user->id,
                'created_user_email' => $user->email,
                'fresh_user_id' => $tokenUser->id,
                'fresh_user_email' => $tokenUser->email,
                'token_starts_with' => substr($token->plainTextToken, 0, 10),
            ]);
        }

        // Clear rate limiter on successful registration
        RateLimiter::clear($key);

        return [
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.expiration') ? config('sanctum.expiration') * 60 : 86400, // Default to 24 hours if no expiration
            'user' => $user->fresh(), // Fresh instance to ensure all relations are loaded
        ];
    }
}
