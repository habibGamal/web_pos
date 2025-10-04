<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW product_stock_overview AS
            SELECT
                p.id AS product_id,
                p.quantity,
                p.unit,
                COALESCE((
                    SELECT SUM(oi.quantity)
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE oi.product_id = p.id AND o.order_status = 'processing'
                ), 0) AS reserved,
                (p.quantity - COALESCE((
                    SELECT SUM(oi.quantity)
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE oi.product_id = p.id AND o.order_status = 'processing'
                ), 0)) AS available
            FROM products p
            WHERE p.is_stockable = 1
        SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS product_stock_overview');
    }
};
