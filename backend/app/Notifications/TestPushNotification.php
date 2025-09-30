<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use NotificationChannels\Expo\ExpoMessage;

class TestPushNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private string $title;
    private string $body;
    private array $data;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title = 'Test Notification', string $body = 'This is a test push notification!', array $data = [])
    {
        $this->title = $title;
        $this->body = $body;
        $this->data = $data;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['expo'];
    }

    /**
     * Get the Expo representation of the notification.
     */
    public function toExpo(object $notifiable): ExpoMessage
    {
        return ExpoMessage::create($this->title)
            ->channelId('app_notify')
            ->body($this->body)
            ->data(array_merge([
                'user_id' => $notifiable->id,
                'timestamp' => now()->toISOString(),
                'type' => 'test',
            ], $this->data))
            ->priority('high')
            ->playSound();
    }
}
