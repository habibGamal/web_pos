<?php

namespace App\GraphQL\Queries;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Notifications\DatabaseNotification;

class NotificationQuery
{
    /**
     * Get notifications query builder for the authenticated user.
     */
    public function index($rootValue, array $args, $context, $resolveInfo): Builder
    {
        $user = auth()->user();

        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        // Start with the DatabaseNotification model and filter by user
        $query = DatabaseNotification::query()
            ->where('notifiable_type', get_class($user))
            ->where('notifiable_id', $user->id);

        // Filter by unread status if requested
        if ($args['unread_only'] ?? false) {
            $query->whereNull('read_at');
        }

        // Order by created_at descending (newest first)
        $query->orderBy('created_at', 'desc');

        return $query;
    }

    /**
     * Get count of unread notifications for the authenticated user.
     */
    public function unreadCount(): int
    {
        $user = auth()->user();

        if (!$user) {
            return 0;
        }

        return $user->unreadNotifications()->count();
    }
}
