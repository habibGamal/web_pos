<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Returns;

use App\Models\ReturnOrder;
use Exception;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CancelReturnMutation
{
    /**
     * @param  mixed  $_
     * @param  array<string, mixed>  $args
     *
     * @throws Error
     */
    public function __invoke($_, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ReturnOrder
    {
        try {
            $user = Auth::user();
            if (! $user) {
                throw new Error('Unauthenticated.');
            }

            // Find the return order
            $returnOrder = ReturnOrder::where('id', $args['return_id'])
                ->whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            if (! $returnOrder) {
                throw new Error('Return not found or access denied.');
            }

            // Check if return can be cancelled
            if ($returnOrder->status !== \App\Enums\ReturnOrderStatus::REQUESTED) {
                throw new Error('This return cannot be cancelled.');
            }

            // Update return status to cancelled
            $returnOrder->update([
                'status' => \App\Enums\ReturnOrderStatus::CANCELLED,
            ]);

            return $returnOrder->fresh();

        } catch (Exception $e) {
            throw new Error($e->getMessage());
        }
    }
}
