<?php

namespace App\GraphQL\Types;

use Illuminate\Notifications\DatabaseNotification;

class NotificationType
{
    /**
     * Convert notification data array to JSON string.
     */
    public function data(DatabaseNotification $notification): string
    {
        // The data attribute is already decoded as an array by Laravel
        // We need to encode it back to JSON string for GraphQL
        return json_encode($notification->data);
    }
}
