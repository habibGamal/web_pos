<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Password Reset GraphQL Mutations', function () {
    beforeEach(function () {
        // Clear any existing authentication - use Auth facade instead
        Auth::logout();
    });

    describe('Forgot Password Mutation', function () {
        it('successfully sends password reset email for existing user', function () {
            // Arrange
            $user = User::factory()->create([
                'email' => 'john@example.com',
                'email_verified_at' => now(),
            ]);

            // Act
            $response = $this->graphQL('
                mutation ForgotPassword($input: ForgotPasswordInput!) {
                    forgotPassword(input: $input) {
                        message
                        reset_token
                    }
                }
            ', [
                'input' => [
                    'email' => 'john@example.com',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'forgotPassword' => [
                        'message' => 'We have emailed your password reset link!',
                    ],
                ],
            ]);

            // In testing environment, we might return the reset token
            expect($response->json('data.forgotPassword.reset_token'))->toBeString();
        });

        it('validates required email field', function () {
            // Act
            $response = $this->graphQL('
                mutation ForgotPassword($input: ForgotPasswordInput!) {
                    forgotPassword(input: $input) {
                        message
                    }
                }
            ', [
                'input' => [],
            ]);

            // Assert - This should be a GraphQL validation error since email is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value []; Field "email" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('validates email format', function () {
            // Act
            $response = $this->graphQL('
                mutation ForgotPassword($input: ForgotPasswordInput!) {
                    forgotPassword(input: $input) {
                        message
                    }
                }
            ', [
                'input' => [
                    'email' => 'invalid-email-format',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.email in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.email',
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('handles non-existent email gracefully', function () {
            // Act
            $response = $this->graphQL('
                mutation ForgotPassword($input: ForgotPasswordInput!) {
                    forgotPassword(input: $input) {
                        message
                    }
                }
            ', [
                'input' => [
                    'email' => 'nonexistent@example.com',
                ],
            ]);

            // Assert - Should return validation error for non-existent user
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'email',
                            ],
                        ],
                    ],
                ],
            ]);
        });

    });

    describe('Reset Password Mutation', function () {
        it('successfully resets password with valid token', function () {
            // Arrange
            $user = User::factory()->create([
                'email' => 'john@example.com',
                'password' => Hash::make('oldpassword'),
                'email_verified_at' => now(),
            ]);

            // Generate a reset token using Laravel's Password facade
            $token = app('auth.password.broker')->createToken($user);

            // Act
            $response = $this->graphQL('
                mutation ResetPassword($input: ResetPasswordInput!) {
                    resetPassword(input: $input) {
                        message
                        success
                    }
                }
            ', [
                'input' => [
                    'token' => $token,
                    'email' => 'john@example.com',
                    'password' => 'newpassword123',
                    'password_confirmation' => 'newpassword123',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'resetPassword' => [
                        'message' => 'Your password has been reset successfully!',
                        'success' => true,
                    ],
                ],
            ]);

            // Verify password was actually changed
            $user->refresh();
            expect(Hash::check('newpassword123', $user->password))->toBeTrue();
            expect(Hash::check('oldpassword', $user->password))->toBeFalse();
        });

        it('validates required token field', function () {
            // Act
            $response = $this->graphQL('
                mutation ResetPassword($input: ResetPasswordInput!) {
                    resetPassword(input: $input) {
                        message
                        success
                    }
                }
            ', [
                'input' => [
                    'email' => 'john@example.com',
                    'password' => 'newpassword123',
                    'password_confirmation' => 'newpassword123',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since token is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"email":"john@example.com","password":"newpassword123","password_confirmation":"newpassword123"}; Field "token" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

    });
});
