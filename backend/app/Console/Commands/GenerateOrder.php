<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class GenerateOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $order = Order::factory()->create();
        $this->info('Order generated successfully.');
        $this->info('Order ID : ' . $order->id);
    }
}
