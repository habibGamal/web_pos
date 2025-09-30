<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

final class ForgotPasswordMutation
{
    /**
     * Send a password reset link to the user's email.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): array
    {
        // With @spread, the input fields are spread directly into $args
        $email = $args['email'];
        $callbackUrl = $args['callback_url'] ?? null;

        // Send password reset link
        $status = Password::sendResetLink(
            ['email' => $email],
            function ($user, $token) {
                // If callback URL is provided, we can customize the email
                // For now, we'll use Laravel's default email template
                $user->sendPasswordResetNotification($token);
            }
        );

        // Handle response based on status
        if ($status === Password::RESET_LINK_SENT) {
            $result = [
                'message' => 'We have emailed your password reset link!',
            ];

            // In testing environment, also return the token for testing purposes
            if (app()->environment('testing')) {
                $user = \App\Models\User::where('email', $email)->first();
                if ($user) {
                    $result['reset_token'] = app('auth.password.broker')->createToken($user);
                }
            }

            return $result;
        }

        // Handle different error cases
        if ($status === Password::INVALID_USER) {
            throw ValidationException::withMessages([
                'email' => ['We can\'t find a user with that email address.'],
            ]);
        }

        if ($status === Password::RESET_THROTTLED) {
            throw ValidationException::withMessages([
                'email' => ['Please wait before retrying.'],
            ]);
        }

        // Generic error for any other status
        throw ValidationException::withMessages([
            'email' => ['Unable to send password reset link.'],
        ]);
    }
}
