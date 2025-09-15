<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Registration GraphQL Mutations', function () {
    beforeEach(function () {
        // Clear any existing authentication - use Auth facade instead
        Auth::logout();
    });

    describe('Register Mutation', function () {
        it('successfully registers a new user and returns auth payload', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
                        access_token
                        token_type
                        expires_in
                        user {
                            id
                            name
                            email
                            is_email_verified
                            locale
                            phone
                        }
                    }
                }
            ', [
                'input' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                    'phone' => '+1234567890',
                    'locale' => 'en',
                ],
            ]);

            // Assert - This test should FAIL until we implement the register mutation
            $response->assertJson([
                'data' => [
                    'register' => [
                        'token_type' => 'Bearer',
                        'user' => [
                            'name' => 'John Doe',
                            'email' => 'john@example.com',
                            'is_email_verified' => false,
                            'locale' => 'en',
                            'phone' => '+1234567890',
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.register.access_token'))->not->toBeNull();
            expect($response->json('data.register.expires_in'))->toBeInt()->toBeGreaterThan(0);

            // Verify user was created in database
            $this->assertDatabaseHas('users', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'locale' => 'en',
            ]);

            // Verify password was hashed
            $user = User::where('email', 'john@example.com')->first();
            expect(Hash::check('password123', $user->password))->toBeTrue();
        });

        it('validates required name field', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since name is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"email":"john@example.com","password":"password123","password_confirmation":"password123"}; Field "name" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('validates required email field', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since email is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"name":"John Doe","password":"password123","password_confirmation":"password123"}; Field "email" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('validates email format', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'invalid-email',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.email in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.email'
                            ]
                        ]
                    ]
                ]
            ]);
        });

        it('validates email uniqueness', function () {
            // Arrange
            User::factory()->create([
                'email' => 'existing@example.com',
            ]);

            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'existing@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.email in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.email'
                            ]
                        ]
                    ]
                ]
            ]);
        });

        it('validates required password field', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - This should be a GraphQL validation error since password is required
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value {"name":"John Doe","email":"john@example.com","password_confirmation":"password123"}; Field "password" of required type "String!" was not provided.',
                    ],
                ],
            ]);
        });

        it('validates password minimum length', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => '123',
                    'password_confirmation' => '123',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.password in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.password'
                            ]
                        ]
                    ]
                ]
            ]);
        });

        it('validates password confirmation', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'different_password',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.password in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.password'
                            ]
                        ]
                    ]
                ]
            ]);
        });

        it('validates locale values', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                    'locale' => 'invalid_locale',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.locale in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.locale'
                            ]
                        ]
                    ]
                ]
            ]);
        });

        it('accepts valid locales', function () {
            // Act - Test Arabic locale
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
                        access_token
                        user {
                            id
                            name
                            email
                            locale
                        }
                    }
                }
            ', [
                'input' => [
                    'name' => 'Ahmed Ali',
                    'email' => 'ahmed@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                    'locale' => 'ar',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'register' => [
                        'user' => [
                            'name' => 'Ahmed Ali',
                            'email' => 'ahmed@example.com',
                            'locale' => 'ar',
                        ],
                    ],
                ],
            ]);
        });

        it('sets default locale when not provided', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
                        access_token
                        user {
                            id
                            name
                            email
                            locale
                        }
                    }
                }
            ', [
                'input' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert - Default locale should be 'en'
            $response->assertJson([
                'data' => [
                    'register' => [
                        'user' => [
                            'name' => 'John Doe',
                            'email' => 'john@example.com',
                            'locale' => 'en',
                        ],
                    ],
                ],
            ]);
        });

        it('handles optional phone field', function () {
            // Act - Register without phone
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
                        access_token
                        user {
                            id
                            name
                            email
                            phone
                        }
                    }
                }
            ', [
                'input' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'register' => [
                        'user' => [
                            'name' => 'John Doe',
                            'email' => 'john@example.com',
                            'phone' => null,
                        ],
                    ],
                ],
            ]);
        });

        it('validates phone format when provided', function () {
            // Act
            $response = $this->graphQL('
                mutation RegisterUser($input: RegisterInput!) {
                    register(input: $input) {
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
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                    'phone' => 'invalid_phone_format_that_is_way_too_long_for_a_phone_number',
                ],
            ]);

            // Assert - GraphQL validation with @rules directive includes input.phone in validation errors
            $response->assertJsonStructure([
                'errors' => [
                    [
                        'message',
                        'extensions' => [
                            'validation' => [
                                'input.phone'
                            ]
                        ]
                    ]
                ]
            ]);
        });
    });
});
