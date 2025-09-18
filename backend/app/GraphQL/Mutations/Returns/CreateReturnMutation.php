<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations\Returns;

use App\Models\ReturnOrder;
use App\Services\ReturnOrderService;
use Exception;
use GraphQL\Error\Error;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

class CreateReturnMutation
{
    protected ReturnOrderService $returnOrderService;

    public function __construct(ReturnOrderService $returnOrderService)
    {
        $this->returnOrderService = $returnOrderService;
    }

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
            // Validate input
            $validator = Validator::make($args, [
                'order_id' => 'required|exists:orders,id',
                'reason' => 'required|in:DEFECTIVE,WRONG_ITEM,DAMAGED,NOT_AS_DESCRIBED,CHANGED_MIND,SIZE_FIT,OTHER',
                'notes' => 'nullable|string|max:1000',
                'items' => 'required|array|min:1',
                'items.*.order_item_id' => 'required|exists:order_items,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                throw new Error($validator->errors()->first());
            }

            // Create return using the service
            $returnOrder = $this->returnOrderService->requestReturn(
                (int) $args['order_id'],
                $args['items'],
                $args['reason']
            );

            // For debugging - just return the order without relationships to see if it works
            return $returnOrder;

        } catch (Exception $e) {
            throw new Error($e->getMessage());
        }
    }
}
