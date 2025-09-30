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
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name_en')->comment('Attribute name in English (e.g., Size, Color, Material)');
            $table->string('name_ar')->comment('Attribute name in Arabic');
            $table->string('type')->default('select')->comment('Input type for this attribute (handled by PHP enum)');
            $table->text('description_en')->nullable()->comment('Optional description in English');
            $table->text('description_ar')->nullable()->comment('Optional description in Arabic');
            $table->integer('sort_order')->default(0)->comment('Display order for attributes');
            $table->timestamps();

            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
