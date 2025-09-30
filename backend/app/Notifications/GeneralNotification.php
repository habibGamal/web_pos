<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class GeneralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $title;
    public string $message;
    public string $type;
    public ?string $actionUrl;
    public ?string $actionLabel;
    public ?array $metadata;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $title,
        string $message,
        string $type = 'info',
        ?string $actionUrl = null,
        ?string $actionLabel = null,
        ?array $metadata = null
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type; // info, success, warning, error
        $this->actionUrl = $actionUrl;
        $this->actionLabel = $actionLabel;
        $this->metadata = $metadata ?? [];
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
            'action_label' => $this->actionLabel,
            'metadata' => $this->metadata,
            'created_at' => now()->toISOString(),
        ]);
    }

    /**
     * Get the type of the notification being broadcast.
     */
    public function broadcastType(): string
    {
        return $this->type;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
            'action_label' => $this->actionLabel,
            'metadata' => $this->metadata,
        ];
    }
}
