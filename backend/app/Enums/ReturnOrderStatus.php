<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum ReturnOrderStatus: string implements HasColor, HasIcon, HasLabel
{
    case REQUESTED = 'requested';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case RECEIVED = 'received';
    case REFUNDED = 'refunded';
    case CANCELLED = 'cancelled';
    case COMPLETED = 'completed';

    public function getColor(): ?string
    {
        return match ($this) {
            self::REQUESTED => 'warning',
            self::APPROVED => 'info',
            self::REJECTED => 'danger',
            self::RECEIVED => 'info',
            self::REFUNDED => 'success',
            self::CANCELLED => 'gray',
            self::COMPLETED => 'success',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::REQUESTED => 'heroicon-o-clock',
            self::APPROVED => 'heroicon-o-check',
            self::REJECTED => 'heroicon-o-x-mark',
            self::RECEIVED => 'heroicon-o-inbox-arrow-down',
            self::REFUNDED => 'heroicon-o-banknotes',
            self::CANCELLED => 'heroicon-o-x-circle',
            self::COMPLETED => 'heroicon-o-check-circle',
        };
    }

    public function getLabel(): ?string
    {
        return match ($this) {
            self::REQUESTED => 'مطلوب',
            self::APPROVED => 'معتمد',
            self::REJECTED => 'مرفوض',
            self::RECEIVED => 'مستلم',
            self::REFUNDED => 'مسترد',
            self::CANCELLED => 'ملغي',
            self::COMPLETED => 'مكتمل',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::REQUESTED->value => self::REQUESTED->getLabel(),
            self::APPROVED->value => self::APPROVED->getLabel(),
            self::REJECTED->value => self::REJECTED->getLabel(),
            self::RECEIVED->value => self::RECEIVED->getLabel(),
            self::REFUNDED->value => self::REFUNDED->getLabel(),
            self::CANCELLED->value => self::CANCELLED->getLabel(),
            self::COMPLETED->value => self::COMPLETED->getLabel(),
        ];
    }
}
