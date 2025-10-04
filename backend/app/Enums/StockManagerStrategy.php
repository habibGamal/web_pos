<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum StockManagerStrategy: string implements HasLabel
{
    case WEB_STOCK_MANAGER = 'web';
    case POS_STOCK_MANAGER = 'pos';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::WEB_STOCK_MANAGER => 'ويب',
            self::POS_STOCK_MANAGER => 'نقطة بيع',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::WEB_STOCK_MANAGER->value => self::WEB_STOCK_MANAGER->getLabel(),
            self::POS_STOCK_MANAGER->value => self::POS_STOCK_MANAGER->getLabel(),
        ];
    }
}
