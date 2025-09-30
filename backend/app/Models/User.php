<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\Expo\ExpoPushToken;
use NotificationChannels\WebPush\HasPushSubscriptions;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, HasPushSubscriptions , Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'facebook_id',
        'google_id',
        'avatar',
        'phone',
        'locale',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin;
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the orders associated with the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the cart associated with the user.
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * Get the wishlist items associated with the user.
     */
    public function wishlistItems()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Route notifications for the Expo channel.
     * Returns all push tokens from the user's personal access tokens.
     *
     * @return Collection<int, ExpoPushToken>
     */
    public function routeNotificationForExpo()
    {
        return $this->tokens()
            ->whereNotNull('expo_push_token')
            ->pluck('expo_push_token')
            ->filter()
            ->map(fn (string $token) => ExpoPushToken::make($token))->collect();
    }

    /**
     * Get the user's full name (alias for name).
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Get the user's email verification status.
     */
    public function getEmailVerifiedAttribute(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    /**
     * Get the user's email verification status (alias).
     */
    public function getIsEmailVerifiedAttribute(): bool
    {
        return $this->email_verified;
    }
}
