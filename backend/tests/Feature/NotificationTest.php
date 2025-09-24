<?php

use App\Models\User;
use App\Notifications\GeneralNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user, 'sanctum');
});

describe('GeneralNotification', function () {
    it('can create a general notification', function () {
        $notification = new GeneralNotification(
            title: 'Test Title',
            message: 'Test Message',
            type: 'info'
        );

        expect($notification->title)->toBe('Test Title');
        expect($notification->message)->toBe('Test Message');
        expect($notification->type)->toBe('info');
    });

    it('can send a notification to a user', function () {
        Notification::fake();

        $notification = new GeneralNotification(
            title: 'Test Title',
            message: 'Test Message',
            type: 'success'
        );

        $this->user->notify($notification);

        Notification::assertSentTo($this->user, GeneralNotification::class);
    });

    it('stores notification in database with correct data', function () {
        $notification = new GeneralNotification(
            title: 'Database Test',
            message: 'This should be stored in database',
            type: 'warning',
            actionUrl: 'https://example.com',
            actionLabel: 'Click Here'
        );

        $this->user->notify($notification);

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $this->user->id,
            'type' => GeneralNotification::class,
        ]);

        $dbNotification = DatabaseNotification::where('notifiable_id', $this->user->id)->first();
        $data = json_decode($dbNotification->data, true);

        expect($data)->toHaveKey('title', 'Database Test');
        expect($data)->toHaveKey('message', 'This should be stored in database');
        expect($data)->toHaveKey('type', 'warning');
        expect($data)->toHaveKey('action_url', 'https://example.com');
        expect($data)->toHaveKey('action_label', 'Click Here');
    });
});

describe('Notification GraphQL API', function () {
    it('can fetch user notifications', function () {
        // Create some notifications
        $this->user->notify(new GeneralNotification('Title 1', 'Message 1', 'info'));
        $this->user->notify(new GeneralNotification('Title 2', 'Message 2', 'success'));

        $response = $this->graphQL('
            query {
                notifications(first: 10) {
                    data {
                        id
                        type
                        data
                        read_at
                        created_at
                    }
                    paginatorInfo {
                        total
                        count
                    }
                }
            }
        ');

        $response->assertOk();

        $notifications = $response->json('data.notifications.data');
        expect($notifications)->toHaveCount(2);
        expect($response->json('data.notifications.paginatorInfo.total'))->toBe(2);
    });

    it('can get unread notifications count', function () {
        // Create some notifications
        $this->user->notify(new GeneralNotification('Unread 1', 'Message 1', 'info'));
        $this->user->notify(new GeneralNotification('Unread 2', 'Message 2', 'success'));

        $response = $this->graphQL('
            query {
                unreadNotificationsCount
            }
        ');

        $response->assertOk();
        expect($response->json('data.unreadNotificationsCount'))->toBe(2);
    });

    it('can mark notification as read', function () {
        $this->user->notify(new GeneralNotification('To Read', 'Mark me as read', 'info'));

        $notification = $this->user->notifications()->first();
        expect($notification->read_at)->toBeNull();

        $response = $this->graphQL('
            mutation($id: ID!) {
                markNotificationAsRead(id: $id)
            }
        ', [
            'id' => $notification->id,
        ]);

        $response->assertOk();
        expect($response->json('data.markNotificationAsRead'))->toBeTrue();

        $notification->refresh();
        expect($notification->read_at)->not->toBeNull();
    });

    it('can mark all notifications as read', function () {
        // Create multiple unread notifications
        $this->user->notify(new GeneralNotification('Unread 1', 'Message 1', 'info'));
        $this->user->notify(new GeneralNotification('Unread 2', 'Message 2', 'success'));
        $this->user->notify(new GeneralNotification('Unread 3', 'Message 3', 'warning'));

        expect($this->user->unreadNotifications()->count())->toBe(3);

        $response = $this->graphQL('
            mutation {
                markAllNotificationsAsRead
            }
        ');

        $response->assertOk();
        expect($response->json('data.markAllNotificationsAsRead'))->toBeTrue();
        expect($this->user->unreadNotifications()->count())->toBe(0);
    });

    it('can delete notification', function () {
        $this->user->notify(new GeneralNotification('To Delete', 'Delete me', 'error'));

        $notification = $this->user->notifications()->first();

        $response = $this->graphQL('
            mutation($id: ID!) {
                deleteNotification(id: $id)
            }
        ', [
            'id' => $notification->id,
        ]);

        $response->assertOk();
        expect($response->json('data.deleteNotification'))->toBeTrue();

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    });

    it('can send notification to user', function () {
        $targetUser = User::factory()->create();

        $response = $this->graphQL('
            mutation($userId: ID!, $notification: NotificationInput!) {
                sendNotification(user_id: $userId, notification: $notification)
            }
        ', [
            'userId' => $targetUser->id,
            'notification' => [
                'title' => 'API Test',
                'message' => 'Sent via GraphQL API',
                'type' => 'INFO',
                'action_url' => 'https://example.com',
                'action_label' => 'View',
            ],
        ]);

        $response->assertOk();
        expect($response->json('data.sendNotification'))->toBeTrue();

        $this->assertDatabaseHas('notifications', [
            'notifiable_type' => User::class,
            'notifiable_id' => $targetUser->id,
        ]);
    });

    it('requires authentication for notification queries', function () {
        $this->actingAs(null);

        $response = $this->graphQL('
            query {
                notifications(first: 10) {
                    data {
                        id
                    }
                }
            }
        ');

        $response->assertGraphQLError('Unauthenticated.');
    });

    it('filters unread notifications correctly', function () {
        // Create mixed read/unread notifications
        $this->user->notify(new GeneralNotification('Unread', 'Should appear', 'info'));
        $this->user->notify(new GeneralNotification('Read', 'Should not appear', 'info'));

        // Mark second notification as read
        $readNotification = $this->user->notifications()->latest()->first();
        $readNotification->markAsRead();

        $response = $this->graphQL('
            query {
                notifications(first: 10, unread_only: true) {
                    data {
                        id
                        data
                    }
                }
            }
        ');

        $response->assertOk();

        $notifications = $response->json('data.notifications.data');
        expect($notifications)->toHaveCount(1);

        $notificationData = json_decode($notifications[0]['data'], true);
        expect($notificationData['title'])->toBe('Unread');
    });
});
