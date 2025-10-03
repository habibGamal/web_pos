<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

describe('Authentication Integration Flow', function () {
    beforeEach(function () {
        // Don't run seeders to avoid admin user conflicts
        $this->artisan('migrate:fresh');

        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);
        Auth::logout();
    });

    it('completes full registration flow', function () {
        // Step 1: Check email availability
        $checkEmailResponse = $this->postJson('/graphql', [
            'query' => '
                query CheckEmailAvailability($email: String!) {
                    checkEmailAvailability(email: $email)
                }
            ',
            'variables' => [
                'email' => 'newuser@example.com',
            ],
        ]);

        $checkEmailResponse->assertStatus(200)
            ->assertJsonPath('data.checkEmailAvailability', true);

        // // Step 2: Register new user
        $registerResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Register($input: RegisterInput!) {
                    register(input: $input) {
                        access_token
                        token_type
                        expires_in
                        user {
                            id
                            name
                            email
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'name' => 'New User',
                    'email' => 'newuser@example.com',
                    'password' => 'newpassword123',
                    'password_confirmation' => 'newpassword123',
                ],
            ],
        ]);

        $registerResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'register' => [
                        'access_token',
                        'token_type',
                        'expires_in',
                        'user' => [
                            'id',
                            'name',
                            'email',
                        ],
                    ],
                ],
            ]);

        $registerData = $registerResponse->json('data.register');
        $newUserId = $registerData['user']['id'];
        $token = $registerData['access_token'];

        // Step 3: Verify user was created
        $this->assertDatabaseHas('users', [
            'id' => $newUserId,
            'email' => 'newuser@example.com',
            'name' => 'New User',
        ]);

        // Step 4: Use token to access protected resource
        $meResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        name
                        email
                    }
                }
            ',
        ]);

        dump('Me response:', $meResponse->json());

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.me.email', 'newuser@example.com');
    });

    it('completes login and logout flow', function () {
        // Step 1: Login with existing user
        $loginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                        token_type
                        expires_in
                        user {
                            id
                            email
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'password123',
                ],
            ],
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'login' => [
                        'access_token',
                        'token_type',
                        'user',
                    ],
                ],
            ]);

        $loginData = $loginResponse->json('data.login');
        $token = $loginData['access_token'];

        // Step 2: Access protected resource
        $meResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        email
                    }
                }
            ',
        ]);

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.me.email', 'test@example.com');

        // Step 3: Logout
        $logoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/graphql', [
            'query' => '
                mutation Logout {
                    logout {
                        success
                        message
                    }
                }
            ',
        ]);

        $logoutResponse->assertStatus(200)
            ->assertJsonPath('data.logout.success', true);

        // Step 4: Verify token is revoked
        $meAfterLogoutResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        email
                    }
                }
            ',
        ]);

        $meAfterLogoutResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Unauthenticated.',
            ]);
    });

    it('completes password reset flow', function () {
        // Step 1: Request password reset
        $forgotPasswordResponse = $this->postJson('/graphql', [
            'query' => '
                mutation ForgotPassword($input: ForgotPasswordInput!) {
                    forgotPassword(input: $input) {
                        message
                        reset_token
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                ],
            ],
        ]);

        $forgotPasswordResponse->assertStatus(200)
            ->assertJsonPath('data.forgotPassword.message', 'Password reset link sent to your email.');

        $resetToken = $forgotPasswordResponse->json('data.forgotPassword.reset_token');

        // Step 2: Reset password with token
        $resetPasswordResponse = $this->postJson('/graphql', [
            'query' => '
                mutation ResetPassword($input: ResetPasswordInput!) {
                    resetPassword(input: $input) {
                        access_token
                        token_type
                        user {
                            id
                            email
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'token' => $resetToken,
                    'password' => 'newpassword123',
                    'password_confirmation' => 'newpassword123',
                ],
            ],
        ]);

        $resetPasswordResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'resetPassword' => [
                        'access_token',
                        'token_type',
                        'user',
                    ],
                ],
            ]);

        // Step 3: Verify old password no longer works
        $oldPasswordLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'password123',
                ],
            ],
        ]);

        $oldPasswordLoginResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Invalid email or password.',
            ]);

        // Step 4: Verify new password works
        $newPasswordLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                        user {
                            email
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'newpassword123',
                ],
            ],
        ]);

        $newPasswordLoginResponse->assertStatus(200)
            ->assertJsonPath('data.login.user.email', 'test@example.com');
    });

    it('completes social login flow with new user', function () {
        // Mock Socialite response for Google
        $mockSocialiteUser = (object) [
            'getId' => fn () => 'google_123456',
            'getEmail' => fn () => 'social@example.com',
            'getName' => fn () => 'Social User',
            'getAvatar' => fn () => 'https://example.com/avatar.jpg',
        ];

        $this->mock(\Laravel\Socialite\Contracts\Factory::class)
            ->shouldReceive('driver')
            ->with('google')
            ->andReturnSelf()
            ->shouldReceive('userFromToken')
            ->with('valid_google_token')
            ->andReturn($mockSocialiteUser);

        // Step 1: Social login with new user
        $socialLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation SocialLogin($input: SocialLoginInput!) {
                    socialLogin(input: $input) {
                        access_token
                        token_type
                        user {
                            id
                            name
                            email
                            googleId
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'provider' => 'google',
                    'access_token' => 'valid_google_token',
                ],
            ],
        ]);

        $socialLoginResponse->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'socialLogin' => [
                        'access_token',
                        'token_type',
                        'user' => [
                            'id',
                            'name',
                            'email',
                            'googleId',
                        ],
                    ],
                ],
            ]);

        $socialData = $socialLoginResponse->json('data.socialLogin');

        // Step 2: Verify user was created with social info
        $this->assertDatabaseHas('users', [
            'email' => 'social@example.com',
            'name' => 'Social User',
            'google_id' => 'google_123456',
        ]);

        // Step 3: Verify can access protected resources
        $meResponse = $this->withHeaders([
            'Authorization' => 'Bearer ' . $socialData['access_token'],
        ])->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        email
                        googleId
                    }
                }
            ',
        ]);

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.me.email', 'social@example.com')
            ->assertJsonPath('data.me.googleId', 'google_123456');
    });

    it('completes change password flow', function () {
        // Step 1: Login to get authenticated
        Sanctum::actingAs($this->user);

        // Step 2: Change password
        $changePasswordResponse = $this->postJson('/graphql', [
            'query' => '
                mutation ChangePassword($input: ChangePasswordInput!) {
                    changePassword(input: $input) {
                        success
                        message
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'current_password' => 'password123',
                    'password' => 'newpassword456',
                    'password_confirmation' => 'newpassword456',
                ],
            ],
        ]);

        $changePasswordResponse->assertStatus(200)
            ->assertJsonPath('data.changePassword.success', true);

        // Step 3: Verify old password no longer works
        $oldPasswordLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'password123',
                ],
            ],
        ]);

        $oldPasswordLoginResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Invalid email or password.',
            ]);

        // Step 4: Verify new password works
        $newPasswordLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                        user {
                            email
                        }
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'newpassword456',
                ],
            ],
        ]);

        $newPasswordLoginResponse->assertStatus(200)
            ->assertJsonPath('data.login.user.email', 'test@example.com');
    });

    it('handles authentication errors gracefully', function () {
        // Test invalid login
        $invalidLoginResponse = $this->postJson('/graphql', [
            'query' => '
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
                        access_token
                    }
                }
            ',
            'variables' => [
                'input' => [
                    'email' => 'test@example.com',
                    'password' => 'wrongpassword',
                ],
            ],
        ]);

        $invalidLoginResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Invalid email or password.',
            ]);

        // Test unauthenticated access
        $unauthenticatedResponse = $this->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        email
                    }
                }
            ',
        ]);

        $unauthenticatedResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Unauthenticated.',
            ]);

        // Test invalid token
        $invalidTokenResponse = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token',
        ])->postJson('/graphql', [
            'query' => '
                query Me {
                    me {
                        id
                        email
                    }
                }
            ',
        ]);

        $invalidTokenResponse->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Unauthenticated.',
            ]);
    });
});
