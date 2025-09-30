<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Traits\ManagesPushTokens;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

final class SocialLoginMutation
{
    use ManagesPushTokens;

    /**
     * Authenticate user via social provider.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): array
    {
        $provider = $args['provider'];
        $accessToken = $args['access_token'];
        $providerId = $args['provider_id'] ?? null;
        $locale = $args['locale'] ?? 'en';
        $expoPushToken = $args['expo_push_token'] ?? null;

        try {
            // Get user info from social provider
            $socialUser = Socialite::driver($provider)->userFromToken($accessToken);

            // Use provider_id from args if provided, otherwise use the one from social user
            $providerUserId = $providerId ?? $socialUser->getId();

            if (! $providerUserId) {
                throw ValidationException::withMessages([
                    'provider_id' => ['Unable to get user ID from social provider.'],
                ]);
            }

            // Map provider to database column
            $providerColumn = $provider . '_id';

            // Check if user already exists with this social account
            $existingUser = User::where($providerColumn, $providerUserId)->first();

            if ($existingUser) {
                // User exists with this social account, log them in
                $user = $existingUser;
            } else {
                // Check if user exists with same email
                $userByEmail = User::where('email', $socialUser->getEmail())->first();

                if ($userByEmail) {
                    // User exists with email, link this social account
                    $userByEmail->update([
                        $providerColumn => $providerUserId,
                        'email_verified_at' => now(), // Social accounts are considered verified
                    ]);
                    $user = $userByEmail;
                } else {
                    // Create new user
                    $userData = [
                        'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Social User',
                        'email' => $socialUser->getEmail(),
                        $providerColumn => $providerUserId,
                        'locale' => $locale,
                        'email_verified_at' => now(), // Social accounts are considered verified
                        'password' => Hash::make(Str::random(32)), // Random password for social users
                        'avatar' => $socialUser->getAvatar(),
                    ];

                    $user = User::create($userData);

                    // Fire the registered event
                    event(new Registered($user));
                }
            }

            // Generate API token
            $token = $user->createToken('auth-token');

            // Store push token if provided
            if ($expoPushToken) {
                $this->storePushToken($token->plainTextToken, $expoPushToken);
            }

            return [
                'access_token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'expires_in' => 31536000, // 1 year in seconds
                'user' => $user,
            ];

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            throw ValidationException::withMessages([
                'access_token' => ['Invalid or expired access token.'],
            ]);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'provider' => ['Unable to authenticate with ' . $provider . '. Please try again.'],
            ]);
        }
    }
}
