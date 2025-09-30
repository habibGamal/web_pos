<?php

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('can retrieve product placeholder image setting', function () {
    $productPlaceholder = Setting::getProductPlaceholderImage();

    expect($productPlaceholder)->toBe(''); // Initially empty

    // Set a value
    Setting::setValue('product_placeholder_image', 'images/product-placeholder.jpg');

    $productPlaceholder = Setting::getProductPlaceholderImage();
    expect($productPlaceholder)->toBe('images/product-placeholder.jpg');
});

it('can retrieve brand placeholder image setting', function () {
    $brandPlaceholder = Setting::getBrandPlaceholderImage();

    expect($brandPlaceholder)->toBe(''); // Initially empty

    // Set a value
    Setting::setValue('brand_placeholder_image', 'images/brand-placeholder.jpg');

    $brandPlaceholder = Setting::getBrandPlaceholderImage();
    expect($brandPlaceholder)->toBe('images/brand-placeholder.jpg');
});

it('can retrieve category placeholder image setting', function () {
    $categoryPlaceholder = Setting::getCategoryPlaceholderImage();

    expect($categoryPlaceholder)->toBe(''); // Initially empty

    // Set a value
    Setting::setValue('category_placeholder_image', 'images/category-placeholder.jpg');

    $categoryPlaceholder = Setting::getCategoryPlaceholderImage();
    expect($categoryPlaceholder)->toBe('images/category-placeholder.jpg');
});

it('has all image placeholder settings in database', function () {
    $imageSettings = Setting::where('group', 'images')->pluck('key')->toArray();

    expect($imageSettings)->toContain('product_placeholder_image');
    expect($imageSettings)->toContain('brand_placeholder_image');
    expect($imageSettings)->toContain('category_placeholder_image');
});

it('has correct arabic labels for image placeholder settings', function () {
    $productSetting = Setting::where('key', 'product_placeholder_image')->first();
    $brandSetting = Setting::where('key', 'brand_placeholder_image')->first();
    $categorySetting = Setting::where('key', 'category_placeholder_image')->first();

    expect($productSetting->label_ar)->toBe('صورة منتج افتراضية');
    expect($brandSetting->label_ar)->toBe('صورة علامة تجارية افتراضية');
    expect($categorySetting->label_ar)->toBe('صورة فئة افتراضية');
});

it('renames uploaded placeholder images to standardized format', function () {
    Storage::fake('public');

    // Create a fake uploaded image file
    $uploadedPath = 'images/uploaded-product-image.png';
    Storage::disk('public')->put($uploadedPath, 'fake image content');

    // Update the product placeholder setting
    Setting::setValue('product_placeholder_image', $uploadedPath);

    // Verify the file was renamed correctly
    expect(Storage::disk('public')->exists('images/product-placeholder.png'))->toBeTrue();
    expect(Storage::disk('public')->exists($uploadedPath))->toBeFalse();

    // Verify the setting value was updated
    $productPlaceholder = Setting::getProductPlaceholderImage();
    expect($productPlaceholder)->toBe('images/product-placeholder.png');
});

it('handles different image extensions for placeholder images', function () {
    Storage::fake('public');

    // Test with JPEG extension
    $uploadedPath = 'images/uploaded-brand-image.jpeg';
    Storage::disk('public')->put($uploadedPath, 'fake image content');

    Setting::setValue('brand_placeholder_image', $uploadedPath);

    expect(Storage::disk('public')->exists('images/brand-placeholder.jpeg'))->toBeTrue();
    expect(Storage::disk('public')->exists($uploadedPath))->toBeFalse();

    $brandPlaceholder = Setting::getBrandPlaceholderImage();
    expect($brandPlaceholder)->toBe('images/brand-placeholder.jpeg');
});

it('does not rename if file is already in correct format', function () {
    Storage::fake('public');

    // Create a file that's already in the correct format
    $correctPath = 'images/category-placeholder.jpg';
    Storage::disk('public')->put($correctPath, 'fake image content');

    Setting::setValue('category_placeholder_image', $correctPath);

    // File should still exist and setting should be unchanged
    expect(Storage::disk('public')->exists($correctPath))->toBeTrue();
    $categoryPlaceholder = Setting::getCategoryPlaceholderImage();
    expect($categoryPlaceholder)->toBe($correctPath);
});
