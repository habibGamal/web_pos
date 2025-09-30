<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use NotificationChannels\Expo\ExpoPushToken;

trait ManagesPushTokens
{
    /**
     * Store or update the push token for the current auth token.
     * If the push token already exists for another user/token, remove it first.
     */
    protected function storePushToken(string $authToken, ?string $pushToken): void
    {
        if (empty($pushToken)) {
            return;
        }

        // Validate the push token format
        try {
            ExpoPushToken::make($pushToken);
        } catch (\Exception $e) {
            // Invalid push token format, skip storing
            return;
        }

        DB::transaction(function () use ($authToken, $pushToken) {
            // Remove this push token from any other users/devices first
            PersonalAccessToken::where('expo_push_token', $pushToken)->update([
                'expo_push_token' => null,
            ]);

            // Find the current token and update it with the push token
            $tokenParts = explode('|', $authToken);
            if (count($tokenParts) === 2) {
                $tokenId = $tokenParts[0];
                PersonalAccessToken::where('id', $tokenId)->update([
                    'expo_push_token' => $pushToken,
                ]);
            }
        });
    }

    /**
     * Remove the push token from the current auth token.
     */
    protected function removePushToken(string $authToken): void
    {
        $tokenParts = explode('|', $authToken);
        if (count($tokenParts) === 2) {
            $tokenId = $tokenParts[0];
            PersonalAccessToken::where('id', $tokenId)->update([
                'expo_push_token' => null,
            ]);
        }
    }
}
