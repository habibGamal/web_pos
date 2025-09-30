<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class ResetPasswordMutation
{
    /**
     * Reset the user's password using the reset token.
     *
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     */
    public function __invoke($_, array $args): array
    {
        // With @spread, the input fields are spread directly into $args
        $token = $args['token'];
        $email = $args['email'];
        $password = $args['password'];

        // Attempt to reset the user's password
        $status = Password::reset(
            [
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $args['password_confirmation'],
                'token' => $token,
            ],
            function ($user, $password) {
                // Update the user's password
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Fire password reset event
                event(new PasswordReset($user));
            }
        );

        // Handle response based on status
        if ($status === Password::PASSWORD_RESET) {
            return [
                'message' => 'Your password has been reset successfully!',
                'success' => true,
            ];
        }

        // Handle different error cases
        if ($status === Password::INVALID_USER) {
            throw ValidationException::withMessages([
                'email' => ['We can\'t find a user with that email address.'],
            ]);
        }

        if ($status === Password::INVALID_TOKEN) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        // Generic error for any other status
        throw ValidationException::withMessages([
            'password' => ['Unable to reset password.'],
        ]);
    }
}
