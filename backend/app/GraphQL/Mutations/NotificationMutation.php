<?php

namespace App\GraphQL\Mutations;

use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Notifications\DatabaseNotification;

class NotificationMutation
{
    /**
     * Send a notification to a user.
     */
    public function send($rootValue, array $args): bool
    {
        $userId = $args['user_id'];
        $notificationData = $args['notification'];

        $user = User::find($userId);

        if (!$user) {
            throw new \Exception('User not found');
        }

        $metadata = [];
        if (!empty($notificationData['metadata'])) {
            $metadata = json_decode($notificationData['metadata'], true) ?? [];
        }

        $notification = new GeneralNotification(
            title: $notificationData['title'],
            message: $notificationData['message'],
            type: strtolower($notificationData['type'] ?? 'info'),
            actionUrl: $notificationData['action_url'] ?? null,
            actionLabel: $notificationData['action_label'] ?? null,
            metadata: $metadata
        );

        $user->notify($notification);

        return true;
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($rootValue, array $args): bool
    {
        $notificationId = $args['id'];
        $user = auth()->user();

        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        $notification->markAsRead();

        return true;
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): bool
    {
        $user = auth()->user();

        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $user->unreadNotifications->markAsRead();

        return true;
    }

    /**
     * Delete a notification.
     */
    public function delete($rootValue, array $args): bool
    {
        $notificationId = $args['id'];
        $user = auth()->user();

        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $notification = $user->notifications()->where('id', $notificationId)->first();

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        $notification->delete();

        return true;
    }
}
