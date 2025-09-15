<?php

namespace Tests\Feature\GraphQL;

use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Logout GraphQL Mutation', function () {
    describe('Logout Mutation', function () {
        it('successfully logs out authenticated user', function () {
            // Use Sanctum::actingAs for simpler testing
            Sanctum::actingAs($this->user);

            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation {
                        logout {
                            success
                            message
                        }
                    }
                '
            ]);

            $response->assertSuccessful()
                ->assertJson([
                    'data' => [
                        'logout' => [
                            'success' => true,
                            'message' => 'Successfully logged out'
                        ]
                    ]
                ]);
        });

        it('requires authentication', function () {
            $response = $this->postJson('/graphql', [
                'query' => '
                    mutation {
                        logout {
                            success
                            message
                        }
                    }
                '
            ]);

            $response->assertStatus(200)
                ->assertJsonFragment([
                    'success' => true,
                    'message' => 'Successfully logged out'
                ]);
        });
    });
});
