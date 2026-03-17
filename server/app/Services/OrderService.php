<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderService
{
    /**
     * Membuat pesanan baru beserta itemnya
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Generate Order Number
            $orderNumber = $this->generateOrderNumber();

            // 2. Create Order
            $order = Order::create([
                'order_number' => $orderNumber,
                'table_id' => $data['table_id'],
                'opened_by' => $data['user_id'],
                'status' => 'open',
                'total_price' => $data['total_price'],
                'opened_at' => Carbon::now(),
            ]);

            // 3. Create Order Items
            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'food_id' => $item['food_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'note' => $item['note'] ?? null,
                    'status' => $data['item_status'], // 'confirmed' or 'draft'
                ]);
            }

            // 4. Update Table Status to 'occupied'
            $table = RestaurantTable::find($data['table_id']);
            if ($table) {
                $table->status = 'occupied';
                $table->save();
            }

            return $order->load('items.food');
        });
    }

    /**
     * Generate running order number: ORD-YYYYMMDD-XXXX
     */
    private function generateOrderNumber()
    {
        $date = Carbon::now()->format('Ymd');
        $prefix = "ORD-{$date}-";

        // Cari nomor terakhir hari ini
        $lastOrder = Order::where('order_number', 'like', "{$prefix}%")
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastSequence = (int) substr($lastOrder->order_number, -4);
            $newSequence = str_pad($lastSequence + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newSequence = '0001';
        }

        return $prefix . $newSequence;
    }
}
