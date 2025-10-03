<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Social Login GraphQL Mutations', function () {
    beforeEach(function () {
        Auth::logout();
    });

    describe('Social Login Mutation', function () {
        it('successfully logs in with Google', function () {
            // Mock Socialite response
            $mockUser = new class
            {
                public function getId()
                {
                    return '12345';
                }

                public function getEmail()
                {
                    return 'john@example.com';
                }

                public function getName()
                {
                    return 'John Doe';
                }

                public function getNickname()
                {
                    return 'johndoe';
                }

                public function getAvatar()
                {
                    return 'https://example.com/avatar.jpg';
                }
            };

            $mockProvider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
            $mockProvider->shouldReceive('userFromToken')
                ->with('valid_google_token')
                ->andReturn($mockUser);

            Socialite::shouldReceive('driver')
                ->with('google')
                ->andReturn($mockProvider);

            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                        token_type
                        expires_in
                        user {
                            id
                            name
                            email
                            email_verified
                        }
                    }
                }
            ', [
                'input' => [
                    'provider' => 'google',
                    'access_token' => 'valid_google_token',
                    'locale' => 'en',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'socialLogin' => [
                        'token_type' => 'Bearer',
                        'expires_in' => 31536000,
                        'user' => [
                            'name' => 'John Doe',
                            'email' => 'john@example.com',
                            'email_verified' => true,
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.socialLogin.access_token'))->toBeString();

            // Verify user was created in database
            $user = User::where('email', 'john@example.com')->first();
            expect($user)->not->toBeNull();
            expect($user->google_id)->toBe('12345');
            expect($user->email_verified_at)->not->toBeNull();
        });

        it('successfully logs in with Facebook', function () {
            // Mock Socialite response
            $mockUser = new class
            {
                public function getId()
                {
                    return '67890';
                }

                public function getEmail()
                {
                    return 'jane@example.com';
                }

                public function getName()
                {
                    return 'Jane Smith';
                }

                public function getNickname()
                {
                    return 'janesmith';
                }

                public function getAvatar()
                {
                    return 'https://facebook.com/avatar.jpg';
                }
            };

            $mockProvider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
            $mockProvider->shouldReceive('userFromToken')
                ->with('valid_facebook_token')
                ->andReturn($mockUser);

            Socialite::shouldReceive('driver')
                ->with('facebook')
                ->andReturn($mockProvider);

            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                        token_type
                        user {
                            name
                            email
                            facebook_id
                        }
                    }
                }
            ', [
                'input' => [
                    'provider' => 'facebook',
                    'access_token' => 'valid_facebook_token',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'socialLogin' => [
                        'token_type' => 'Bearer',
                        'user' => [
                            'name' => 'Jane Smith',
                            'email' => 'jane@example.com',
                        ],
                    ],
                ],
            ]);

            // Verify user was created in database
            $user = User::where('email', 'jane@example.com')->first();
            expect($user)->not->toBeNull();
            expect($user->facebook_id)->toBe('67890');
        });

        it('links social account to existing user', function () {
            // Arrange - Create existing user
            $existingUser = User::factory()->create([
                'email' => 'existing@example.com',
                'name' => 'Existing User',
                'google_id' => null,
            ]);

            // Mock Socialite response
            $mockUser = new class
            {
                public function getId()
                {
                    return '99999';
                }

                public function getEmail()
                {
                    return 'existing@example.com';
                }

                public function getName()
                {
                    return 'Existing User via Google';
                }

                public function getNickname()
                {
                    return 'existinguser';
                }

                public function getAvatar()
                {
                    return 'https://google.com/avatar.jpg';
                }
            };

            $mockProvider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
            $mockProvider->shouldReceive('userFromToken')
                ->with('valid_google_token')
                ->andReturn($mockUser);

            Socialite::shouldReceive('driver')
                ->with('google')
                ->andReturn($mockProvider);

            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        user {
                            id
                            email
                            google_id
                        }
                    }
                }
            ', [
                'input' => [
                    'provider' => 'google',
                    'access_token' => 'valid_google_token',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'socialLogin' => [
                        'user' => [
                            'id' => (string) $existingUser->id,
                            'email' => 'existing@example.com',
                        ],
                    ],
                ],
            ]);

            // Verify social account was linked
            $existingUser->refresh();
            expect($existingUser->google_id)->toBe('99999');
            expect($existingUser->email_verified_at)->not->toBeNull();
        });

        it('validates required provider field', function () {
            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                    }
                }
            ', [
                'input' => [
                    'access_token' => 'some_token',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since provider is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"access_token":"some_token"}; Field "provider" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('validates provider is in allowed list', function () {
            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                    }
                }
            ', [
                'input' => [
                    'provider' => 'invalid_provider',
                    'access_token' => 'some_token',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.provider in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.provider',
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('validates required access_token field', function () {
            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                    }
                }
            ', [
                'input' => [
                    'provider' => 'google',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since access_token is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"provider":"google"}; Field "access_token" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('handles invalid access token', function () {
            // Mock Socialite to throw exception for invalid token
            $mockProvider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
            $mockProvider->shouldReceive('userFromToken')
                ->with('invalid_token')
                ->andThrow(new \Laravel\Socialite\Two\InvalidStateException);

            Socialite::shouldReceive('driver')
                ->with('google')
                ->andReturn($mockProvider);

            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                    }
                }
            ', [
                'input' => [
                    'provider' => 'google',
                    'access_token' => 'invalid_token',
                ],
            ]);

            // Assert - Should return validation error for invalid token
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'access_token',
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('handles provider service error', function () {
            // Mock Socialite to throw general exception
            $mockProvider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
            $mockProvider->shouldReceive('userFromToken')
                ->with('some_token')
                ->andThrow(new \Exception('Service unavailable'));

            Socialite::shouldReceive('driver')
                ->with('google')
                ->andReturn($mockProvider);

            // Act
            $response = $this->graphQL('
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                    }
                }
            ', [
                'input' => [
                    'provider' => 'google',
                    'access_token' => 'some_token',
                ],
            ]);

            // Assert - Should return validation error for provider service error
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'provider',
                            ],
                        ],
                    ],
                ],
            ]);
        });
    });
});
