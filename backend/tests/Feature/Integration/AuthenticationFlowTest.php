<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Complete Authentication Flow Integration Test', function () {
    beforeEach(function () {
        // Clear any existing authentication - use Auth facade instead
        Auth::logout();

        // Fake mail for testing email verification and password reset
        Mail::fake();
    });

    it('completes full user registration and login flow', function () {
        // Step 1: Register new user
        $registerResponse = $this->graphQL('
            mutation Register($input: RegisterInput!) {
                register(input: $input) {
                    user {
                        id
                        email
                        name
                        email_verified_at
                    }
                    token
                    message
                }
            }
        ', [
            'input' => [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'terms_accepted' => true,
            ],
        ]);

        // Assert registration success
        $registerResponse->assertJson([
            'data' => [
                'register' => [
                    'user' => [
                        'email' => 'john@example.com',
                        'name' => 'John Doe',
                        'email_verified_at' => null, // Should be null initially
                    ],
                    'message' => 'Registration successful! Please check your email to verify your account.',
                ],
            ],
        ]);

        $userId = $registerResponse->json('data.register.user.id');
        $token = $registerResponse->json('data.register.token');

        expect($userId)->toBeString();
        expect($token)->toBeString();

        // Verify user was created in database
        $user = User::find($userId);
        expect($user)->not->toBeNull();
        expect($user->email)->toBe('john@example.com');
        expect($user->name)->toBe('John Doe');
        expect($user->email_verified_at)->toBeNull();

        // Step 2: Attempt login before email verification (should fail)
        $loginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                        email_verified_at
                    }
                    token
                    message
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'password123',
            ],
        ]);

        $loginResponse->assertJson([
            'errors' => [
                [
                    'message' => 'Please verify your email address before logging in.',
                ],
            ],
        ]);

        // Step 3: Verify email (simulate clicking verification link)
        // In a real app, this would involve generating and validating a verification token
        $user->email_verified_at = now();
        $user->save();

        // Step 4: Login after email verification (should succeed)
        $loginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                        email_verified_at
                    }
                    token
                    message
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'password123',
            ],
        ]);

        $loginResponse->assertJson([
            'data' => [
                'login' => [
                    'user' => [
                        'id' => $userId,
                        'email' => 'john@example.com',
                    ],
                    'message' => 'Login successful!',
                ],
            ],
        ]);

        $loginToken = $loginResponse->json('data.login.token');
        expect($loginToken)->toBeString();
        expect($loginResponse->json('data.login.user.email_verified_at'))->not->toBeNull();

        // Step 5: Access protected resource with token
        $profileResponse = $this->graphQL('
            query Me {
                me {
                    id
                    email
                    name
                    email_verified_at
                }
            }
        ', [], [
            'Authorization' => "Bearer {$loginToken}",
        ]);

        $profileResponse->assertJson([
            'data' => [
                'me' => [
                    'id' => $userId,
                    'email' => 'john@example.com',
                    'name' => 'John Doe',
                ],
            ],
        ]);
    })->todo('Full registration and login flow needs implementation');

    it('completes password reset flow', function () {
        // Step 1: Create existing user
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('oldpassword'),
            'email_verified_at' => now(),
        ]);

        // Step 2: Request password reset
        $forgotResponse = $this->graphQL('
            mutation ForgotPassword($input: ForgotPasswordInput!) {
                forgotPassword(input: $input) {
                    message
                    reset_token
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'callback_url' => 'https://frontend.app/reset-password',
            ],
        ]);

        $forgotResponse->assertJson([
            'data' => [
                'forgotPassword' => [
                    'message' => 'Password reset link has been sent to your email.',
                ],
            ],
        ]);

        $resetToken = $forgotResponse->json('data.forgotPassword.reset_token');
        expect($resetToken)->toBeString();

        // Step 3: Attempt login with old password (should still work)
        $loginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'oldpassword',
            ],
        ]);

        $loginResponse->assertJson([
            'data' => [
                'login' => [
                    'user' => [
                        'email' => 'john@example.com',
                    ],
                ],
            ],
        ]);

        // Step 4: Reset password using token
        $resetResponse = $this->graphQL('
            mutation ResetPassword($input: ResetPasswordInput!) {
                resetPassword(input: $input) {
                    message
                    success
                }
            }
        ', [
            'input' => [
                'token' => $resetToken,
                'email' => 'john@example.com',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ],
        ]);

        $resetResponse->assertJson([
            'data' => [
                'resetPassword' => [
                    'message' => 'Your password has been reset successfully.',
                    'success' => true,
                ],
            ],
        ]);

        // Step 5: Attempt login with old password (should fail)
        $oldLoginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'oldpassword',
            ],
        ]);

        $oldLoginResponse->assertJson([
            'errors' => [
                [
                    'message' => 'Invalid email or password.',
                ],
            ],
        ]);

        // Step 6: Login with new password (should succeed)
        $newLoginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                    message
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'newpassword123',
            ],
        ]);

        $newLoginResponse->assertJson([
            'data' => [
                'login' => [
                    'user' => [
                        'email' => 'john@example.com',
                    ],
                    'message' => 'Login successful!',
                ],
            ],
        ]);

        // Verify password was actually changed in database
        $user->refresh();
        expect(Hash::check('newpassword123', $user->password))->toBeTrue();
        expect(Hash::check('oldpassword', $user->password))->toBeFalse();
    })->todo('Password reset flow needs implementation');

    it('completes social login flow', function () {
        // Step 1: Attempt social login with new account
        $socialLoginResponse = $this->graphQL('
            mutation SocialLogin($input: SocialLoginInput!) {
                socialLogin(input: $input) {
                    user {
                        id
                        email
                        name
                        provider
                        provider_id
                    }
                    token
                    message
                    is_new_user
                }
            }
        ', [
            'input' => [
                'provider' => 'google',
                'provider_token' => 'valid_google_token',
                'provider_id' => 'google_12345',
                'email' => 'john@example.com',
                'name' => 'John Doe',
                'avatar' => 'https://example.com/avatar.jpg',
            ],
        ]);

        $socialLoginResponse->assertJson([
            'data' => [
                'socialLogin' => [
                    'user' => [
                        'email' => 'john@example.com',
                        'name' => 'John Doe',
                        'provider' => 'google',
                        'provider_id' => 'google_12345',
                    ],
                    'message' => 'Login successful!',
                    'is_new_user' => true,
                ],
            ],
        ]);

        $userId = $socialLoginResponse->json('data.socialLogin.user.id');
        $token = $socialLoginResponse->json('data.socialLogin.token');

        expect($userId)->toBeString();
        expect($token)->toBeString();

        // Verify user was created in database
        $user = User::find($userId);
        expect($user)->not->toBeNull();
        expect($user->email)->toBe('john@example.com');
        expect($user->name)->toBe('John Doe');
        expect($user->email_verified_at)->not->toBeNull(); // Social login auto-verifies

        // Step 2: Subsequent social login with same account (should return existing user)
        $subsequentLoginResponse = $this->graphQL('
            mutation SocialLogin($input: SocialLoginInput!) {
                socialLogin(input: $input) {
                    user {
                        id
                        email
                        name
                    }
                    token
                    message
                    is_new_user
                }
            }
        ', [
            'input' => [
                'provider' => 'google',
                'provider_token' => 'valid_google_token',
                'provider_id' => 'google_12345',
                'email' => 'john@example.com',
                'name' => 'John Doe Updated', // Name might have changed on provider
                'avatar' => 'https://example.com/new_avatar.jpg',
            ],
        ]);

        $subsequentLoginResponse->assertJson([
            'data' => [
                'socialLogin' => [
                    'user' => [
                        'id' => $userId, // Same user ID
                        'email' => 'john@example.com',
                        'name' => 'John Doe Updated', // Name should be updated
                    ],
                    'message' => 'Login successful!',
                    'is_new_user' => false, // Not a new user
                ],
            ],
        ]);

        // Step 3: Link another social provider to existing account
        $this->actingAs($user);

        $linkProviderResponse = $this->graphQL('
            mutation SocialLogin($input: SocialLoginInput!) {
                socialLogin(input: $input) {
                    user {
                        id
                        email
                        linked_providers {
                            provider
                            provider_id
                        }
                    }
                    message
                }
            }
        ', [
            'input' => [
                'provider' => 'facebook',
                'provider_token' => 'valid_facebook_token',
                'provider_id' => 'facebook_67890',
                'email' => 'john@example.com', // Same email
                'name' => 'John Doe',
                'link_to_existing' => true,
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $linkProviderResponse->assertJson([
            'data' => [
                'socialLogin' => [
                    'user' => [
                        'id' => $userId, // Same user
                        'email' => 'john@example.com',
                        'linked_providers' => [
                            [
                                'provider' => 'google',
                                'provider_id' => 'google_12345',
                            ],
                            [
                                'provider' => 'facebook',
                                'provider_id' => 'facebook_67890',
                            ],
                        ],
                    ],
                    'message' => 'Facebook account linked successfully!',
                ],
            ],
        ]);
    })->todo('Social login flow needs implementation');

    it('handles authenticated user password change flow', function () {
        // Step 1: Create user and login
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('currentpassword'),
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'currentpassword',
            ],
        ]);

        $token = $loginResponse->json('data.login.token');

        // Step 2: Change password while authenticated
        $changePasswordResponse = $this->graphQL('
            mutation ChangePassword($input: ChangePasswordInput!) {
                changePassword(input: $input) {
                    message
                    success
                }
            }
        ', [
            'input' => [
                'current_password' => 'currentpassword',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ],
        ], [
            'Authorization' => "Bearer {$token}",
        ]);

        $changePasswordResponse->assertJson([
            'data' => [
                'changePassword' => [
                    'message' => 'Your password has been changed successfully.',
                    'success' => true,
                ],
            ],
        ]);

        // Step 3: Verify old password no longer works
        $oldPasswordResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                    }
                    token
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'currentpassword',
            ],
        ]);

        $oldPasswordResponse->assertJson([
            'errors' => [
                [
                    'message' => 'Invalid email or password.',
                ],
            ],
        ]);

        // Step 4: Verify new password works
        $newPasswordResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                    message
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'newpassword123',
            ],
        ]);

        $newPasswordResponse->assertJson([
            'data' => [
                'login' => [
                    'user' => [
                        'email' => 'john@example.com',
                    ],
                    'message' => 'Login successful!',
                ],
            ],
        ]);
    })->todo('Authenticated password change flow needs implementation');

    it('handles token expiration and refresh flow', function () {
        // Step 1: Login and get token
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->graphQL('
            mutation Login($input: LoginInput!) {
                login(input: $input) {
                    user {
                        id
                        email
                    }
                    token
                    refresh_token
                    expires_at
                }
            }
        ', [
            'input' => [
                'email' => 'john@example.com',
                'password' => 'password123',
            ],
        ]);

        $token = $loginResponse->json('data.login.token');
        $refreshToken = $loginResponse->json('data.login.refresh_token');

        expect($token)->toBeString();
        expect($refreshToken)->toBeString();

        // Step 2: Use token for protected resource (should work)
        $profileResponse = $this->graphQL('
            query Me {
                me {
                    id
                    email
                }
            }
        ', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $profileResponse->assertJson([
            'data' => [
                'me' => [
                    'email' => 'john@example.com',
                ],
            ],
        ]);

        // Step 3: Simulate token expiration (in real app, wait for expiration or manipulate time)
        // For testing, we'll assume an expired token scenario

        // Step 4: Refresh token
        $refreshResponse = $this->graphQL('
            mutation RefreshToken($input: RefreshTokenInput!) {
                refreshToken(input: $input) {
                    token
                    refresh_token
                    expires_at
                }
            }
        ', [
            'input' => [
                'refresh_token' => $refreshToken,
            ],
        ]);

        $refreshResponse->assertJson([
            'data' => [
                'refreshToken' => [
                    // Should return new tokens
                ],
            ],
        ]);

        $newToken = $refreshResponse->json('data.refreshToken.token');
        $newRefreshToken = $refreshResponse->json('data.refreshToken.refresh_token');

        expect($newToken)->toBeString();
        expect($newRefreshToken)->toBeString();
        expect($newToken)->not->toBe($token); // Should be different from old token

        // Step 5: Use new token for protected resource (should work)
        $newProfileResponse = $this->graphQL('
            query Me {
                me {
                    id
                    email
                }
            }
        ', [], [
            'Authorization' => "Bearer {$newToken}",
        ]);

        $newProfileResponse->assertJson([
            'data' => [
                'me' => [
                    'email' => 'john@example.com',
                ],
            ],
        ]);

        // Step 6: Old token should no longer work
        $oldTokenResponse = $this->graphQL('
            query Me {
                me {
                    id
                    email
                }
            }
        ', [], [
            'Authorization' => "Bearer {$token}",
        ]);

        $oldTokenResponse->assertJson([
            'errors' => [
                [
                    'message' => 'Token has expired',
                ],
            ],
        ]);
    })->todo('Token refresh flow needs implementation');
});
