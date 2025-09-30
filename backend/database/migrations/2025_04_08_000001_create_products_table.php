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
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Basic product information
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('slug')->unique();
            $table->text('description_en')->nullable();
            $table->text('description_ar')->nullable();

            // Product type
            $table->string('type')->default('simple'); // simple, configurable, variant, bundle

            // Parent relationship for variants
            $table->foreignId('parent_id')->nullable()->constrained('products')->cascadeOnDelete();

            // SKU for variants and simple products
            $table->string('sku')->nullable()->unique();

            // Pricing
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();

            // Inventory (for simple, variant, and bundle)
            $table->integer('quantity')->default(0);

            // Images (JSON array for multiple images)
            $table->json('images')->nullable();

            // Relationships
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();

            // Status flags
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_default')->default(false); // For variants only

            $table->timestamps();

            // Indexes
            $table->index(['type', 'is_active']);
            $table->index(['parent_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
