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
        Schema::table('product_variants', function (Blueprint $table) {
            // Remove hardcoded attribute columns
            $table->dropColumn(['color', 'size', 'capacity', 'additional_attributes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table) {
            // Restore hardcoded attribute columns
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->string('capacity')->nullable();
            $table->json('additional_attributes')->nullable();
        });
    }
};
