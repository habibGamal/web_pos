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
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value')->comment('The actual value (e.g., S, M, L for Size attribute)');
            $table->string('value_en')->nullable()->comment('English display name for the value');
            $table->string('value_ar')->nullable()->comment('Arabic display name for the value');
            $table->string('color_code')->nullable()->comment('Hex color code for color-type attributes');
            $table->integer('sort_order')->default(0)->comment('Display order for values within attribute');
            $table->timestamps();

            $table->index(['attribute_id', 'sort_order']);
            $table->unique(['attribute_id', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
