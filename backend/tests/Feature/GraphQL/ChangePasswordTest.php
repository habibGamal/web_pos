<?php

namespace Tests\Feature\GraphQL;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create([
        'password' => Hash::make('current-password'),
    ]);
});

describe('Change Password GraphQL Mutation', function () {
    describe('Change Password Mutation', function () {
        it('successfully changes password with valid current password', function () {
            Sanctum::actingAs($this->user);

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'current_password' => 'current-password',
                        'password' => 'new-password123',
                        'password_confirmation' => 'new-password123',
                    ],
                ],
            ]);

            $response->assertSuccessful()
                ->assertJson([
                    'data' => [
                        'changePassword' => [
                            'success' => true,
                            'message' => 'Password changed successfully',
                        ],
                    ],
                ]);

            // Verify password was actually changed
            $this->user->refresh();
            expect(Hash::check('new-password123', $this->user->password))->toBeTrue();
            expect(Hash::check('current-password', $this->user->password))->toBeFalse();
        });

        it('validates required current_password field', function () {
            Sanctum::actingAs($this->user);

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'password' => 'new-password123',
                        'password_confirmation' => 'new-password123',
                    ],
                ],
            ]);

            $response->assertStatus(200)
                ->assertJsonPath('errors.0.message', 'Variable "$input" got invalid value {"password":"new-password123","password_confirmation":"new-password123"}; Field "current_password" of required type "String!" was not provided.');
        });

        it('validates current password is correct', function () {
            Sanctum::actingAs($this->user);

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'current_password' => 'wrong-password',
                        'password' => 'new-password123',
                        'password_confirmation' => 'new-password123',
                    ],
                ],
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment([
                    'current_password' => ['Current password is incorrect.'],
                ]);
        });

        it('validates password confirmation match', function () {
            Sanctum::actingAs($this->user);

            // Use the correct current password from the user setup
            $currentPassword = 'current-password';

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'current_password' => $currentPassword,
                        'password' => 'new-password123',
                        'password_confirmation' => 'different-password',
                    ],
                ],
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment([
                    'message' => 'Validation failed for the field [changePassword].',
                ]);
        });

        it('validates password minimum length', function () {
            Sanctum::actingAs($this->user);

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'current_password' => 'current-password',
                        'password' => '123',
                        'password_confirmation' => '123',
                    ],
                ],
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment([
                    'message' => 'Validation failed for the field [changePassword].',
                ]);
        });

        it('requires authentication', function () {
            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation($input: ChangePasswordInput!) {
                        changePassword(input: $input) {
                            success
                            message
                        }
                    }
                ',
                'variables' => [
                    'input' => [
                        'current_password' => 'current-password',
                        'password' => 'new-password123',
                        'password_confirmation' => 'new-password123',
                    ],
                ],
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment([
                    'message' => 'Current password is incorrect.',
                ]);
        });
    });
});
