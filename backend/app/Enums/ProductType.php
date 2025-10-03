<?php

namespace App\Enums;

enum ProductType: string
{
    case SIMPLE = 'simple';
    case CONFIGURABLE = 'configurable';
    case VARIANT = 'variant';
    case BUNDLE = 'bundle';

    public function label(): string
    {
        return match ($this) {
            self::SIMPLE => 'منتج بسيط',
            self::CONFIGURABLE => 'منتج قابل للتكوين',
            self::VARIANT => 'متغير',
            self::BUNDLE => 'حزمة',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn ($case) => [$case->value => $case->label()])
            ->toArray();
    }

    public function isParent(): bool
    {
        return in_array($this, [self::CONFIGURABLE, self::BUNDLE]);
    }

    public function isSimple(): bool
    {
        return $this === self::SIMPLE;
    }

    public function isVariant(): bool
    {
        return $this === self::VARIANT;
    }
}
