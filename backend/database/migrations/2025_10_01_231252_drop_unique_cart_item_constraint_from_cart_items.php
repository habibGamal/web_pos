<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::table('cart_items', function (Blueprint $table) {
                // Drop foreign key first
                $table->dropForeign(['cart_id']);

                // Drop the unique constraint
                $table->dropIndex('unique_cart_item');

                // Re-add foreign key
                $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            });
        } catch (\Exception $e) {
            // Silently fail if the index doesn't exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['cart_id']);

            // Re-add the unique constraint
            $table->unique(['cart_id', 'product_id'], 'unique_cart_item');

            // Re-add foreign key
            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
        });
    }
};
