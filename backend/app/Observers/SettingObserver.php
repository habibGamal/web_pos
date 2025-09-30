<?php

namespace App\Observers;

use App\Models\Setting;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Storage;

class SettingObserver
{
    /**
     * Handle the Setting "created" event.
     */
    public function created(Setting $setting): void
    {
        SettingsService::clearCache();
    }

    /**
     * Handle the Setting "updated" event.
     */
    public function updated(Setting $setting): void
    {
        // Handle placeholder image renaming
        $this->handlePlaceholderImageRenaming($setting);

        SettingsService::clearCache();
    }

    /**
     * Handle the Setting "deleted" event.
     */
    public function deleted(Setting $setting): void
    {
        SettingsService::clearCache();
    }

    /**
     * Handle the Setting "restored" event.
     */
    public function restored(Setting $setting): void
    {
        SettingsService::clearCache();
    }

    /**
     * Handle the Setting "force deleted" event.
     */
    public function forceDeleted(Setting $setting): void
    {
        SettingsService::clearCache();
    }

    /**
     * Handle renaming of placeholder images to standardized format.
     */
    protected function handlePlaceholderImageRenaming(Setting $setting): void
    {
        // Only process image placeholder settings
        $placeholderKeys = [
            'product_placeholder_image' => 'product-placeholder',
            'brand_placeholder_image' => 'brand-placeholder',
            'category_placeholder_image' => 'category-placeholder',
        ];

        if (! array_key_exists($setting->key, $placeholderKeys)) {
            return;
        }

        // Check if the value has actually changed
        if (! $setting->isDirty('value')) {
            return;
        }

        $oldValue = $setting->getOriginal('value');
        $newValue = $setting->value;

        // If no new value or value hasn't changed, skip
        if (empty($newValue) || $oldValue === $newValue) {
            return;
        }

        // Extract filename and extension from the new value
        $filename = basename($newValue);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);

        // Create the new standardized filename
        $newFilename = $placeholderKeys[$setting->key] . '.' . $extension;
        $newPath = 'images/' . $newFilename;

        // If the file is already in the correct format, no need to rename
        if ($newValue === $newPath) {
            return;
        }

        try {
            // Check if the source file exists
            if (Storage::disk('public')->exists($newValue)) {
                // Copy the file to the new location
                Storage::disk('public')->copy($newValue, $newPath);

                // Delete the old file
                Storage::disk('public')->delete($newValue);

                // Update the setting value to the new path
                $setting->value = $newPath;
                $setting->saveQuietly(); // Save without triggering observers again
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the update
            \Log::error('Failed to rename placeholder image', [
                'setting_key' => $setting->key,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
