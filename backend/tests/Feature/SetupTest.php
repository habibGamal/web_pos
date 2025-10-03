<?php

/**
 * Sample test to verify Pest setup and basic functionality.
 */
it('can verify basic application functionality', function () {
    expect(true)->toBe(true);
    expect('Laravel')->toContain('ara');
    expect([1, 2, 3])->toHaveLength(3);
});

it('can make basic HTTP requests', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

it('can access configuration', function () {
    expect(config('app.name'))->toBeString();
    expect(config('app.env'))->not->toBeNull();
});

it('can use database testing', function () {
    // This test will use RefreshDatabase trait
    expect(\App\Models\User::count())->toBeGreaterThanOrEqual(0);
});
