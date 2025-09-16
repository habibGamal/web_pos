<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum SectionType: string implements HasColor, HasIcon, HasLabel
{
    case REAL = 'REAL';
    case RECOMMENDATION = 'RECOMMENDATION';
    case TRENDING = 'TRENDING';
    case NEW_ARRIVALS = 'NEW_ARRIVALS';

    public function getColor(): ?string
    {
        return match ($this) {
            self::REAL => 'success',
            self::RECOMMENDATION => 'info',
            self::TRENDING => 'warning',
            self::NEW_ARRIVALS => 'primary',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::REAL => 'heroicon-o-cube',
            self::RECOMMENDATION => 'heroicon-o-light-bulb',
            self::TRENDING => 'heroicon-o-fire',
            self::NEW_ARRIVALS => 'heroicon-o-sparkles',
        };
    }

    public function getLabel(): ?string
    {
        return match ($this) {
            self::REAL => app()->getLocale() == 'ar' ? 'فعلي' : 'Real',
            self::RECOMMENDATION => app()->getLocale() == 'ar' ? 'توصيات' : 'Recommendation',
            self::TRENDING => app()->getLocale() == 'ar' ? 'رائج' : 'Trending',
            self::NEW_ARRIVALS => app()->getLocale() == 'ar' ? 'وافدات جديدة' : 'New Arrivals',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::REAL->value => self::REAL->getLabel(),
            self::RECOMMENDATION->value => self::RECOMMENDATION->getLabel(),
            self::TRENDING->value => self::TRENDING->getLabel(),
            self::NEW_ARRIVALS->value => self::NEW_ARRIVALS->getLabel(),
        ];
    }
}
