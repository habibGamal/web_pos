<?php

namespace Tests\Utilities;

use Illuminate\Testing\TestResponse;

trait GraphQLTestHelpers
{
    protected function graphQLEndpoint(): string
    {
        return '/graphql';
    }

    protected function graphQL(string $query, array $variables = [], array $headers = []): TestResponse
    {
        return $this->postJson($this->graphQLEndpoint(), [
            'query' => $query,
            'variables' => $variables,
        ], $headers);
    }

    protected function graphQLWithAuth(string $query, array $variables = [], ?string $token = null): TestResponse
    {
        $headers = [];
        if ($token) {
            $headers['Authorization'] = "Bearer {$token}";
        }

        return $this->graphQL($query, $variables, $headers);
    }
}
