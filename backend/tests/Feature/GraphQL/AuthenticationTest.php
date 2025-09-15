<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Authentication GraphQL Mutations', function () {
    beforeEach(function () {
        // Clear any existing authentication - use Auth facade instead
        Auth::logout();
    });

    describe('Login Mutation', function () {
        it('succeeds with valid credentials and returns auth payload', function () {
            // Arrange
            $user = User::factory()->create([
                'email' => 'john@example.com',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]);

            // Act
            $response = $this->graphQL('
                mutation LoginUser($input: LoginInput!) {
                    login(input: $input) {
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
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'remember' => false,
                ],
            ]);

            // Assert - Login should succeed and return token with user info
            $response->assertJson([
                'data' => [
                    'login' => [
                        'token_type' => 'Bearer',
                        'user' => [
                            'id' => (string) $user->id,
                            'name' => $user->name,
                            // Email is visible during authentication operations
                            'email' => 'john@example.com',
                            // Email verification status is visible for own account
                            'email_verified' => true,
                        ],
                    ],
                ],
            ]);

            // Verify that an access token was returned
            expect($response->json('data.login.access_token'))->toBeString();
            expect($response->json('data.login.expires_in'))->toBe(30 * 24 * 60 * 60);

            expect($response->json('data.login.access_token'))->not->toBeNull();
            expect($response->json('data.login.expires_in'))->toBeInt()->toBeGreaterThan(0);
        });

        it('validates required email field', function () {
            // Act
            $response = $this->graphQL('
                mutation LoginUser($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                        user {
                            id
                            name
                            email
                        }
                    }
                }
            ', [
                'input' => [
                    'password' => 'password123',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since email is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"password":"password123"}; Field "email" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('fails with invalid credentials', function () {
            // Act
            $response = $this->graphQL('
                mutation LoginUser($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                        user {
                            id
                            name
                            email
                        }
                    }
                }
            ', [
                'input' => [
                    'email' => 'nonexistent@example.com',
                    'password' => 'wrongpassword',
                ],
            ]);

            // Assert - This test should FAIL until we implement authentication logic
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Invalid email or password.',
                    ],
                ],
            ]);
        });
    });

    describe('Me Query', function () {
        it('returns authenticated user', function () {
            // Arrange
            $user = User::factory()->create([
                'email_verified_at' => now(),
            ]);

            // Simulate authentication (this will need to be replaced with actual token)
            $this->actingAs($user);

            // Act
            $response = $this->graphQL('
                query GetMe {
                    me {
                        id
                        name
                        email
                        email_verified
                    }
                }
            ');

            // Assert - This test should FAIL until we implement the me query
            $response->assertJson([
                'data' => [
                    'me' => [
                        'id' => (string) $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'email_verified' => true,
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            // Act
            $response = $this->graphQL('
                query GetMe {
                    me {
                        id
                        name
                        email
                    }
                }
            ');

            // Assert - This test should FAIL until we implement authentication guard
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Unauthenticated.',
                    ],
                ],
            ]);
        });
    });

    describe('Check Email Availability Query', function () {
        it('returns true for available email', function () {
            // Act
            $response = $this->graphQL('
                query CheckEmailAvailability($email: String!) {
                    checkEmailAvailability(email: $email)
                }
            ', [
                'email' => 'available@example.com',
            ]);

            // Assert - This test should FAIL until we implement the query
            $response->assertJson([
                'data' => [
                    'checkEmailAvailability' => true,
                ],
            ]);
        });

        it('returns false for taken email', function () {
            // Arrange
            User::factory()->create([
                'email' => 'taken@example.com',
            ]);

            // Act
            $response = $this->graphQL('
                query CheckEmailAvailability($email: String!) {
                    checkEmailAvailability(email: $email)
                }
            ', [
                'email' => 'taken@example.com',
            ]);

            // Assert - This test should FAIL until we implement the query
            $response->assertJson([
                'data' => [
                    'checkEmailAvailability' => false,
                ],
            ]);
        });
    });
});
