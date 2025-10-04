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
        Schema::table('products', function (Blueprint $table) {
            $table->string('unit')->default('packet')->after('quantity');
            $table->boolean('is_stockable')->default(true)->after('unit');
            $table->string('stock_manager')->default('simple')->after('is_stockable');
            $table->unsignedTinyInteger('pos_stock_display_percentage')->nullable()->after('stock_manager');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['unit', 'is_stockable', 'stock_manager', 'pos_stock_display_percentage']);
        });
    }
};
