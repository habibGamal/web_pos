<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum OrderStatus: string implements HasColor, HasIcon, HasLabel
{
    case PENDING = 'pending';
    case REJECTED = 'rejected';
    case PROCESSING = 'processing';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function getColor(): ?string
    {
        return match ($this) {
            self::PENDING => 'secondary',
            self::REJECTED => 'danger',
            self::PROCESSING => 'warning',
            self::OUT_FOR_DELIVERY => 'info',
            self::COMPLETED => 'success',
            self::CANCELLED => 'danger',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::PENDING => 'heroicon-o-clock',
            self::REJECTED => 'heroicon-o-x-circle',
            self::PROCESSING => 'heroicon-o-cog',
            self::OUT_FOR_DELIVERY => 'heroicon-o-truck',
            self::COMPLETED => 'heroicon-o-check-circle',
            self::CANCELLED => 'heroicon-o-ban',
        };
    }

    public function getLabel(): ?string
    {
        return match ($this) {
            self::PENDING => 'قيد الانتظار',
            self::REJECTED => 'مرفوضة',
            self::PROCESSING => 'قيد التحضير',
            self::OUT_FOR_DELIVERY => 'في طريق التسليم',
            self::COMPLETED => 'تم التوصيل',
            self::CANCELLED => 'ملغاة',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::PENDING->value => self::PENDING->getLabel(),
            self::REJECTED->value => self::REJECTED->getLabel(),
            self::PROCESSING->value => self::PROCESSING->getLabel(),
            self::OUT_FOR_DELIVERY->value => self::OUT_FOR_DELIVERY->getLabel(),
            self::COMPLETED->value => self::COMPLETED->getLabel(),
            self::CANCELLED->value => self::CANCELLED->getLabel(),
        ];
    }
}
