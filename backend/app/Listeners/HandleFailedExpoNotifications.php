<?php

namespace App\Listeners;

use Illuminate\Notifications\Events\NotificationFailed;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;
use NotificationChannels\Expo\ExpoError;

class HandleFailedExpoNotifications
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NotificationFailed $event): void
    {
        if ($event->channel !== 'expo') {
            return;
        }

        /** @var ExpoError $error */
        $error = $event->data;

        Log::warning('Expo notification failed', [
            'user_id' => $event->notifiable->id,
            'error_type' => $error->type->value,
            'error_message' => $error->message,
            'push_token' => (string) $error->token,
        ]);

        // Remove old/invalid token if device is not registered
        if ($error->type->isDeviceNotRegistered()) {
            Log::info('Removing invalid push token', [
                'user_id' => $event->notifiable->id,
                'push_token' => (string) $error->token,
            ]);

            // Remove the invalid push token from all personal access tokens
            PersonalAccessToken::where('expo_push_token', (string) $error->token)
                ->update(['expo_push_token' => null]);
        }
    }
}
