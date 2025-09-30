<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\GeneralNotification;
use App\Notifications\TestPushNotification;
use Illuminate\Console\Command;

class TestNotificationCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notification:test {user_id?} {--type=info} {--title=Test Notification} {--message=This is a test notification}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test notification to a user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $userId = $this->argument('user_id');

        if (! $userId) {
            // Get the first user if no user ID provided
            $user = User::first();
            if (! $user) {
                $this->error('No users found in the database.');

                return 1;
            }
        } else {
            $user = User::find($userId);
            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }
        }

        $type = $this->option('type');
        $title = $this->option('title');
        $message = $this->option('message');

        // Validate type
        if (! in_array($type, ['info', 'success', 'warning', 'error'])) {
            $this->error('Invalid notification type. Must be one of: info, success, warning, error');

            return 1;
        }

        // Create and send notification
        $notification = new GeneralNotification(
            title: $title,
            message: $message,
            type: $type,
            actionUrl: route('home'),
            actionLabel: 'View Dashboard'
        );

        $mobileAppnotification = new TestPushNotification(
            title: $title,
            body: $message
        );

        try {
            $user->notify($notification);
            $user->notify($mobileAppnotification);

            $this->info('✅ Test notification sent successfully!');
            $this->line("User: {$user->name} ({$user->email})");
            $this->line("Type: {$type}");
            $this->line("Title: {$title}");
            $this->line("Message: {$message}");

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to send notification: {$e->getMessage()}");

            return 1;
        }
    }
}
