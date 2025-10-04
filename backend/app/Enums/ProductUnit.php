<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum ProductUnit: string implements HasLabel
{
    case PACKET = 'packet';
    case KILOGRAM = 'kg';
    case GRAM = 'gram';
    case LITER = 'liter';
    case PIECE = 'piece';

    public function getLabel(): ?string
    {
        return match ($this) {
            self::PACKET => 'باكيت',
            self::KILOGRAM => 'كيلوجرام',
            self::GRAM => 'جرام',
            self::LITER => 'لتر',
            self::PIECE => 'قطعة',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::PACKET->value => self::PACKET->getLabel(),
            self::KILOGRAM->value => self::KILOGRAM->getLabel(),
            self::GRAM->value => self::GRAM->getLabel(),
            self::LITER->value => self::LITER->getLabel(),
            self::PIECE->value => self::PIECE->getLabel(),
        ];
    }
}
