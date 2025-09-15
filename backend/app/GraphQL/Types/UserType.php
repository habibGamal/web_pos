<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use Illuminate\Support\Facades\Gate;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class UserType
{
    /**
     * Resolve the avatar field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string|null
     */
    public function avatar(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?string
    {
        // Return the avatar URL if it exists, otherwise return a default avatar
        if ($user->avatar) {
            // If it's a full URL (social login avatar), return as-is
            if (filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                return $user->avatar;
            }

            // If it's a local file path, prepend the storage URL
            return asset('storage/' . $user->avatar);
        }

        // Return default avatar based on user's initials or a placeholder
        return $this->getDefaultAvatar($user);
    }

    /**
     * Resolve the full_name field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string
     */
    public function fullName(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): string
    {
        return $user->name;
    }

    /**
     * Resolve the initials field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string
     */
    public function initials(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): string
    {
        $names = explode(' ', trim($user->name));

        if (count($names) === 1) {
            return substr($names[0], 0, 2);
        }

        return substr($names[0], 0, 1) . substr(end($names), 0, 1);
    }

    /**
     * Resolve the is_admin field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return bool
     */
    public function isAdmin(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        // Only allow the user themselves or other admins to see admin status
        $currentUser = $context->user();

        if (!$currentUser) {
            return false;
        }

        if ($currentUser->id === $user->id || $currentUser->is_admin) {
            return (bool) $user->is_admin;
        }

        return false;
    }

    /**
     * Resolve the can_access_admin field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return bool
     */
    public function canAccessAdmin(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        // Only allow the user themselves or other admins to see admin access status
        $currentUser = $context->user();

        if (!$currentUser) {
            return false;
        }

        if ($currentUser->id === $user->id || $currentUser->is_admin) {
            return $user->is_admin;
        }

        return false;
    }

    /**
     * Resolve the has_social_accounts field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return bool
     */
    public function hasSocialAccounts(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        // Only allow the user themselves to see their social account status
        $currentUser = $context->user();

        if (!$currentUser || $currentUser->id !== $user->id) {
            return false;
        }

        return !empty($user->google_id) || !empty($user->facebook_id);
    }

    /**
     * Resolve the linked_providers field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return array<array<string, string>>
     */
    public function linkedProviders(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        // Only allow the user themselves to see their linked providers
        $currentUser = $context->user();

        if (!$currentUser || $currentUser->id !== $user->id) {
            return [];
        }

        $providers = [];

        if ($user->google_id) {
            $providers[] = [
                'provider' => 'google',
                'provider_id' => $user->google_id,
            ];
        }

        if ($user->facebook_id) {
            $providers[] = [
                'provider' => 'facebook',
                'provider_id' => $user->facebook_id,
            ];
        }

        return $providers;
    }

    /**
     * Resolve the email field for the User type with privacy checks.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string|null
     */
    public function email(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?string
    {
        $currentUser = $context->user();

        // Allow the user themselves or admins to see the email
        if ($currentUser && ($currentUser->id === $user->id || $currentUser->is_admin)) {
            return $user->email;
        }

        // For registration and other auth operations, show email if accessing own record
        // This is a simple heuristic: if the query context has a fresh user (recent creation)
        // allow them to see their own email even if not authenticated yet
        $fieldPath = $resolveInfo->path;
        if (isset($fieldPath[0]) && in_array($fieldPath[0], ['register', 'login', 'socialLogin'])) {
            return $user->email;
        }

        // For public access, hide the email
        return null;
    }

    /**
     * Resolve the email_verified field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return bool
     */
    public function emailVerified(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        $currentUser = $context->user();

        // Allow the user themselves to see their email verification status
        if ($currentUser && $currentUser->id === $user->id) {
            return !is_null($user->email_verified_at);
        }

        // For authentication operations, show verification status
        $fieldPath = $resolveInfo->path;
        if (isset($fieldPath[0]) && in_array($fieldPath[0], ['register', 'login', 'socialLogin'])) {
            return !is_null($user->email_verified_at);
        }

        // For public access, hide verification status
        return false;
    }

    /**
     * Resolve the google_id field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string|null
     */
    public function googleId(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?string
    {
        $currentUser = $context->user();

        // Only allow the user themselves to see their Google ID
        if ($currentUser && $currentUser->id === $user->id) {
            return $user->google_id;
        }

        return null;
    }

    /**
     * Resolve the facebook_id field for the User type.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $args
     * @param  GraphQLContext  $context
     * @param  ResolveInfo  $resolveInfo
     * @return string|null
     */
    public function facebookId(User $user, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?string
    {
        $currentUser = $context->user();

        // Only allow the user themselves to see their Facebook ID
        if ($currentUser && $currentUser->id === $user->id) {
            return $user->facebook_id;
        }

        return null;
    }

    /**
     * Generate a default avatar URL for the user.
     *
     * @param  User  $user
     * @return string
     */
    private function getDefaultAvatar(User $user): string
    {
        // Use a service like DiceBear or UI Avatars to generate default avatars
        $initials = $this->initials($user, [], app(GraphQLContext::class), app(ResolveInfo::class));

        // Use UI Avatars service with user's initials
        return "https://ui-avatars.com/api/?name=" . urlencode($initials) . "&background=random&size=200";
    }
}
