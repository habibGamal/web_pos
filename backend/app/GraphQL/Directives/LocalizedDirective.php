<?php

declare(strict_types=1);

namespace App\GraphQL\Directives;

use Illuminate\Support\Facades\App;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Schema\Directives\BaseDirective;
use Nuwave\Lighthouse\Schema\Values\FieldValue;
use Nuwave\Lighthouse\Support\Contracts\FieldResolver;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

final class LocalizedDirective extends BaseDirective implements FieldResolver
{
    public static function definition(): string
    {
        return /* @lang GraphQL */ <<<'GRAPHQL'
        """
        Resolve a localized field based on the current locale.
        Automatically selects between field_en and field_ar based on app.locale.
        Falls back to the fallback locale if the current locale field is empty.

        Examples:
        - name @localized -> resolves to name_en or name_ar
        - description @localized -> resolves to description_en or description_ar
        """
        directive @localized(
            """
            The base field name (without _en/_ar suffix).
            If not provided, uses the GraphQL field name.
            """
            field: String

            """
            Whether to fall back to the other locale if the current locale field is empty.
            Default: true
            """
            fallback: Boolean = true
        ) on FIELD_DEFINITION
        GRAPHQL;
    }

    public function resolveField(FieldValue $fieldValue): callable
    {
        return function (mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?string {
            // Get the base field name - either from directive argument or GraphQL field name
            $baseFieldName = $this->directiveArgValue('field') ?? $resolveInfo->fieldName;
            $fallback = $this->directiveArgValue('fallback', true);

            // Get current locale and fallback locale
            $currentLocale = App::getLocale();
            $fallbackLocale = config('app.fallback_locale', 'en');

            // Construct field names for current and fallback locales
            $currentField = $baseFieldName . '_' . $currentLocale;
            $fallbackField = $baseFieldName . '_' . $fallbackLocale;

            // Try to get the value for the current locale
            $currentValue = data_get($root, $currentField);

            // If current locale value exists and is not empty, return it
            if (! empty($currentValue)) {
                return $currentValue;
            }

            // If fallback is enabled and current locale field is empty, try fallback locale
            if ($fallback && $currentLocale !== $fallbackLocale) {
                $fallbackValue = data_get($root, $fallbackField);
                if (! empty($fallbackValue)) {
                    return $fallbackValue;
                }
            }

            // Return null if no value found (or empty current value when fallback is disabled)
            return $currentValue; // This could be null or empty string
        };
    }
}
