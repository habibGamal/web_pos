<?php

namespace App\Enums;

enum AttributeType: string
{
    case SELECT = 'select';
    case TEXT = 'text';
    case NUMBER = 'number';
    case BOOLEAN = 'boolean';
    case COLOR = 'color';

    public function label(): string
    {
        return match ($this) {
            self::SELECT => 'Select',
            self::TEXT => 'Text',
            self::NUMBER => 'Number',
            self::BOOLEAN => 'Boolean',
            self::COLOR => 'Color',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn ($case) => [
            $case->value => $case->label(),
        ])->toArray();
    }
}
