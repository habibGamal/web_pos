<?php

use App\Filament\Pages\ManageSettings;
use App\Models\Setting;
use App\Models\User;
use Filament\Facades\Filament;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Filament::setCurrentPanel(
        Filament::getPanel('app')
    );
    $this->actingAs(User::factory()->create());
});

test('manage settings page can render', function () {
    livewire(ManageSettings::class)
        ->assertSuccessful();
});

test('settings are grouped correctly', function () {
    $settings = Setting::ordered()->get()->groupBy('group');

    expect($settings)->toHaveKeys([
        'order_management',
        'stock_management',
        'business_hours',
        'notifications',
    ]);
});

test('order management settings exist', function () {
    $keys = [
        'order_manager_type',
        'pos_auto_confirm_timeout',
        'web_admin_can_modify_pos_orders',
        'user_can_cancel_order',
        'cancel_allowed_statuses',
    ];

    foreach ($keys as $key) {
        expect(Setting::where('key', $key)->exists())->toBeTrue();
    }
});

test('stock management settings exist', function () {
    $keys = [
        'default_stock_manager',
        'product_stockable_by_default',
        'pos_stock_display_percentage_global',
        'reserve_stock_on_pending',
        'consume_stock_on_status',
        'stock_sync_interval_minutes',
    ];

    foreach ($keys as $key) {
        expect(Setting::where('key', $key)->exists())->toBeTrue();
    }
});

test('business hours settings exist', function () {
    $keys = [
        'accept_orders_anytime',
        'business_hours',
        'timezone',
        'order_rejection_outside_hours',
    ];

    foreach ($keys as $key) {
        expect(Setting::where('key', $key)->exists())->toBeTrue();
    }
});

test('notification settings exist', function () {
    $keys = [
        'admin_email_notifications',
        'admin_notification_emails',
        'notify_on_order_pending',
        'notify_on_order_cancelled',
        'notify_on_return_request',
        'user_notification_channels',
    ];

    foreach ($keys as $key) {
        expect(Setting::where('key', $key)->exists())->toBeTrue();
    }
});

test('can update order manager type setting', function () {
    Setting::setValue('order_manager_type', 'order_pos_manager');

    expect(Setting::getValue('order_manager_type'))->toBe('order_pos_manager');
});

test('can update boolean settings', function () {
    Setting::setValue('user_can_cancel_order', false);
    Setting::setValue('accept_orders_anytime', false);

    expect(Setting::getValue('user_can_cancel_order'))->toBeFalse();
    expect(Setting::getValue('accept_orders_anytime'))->toBeFalse();
});

test('can update integer settings', function () {
    Setting::setValue('pos_auto_confirm_timeout', 7200);
    Setting::setValue('stock_sync_interval_minutes', 30);

    expect(Setting::getValue('pos_auto_confirm_timeout'))->toBe(7200);
    expect(Setting::getValue('stock_sync_interval_minutes'))->toBe(30);
});

test('settings have correct default values', function () {
    expect(Setting::getValue('order_manager_type'))->toBe('order_web_manager');
    expect(Setting::getValue('default_stock_manager'))->toBe('stock_web_manager');
    expect(Setting::getValue('consume_stock_on_status'))->toBe('processing');
    expect(Setting::getValue('timezone'))->toBe('Africa/Cairo');
    expect(Setting::getValue('pos_auto_confirm_timeout'))->toBe(3600);
    expect(Setting::getValue('stock_sync_interval_minutes'))->toBe(15);
    expect(Setting::getValue('pos_stock_display_percentage_global'))->toBe(100);
});
