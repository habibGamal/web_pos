<?php

namespace App\DTOs;

use JsonSerializable;

/**
 * Encapsulates result of cart validation.
 */
final class CartValidationResult implements JsonSerializable
{
    /**
     * @param  array<int, int>  $validItems  Array of cart item ids that are valid
     * @param  array<int, int>  $invalidItems  Array of cart item ids that are invalid
     * @param  array<int, array<string, mixed>>  $errors  Detailed errors keyed by index
     */
    public function __construct(
        public readonly bool $isValid,
        public readonly array $validItems = [],
        public readonly array $invalidItems = [],
        public readonly array $errors = [],
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            (bool) ($data['is_valid'] ?? false),
            (array) ($data['valid_items'] ?? []),
            (array) ($data['invalid_items'] ?? []),
            (array) ($data['errors'] ?? []),
        );
    }

    public function toArray(): array
    {
        return [
            'is_valid' => $this->isValid,
            'valid_items' => $this->validItems,
            'invalid_items' => $this->invalidItems,
            'errors' => $this->errors,
        ];
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
